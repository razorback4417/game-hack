# GameWeaver

An all-in-one, browser-only creation tool that transforms a text prompt into a playable 2D game.

## Project Structure

This project is a GameWeaver template with the following structure:

### React App (Main UI)
- `src/App.jsx` - Main app component with phase routing
- `src/components/Phase1Prompt.jsx` - Prompt input phase
- `src/components/Phase2AssetStudio.jsx` - Asset generation and editing phase
- `src/components/Phase3LogicStudio.jsx` - Game logic/PRD editing phase
- `src/components/Phase4GamePreview.jsx` - Game preview with iframe

### Game Template (Phaser.js)
- `game.html` - Standalone game HTML for iframe embedding
- `js/game-main.js` - Game initialization (generic namespace)
- `js/Boot.js` - Boot state
- `js/Preloader.js` - Asset preloading
- `js/MainMenu.js` - Main menu state
- `js/Game.js` - Main game state (all game logic)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The app will be available at `http://localhost:3000`

## Features

### Phase 1: The Prompt
- User inputs their game idea
- Single text area for game description

### Phase 2: Asset Studio
- Grid view of all game assets
- Click any asset to open chat modal for iterative editing
- Hardcoded assets from the original game (ready for AI generation integration)

### Phase 3: Logic Studio
- Split-screen view with chat interface and JSON PRD editor
- Edit game rules, physics, and interactions
- Live updates to game parameters

### Phase 4: Game Preview
- Generated game rendered in iframe
- Full-screen mode support
- Back to editor functionality

## Game Template

The game template uses:
- **Namespace**: `Game` (generic, no branding)
- **Player Name**: "Hero"
- **All game logic preserved**: Combat, enemies, bosses, collectables, progression

## Next Steps

To make this fully functional:
1. Integrate in-browser AI for asset generation (Phase 2)
2. Integrate LLM for PRD generation and updates (Phase 3)
3. Integrate LLM for JSON-to-Phaser compilation (Phase 4)
4. Connect PRD values to actual game parameters

## Development

- React + Vite for the UI
- Phaser.js for the game engine
- All assets are in `assets/` directory
- Game files use generic `Game` namespace

