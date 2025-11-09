#!/usr/bin/env node

/**
 * Debug script to see what colors are actually in an image
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugColors(imagePath) {
  const { data, info } = await sharp(imagePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data);
  const channels = info.channels;

  // Sample some pixels to see what colors we have
  const sampleSize = Math.min(100, pixels.length / channels);
  const colorCounts = {};

  console.log(`Image: ${imagePath}`);
  console.log(`Dimensions: ${info.width}x${info.height}`);
  console.log(`Channels: ${channels}`);
  console.log(`\nSampling ${sampleSize} pixels...\n`);

  for (let i = 0; i < sampleSize * channels; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3] || 255;

    const colorKey = `${r},${g},${b}`;
    colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
  }

  // Sort by frequency
  const sorted = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  console.log('Top colors found:');
  sorted.forEach(([color, count]) => {
    const [r, g, b] = color.split(',').map(Number);
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    console.log(`  RGB(${r}, ${g}, ${b}) = ${hex} - ${count} occurrences`);
  });

  // Check for bright pink specifically
  let pinkCount = 0;
  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    // Check if it's close to bright pink (255, 0, 255)
    if (r > 200 && g < 50 && b > 200) {
      pinkCount++;
    }
  }

  console.log(`\nPixels close to bright pink (R>200, G<50, B>200): ${pinkCount}`);
  console.log(`Total pixels: ${info.width * info.height}`);
}

const imagePath = process.argv[2] || path.join(__dirname, '..', 'assets', 'images', 'sword.png');
debugColors(imagePath).catch(console.error);

