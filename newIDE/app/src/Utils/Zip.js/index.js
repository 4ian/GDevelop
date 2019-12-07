// @flow
import { loadScript } from '../LoadScript';

const PUBLIC_URL: string = process.env.PUBLIC_URL || '';
const ZIPJS_EXTERNAL_PATH = '/external/zip.js/WebContent';
const ZLIBASM_EXTERNAL_PATH = '/external/zlib-asm';

let zipJsLoaded = false;
let zipJsLoadingPromise: ?Promise<ZipJs> = null;

/**
 * Initialize Zip.js, resolving with the instance of it.
 * Promise will be rejected if there is an error while loading Zip.js
 * (call initializeZipJs again to retry).
 */
export const initializeZipJs = (): Promise<ZipJs> => {
  if (zipJsLoaded) {
    const zip: ZipJs = global.zip;
    return Promise.resolve(zip);
  }

  if (zipJsLoadingPromise) {
    return zipJsLoadingPromise;
  }

  zipJsLoadingPromise = loadScript(
    PUBLIC_URL + ZIPJS_EXTERNAL_PATH + '/zip.js'
  ).then(() => {
    const zip: ?ZipJs = global.zip;
    if (!zip) {
      throw new Error(
        'Can not find "zip" in the global namespace after loading zip.js. Has the zip.js script being loaded properly?'
      );
    }

    zipJsLoadingPromise = null;
    zipJsLoaded = true;

    zip.workerScripts = {
      deflater: [
        PUBLIC_URL + ZIPJS_EXTERNAL_PATH + '/z-worker.js',
        PUBLIC_URL + ZLIBASM_EXTERNAL_PATH + '/zlib.js',
        PUBLIC_URL + ZIPJS_EXTERNAL_PATH + '/zlib-asm/codecs.js',
      ],
      inflater: [
        PUBLIC_URL + ZIPJS_EXTERNAL_PATH + '/z-worker.js',
        PUBLIC_URL + ZLIBASM_EXTERNAL_PATH + '/zlib.js',
        PUBLIC_URL + ZIPJS_EXTERNAL_PATH + '/zlib-asm/codecs.js',
      ],
    };
    return zip;
  });

  return zipJsLoadingPromise;
};
