// @flow
import { type EventsFunctionCodeWriter } from '..';
import { uploadObject, getBaseUrl } from '../../Utils/GDevelopServices/Preview';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import slugs from 'slugs';

/**
 * Create the EventsFunctionCodeWriter that writes generated code for events functions
 * to temporary S3 files.
 */
export const makeBrowserS3EventsFunctionCodeWriter = (): EventsFunctionCodeWriter => {
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
      console.log(`Uploading function generated code to ${key}...`);
      return uploadObject({
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
      console.log(`Uploading behavior generated code to ${key}...`);
      return uploadObject({
        Key: getPathFor(behaviorCodeNamespace),
        Body: code,
        ContentType: 'text/javascript',
      });
    },
  };
};
