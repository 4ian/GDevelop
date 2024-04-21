// @flow
import { type I18n as I18nType } from '@lingui/core';
import { mapVector, mapFor } from '../Utils/MapFor';

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

type Options = {
  eventsFunctionCodeWriter: EventsFunctionCodeWriter,
  i18n: I18nType,
};

type OptionsForGeneration = {
  ...Options,
  skipCodeGeneration?: boolean,
};

type CodeGenerationContext = {|
  codeNamespacePrefix: string, // TODO: could this reworked to avoid this entirely?
  extensionIncludeFiles: Array<string>,
|};

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

/**
 * Load an event-function extension metadata without generating the code.
 */
export const reloadProjectEventsFunctionsExtensionMetadata = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsFunctionCodeWriter: EventsFunctionCodeWriter,
  i18n: I18nType
): void => {
  const extension = generateEventsFunctionExtensionMetadata(
    project,
    eventsFunctionsExtension,
    { eventsFunctionCodeWriter, i18n }
  );
  gd.JsPlatform.get().addNewExtension(extension);
  extension.delete();
};

const loadProjectEventsFunctionsExtension = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  options: OptionsForGeneration
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
  options: Options
): Array<string> => {
  return mapFor(0, eventsFunctionsExtension.getEventsFunctionsCount(), i => {
    const eventsFunction = eventsFunctionsExtension.getEventsFunctionAt(i);

    const functionName = gd.MetadataDeclarationHelper.getFreeFunctionCodeName(
      eventsFunctionsExtension,
      eventsFunction
    );

    return options.eventsFunctionCodeWriter.getIncludeFileFor(functionName);
  }).filter(Boolean);
};

/**
 * Generate the code for the events based extension
 */
const generateEventsFunctionExtension = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  options: OptionsForGeneration
): Promise<gdPlatformExtension> => {
  const extension = new gd.PlatformExtension();
  gd.MetadataDeclarationHelper.declareExtension(
    extension,
    eventsFunctionsExtension
  );

  const codeNamespacePrefix = gd.MetadataDeclarationHelper.getExtensionCodeNamespacePrefix(
    eventsFunctionsExtension
  );

  const extensionIncludeFiles = getExtensionIncludeFiles(
    project,
    eventsFunctionsExtension,
    options
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
      return extension;
    });
};

/**
 * Generate the metadata for the events based extension
 */
const generateEventsFunctionExtensionMetadata = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  options: Options
): gdPlatformExtension => {
  const extension = new gd.PlatformExtension();
  gd.MetadataDeclarationHelper.declareExtension(
    extension,
    eventsFunctionsExtension
  );

  const codeNamespacePrefix = gd.MetadataDeclarationHelper.getExtensionCodeNamespacePrefix(
    eventsFunctionsExtension
  );

  const extensionIncludeFiles = getExtensionIncludeFiles(
    project,
    eventsFunctionsExtension,
    options
  );
  const codeGenerationContext = {
    codeNamespacePrefix,
    extensionIncludeFiles,
  };

  // Generate all behaviors and their functions
  mapVector(
    eventsFunctionsExtension.getEventsBasedBehaviors(),
    eventsBasedBehavior => {
      const behaviorMethodMangledNames = new gd.MapStringString();
      generateBehaviorMetadata(
        project,
        extension,
        eventsFunctionsExtension,
        eventsBasedBehavior,
        options,
        codeGenerationContext,
        behaviorMethodMangledNames
      );
      behaviorMethodMangledNames.delete();
      return;
    }
  );
  // Generate all objects and their functions
  mapVector(
    eventsFunctionsExtension.getEventsBasedObjects(),
    eventsBasedObject => {
      const objectMethodMangledNames = new gd.MapStringString();
      generateObjectMetadata(
        project,
        extension,
        eventsFunctionsExtension,
        eventsBasedObject,
        options,
        codeGenerationContext,
        objectMethodMangledNames
      );
      objectMethodMangledNames.delete();
      return;
    }
  );
  // Generate all free functions
  const metadataDeclarationHelper = new gd.MetadataDeclarationHelper();
  mapFor(0, eventsFunctionsExtension.getEventsFunctionsCount(), i => {
    const eventsFunction = eventsFunctionsExtension.getEventsFunctionAt(i);
    return generateFreeFunctionMetadata(
      project,
      extension,
      eventsFunctionsExtension,
      eventsFunction,
      options,
      codeGenerationContext,
      metadataDeclarationHelper
    );
  });
  metadataDeclarationHelper.delete();

  return extension;
};

const generateFreeFunction = (
  project: gdProject,
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsFunction: gdEventsFunction,
  options: OptionsForGeneration,
  codeGenerationContext: CodeGenerationContext
): Promise<void> => {
  const metadataDeclarationHelper = new gd.MetadataDeclarationHelper();
  const { functionMetadata } = generateFreeFunctionMetadata(
    project,
    extension,
    eventsFunctionsExtension,
    eventsFunction,
    options,
    codeGenerationContext,
    metadataDeclarationHelper
  );

  if (!options.skipCodeGeneration) {
    const includeFiles = new gd.SetString();
    const eventsFunctionsExtensionCodeGenerator = new gd.EventsFunctionsExtensionCodeGenerator(
      project
    );
    const codeNamespace = gd.MetadataDeclarationHelper.getFreeFunctionCodeNamespace(
      eventsFunction,
      codeGenerationContext.codeNamespacePrefix
    );
    const code = eventsFunctionsExtensionCodeGenerator.generateFreeEventsFunctionCompleteCode(
      eventsFunctionsExtension,
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
        functionMetadata.addIncludeFile(includeFile);
      });

    includeFiles.delete();
    eventsFunctionsExtensionCodeGenerator.delete();
    metadataDeclarationHelper.delete();

    const functionName = gd.MetadataDeclarationHelper.getFreeFunctionCodeName(
      eventsFunctionsExtension,
      eventsFunction
    );
    return options.eventsFunctionCodeWriter
      .writeFunctionCode(functionName, code)
      .then(() => {});
  } else {
    // Skip code generation if no events function writer is provided.
    // This is the case during the "first pass", where all events functions extensions
    // are loaded as extensions but not code generated, as events in functions could
    // themselves be using functions that are not yet available in extensions.
    return Promise.resolve();
  }
};

