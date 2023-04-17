export function retryPromise<T, A>(
  promiseFunc: (args: A) => Promise<T>,
  args: A,
  retryCount: number = 2
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const tryOperation = () => {
      promiseFunc(args)
        .then(resolve)
        .catch((error) => {
          if (retryCount <= 0) {
            reject(error);
            return;
          }
          retryCount--;
          setTimeout(tryOperation, 1000);
        });
    };
    tryOperation();
  });
}
