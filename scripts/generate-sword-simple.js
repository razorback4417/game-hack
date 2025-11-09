#!/usr/bin/env node

/**
 * Simple script to generate sword.png using Gemini API
 * This is a direct implementation to test the API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSword(apiKey) {
  console.log('Initializing Gemini API...');

  const genAI = new GoogleGenerativeAI(apiKey);

  // Try different model names
  const modelNames = [
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash-preview-image-generation',
    'gemini-2.5-flash-image',
    'gemini-1.5-flash'
  ];

  let model;
  let modelName;

  for (const name of modelNames) {
    try {
      model = genAI.getGenerativeModel({ model: name });
      modelName = name;
      console.log(`Using model: ${name}`);
      break;
    } catch (e) {
      console.log(`Model ${name} not available, trying next...`);
    }
  }

  if (!model) {
    throw new Error('No available Gemini model found');
  }

  const prompt = `Create a pixel art game sprite of a medieval sword.
Requirements:
- 32x32 pixels exactly
- Side view, pointing to the right
- Simple, clean design suitable for a 16-bit game
- Transparent background
- Pixel art style, no anti-aliasing
- Game asset quality`;

  console.log('Generating sword image...');
  console.log(`Prompt: ${prompt.substring(0, 100)}...`);

  try {
    // Try different API formats for image generation
    // Format 1: Direct text prompt (standard)
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (e1) {
      // Format 2: With generation config (if supported)
      try {
        result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.0,
          }
        });
      } catch (e2) {
        // Format 3: Try REST API directly
        throw new Error('Image generation may require REST API. Error: ' + e2.message);
      }
    }

    const response = await result.response;

    // Check for image in response
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];

      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';

            // Convert base64 to buffer
            const buffer = Buffer.from(imageData, 'base64');

            // Save to file
            const outputPath = path.join(__dirname, '..', 'assets', 'images', 'sword.png');
            fs.writeFileSync(outputPath, buffer);

            console.log(`✓ Successfully generated and saved sword.png`);
            console.log(`  Size: ${buffer.length} bytes`);
            console.log(`  Format: ${mimeType}`);
            console.log(`  Location: ${outputPath}`);

            return buffer;
          }
        }
      }
    }

    // If no image found, try alternative response structure
    console.log('Response structure:', JSON.stringify(response, null, 2));
    throw new Error('No image data found in response');

  } catch (error) {
    console.error('Error generating image:', error);

    // Provide helpful error message
    if (error.message.includes('API key')) {
      console.error('\nMake sure you have a valid Gemini API key.');
      console.error('Get one at: https://aistudio.google.com/');
    } else if (error.message.includes('model')) {
      console.error('\nThe image generation model may not be available yet.');
      console.error('Try checking Google AI Studio for the latest model names.');
    }

    throw error;
  }
}

// Main execution
const apiKey = process.env.GEMINI_API_KEY || process.argv.find(arg => arg.startsWith('--api-key='))?.split('=')[1] || process.argv[process.argv.indexOf('--api-key') + 1];

if (!apiKey) {
  console.error('Error: Gemini API key required');
  console.log('\nUsage:');
  console.log('  GEMINI_API_KEY=your_key node scripts/generate-sword-simple.js');
  console.log('  node scripts/generate-sword-simple.js --api-key your_key');
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