const generateFreeFunctionMetadata = (
  project: gdProject,
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsFunction: gdEventsFunction,
  options: Options,
  codeGenerationContext: CodeGenerationContext,
  metadataDeclarationHelper: gdMetadataDeclarationHelper
): {
  functionFile: string,
  functionMetadata: gdAbstractFunctionMetadata,
} => {
  const instructionOrExpression = metadataDeclarationHelper.generateFreeFunctionMetadata(
    project,
    extension,
    eventsFunctionsExtension,
    eventsFunction
  );
  const functionName = gd.MetadataDeclarationHelper.getFreeFunctionCodeName(
    eventsFunctionsExtension,
    eventsFunction
  );
  const functionFile = options.eventsFunctionCodeWriter.getIncludeFileFor(
    functionName
  );
  instructionOrExpression.addIncludeFile(functionFile);

  // Always include the extension include files when using a free function.
  codeGenerationContext.extensionIncludeFiles.forEach(includeFile => {
    instructionOrExpression.addIncludeFile(includeFile);
  });

  // Skip code generation if no events function writer is provided.
  // This is the case during the "first pass", where all events functions extensions
  // are loaded as extensions but not code generated, as events in functions could
  // themselves be using functions that are not yet available in extensions.
  return {
    functionFile: functionFile,
    functionMetadata: instructionOrExpression,
  };
};

function generateBehavior(
  project: gdProject,
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  options: OptionsForGeneration,
  codeGenerationContext: CodeGenerationContext
): Promise<void> {
  return Promise.resolve().then(() => {
    const behaviorMethodMangledNames = new gd.MapStringString();
    const behaviorMetadata = generateBehaviorMetadata(
      project,
      extension,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      options,
      codeGenerationContext,
      behaviorMethodMangledNames
    );

    // Generate code for the behavior and its methods
    if (!options.skipCodeGeneration) {
      const codeNamespace = gd.MetadataDeclarationHelper.getBehaviorFunctionCodeNamespace(
        eventsBasedBehavior,
        codeGenerationContext.codeNamespacePrefix
      );
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

function generateBehaviorMetadata(
  project: gdProject,
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  options: Options,
  codeGenerationContext: CodeGenerationContext,
  behaviorMethodMangledNames: gdMapStringString
): gdBehaviorMetadata {
  const behaviorMetadata = gd.MetadataDeclarationHelper.generateBehaviorMetadata(
    project,
    extension,
    eventsFunctionsExtension,
    eventsBasedBehavior,
    behaviorMethodMangledNames
  );

  const codeNamespace = gd.MetadataDeclarationHelper.getBehaviorFunctionCodeNamespace(
    eventsBasedBehavior,
    codeGenerationContext.codeNamespacePrefix
  );
  const includeFile = options.eventsFunctionCodeWriter.getIncludeFileFor(
    codeNamespace
  );

  behaviorMetadata.addIncludeFile(includeFile);

  // Always include the extension include files when using a behavior.
  codeGenerationContext.extensionIncludeFiles.forEach(includeFile => {
    behaviorMetadata.addIncludeFile(includeFile);
  });

  return behaviorMetadata;
}

function generateObject(
  project: gdProject,
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  options: OptionsForGeneration,
  codeGenerationContext: CodeGenerationContext
): Promise<void> {
  return Promise.resolve().then(() => {
    const objectMethodMangledNames = new gd.MapStringString();
    const objectMetadata = generateObjectMetadata(
      project,
      extension,
      eventsFunctionsExtension,
      eventsBasedObject,
      options,
      codeGenerationContext,
      objectMethodMangledNames
    );

    // Generate code for the object and its methods
    if (!options.skipCodeGeneration) {
      const codeNamespace = gd.MetadataDeclarationHelper.getObjectFunctionCodeNamespace(
        eventsBasedObject,
        codeGenerationContext.codeNamespacePrefix
      );
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

function generateObjectMetadata(
  project: gdProject,
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  options: Options,
  codeGenerationContext: CodeGenerationContext,
  objectMethodMangledNames: gdMapStringString
): gdObjectMetadata {
  const objectMetadata = gd.MetadataDeclarationHelper.generateObjectMetadata(
    project,
    extension,
    eventsFunctionsExtension,
    eventsBasedObject,
    objectMethodMangledNames
  );

  const codeNamespace = gd.MetadataDeclarationHelper.getObjectFunctionCodeNamespace(
    eventsBasedObject,
    codeGenerationContext.codeNamespacePrefix
  );
  // TODO EBO Handle name collision between objects and behaviors.
  const includeFile = options.eventsFunctionCodeWriter.getIncludeFileFor(
    codeNamespace
  );
  // Objects may already have included files for 3D for instance.
  objectMetadata.addIncludeFile(includeFile);

  // Always include the extension include files when using an object.
  codeGenerationContext.extensionIncludeFiles.forEach(includeFile => {
    objectMetadata.addIncludeFile(includeFile);
  });

  return objectMetadata;
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
