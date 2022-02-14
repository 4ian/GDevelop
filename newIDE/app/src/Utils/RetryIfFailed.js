//@flow
type Configuration = {| times: number |};

export const retryIfFailed = async <T>(
  { times }: Configuration,
  fn: () => Promise<T>
): Promise<T> => {
  let tries = 0;
  let latestError = null;
  while (tries < times) {
    tries++;
    latestError = null;
    try {
      const latestReturnValue = await fn();
      return latestReturnValue;
    } catch (error) {
      latestError = error;
    }
  }

  throw latestError;
};
