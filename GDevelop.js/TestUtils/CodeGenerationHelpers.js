/**
 * Generate the code from events (using GDJS platform)
 * and create a JavaScript function that runs it.
 *
 * The JavaScript function must be called with the `runtimeScene` to be used.
 * In this context, GDJS game engine does not exist, so you must pass a mock
 * to it to validate that the events are working properly.
 */
function generateCompiledEventsForEventsFunction(
  gd,
  project,
  eventsFunction,
  logCode = false
) {
  const namespace = 'functionNamespace';
  const eventsFunctionsExtensionCodeGenerator =
    new gd.EventsFunctionsExtensionCodeGenerator(project);

  const includeFiles = new gd.SetString();
  const extension = new gd.EventsFunctionsExtension();
  const code =
    eventsFunctionsExtensionCodeGenerator.generateFreeEventsFunctionCompleteCode(
      extension,
      eventsFunction,
      namespace,
      includeFiles,
      true
    );

  eventsFunctionsExtensionCodeGenerator.delete();
  extension.delete();
  includeFiles.delete();

  if (logCode) console.log(code);

  // Create a "real" JavaScript function with the generated code.
  const runCompiledEventsFunction = new Function(
    'gdjs',
    'runtimeScene',
    'functionArguments',
    // Expose some global variables that are expected by the generated code:
    `Hashtable = gdjs.Hashtable;` +
      '\n' +
      code +
      // Return the function for it to be called (if arguments are passed).
      `;
    return functionArguments ?
      functionNamespace.func.apply(functionNamespace.func, [runtimeScene, ...functionArguments, runtimeScene]) :
      null;`
  );

  return runCompiledEventsFunction;
}

const generatedEventsCodeToJSFunction = (code, gdjs, runtimeScene) => {
  const func = new Function(
    'gdjs',
    'runtimeScene',
    'functionArguments',
    // Expose some global variables that are expected by the generated code:
    `Hashtable = gdjs.Hashtable;` +
      '\n' +
      code +
      // Return the function for it to be called (if arguments are passed).
      `;
  return functionNamespace.func(runtimeScene, ...functionArguments, runtimeScene);`
  );

  return (...args) => func(gdjs, runtimeScene, args);
};

function generateCompiledEventsForEventsBasedBehavior(
  gd,
  project,
  eventsBasedBehavior,
  gdjs
) {
  const includeFiles = new gd.SetString();
  const codeNamespace = 'behaviorNamespace';
  const behaviorCodeGenerator = new gd.BehaviorCodeGenerator(project);

  // Generate "mangled names" as required by the code generation
  const behaviorMethodMangledNames = new gd.MapStringString();
  for (
    let i = 0;
    i < eventsBasedBehavior.getEventsFunctions().getEventsFunctionsCount();
    i++
  ) {
    const eventsFunction = eventsBasedBehavior
      .getEventsFunctions()
      .getEventsFunctionAt(i);
    behaviorMethodMangledNames.set(
      eventsFunction.getName(),
      eventsFunction.getName()
    );
  }

  const code = behaviorCodeGenerator.generateRuntimeBehaviorCompleteCode(
    'MyExtension',
    eventsBasedBehavior,
    codeNamespace,
    behaviorMethodMangledNames,
    includeFiles,
    true
  );

  // Create a function returning the generated behavior.
  const compiledBehavior = new Function(
    'gdjs',
    `let behaviorNamespace = {};
     let Hashtable = gdjs.Hashtable;
     ${code}
     return behaviorNamespace.${eventsBasedBehavior.getName()};`
  )(gdjs);

  includeFiles.delete();
  behaviorCodeGenerator.delete();
  behaviorMethodMangledNames.delete();

  return compiledBehavior;
}

function generateCompiledEventsForEventsBasedObject(
  gd,
  project,
  eventsBasedObject,
  gdjs
) {
  const includeFiles = new gd.SetString();
  const codeNamespace = 'objectNamespace';
  const objectCodeGenerator = new gd.ObjectCodeGenerator(project);

  // Generate "mangled names" as required by the code generation
  const objectMethodMangledNames = new gd.MapStringString();

  const eventsFunctionsContainer = eventsBasedObject.getEventsFunctions();
  for (let i = 0; i < eventsFunctionsContainer.getEventsFunctionsCount(); i++) {
    const eventsFunction = eventsFunctionsContainer.getEventsFunctionAt(i);
    objectMethodMangledNames.set(
      eventsFunction.getName(),
      eventsFunction.getName()
    );
  }

  const code = objectCodeGenerator.generateRuntimeObjectCompleteCode(
    'MyExtension',
    eventsBasedObject,
    codeNamespace,
    objectMethodMangledNames,
    includeFiles,
    true
  );

  objectCodeGenerator.delete();
  includeFiles.delete();
  objectMethodMangledNames.delete();

  // Create a function returning the generated object.
  const compiledObject = new Function(
    'gdjs',
    `let objectNamespace = {};
     const Hashtable = gdjs.Hashtable;
     ${code}
     return objectNamespace.${eventsBasedObject.getName()};`
  )(gdjs);

  return compiledObject;
}

