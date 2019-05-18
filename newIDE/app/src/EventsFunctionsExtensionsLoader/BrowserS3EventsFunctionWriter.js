// @flow
import { type EventsFunctionWriter } from '.';
import { uploadObject, getBaseUrl } from '../Utils/GDevelopServices/Preview';
import { makeTimestampedId } from '../Utils/TimestampedId';
import slugs from 'slugs';

/**
 * Create the EventsFunctionWriter that writes generated code for events functions
 * to temporary S3 files.
 */
export const makeBrowserS3EventsFunctionWriter = (): EventsFunctionWriter => {
  const prefix = makeTimestampedId();
  const getPathFor = (functionName: string) => {
    return `${prefix}/${slugs(functionName)}.js`;
  };

  return {
    getIncludeFileFor: (functionName: string) =>
      getBaseUrl() + getPathFor(functionName),
    writeFunctionCode: (functionName: string, code: string): Promise<void> => {
      const key = getPathFor(functionName);
      console.log(`Uploading function generated code to ${key}...`);
      return uploadObject({
        Key: getPathFor(functionName),
        Body: code,
        ContentType: 'text/javascript',
      });
    },
    writeBehaviorCode: (behaviorName: string, code: string): Promise<void> => {
      const key = getPathFor(behaviorName); //TODO: Use different filename?
      console.log(`Uploading behavior generated code to ${key}...`);
      return uploadObject({
        Key: getPathFor(behaviorName),
        Body: code,
        ContentType: 'text/javascript',
      });
    },
  };
};
