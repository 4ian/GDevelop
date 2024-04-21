// @flow
import PromisePool from '@supercharge/promise-pool';
import { retryIfFailed } from './RetryIfFailed';
import optionalRequire from './OptionalRequire';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

type Input<Item> = {|
  urlContainers: Array<Item>,
  onProgress: (count: number, total: number) => void,
  throwIfAnyError: boolean,
|};

export type ItemResult<Item> = {|
  item: Item,
  error?: Error,
|};

export const downloadUrlsToLocalFiles = async <
  Item: { url: string, filePath: string }
>({
  urlContainers,
  onProgress,
  throwIfAnyError,
}: Input<Item>): Promise<Array<ItemResult<Item>>> => {
  let count = 0;
  let firstError = null;
  if (!ipcRenderer)
    throw new Error('Download to local files is not supported.');

  const { results } = await PromisePool.withConcurrency(20)
    .for(urlContainers)
    .process<ItemResult<Item>>(async urlContainer => {
      const { url, filePath } = urlContainer;

      try {
        await retryIfFailed({ times: 2 }, async () => {
          const encodedUrl = new URL(url).href; // Encode the URL to support special characters in file names.
          await ipcRenderer.invoke('local-file-download', encodedUrl, filePath);
        });

        const result: ItemResult<Item> = {
          item: urlContainer,
        };
        return result;
      } catch (error) {
        console.error(`Error while downloading file ${url}:`, error);
        firstError = error;
        const result: ItemResult<Item> = {
          item: urlContainer,
          error,
        };
        return result;
      } finally {
        onProgress(count++, urlContainers.length);
      }
    });

  if (throwIfAnyError && firstError) {
    throw firstError;
  }

  return results;
};
