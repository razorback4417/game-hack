#!/usr/bin/env node

/**
 * Resize generated image to exact 32x32 pixels
 * Uses sharp for high-quality resizing
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resizeSword() {
  const inputPath = path.join(__dirname, '..', 'assets', 'images', 'sword.png');
  const tempPath = path.join(__dirname, '..', 'assets', 'images', 'sword-temp.png');

  try {
    console.log('Resizing sword.png to exactly 32x32 pixels...');

    // Resize to temp file first
    await sharp(inputPath)
      .resize(32, 32, {
        kernel: sharp.kernel.nearest, // Use nearest neighbor for pixel art
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .png()
      .toFile(tempPath);

    // Replace original with resized version
    fs.renameSync(tempPath, inputPath);

    const stats = fs.statSync(inputPath);
    console.log(`✓ Resized sword.png to 32x32 pixels`);
    console.log(`  Size: ${stats.size} bytes`);

  } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
  }
}

resizeSword()
  .then(() => {
    console.log('✓ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Failed:', error.message);
    process.exit(1);
  });

