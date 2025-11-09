/**
 * Asset Generation Service for Browser
 * Uses Gemini API to generate game assets with theme support
 */

import { ASSET_CONFIG, buildAssetPrompt } from '../config/assetConfig.js';

class AssetGenerationService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.model = null;
  }

  async init() {
    if (!this.apiKey) {
      throw new Error('Gemini API key required');
    }

    try {
      // Try @google/genai first (newer package)
      try {
        const { GoogleGenAI } = await import('@google/genai');
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        this.useNewPackage = true;
      } catch (e) {
        // Fallback to @google/generative-ai
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        this.useNewPackage = false;
      }
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
      throw error;
    }
  }

  /**
   * Generate a single asset
   * @param {string} assetKey - Asset key (e.g., 'sword', 'potions')
   * @param {Object} options - Generation options
   * @param {string} options.theme - Optional theme
   * @param {string} options.customEdit - Optional custom edit prompt
   * @returns {Promise<Blob>} Generated image blob
   */
  async generateAsset(assetKey, options = {}) {
    const { theme = null, customEdit = null } = options;

    if (!this.apiKey) {
      await this.init();
    }

    const config = ASSET_CONFIG[assetKey];
    if (!config) {
      throw new Error(`Unknown asset: ${assetKey}`);
    }

    const prompt = buildAssetPrompt(assetKey, theme, customEdit);

    try {
      let imageData;
      let mimeType = 'image/png';

      if (this.useNewPackage && this.ai) {
        // Use @google/genai
        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: prompt,
        });

        // Extract image from response
        let parts = null;
        if (response.parts) {
          parts = response.parts;
        } else if (response.candidates && response.candidates[0] && response.candidates[0].content) {
          parts = response.candidates[0].content.parts;
        } else if (Array.isArray(response)) {
          parts = response;
        }

        for (const part of parts || []) {
          if (part.inlineData) {
            imageData = part.inlineData.data;
            mimeType = part.inlineData.mimeType || 'image/png';
            break;
          }
        }
      } else if (this.model) {
        // Use @google/generative-ai
        const result = await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseModality: 'IMAGE',
            imageGenerationConfig: {
              width: config.dimensions.width,
              height: config.dimensions.height,
            }
          }
        });

        const response = await result.response;
        if (response.candidates && response.candidates[0] && response.candidates[0].content) {
          const part = response.candidates[0].content.parts[0];
          if (part.inlineData) {
            imageData = part.inlineData.data;
            mimeType = part.inlineData.mimeType || 'image/png';
          }
        }
      }

      if (!imageData) {
        throw new Error('No image data found in response');
      }

      // Convert base64 to blob
      const byteCharacters = atob(imageData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Process the image: resize and remove pink background
      return await this.processAssetBlob(blob, config);
    } catch (error) {
      console.error(`Error generating ${assetKey}:`, error);
      throw error;
    }
  }

  /**
   * Process asset blob: resize and remove pink background
   * @param {Blob} blob - Input image blob
   * @param {Object} config - Asset config
   * @returns {Promise<Blob>} Processed image blob
   */
  async processAssetBlob(blob, config) {
    // Create an image element to load the blob
    const img = new Image();
    const imgUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = config.dimensions.width;
          canvas.height = config.dimensions.height;
          const ctx = canvas.getContext('2d');

          // Draw and scale image FIRST (nearest neighbor for pixel art)
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Get image data BEFORE adding pink background
          // This way we can detect pink that's already in the image
          let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let data = imageData.data;
          const width = canvas.width;
          const height = canvas.height;

          // FIRST: Remove any pink that's already in the original image
          // This is critical - remove pink before adding the background
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Remove any pink that's already in the image - very aggressive
            const redBlueSum = r + b;
            const greenValue = g;

            // Any pixel where red+blue significantly exceeds green
            const isPinkInOriginal = (r >= 150 && b >= 100 && greenValue <= 100 && redBlueSum > (greenValue * 2.5)) ||
                                    (redBlueSum > 250 && greenValue <= 100 && r >= 120 && b >= 80) ||
                                    (r >= 120 && b >= 80 && greenValue <= 110 && redBlueSum > 200 && redBlueSum > (greenValue * 1.8)) ||
                                    (redBlueSum > 180 && greenValue < redBlueSum * 0.6 && r >= 80 && b >= 60);

            if (isPinkInOriginal) {
              data[i + 3] = 0; // Make transparent
            }
          }

          ctx.putImageData(imageData, 0, 0);

          // NOW fill remaining transparent areas with bright pink for processing
          // This helps with edge detection
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.fillStyle = '#FF00FF';
          tempCtx.fillRect(0, 0, width, height);
          tempCtx.drawImage(canvas, 0, 0);

          // Get the image data again with pink background
          imageData = tempCtx.getImageData(0, 0, width, height);
          data = imageData.data;

          // CRITICAL: Remove ALL pink background pixels (grid lines and scattered pixels)
          // EXTREMELY AGGRESSIVE: Remove ANY pixel that could be pink
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // EXTREMELY BROAD DETECTION - Remove ANY pink-like pixel
            // Based on actual image: RGB(247, 44, 165) - high red, low green, high blue

            // Strategy 1: Pure bright pink #FF00FF
            const isPurePink = r >= 250 && g <= 5 && b >= 250;

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

            // REMOVE ALL PINK PIXELS - no exceptions
            if (isPurePink || isNearPink || isActualPink || isPinkLike || isMagentaPink || isPinkTone || isAnyPinkish) {
              data[i + 3] = 0; // Make transparent
            }
          }

          // Second pass: Aggressive cleanup - remove ANY remaining pink-like pixels
          // This catches grid lines and any pink pixels that might have been missed
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const idx = (y * width + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const a = data[idx + 3];

              // Skip if already transparent
              if (a === 0) continue;

              // EXTREMELY AGGRESSIVE: Remove ANY pink-like pixel that remains
              // Based on actual colors: RGB(247, 44, 165) - high red, low green, high blue
              // Very broad criteria to catch ALL pink variations
              const isAnyPink = (r >= 200 && b >= 120 && g <= 80 && (r + b) > 320) ||
                               (r >= 180 && b >= 100 && g <= 90 && (r + b) > 300 && (r + b) > (g * 3)) ||
                               ((r + b) > 350 && g <= 80 && r >= 180);

              if (isAnyPink) {
                data[idx + 3] = 0; // Make transparent
              }
            }
          }

          // Third pass: Final aggressive sweep - catch ANY remaining pink
          // This is a safety net to ensure ALL pink is removed
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Skip if already transparent
            if (a === 0) continue;

            // FINAL CHECK: Remove ANY remaining pink
            // EXTREMELY BROAD criteria to catch ANY pink variation
            // This is the final safety net - remove anything that looks remotely pink
            if ((r >= 180 && b >= 100 && g <= 90 && (r + b) > 300) ||
                (r >= 200 && b >= 120 && g <= 80) ||
                ((r + b) > 320 && g <= 80 && r >= 150 && b >= 100) ||
                (r >= 200 && b >= 100 && (r + b) > (g * 3.5))) {
              data[i + 3] = 0; // Make transparent
            }
          }

          // Fourth pass: ABSOLUTE FINAL SWEEP - remove ANYTHING that could be pink
          // This catches any pink we might have missed, including very subtle variations
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

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

            // Even more aggressive: any pixel where red+blue is much higher than green
            const isVeryPinkish = (r + b) > 200 && g <= 120 && (r + b) > (g * 2) && r >= 100 && b >= 70;

            // Catch magenta-like colors (high red, high blue, low green)
            const isMagentaLike = r >= 120 && b >= 80 && g <= 110 && (r + b) > 200 && (r + b) > (g * 1.8);

            if (isRemotelyPink || isPinkishTone || isVeryPinkish || isMagentaLike) {
              data[i + 3] = 0; // Make transparent
            }
          }

          // Fifth pass: ULTIMATE FINAL CHECK - remove ANY remaining pink traces
          // This is the absolute last resort - remove anything that could possibly be pink
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Skip if already transparent
            if (a === 0) continue;

            // ULTIMATE CHECK: Remove ANY pixel where red+blue dominates over green
            // This catches even the most subtle pink/magenta tones
            const redBlueSum = r + b;
            const greenValue = g;

            // If red+blue is significantly higher than green, it's likely pink/magenta
            const isPossiblyPink = redBlueSum > 180 &&
                                   greenValue < redBlueSum * 0.6 &&
                                   r >= 80 &&
                                   b >= 60 &&
                                   (redBlueSum > greenValue * 1.5);

            // Also check for any pixel that has the pink/magenta signature
            // Pink/magenta: high red, high blue, low green relative to red+blue
            const hasPinkSignature = r >= 100 &&
                                     b >= 70 &&
                                     greenValue <= 120 &&
                                     (redBlueSum > greenValue * 1.4) &&
                                     (redBlueSum > 200);

            if (isPossiblyPink || hasPinkSignature) {
              data[i + 3] = 0; // Make transparent
            }
          }

          // Final verification pass: Check for any remaining pink pixels
          // This is a safety check to ensure we got everything
          let pinkPixelsRemaining = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Skip if already transparent
            if (a === 0) continue;

            // Check if this pixel could still be pink
            const redBlueSum = r + b;
            const couldBePink = (r >= 100 && b >= 70 && g <= 120 && redBlueSum > (g * 1.4)) ||
                               (redBlueSum > 180 && g < redBlueSum * 0.65 && r >= 80 && b >= 60);

            if (couldBePink) {
              // Remove it as a final safety measure
              data[i + 3] = 0;
              pinkPixelsRemaining++;
            }
          }

          if (pinkPixelsRemaining > 0) {
            console.warn(`Removed ${pinkPixelsRemaining} additional pink pixels in final verification pass`);
          }

          // Put processed data back to the temp canvas
          tempCtx.putImageData(imageData, 0, 0);

          // Convert the processed canvas to blob
          tempCanvas.toBlob((processedBlob) => {
            URL.revokeObjectURL(imgUrl);
            if (processedBlob) {
              resolve(processedBlob);
            } else {
              reject(new Error('Failed to process image'));
            }
          }, 'image/png');
        } catch (error) {
          URL.revokeObjectURL(imgUrl);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(imgUrl);
        reject(new Error('Failed to load image'));
      };

      img.src = imgUrl;
    });
  }

  /**
   * Generate multiple assets
   * @param {Array<string>} assetKeys - Array of asset keys
   * @param {Object} options - Generation options
   * @param {string} options.theme - Optional theme
   * @param {Function} options.onProgress - Progress callback
   * @returns {Promise<Object>} Map of asset keys to blob URLs
   */
  async generateAssets(assetKeys, options = {}) {
    const { theme = null, onProgress = null } = options;
    const total = assetKeys.length;
    const results = {};

    for (let i = 0; i < assetKeys.length; i++) {
      const assetKey = assetKeys[i];

      if (onProgress) {
        onProgress(assetKey, (i / total) * 100);
      }

      try {
        const blob = await this.generateAsset(assetKey, { theme });
        const url = URL.createObjectURL(blob);
        results[assetKey] = {
          blob,
          url,
          file: ASSET_CONFIG[assetKey].file
        };
      } catch (error) {
        console.error(`Failed to generate ${assetKey}:`, error);
        // Continue with other assets
      }
    }

    if (onProgress) {
      onProgress(null, 100);
    }

    return results;
  }

  /**
   * Save blob to file (downloads in browser)
   * @param {Blob} blob - Image blob
   * @param {string} filename - Filename
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Save asset to server (writes to assets/images/)
   * @param {Blob} blob - Image blob
   * @param {string} filename - Filename
   * @returns {Promise<Object>} Response from server
   */
  async saveAssetToServer(blob, filename) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result;
          const serverUrl = import.meta.env.VITE_ASSET_SERVER_URL || 'http://localhost:3002';
          const response = await fetch(`${serverUrl}/api/save-asset`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename,
              data: base64Data
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to save asset: ${response.statusText}`);
          }

          const result = await response.json();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Save multiple assets to server
   * @param {Array<{blob: Blob, filename: string}>} assets - Array of assets to save
   * @returns {Promise<Object>} Results from server
   */
  async saveAssetsToServer(assets) {
    const assetsToSave = await Promise.all(
      assets.map(async ({ blob, filename }) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              filename,
              data: reader.result
            });
          };
          reader.readAsDataURL(blob);
        })
      })
    );

    const serverUrl = import.meta.env.VITE_ASSET_SERVER_URL || 'http://localhost:3002';
    const response = await fetch(`${serverUrl}/api/save-assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assets: assetsToSave })
    });

    if (!response.ok) {
      throw new Error(`Failed to save assets: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Edit specific tiles in the tileset based on theme
   * Uses pixel-level color replacement to preserve exact texture
   * @param {Blob} tilesBlob - Original tiles image blob
   * @param {string} theme - Theme name (e.g., 'star wars', 'horror')
   * @returns {Promise<Blob>} Modified tiles image blob
   */
  async editTilesForTheme(tilesBlob, theme) {
    // Use pixel-level color replacement for reliability
    return await this.replaceTileColors(tilesBlob, theme);
  }

  /**
   * Replace colors in specific tiles using pixel-level manipulation
   * This preserves the exact texture pattern
   * @param {Blob} tilesBlob - Original tiles image blob
   * @param {string} theme - Theme name
   * @returns {Promise<Blob>} Modified tiles image blob
   */
  async replaceTileColors(tilesBlob, theme) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const imgUrl = URL.createObjectURL(tilesBlob);

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 240;
          const ctx = canvas.getContext('2d');

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, 128, 240);
          const data = imageData.data;

          // Get theme color RGB values
          const themeRgb = this.getThemeColorRgb(theme);

          // Edit only row 9, columns 1 and 2
          // Row 9: y = 128 to 143 (0-indexed: 128-143)
          // Column 1: x = 0 to 15
          // Column 2: x = 16 to 31

          for (let y = 128; y < 144; y++) {
            for (let x = 0; x < 32; x++) {
              const idx = (y * 128 + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const a = data[idx + 3];

              // Skip transparent pixels
              if (a === 0) continue;

              // Detect green pixels (grass color)
              // Green has high green component relative to red and blue
              const isGreen = g > r && g > b && g > 50;

              // Also check for greenish tones (medium green grass)
              const greenness = g / (r + g + b + 1); // Avoid division by zero
              const isGreenish = greenness > 0.35 && g > 25 && (g > r + 10 || g > b + 10);

              if (isGreen || isGreenish) {
                // Convert RGB to HSL to preserve lightness and saturation
                const hsl = this.rgbToHsl(r, g, b);

                // Keep the original lightness and saturation, but use theme color as base
                // This preserves the texture's light/dark variations
                const themeHsl = this.rgbToHsl(themeRgb.r, themeRgb.g, themeRgb.b);

                // Use theme hue, but preserve original lightness and saturation
                const newHsl = {
                  h: themeHsl.h,
                  s: hsl.s, // Preserve original saturation
                  l: hsl.l  // Preserve original lightness
                };

                // Convert back to RGB
                const newRgb = this.hslToRgb(newHsl.h, newHsl.s, newHsl.l);

                data[idx] = newRgb.r;
                data[idx + 1] = newRgb.g;
                data[idx + 2] = newRgb.b;
              }
            }
          }

          // Put modified data back
          ctx.putImageData(imageData, 0, 0);

          // Convert to blob
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(imgUrl);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png');
        } catch (error) {
          URL.revokeObjectURL(imgUrl);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(imgUrl);
        reject(new Error('Failed to load image'));
      };

      img.src = imgUrl;
    });
  }

  /**
   * Get theme-appropriate color RGB values
   * @param {string} theme - Theme name
   * @returns {Object} RGB values {r, g, b}
   */
  getThemeColorRgb(theme) {
    if (!theme) return { r: 40, g: 40, b: 40 }; // Dark grey

    const lowerTheme = theme.toLowerCase();

    // Star Wars themes - dark black
    if (lowerTheme.includes('star') || lowerTheme.includes('wars') || lowerTheme.includes('space')) {
      return { r: 20, g: 20, b: 20 }; // Very dark grey/black
    }

    // Horror themes - dark red
    if (lowerTheme.includes('horror') || lowerTheme.includes('zombie') || lowerTheme.includes('dark')) {
      return { r: 80, g: 10, b: 10 }; // Dark red/crimson
    }

    // Cyberpunk - dark blue/purple
    if (lowerTheme.includes('cyberpunk') || lowerTheme.includes('neon')) {
      return { r: 30, g: 20, b: 60 }; // Dark blue-purple
    }

    // Medieval/Fantasy - dark brown
    if (lowerTheme.includes('medieval') || lowerTheme.includes('fantasy')) {
      return { r: 60, g: 40, b: 20 }; // Dark brown
    }

    // Post-apocalyptic - dark brown/grey
    if (lowerTheme.includes('apocalyptic') || lowerTheme.includes('wasteland')) {
      return { r: 50, g: 40, b: 30 }; // Dark brown-grey
    }

    // Default: dark grey
    return { r: 40, g: 40, b: 40 };
  }

  /**
   * Get theme-appropriate color description (for prompts)
   * @param {string} theme - Theme name
   * @returns {string} Color description
   */
  getThemeColor(theme) {
    if (!theme) return 'dark grey';

    const lowerTheme = theme.toLowerCase();

    // Star Wars themes
    if (lowerTheme.includes('star') || lowerTheme.includes('wars') || lowerTheme.includes('space')) {
      return 'dark black or very dark grey';
    }

    // Horror themes
    if (lowerTheme.includes('horror') || lowerTheme.includes('zombie') || lowerTheme.includes('dark')) {
      return 'dark red or deep crimson';
    }

    // Cyberpunk
    if (lowerTheme.includes('cyberpunk') || lowerTheme.includes('neon')) {
      return 'dark blue or dark purple';
    }

    // Medieval/Fantasy
    if (lowerTheme.includes('medieval') || lowerTheme.includes('fantasy')) {
      return 'dark brown or dark green';
    }

    // Post-apocalyptic
    if (lowerTheme.includes('apocalyptic') || lowerTheme.includes('wasteland')) {
      return 'dark brown or dark grey';
    }

    // Default: dark grey/black
    return 'dark grey or dark black';
  }

  /**
   * Convert RGB to HSL
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {Object} HSL values {h, s, l} where h is 0-360, s and l are 0-1
   */
  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s, l };
  }

  /**
   * Convert HSL to RGB
   * @param {number} h - Hue (0-360)
   * @param {number} s - Saturation (0-1)
   * @param {number} l - Lightness (0-1)
   * @returns {Object} RGB values {r, g, b} (0-255)
   */
  hslToRgb(h, s, l) {
    h /= 360;
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * Clean pink pixels from an existing asset blob (second pass)
   * This is a manual cleaning function that users can trigger
   * @param {Blob} blob - Image blob to clean
   * @returns {Promise<Blob>} Cleaned image blob
   */
  async cleanPinkPixels(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const imgUrl = URL.createObjectURL(blob);

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          // Draw image
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const width = canvas.width;
          const height = canvas.height;

          let pinkPixelsRemoved = 0;

          // Multiple passes to ensure all pink is removed
          // Pass 1: Remove obvious pink
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a === 0) continue;

            const redBlueSum = r + b;
            const greenValue = g;

            // Detect pink pixels
            const isPink = (r >= 250 && g <= 5 && b >= 250) || // Pure pink
                         (r >= 240 && g <= 20 && b >= 240) || // Near pink
                         (r >= 200 && b >= 120 && g <= 80 && redBlueSum > 320) || // Pink-like
                         (redBlueSum > 350 && g <= 80 && r >= 180 && b >= 100) || // Magenta-pink
                         (r >= 180 && b >= 100 && g <= 90 && redBlueSum > 300 && redBlueSum > (g * 3)) || // Pinkish
                         (r >= 150 && b >= 100 && g <= 100 && redBlueSum > (g * 2.5)) || // Remotely pink
                         (redBlueSum > 250 && g <= 100 && r >= 120 && b >= 80) || // Pinkish tone
                         (redBlueSum > 200 && g <= 120 && redBlueSum > (g * 2) && r >= 100 && b >= 70) || // Very pinkish
                         (r >= 120 && b >= 80 && g <= 110 && redBlueSum > 200 && redBlueSum > (g * 1.8)) || // Magenta-like
                         (redBlueSum > 180 && greenValue < redBlueSum * 0.6 && r >= 80 && b >= 60 && redBlueSum > (greenValue * 1.5)) || // Possibly pink
                         (r >= 100 && b >= 70 && greenValue <= 120 && redBlueSum > (greenValue * 1.4) && redBlueSum > 200); // Pink signature

            if (isPink) {
              data[i + 3] = 0;
              pinkPixelsRemoved++;
            }
          }

          // Pass 2: Final sweep for any remaining pink
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a === 0) continue;

            const redBlueSum = r + b;
            const couldBePink = (r >= 100 && b >= 70 && g <= 120 && redBlueSum > (g * 1.4)) ||
                               (redBlueSum > 180 && g < redBlueSum * 0.65 && r >= 80 && b >= 60);

            if (couldBePink) {
              data[i + 3] = 0;
              pinkPixelsRemoved++;
            }
          }

          // Put processed data back
          ctx.putImageData(imageData, 0, 0);

          // Convert to blob
          canvas.toBlob((processedBlob) => {
            URL.revokeObjectURL(imgUrl);
            if (processedBlob) {
              if (pinkPixelsRemoved > 0) {
                console.log(`Cleaned ${pinkPixelsRemoved} pink pixels from image`);
              }
              resolve(processedBlob);
            } else {
              reject(new Error('Failed to process image'));
            }
          }, 'image/png');
        } catch (error) {
          URL.revokeObjectURL(imgUrl);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(imgUrl);
        reject(new Error('Failed to load image'));
      };

      img.src = imgUrl;
    });
  }

  /**
   * Convert blob to base64 string
   * @param {Blob} blob - Image blob
   * @returns {Promise<string>} Base64 string
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove data URL prefix (data:image/png;base64,)
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export default AssetGenerationService;

