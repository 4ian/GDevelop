// @flow

import {
  areLegacyEventsEquivalent,
  compileIfDoToLegacyEventsJson,
  convertLegacyEventsJsonToIfDo,
} from './index';
import {
  buildProjectInstructionCatalog,
  createCatalogInstructionFormatter,
  createCatalogInstructionResolver,
  serializeProjectInstructionCatalog,
  validateProjectInstructionCatalog,
} from './ProjectInstructionCatalog';

const catalogFixture = {
  format: 'gdevelop-ifdo-instruction-catalog',
  formatVersion: 1,
  actions: [
    {
      type: 'Network::Send',
      parameters: [
        { dslName: 'url', isOptional: false, isCodeOnly: false },
        { dslName: 'body', isOptional: false, isCodeOnly: false },
        { dslName: 'runtime', isOptional: false, isCodeOnly: true },
      ],
    },
  ],
  conditions: [
    {
      type: 'Network::Succeeded',
      parameters: [
        {
          dslName: 'request_id',
          isOptional: false,
          isCodeOnly: false,
        },
      ],
    },
  ],
  expressions: [],
};

describe('project IfDo instruction catalog', () => {
  test('compiles named catalog instructions with exact serialized operands', () => {
    const output = JSON.parse(
      compileIfDoToLegacyEventsJson(
        `if Network::Succeeded request_id="RequestId"\n` +
          `do Network::Send url="\\\"https://example.com\\\"" body="Variable(Payload)"\n`,
        { resolveInstruction: createCatalogInstructionResolver(catalogFixture) }
      )
    );

    expect(output[0].conditions[0]).toMatchObject({
      type: { value: 'Network::Succeeded' },
      parameters: ['RequestId'],
    });
    expect(output[0].actions[0]).toMatchObject({
      type: { value: 'Network::Send' },
      parameters: ['"https://example.com"', 'Variable(Payload)', ''],
    });
  });

  test('decompiles and recompiles catalog instructions without @exact', () => {
    const input = JSON.stringify([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'Network::Succeeded' },
            parameters: ['RequestId'],
          },
        ],
        actions: [
          {
            type: { value: 'Network::Send' },
            parameters: ['"https://example.com"', 'Variable(Payload)', ''],
          },
        ],
      },
    ]);
    const dsl = convertLegacyEventsJsonToIfDo(input, {
      formatInstruction: createCatalogInstructionFormatter(catalogFixture),
    });
    const output = compileIfDoToLegacyEventsJson(dsl, {
      resolveInstruction: createCatalogInstructionResolver(catalogFixture),
    });

    expect(dsl).toContain('if Network::Succeeded request_id="RequestId"');
    expect(dsl).toContain('do Network::Send');
    expect(dsl).not.toContain('runtime=');
    expect(dsl).not.toContain('@exact');
    expect(areLegacyEventsEquivalent(input, output)).toBe(true);
  });

  test('rejects the removed @ catalog prefix', () => {
    expect(() =>
      compileIfDoToLegacyEventsJson('do @Network::Send url="x" body="y"\n', {
        resolveInstruction: createCatalogInstructionResolver(catalogFixture),
      })
    ).toThrow('expected InstructionType');
  });

  test('generates a deterministic complete catalog from the loaded platform', () => {
    const gd: libGDevelop = global.gd;
    const project = gd.ProjectHelper.createNewGDJSProject();
    const catalog = buildProjectInstructionCatalog(project);
    const serialized = serializeProjectInstructionCatalog(catalog);

    expect(catalog.counts.actions).toBeGreaterThan(100);
    expect(catalog.counts.conditions).toBeGreaterThan(100);
    expect(catalog.counts.expressions).toBeGreaterThan(100);
    expect(catalog.authoring.catalogConditionSyntax).toBe(
      'if InstructionType dslName="exact serialized operand"'
    );
    expect(catalog.authoring.catalogActionSyntax).toBe(
      'do InstructionType dslName="exact serialized operand"'
    );
    expect(
      catalog.authoring.rules.some(rule =>
        rule.startsWith('Never write @exact')
      )
    ).toBe(true);
    expect(
      [...catalog.actions, ...catalog.conditions, ...catalog.expressions].some(
        entry => entry.kind !== undefined
      )
    ).toBe(false);
    expect(
      [...catalog.actions, ...catalog.conditions, ...catalog.expressions].some(
        entry =>
          entry.parameters.some(parameter => parameter.index !== undefined)
      )
    ).toBe(false);
    const sceneInput = JSON.stringify([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'SceneJustBegins' },
            parameters: [''],
          },
        ],
        actions: [],
      },
    ]);
    const sceneDsl = convertLegacyEventsJsonToIfDo(sceneInput, {
      formatInstruction: createCatalogInstructionFormatter(catalog),
    });
    expect(sceneDsl).toContain('if SceneJustBegins');
    expect(sceneDsl).not.toContain('scene begins');
    expect(sceneDsl).not.toContain('parameter_0=');
    expect(
      areLegacyEventsEquivalent(
        sceneInput,
        compileIfDoToLegacyEventsJson(sceneDsl, {
          resolveInstruction: createCatalogInstructionResolver(catalog),
        })
      )
    ).toBe(true);
    expect(
      catalog.actions.some(entry => entry.type === 'SetNumberVariable')
    ).toBe(true);
    expect(
      catalog.conditions.some(entry => entry.type === 'SceneJustBegins')
    ).toBe(true);
    ['MettreX', 'MettreY', 'SetBooleanVariable'].forEach(type => {
      expect(catalog.actions.some(entry => entry.type === type)).toBe(true);
    });
    ['BooleanVariable', 'SourisSurObjet', 'ObjectTimer', 'Egal'].forEach(
      type => {
        expect(catalog.conditions.some(entry => entry.type === type)).toBe(
          true
        );
      }
    );
    const compatibilityInput = JSON.stringify([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'BooleanVariable' },
            parameters: ['Disabled', 'True', ''],
          },
          {
            type: { value: 'Egal' },
            parameters: ['Variable(Value)', '=', '1'],
          },
        ],
        actions: [
          {
            type: { value: 'MettreX' },
            parameters: ['Object', '+', '1'],
          },
          {
            type: { value: 'SetBooleanVariable' },
            parameters: ['Disabled', 'True', ''],
          },
        ],
      },
    ]);
    const compatibilityDsl = convertLegacyEventsJsonToIfDo(compatibilityInput, {
      formatInstruction: createCatalogInstructionFormatter(catalog),
    });
    expect(compatibilityDsl).not.toContain('@exact');
    expect(
      areLegacyEventsEquivalent(
        compatibilityInput,
        compileIfDoToLegacyEventsJson(compatibilityDsl, {
          resolveInstruction: createCatalogInstructionResolver(catalog),
        })
      )
    ).toBe(true);
    expect(Array.isArray(catalog.actions[0].eventScopes)).toBe(true);
    expect(catalog.actions[0].iconFilename).toBeUndefined();
    expect(catalog.actions[0].parameterShape).toBeUndefined();
    expect(catalog.actions[0].parameters[0].valueType).toBeUndefined();
    expect(() =>
      validateProjectInstructionCatalog(JSON.parse(serialized))
    ).not.toThrow();
    expect(serialized.length).toBeLessThan(1000000);
    expect(serialized.split('\n').length).toBeGreaterThan(
      catalog.counts.actions +
        catalog.counts.conditions +
        catalog.counts.expressions
    );
    expect(serialized.endsWith('\n')).toBe(true);
    project.delete();
  });
});
