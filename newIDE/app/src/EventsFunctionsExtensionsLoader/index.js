// @flow
import { type I18n as I18nType } from '@lingui/core';
import { mapVector, mapFor } from '../Utils/MapFor';
import { caseSensitiveSlug } from '../Utils/CaseSensitiveSlug';
import {
  declareInstructionOrExpressionMetadata,
  declareBehaviorInstructionOrExpressionMetadata,
  declareEventsFunctionParameters,
  declareBehaviorMetadata,
  declareExtension,
  isBehaviorLifecycleFunction,
  declareBehaviorPropertiesInstructionAndExpressions,
} from './MetadataDeclarationHelpers';

const gd = global.gd;

export type EventsFunctionCodeWriter = {|
  getIncludeFileFor: (functionName: string) => string,
  writeFunctionCode: (functionName: string, code: string) => Promise<void>,
  writeBehaviorCode: (behaviorName: string, code: string) => Promise<void>,
|};

type Options = {|
  skipCodeGeneration?: boolean,
  eventsFunctionCodeWriter: EventsFunctionCodeWriter,
  i18n: I18nType,
|};

const mangleName = (name: string) => {
  return caseSensitiveSlug(name, '_', []);
};

/**
 * Load all events functions of a project in extensions
 */
export const loadProjectEventsFunctionsExtensions = (
  project: gdProject,
  eventsFunctionCodeWriter: EventsFunctionCodeWriter,
  i18n: I18nType
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
        { skipCodeGeneration: true, eventsFunctionCodeWriter, i18n }
      );
    })
  ).then(() =>
    Promise.all(
      // Second pass: generate extensions, including code.
      mapFor(0, project.getEventsFunctionsExtensionsCount(), i => {
        return loadProjectEventsFunctionsExtension(
          project,
          project.getEventsFunctionsExtensionAt(i),
          {
            skipCodeGeneration: false,
            eventsFunctionCodeWriter,
            i18n,
          }
        );
      })
    )
  );
};

const loadProjectEventsFunctionsExtension = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  options: Options
): Promise<void> => {
  return generateEventsFunctionExtension(
    project,
    eventsFunctionsExtension,
    options
  ).then(extension => {
    gd.JsPlatform.get().addNewExtension(extension);
    extension.delete();
  });
};

/**
 * Generate the code for the events based extension
 */
const generateEventsFunctionExtension = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  options: Options
): Promise<gdEventsFunctionsExtension> => {
  const extension = new gd.PlatformExtension();
  declareExtension(extension, eventsFunctionsExtension);

  const codeNamespacePrefix =
    'gdjs.evtsExt__' + mangleName(eventsFunctionsExtension.getName());

  return Promise.all(
    // Generate all behaviors and their functions
    mapVector(
      eventsFunctionsExtension.getEventsBasedBehaviors(),
      eventsBasedBehavior => {
        return generateBehavior(
          project,
          extension,
          eventsFunctionsExtension,
          eventsBasedBehavior,
          {
            ...options,
            codeNamespacePrefix,
          }
        );
      }
    )
  )
    .then(() =>
      // Generate all free functions
      Promise.all(
        mapFor(0, eventsFunctionsExtension.getEventsFunctionsCount(), i => {
          const eventsFunction = eventsFunctionsExtension.getEventsFunctionAt(
            i
          );
          generateFreeFunction(
            project,
            extension,
            eventsFunctionsExtension,
            eventsFunction,
            {
              ...options,
              codeNamespacePrefix,
            }
          );
        })
      )
    )
    .then(() => extension);
};

const generateFreeFunction = (
  project: gdProject,
  extensionOrBehaviorMetadata: gdPlatformExtension | gdBehaviorMetadata,
  eventsFunctionsExtensionOrEventsBasedBehavior:
    | gdEventsFunctionsExtension
    | gdEventsBasedBehavior,
  eventsFunction: gdEventsFunction,
  {
    skipCodeGeneration,
    eventsFunctionCodeWriter,
    codeNamespacePrefix,
  }: {| ...Options, codeNamespacePrefix: string |}
) => {
  const instructionOrExpression = declareInstructionOrExpressionMetadata(
    extensionOrBehaviorMetadata,
    eventsFunctionsExtensionOrEventsBasedBehavior,
    eventsFunction
  );
  // By convention, first parameter is always the Runtime Scene.
  instructionOrExpression.addCodeOnlyParameter('currentScene', '');
  declareEventsFunctionParameters(eventsFunction, instructionOrExpression);

  const codeNamespace =
    codeNamespacePrefix + '__' + mangleName(eventsFunction.getName());
  const functionName = codeNamespace + '.func';

  const codeExtraInformation = instructionOrExpression.getCodeExtraInformation();
  codeExtraInformation
    .setIncludeFile(eventsFunctionCodeWriter.getIncludeFileFor(functionName))
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

    return eventsFunctionCodeWriter.writeFunctionCode(functionName, code);
  } else {
    // Skip code generation if no events function writer is provided.
    // This is the case during the "first pass", where all events functions extensions
    // are loaded as extensions but not code generated, as events in functions could
    // themselves be using functions that are not yet available in extensions.
  }
};

