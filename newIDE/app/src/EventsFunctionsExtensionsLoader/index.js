// @flow
import { mapVector, mapFor } from '../Utils/MapFor';
import slugs from 'slugs';

const gd = global.gd;

export type EventsFunctionWriter = {|
  getIncludeFileFor: (functionName: string) => string,
  writeFunctionCode: (functionName: string, code: string) => Promise<void>,
|};

const mangleName = (name: string) => {
  return slugs(name, '_', []);
};

/**
 * Load all events functions of a project in extensions
 */
export const loadProjectEventsFunctionsExtensions = (
  project: gdProject,
  eventsFunctionWriter: EventsFunctionWriter
): Promise<Array<void>> => {
  return Promise.all(
    // First pass: generate extensions from the events functions extensions,
    // without writing code for the functions. This is useful as events in functions
    // could be using other functions, which would not yet be available as
    // extensions.
    mapFor(0, project.getEventsFunctionsExtensionsCount(), i => {
      return loadProjectEventsFunctionsExtension(
        project,
        project.getEventsFunctionsExtensionAt(i),
        eventsFunctionWriter,
        { skipCodeGeneration: true }
      );
    })
  ).then(() =>
    Promise.all(
      // Second pass: generate extensions, including code.
      mapFor(0, project.getEventsFunctionsExtensionsCount(), i => {
        return loadProjectEventsFunctionsExtension(
          project,
          project.getEventsFunctionsExtensionAt(i),
          eventsFunctionWriter
        );
      })
    )
  );
};

const loadProjectEventsFunctionsExtension = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsFunctionWriter: EventsFunctionWriter,
  options: { skipCodeGeneration?: boolean } = {}
): Promise<void> => {
  return generateEventsFunctionExtension(
    project,
    eventsFunctionsExtension,
    eventsFunctionWriter,
    options
  ).then(extension => {
    gd.JsPlatform.get().addNewExtension(extension);
    extension.delete();
  });
};

/**
 * Generate the code for the given events functions
 */
const generateEventsFunctionExtension = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsFunctionWriter: EventsFunctionWriter,
  { skipCodeGeneration }: { skipCodeGeneration?: boolean } = {}
): Promise<gdEventsFunctionsExtension> => {
  const extension = new gd.PlatformExtension();

  extension.setExtensionInformation(
    eventsFunctionsExtension.getName(),
    eventsFunctionsExtension.getFullName() ||
      eventsFunctionsExtension.getName(),
    eventsFunctionsExtension.getDescription(),
    '',
    ''
  );

  return Promise.all(
    mapFor(0, eventsFunctionsExtension.getEventsFunctionsCount(), i => {
      const eventsFunction = eventsFunctionsExtension.getEventsFunctionAt(i);
      const instructionOrExpression = generateInstructionOrExpression(
        extension,
        eventsFunction,
        eventsFunctionsExtension
      );
      addEventsFunctionParameters(eventsFunction, instructionOrExpression);

      const codeNamespace =
        'gdjs.eventsFunction__' +
        mangleName(eventsFunctionsExtension.getName()) +
        '__' +
        mangleName(eventsFunction.getName());
      const functionName = codeNamespace + '.func';

      const codeExtraInformation = instructionOrExpression.getCodeExtraInformation();
      codeExtraInformation
        .setIncludeFile(eventsFunctionWriter.getIncludeFileFor(functionName))
        .setFunctionName(functionName);

      if (!skipCodeGeneration) {
        const includeFiles = new gd.SetString();
        const code = gd.EventsCodeGenerator.generateEventsFunctionCode(
          project,
          eventsFunction,
          codeNamespace,
          includeFiles,
          // For now, always generate functions for runtime (this disables
          // generation of profiling for groups (see EventsCodeGenerator))
          // as extensions generated can be used either for preview or export.
          true
        );

        // Add any include file required by the function to the list
        // of include files for this function (so that when used, the "dependencies"
        // are transitively included).
        includeFiles
          .toNewVectorString()
          .toJSArray()
          .forEach((includeFile: string) => {
            codeExtraInformation.addIncludeFile(includeFile);
          });

        includeFiles.delete();

        return eventsFunctionWriter.writeFunctionCode(functionName, code);
      } else {
        // Skip code generation if no events function writer is provided.
        // This is the case during the "first pass", where all events functions extensions
        // are loaded as extensions but not code generated, as events in functions could
        // themselves be using functions that are not yet available in extensions.
      }
    })
  ).then(() => extension);
};

