import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Gemini AI Background Removal & Transparent PNG Conversion Endpoint
app.post('/api/remove-bg', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body || {};
    if (!imageBase64) {
      res.status(400).json({ ok: false, error: 'No image provided' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    // Standard Google Gemini API keys start with 'AIzaSy'
    const isConfiguredKey = Boolean(apiKey && apiKey.startsWith('AIzaSy') && apiKey.length > 20);

    if (!isConfiguredKey) {
      // Gemini API key is not yet set or is a placeholder; inform frontend to use smart local cutout immediately
      res.status(200).json({
        ok: false,
        needsKey: true,
        message: 'GEMINI_API_KEY is not yet configured. Ready for deployment when key is added.',
      });
      return;
    }

    // Initialize Google Gemini API using environment variable
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    // Call Gemini Image model with 6-second timeout to avoid any freezing or long delays
    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text:
              'Remove the background of this image completely. Isolate the main foreground subject on a completely transparent PNG background, and return only the cutout subject as a transparent PNG.',
          },
        ],
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini request timeout after 6s')), 6000)
    );

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

    let pngBase64: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        pngBase64 = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!pngBase64) {
      res.status(200).json({
        ok: false,
        fallbackNeeded: true,
        error: 'Gemini did not return an image part. Using high-precision neural fallback.',
      });
      return;
    }

    res.json({
      ok: true,
      engine: 'Google Gemini AI',
      pngBase64,
    });
  } catch (err: any) {
    console.warn('[Gemini AI Notice]:', err?.message || err);
    res.status(200).json({
      ok: false,
      fallbackNeeded: true,
      error: err?.message || 'Gemini processing error',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const hasValidKey = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIzaSy')
  );
  res.json({
    status: 'ok',
    engine: 'Google Gemini AI',
    hasGeminiKey: hasValidKey,
    time: new Date().toISOString(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
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


