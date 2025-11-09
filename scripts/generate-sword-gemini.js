#!/usr/bin/env node

/**
 * Generate sword.png using @google/genai with gemini-2.5-flash-image
 * Extremely strict prompt for exact 32x32 pixel art sword
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { processGameAsset } from "./backgroundRemoval.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSword(apiKey) {
  console.log('Initializing Gemini API with @google/genai...');

  const ai = new GoogleGenAI({
    apiKey: apiKey
  });

  // Extremely strict prompt for 32x32 pixel art sword with bright pink background
  // The pink background will be removed programmatically
  const BRIGHT_PINK = '#FF00FF'; // Magenta/Fuchsia - very unlikely to appear in sprites
  const prompt = `Create a pixel art game sprite of a medieval sword.
CRITICAL REQUIREMENTS - MUST BE EXACTLY 32x32 PIXELS:
- Output image MUST be exactly 32 pixels wide and 32 pixels tall - no exceptions
- Background MUST be pure bright pink/magenta color - hex code #FF00FF, RGB values exactly (255, 0, 255)
- The background color MUST be RGB(255, 0, 255) - red=255, green=0, blue=255 - no variations
- Every single background pixel must be exactly this color: #FF00FF or RGB(255,0,255)
- The entire background area must be solid bright pink with NO other colors
- Side view, pointing to the right
- Simple, clean design suitable for a 16-bit retro game
- Pixel art style with no anti-aliasing, sharp edges only
- Game sprite quality, recognizable at small size
- Medieval sword design with blade and hilt
- Use limited color palette (2-3 colors max) for the sword itself
- Sword colors: Use ONLY gray, silver, brown, black, or dark colors - ABSOLUTELY NO PINK, MAGENTA, OR RED TONES IN THE SWORD
- The sword must be gray/silver/brown/black - no pink colors anywhere in the sword sprite
- No gradients, only solid colors
- Must be usable as a game asset
- The final image dimensions must be 32x32 pixels exactly
- CRITICAL: Background must be pure bright pink RGB(255,0,255) - this exact color will be removed automatically`;

  console.log('Generating sword image with gemini-2.5-flash-image...');
  console.log('Prompt:', prompt.substring(0, 100) + '...');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
    });

    console.log('Response received, processing...');
    console.log('Response type:', typeof response);
    console.log('Response keys:', Object.keys(response || {}));

    // Check different response structures
    let parts = null;

    if (response.parts) {
      parts = response.parts;
    } else if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      parts = response.candidates[0].content.parts;
    } else if (Array.isArray(response)) {
      parts = response;
    } else {
      // Log full response to understand structure
      console.log('Full response:', JSON.stringify(response, null, 2));
      throw new Error('Unknown response structure');
    }

    // Process response parts
    for (const part of parts) {
      if (part.text) {
        console.log('Text response:', part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';

        // Convert base64 to buffer
        const buffer = Buffer.from(imageData, "base64");

        // Save to temp file first
        const tempPath = path.join(__dirname, '..', 'assets', 'images', 'sword-temp.png');
        const outputPath = path.join(__dirname, '..', 'assets', 'images', 'sword.png');
        fs.writeFileSync(tempPath, buffer);

        console.log(`✓ Generated image (${buffer.length} bytes)`);
        console.log(`  Processing: resizing to 32x32 and removing background...`);

        // Process image: resize and remove bright pink background
        const processedBuffer = await processGameAsset(buffer, 32, 32, {
          backgroundColor: '#FF00FF', // Bright pink/magenta (hardcoded)
          tolerance: 30 // Color matching tolerance (handles pinkish variations)
        });

        // Save processed image
        fs.writeFileSync(outputPath, processedBuffer);

        // Clean up temp file
        fs.unlinkSync(tempPath);

        const finalStats = fs.statSync(outputPath);
        console.log(`✓ Successfully generated and saved sword.png`);
        console.log(`  Final size: ${finalStats.size} bytes`);
        console.log(`  Dimensions: 32x32 pixels`);
        console.log(`  Format: ${mimeType}`);
        console.log(`  Location: ${outputPath}`);

        return fs.readFileSync(outputPath);
      }
    }

    // If we get here, no image was found
    console.log('Response structure:', JSON.stringify(response, null, 2));
    throw new Error('No image data found in response');

  } catch (error) {
    console.error('Error generating image:', error);

    if (error.message.includes('API key')) {
      console.error('\nMake sure you have a valid Gemini API key.');
      console.error('Get one at: https://aistudio.google.com/');
    } else if (error.message.includes('model')) {
      console.error('\nThe gemini-2.5-flash-image model may not be available.');
      console.error('Check Google AI Studio for available models.');
    }

    throw error;
  }
}

// Main execution
const apiKey = process.env.GEMINI_API_KEY ||
               process.argv.find(arg => arg.startsWith('--api-key='))?.split('=')[1] ||
               process.argv[process.argv.indexOf('--api-key') + 1];

if (!apiKey) {
  console.error('Error: Gemini API key required');
  console.log('\nUsage:');
  console.log('  GEMINI_API_KEY=your_key node scripts/generate-sword-gemini.js');
  console.log('  node scripts/generate-sword-gemini.js --api-key your_key');
  process.exit(1);
}

generateSword(apiKey)
  .then(() => {
    console.log('\n✓ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Failed:', error.message);
    process.exit(1);
  });

