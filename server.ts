import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { removeBackground } from '@imgly/background-removal-node';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));

// Serve @imgly background removal model and wasm data locally (Zero API keys, 100% on-device/local)
app.use(
  '/imgly-data',
  express.static(path.resolve(__dirname, 'node_modules/@imgly/background-removal-data/dist'))
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    engine: '@imgly/background-removal',
    apiKeysUsed: false,
    time: new Date().toISOString(),
  });
});

// @imgly/background-removal Node engine (No API Keys needed)
app.post('/api/remove-bg', async (req, res) => {
  let tempFilePath: string | null = null;
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    console.log('[imgly] Processing background removal via @imgly...');
    let inputSource: any = image;

    // Handle base64 data: URI by writing to temp file for Node
    if (typeof image === 'string' && image.startsWith('data:')) {
      const commaIdx = image.indexOf(',');
      if (commaIdx !== -1) {
        const base64Content = image.slice(commaIdx + 1);
        const buf = Buffer.from(base64Content, 'base64');
        const ext = image.includes('image/png') ? 'png' : 'jpg';
        tempFilePath = path.join('/tmp', `bg_in_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`);
        fs.writeFileSync(tempFilePath, buf);
        inputSource = tempFilePath;
      }
    }

    const resultBlob = await removeBackground(inputSource);
    const arrayBuffer = await resultBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const cutoutUrl = `data:image/png;base64,${base64Data}`;

    console.log('[imgly] Background removal completed successfully without any API keys. Output size:', buffer.length);
    return res.json({
      success: true,
      cutoutUrl,
      size: buffer.length,
      method: '@imgly/background-removal',
    });
  } catch (error: any) {
    console.error('[imgly] Error in /api/remove-bg:', error);
    return res.status(500).json({
      error: error.message || 'Failed to remove background using @imgly',
    });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch {}
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`BG Remover running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
