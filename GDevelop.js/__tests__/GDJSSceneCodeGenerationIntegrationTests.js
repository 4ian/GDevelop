const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const {
  generateCompiledEventsForLayout,
  generateCompiledEventsForEventsFunctionWithContext,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Scene Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  it('generates code for a link to an external events', function () {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    layout.getVariables().insertNew('Counter', 0).setValue(0);
    const serializedLayoutEvents = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
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
        conditions: [],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
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
            type: { value: 'SetNumberVariable' },
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
            type: { value: 'SetNumberVariable' },
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

    const serializedProjectElement = new gd.SerializerElement();
    project.serializeTo(serializedProjectElement);

    const serializedSceneElement = new gd.SerializerElement();
    layout.serializeTo(serializedSceneElement);

    const runCompiledEvents = generateCompiledEventsForLayout(
      gd,
      project,
      layout
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock({
      gameData: JSON.parse(gd.Serializer.toJSON(serializedProjectElement)),
      sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
    });
    runCompiledEvents(gdjs, runtimeScene);

    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(7);

    project.delete();
  });

  it('generates code for nested links to external events', function () {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    layout.getVariables().insertNew('Counter', 0).setValue(0);
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
            type: { value: 'SetNumberVariable' },
            parameters: ['Counter', '+', '1'],
          },
        ],
        events: [],
      },
    ]);

    externalEvents2
      .getEvents()
      .unserializeFrom(project, serializedExternalEvents2Events);

    const serializedProjectElement = new gd.SerializerElement();
    project.serializeTo(serializedProjectElement);

    const serializedSceneElement = new gd.SerializerElement();
    layout.serializeTo(serializedSceneElement);

    const runCompiledEvents = generateCompiledEventsForLayout(
      gd,
      project,
      layout
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock({
      gameData: JSON.parse(gd.Serializer.toJSON(serializedProjectElement)),
      sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
    });
    runCompiledEvents(gdjs, runtimeScene);

    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(2);

    project.delete();
  });

  it('replaces static data placeholders in string action and condition parameters for scene and external events', function () {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.setStaticDataJson(
      JSON.stringify({
        labels: {
          scene: 'Scene label',
          external: 'External label',
        },
        signals: {
          scene: 'SceneSignal',
          external: 'ExternalSignal',
        },
      })
    );
    const layout = project.insertNewLayout('Scene', 0);
    layout.getVariables().insertNew('SceneText', 0).setString('');
    layout.getVariables().insertNew('ExternalText', 1).setString('');
    layout.getVariables().insertNew('SceneGate', 2).setString('SceneSignal');
    layout
      .getVariables()
      .insertNew('ExternalGate', 3)
      .setString('ExternalSignal');
    const serializedLayoutEvents = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'StringVariable' },
            parameters: ['SceneGate', '=', '"{{signals.scene}}"'],
          },
        ],
        actions: [
          {
            type: { value: 'SetStringVariable' },
            parameters: ['SceneText', '=', '"{{labels.scene}}"'],
          },
          {
            type: { value: 'EmitSceneSignal' },
            parameters: [
              '',
              '"{{signals.scene}}"',
              '"Payload: {{labels.scene}}"',
            ],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Link',
        target: 'External events 1',
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
        conditions: [
          {
            type: { value: 'StringVariable' },
            parameters: ['ExternalGate', '=', '"{{signals.external}}"'],
          },
        ],
        actions: [
          {
            type: { value: 'SetStringVariable' },
            parameters: [
              'ExternalText',
              '=',
              '"External: {{labels.external}}"',
            ],
          },
        ],
        events: [],
      },
    ]);
    externalEvents
      .getEvents()
      .unserializeFrom(project, serializedExternalEventsEvents);

    const serializedProjectElement = new gd.SerializerElement();
    project.serializeTo(serializedProjectElement);

    const serializedSceneElement = new gd.SerializerElement();
    layout.serializeTo(serializedSceneElement);

    const runCompiledEvents = generateCompiledEventsForLayout(
      gd,
      project,
      layout
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock({
      gameData: JSON.parse(gd.Serializer.toJSON(serializedProjectElement)),
      sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
    });
    const emittedSignals = [];
    gdjs.evtTools.signal = {
      emitSceneSignal: (_runtimeScene, signalName, payload) => {
        emittedSignals.push({ signalName, payload });
      },
    };
    runCompiledEvents(gdjs, runtimeScene);

    expect(runtimeScene.getVariables().get('SceneText').getAsString()).toBe(
      'Scene label'
    );
    expect(runtimeScene.getVariables().get('ExternalText').getAsString()).toBe(
      'External: External label'
    );
    expect(emittedSignals).toEqual([
      { signalName: 'SceneSignal', payload: 'Payload: Scene label' },
    ]);

    serializedProjectElement.delete();
    serializedSceneElement.delete();
    serializedLayoutEvents.delete();
    serializedExternalEventsEvents.delete();
    project.delete();
  });

  it('replaces static data placeholders in extension event actions and conditions', function () {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.setStaticDataJson(
      JSON.stringify({
        labels: {
          extension: 'Extension label',
        },
        signals: {
          extension: 'ExtensionSignal',
        },
      })
    );
    const layout = project.insertNewLayout('Scene', 0);
    const extension = project.insertNewEventsFunctionsExtension('Extension', 0);
    extension.getSceneVariables().insertNew('Result', 0).setString('');
    const eventsFunction = new gd.EventsFunction();
    eventsFunction
      .getParameters()
      .insertNewParameter('SignalName', 0)
      .setType('string');

    const serializedEvents = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'StringVariable' },
            parameters: ['SignalName', '=', '"{{signals.extension}}"'],
          },
        ],
        actions: [
          {
            type: { value: 'SetStringVariable' },
            parameters: ['Result', '=', '"{{labels.extension}}"'],
          },
        ],
        events: [],
      },
    ]);
    eventsFunction.getEvents().unserializeFrom(project, serializedEvents);

    const serializedProjectElement = new gd.SerializerElement();
    project.serializeTo(serializedProjectElement);

    const serializedSceneElement = new gd.SerializerElement();
    layout.serializeTo(serializedSceneElement);

    const runCompiledEvents =
      generateCompiledEventsForEventsFunctionWithContext(
        gd,
        project,
        extension,
        eventsFunction
      );
    const { gdjs, runtimeScene } = makeMinimalGDJSMock({
      gameData: JSON.parse(gd.Serializer.toJSON(serializedProjectElement)),
      sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
    });
    runCompiledEvents(gdjs, runtimeScene, ['ExtensionSignal']);

    expect(
      runtimeScene
        .getVariablesForExtension('Extension')
        .get('Result')
        .getAsString()
    ).toBe('Extension label');

    serializedProjectElement.delete();
    serializedSceneElement.delete();
    serializedEvents.delete();
    eventsFunction.delete();
    project.delete();
  });

  describe('(Scene) variable code generation', () => {
    let project = null;
    let layout = null;
    beforeEach(() => {
      project = new gd.ProjectHelper.createNewGDJSProject();
      layout = project.insertNewLayout('Scene', 0);
      layout.getObjects().insertNewObject(project, '', 'MyObject', 0);

      // These variables are "simple" and their type will be known at code generation.
      layout.getVariables().insertNew('MyNumberVariable', 0).setValue(123);
      layout.getVariables().insertNew('MyStringVariable', 1).setString('Test');
      layout
        .getVariables()
        .insertNew('MyOtherStringVariable', 1)
        .setString('SomeChild');

      // Use a variable that has a value deep inside a structure - so code generation
      // does not know its type and will issue a `getAsNumberOrString`.
      layout
        .getVariables()
        .insertNew('MyOtherStructureVariable', 1)
        .getChild('Child')
        .getChild('SubChild')
        .setString('SomeOtherChild');
      const structureVariable = layout
        .getVariables()
        .insertNew('MyStructureVariable', 2);

      // Make a structure that we will address using other variables.
      structureVariable.getChild('Test').setValue(1);
      structureVariable.getChild('123').setValue(2);
      structureVariable.getChild('42').setValue(4);
      structureVariable.getChild('MyObject').setValue(8);
      structureVariable.getChild('SomeChild').getChild('Test').setValue(16);
      structureVariable.getChild('SomeChild').getChild('123').setValue(32);
      structureVariable.getChild('SomeChild').getChild('42').setValue(64);
      structureVariable
        .getChild('SomeChild')
        .getChild('MyObject')
        .setValue(128);
      structureVariable
        .getChild('SomeChild')
        .getChild('SomeOtherChild')
        .getChild('Test')
        .setValue(256);
      structureVariable
        .getChild('SomeChild')
        .getChild('SomeOtherChild')
        .getChild('123')
        .setValue(512);
      structureVariable
        .getChild('SomeChild')
        .getChild('SomeOtherChild')
        .getChild('42')
        .setValue(1024);
      structureVariable
        .getChild('SomeChild')
        .getChild('SomeOtherChild')
        .getChild('MyObject')
        .setValue(2048);
    });
    afterEach(() => {
      project.delete();
    });

    it('generates code for structure variables accessed by another variable (1 level)', function () {
      layout.getVariables().insertNew('Counter', 0).setValue(0);
      const serializedLayoutEvents = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'SetNumberVariable' },
              parameters: [
                'Counter',
                '+',
                'MyStructureVariable[MyStringVariable] + MyStructureVariable[MyNumberVariable] + MyStructureVariable[MyObject.X()] + MyStructureVariable[MyObject.ObjectName()]',
              ],
            },
          ],
          events: [],
        },
      ]);
      layout.getEvents().unserializeFrom(project, serializedLayoutEvents);

      const runCompiledEvents = generateCompiledEventsForLayout(
        gd,
        project,
        layout
      );

      const serializedSceneElement = new gd.SerializerElement();
      layout.serializeTo(serializedSceneElement);

      const { gdjs, runtimeScene } = makeMinimalGDJSMock({
        sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
      });
      serializedSceneElement.delete();
      const myObjectInstance = runtimeScene.createObject('MyObject');
      myObjectInstance.setX(42);
      runCompiledEvents(gdjs, runtimeScene);

      expect(runtimeScene.getVariables().has('Counter')).toBe(true);
      expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
        1 + 2 + 4 + 8
      );
    });

    it('generates code for structure variables accessed by another variable (2 levels)', function () {
      layout.getVariables().insertNew('Counter', 0).setValue(0);
      const serializedLayoutEvents = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'SetNumberVariable' },
              parameters: [
                'Counter',
                '+',
                'MyStructureVariable.SomeChild[MyStringVariable] + MyStructureVariable.SomeChild[MyNumberVariable] + MyStructureVariable.SomeChild[MyObject.X()] + MyStructureVariable.SomeChild[MyObject.ObjectName()]',
              ],
            },
          ],
          events: [],
        },
      ]);
      layout.getEvents().unserializeFrom(project, serializedLayoutEvents);

      const runCompiledEvents = generateCompiledEventsForLayout(
        gd,
        project,
        layout
      );

      const serializedSceneElement = new gd.SerializerElement();
      layout.serializeTo(serializedSceneElement);

      const { gdjs, runtimeScene } = makeMinimalGDJSMock({
        sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
      });
      serializedSceneElement.delete();
      const myObjectInstance = runtimeScene.createObject('MyObject');
      myObjectInstance.setX(42);
      runCompiledEvents(gdjs, runtimeScene);

      expect(runtimeScene.getVariables().has('Counter')).toBe(true);
      expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
        16 + 32 + 64 + 128
      );
    });

    it('generates code for structure variables accessed by another variable (3 levels)', function () {
      layout.getVariables().insertNew('Counter', 0).setValue(0);
      const serializedLayoutEvents = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'SetNumberVariable' },
              parameters: [
                'Counter',
                '+',
                'MyStructureVariable[MyOtherStringVariable][MyOtherStructureVariable.Child.SubChild][MyStringVariable] +MyStructureVariable[MyOtherStringVariable][MyOtherStructureVariable.Child.SubChild][MyNumberVariable] + MyStructureVariable[MyOtherStringVariable][MyOtherStructureVariable.Child.SubChild][MyObject.X()] + MyStructureVariable[MyOtherStringVariable][MyOtherStructureVariable.Child.SubChild][MyObject.ObjectName()]',
              ],
            },
          ],
          events: [],
        },
      ]);
      layout.getEvents().unserializeFrom(project, serializedLayoutEvents);

      const runCompiledEvents = generateCompiledEventsForLayout(
        gd,
        project,
        layout
      );

      const serializedSceneElement = new gd.SerializerElement();
      layout.serializeTo(serializedSceneElement);

      const { gdjs, runtimeScene } = makeMinimalGDJSMock({
        sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
      });
      serializedSceneElement.delete();
      const myObjectInstance = runtimeScene.createObject('MyObject');
      myObjectInstance.setX(42);
      runCompiledEvents(gdjs, runtimeScene);

      expect(runtimeScene.getVariables().has('Counter')).toBe(true);
      expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
        256 + 512 + 1024 + 2048
      );
    });
  });
});
