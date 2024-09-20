export type DownloadResource = (
  url: string,
  acceptHeader: string,
) => Promise<Uint8Array>;