/**
 * Unload all extensions providing events functions of a project
 */
export const unloadProjectEventsFunctionsExtensions = (
  project: gdProject
): Promise<Array<void>> => {
  return Promise.all(
    mapFor(0, project.getEventsFunctionsExtensionsCount(), i => {
      gd.JsPlatform.get().removeExtension(
        project.getEventsFunctionsExtensionAt(i).getName()
      );
    })
  );
};

/**
 * Declare the instruction (action/condition) or expression for the given
 * events function.
 */
const generateInstructionOrExpression = (
  extension: gdPlatformExtension,
  eventsFunction: gdEventsFunction,
  eventsFunctionsExtension: gdEventsFunctionsExtension
): gdInstructionMetadata | gdExpressionMetadata => {
  const functionType = eventsFunction.getFunctionType();
  if (functionType === gd.EventsFunction.Expression) {
    return extension.addExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      'res/function.png'
    );
  } else if (functionType === gd.EventsFunction.StringExpression) {
    return extension.addStrExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      'res/function.png'
    );
  } else if (functionType === gd.EventsFunction.Condition) {
    return extension.addCondition(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription(),
      eventsFunction.getSentence(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      'res/function.png',
      'res/function24.png'
    );
  } else {
    return extension.addAction(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription(),
      eventsFunction.getSentence(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      'res/function.png',
      'res/function24.png'
    );
  }
};

/**
 * Add to the instruction (action/condition) or expression the parameters
 * expected by the events function.
 */
const addEventsFunctionParameters = (
  eventsFunction: gdEventsFunction,
  instructionOrExpression: gdInstructionMetadata | gdExpressionMetadata
) => {
  // By convention, first parameter is always the Runtime Scene.
  instructionOrExpression.addCodeOnlyParameter('currentScene', '');

  mapVector(
    eventsFunction.getParameters(),
    (parameter: gdParameterMetadata) => {
      if (!parameter.isCodeOnly()) {
        instructionOrExpression.addParameter(
          parameter.getType(),
          parameter.getDescription(),
          '', // See below for adding the extra information
          parameter.isOptional()
        );
      } else {
        instructionOrExpression.addCodeOnlyParameter(
          parameter.getType(),
          '' // See below for adding the extra information
        );
      }
      // Manually add the "extra info" without relying on addParameter (or addCodeOnlyParameter)
      // as these methods are prefixing the value passed with the extension namespace (this
      // was done to ease extension declarations when dealing with object).
      instructionOrExpression
        .getParameter(instructionOrExpression.getParametersCount() - 1)
        .setExtraInfo(parameter.getExtraInfo());
    }
  );

  // By convention, latest parameter is always the eventsFunctionContext of the calling function
  // (if any).
  instructionOrExpression.addCodeOnlyParameter('eventsFunctionContext', '');
};

/**
 * Given metadata about an instruction or an expression, tells if this was created
 * from an event function.
 */
export const isAnEventFunctionMetadata = (
  instructionOrExpression: gdInstructionMetadata | gdExpressionMetadata
) => {
  const parametersCount = instructionOrExpression.getParametersCount();
  if (parametersCount <= 0) return false;

  return (
    instructionOrExpression.getParameter(parametersCount - 1).getType() ===
    'eventsFunctionContext'
  );
};

/**
 * Get back the name a function from its type
 */
export const getFunctionNameFromType = (type: string) => {
  const parts = type.split('::');
  if (!parts.length) return '';

  return parts[parts.length - 1];
};
