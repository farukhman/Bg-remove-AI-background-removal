/// <reference types="vite/client" />

declare module 'onnxruntime-web' {
  export const env: any;
  export interface InferenceSession {
    inputNames: readonly string[];
    outputNames: readonly string[];
    run(feeds: Record<string, any>, options?: any): Promise<Record<string, any>>;
  }
  export const InferenceSession: {
    create(buffer: ArrayBuffer | Uint8Array, options?: any): Promise<InferenceSession>;
    new (): InferenceSession;
  };
  export namespace InferenceSession {
    export type SessionOptions = any;
  }
  export class Tensor {
    constructor(type: string, data: any, dims?: readonly number[]);
    data: any;
  }
  const ort: any;
  export default ort;
}