function generateBehavior(
  project: gdProject,
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  options: {| ...Options, codeNamespacePrefix: string |}
) {
  const behaviorMetadata = declareBehaviorMetadata(
    extension,
    eventsBasedBehavior
  );

  const eventsFunctionsContainer = eventsBasedBehavior.getEventsFunctions();
  const codeNamespace =
    options.codeNamespacePrefix +
    '__' +
    mangleName(eventsBasedBehavior.getName());
  const includeFile = options.eventsFunctionCodeWriter.getIncludeFileFor(
    codeNamespace
  );

  behaviorMetadata.setIncludeFile(includeFile);

  return Promise.resolve().then(() => {
    const behaviorMethodMangledNames = new gd.MapStringString();

    // Declare the instructions/expressions for properties
    declareBehaviorPropertiesInstructionAndExpressions(
      options.i18n,
      behaviorMetadata,
      eventsBasedBehavior
    );

    // Declare all the behavior functions
    mapFor(0, eventsFunctionsContainer.getEventsFunctionsCount(), i => {
      const eventsFunction = eventsFunctionsContainer.getEventsFunctionAt(i);

      const eventsFunctionMangledName = mangleName(eventsFunction.getName());
      behaviorMethodMangledNames.set(
        eventsFunction.getName(),
        eventsFunctionMangledName
      );

      const instructionOrExpression = declareBehaviorInstructionOrExpressionMetadata(
        behaviorMetadata,
        eventsBasedBehavior,
        eventsFunction
      );
      declareEventsFunctionParameters(eventsFunction, instructionOrExpression);

      // Hide "lifecycle" methods as they are called automatically by
      // the game engine.
      if (isBehaviorLifecycleFunction(eventsFunction.getName())) {
        instructionOrExpression.setHidden();
      }

      const codeExtraInformation = instructionOrExpression.getCodeExtraInformation();
      codeExtraInformation
        .setIncludeFile(includeFile)
        .setFunctionName(eventsFunctionMangledName);
    });

    // Generate code for the behavior and its methods
    if (!options.skipCodeGeneration) {
      const includeFiles = new gd.SetString();
      const behaviorCodeGenerator = new gd.BehaviorCodeGenerator(project);
      const code = behaviorCodeGenerator.generateRuntimeBehaviorCompleteCode(
        eventsFunctionsExtension.getName(),
        eventsBasedBehavior,
        codeNamespace,
        behaviorMethodMangledNames,
        includeFiles,

        // For now, always generate functions for runtime (this disables
        // generation of profiling for groups (see EventsCodeGenerator))
        // as extensions generated can be used either for preview or export.
        true
      );
      behaviorCodeGenerator.delete();
      behaviorMethodMangledNames.delete();

      // Add any include file required by the functions to the list
      // of include files for this behavior (so that when used, the "dependencies"
      // are transitively included).
      includeFiles
        .toNewVectorString()
        .toJSArray()
        .forEach((includeFile: string) => {
          behaviorMetadata.addIncludeFile(includeFile);
        });

      includeFiles.delete();

      return options.eventsFunctionCodeWriter.writeBehaviorCode(
        codeNamespace,
        code
      );
    } else {
      // Skip code generation
      behaviorMethodMangledNames.delete();
      return Promise.resolve();
    }
  });
}

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
 * Get back the name a function from its type.
 * See also getFreeEventsFunctionType for the reverse operation.
 */
export const getFunctionNameFromType = (type: string) => {
  const parts = type.split('::');
  if (!parts.length)
    return {
      name: '',
      behaviorName: '',
      extensionName: '',
    };

  return {
    name: parts[parts.length - 1],
    behaviorName: parts.length > 2 ? parts[1] : undefined,
    extensionName: parts[0],
  };
};

/**
 * Get the type of a Events Function.
 * See also getFunctionNameFromType for the reverse operation.
 */
export const getFreeEventsFunctionType = (
  extensionName: string,
  eventsFunction: gdEventsFunction
) => {
  return extensionName + '::' + eventsFunction.getName();
};

/**
 * Return the index of the first parameter to be shown to the user:
 * * 0 for a behavior "method",
 * * 1 for a free function (as the first parameter is by convention the runtimeScene).
 */
export const getParametersIndexOffset = (
  isEventsBasedBehaviorMethod: boolean
) => {
  return isEventsBasedBehaviorMethod
    ? 0 /*In the case of a behavior events function, the first two parameters are by convention the "Object" and "Behavior" */
    : 1; /*In the case of a free events function (i.e: not tied to a behavior), the first parameter is by convention the current scene and is not shown.*/
};
