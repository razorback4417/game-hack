#!/usr/bin/env node

/**
 * Universal Asset Generator
 * Generate any game asset using @google/genai with gemini-2.5-flash-image
 * Supports theme-based generation and custom edits
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import { processGameAsset } from "./backgroundRemoval.js";
import { ASSET_CONFIG, buildAssetPrompt } from "../src/config/assetConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a single asset
 * @param {string} apiKey - Gemini API key
 * @param {string} assetKey - Asset key (e.g., 'sword', 'potions')
 * @param {Object} options - Generation options
 * @param {string} options.theme - Optional theme (e.g., 'cyberpunk', 'medieval')
 * @param {string} options.customEdit - Optional custom edit prompt
 * @returns {Promise<Buffer>} Generated image buffer
 */
async function generateAsset(apiKey, assetKey, options = {}) {
  const { theme = null, customEdit = null } = options;

  const config = ASSET_CONFIG[assetKey];
  if (!config) {
    throw new Error(`Unknown asset: ${assetKey}. Available: ${Object.keys(ASSET_CONFIG).join(', ')}`);
  }

  console.log(`\nGenerating ${assetKey} (${config.file})...`);
  console.log(`  Dimensions: ${config.dimensions.width}x${config.dimensions.height}`);
  console.log(`  Type: ${config.type}`);
  if (theme) {
    console.log(`  Theme: ${theme}`);
  }
  if (customEdit) {
    console.log(`  Custom edit: ${customEdit.substring(0, 50)}...`);
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey
  });

  // Build the prompt
  const prompt = buildAssetPrompt(assetKey, theme, customEdit);

  console.log('  Generating image with gemini-2.5-flash-image...');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
    });

    console.log('  Response received, processing...');

    // Check different response structures
    let parts = null;

    if (response.parts) {
      parts = response.parts;
    } else if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      parts = response.candidates[0].content.parts;
    } else if (Array.isArray(response)) {
      parts = response;
    } else {
      console.log('  Full response:', JSON.stringify(response, null, 2));
      throw new Error('Unknown response structure');
    }

    // Process response parts
    for (const part of parts) {
      if (part.text) {
        console.log('  Text response:', part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';

        // Convert base64 to buffer
        const buffer = Buffer.from(imageData, "base64");

        // Save to temp file first
        const tempPath = path.join(__dirname, '..', 'assets', 'images', `${assetKey}-temp.png`);
        const outputPath = path.join(__dirname, '..', 'assets', 'images', config.file);
        fs.writeFileSync(tempPath, buffer);

        console.log(`  ✓ Generated image (${buffer.length} bytes)`);
        console.log(`  Processing: resizing to ${config.dimensions.width}x${config.dimensions.height} and removing background...`);

        // Process image: resize and remove bright pink background
        const processedBuffer = await processGameAsset(
          buffer,
          config.dimensions.width,
          config.dimensions.height,
          {
            backgroundColor: '#FF00FF', // Bright pink/magenta
            tolerance: 30 // Color matching tolerance
          }
        );

        // Save processed image
        fs.writeFileSync(outputPath, processedBuffer);

        // Clean up temp file
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }

        const finalStats = fs.statSync(outputPath);
        console.log(`  ✓ Successfully generated and saved ${config.file}`);
        console.log(`    Final size: ${finalStats.size} bytes`);
        console.log(`    Dimensions: ${config.dimensions.width}x${config.dimensions.height} pixels`);

        return processedBuffer;
      }
    }

    // If we get here, no image was found
    console.log('  Response structure:', JSON.stringify(response, null, 2));
    throw new Error('No image data found in response');

  } catch (error) {
    console.error(`  ✗ Error generating ${assetKey}:`, error.message);

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

/**
 * Generate multiple assets
 * @param {string} apiKey - Gemini API key
 * @param {Array<string>} assetKeys - Array of asset keys to generate
 * @param {Object} options - Generation options
 * @param {string} options.theme - Optional theme
 * @param {Function} options.onProgress - Progress callback (assetKey, progress)
 */
async function generateAssets(apiKey, assetKeys, options = {}) {
  const { theme = null, onProgress = null } = options;
  const total = assetKeys.length;
  const results = {};

  for (let i = 0; i < assetKeys.length; i++) {
    const assetKey = assetKeys[i];

    if (onProgress) {
      onProgress(assetKey, (i / total) * 100);
    }

    try {
      const buffer = await generateAsset(apiKey, assetKey, { theme });
      results[assetKey] = buffer;
    } catch (error) {
      console.error(`Failed to generate ${assetKey}:`, error.message);
      // Continue with other assets
    }
  }

  if (onProgress) {
    onProgress(null, 100);
  }

  return results;
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const apiKey = process.env.GEMINI_API_KEY ||
                 process.argv.find(arg => arg.startsWith('--api-key='))?.split('=')[1] ||
                 process.argv[process.argv.indexOf('--api-key') + 1];

  if (!apiKey) {
    console.error('Error: Gemini API key required');
    console.log('\nUsage:');
    console.log('  GEMINI_API_KEY=your_key node scripts/generate-asset-gemini.js <asset-key> [--theme <theme>] [--edit "<edit prompt>"]');
    console.log('  node scripts/generate-asset-gemini.js <asset-key> --api-key your_key [--theme <theme>] [--edit "<edit prompt>"]');
    console.log('\nAvailable assets:');
    Object.keys(ASSET_CONFIG).forEach(key => {
      const config = ASSET_CONFIG[key];
      console.log(`  - ${key}: ${config.file} (${config.dimensions.width}x${config.dimensions.height})`);
    });
    process.exit(1);
  }

  const assetKey = process.argv[2];
  if (!assetKey) {
    console.error('Error: Asset key required');
    console.log('\nAvailable assets:');
    Object.keys(ASSET_CONFIG).forEach(key => {
      const config = ASSET_CONFIG[key];
      console.log(`  - ${key}: ${config.file} (${config.dimensions.width}x${config.dimensions.height})`);
    });
    process.exit(1);
  }

  const themeIndex = process.argv.indexOf('--theme');
  const theme = themeIndex !== -1 ? process.argv[themeIndex + 1] : null;

  const editIndex = process.argv.indexOf('--edit');
  const customEdit = editIndex !== -1 ? process.argv[editIndex + 1] : null;

  generateAsset(apiKey, assetKey, { theme, customEdit })
    .then(() => {
      console.log('\n✓ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Failed:', error.message);
      process.exit(1);
    });
}

export { generateAsset, generateAssets };

