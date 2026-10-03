import * as ort from 'onnxruntime-web';

const JSDELIVR_WASM_CDN = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/';
const CDN_MODEL_URL = 'https://huggingface.co/tomjackson2023/rembg/resolve/main/u2netp.onnx';

let cachedSession: ort.InferenceSession | null = null;
let sessionInitPromise: Promise<ort.InferenceSession> | null = null;

async function fetchModelBuffer(localModelUrl: string): Promise<ArrayBuffer> {
  const urls = [localModelUrl, CDN_MODEL_URL];

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'force-cache' });
      if (!response.ok) continue;

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) continue;

      const buf = await response.arrayBuffer();
      if (buf.byteLength > 100000) {
        return buf;
      }
    } catch (e) {
      // Try next URL
    }
  }

  throw new Error('Could not load AI segmentation model');
}

async function getOrCreateWorkerSession(
  localModelUrl: string,
  localWasmDirUrl: string
): Promise<ort.InferenceSession> {
  if (cachedSession) return cachedSession;
  if (sessionInitPromise) return sessionInitPromise;

  sessionInitPromise = (async () => {
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.proxy = false;
    ort.env.wasm.wasmPaths = JSDELIVR_WASM_CDN;

    const modelBuffer = await fetchModelBuffer(localModelUrl);

    const sessionOptions: ort.InferenceSession.SessionOptions = {
      executionProviders: ['wasm'],
      enableCpuMemArena: false,
      enableMemPattern: false,
      graphOptimizationLevel: 'all',
    };

    try {
      cachedSession = await ort.InferenceSession.create(modelBuffer, sessionOptions);
      return cachedSession;
    } catch (firstErr) {
      ort.env.wasm.wasmPaths = localWasmDirUrl;
      cachedSession = await ort.InferenceSession.create(modelBuffer, sessionOptions);
      return cachedSession;
    }
  })().catch((err) => {
    sessionInitPromise = null;
    throw err;
  });

  return sessionInitPromise;
}

self.onmessage = async (event: MessageEvent) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'preload') {
    getOrCreateWorkerSession(data.localModelUrl, data.localWasmDirUrl).catch(() => {});
    return;
  }

  if (data.type === 'infer') {
    const { id, float32Buffer, localModelUrl, localWasmDirUrl } = data;
    try {
      const session = await getOrCreateWorkerSession(localModelUrl, localWasmDirUrl);
      const float32Data = new Float32Array(float32Buffer);
      const inputTensor = new ort.Tensor('float32', float32Data, [1, 3, 320, 320]);
      const inputName = session.inputNames[0] || 'input.1';
      const outputMap = await session.run({ [inputName]: inputTensor });
      const firstOutputName = session.outputNames[0];
      const maskTensor = outputMap[firstOutputName];
      const maskCopy = new Float32Array(maskTensor.data as Float32Array);

      (self as unknown as Worker).postMessage(
        {
          type: 'result',
          id,
          maskBuffer: maskCopy.buffer,
        },
        [maskCopy.buffer]
      );
    } catch (err: any) {
      (self as unknown as Worker).postMessage({
        type: 'error',
        id,
        message: err?.message || String(err),
      });
    }
  }
};
