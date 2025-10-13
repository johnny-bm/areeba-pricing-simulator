// Storage infrastructure barrel export
// File storage and cloud storage integrations
export interface IStorageClient {
  upload(file: File, path: string): Promise<string>;
  download(path: string): Promise<Blob>;
  delete(path: string): Promise<void>;
}
