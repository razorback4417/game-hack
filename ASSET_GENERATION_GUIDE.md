# Asset Generation System

## Overview

The asset generation system allows you to generate all game assets using Gemini AI with theme support and individual asset editing capabilities.

## Features

1. **Theme-based Generation**: Generate all assets based on a theme (e.g., "cyberpunk", "medieval", "sci-fi")
2. **Individual Asset Editing**: Click on any asset to regenerate it with custom prompts
3. **Pink Background Removal**: Automatically removes bright pink (#FF00FF) backgrounds from generated images
4. **Strict Prompts**: Ensures exact dimensions and pixel art style for all assets

## Usage

### Browser (React App)

1. Start the dev server: `npm run dev`
2. Enter your game prompt (e.g., "A cyberpunk action RPG")
3. Enter your Gemini API key when prompted (or set `VITE_GEMINI_API_KEY` in `.env`)
4. Assets will be generated automatically based on the theme extracted from your prompt
5. Click on any asset to edit/regenerate it with a custom prompt

### Command Line (Node.js)

Generate a single asset:
```bash
GEMINI_API_KEY=your_key node scripts/generate-asset-gemini.js sword
```

Generate with theme:
```bash
GEMINI_API_KEY=your_key node scripts/generate-asset-gemini.js sword --theme cyberpunk
```

Generate with custom edit:
```bash
GEMINI_API_KEY=your_key node scripts/generate-asset-gemini.js sword --edit "Make it a laser gun"
```

Or use npm script:
```bash
npm run generate:asset sword --theme cyberpunk
```

## Available Assets

All assets are defined in `src/config/assetConfig.js`:

- `sword` - Weapon sprite (32x32)
- `potions` - Potion spritesheet (176x16, 11 frames)
- `fireball` - Projectile spritesheet (64x16, 4 frames)
- `spell` - Spell projectile spritesheet (72x12, 6 frames)
- `characters` - Character spritesheet (192x128, 96 frames)
- `dragons` - Boss enemy spritesheet (384x256, 96 frames)
- `tiles` - Tile spritesheet (128x240, 120 frames)
- `things` - Collectable items spritesheet (192x128, 96 frames)
- `dead` - Corpse spritesheet (48x64, 12 frames)
- `flame` - Particle sprite (32x32)
- `level-particle` - Particle sprite (2x2)
- `spell-particle` - Particle sprite (2x2)

## How It Works

1. **Asset Configuration**: Each asset has a base prompt and theme-aware prompt function
2. **Strict Prompting**: All prompts include strict requirements for:
   - Exact dimensions
   - Bright pink background (#FF00FF)
   - Pixel art style
   - No anti-aliasing
3. **Background Removal**: Generated images are processed to:
   - Resize to exact dimensions
   - Remove bright pink backgrounds
   - Make backgrounds transparent
4. **Theme Support**: Themes are extracted from prompts or can be specified manually

## File Structure

- `src/config/assetConfig.js` - Asset definitions and prompt builders
- `src/services/assetGenerationService.js` - Browser-based asset generation service
- `scripts/generate-asset-gemini.js` - Node.js CLI asset generator
- `scripts/backgroundRemoval.js` - Pink background removal utility

## Notes

- All generated assets maintain their original filenames (e.g., `sword.png`) even when content changes
- The pink background removal uses multiple detection strategies to catch variations
- Browser-based generation uses canvas API for background removal
- Node.js generation uses Sharp library for better performance

## API Key Setup

Set your Gemini API key in one of these ways:

1. Environment variable: `VITE_GEMINI_API_KEY=your_key` (for browser)
2. Environment variable: `GEMINI_API_KEY=your_key` (for CLI)
3. Enter when prompted in the browser

Get your API key at: https://aistudio.google.com/

