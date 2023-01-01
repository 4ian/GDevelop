// @flow
import { checkIfCredentialsRequired } from './CrossOrigin';
import PromisePool from '@supercharge/promise-pool';

const addSearchParameterToUrl = (
  url: string,
  urlEncodedParameterName: string,
  urlEncodedValue: string
) => {
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    // blob/data protocol does not support search parameters, which are useless anyway.
    return url;
  }

  const separator = url.indexOf('?') === -1 ? '?' : '&';
  return url + separator + urlEncodedParameterName + '=' + urlEncodedValue;
};

type Input<Item> = {|
  urlContainers: Array<Item>,
  onProgress: (count: number, total: number) => void,
|};

export type ItemResult<Item> = {|
  item: Item,
  blob?: Blob,
  error?: Error,
|};

export const downloadUrlsToBlobs = async <Item: { url: string }>({
  urlContainers,
  onProgress,
}: Input<Item>): Promise<Array<ItemResult<Item>>> => {
  let count = 0;

  const { results } = await PromisePool.withConcurrency(20)
    .for(urlContainers)
    .process<ItemResult<Item>>(async urlContainer => {
      const { url } = urlContainer;

      try {
        // To avoid strange/hard to understand CORS issues, we add a dummy parameter.
        // By doing so, we force browser to consider this URL as different than the one traditionally
        // used to render the resource in the editor (usually as an `<img>` or as a background image).
        // If we don't add this distinct parameter, it can happen that browsers fail to load the image
        // as it's already in the **browser cache** but with slightly different request parameters -
        // making the CORS checks fail (even if it's coming from the browser cache).
        //
        // It's happening sometimes (according to loading order probably) in Chrome and (more often)
        // in Safari. It might be linked to Amazon S3 + CloudFront that "doesn't support the Vary: Origin header".
        // To be safe, we entirely avoid the issue with this parameter, making the browsers consider
        // the resources for use in Pixi.js and for the rest of the editor as entirely separate.
        //
        // See:
        // - https://stackoverflow.com/questions/26140487/cross-origin-amazon-s3-not-working-using-chrome
        // - https://stackoverflow.com/questions/20253472/cors-problems-with-amazon-s3-on-the-latest-chomium-and-google-canary
        // - https://stackoverflow.com/a/20299333
        //
        // Search for "cors-cache-workaround" in the codebase for the same workarounds.
        const urlWithParameters = addSearchParameterToUrl(
          url,
          'gdUsage',
          'export'
        );

        const response = await fetch(urlWithParameters, {
          // Include credentials so that resources on GDevelop cloud are properly fetched
          // with the cookie obtained for the project.
          credentials: checkIfCredentialsRequired(urlWithParameters)
            ? // Any resource stored on the GDevelop Cloud buckets needs the "credentials" of the user,
              // i.e: its gdevelop.io cookie, to be passed.
              'include'
            : // For other resources, use "same-origin" as done by default by fetch.
              'same-origin',
        });

        if (!response.ok) {
          throw new Error(
            `Error while downloading "${urlWithParameters}" (status: ${
              response.status
            })`
          );
        }

        const blob = await response.blob();
        const result: ItemResult<Item> = {
          item: urlContainer,
          blob,
        };
        return result;
      } catch (error) {
        const result: ItemResult<Item> = {
          item: urlContainer,
          error,
        };
        return result;
      } finally {
        onProgress(count++, urlContainers.length);
      }
    });

  return results;
};

export const convertBlobToFiles = <
  Item: { resource: gdResource, filename: string }
>(
  itemResults: Array<ItemResult<Item>>,
  onError: (resourceName: string, error: Error) => void
) =>
  itemResults
    .map(({ item, blob, error }) => {
      if (error || !blob) {
        onError(
          item.resource.getName(),
          error || new Error('Unknown error during download')
        );
        return null;
      }

      return {
        resource: item.resource,
        file: new File([blob], item.filename, { type: blob.type }),
      };
    })
    .filter(Boolean);

export function convertBlobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    // $FlowFixMe - it's guaranted for reader.result to be a string.
    reader.onload = _e => resolve(reader.result);
    reader.onerror = _e => reject(reader.error);
    reader.onabort = _e => reject(new Error('Read aborted'));
    reader.readAsDataURL(blob);
  });
}

export function convertDataURLtoBlob(dataUrl: string): ?Blob {
  const arr = dataUrl.split(',');
  if (arr.length < 2) return null;

  const mimeMatchResults = arr[0].match(/:(.*?);/);
  const mime = mimeMatchResults
    ? mimeMatchResults[1]
    : 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
