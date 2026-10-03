import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function optimizeOnnxPlugin(): Plugin {
  return {
    name: 'optimize-onnx-vite-ignore',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('onnxruntime-web') && code.includes('webpackIgnore')) {
        return {
          code: code.replace(
            /\/\*webpackIgnore:true\*\//g,
            '/* @vite-ignore */ /*webpackIgnore:true*/'
          ),
          map: null,
        };
      }
      return null;
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [optimizeOnnxPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
        'onnxruntime-web': path.resolve(
          import.meta.dirname,
          'node_modules/onnxruntime-web/dist/ort.wasm.min.mjs'
        ),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
