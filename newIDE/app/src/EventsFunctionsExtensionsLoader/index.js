// @flow
import { mapVector, mapFor } from '../Utils/MapFor';
import slugs from 'slugs';

const gd = global.gd;

export type EventsFunctionWriter = {|
  getIncludeFileFor: (functionName: string) => string,
  writeFunctionCode: (functionName: string, code: string) => Promise<void>,
  writeBehaviorCode: (behaviorName: string, code: string) => Promise<void>,
|};

type Options = {|
  skipCodeGeneration?: boolean,
  eventsFunctionWriter: EventsFunctionWriter,
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
        { skipCodeGeneration: true, eventsFunctionWriter }
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
            eventsFunctionWriter,
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
 * Generate the code for the given events functions
 */
const generateEventsFunctionExtension = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  options: Options
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

  const codeNamespacePrefix =
    'gdjs.eventsExtension__' + mangleName(eventsFunctionsExtension.getName());

  return Promise.all(
    // Generate all behaviors and their functions
    mapVector(
      eventsFunctionsExtension.getEventsBasedBehaviors(),
      eventsBasedBehavior => {
        const behaviorMetadata = generateBehavior(
          extension,
          eventsBasedBehavior
        );

        const codeNamespace =
          codeNamespacePrefix +
          '__' +
          mangleName(eventsBasedBehavior.getName());

        // Can this go inside generateBehavior? Or make a "generateBehaviorCode" and "addBehaviorDeclaration"
        return Promise.resolve()
          .then(() => {
            // Generate behavior code
            if (!options.skipCodeGeneration) {

              const code = gd.BehaviorCodeGenerator.generateRuntimeBehaviorCompleteCode(
                eventsFunctionsExtension.getName(),
                eventsBasedBehavior,
                codeNamespace
              );

              return options.eventsFunctionWriter.writeBehaviorCode(
                eventsBasedBehavior.getName(),
                code
              );
            } else {
              // Skip code generation
              return Promise.resolve();
            }
          })
          .then(() =>
            // Generate all behavior's functions code
            Promise.all(
              mapFor(0, eventsBasedBehavior.getEventsFunctionsCount(), i => {
                const eventsFunction = eventsBasedBehavior.getEventsFunctionAt(
                  i
                );
                generateFunction(
                  project,
                  behaviorMetadata,
                  eventsBasedBehavior,
                  eventsFunction,
                  {
                    ...options,
                    codeNamespacePrefix: codeNamespace,
                  }
                );
              })
            )
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
          generateFunction(
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
 * Declare the behavior for the given
 * events based behavior.
 */
const generateBehavior = (
  extension: gdPlatformExtension,
  eventsBasedBehavior: gdEventsBasedBehavior
): gdBehaviorMetadata => {
  const generatedBehavior = new gd.BehaviorJsImplementation();

  // For now, behavior is empty
  generatedBehavior.updateProperty = function(
    behaviorContent,
    propertyName,
    newValue
  ) {
    return false;
  };

  generatedBehavior.getProperties = function(behaviorContent) {
    var behaviorProperties = new gd.MapStringPropertyDescriptor();
    return behaviorProperties;
  };

  generatedBehavior.setRawJSONContent(JSON.stringify({}));

  return extension.addBehavior(
    eventsBasedBehavior.getName(),
    eventsBasedBehavior.getFullName(),
    eventsBasedBehavior.getName(), // Default name is the name
    eventsBasedBehavior.getDescription(),
    '',
    'defaulticon.png', // TODO
    eventsBasedBehavior.getName(), // Class name is the name, actually unused
    generatedBehavior,
    new gd.BehaviorsSharedData()
  );
};

const generateFunction = (
  project: gdProject,
  extensionOrBehaviorMetadata: gdPlatformExtension | gdBehaviorMetadata,
  eventsFunctionsExtensionOrEventsBasedBehavior:
    | gdEventsFunctionsExtension
    | gdEventsBasedBehavior,
  eventsFunction: gdEventsFunction,
  {
    skipCodeGeneration,
    eventsFunctionWriter,
    codeNamespacePrefix,
  }: {| ...Options, codeNamespacePrefix: string |}
) => {
  const instructionOrExpression = generateInstructionOrExpression(
    extensionOrBehaviorMetadata,
    eventsFunction,
    eventsFunctionsExtensionOrEventsBasedBehavior
  );
  addEventsFunctionParameters(eventsFunction, instructionOrExpression);

  const codeNamespace =
    codeNamespacePrefix + '__' + mangleName(eventsFunction.getName());
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
};

/**
 * Declare the instruction (action/condition) or expression for the given
 * events function.
 */
const generateInstructionOrExpression = (
  extensionOrBehaviorMetadata: gdPlatformExtension | gdBehaviorMetadata,
  eventsFunction: gdEventsFunction,
  eventsFunctionsExtension: gdEventsFunctionsExtension
): gdInstructionMetadata | gdExpressionMetadata => {
  const functionType = eventsFunction.getFunctionType();
  if (functionType === gd.EventsFunction.Expression) {
    return extensionOrBehaviorMetadata.addExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      'res/function.png'
    );
  } else if (functionType === gd.EventsFunction.StringExpression) {
    return extensionOrBehaviorMetadata.addStrExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      'res/function.png'
    );
  } else if (functionType === gd.EventsFunction.Condition) {
    return extensionOrBehaviorMetadata.addCondition(
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
    return extensionOrBehaviorMetadata.addAction(
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
 * Get back the name a function from its type.
 * See also getEventsFunctionType for the reverse operation.
 */
export const getFunctionNameFromType = (type: string) => {
  const parts = type.split('::');
  if (!parts.length) return '';

  return parts[parts.length - 1];
};

/**
 * Get the type of a Events Function.
 * See also getFunctionNameFromType for the reverse operation.
 */
export const getEventsFunctionType = (
  extensionName: string,
  eventsFunction: gdEventsFunction
) => {
  return extensionName + '::' + eventsFunction.getName();
};
