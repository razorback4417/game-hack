# Background Color Strategy

## Hardcoded Background Color

**Bright Pink/Magenta: `#FF00FF` (RGB: 255, 0, 255)**

This color is:
- Very unlikely to appear in game sprites
- Easy to detect and remove programmatically
- Distinctive enough to avoid false positives

## Detection Strategy

The background removal uses three strategies to catch variations:

1. **Pure Bright Pink**: RGB(255, 0, 255) within tolerance
2. **Pinkish/Magenta**: High red (≥200), low green (≤100), high blue (≥100)
3. **Exact Match**: All channels within tolerance (30)

## Why This Works

- AI image generators sometimes create pinkish variations instead of pure bright pink
- The detection handles RGB(243, 77, 148) type colors (common AI variations)
- The tolerance (30) allows for slight color shifts during processing
- The pinkish detection catches colors where red+blue >> green

## Usage

All asset generation scripts automatically:
1. Request bright pink background in prompt
2. Use `processGameAsset()` which removes `#FF00FF` and pinkish variations
3. Save with full transparency

## Customization

To change the background color, update:
- Prompt: Change `#FF00FF` to your color
- `backgroundRemoval.js`: Update `backgroundColor` default
- Detection logic: Adjust the pinkish detection thresholds

