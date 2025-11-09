/**
 * Asset Configuration
 * Defines all game assets with their specifications and generation prompts
 */

export const ASSET_CONFIG = {
  sword: {
    file: 'sword.png',
    dimensions: { width: 32, height: 32 },
    frameSize: { width: 32, height: 32 },
    type: 'weapon',
    usage: 'Player melee attack projectile',
    basePrompt: 'A weapon sprite, side view, pointing right, simple design, game sprite',
    themePrompt: (theme) => `A ${theme} weapon sprite, side view, pointing right, simple design, game sprite. The weapon should match the ${theme} theme.`,
    style: 'pixel art, 16-bit style, game sprite, sharp edges, no anti-aliasing',
    scale: 1.5,
    rotates: true
  },
  potions: {
    file: 'potions.png',
    dimensions: { width: 176, height: 16 },
    frameSize: { width: 16, height: 16 },
    type: 'spritesheet',
    totalFrames: 11,
    usage: 'Potion collectables',
    basePrompt: 'A horizontal spritesheet of 11 different potion bottles in a row, each 16x16 pixels, pixel art style',
    themePrompt: (theme) => `A horizontal spritesheet of 11 different ${theme}-themed potion bottles in a row, each 16x16 pixels, pixel art style. The potions should match the ${theme} theme.`,
    style: 'pixel art, 16-bit style, game sprite, sharp edges, no anti-aliasing',
    scale: 2
  },
  fireball: {
    file: 'fireball.png',
    dimensions: { width: 64, height: 16 },
    frameSize: { width: 16, height: 16 },
    type: 'spritesheet',
    totalFrames: 4,
    usage: 'Boss attack projectile',
    basePrompt: 'A horizontal spritesheet of 4 animated fireball frames in a row, each 16x16 pixels, showing a fireball projectile animation',
    themePrompt: (theme) => `A horizontal spritesheet of 4 animated ${theme}-themed projectile frames in a row, each 16x16 pixels, showing a projectile animation. The projectile should match the ${theme} theme.`,
    style: 'pixel art, 16-bit style, game sprite, sharp edges, no anti-aliasing',
    scale: 1.5
  },
  spell: {
    file: 'spell.png',
    dimensions: { width: 72, height: 12 },
    frameSize: { width: 12, height: 12 },
    type: 'spritesheet',
    totalFrames: 6,
    usage: 'Player spell attack projectile',
    basePrompt: 'A horizontal spritesheet of 6 animated spell projectile frames in a row, each 12x12 pixels, showing a magical spell animation',
    themePrompt: (theme) => `A horizontal spritesheet of 6 animated ${theme}-themed spell projectile frames in a row, each 12x12 pixels, showing a magical spell animation. The spell should match the ${theme} theme.`,
    style: 'pixel art, 16-bit style, game sprite, sharp edges, no anti-aliasing',
    scale: 1.5
  },
  characters: {
    file: 'characters.png',
    dimensions: { width: 192, height: 128 },
    frameSize: { width: 16, height: 16 },
    type: 'spritesheet',
    totalFrames: 96,
    usage: 'Player and enemy characters',
    basePrompt: 'A pixel art spritesheet grid: exactly 12 columns x 8 rows, each cell exactly 16x16 pixels. Total image must be exactly 192x128 pixels. Layout: Row 1 (columns 0-2): player character facing down, 3 walk frames. Row 1 (columns 3-5): player facing left, 3 walk frames. Row 1 (columns 6-8): player facing right, 3 walk frames. Row 1 (columns 9-11): player facing up, 3 walk frames. Row 2: skeleton enemy (4 directions, 3 frames each). Row 3: slime enemy (4 directions, 3 frames each). Row 4: bat enemy (4 directions, 3 frames each). Row 5: ghost enemy (4 directions, 3 frames each). Row 6: spider enemy (4 directions, 3 frames each). Each character must be clearly visible, properly aligned in its 16x16 cell, with no overlapping.',
    themePrompt: (theme) => `A ${theme}-themed pixel art spritesheet grid: exactly 12 columns x 8 rows, each cell exactly 16x16 pixels. Total image must be exactly 192x128 pixels. Layout: Row 1 (columns 0-2): ${theme} player character facing down, 3 walk frames. Row 1 (columns 3-5): player facing left, 3 walk frames. Row 1 (columns 6-8): player facing right, 3 walk frames. Row 1 (columns 9-11): player facing up, 3 walk frames. Row 2: ${theme} skeleton enemy (4 directions, 3 frames each). Row 3: ${theme} slime enemy (4 directions, 3 frames each). Row 4: ${theme} bat enemy (4 directions, 3 frames each). Row 5: ${theme} ghost enemy (4 directions, 3 frames each). Row 6: ${theme} spider enemy (4 directions, 3 frames each). Each character must be clearly visible, properly aligned in its 16x16 cell, with no overlapping. All characters should match the ${theme} theme.`,
    style: 'pixel art, 16-bit style, game sprite, sharp edges, no anti-aliasing',
    scale: 2
  },
  dragons: {
    file: 'dragons.png',
    dimensions: { width: 384, height: 256 },
    frameSize: { width: 32, height: 32 },
    type: 'spritesheet',
    totalFrames: 96,
    usage: 'Boss enemy with color variants',
    basePrompt: 'A spritesheet grid of boss enemy sprites: 12 columns x 8 rows, each frame 32x32 pixels. Show the boss enemy in different poses and 8 color variants.',
    themePrompt: (theme) => `A spritesheet grid of ${theme}-themed boss enemy sprites: 12 columns x 8 rows, each frame 32x32 pixels. Show the boss enemy in different poses and 8 color variants. The boss should match the ${theme} theme.`,
    style: 'pixel art, 16-bit style, game sprite, sharp edges, no anti-aliasing',
    scale: 2
  },
  tiles: {
    file: 'tiles.png',
    dimensions: { width: 128, height: 240 },
    frameSize: { width: 16, height: 16 },
    type: 'spritesheet',
    totalFrames: 120,
    usage: 'Background tiles and environment obstacles',
    basePrompt: 'A spritesheet grid of tile sprites: 8 columns x 15 rows, each frame 16x16 pixels. Include background tiles, trees, shrubs, obstacles, and decorative elements.',
    themePrompt: (theme) => `A spritesheet grid of ${theme}-themed tile sprites: 8 columns x 15 rows, each frame 16x16 pixels. Include background tiles, trees, shrubs, obstacles, and decorative elements. All tiles should match the ${theme} theme.`,
    style: 'pixel art, 16-bit style, game sprite, sharp edges, no anti-aliasing',
    scale: 2,
    useBackup: true // Always use backup tiles, don't generate
  },
  things: {
    file: 'things.png',
    dimensions: { width: 192, height: 128 },
    frameSize: { width: 16, height: 16 },
    type: 'spritesheet',
    totalFrames: 96,
    usage: 'Collectable items (chests)',
    basePrompt: 'A spritesheet grid of collectable item sprites: 12 columns x 8 rows, each frame 16x16 pixels. Include chests in different states (closed, opening, open) and other collectable items.',
    themePrompt: (theme) => `A spritesheet grid of ${theme}-themed collectable item sprites: 12 columns x 8 rows, each frame 16x16 pixels. Include chests in different states (closed, opening, open) and other collectable items. All items should match the ${theme} theme.`,
    style: 'pixel art, 16-bit style, game sprite, sharp edges, no anti-aliasing',
    scale: 2
  },
  dead: {
    file: 'dead.png',
    dimensions: { width: 48, height: 64 },
    frameSize: { width: 16, height: 16 },
    type: 'spritesheet',
    totalFrames: 12,
    usage: 'Corpse sprites when entities die',
    basePrompt: 'A spritesheet grid of corpse sprites: 3 columns x 4 rows, each frame 16x16 pixels. Show dead/corpse versions of different characters and enemies.',
    themePrompt: (theme) => `A spritesheet grid of ${theme}-themed corpse sprites: 3 columns x 4 rows, each frame 16x16 pixels. Show dead/corpse versions of different characters and enemies. All corpses should match the ${theme} theme.`,
    style: 'pixel art, 16-bit style, game sprite, sharp edges, no anti-aliasing',
    scale: 2
  },
  flame: {
    file: 'flame.png',
    dimensions: { width: 32, height: 32 },
    frameSize: { width: 32, height: 32 },
    type: 'particle',
    usage: 'Particle effect for explosions',
    basePrompt: 'A single flame/fire particle sprite, 32x32 pixels, pixel art style',
    themePrompt: (theme) => `A single ${theme}-themed particle sprite, 32x32 pixels, pixel art style. The particle should match the ${theme} theme.`,
    style: 'pixel art, 16-bit style, game sprite, sharp edges, no anti-aliasing',
    scale: 1
  },
  'level-particle': {
    file: 'level-particle.png',
    dimensions: { width: 2, height: 2 },
    frameSize: { width: 2, height: 2 },
    type: 'particle',
    usage: 'Particle effect for level-up',
    basePrompt: 'A tiny particle sprite, 2x2 pixels, bright and colorful, pixel art style',
    themePrompt: (theme) => `A tiny ${theme}-themed particle sprite, 2x2 pixels, bright and colorful, pixel art style. The particle should match the ${theme} theme.`,
    style: 'pixel art, 16-bit style, game sprite, sharp edges, no anti-aliasing',
    scale: 1
  },
  'spell-particle': {
    file: 'spell-particle.png',
    dimensions: { width: 2, height: 2 },
    frameSize: { width: 2, height: 2 },
    type: 'particle',
    usage: 'Particle effect for spell impact',
    basePrompt: 'A tiny magical particle sprite, 2x2 pixels, bright and colorful, pixel art style',
    themePrompt: (theme) => `A tiny ${theme}-themed magical particle sprite, 2x2 pixels, bright and colorful, pixel art style. The particle should match the ${theme} theme.`,
    style: 'pixel art, 16-bit style, game sprite, sharp edges, no anti-aliasing',
    scale: 1
  },
  play: {
    file: 'play.png',
    dimensions: { width: 102, height: 24 },
    frameSize: { width: 102, height: 24 },
    type: 'ui',
    usage: 'Main menu play button',
    basePrompt: 'A pixel art play button, 102x24 pixels, with the word "PLAY" clearly visible, game UI style, button-like appearance with border or background',
    themePrompt: (theme) => `A ${theme}-themed pixel art play button, 102x24 pixels, with the word "PLAY" clearly visible, game UI style, button-like appearance with border or background. The button should match the ${theme} theme.`,
    style: 'pixel art, 16-bit style, game UI, sharp edges, no anti-aliasing',
    scale: 1
  }
};

