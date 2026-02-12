// @flow
import {
  type EventsFunctionCodeWriter,
  type EventsFunctionCodeWriterCallbacks,
} from '..';
import {
  putFile,
  getBrowserSWPreviewBaseUrl,
  getBrowserSWPreviewRootUrl,
} from '../../ExportAndShare/BrowserExporters/BrowserSWPreviewLauncher/BrowserSWPreviewIndexedDB';
import slugs from 'slugs';
import debounce from 'lodash/debounce';

let batchedWrites: Array<{
  path: string,
  content: string,
  onSuccess: () => void,
  onError: (error: Error) => void,
}> = [];

const flushBatchedWrites = debounce(async () => {
  const writes = [...batchedWrites];
  console.info(
    `[BrowserSWEventsFunctionCodeWriter] Storing a batch of ${
      writes.length
    } extension generated files in IndexedDB...`
  );

  batchedWrites = [];

  // Write all files to IndexedDB in parallel
  const results = await Promise.allSettled(
    writes.map(async write => {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(write.content).buffer;
      await putFile(write.path, bytes, 'text/javascript; charset=utf-8');
      return write;
    })
  );

  // Process results and call callbacks
  results.forEach((result, index) => {
    const write = writes[index];
    if (result.status === 'fulfilled') {
      write.onSuccess();
    } else {
      console.error(
        `[BrowserSWEventsFunctionCodeWriter] Failed to store: ${write.path}`,
        result.reason
      );
      write.onError(result.reason);
    }
  });
}, 10); // Wait for up to 10ms, to avoid adding more latency to extension generation.

/**
 * Write a file by batching it with other files that are being written.
 *
 * Extension generated files are written in batches to avoid making a *lot* of IndexedDB transactions
 * (games can have from dozens to **hundreds** of extensions and generated files).
 */
const writeFileInNextBatch = (path: string, content: string) => {
  return new Promise((resolve, reject) => {
    batchedWrites.push({
      path,
      content,
      onSuccess: resolve,
      onError: reject,
    });
    flushBatchedWrites();
  });
};

/**
 * Create the EventsFunctionCodeWriter that writes generated code for events functions
 * to IndexedDB for service worker serving.
 */
export const makeBrowserSWEventsFunctionCodeWriter = ({
  onWriteFile,
}: EventsFunctionCodeWriterCallbacks): EventsFunctionCodeWriter => {
  const rootUrl = getBrowserSWPreviewRootUrl();

  const getPathFor = (codeNamespace: string) => {
    // Note: don't call getBrowserSWPreviewBaseUrl because it might not be available yet.
    const baseUrl = getBrowserSWPreviewBaseUrl();
    const extensionsCodeUrl = baseUrl + '/extensions-code';
    return `${extensionsCodeUrl}/${slugs(codeNamespace)}.js`;
  };

  return {
    getIncludeFileFor: (codeNamespace: string) => getPathFor(codeNamespace),

    writeFunctionCode: (
      functionCodeNamespace: string,
      code: string
    ): Promise<void> => {
      const path = getPathFor(functionCodeNamespace);
      onWriteFile({ includeFile: path, content: code });
      const relativePath = path.replace(rootUrl, '');

      return writeFileInNextBatch(relativePath, code);
    },

    writeBehaviorCode: (
      behaviorCodeNamespace: string,
      code: string
    ): Promise<void> => {
      const path = getPathFor(behaviorCodeNamespace);
      onWriteFile({ includeFile: path, content: code });
      const relativePath = path.replace(rootUrl, '');

      return writeFileInNextBatch(relativePath, code);
    },

    writeObjectCode: (
      objectCodeNamespace: string,
      code: string
    ): Promise<void> => {
      const path = getPathFor(objectCodeNamespace);
      onWriteFile({ includeFile: path, content: code });
      const relativePath = path.replace(rootUrl, '');

      return writeFileInNextBatch(relativePath, code);
    },
  };
};
