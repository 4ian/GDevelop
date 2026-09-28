const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');

describe('libGD.js - GDJS events execution tracking code generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  /**
   * A scene with two events (the second one having a sub-event) and a link to
   * external events, to check that every instruction is tracked using the
   * identity of the event the editor knows.
   */
  const makeProjectWithEvents = () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    layout.getVariables().insertNew('Counter', 0).setValue(0);
    layout.getEvents().unserializeFrom(
      project,
      gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            {
              type: { value: 'NumberVariable' },
              parameters: ['Counter', '>=', '0'],
            },
          ],
          actions: [
            {
              type: { value: 'SetNumberVariable' },
              parameters: ['Counter', '+', '1'],
            },
          ],
          events: [],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            // A false condition: the action must not be tracked as executed.
            {
              type: { value: 'NumberVariable' },
              parameters: ['Counter', '>', '1000'],
            },
          ],
          actions: [
            {
              type: { value: 'SetNumberVariable' },
              parameters: ['Counter', '+', '2'],
            },
          ],
          events: [
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [
                {
                  type: { value: 'SetNumberVariable' },
                  parameters: ['Counter', '+', '4'],
                },
              ],
              events: [],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Link',
          target: 'External events 1',
        },
      ])
    );

    const externalEvents = project.insertNewExternalEvents(
      'External events 1',
      0
    );
    externalEvents.getEvents().unserializeFrom(
      project,
      gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'SetNumberVariable' },
              parameters: ['Counter', '+', '8'],
            },
          ],
          events: [],
        },
      ])
    );

    return { project, layout, externalEvents };
  };

  const generateLayoutCode = (
    project,
    layout,
    compilationForRuntime,
    generateEventsExecutionTracking = true
  ) => {
    const includeFiles = new gd.SetString();
    const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
    layoutCodeGenerator.setGenerateEventsExecutionTracking(
      generateEventsExecutionTracking
    );
    const diagnosticReport = new gd.DiagnosticReport();
    const code = layoutCodeGenerator.generateLayoutCompleteCode(
      layout,
      includeFiles,
      diagnosticReport,
      compilationForRuntime
    );
    layoutCodeGenerator.delete();
    includeFiles.delete();
    diagnosticReport.delete();
    return code;
  };

  it('tracks the instructions with the identity of the events of the editor, for previews only', function () {
    const { project, layout, externalEvents } = makeProjectWithEvents();
    const events = layout.getEvents();
    const firstEventPtr = events.getEventAt(0).ptr;
    const secondEvent = events.getEventAt(1);
    const secondEventPtr = secondEvent.ptr;
    const subEventPtr = secondEvent.getSubEvents().getEventAt(0).ptr;
    const externalEventPtr = externalEvents.getEvents().getEventAt(0).ptr;

    const previewCode = generateLayoutCode(project, layout, false);
    expect(previewCode).toContain(
      `gdjs.eventsExecutionTracker.begin("${firstEventPtr}:c0")`
    );
    expect(previewCode).toContain(
      `gdjs.eventsExecutionTracker.end("${firstEventPtr}:c0")`
    );
    expect(previewCode).toContain(
      `gdjs.eventsExecutionTracker.begin("${firstEventPtr}:a0")`
    );
    expect(previewCode).toContain(
      `gdjs.eventsExecutionTracker.begin("${secondEventPtr}:c0")`
    );
    expect(previewCode).toContain(
      `gdjs.eventsExecutionTracker.begin("${secondEventPtr}:a0")`
    );
    // Sub-events are identified by their own identity.
    expect(previewCode).toContain(
      `gdjs.eventsExecutionTracker.begin("${subEventPtr}:a0")`
    );
    // Events inlined from a link keep the identity of the external event.
    expect(previewCode).toContain(
      `gdjs.eventsExecutionTracker.begin("${externalEventPtr}:a0")`
    );

    // Exported games are never slowed down by the tracking: the exporter
    // never asks for it (see ExporterHelper).
    const runtimeCode = generateLayoutCode(project, layout, true, false);
    expect(runtimeCode).not.toContain('eventsExecutionTracker');
    // Neither are the previews launched without the debugger.
    const plainPreviewCode = generateLayoutCode(project, layout, false, false);
    expect(plainPreviewCode).not.toContain('eventsExecutionTracker');

    project.delete();
  });

  it('gives each tracked condition its own id, sub-instructions and "While" conditions left out', function () {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    layout.getVariables().insertNew('Counter', 0).setValue(0);
    const counterIsPositive = {
      type: { value: 'NumberVariable' },
      parameters: ['Counter', '>=', '0'],
    };
    layout.getEvents().unserializeFrom(
      project,
      gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            {
              type: { value: 'BuiltinCommonInstructions::And' },
              parameters: [],
              subInstructions: [counterIsPositive, counterIsPositive],
            },
            counterIsPositive,
          ],
          actions: [],
          events: [],
        },
        {
          type: 'BuiltinCommonInstructions::While',
          whileConditions: [
            {
              type: { value: 'NumberVariable' },
              parameters: ['Counter', '<', '0'],
            },
          ],
          conditions: [],
          actions: [
            {
              type: { value: 'SetNumberVariable' },
              parameters: ['Counter', '+', '1'],
            },
          ],
          events: [],
        },
      ])
    );
    const standardEventPtr = layout.getEvents().getEventAt(0).ptr;
    const whileEventPtr = layout.getEvents().getEventAt(1).ptr;

    const previewCode = generateLayoutCode(project, layout, false);
    const countOccurrences = (searchedText) =>
      previewCode.split(searchedText).length - 1;
    // The "And" and the condition after it, each once: the conditions inside
    // the "And" do not reuse their ids.
    expect(
      countOccurrences(
        `gdjs.eventsExecutionTracker.begin("${standardEventPtr}:c0")`
      )
    ).toBe(1);
    expect(
      countOccurrences(
        `gdjs.eventsExecutionTracker.begin("${standardEventPtr}:c1")`
      )
    ).toBe(1);
    // The conditions of the "While" are not tracked, its actions are.
    expect(previewCode).not.toContain(`"${whileEventPtr}:c0"`);
    expect(previewCode).toContain(
      `gdjs.eventsExecutionTracker.begin("${whileEventPtr}:a0")`
    );

    project.delete();
  });

  it('only reports the instructions that were executed', function () {
    const { project, layout, externalEvents } = makeProjectWithEvents();
    const events = layout.getEvents();
    const firstEventPtr = events.getEventAt(0).ptr;
    const secondEvent = events.getEventAt(1);
    const secondEventPtr = secondEvent.ptr;
    const subEventPtr = secondEvent.getSubEvents().getEventAt(0).ptr;
    const externalEventPtr = externalEvents.getEvents().getEventAt(0).ptr;

    const serializedProjectElement = new gd.SerializerElement();
    project.serializeTo(serializedProjectElement);
    const serializedSceneElement = new gd.SerializerElement();
    layout.serializeTo(serializedSceneElement);
    const { gdjs, runtimeScene } = makeMinimalGDJSMock({
      gameData: JSON.parse(gd.Serializer.toJSON(serializedProjectElement)),
      sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
    });

    const executedInstructionIds = [];
    gdjs.eventsExecutionTracker = {
      begin: () => {},
      end: (instructionExecutionId) => {
        executedInstructionIds.push(instructionExecutionId);
      },
    };

    const code = generateLayoutCode(project, layout, false);
    const runCompiledEvents = new Function(
      'gdjs',
      'runtimeScene',
      `"use strict";
       const Hashtable = gdjs.Hashtable;
       ${code}
       return gdjs['${layout.getName()}Code'].func(runtimeScene);`
    );
    runCompiledEvents(gdjs, runtimeScene);

    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(9);
    expect(executedInstructionIds).toEqual([
      `${firstEventPtr}:c0`,
      `${firstEventPtr}:a0`,
      // The condition is evaluated but false: neither the action nor the
      // sub-event run.
      `${secondEventPtr}:c0`,
      `${externalEventPtr}:a0`,
    ]);
    expect(executedInstructionIds).not.toContain(`${secondEventPtr}:a0`);
    expect(executedInstructionIds).not.toContain(`${subEventPtr}:a0`);

    project.delete();
  });
  it('tracks the instructions of the functions of extensions when asked', function () {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsFunction = eventsFunctionsExtension
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventsFunction.getEvents().unserializeFrom(
      project,
      gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            {
              type: { value: 'BuiltinCommonInstructions::Once' },
              parameters: [],
            },
          ],
          actions: [],
        },
      ])
    );
    const eventPtr = eventsFunction.getEvents().getEventAt(0).ptr;

    const generateFunctionCode = (generateEventsExecutionTracking) => {
      const codeGenerator = new gd.EventsFunctionsExtensionCodeGenerator(
        project
      );
      codeGenerator.setGenerateEventsExecutionTracking(
        generateEventsExecutionTracking
      );
      const includeFiles = new gd.SetString();
      const code = codeGenerator.generateFreeEventsFunctionCompleteCode(
        eventsFunctionsExtension,
        eventsFunction,
        'functionNamespace',
        includeFiles,
        // The extensions are always compiled "for runtime" by the editor.
        true
      );
      codeGenerator.delete();
      includeFiles.delete();
      return code;
    };

    // The instructions are tracked with the identity of the events of the
    // extension editor.
    expect(generateFunctionCode(true)).toContain(
      `gdjs.eventsExecutionTracker.begin("${eventPtr}:c0")`
    );
    // Nothing is generated (and nothing costs anything) otherwise.
    expect(generateFunctionCode(false)).not.toContain('eventsExecutionTracker');

    project.delete();
  });
});
