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
  extension,
  eventsFunction,
  logCode = false
) {
  const namespace = 'functionNamespace';
  const eventsFunctionsExtensionCodeGenerator =
    new gd.EventsFunctionsExtensionCodeGenerator(project);

  const includeFiles = new gd.SetString();
  const code =
    eventsFunctionsExtensionCodeGenerator.generateFreeEventsFunctionCompleteCode(
      extension,
      eventsFunction,
      namespace,
      includeFiles,
      true
    );

  eventsFunctionsExtensionCodeGenerator.delete();
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

/** Helper to create compiled events from serialized events, creating a project and the events function. */
function generateCompiledEventsFromSerializedEvents(
  gd,
  eventsSerializerElement
) {
  const project = new gd.ProjectHelper.createNewGDJSProject();
  const eventsFunctionExtension = new gd.EventsFunctionsExtension();
  const eventsFunction = new gd.EventsFunction();
  eventsFunction.getEvents().unserializeFrom(project, eventsSerializerElement);

  const runCompiledEvents = generateCompiledEventsForEventsFunction(
    gd,
    project,
    extension,
    eventsFunction
  );

  eventsFunction.delete();
  project.delete();

  return runCompiledEvents;
}

module.exports = {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
};
