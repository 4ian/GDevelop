// @flow
import { type I18n as I18nType } from '@lingui/core';
import { mapVector, mapFor } from '../Utils/MapFor';
import { caseSensitiveSlug } from '../Utils/CaseSensitiveSlug';
import {
  declareInstructionOrExpressionMetadata,
  declareBehaviorInstructionOrExpressionMetadata,
  declareObjectInstructionOrExpressionMetadata,
  declareEventsFunctionParameters,
  declareBehaviorMetadata,
  declareObjectMetadata,
  declareExtension,
  isBehaviorLifecycleEventsFunction,
  isObjectLifecycleEventsFunction,
  isExtensionLifecycleEventsFunction,
  declareBehaviorPropertiesInstructionAndExpressions,
  declareObjectPropertiesInstructionAndExpressions,
} from './MetadataDeclarationHelpers';

const gd: libGDevelop = global.gd;

export type EventsFunctionCodeWriter = {|
  getIncludeFileFor: (functionName: string) => string,
  writeFunctionCode: (functionName: string, code: string) => Promise<void>,
  writeBehaviorCode: (behaviorName: string, code: string) => Promise<void>,
  writeObjectCode: (objectName: string, code: string) => Promise<void>,
|};

export type IncludeFileContent = {|
  includeFile: string,
  content: string,
|};

export type EventsFunctionCodeWriterCallbacks = {|
  onWriteFile: IncludeFileContent => void,
|};

type Options = {|
  skipCodeGeneration?: boolean,
  eventsFunctionCodeWriter: EventsFunctionCodeWriter,
  i18n: I18nType,
|};

type CodeGenerationContext = {|
  codeNamespacePrefix: string,
  extensionIncludeFiles: Array<string>,
|};

const mangleName = (name: string) => {
  return caseSensitiveSlug(name, '_', []);
};

/** Generate the namespace for a free function. */
const getFreeFunctionCodeNamespace = (
  eventsFunction: gdEventsFunction,
  codeNamespacePrefix: string
) => {
  return codeNamespacePrefix + '__' + mangleName(eventsFunction.getName());
};

/** Generate the namespace for a behavior function. */
const getBehaviorFunctionCodeNamespace = (
  eventsBasedBehavior: gdEventsBasedBehavior,
  codeNamespacePrefix: string
) => {
  return codeNamespacePrefix + '__' + mangleName(eventsBasedBehavior.getName());
};

/** Generate the namespace for an object function. */
const getObjectFunctionCodeNamespace = (
  eventsBasedObject: gdEventsBasedObject,
  codeNamespacePrefix: string
) => {
  return codeNamespacePrefix + '__' + mangleName(eventsBasedObject.getName());
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
 * Get the list of mandatory include files when using the
 * extension.
 */
const getExtensionIncludeFiles = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  options: Options,
  codeNamespacePrefix: string
): Array<string> => {
  return mapFor(0, eventsFunctionsExtension.getEventsFunctionsCount(), i => {
    const eventsFunction = eventsFunctionsExtension.getEventsFunctionAt(i);

    if (isExtensionLifecycleEventsFunction(eventsFunction.getName())) {
      const codeNamespace = getFreeFunctionCodeNamespace(
        eventsFunction,
        codeNamespacePrefix
      );
      const functionName = codeNamespace + '.func'; // TODO

      return options.eventsFunctionCodeWriter.getIncludeFileFor(functionName);
    }

    return null;
  }).filter(Boolean);
};

/**
 * Generate the code for the events based extension
 */
const generateEventsFunctionExtension = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  options: Options
): Promise<gdPlatformExtension> => {
  const extension = new gd.PlatformExtension();
  declareExtension(extension, eventsFunctionsExtension);

  const codeNamespacePrefix =
    'gdjs.evtsExt__' + mangleName(eventsFunctionsExtension.getName());

  const extensionIncludeFiles = getExtensionIncludeFiles(
    project,
    eventsFunctionsExtension,
    options,
    codeNamespacePrefix
  );
  const codeGenerationContext = {
    codeNamespacePrefix,
    extensionIncludeFiles,
  };

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
          options,
          codeGenerationContext
        );
      }
    )
  )
    .then(() =>
      // Generate all objects and their functions
      Promise.all(
        mapVector(
          eventsFunctionsExtension.getEventsBasedObjects(),
          eventsBasedObject => {
            return generateObject(
              project,
              extension,
              eventsFunctionsExtension,
              eventsBasedObject,
              options,
              codeGenerationContext
            );
          }
        )
      )
    )
    .then(() =>
      // Generate all free functions
      Promise.all(
        mapFor(0, eventsFunctionsExtension.getEventsFunctionsCount(), i => {
          const eventsFunction = eventsFunctionsExtension.getEventsFunctionAt(
            i
          );
          return generateFreeFunction(
            project,
            extension,
            eventsFunctionsExtension,
            eventsFunction,
            options,
            codeGenerationContext
          );
        })
      )
    )
    .then(functionInfos => {
      if (!options.skipCodeGeneration) {
        applyFunctionIncludeFilesDependencyTransitivity(functionInfos);
      }
      return extension;
    });
};

