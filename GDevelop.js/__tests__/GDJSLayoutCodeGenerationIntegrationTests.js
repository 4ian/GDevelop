const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const {
  generateCompiledEventsForLayout,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Scene Code Generation integration tests', function () {
  let gd = null;
  beforeAll((done) =>
    initializeGDevelopJs().then((module) => {
      gd = module;
      done();
    })
  );

  it('does generate code for a link to an external events', function () {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const serializedLayoutEvents = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '+', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '+', '2'],
          },
        ],
        events: [
          {
            type: 'BuiltinCommonInstructions::Link',
            target: 'External events 1',
          },
        ],
      },
    ]);
    layout.getEvents().unserializeFrom(project, serializedLayoutEvents);

    const externalEvents = project.insertNewExternalEvents(
      'External events 1',
      0
    );
    const serializedExternalEventsEvents = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '+', '4'],
          },
        ],
        events: [],
      },
      // The new event is disabled, so not executed. And the link
      // should not be inserted (so no infinite loop), because it's not
      // even processed (as it's inside a disabled event).
      {
        type: 'BuiltinCommonInstructions::Standard',
        disabled: true,
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '+', '8'],
          },
        ],
        events: [
          {
            type: 'BuiltinCommonInstructions::Link',
            target: 'External events 1',
          },
        ],
      },
    ]);

    externalEvents
      .getEvents()
      .unserializeFrom(project, serializedExternalEventsEvents);

    const runCompiledEvents = generateCompiledEventsForLayout(
      gd,
      project,
      layout
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene);

    expect(runtimeScene.getVariables().has('Counter')).toBe(true);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(7);

    project.delete();
  });

  it('does generate code for nested links to external events', function () {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const serializedLayoutEvents = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Link',
        target: 'External events 1',
      },
    ]);
    layout.getEvents().unserializeFrom(project, serializedLayoutEvents);

    const externalEvents1 = project.insertNewExternalEvents(
      'External events 1',
      0
    );
    const serializedExternalEvents1Events = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Link',
        target: 'External events 2',
      },
      {
        type: 'BuiltinCommonInstructions::Link',
        target: 'External events 2',
      },
    ]);

    externalEvents1
      .getEvents()
      .unserializeFrom(project, serializedExternalEvents1Events);

    const externalEvents2 = project.insertNewExternalEvents(
      'External events 2',
      0
    );
    const serializedExternalEvents2Events = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '+', '1'],
          },
        ],
        events: [],
      },
    ]);

    externalEvents2
      .getEvents()
      .unserializeFrom(project, serializedExternalEvents2Events);

    const runCompiledEvents = generateCompiledEventsForLayout(
      gd,
      project,
      layout
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene);

    expect(runtimeScene.getVariables().has('Counter')).toBe(true);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(2);

    project.delete();
  });
});
