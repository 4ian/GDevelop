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
  if (!ipcRenderer) throw new Error("Download to local files is not supported.");

  // $FlowFixMe - not sure why Flow does not understand this.
  const { results } = await PromisePool.withConcurrency(20)
    .for(urlContainers)
    .process(
      async (urlContainer): Promise<ItemResult<Item>> => {
        const { url, filePath } = urlContainer;

        try {
          await retryIfFailed({ times: 2 }, async () => {
            await ipcRenderer.invoke('local-file-download', url, filePath);
          });

          const result: ItemResult<Item> = {
            item: urlContainer,
          };
          return result;
        } catch (error) {
          firstError = error;
          const result: ItemResult<Item> = {
            item: urlContainer,
            error,
          };
          return result;
        } finally {
          onProgress(count++, urlContainers.length);
        }
      }
    );

  if (throwIfAnyError && firstError) {
    throw firstError;
  }

  return results;
};
