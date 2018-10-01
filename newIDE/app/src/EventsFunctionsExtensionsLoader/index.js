// @flow
import { mapVector } from '../Utils/MapFor';
import { mapFor } from '../Utils/MapFor';

const gd = global.gd;

export type EventsFunctionWriter = {|
  getIncludeFileFor: (functionName: string) => string,
  writeFunctionCode: (functionName: string, code: string) => Promise<void>,
|};

/**
 * Load all events functions of a project in extensions
 */
export const loadProjectEventsFunctionsExtensions = (
  project: gdProject,
  eventsFunctionWriter: EventsFunctionWriter
): Promise<void> => {
  return Promise.all(mapFor(0, project.getEventsFunctionsExtensionsCount(), i => {
    return loadProjectEventsFunctionsExtension(
      project,
      project.getEventsFunctionsExtensionAt(i),
      eventsFunctionWriter
    );
  }));
};

export const loadProjectEventsFunctionsExtension = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsFunctionWriter: EventsFunctionWriter
): Promise<void> => {
  return generateEventsFunctionExtension(
    project,
    eventsFunctionsExtension,
    eventsFunctionWriter
  ).then(extension => {
    gd.JsPlatform.get().addNewExtension(extension);
    extension.delete();
  });
};

/**
 * Generate the code for the given events functions
 */
export const generateEventsFunctionExtension = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsFunctionWriter: EventsFunctionWriter
): Promise<gdEventsFunctionsExtension> => {
  const extension = new gd.PlatformExtension();

  extension.setExtensionInformation(
    eventsFunctionsExtension.getName(),
    eventsFunctionsExtension.getFullName(),
    eventsFunctionsExtension.getDescription(),
    '',
    '' //TODO - Author and license support?
  );

  return Promise.all(
    mapVector(
      eventsFunctionsExtension.getEventsFunctions(),
      (eventsFunction: gdEventsFunction) => {
        const isCondition = false; //TODO
        const instruction = extension.addAction(
          eventsFunction.getName(),
          eventsFunction.getFullName(),
          eventsFunction.getDescription(),
          eventsFunction.getSentence(),
          eventsFunction.getName(),
          'res/function.png',
          'res/function24.png'
        );

        mapVector(
          eventsFunction.getParameters(),
          (parameter: gdParameterMetadata) => {
            instruction.addParameter(
              parameter.getType(),
              parameter.getDescription(),
              parameter.getExtraInfo(),
              parameter.isOptional()
            );
          }
        );

        const includeFiles = new gd.SetString();
        const codeNamespace = 'gdjs.TODO';
        const functionName = codeNamespace + '.func';
        const code = gd.EventsCodeGenerator.generateEventsFunctionCode(
          project,
          eventsFunction,
          codeNamespace,
          includeFiles,
          true //TODO
        );

        instruction
          .getCodeExtraInformation()
          .setIncludeFile(eventsFunctionWriter.getIncludeFileFor(functionName))
          .setFunctionName(functionName);

        // Add any include file required by the function to the list
        // of include files for this function (so that when used, the "dependencies"
        // are transitively included).
        includeFiles
          .toNewVectorString()
          .toJSArray()
          .forEach((includeFile: string) => {
            instruction.getCodeExtraInformation().addIncludeFile(includeFile);
          });

        includeFiles.delete();

        return eventsFunctionWriter.writeFunctionCode(functionName, code);
      }
    )
  ).then(() => extension);
};
