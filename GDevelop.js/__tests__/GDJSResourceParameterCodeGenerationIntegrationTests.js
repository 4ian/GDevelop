const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

describe('libGD.js - GDJS resource parameter code generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  /** The generated code of a scene playing a sound named by `soundValue`. */
  const generateSceneCodePlaying = (soundValue) => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    project.getResourcesManager().addResource((() => {
      const resource = new gd.AudioResource();
      resource.setName('Jump.mp3');
      resource.setFile('Jump.mp3');
      return resource;
    })());

    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'PlaySound' },
            parameters: ['', soundValue, '', '', ''],
          },
        ],
        events: [],
      },
    ]);
    layout.getEvents().unserializeFrom(project, serializerElement);
    serializerElement.delete();

    const includeFiles = new gd.SetString();
    const diagnosticReport = new gd.DiagnosticReport();
    const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
    const code = layoutCodeGenerator.generateLayoutCompleteCode(
      layout,
      includeFiles,
      diagnosticReport,
      true
    );
    layoutCodeGenerator.delete();
    includeFiles.delete();
    diagnosticReport.delete();
    project.delete();
    return code;
  };

  it('quotes the name of a resource chosen in the editor', function () {
    const code = generateSceneCodePlaying('Jump.mp3');
    // Every existing project stores a bare name: nothing must change for it.
    expect(code).toContain('"Jump.mp3"');
    expect(code).not.toContain('getVariables()');
  });

  it('generates an expression when the name is computed by the events', function () {
    const code = generateSceneCodePlaying('"step_" + "1" + ".mp3"');
    // Concatenated at runtime rather than quoted as one literal name.
    expect(code).toContain('"step_"');
    expect(code).toContain('".mp3"');
    expect(code).not.toContain('"\\"step_\\"');
  });

  it('leaves an unknown bare name as a literal', function () {
    // A typo in a resource name keeps failing at runtime exactly as before,
    // rather than becoming an expression that fails to generate.
    const code = generateSceneCodePlaying('Missing.mp3');
    expect(code).toContain('"Missing.mp3"');
  });

  describe('IsResourceExpression', () => {
    it('tells a computed name from the name of a resource', function () {
      expect(gd.ParameterMetadata.isResourceExpression('Jump.mp3')).toBe(false);
      expect(gd.ParameterMetadata.isResourceExpression('My Sound')).toBe(false);
      expect(gd.ParameterMetadata.isResourceExpression('"Jump.mp3"')).toBe(
        true
      );
      expect(
        gd.ParameterMetadata.isResourceExpression('Variable + ".mp3"')
      ).toBe(true);
      expect(
        gd.ParameterMetadata.isResourceExpression('ToString(Level) + ".mp3"')
      ).toBe(true);
    });
  });
});
