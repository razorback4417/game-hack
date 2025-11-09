# Assets Analysis

Complete breakdown of all game assets including dimensions, usage, and frame information.

## Image Assets

### Spritesheets (Multi-frame assets)

#### 1. **characters.png**
- **Dimensions**: 192 × 128 pixels
- **Frame Size**: 16 × 16 pixels
- **Total Frames**: 96 frames (12 columns × 8 rows)
- **Usage**: Main character and enemy sprites
- **Frame Layout**:
  - Player character: frames 3-5 (down), 15-17 (left), 27-29 (right), 39-41 (up)
  - Skeleton enemy: frames 9-11 (down), 21-23 (left), 33-35 (right), 45-47 (up)
  - Slime enemy: frames 48-50 (down), 60-62 (left), 72-74 (right), 84-86 (up)
  - Bat enemy: frames 51-53 (down), 63-65 (left), 75-77 (right), 87-89 (up)
  - Ghost enemy: frames 54-56 (down), 66-68 (left), 78-80 (right), 90-92 (up)
  - Spider enemy: frames 57-59 (down), 69-71 (left), 81-83 (right), 93-95 (up)
- **Animation**: 3-frame walk cycles for each direction
- **Scale in Game**: 2x (rendered at 32×32 pixels)

#### 2. **dragons.png**
- **Dimensions**: 384 × 256 pixels
- **Frame Size**: 32 × 32 pixels
- **Total Frames**: 96 frames (12 columns × 8 rows)
- **Usage**: Boss enemy (Dragon) with 8 color variants
- **Color Variants** (by colorIndex):
  - 0: frames 0-2, 12-14, 24-26, 36-38 (down/left/right/up)
  - 1: frames 3-5, 15-17, 27-29, 39-41
  - 2: frames 6-8, 18-20, 30-32, 42-44
  - 3: frames 9-11, 21-23, 33-35, 45-47
  - 4: frames 57-59, 69-71, 81-83, 93-95
  - 5: frames 54-56, 66-68, 78-80, 90-92
  - 6: frames 51-53, 63-65, 75-77, 87-89
  - 7: frames 48-50, 60-62, 72-74, 84-86
- **Animation**: 3-frame walk cycles for each direction
- **Scale in Game**: 2x (rendered at 64×64 pixels)

#### 3. **tiles.png**
- **Dimensions**: 128 × 240 pixels
- **Frame Size**: 16 × 16 pixels
- **Total Frames**: 120 frames (8 columns × 15 rows)
- **Usage**: Background tiles and environment obstacles
- **Notable Frames**:
  - Frame 65: Background tile (used for world background)
  - Frame 92: Animated background tile (used in main menu)
  - Frame 38: Tree obstacle
  - Frame 20: Shrub obstacle
  - Frame 30: Pine tree obstacle
  - Frame 39: Column obstacle
  - Frame 68: Gold coin sprite
- **Usage**:
  - Background: TileSprite scaled 2x
  - Obstacles: Individual sprites with collision
- **Scale in Game**: 2x (rendered at 32×32 pixels)

#### 4. **things.png**
- **Dimensions**: 192 × 128 pixels
- **Frame Size**: 16 × 16 pixels
- **Total Frames**: 96 frames (12 columns × 8 rows)
- **Usage**: Collectable items (chests)
- **Notable Frames**:
  - Frame 6: Closed chest (idle state)
  - Frames 18, 30, 42: Chest opening animation sequence
- **Animation**: 3-frame opening animation
- **Scale in Game**: 2x (rendered at 32×32 pixels)

#### 5. **potions.png**
- **Dimensions**: 176 × 16 pixels
- **Frame Size**: 16 × 16 pixels
- **Total Frames**: 11 frames (11 columns × 1 row)
- **Usage**: Potion collectables
- **Frame Mapping**:
  - Frame 0: Health potion
  - Frame 2: Vitality potion
  - Frame 3: Strength potion
  - Frame 4: Speed potion
- **Scale in Game**: 2x (rendered at 32×32 pixels)

#### 6. **dead.png**
- **Dimensions**: 48 × 64 pixels
- **Frame Size**: 16 × 16 pixels
- **Total Frames**: 12 frames (3 columns × 4 rows)
- **Usage**: Corpse sprites when entities die
- **Frame Mapping**:
  - Frame 0: Dragon corpse
  - Frame 1: Player corpse
  - Frame 6: Skeleton corpse
  - Frame 7: Slime corpse
  - Frame 8: Bat corpse
  - Frame 9: Ghost corpse
  - Frame 10: Spider corpse
- **Scale in Game**: 2x (rendered at 32×32 pixels)
- **Lifespan**: 3000ms (3 seconds)

#### 7. **fireball.png**
- **Dimensions**: 64 × 16 pixels
- **Frame Size**: 16 × 16 pixels
- **Total Frames**: 4 frames (4 columns × 1 row)
- **Usage**: Boss attack projectile
- **Animation**: 4-frame animation loop (frames 0-3)
- **Scale in Game**: 1.5x (rendered at 24×24 pixels)

#### 8. **spell.png**
- **Dimensions**: 72 × 12 pixels
- **Frame Size**: 12 × 12 pixels
- **Total Frames**: 6 frames (6 columns × 1 row)
- **Usage**: Player spell attack projectile
- **Animation**: 6-frame animation loop (frames 0-5)
- **Scale in Game**: 1.5x (rendered at 18×18 pixels)

### Single Image Assets

