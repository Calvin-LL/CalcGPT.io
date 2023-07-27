const TOTAL_SIZE = 499257978; // the total size of the file

export interface DownloadedSizeChangeListener {
  (downloadedSize: number, fraction: number): void;
}

class DownloadedSize {
  private downloadedSize: number = 0;
  private downloadSizeChangeListeners: DownloadedSizeChangeListener[] = [];

  constructor() {}

  public addDownloadSizeChangeListener(listener: DownloadedSizeChangeListener) {
    this.downloadSizeChangeListeners.push(listener);
  }

  public removeDownloadSizeChangeListener(
    listener: DownloadedSizeChangeListener,
  ) {
    this.downloadSizeChangeListeners = this.downloadSizeChangeListeners.filter(
      (l) => l !== listener,
    );
  }

  public get(): number {
    return this.downloadedSize;
  }

  public set(value: number) {
    this.downloadedSize = value;
    this.downloadSizeChangeListeners.forEach((listener) =>
      listener(value, value / TOTAL_SIZE),
    );
  }

  public add(value: number) {
    this.set(this.downloadedSize + value);
  }
}

export const downloadedSize = new DownloadedSize();
