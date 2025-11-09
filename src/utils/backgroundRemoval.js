/**
 * Background removal utility for game assets
 * Removes white/light backgrounds and makes them transparent
 */

import sharp from 'sharp';

/**
 * Remove background from image buffer
 * @param {Buffer} imageBuffer - Input image buffer
 * @param {Object} options - Processing options
 * @param {number} options.brightnessThreshold - Brightness threshold (0-255, default: 240)
 * @param {number} options.alphaThreshold - Alpha threshold (0-255, default: 200)
 * @returns {Promise<Buffer>} Processed image buffer with transparency
 */
export async function removeBackground(imageBuffer, options = {}) {
  const {
    brightnessThreshold = 240,
    alphaThreshold = 200,
    edgeDetection = false
  } = options;

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

  // Process pixels: make white/light backgrounds transparent
  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3] || 255;

    // Calculate brightness
    const brightness = (r + g + b) / 3;

    // Check if pixel should be transparent
    let makeTransparent = false;

    // Strategy 1: Very bright pixels (likely background)
    if (brightness > brightnessThreshold && a > alphaThreshold) {
      makeTransparent = true;
    }
    // Strategy 2: Pure white
    else if (r > 250 && g > 250 && b > 250 && a > alphaThreshold) {
      makeTransparent = true;
    }
    // Strategy 3: Very light grays (common background)
    else if (Math.abs(r - g) < 5 && Math.abs(g - b) < 5 && brightness > (brightnessThreshold - 5)) {
      makeTransparent = true;
    }

    if (makeTransparent) {
      pixels[i + 3] = 0;
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
  // First resize
  const resizedBuffer = await sharp(imageBuffer)
    .resize(targetWidth, targetHeight, {
      kernel: sharp.kernel.nearest, // Nearest neighbor for pixel art
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  // Then remove background
  const result = await removeBackground(resizedBuffer, options);

  return result.buffer;
}

