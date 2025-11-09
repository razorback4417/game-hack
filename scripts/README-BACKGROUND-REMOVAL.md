# Background Removal for Game Assets

## Overview

The asset generation system now automatically removes backgrounds from generated images to ensure they have transparent backgrounds suitable for game sprites.

## How It Works

### 1. Enhanced Prompts
- Prompts explicitly request transparent backgrounds
- Multiple mentions of "transparent background" and "alpha channel"
- Clear instructions that backgrounds must be 100% transparent

### 2. Automatic Background Removal
After image generation, the system:
1. Resizes image to target dimensions (e.g., 32x32)
2. Processes each pixel to detect background
3. Makes light/white pixels transparent

### 3. Background Detection Strategies

The system uses three strategies to identify background pixels:

1. **Brightness Threshold**: Pixels with brightness > 240 (very light)
2. **Pure White**: Pixels where R, G, B are all > 250
3. **Light Grays**: Uniform light gray pixels (common backgrounds)

### 4. Configurable Thresholds

You can adjust the sensitivity:

```javascript
await processGameAsset(buffer, 32, 32, {
  brightnessThreshold: 240,  // Lower = more aggressive (default: 240)
  alphaThreshold: 200         // Alpha value threshold (default: 200)
});
```

## Usage

### For Sword Generation
```bash
npm run generate:sword -- --api-key YOUR_KEY
```

The script automatically:
- Generates image with Gemini
- Resizes to 32x32
- Removes background
- Saves with transparency

### For Other Assets

Use the `processGameAsset` function:

```javascript
import { processGameAsset } from './scripts/backgroundRemoval.js';

const processed = await processGameAsset(
  imageBuffer,
  targetWidth,
  targetHeight,
  {
    brightnessThreshold: 240,
    alphaThreshold: 200
  }
);
```

## Adjusting Sensitivity

If backgrounds aren't being removed enough:
- Lower `brightnessThreshold` (e.g., 230)
- Lower `alphaThreshold` (e.g., 180)

If too much is being removed (parts of the sprite):
- Raise `brightnessThreshold` (e.g., 245)
- Raise `alphaThreshold` (e.g., 220)

## Current Results

- **Sword**: 561 background pixels made transparent
- **Format**: PNG with RGBA (alpha channel)
- **Dimensions**: Exactly 32x32 pixels
- **Quality**: Preserved using nearest-neighbor resizing

## Future Improvements

1. **Edge Detection**: Better detection of sprite edges
2. **Color-Based Removal**: Remove specific background colors
3. **Corner Detection**: Detect if corners are background
4. **Machine Learning**: Use ML model for better background detection