const generateFreeFunction = (
  project: gdProject,
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsFunction: gdEventsFunction,
  options: Options,
  codeGenerationContext: CodeGenerationContext
): Promise<{
  functionFile: string,
  functionMetadata: gdInstructionMetadata | gdExpressionMetadata,
}> => {
  const instructionOrExpression = declareInstructionOrExpressionMetadata(
    extension,
    eventsFunctionsExtension,
    eventsFunction
  );
  // By convention, first parameter is always the Runtime Scene.
  instructionOrExpression.addCodeOnlyParameter('currentScene', '');
  declareEventsFunctionParameters(eventsFunction, instructionOrExpression);

  // Hide "lifecycle" functions as they are called automatically by
  // the game engine.
  if (isExtensionLifecycleEventsFunction(eventsFunction.getName()))
    instructionOrExpression.setHidden();

  if (eventsFunction.isPrivate()) instructionOrExpression.setPrivate();

  const codeNamespace = getFreeFunctionCodeNamespace(
    eventsFunction,
    codeGenerationContext.codeNamespacePrefix
  );
  const functionName = codeNamespace + '.func';

  const codeExtraInformation = instructionOrExpression.getCodeExtraInformation();
  const functionFile = options.eventsFunctionCodeWriter.getIncludeFileFor(
    functionName
  );
  codeExtraInformation
    .setIncludeFile(functionFile)
    .setFunctionName(functionName);

  // Always include the extension include files when using a free function.
  codeGenerationContext.extensionIncludeFiles.forEach(includeFile => {
    codeExtraInformation.addIncludeFile(includeFile);
  });

  if (!options.skipCodeGeneration) {
    const includeFiles = new gd.SetString();
    const eventsFunctionsExtensionCodeGenerator = new gd.EventsFunctionsExtensionCodeGenerator(
      project
    );
    const code = eventsFunctionsExtensionCodeGenerator.generateFreeEventsFunctionCompleteCode(
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

    return options.eventsFunctionCodeWriter
      .writeFunctionCode(functionName, code)
      .then(() => ({
        functionFile: functionFile,
        functionMetadata: instructionOrExpression,
      }));
  } else {
    // Skip code generation if no events function writer is provided.
    // This is the case during the "first pass", where all events functions extensions
    // are loaded as extensions but not code generated, as events in functions could
    // themselves be using functions that are not yet available in extensions.
    return Promise.resolve({
      functionFile: functionFile,
      functionMetadata: instructionOrExpression,
    });
  }
};

/**
 * Add dependencies between functions according to transitivity.
 * @param functionInfos free function metadatas
 */
const applyFunctionIncludeFilesDependencyTransitivity = (
  functionInfos: Array<{
    functionFile: string,
    functionMetadata: gdInstructionMetadata | gdExpressionMetadata,
  }>
): void => {
  // Note that the iteration order doesn't matter, for instance for:
  // a -> b
  // b -> c
  // c -> d
  //
  // going from a to c:
  // a -> (b -> c)
  // b -> c
  // c -> d
  //
  // or from c to a:
  // a -> b
  // b -> (c -> d)
  // c -> d
  //
  // give the same result:
  // a -> (b -> (c -> d))
  // b -> (c -> d)
  // c -> d
  const includeFileSets = functionInfos.map(
    functionInfo =>
      new Set(
        functionInfo.functionMetadata
          .getCodeExtraInformation()
          .getIncludeFiles()
          .toJSArray()
      )
  );
  // For any function A of the extension...
  for (let index = 0; index < functionInfos.length; index++) {
    const includeFiles = includeFileSets[index];
    const functionIncludeFile = functionInfos[index].functionFile;

    // ...and any function B of the extension...
    for (let otherIndex = 0; otherIndex < functionInfos.length; otherIndex++) {
      const otherCodeExtraInformation = functionInfos[
        otherIndex
      ].functionMetadata.getCodeExtraInformation();
      const otherIncludeFileSet = includeFileSets[otherIndex];
      // ...where function B depends on function A...
      if (otherIncludeFileSet.has(functionIncludeFile)) {
        // ...add function A dependencies to the function B ones.
        includeFiles.forEach(includeFile => {
          if (!otherIncludeFileSet.has(includeFile)) {
            otherIncludeFileSet.add(includeFile);
            otherCodeExtraInformation.addIncludeFile(includeFile);
          }
        });
      }
    }
  }
};

function generateBehavior(
  project: gdProject,
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  options: Options,
  codeGenerationContext: CodeGenerationContext
): Promise<void> {
  const behaviorMetadata = declareBehaviorMetadata(
    extension,
    eventsBasedBehavior
  );

  const eventsFunctionsContainer = eventsBasedBehavior.getEventsFunctions();
  const codeNamespace = getBehaviorFunctionCodeNamespace(
    eventsBasedBehavior,
    codeGenerationContext.codeNamespacePrefix
  );
  const includeFile = options.eventsFunctionCodeWriter.getIncludeFileFor(
    codeNamespace
  );

  behaviorMetadata.setIncludeFile(includeFile);

  // Always include the extension include files when using a behavior.
  codeGenerationContext.extensionIncludeFiles.forEach(includeFile => {
    behaviorMetadata.addIncludeFile(includeFile);
  });

  return Promise.resolve().then(() => {
    const behaviorMethodMangledNames = new gd.MapStringString();

    // Declare the instructions/expressions for properties
    declareBehaviorPropertiesInstructionAndExpressions(
      options.i18n,
      extension,
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
        extension,
        behaviorMetadata,
        eventsBasedBehavior,
        eventsFunction
      );
      declareEventsFunctionParameters(eventsFunction, instructionOrExpression);

      // Hide "lifecycle" methods as they are called automatically by
      // the game engine.
      if (isBehaviorLifecycleEventsFunction(eventsFunction.getName())) {
        instructionOrExpression.setHidden();
      }

      if (eventsFunction.isPrivate()) instructionOrExpression.setPrivate();

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

function generateObject(
  project: gdProject,
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  options: Options,
  codeGenerationContext: CodeGenerationContext
): Promise<void> {
  const objectMetadata = declareObjectMetadata(extension, eventsBasedObject);

  const eventsFunctionsContainer = eventsBasedObject.getEventsFunctions();
  const codeNamespace = getObjectFunctionCodeNamespace(
    eventsBasedObject,
    codeGenerationContext.codeNamespacePrefix
  );
  // TODO EBO Handle name collision between objects and behaviors.
  const includeFile = options.eventsFunctionCodeWriter.getIncludeFileFor(
    codeNamespace
  );

  objectMetadata.setIncludeFile(includeFile);

  // Always include the extension include files when using an object.
  codeGenerationContext.extensionIncludeFiles.forEach(includeFile => {
    objectMetadata.addIncludeFile(includeFile);
  });

  return Promise.resolve().then(() => {
    const objectMethodMangledNames = new gd.MapStringString();

    // Declare the instructions/expressions for properties
    declareObjectPropertiesInstructionAndExpressions(
      options.i18n,
      extension,
      objectMetadata,
      eventsBasedObject
    );

    // Declare all the object functions
    mapFor(0, eventsFunctionsContainer.getEventsFunctionsCount(), i => {
      const eventsFunction = eventsFunctionsContainer.getEventsFunctionAt(i);

      const eventsFunctionMangledName = mangleName(eventsFunction.getName());
      objectMethodMangledNames.set(
        eventsFunction.getName(),
        eventsFunctionMangledName
      );

      const instructionOrExpression = declareObjectInstructionOrExpressionMetadata(
        extension,
        objectMetadata,
        eventsBasedObject,
        eventsFunction
      );
      declareEventsFunctionParameters(eventsFunction, instructionOrExpression);

      // Hide "lifecycle" methods as they are called automatically by
      // the game engine.
      if (isObjectLifecycleEventsFunction(eventsFunction.getName())) {
        instructionOrExpression.setHidden();
      }

      if (eventsFunction.isPrivate()) instructionOrExpression.setPrivate();

      const codeExtraInformation = instructionOrExpression.getCodeExtraInformation();
      codeExtraInformation
        .setIncludeFile(includeFile)
        .setFunctionName(eventsFunctionMangledName);
    });

    // Generate code for the object and its methods
    if (!options.skipCodeGeneration) {
      const includeFiles = new gd.SetString();
      const objectCodeGenerator = new gd.ObjectCodeGenerator(project);
      const code = objectCodeGenerator.generateRuntimeObjectCompleteCode(
        eventsFunctionsExtension.getName(),
        eventsBasedObject,
        codeNamespace,
        objectMethodMangledNames,
        includeFiles,

        // For now, always generate functions for runtime (this disables
        // generation of profiling for groups (see EventsCodeGenerator))
        // as extensions generated can be used either for preview or export.
        true
      );
      objectCodeGenerator.delete();
      objectMethodMangledNames.delete();

      // Add any include file required by the functions to the list
      // of include files for this object (so that when used, the "dependencies"
      // are transitively included).
      includeFiles
        .toNewVectorString()
        .toJSArray()
        .forEach((includeFile: string) => {
          objectMetadata.addIncludeFile(includeFile);
        });

      includeFiles.delete();

      return options.eventsFunctionCodeWriter.writeObjectCode(
        codeNamespace,
        code
      );
    } else {
      // Skip code generation
      objectMethodMangledNames.delete();
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
 * Unload a single extension providing events functions of a project
 */
export const unloadProjectEventsFunctionsExtension = (
  project: gdProject,
  extensionName: string
): void => {
  gd.JsPlatform.get().removeExtension(extensionName);
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
 * The index of the first parameter to be shown to the user.
 */
export const ParametersIndexOffsets = Object.freeze({
  // In the case of a free events function (i.e: not tied to a behavior),
  // the first parameter is by convention the current scene and is not shown.
  FreeFunction: 1,
  // In the case of a behavior events function, the first two parameters
  // are by convention the "Object" and "Behavior".
  BehaviorFunction: 0,
  // In the case of an object events function, the first parameter
  // is by convention the "Object".
  ObjectFunction: 0,
});
