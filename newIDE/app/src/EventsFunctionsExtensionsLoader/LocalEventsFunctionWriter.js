// @flow
import { type EventsFunctionWriter } from '.';
import optionalRequire from '../Utils/OptionalRequire.js';
import slugs from 'slugs';
const os = optionalRequire('os');
const fs = optionalRequire('fs');

/**
 * Create the EventsFunctionWriter that writes generated code for events functions
 * to local files.
 */
export const makeLocalEventsFunctionWriter = (): EventsFunctionWriter => {
  const outputDir = os.tmpdir() + '/GDGeneratedEventsFunctions';
  fs.mkdir(outputDir, err => {
    if (err && err.code !== 'EEXIST') {
      console.error(
        'Unable to create the directory where to output events functions generated code: ',
        err
      );
      return;
    }
  });

  const getPathFor = (functionName: string) => {
    return `${outputDir}/${slugs(functionName)}.js`;
  };

  return {
    getIncludeFileFor: (functionName: string) => getPathFor(functionName),
    writeFunctionCode: (functionName: string, code: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const filepath = getPathFor(functionName);
        fs.writeFile(filepath, code, err => {
          if (err) return reject(err);

          resolve();
        });
      });
    },
    writeBehaviorCode: (behaviorName: string, code: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // TODO: distinguish files?
        const filepath = getPathFor(behaviorName);
        fs.writeFile(filepath, code, err => {
          if (err) return reject(err);

          resolve();
        });
      });
    },
  };
};
