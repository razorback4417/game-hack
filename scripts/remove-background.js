#!/usr/bin/env node

/**
 * Remove background from image and make it transparent
 * Uses sharp to process the image
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function removeBackground(inputPath, outputPath = null) {
  if (!outputPath) {
    outputPath = inputPath;
  }

  const tempPath = outputPath + '.temp.png';

  try {
    console.log('Removing background and making it transparent...');

    // Read image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(`  Original: ${metadata.width}x${metadata.height}, ${metadata.channels} channels`);

    // Get image buffer
    const imageBuffer = await sharp(inputPath)
      .ensureAlpha() // Ensure alpha channel exists
      .toBuffer();

    // Process image to remove background
    // Strategy: Convert to RGBA, then make white/light pixels transparent
    await sharp(imageBuffer)
      .ensureAlpha()
      .composite([
        {
          input: Buffer.from([255, 255, 255, 0]), // Transparent white
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'dest-in'
        }
      ])
      .png()
      .toFile(tempPath);

    // Alternative approach: Use threshold to make background transparent
    // Convert to raw pixels and process
    const { data, info } = await sharp(inputPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = new Uint8ClampedArray(data);
    const width = info.width;
    const height = info.height;
    const channels = info.channels;

    // Process pixels: make white/light backgrounds transparent
    for (let i = 0; i < pixels.length; i += channels) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3] || 255;

      // Calculate brightness
      const brightness = (r + g + b) / 3;

      // If pixel is very light (likely background), make it transparent
      // Use a threshold - adjust as needed
      if (brightness > 240 && a > 200) {
        pixels[i + 3] = 0; // Make transparent
      }
      // Also handle pure white
      else if (r > 250 && g > 250 && b > 250) {
        pixels[i + 3] = 0;
      }
    }

    // Save processed image
    await sharp(pixels, {
      raw: {
        width: width,
        height: height,
        channels: channels
      }
    })
      .png()
      .toFile(tempPath);

    // Replace original
    fs.renameSync(tempPath, outputPath);

    const stats = fs.statSync(outputPath);
    console.log(`✓ Background removed, saved with transparency`);
    console.log(`  Size: ${stats.size} bytes`);

  } catch (error) {
    console.error('Error removing background:', error);
    // Clean up temp file if it exists
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw error;
  }
}

// Main execution
const inputPath = process.argv[2] || path.join(__dirname, '..', 'assets', 'images', 'sword.png');
const outputPath = process.argv[3] || inputPath;

removeBackground(inputPath, outputPath)
  .then(() => {
    console.log('✓ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Failed:', error.message);
    process.exit(1);
  });

