/**
 * Script to generate sword.png using Gemini 2.0 Flash Preview
 * Run this from Node.js environment or browser console
 */

import AssetGenerator from './assetGenerator.js';

/**
 * Generate and replace sword.png
 * @param {string} apiKey - Gemini API key
 * @param {string} outputPath - Path to save the generated image
 */
export async function generateSwordAsset(apiKey, outputPath = null) {
  const generator = new AssetGenerator(apiKey);

  try {
    console.log('Generating sword.png...');
    const blob = await generator.generateSword();

    if (outputPath && typeof window === 'undefined') {
      // Node.js environment - save to file
      const fs = await import('fs');
      const buffer = Buffer.from(await blob.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);
      console.log(`Sword image saved to ${outputPath}`);
    } else {
      // Browser environment - download or return blob
      console.log('Sword image generated:', blob);

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sword.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return blob;
    }

    return blob;
  } catch (error) {
    console.error('Error generating sword:', error);
    throw error;
  }
}

// For direct execution
if (typeof window !== 'undefined') {
  window.generateSwordAsset = generateSwordAsset;
}

