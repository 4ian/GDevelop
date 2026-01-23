//@flow
import { delay } from './Delay';

type Configuration = {|
  times: number,
  backoff?: { initialDelay: number, factor?: number },
|};

export const retryIfFailed = async <T>(
  { times, backoff }: Configuration,
  fn: () => Promise<T>
): Promise<T> => {
  let tries = 0;
  let latestError = null;
  const useBackoff = !!backoff;
  let delayTime = (backoff && backoff.initialDelay) || 0;
  const factor = (backoff && backoff.factor) || 2;

  while (tries < times) {
    tries++;
    latestError = null;
    try {
      const latestReturnValue = await fn();
      return latestReturnValue;
    } catch (error) {
      latestError = error;
      if (tries < times && useBackoff) {
        await delay(delayTime);
        delayTime *= factor;
      }
    }
  }

  throw latestError;
};