#### 9. **sword.png**
- **Dimensions**: 32 × 32 pixels
- **Usage**: Player melee attack projectile
- **Scale in Game**: 1.5x (rendered at 48×48 pixels)
- **Rotation**: Rotates toward mouse cursor
- **Lifespan**: Dynamic based on attack rate

#### 10. **flame.png**
- **Dimensions**: 32 × 32 pixels
- **Usage**: Particle effect for dragon death explosion
- **Particle Count**: 100 particles
- **Animation**: Emitter effect, not animated sprite

#### 11. **level-particle.png**
- **Dimensions**: 2 × 2 pixels
- **Usage**: Particle effect for level-up celebration
- **Particle Count**: 100 particles
- **Animation**: Emitter effect, not animated sprite

#### 12. **spell-particle.png**
- **Dimensions**: 2 × 2 pixels
- **Usage**: Particle effect for spell impact
- **Particle Count**: 100 particles
- **Animation**: Emitter effect, not animated sprite

### UI Assets

#### 13. **play.png**
- **Dimensions**: 102 × 24 pixels
- **Usage**: Main menu play button
- **Scale in Game**: 1x (original size)

#### 14. **preload-bar.png**
- **Dimensions**: 256 × 8 pixels
- **Usage**: Loading progress bar
- **Scale in Game**: 1x (original size)
- **Animation**: Cropped from 0 to full width during loading

#### 15. **logo.png**
- **Dimensions**: 464 × 63 pixels
- **Usage**: Game logo (removed from template, kept for reference)
- **Status**: Not used in GameWeaver template

## Audio Assets

### Music

#### 1. **opening.ogg**
- **Format**: OGG Vorbis
- **Usage**: Main menu background music
- **Loop**: Yes
- **Status**: Used

#### 2. **overworld.ogg**
- **Format**: OGG Vorbis
- **Usage**: In-game background music
- **Loop**: Yes
- **Status**: Used

### Sound Effects

#### 3. **attack.wav**
- **Format**: WAV
- **Usage**: Player melee attack sound
- **Status**: Used

#### 4. **player.wav**
- **Format**: WAV
- **Usage**: Player taking damage sound
- **Status**: Used

#### 5. **skeleton.wav**
- **Format**: WAV
- **Usage**: Skeleton enemy taking damage sound
- **Status**: Used

#### 6. **slime.wav**
- **Format**: WAV
- **Usage**: Slime enemy taking damage sound
- **Status**: Used

#### 7. **bat.wav**
- **Format**: WAV
- **Usage**: Bat enemy taking damage sound
- **Status**: Used

#### 8. **ghost.wav**
- **Format**: WAV
- **Usage**: Ghost enemy taking damage sound
- **Status**: Used

#### 9. **spider.wav**
- **Format**: WAV
- **Usage**: Spider enemy taking damage sound
- **Status**: Used

#### 10. **dragon.wav**
- **Format**: WAV
- **Usage**: Dragon boss spawn and damage sound
- **Status**: Used

#### 11. **gold.wav**
- **Format**: WAV
- **Usage**: Collecting gold sound
- **Status**: Used

#### 12. **potion.ogg**
- **Format**: OGG Vorbis
- **Usage**: Collecting potion sound
- **Status**: Used

#### 13. **level.ogg**
- **Format**: OGG Vorbis
- **Usage**: Level up sound
- **Status**: Used

#### 14. **fireball.wav**
- **Format**: WAV
- **Usage**: Fireball spell sound (player and boss)
- **Status**: Used

## Asset Summary

### By Category

**Spritesheets (8 total)**:
- characters.png (192×128, 16×16 frames)
- dragons.png (384×256, 32×32 frames)
- tiles.png (128×240, 16×16 frames)
- things.png (192×128, 16×16 frames)
- potions.png (176×16, 16×16 frames)
- dead.png (48×64, 16×16 frames)
- fireball.png (64×16, 16×16 frames)
- spell.png (72×12, 12×12 frames)

**Single Images (2 total)**:
- sword.png (32×32)
- flame.png (32×32)

**Particle Effects (2 total)**:
- level-particle.png (2×2)
- spell-particle.png (2×2)

**UI Elements (2 total)**:
- play.png (102×24)
- preload-bar.png (256×8)

**Audio (14 total)**:
- 2 music tracks (OGG)
- 12 sound effects (WAV/OGG)

### Frame Calculation Notes

- **characters.png**: 192÷16 = 12 columns, 128÷16 = 8 rows = 96 frames
- **dragons.png**: 384÷32 = 12 columns, 256÷32 = 8 rows = 96 frames
- **tiles.png**: 128÷16 = 8 columns, 240÷16 = 15 rows = 120 frames
- **things.png**: 192÷16 = 12 columns, 128÷16 = 8 rows = 96 frames
- **potions.png**: 176÷16 = 11 columns, 16÷16 = 1 row = 11 frames
- **dead.png**: 48÷16 = 3 columns, 64÷16 = 4 rows = 12 frames
- **fireball.png**: 64÷16 = 4 columns, 16÷16 = 1 row = 4 frames
- **spell.png**: 72÷12 = 6 columns, 12÷12 = 1 row = 6 frames

### Usage Patterns

1. **Character Sprites**: All use 3-frame walk cycles (idle frame + 2 animation frames)
2. **Directional Animations**: 4 directions (down, left, right, up) for all characters
3. **Frame Indexing**: 0-based, left-to-right, top-to-bottom
4. **Scaling**: Most sprites scaled 2x in game (16px → 32px, 32px → 64px)
5. **Animation Speed**: 10 FPS for all character animations