/**
 * Generates all functions, behaviors and objects of an EventsFunctionsExtension.
 *
 * Usage:
 * Pass in the extension as a JS object. You will get in return an object
 * `{ freeFunctions: { [functionName]: FreeEventsFunction }, behaviors: { [behaviorName]: RuntimeBehavior }, objects: { [objectName]: RuntimeObject } }`
 *
 * Example:
 * ```js
 * const extension = require("./extensions/Extension.json"):
 * const { freeFunctions } = generateCompiledEventsForSerializedEventsBasedExtension(extension);
 * const { RGBToHex } = freeFunctions;
 * const result = RGBToHex(gdjs, runtimeScene, ["1;2;3"])
 * ```
 */
function generateCompiledEventsForSerializedEventsBasedExtension(
  gd,
  serializedEventsFunctionsExtension,
  gdjs,
  runtimeScene
) {
  const project = new gd.ProjectHelper.createNewGDJSProject();
  const extension = project.insertNewEventsFunctionsExtension(
    serializedEventsFunctionsExtension.name,
    0
  );

  const serializerElement = gd.Serializer.fromJSObject(
    serializedEventsFunctionsExtension
  );
  extension.unserializeFrom(project, serializerElement);
  serializerElement.delete();

  const includeFiles = new gd.SetString();
  const codeNamespace = 'functionNamespace';

  const generatedExtensionModule = {
    freeFunctions: {},
    behaviors: {},
    objects: {},
  };

  const eventsFunctionsExtensionCodeGenerator =
    new gd.EventsFunctionsExtensionCodeGenerator(project);
  for (let i = 0; i < extension.getEventsFunctionsCount(); i++) {
    const eventsFunction = extension.getEventsFunctionAt(i);
    generatedExtensionModule.freeFunctions[eventsFunction.getName()] =
      generatedEventsCodeToJSFunction(
        eventsFunctionsExtensionCodeGenerator.generateFreeEventsFunctionCompleteCode(
          extension,
          eventsFunction,
          codeNamespace,
          includeFiles,
          true
        ),
        gdjs,
        runtimeScene
      );
  }
  eventsFunctionsExtensionCodeGenerator.delete();

  const behaviorsList = extension.getEventsBasedBehaviors();
  for (let i = 0; i < behaviorsList.getCount(); i++) {
    const behavior = behaviorsList.getAt(i);
    generatedExtensionModule.behaviors[behavior.getName()] =
      generateCompiledEventsForEventsBasedBehavior(gd, project, behavior, gdjs);
  }

  const objectsLists = extension.getEventsBasedObjects();
  for (let i = 0; i < objectsLists.getCount(); i++) {
    const obj = objectsLists.getAt(i);
    generatedExtensionModule.objects[obj.getName()] =
      generateCompiledEventsForEventsBasedObject(gd, project, obj, gdjs);
  }

  includeFiles.delete();
  project.delete();

  return generatedExtensionModule;
}

/**
 * Helper to create compiled events from serialized events, creating a project and the events function.
 * @param {*} gd
 * @param {gdSerializerElement} eventsSerializerElement
 * @param {{parameterTypes: {[name: string]: string}, groups: {[name: string]: string[]}, logCode: boolean}?} configuration
 * @returns
 */
function generateCompiledEventsFromSerializedEvents(
  gd,
  eventsSerializerElement,
  configuration
) {
  const project = new gd.ProjectHelper.createNewGDJSProject();
  const eventsFunction = new gd.EventsFunction();
  eventsFunction.getEvents().unserializeFrom(project, eventsSerializerElement);

  if (configuration) {
    const { parameterTypes, groups } = configuration;
    if (groups) {
      for (const groupName in groups) {
        if (Object.hasOwnProperty.call(groups, groupName)) {
          const objectsNames = groups[groupName];

          const group = eventsFunction
            .getObjectGroups()
            .insertNew(groupName, 0);
          for (const objectName of objectsNames) {
            group.addObject(objectName);
          }
        }
      }
    }

    if (parameterTypes) {
      for (const parameterName in parameterTypes) {
        if (Object.hasOwnProperty.call(parameterTypes, parameterName)) {
          const parameterType = parameterTypes[parameterName];

          const parameter = new gd.ParameterMetadata();
          parameter.setType(parameterType);
          parameter.setName(parameterName);
          eventsFunction.getParameters().push_back(parameter);
          parameter.delete();
        }
      }
    }
  }

  const runCompiledEvents = generateCompiledEventsForEventsFunction(
    gd,
    project,
    eventsFunction,
    configuration && configuration.logCode
  );

  eventsFunction.delete();
  project.delete();

  return runCompiledEvents;
}

/**
 * Generate a function to run the compiled events of a layout.
 */
function generateCompiledEventsForLayout(gd, project, layout) {
  const includeFiles = new gd.SetString();
  const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);

  const code = layoutCodeGenerator.generateLayoutCompleteCode(
    layout,
    includeFiles,
    true
  );

  layoutCodeGenerator.delete();
  includeFiles.delete();

  // Create a function running the generated code.
  const compiledFunction = new Function(
    'gdjs',
    'runtimeScene',
    `const Hashtable = gdjs.Hashtable;
     ${code}
     return gdjs['${layout.getName()}Code'].func(runtimeScene);`
  );

  return compiledFunction;
}

module.exports = {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
  generateCompiledEventsForSerializedEventsBasedExtension,
  generateCompiledEventsForLayout,
};
