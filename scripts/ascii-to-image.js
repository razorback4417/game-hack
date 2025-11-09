#!/usr/bin/env node

/**
 * Convert ASCII art from Gemini response to actual PNG image
 * This is a workaround since the API returns text descriptions
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color mapping from Gemini's response
const COLOR_MAP = {
  '.': null, // transparent
  '#': '#C0C0C0', // Light Grey - Blade
  '=': '#694A09', // Brown - Hilt
  'f': '#C0C0C0', // Light Grey
  'e': '#808080', // Mid Grey
  '0': '#694A09', // Brown
};

function parseAsciiArt(asciiText) {
  const lines = asciiText.split('\n').filter(line => line.trim());
  const pixels = [];

  for (const line of lines) {
    const row = [];
    for (const char of line) {
      row.push(COLOR_MAP[char] || null);
    }
    pixels.push(row);
  }

  return pixels;
}

async function createImageFromAscii(asciiText, outputPath, width = 32, height = 32) {
  try {
    // Try to use node-canvas if available
    let Canvas, canvas, ctx;

    try {
      const canvasModule = await import('canvas');
      Canvas = canvasModule.default || canvasModule;
      canvas = Canvas.createCanvas(width, height);
      ctx = canvas.getContext('2d');
    } catch (e) {
      console.error('canvas package not installed. Install with: npm install canvas');
      throw new Error('Canvas package required for image generation');
    }

    // Parse ASCII art
    const pixels = parseAsciiArt(asciiText);

    // Scale to fit 32x32
    const scaleX = width / (pixels[0]?.length || width);
    const scaleY = height / pixels.length;

    // Draw pixels
    for (let y = 0; y < pixels.length; y++) {
      for (let x = 0; x < pixels[y].length; x++) {
        const color = pixels[y][x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(
            Math.floor(x * scaleX),
            Math.floor(y * scaleY),
            Math.ceil(scaleX),
            Math.ceil(scaleY)
          );
        }
      }
    }

    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`✓ Created image from ASCII art: ${outputPath}`);
    return buffer;
  } catch (error) {
    console.error('Error creating image:', error);
    throw error;
  }
}

// Example usage with the ASCII art from Gemini response
const asciiArt = `
    ..........########..........
    .........##########.........
    ........############........
    .......##############.......
    ......###############.......
    ......#####......#####......
    .......####......####.......
    ........###......###........
    .........##......##.........
    ..........#......#..........
    ..........#......#..........
    ..........#......#..........
    ..........#......#..........
    ##########========#..........
    ##########========#..........
    ##########========#..........
    ##########========#..........
    ##########========#..........
    ##########========#..........
    ##########========#..........
    ##########========#..........
    ##########========#..........
    ##########========#..........
    ##########========#..........
    ##########========#..........
    ##########========#..........
    ##########========#..........
    ##########========#..........
    ..........#......#..........
    ..........#......#..........
    ..........#......#..........
    ..........#......#..........
`.trim();

const outputPath = path.join(__dirname, '..', 'assets', 'images', 'sword.png');

createImageFromAscii(asciiArt, outputPath, 32, 32)
  .then(() => {
    console.log('✓ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Failed:', error.message);
    process.exit(1);
  });

