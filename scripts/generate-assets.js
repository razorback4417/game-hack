#!/usr/bin/env node

/**
 * Asset Generation Script
 * Generates game assets using Gemini 2.0 Flash Preview Image Generation
 *
 * Usage:
 *   node scripts/generate-assets.js --api-key YOUR_API_KEY --asset sword
 *   node scripts/generate-assets.js --api-key YOUR_API_KEY --all --prompt "A pixel art game where a knight fights slimes"
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asset specifications from manifest
const ASSET_SPECS = {
  sword: {
    name: 'sword',
    width: 32,
    height: 32,
    prompt: 'A medieval sword, side view, pointing right, simple design, game sprite',
    style: 'pixel art, 16-bit style, game sprite, transparent background',
    output: 'assets/images/sword.png'
  }
  // Add more assets here as needed
};

async function generateImage(apiKey, assetSpec) {
  const genAI = new GoogleGenerativeAI(apiKey);

  // Try gemini-2.0-flash-exp first, fallback to gemini-2.5-flash-image
  let model;
  try {
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  } catch (e) {
    console.log('Falling back to gemini-2.5-flash-image');
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });
  }

  const fullPrompt = `${assetSpec.prompt}, ${assetSpec.style}, ${assetSpec.width}x${assetSpec.height} pixels`;

  console.log(`Generating ${assetSpec.name}...`);
  console.log(`Prompt: ${fullPrompt}`);

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseModality: 'IMAGE',
        imageGenerationConfig: {
          width: assetSpec.width,
          height: assetSpec.height,
        }
      }
    });

    const response = await result.response;

    if (!response.candidates || !response.candidates[0]?.content?.parts?.[0]?.inlineData) {
      throw new Error('No image data in response');
    }

    const imageData = response.candidates[0].content.parts[0].inlineData.data;
    const mimeType = response.candidates[0].content.parts[0].inlineData.mimeType || 'image/png';

    // Convert base64 to buffer
    const buffer = Buffer.from(imageData, 'base64');

    // Save to file
    const outputPath = path.join(__dirname, '..', assetSpec.output);
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Saved to ${assetSpec.output}`);

    return buffer;
  } catch (error) {
    console.error(`Error generating ${assetSpec.name}:`, error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const apiKeyIndex = args.findIndex(arg => arg === '--api-key' || arg === '-k');
  const assetIndex = args.findIndex(arg => arg === '--asset' || arg === '-a');
  const allIndex = args.findIndex(arg => arg === '--all');
  const promptIndex = args.findIndex(arg => arg === '--prompt' || arg === '-p');

  if (apiKeyIndex === -1 || args[apiKeyIndex + 1] === undefined) {
    console.error('Error: API key required');
    console.log('Usage: node scripts/generate-assets.js --api-key YOUR_API_KEY --asset sword');
    console.log('   or: node scripts/generate-assets.js --api-key YOUR_API_KEY --all --prompt "game description"');
    process.exit(1);
  }

  const apiKey = args[apiKeyIndex + 1];

  if (allIndex !== -1) {
    // Generate all assets
    const prompt = promptIndex !== -1 ? args[promptIndex + 1] : '';
    console.log('Generating all assets...');
    if (prompt) {
      console.log(`Game prompt: ${prompt}`);
    }

    // For now, just generate sword as example
    await generateImage(apiKey, ASSET_SPECS.sword);
  } else if (assetIndex !== -1 && args[assetIndex + 1]) {
    // Generate specific asset
    const assetName = args[assetIndex + 1];
    const assetSpec = ASSET_SPECS[assetName];

    if (!assetSpec) {
      console.error(`Error: Unknown asset "${assetName}"`);
      console.log('Available assets:', Object.keys(ASSET_SPECS).join(', '));
      process.exit(1);
    }

    await generateImage(apiKey, assetSpec);
  } else {
    console.error('Error: Specify --asset NAME or --all');
    process.exit(1);
  }
}

main().catch(console.error);

