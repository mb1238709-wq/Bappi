export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  base64Data: string | null; // Raw base64 without prefix
  mimeType: string;
}

export interface GeneratedImage {
  url: string;
  timestamp: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}