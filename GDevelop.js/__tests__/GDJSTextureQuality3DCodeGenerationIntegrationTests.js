const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsForLayout,
} = require('../TestUtils/CodeGenerationHelpers.js');

const TEXTURE_QUALITY_INCLUDE_FILE = 'TextureQuality3DManager.js';

function load3DExtension(gd) {
  const platform = gd.JsPlatform.get();
  if (platform.isExtensionLoaded('Scene3D')) {
    return;
  }

  const extensionModule = require('../../Extensions/3D/JsExtension.js');
  const extension = extensionModule.createExtension((str) => str, gd);
  platform.addNewExtension(extension);
  extension.delete();
}

function createLayoutWithEvents(gd, serializedEvents) {
  const project = gd.ProjectHelper.createNewGDJSProject();
  const layout = project.insertNewLayout('Scene', 0);

  const eventsSerializerElement = gd.Serializer.fromJSObject(serializedEvents);
  layout.getEvents().unserializeFrom(project, eventsSerializerElement);
  eventsSerializerElement.delete();

  return { project, layout };
}

function makeLayoutGDJSMock(gd, layout) {
  const serializedSceneElement = new gd.SerializerElement();
  layout.serializeTo(serializedSceneElement);
  const sceneData = JSON.parse(gd.Serializer.toJSON(serializedSceneElement));
  serializedSceneElement.delete();

  return makeMinimalGDJSMock({ sceneData });
}

function generateLayoutCode(gd, project, layout) {
  const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
  const includeFiles = new gd.SetString();
  const diagnosticReport = new gd.DiagnosticReport();

  const code = layoutCodeGenerator.generateLayoutCompleteCode(
    layout,
    includeFiles,
    diagnosticReport,
    true
  );
  const includeFilesArray = includeFiles.toNewVectorString().toJSArray();

  diagnosticReport.delete();
  includeFiles.delete();
  layoutCodeGenerator.delete();

  return { code, includeFiles: includeFilesArray };
}

