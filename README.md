# GameWeaver

An all-in-one, browser-only creation tool that transforms a text prompt into a playable 2D game.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The app will be available at `http://localhost:3000`

## Project Structure

### React App (Main UI)
- `src/App.jsx` - Main app component with phase routing
- `src/components/Phase1Prompt.jsx` - Prompt input phase
- `src/components/Phase2AssetStudio.jsx` - Asset generation and editing phase
- `src/components/Phase3LogicStudio.jsx` - Game logic/PRD editing phase
- `src/components/Phase4GamePreview.jsx` - Game preview with iframe

### Game Template (Phaser.js)
- `game.html` - Standalone game HTML for iframe embedding
- `js/game-main.js` - Game initialization
- `js/Boot.js` - Boot state
- `js/Preloader.js` - Asset preloading
- `js/MainMenu.js` - Main menu state
- `js/Game.js` - Main game state (all game logic)

## Features

### Phase 1: The Prompt
- User inputs their game idea
- Single text area for game description

### Phase 2: Asset Studio
- Grid view of all game assets
- Click any asset to open chat modal for iterative editing
- Hardcoded assets (ready for AI generation integration)

### Phase 3: Logic Studio
- Split-screen view with chat interface and JSON PRD editor
- Edit game rules, physics, and interactions
- Live updates to game parameters

### Phase 4: Game Preview
- Generated game rendered in iframe
- Full-screen mode by default
- Back to editor functionality

## Game Controls

- **WASD** - Move
- **Left Mouse Button** - Hold to attack
- **Spacebar** - Cast spell

## Development

- React + Vite for the UI
- Phaser.js for the game engine
- All assets are in `assets/` directory
- Game files use generic `Game` namespace

## Credits

### Tools
- Phaser: The fun, fast and free HTML5 Game Framework - http://phaser.io/

### Assets
- Sharm - Tiny 16: Basic - http://opengameart.org/content/tiny-16-basic
- Kspriter95 - Kirby FC Sword Sprite
- Yoshino - Yoshino's Dragons
- Sogomn - Simple Fireball - http://opengameart.org/content/simple-fireball
- avgvsta - Generic 8-bit JRPG Soundtrack - http://opengameart.org/content/generic-8-bit-jrpg-soundtrack
- Ove - Ove's Essential Game Audio Pack Collection - http://opengameart.org/content/oves-essential-game-audio-pack-collection-160-files-updated
