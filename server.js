/**
 * Simple Express server to save generated assets to filesystem
 * This allows the React app to save regenerated assets to assets/images/
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS for React app
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve assets folder statically
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Save asset endpoint
app.post('/api/save-asset', async (req, res) => {
  try {
    const { filename, data } = req.body;

    if (!filename || !data) {
      return res.status(400).json({ error: 'Filename and data are required' });
    }

    // Validate filename (prevent directory traversal)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    // Ensure assets/images directory exists
    const assetsDir = path.join(__dirname, 'assets', 'images');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Convert base64 to buffer
    const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Save file
    const filePath = path.join(assetsDir, filename);
    fs.writeFileSync(filePath, buffer);

    console.log(`✓ Saved asset: ${filename} (${buffer.length} bytes)`);

    res.json({ success: true, path: filePath, size: buffer.length });
  } catch (error) {
    console.error('Error saving asset:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save multiple assets endpoint
app.post('/api/save-assets', async (req, res) => {
  try {
    const { assets } = req.body;

    if (!Array.isArray(assets)) {
      return res.status(400).json({ error: 'Assets must be an array' });
    }

    const results = [];
    const assetsDir = path.join(__dirname, 'assets', 'images');

    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    for (const asset of assets) {
      const { filename, data } = asset;

      if (!filename || !data) {
        results.push({ filename, error: 'Missing filename or data' });
        continue;
      }

      // Validate filename
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        results.push({ filename, error: 'Invalid filename' });
        continue;
      }

      try {
        const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const filePath = path.join(assetsDir, filename);
        fs.writeFileSync(filePath, buffer);
        results.push({ filename, success: true, size: buffer.length });
        console.log(`✓ Saved asset: ${filename} (${buffer.length} bytes)`);
      } catch (error) {
        results.push({ filename, error: error.message });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error saving assets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Asset server running on http://localhost:${PORT}`);
  console.log(`Assets directory: ${path.join(__dirname, 'assets', 'images')}`);
});

