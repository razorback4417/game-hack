# Asset Generation with Gemini 2.0 Flash Preview

This project uses Google's Gemini 2.0 Flash Preview Image Generation to create game assets.

## Setup

1. **Get Gemini API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create an API key
   - Copy the key

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set API Key** (choose one method):
   - Environment variable: `export GEMINI_API_KEY=your_key_here`
   - Pass as argument: `--api-key your_key_here`
   - Create `.env` file: `GEMINI_API_KEY=your_key_here`

## Usage

### Generate Single Asset (Sword)

```bash
npm run generate:sword -- --api-key YOUR_API_KEY
```

Or directly:
```bash
node scripts/generate-assets.js --api-key YOUR_API_KEY --asset sword
```

### Generate All Assets

```bash
npm run generate:assets -- --api-key YOUR_API_KEY --prompt "A pixel art game where a knight fights slimes"
```

## Current Implementation

### Sword Asset Generation

The `sword.png` asset is configured with:
- **Dimensions**: 32×32 pixels
- **Style**: Pixel art, 16-bit style
- **Prompt**: "A medieval sword, side view, pointing right, simple design, game sprite"`

### Asset Generator Service

The `src/services/assetGenerator.js` provides:
- `generateImage()` - Generate any image asset
- `generateSword()` - Specific sword generation
- `generateAllAssets()` - Batch generation with progress tracking
- `analyzePromptForAssets()` - Analyze game prompt to determine required assets

## Integration with GameWeaver

### Phase 2: Asset Studio Integration

The asset generator can be integrated into Phase 2 to:
1. Analyze user prompt to determine required assets
2. Generate assets in parallel
3. Show progress for each asset
4. Allow regeneration of individual assets

### Example Usage in React Component

```javascript
import AssetGenerator from './services/assetGenerator';

const generator = new AssetGenerator(apiKey);

// Generate sword
const swordBlob = await generator.generateSword();

// Generate all assets from prompt
const assets = await generator.generateAllAssets(
  gamePrompt,
  assetList,
  (assetName, progress) => {
    console.log(`${assetName}: ${progress}%`);
  }
);
```

## Asset Specifications

All asset specifications are defined in:
- `assets/assets-manifest.json` - Complete asset metadata
- `ASSETS_ANALYSIS.md` - Detailed documentation

## Next Steps

1. **Expand Asset List**: Add all game assets to generation pipeline
2. **Prompt Analysis**: Use LLM to analyze game prompt and determine required assets
3. **Style Consistency**: Ensure all generated assets match the game's art style
4. **Batch Processing**: Generate all assets in parallel for faster workflow
5. **Asset Validation**: Verify generated assets meet size/format requirements

## Notes

- The `gemini-2.0-flash-preview-image-generation` model may be deprecated. Check for `gemini-2.5-flash-image` as fallback.
- Generated images are saved as PNG with transparent backgrounds where applicable.
- All assets should match the exact dimensions specified in the manifest.

