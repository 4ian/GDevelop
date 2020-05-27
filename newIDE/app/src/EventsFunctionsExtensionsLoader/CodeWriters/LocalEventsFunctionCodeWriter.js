// @flow
import {
  type EventsFunctionCodeWriter,
  type EventsFunctionCodeWriterCallbacks,
} from '..';
import optionalRequire from '../../Utils/OptionalRequire.js';
import slugs from 'slugs';
const os = optionalRequire('os');
const fs = optionalRequire('fs');

/**
 * Create the EventsFunctionCodeWriter that writes generated code for events functions
 * to local files.
 */
export const makeLocalEventsFunctionCodeWriter = ({
  onWriteFile,
}: EventsFunctionCodeWriterCallbacks): EventsFunctionCodeWriter => {
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

  const getPathFor = (codeNamespace: string) => {
    return `${outputDir}/${slugs(codeNamespace)}.js`;
  };

  return {
    getIncludeFileFor: (codeNamespace: string) => getPathFor(codeNamespace),
    writeFunctionCode: (
      functionCodeNamespace: string,
      code: string
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        const filepath = getPathFor(functionCodeNamespace);
        onWriteFile({ includeFile: filepath, content: code });
        fs.writeFile(filepath, code, err => {
          if (err) return reject(err);

          resolve();
        });
      });
    },
    writeBehaviorCode: (
      behaviorCodeNamespace: string,
      code: string
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        const filepath = getPathFor(behaviorCodeNamespace);
        onWriteFile({ includeFile: filepath, content: code });
        fs.writeFile(filepath, code, err => {
          if (err) return reject(err);

          resolve();
        });
      });
    },
  };
};
