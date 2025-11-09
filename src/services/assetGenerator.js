/**
 * Asset Generator Service
 * Uses Gemini 2.0 Flash Preview Image Generation to create game assets
 */

// Note: This requires the @google/generative-ai package
// Install with: npm install @google/generative-ai

class AssetGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.model = null;

    if (apiKey && typeof window !== 'undefined') {
      // Initialize in browser if API key is provided
      this.init();
    }
  }

  async init() {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.apiKey);
      // Note: Check if gemini-2.0-flash-preview-image-generation is available
      // or use gemini-2.5-flash-image as fallback
      this.model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp' // or 'gemini-2.5-flash-image'
      });
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
    }
  }

  /**
   * Generate a single image asset
   * @param {Object} assetSpec - Asset specification
   * @param {string} assetSpec.name - Asset name
   * @param {number} assetSpec.width - Image width in pixels
   * @param {number} assetSpec.height - Image height in pixels
   * @param {string} assetSpec.prompt - Generation prompt
   * @param {string} assetSpec.style - Style description (e.g., "pixel art", "16-bit")
   * @returns {Promise<Blob>} Generated image blob
   */
  async generateImage(assetSpec) {
    if (!this.model) {
      await this.init();
    }

    if (!this.model) {
      throw new Error('Gemini model not initialized. Please provide an API key.');
    }

    const { name, width, height, prompt, style = 'pixel art, 16-bit style, game sprite' } = assetSpec;

    // Create detailed prompt for image generation
    const fullPrompt = `${prompt}, ${style}, ${width}x${height} pixels, transparent background, game asset, clean edges, no anti-aliasing`;

    try {
      // Generate image
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModality: 'IMAGE',
          imageGenerationConfig: {
            width: width,
            height: height,
          }
        }
      });

      // Extract image data
      const response = await result.response;
      const imageData = response.candidates[0].content.parts[0].inlineData.data;
      const mimeType = response.candidates[0].content.parts[0].inlineData.mimeType;

      // Convert base64 to blob
      const base64Data = imageData;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType || 'image/png' });

      return blob;
    } catch (error) {
      console.error(`Error generating image for ${name}:`, error);
      throw error;
    }
  }

  /**
   * Generate sword.png replacement
   * @param {string} style - Optional style override
   * @returns {Promise<Blob>} Generated sword image
   */
  async generateSword(style = 'pixel art, 16-bit style') {
    return this.generateImage({
      name: 'sword',
      width: 32,
      height: 32,
      prompt: 'A medieval sword, side view, pointing right, simple design, game sprite',
      style: style
    });
  }

  /**
   * Generate all assets based on game prompt
   * @param {string} gamePrompt - User's game description
   * @param {Array} assetList - List of assets to generate
   * @param {Function} onProgress - Progress callback (assetName, progress)
   * @returns {Promise<Object>} Map of asset names to blob URLs
   */
  async generateAllAssets(gamePrompt, assetList, onProgress) {
    const results = {};
    const total = assetList.length;

    for (let i = 0; i < assetList.length; i++) {
      const asset = assetList[i];

      try {
        if (onProgress) {
          onProgress(asset.name, (i / total) * 100);
        }

        const blob = await this.generateImage({
          name: asset.name,
          width: asset.width,
          height: asset.height,
          prompt: this.createPromptForAsset(asset, gamePrompt),
          style: asset.style || 'pixel art, 16-bit style, game sprite'
        });

        // Create object URL for immediate use
        results[asset.name] = URL.createObjectURL(blob);
      } catch (error) {
        console.error(`Failed to generate ${asset.name}:`, error);
        // Continue with other assets
      }
    }

    if (onProgress) {
      onProgress(null, 100);
    }

    return results;
  }

  /**
   * Create a generation prompt for a specific asset based on game description
   * @param {Object} asset - Asset specification
   * @param {string} gamePrompt - User's game description
   * @returns {string} Generation prompt
   */
  createPromptForAsset(asset, gamePrompt) {
    const basePrompt = `Based on this game description: "${gamePrompt}", create ${asset.description || asset.name}`;

    // Add specific requirements based on asset type
    if (asset.type === 'spritesheet') {
      return `${basePrompt}, sprite sheet with ${asset.frameCount || 1} frames, ${asset.frameWidth}x${asset.frameHeight} pixels per frame`;
    } else if (asset.type === 'character') {
      return `${basePrompt}, character sprite with walk cycle, facing 4 directions (down, left, right, up)`;
    } else if (asset.type === 'weapon') {
      return `${basePrompt}, weapon sprite, side view`;
    } else if (asset.type === 'tile') {
      return `${basePrompt}, tile sprite for game background`;
    }

    return basePrompt;
  }

  /**
   * Analyze game prompt and generate asset list
   * @param {string} gamePrompt - User's game description
   * @returns {Array} List of required assets
   */
  analyzePromptForAssets(gamePrompt) {
    // This would use an LLM to analyze the prompt and determine required assets
    // For now, return a basic structure
    const assets = [
      {
        name: 'sword',
        type: 'weapon',
        width: 32,
        height: 32,
        description: 'a sword weapon'
      }
      // More assets would be added based on prompt analysis
    ];

    return assets;
  }
}

export default AssetGenerator;

