export class FunctionQueue {
  private queue: [func: () => void, immediate: boolean][] = [];
  private maxTimeGap: number;
  private timer: NodeJS.Timeout | undefined = undefined;
  private isRunning = false;

  constructor(maxTimeGap: number) {
    this.maxTimeGap = maxTimeGap;
  }

  add(func: () => void, immediate = false) {
    this.queue.push([func, immediate]);
    if (!this.isRunning) {
      this.run();
    }
  }

  clear() {
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private run() {
    if (this.queue.length === 0) {
      this.isRunning = false;
      return;
    }

    this.isRunning = true;

    const [func, immediate] = this.queue.shift()!;
    const gap = immediate ? 0 : Math.random() * this.maxTimeGap;

    this.timer = setTimeout(() => {
      func();
      this.run();
    }, gap);
  }
}
