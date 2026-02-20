const RUNNING_TASKS: any = {};

export function runOnce(
  id: string,
  fn: () => Promise<any>,
): () => Promise<any> {
  RUNNING_TASKS[id] = RUNNING_TASKS[id] || {
    hasRun: false,
    result: null,
    isRunning: false,
  };

  async function runOnceWrapper() {
    const task = RUNNING_TASKS[id];
    const { hasRun } = task;

    if (hasRun) {
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!task.isRunning) {
            clearInterval(checkInterval);
            resolve(null);
          }
        }, 100);
      });
      return task.result;
    }
    task.hasRun = true;
    task.isRunning = true;
    task.result = await fn();
    task.isRunning = false;
    return task.result;
  }

  return runOnceWrapper;
}

export function runWithTimeout<T>(
  fn: () => Promise<T>,
  timeout: number,
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeout),
    ),
  ]);
}

export function fetchWithTimeout(
  url: string,
  timeout: number,
  options?: RequestInit,
): Promise<Response> {
  return runWithTimeout(() => fetch(url, options), timeout);
}
