/**
 * Background removal utility for game assets
 * Removes white/light backgrounds and makes them transparent
 */

import sharp from 'sharp';

/**
 * Remove background from image buffer
 * @param {Buffer} imageBuffer - Input image buffer
 * @param {Object} options - Processing options
 * @param {string} options.backgroundColor - Background color to remove (hex format, default: '#FF00FF' - bright pink)
 * @param {number} options.tolerance - Color matching tolerance (0-255, default: 10)
 * @param {number} options.brightnessThreshold - Fallback brightness threshold (0-255, default: 240)
 * @returns {Promise<Object>} Object with processed buffer and stats
 */
export async function removeBackground(imageBuffer, options = {}) {
  const {
    backgroundColor = '#FF00FF', // Bright pink/magenta
    tolerance = 30, // How close colors need to be to match (increased for better detection)
    brightnessThreshold = 240 // Fallback for light backgrounds
  } = options;

  // Parse background color
  const bgColor = backgroundColor.startsWith('#') ? backgroundColor.slice(1) : backgroundColor;
  const bgR = parseInt(bgColor.substring(0, 2), 16);
  const bgG = parseInt(bgColor.substring(2, 4), 16);
  const bgB = parseInt(bgColor.substring(4, 6), 16);

  // Get image data
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data);
  const channels = info.channels;
  const width = info.width;
  const height = info.height;

  let transparentCount = 0;

  // Process pixels: remove bright pink background
  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3] || 255;

    // Check if pixel matches background color (bright pink)
    const rDiff = Math.abs(r - bgR);
    const gDiff = Math.abs(g - bgG);
    const bDiff = Math.abs(b - bgB);

    // CRITICAL: Remove ALL pink background pixels (grid lines and scattered pixels)
    // EXTREMELY AGGRESSIVE: Remove any pixel that looks like pink background

    // EXTREMELY BROAD DETECTION - Remove ANY pink-like pixel
    // Strategy 1: Pure bright pink RGB(255, 0, 255)
    const isPureBrightPink = r >= 250 && g <= 5 && b >= 250;

    // Strategy 2: Very close to pure pink
    const isNearPink = r >= 240 && g <= 20 && b >= 240;

    // Strategy 3: Actual pink from images (RGB 247, 44, 165 type)
    // High red, low-medium green, high blue
    const isActualPink = r >= 240 && g <= 60 && b >= 140 && (r + b) > 380;

    // Strategy 4: ANY high red + high blue with low green (catches ALL pink variations)
    const isPinkLike = r >= 200 && g <= 80 && b >= 120 && (r + b) > 320;

    // Strategy 5: High red+blue, low green (catches magenta/pink tones)
    const isMagentaPink = (r + b) > 350 && g <= 80 && r >= 180 && b >= 100;

    // Strategy 6: Any pixel where red is high, blue is high, green is relatively low
    const isPinkTone = r >= 200 && b >= 120 && g <= 70 && (r + b) > (g * 4);

    // Strategy 7: Very broad catch-all for any pinkish color
    const isAnyPinkish = r >= 180 && b >= 100 && g <= 90 && (r + b) > 300 && (r + b) > (g * 3);

    // Strategy 8: Exact match within tolerance (fallback)
    const isExactMatch = rDiff <= 15 && gDiff <= 15 && bDiff <= 15;

    // REMOVE ALL PINK PIXELS - no exceptions
    const isBackground = isPureBrightPink || isNearPink || isActualPink || isPinkLike || isMagentaPink || isPinkTone || isAnyPinkish || isExactMatch;

    // Also remove pure white/very light pixels as fallback
    const brightness = (r + g + b) / 3;
    const isVeryLight = brightness > brightnessThreshold && a > 200;

    if (isBackground || isVeryLight) {
      pixels[i + 3] = 0; // Make transparent
      transparentCount++;
    }
  }

  // Second pass: Detect and remove grid lines and scattered pink pixels
  // This helps catch any remaining pink pixels that form lines or are isolated
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3] || 255;

      // Skip if already transparent
      if (a === 0) continue;

      // EXTREMELY AGGRESSIVE: Remove ANY remaining pink-like pixel
      // Very broad criteria to catch ALL pink variations
      const isAnyPink = (r >= 200 && b >= 120 && g <= 80 && (r + b) > 320) ||
                       (r >= 180 && b >= 100 && g <= 90 && (r + b) > 300 && (r + b) > (g * 3)) ||
                       ((r + b) > 350 && g <= 80 && r >= 180);

      if (isAnyPink) {
        pixels[idx + 3] = 0; // Make transparent
        transparentCount++;
      }
    }
  }

  // Third pass: Final aggressive sweep - catch ANY remaining pink
  // This is a safety net to ensure ALL pink is removed
  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3] || 255;

    // Skip if already transparent
    if (a === 0) continue;

    // FINAL CHECK: Remove ANY remaining pink
    // EXTREMELY BROAD criteria to catch ANY pink variation
    // This is the final safety net - remove anything that looks remotely pink
    if ((r >= 180 && b >= 100 && g <= 90 && (r + b) > 300) ||
        (r >= 200 && b >= 120 && g <= 80) ||
        ((r + b) > 320 && g <= 80 && r >= 150 && b >= 100) ||
        (r >= 200 && b >= 100 && (r + b) > (g * 3.5))) {
      pixels[i + 3] = 0; // Make transparent
      transparentCount++;
    }
  }

  // Fourth pass: ABSOLUTE FINAL SWEEP - remove ANYTHING that could be pink
  // This catches any pink we might have missed, including very subtle variations
  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3] || 255;

    // Skip if already transparent
    if (a === 0) continue;

    // ABSOLUTE FINAL CHECK: Remove ANYTHING that could remotely be pink
    // This is the most aggressive check - catches even subtle pink tones
    // Criteria: High red AND high blue, with green being the lowest component
    const redBlueHigh = r >= 150 && b >= 100;
    const greenLow = g <= 100;
    const redBlueDominant = (r + b) > (g * 2.5);
    const isRemotelyPink = redBlueHigh && greenLow && redBlueDominant;

    // Also catch any pixel where red+blue significantly exceeds green
    const isPinkishTone = (r + b) > 250 && g <= 100 && r >= 120 && b >= 80;

    if (isRemotelyPink || isPinkishTone) {
      pixels[i + 3] = 0; // Make transparent
      transparentCount++;
    }
  }

  // Convert back to image buffer
  const processedBuffer = await sharp(pixels, {
    raw: {
      width: width,
      height: height,
      channels: channels
    }
  })
    .png()
    .toBuffer();

  return {
    buffer: processedBuffer,
    transparentPixels: transparentCount,
    totalPixels: width * height
  };
}

/**
 * Process and resize image with background removal
 * @param {Buffer} imageBuffer - Input image buffer
 * @param {number} targetWidth - Target width
 * @param {number} targetHeight - Target height
 * @param {Object} options - Processing options
 * @returns {Promise<Buffer>} Processed image buffer
 */
export async function processGameAsset(imageBuffer, targetWidth, targetHeight, options = {}) {
  // Default to bright pink background removal
  const processOptions = {
    backgroundColor: '#FF00FF', // Bright pink
    tolerance: 10,
    ...options
  };

  // First resize (use bright pink as temporary background to preserve edges)
  const resizedBuffer = await sharp(imageBuffer)
    .resize(targetWidth, targetHeight, {
      kernel: sharp.kernel.nearest, // Nearest neighbor for pixel art
      fit: 'contain',
      background: { r: 255, g: 0, b: 255, alpha: 1 } // Bright pink background
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  // Then remove bright pink background
  const result = await removeBackground(resizedBuffer, processOptions);

  console.log(`  Made ${result.transparentPixels} background pixels transparent (${Math.round(result.transparentPixels / result.totalPixels * 100)}%)`);

  return result.buffer;
}

