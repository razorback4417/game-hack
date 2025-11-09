#!/usr/bin/env node

/**
 * Generate sword.png using Gemini REST API directly
 * This uses the REST endpoint which may support image generation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSword(apiKey) {
  console.log('Generating sword image using Gemini REST API...');

  const prompt = `Create a pixel art game sprite of a medieval sword.
Requirements:
- 32x32 pixels exactly
- Side view, pointing to the right
- Simple, clean design suitable for a 16-bit game
- Transparent background
- Pixel art style, no anti-aliasing
- Game asset quality`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 1.0,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  };

  try {
    console.log('Sending request to Gemini API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Check for image in response
    if (data.candidates && data.candidates[0]) {
      const candidate = data.candidates[0];

      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          // Check for inline image data
          if (part.inlineData && part.inlineData.data) {
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

    // If we get here, no image was returned
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('\n⚠️  Note: The API returned text instead of an image.');
    console.log('Image generation may not be available through this endpoint yet.');
    console.log('You may need to:');
    console.log('1. Check if image generation is available in your region');
    console.log('2. Use a different model (e.g., gemini-2.5-flash-image)');
    console.log('3. Use Vertex AI instead of the standard API');

    throw new Error('No image data found in response - image generation may not be available');

  } catch (error) {
    console.error('Error generating image:', error.message);
    throw error;
  }
}

// Main execution
const apiKey = process.env.GEMINI_API_KEY || process.argv.find(arg => arg.startsWith('--api-key='))?.split('=')[1] || process.argv[process.argv.indexOf('--api-key') + 1];

if (!apiKey) {
  console.error('Error: Gemini API key required');
  console.log('\nUsage:');
  console.log('  GEMINI_API_KEY=your_key node scripts/generate-sword-rest.js');
  console.log('  node scripts/generate-sword-rest.js --api-key your_key');
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