/**
 * Get asset config by key
 */
export function getAssetConfig(assetKey) {
  return ASSET_CONFIG[assetKey];
}

/**
 * Get all asset keys
 */
export function getAllAssetKeys() {
  return Object.keys(ASSET_CONFIG);
}

/**
 * Build generation prompt for an asset with optional theme
 */
export function buildAssetPrompt(assetKey, theme = null, customEdit = null) {
  const config = ASSET_CONFIG[assetKey];
  if (!config) {
    throw new Error(`Unknown asset: ${assetKey}`);
  }

  let prompt;
  if (customEdit) {
    // Custom edit prompt
    prompt = customEdit;
  } else if (theme) {
    // Theme-based prompt
    prompt = typeof config.themePrompt === 'function'
      ? config.themePrompt(theme)
      : config.basePrompt;
  } else {
    // Base prompt
    prompt = config.basePrompt;
  }

  // Add strict requirements
  const BRIGHT_PINK = '#FF00FF';
  const strictRequirements = `
CRITICAL REQUIREMENTS - MUST BE EXACTLY ${config.dimensions.width}x${config.dimensions.height} PIXELS:
- Output image MUST be exactly ${config.dimensions.width} pixels wide and ${config.dimensions.height} pixels tall - no exceptions
- Background MUST be pure bright pink/magenta color - hex code #FF00FF, RGB values exactly (255, 0, 255)
- The background color MUST be RGB(255, 0, 255) - red=255, green=0, blue=255 - no variations
- Every single background pixel must be exactly this color: #FF00FF or RGB(255,0,255)
- The entire background area must be solid bright pink with NO other colors
- ${config.style}
- Use limited color palette (2-4 colors max) for the sprite itself
- Sprite colors: Use ONLY colors appropriate for the theme - ABSOLUTELY NO PINK, MAGENTA, OR #FF00FF IN THE SPRITE
- No gradients, only solid colors
- Must be usable as a game asset
- The final image dimensions must be ${config.dimensions.width}x${config.dimensions.height} pixels exactly
- CRITICAL: Background must be pure bright pink RGB(255,0,255) - this exact color will be removed automatically`;

  return `${prompt}${strictRequirements}`;
}

