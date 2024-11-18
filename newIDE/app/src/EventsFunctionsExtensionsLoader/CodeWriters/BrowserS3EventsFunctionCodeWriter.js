// @flow
import {
  type EventsFunctionCodeWriter,
  type EventsFunctionCodeWriterCallbacks,
} from '..';
import {
  uploadObjects,
  getBaseUrl,
  type UploadedObject,
} from '../../Utils/GDevelopServices/Preview';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import slugs from 'slugs';
import debounce from 'lodash/debounce';

let batchedUploads: Array<{
  uploadedObject: UploadedObject,
  onSuccess: () => void,
  onError: (error: Error) => void,
}> = [];

const flushBatchedUploads = debounce(async () => {
  const uploads = [...batchedUploads];
  console.info(
    `Uploading a batch of ${uploads.length} extension generated files...`,
    uploads
  );

  batchedUploads = [];

  try {
    await uploadObjects(uploads.map(upload => upload.uploadedObject));
  } catch (error) {
    uploads.forEach(upload => upload.onError(error));

    return;
  }

  uploads.forEach(upload => upload.onSuccess());
}, 10); // Wait for up to 10ms, to avoid adding more latency to extension generation.

/**
 * Upload a file by batching it with other files that are being uploaded.
 *
 * Extension generated files are uploaded in batches to avoid making a *lot* of requests
 * (games can have from dozens to **hundreds** of extensions and generated files).
 */
const uploadObjectInNextBatch = (uploadedObject: UploadedObject) => {
  return new Promise((resolve, reject) => {
    batchedUploads.push({
      uploadedObject,
      onSuccess: resolve,
      onError: reject,
    });
    flushBatchedUploads();
  });
};

/**
 * Create the EventsFunctionCodeWriter that writes generated code for events functions
 * to temporary S3 files.
 */
export const makeBrowserS3EventsFunctionCodeWriter = ({
  onWriteFile,
}: EventsFunctionCodeWriterCallbacks): EventsFunctionCodeWriter => {
  const prefix = makeTimestampedId();
  const getPathFor = (codeNamespace: string) => {
    return `${prefix}/${slugs(codeNamespace)}.js`;
  };

  return {
    getIncludeFileFor: (codeNamespace: string) =>
      getBaseUrl() + getPathFor(codeNamespace),
    writeFunctionCode: (
      functionCodeNamespace: string,
      code: string
    ): Promise<void> => {
      const key = getPathFor(functionCodeNamespace);
      onWriteFile({ includeFile: key, content: code });
      console.log(`Uploading function generated code to ${key}...`);
      return uploadObjectInNextBatch({
        Key: getPathFor(functionCodeNamespace),
        Body: code,
        ContentType: 'text/javascript',
      });
    },
    writeBehaviorCode: (
      behaviorCodeNamespace: string,
      code: string
    ): Promise<void> => {
      const key = getPathFor(behaviorCodeNamespace);
      onWriteFile({ includeFile: key, content: code });
      console.log(`Uploading behavior generated code to ${key}...`);
      return uploadObjectInNextBatch({
        Key: getPathFor(behaviorCodeNamespace),
        Body: code,
        ContentType: 'text/javascript',
      });
    },
    writeObjectCode: (
      objectCodeNamespace: string,
      code: string
    ): Promise<void> => {
      const key = getPathFor(objectCodeNamespace);
      onWriteFile({ includeFile: key, content: code });
      console.log(`Uploading object generated code to ${key}...`);
      return uploadObjectInNextBatch({
        Key: getPathFor(objectCodeNamespace),
        Body: code,
        ContentType: 'text/javascript',
      });
    },
  };
};