describe('libGD.js - GDJS Texture Quality 3D Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
    load3DExtension(gd);
  });

  it('passes the runtime scene and parameters to texture quality actions', function () {
    const { project, layout } = createLayoutWithEvents(gd, [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'Scene3D::SetTextureQualityPreset' },
            parameters: ['', '"quality"'],
          },
          {
            type: { value: 'Scene3D::SetTextureQualityEnabled' },
            parameters: ['', 'yes'],
          },
          {
            type: { value: 'Scene3D::SetTextureAnisotropy' },
            parameters: ['', '8'],
          },
          {
            type: { value: 'Scene3D::SetMaxTextureResolution' },
            parameters: ['', '2048'],
          },
        ],
        events: [],
      },
    ]);

    const { code, includeFiles } = generateLayoutCode(gd, project, layout);

    expect(code).toContain(
      'gdjs.textureQuality3d.setPreset(runtimeScene, "quality");'
    );
    expect(code).toContain(
      'gdjs.textureQuality3d.setEnabled(runtimeScene, true);'
    );
    expect(code).toContain(
      'gdjs.textureQuality3d.setAnisotropy(runtimeScene, 8);'
    );
    expect(code).toContain(
      'gdjs.textureQuality3d.setMaxTextureResolution(runtimeScene, 2048);'
    );
    expect(includeFiles).toContain(TEXTURE_QUALITY_INCLUDE_FILE);

    const runCompiledEvents = generateCompiledEventsForLayout(
      gd,
      project,
      layout
    );
    const { gdjs, runtimeScene } = makeLayoutGDJSMock(gd, layout);

    const calls = [];
    gdjs.textureQuality3d = {
      setPreset: (...args) => calls.push(['setPreset', args]),
      setEnabled: (...args) => calls.push(['setEnabled', args]),
      setAnisotropy: (...args) => calls.push(['setAnisotropy', args]),
      setMaxTextureResolution: (...args) =>
        calls.push(['setMaxTextureResolution', args]),
    };

    runCompiledEvents(gdjs, runtimeScene);

    expect(calls).toHaveLength(4);
    expect(calls[0]).toEqual(['setPreset', [runtimeScene, 'quality']]);
    expect(calls[1]).toEqual(['setEnabled', [runtimeScene, true]]);
    expect(calls[2]).toEqual(['setAnisotropy', [runtimeScene, 8]]);
    expect(calls[3]).toEqual([
      'setMaxTextureResolution',
      [runtimeScene, 2048],
    ]);

    project.delete();
  });

  it('passes the runtime scene to the texture quality condition', function () {
    const { project, layout } = createLayoutWithEvents(gd, [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'Scene3D::IsTextureQualityEnabled' },
            parameters: [''],
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
    ]);
    layout.getVariables().insertNew('Counter', 0).setValue(0);

    const { code, includeFiles } = generateLayoutCode(gd, project, layout);

    expect(code).toContain(
      'isConditionTrue_0 = gdjs.textureQuality3d.isEnabled(runtimeScene);'
    );
    expect(includeFiles).toContain(TEXTURE_QUALITY_INCLUDE_FILE);

    const runCompiledEvents = generateCompiledEventsForLayout(
      gd,
      project,
      layout
    );
    const { gdjs, runtimeScene } = makeLayoutGDJSMock(gd, layout);

    const calls = [];
    let isEnabled = true;
    gdjs.textureQuality3d = {
      isEnabled: (...args) => {
        calls.push(['isEnabled', args]);
        return isEnabled;
      },
    };

    runCompiledEvents(gdjs, runtimeScene);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(1);

    // The condition result must still control the actions.
    isEnabled = false;
    runCompiledEvents(gdjs, runtimeScene);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(1);

    expect(calls).toHaveLength(2);
    expect(calls[0]).toEqual(['isEnabled', [runtimeScene]]);
    expect(calls[1]).toEqual(['isEnabled', [runtimeScene]]);

    project.delete();
  });

  it('passes the runtime scene to texture quality expressions', function () {
    const { project, layout } = createLayoutWithEvents(gd, [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: [
              'TextureMemoryUsed',
              '=',
              'Scene3D::TextureMemoryUsedMB()',
            ],
          },
          {
            type: { value: 'SetNumberVariable' },
            parameters: [
              'TrackedTextures',
              '=',
              'Scene3D::TrackedTextureCount()',
            ],
          },
          {
            type: { value: 'SetNumberVariable' },
            parameters: [
              'MaxAnisotropy',
              '=',
              'Scene3D::MaxSupportedAnisotropy()',
            ],
          },
          {
            type: { value: 'SetNumberVariable' },
            parameters: [
              'MaxTextureSize',
              '=',
              'Scene3D::MaxSupportedTextureSize()',
            ],
          },
        ],
        events: [],
      },
    ]);
    layout.getVariables().insertNew('TextureMemoryUsed', 0).setValue(0);
    layout.getVariables().insertNew('TrackedTextures', 0).setValue(0);
    layout.getVariables().insertNew('MaxAnisotropy', 0).setValue(0);
    layout.getVariables().insertNew('MaxTextureSize', 0).setValue(0);

    const { code, includeFiles } = generateLayoutCode(gd, project, layout);

    expect(code).toContain(
      'gdjs.textureQuality3d.getTextureMemoryMb(runtimeScene)'
    );
    expect(code).toContain(
      'gdjs.textureQuality3d.getTrackedTextureCount(runtimeScene)'
    );
    expect(code).toContain(
      'gdjs.textureQuality3d.getMaxSupportedAnisotropy(runtimeScene)'
    );
    expect(code).toContain(
      'gdjs.textureQuality3d.getMaxSupportedTextureSize(runtimeScene)'
    );
    expect(includeFiles).toContain(TEXTURE_QUALITY_INCLUDE_FILE);

    const runCompiledEvents = generateCompiledEventsForLayout(
      gd,
      project,
      layout
    );
    const { gdjs, runtimeScene } = makeLayoutGDJSMock(gd, layout);

    const calls = [];
    gdjs.textureQuality3d = {
      getTextureMemoryMb: (...args) => {
        calls.push(['getTextureMemoryMb', args]);
        return 12.5;
      },
      getTrackedTextureCount: (...args) => {
        calls.push(['getTrackedTextureCount', args]);
        return 7;
      },
      getMaxSupportedAnisotropy: (...args) => {
        calls.push(['getMaxSupportedAnisotropy', args]);
        return 8;
      },
      getMaxSupportedTextureSize: (...args) => {
        calls.push(['getMaxSupportedTextureSize', args]);
        return 4096;
      },
    };

    runCompiledEvents(gdjs, runtimeScene);

    expect(calls).toHaveLength(4);
    expect(calls[0]).toEqual(['getTextureMemoryMb', [runtimeScene]]);
    expect(calls[1]).toEqual(['getTrackedTextureCount', [runtimeScene]]);
    expect(calls[2]).toEqual(['getMaxSupportedAnisotropy', [runtimeScene]]);
    expect(calls[3]).toEqual(['getMaxSupportedTextureSize', [runtimeScene]]);

    expect(
      runtimeScene.getVariables().get('TextureMemoryUsed').getAsNumber()
    ).toBe(12.5);
    expect(
      runtimeScene.getVariables().get('TrackedTextures').getAsNumber()
    ).toBe(7);
    expect(
      runtimeScene.getVariables().get('MaxAnisotropy').getAsNumber()
    ).toBe(8);
    expect(
      runtimeScene.getVariables().get('MaxTextureSize').getAsNumber()
    ).toBe(4096);

    project.delete();
  });
});
