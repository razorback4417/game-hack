# Asset Server Setup

The asset generation system requires a simple Express server to save generated assets to the filesystem.

## Quick Start

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Start the asset server** (in a separate terminal):
   ```bash
   npm run dev:server
   ```

3. **Start the React app** (in another terminal):
   ```bash
   npm run dev
   ```

   Or run both together:
   ```bash
   npm run dev:all
   ```

## What It Does

- The asset server runs on `http://localhost:3001`
- It provides API endpoints to save generated assets to `assets/images/`
- When you regenerate an asset in the UI, it automatically saves to disk
- The game will use the saved assets from `assets/images/` folder

## API Endpoints

- `POST /api/save-asset` - Save a single asset
- `POST /api/save-assets` - Save multiple assets at once
- `GET /api/health` - Health check

## Troubleshooting

If assets aren't saving:
1. Make sure the server is running (`npm run dev:server`)
2. Check the browser console for errors
3. Verify the server is accessible at `http://localhost:3001/api/health`

The server will automatically create the `assets/images/` directory if it doesn't exist.

