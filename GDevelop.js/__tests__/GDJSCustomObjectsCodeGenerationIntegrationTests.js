const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
  generateCompiledEventsForSerializedEventsBasedExtension,
} = require('../TestUtils/CodeGenerationHelpers.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const { makeTestExtensions } = require('../TestUtils/TestExtensions.js');

describe('libGD.js - GDJS Custom Object Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
    makeTestExtensions(gd);
  });

  it('generates a working custom object with properties (with different types), all used in an expression', () => {
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const extensionModule = generateCompiledEventsForSerializedEventsBasedExtension(
      gd,
      require('./extensions/EBObject.json'),
      gdjs,
      runtimeScene
    );

    const {
      objects: { Object },
    } = extensionModule;

    const object = new Object(runtimeScene, { content: {} });
    object.testProperties();

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(7);
    expect(runtimeScene.getVariables().has('SuccessStringVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessStringVariable').getAsString()
    ).toBe('2trueTest');
  });

  it('generates a working custom object function with parameters (with different types), all used in an expression ', () => {
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const extensionModule = generateCompiledEventsForSerializedEventsBasedExtension(
      gd,
      require('./extensions/EBObject.json'),
      gdjs,
      runtimeScene
    );

    const {
      objects: { Object },
    } = extensionModule;

    const object = new Object(runtimeScene, { content: {} });
    object.testParameters(16, '32', true, 'TestTest');

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(16 + 32 + 1);
    expect(runtimeScene.getVariables().has('SuccessStringVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessStringVariable').getAsString()
    ).toBe('16trueTestTest');
  });
});
