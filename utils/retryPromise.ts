export function retryPromise<T, A>(
  promiseFunc: (arg: A) => Promise<T>,
  arg: A,
  retryCount: number = 2
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const tryOperation = () => {
      promiseFunc(arg)
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
