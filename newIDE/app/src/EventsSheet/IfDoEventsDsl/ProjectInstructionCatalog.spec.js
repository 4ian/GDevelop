// @flow

import {
  areLegacyEventsEquivalent,
  compileIfDoToLegacyEventsJson,
  convertLegacyEventsJsonToIfDo,
} from './index';
import {
  buildProjectDeprecatedInstructionCatalog,
  buildProjectInstructionCatalog,
  createCatalogInstructionFormatter,
  createCatalogInstructionResolver,
  mergeProjectInstructionCatalogs,
  serializeProjectInstructionCatalog,
  validateProjectInstructionCatalog,
} from './ProjectInstructionCatalog';
import { enumerateAllInstructions } from '../../InstructionOrExpression/EnumerateInstructions';
import { enumerateAllExpressions } from '../../InstructionOrExpression/EnumerateExpressions';
import { normalizeInstructionParameterDslName } from '../../Mcp/McpEventKnowledge';

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
  test('normalizes digit-leading parameter names into valid DSL identifiers', () => {
    expect(normalizeInstructionParameterDslName('3d_capability', 1)).toBe(
      'parameter_3d_capability'
    );
    expect(normalizeInstructionParameterDslName('object', 0)).toBe('object');
  });

  test('rejects catalog parameter names that the DSL cannot parse', () => {
    expect(() =>
      validateProjectInstructionCatalog({
        ...catalogFixture,
        actions: [
          {
            type: 'Invalid::Action',
            parameters: [{ dslName: '3d_capability' }],
          },
        ],
      })
    ).toThrow('invalid parameter');
  });

  test('round-trips an instruction whose displayed parameter starts with a digit', () => {
    const digitParameterCatalog = {
      ...catalogFixture,
      actions: [
        {
          type: 'FireBullet::RotateObject',
          parameters: [
            {
              dslName: normalizeInstructionParameterDslName('3d_capability', 0),
            },
          ],
        },
      ],
    };
    const input = JSON.stringify([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'FireBullet::RotateObject' },
            parameters: ['Object3D'],
          },
        ],
      },
    ]);
    const dsl = convertLegacyEventsJsonToIfDo(input, {
      formatInstruction: createCatalogInstructionFormatter(
        digitParameterCatalog
      ),
    });

    expect(dsl).toContain('parameter_3d_capability="Object3D"');
    expect(
      areLegacyEventsEquivalent(
        input,
        compileIfDoToLegacyEventsJson(dsl, {
          resolveInstruction: createCatalogInstructionResolver(
            digitParameterCatalog
          ),
        })
      )
    ).toBe(true);
  });

  test('compiles named catalog instructions with exact serialized operands', () => {
    const output = JSON.parse(
      compileIfDoToLegacyEventsJson(
        `if Network::Succeeded request_id="RequestId"\n` +
          `do Network::Send url="\\"https://example.com\\"" body="Variable(Payload)"\n`,
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

  test('quotes and round-trips an exact instruction type containing whitespace', () => {
    const spacedTypeCatalog = {
      ...catalogFixture,
      actions: [
        {
          type: 'Physics2::Remove joint',
          parameters: [
            { dslName: 'object' },
            { dslName: 'behavior' },
            { dslName: 'joint_id' },
          ],
        },
      ],
    };
    const input = JSON.stringify([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'Physics2::Remove joint' },
            parameters: ['Object', 'PhysicsBehavior', 'MouseJointID'],
          },
        ],
      },
    ]);
    const dsl = convertLegacyEventsJsonToIfDo(input, {
      formatInstruction: createCatalogInstructionFormatter(spacedTypeCatalog),
    });
    const output = compileIfDoToLegacyEventsJson(dsl, {
      resolveInstruction: createCatalogInstructionResolver(spacedTypeCatalog),
    });

    expect(dsl).toContain('do "Physics2::Remove joint"');
    expect(dsl).not.toContain('@exact');
    expect(areLegacyEventsEquivalent(input, output)).toBe(true);
  });

  test('round-trips the real Physics2 spaced instruction type used by templates', () => {
    const gd: libGDevelop = global.gd;
    // $FlowFixMe[cannot-resolve-module] The extension is loaded by the app in production.
    const physics2ExtensionModule = require('../../../../../Extensions/Physics2Behavior/JsExtension');
    const physics2Extension = physics2ExtensionModule.createExtension(
      message => message,
      gd
    );
    gd.JsPlatform.get().addNewExtension(physics2Extension);
    physics2Extension.delete();
    const project = gd.ProjectHelper.createNewGDJSProject();
    try {
      const authoringCatalog = buildProjectInstructionCatalog(project);
      const deprecatedCatalog = buildProjectDeprecatedInstructionCatalog(
        project
      );
      const completeCatalog = mergeProjectInstructionCatalogs(
        authoringCatalog,
        deprecatedCatalog
      );
      const instruction = completeCatalog.actions.find(
        ({ type }) => type === 'Physics2::Remove joint'
      );
      expect(instruction).toBeDefined();
      const input = JSON.stringify([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Physics2::Remove joint' },
              parameters: ['Object', 'PhysicsBehavior', 'MouseJointID'],
            },
          ],
        },
      ]);
      const dsl = convertLegacyEventsJsonToIfDo(input, {
        formatInstruction: createCatalogInstructionFormatter(completeCatalog),
      });
      const output = compileIfDoToLegacyEventsJson(dsl, {
        resolveInstruction: createCatalogInstructionResolver(completeCatalog),
      });

      expect(dsl).toContain('do "Physics2::Remove joint"');
      expect(dsl).not.toContain('@exact');
      expect(areLegacyEventsEquivalent(input, output)).toBe(true);
    } finally {
      project.delete();
      gd.JsPlatform.get().removeExtension('Physics2');
    }
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
    const deprecatedCatalog = buildProjectDeprecatedInstructionCatalog(project);
    const serializationCatalog = mergeProjectInstructionCatalogs(
      catalog,
      deprecatedCatalog
    );
    const serialized = serializeProjectInstructionCatalog(catalog);
    const deprecatedActionTypes = new Set(
      enumerateAllInstructions(false, project, (null: any), {
        includeHiddenAndCompatibility: true,
      })
        .filter(
          ({ metadata }) =>
            metadata.isHidden() || !!metadata.getDeprecationMessage()
        )
        .map(({ type }) => type)
    );
    const deprecatedConditionTypes = new Set(
      enumerateAllInstructions(true, project, (null: any), {
        includeHiddenAndCompatibility: true,
      })
        .filter(
          ({ metadata }) =>
            metadata.isHidden() || !!metadata.getDeprecationMessage()
        )
        .map(({ type }) => type)
    );
    const deprecatedExpressionKeys = new Set(
      enumerateAllExpressions('', project, (null: any))
        .filter(
          ({ metadata }) =>
            !metadata.isShown() ||
            metadata.isDeprecated() ||
            !!metadata.getDeprecationMessage()
        )
        .map(({ type, metadata }) => `${type}\u0000${metadata.getReturnType()}`)
    );

    expect(catalog.counts.actions).toBeGreaterThan(100);
    expect(catalog.counts.conditions).toBeGreaterThan(100);
    expect(catalog.counts.expressions).toBeGreaterThan(100);
    expect(
      deprecatedActionTypes.size + deprecatedConditionTypes.size
    ).toBeGreaterThan(0);
    expect(
      catalog.actions.some(({ type }) => deprecatedActionTypes.has(type))
    ).toBe(false);
    expect(
      catalog.conditions.some(({ type }) => deprecatedConditionTypes.has(type))
    ).toBe(false);
    expect(
      catalog.expressions.some(({ type, returnType }) =>
        deprecatedExpressionKeys.has(`${type}\u0000${returnType}`)
      )
    ).toBe(false);
    expect(
      serializationCatalog.actions.some(({ type }) =>
        deprecatedActionTypes.has(type)
      ) ||
        serializationCatalog.conditions.some(({ type }) =>
          deprecatedConditionTypes.has(type)
        )
    ).toBe(true);
    expect(
      deprecatedCatalog.actions.some(({ type }) =>
        catalog.actions.some(entry => entry.type === type)
      )
    ).toBe(false);
    expect(
      deprecatedCatalog.conditions.some(({ type }) =>
        catalog.conditions.some(entry => entry.type === type)
      )
    ).toBe(false);
    expect(
      deprecatedCatalog.authoring.rules.some(rule =>
        rule.startsWith('Never use this catalog to construct new events')
      )
    ).toBe(true);
    expect(
      [...catalog.actions, ...catalog.conditions, ...catalog.expressions].some(
        entry => entry.deprecationMessage !== undefined
      )
    ).toBe(false);
    expect(
      catalog.actions.some(({ type }) => type === 'TextObject::String')
    ).toBe(false);
    expect(
      catalog.conditions.some(({ type }) => type === 'TextObject::String')
    ).toBe(false);
    expect(
      catalog.expressions.some(({ type }) => type === 'TextObject::String')
    ).toBe(false);
    expect(catalog.authoring.catalogConditionSyntax).toBe(
      'if InstructionType dslName="exact serialized operand" (JSON-quote the exact type when it contains whitespace)'
    );
    expect(catalog.authoring.catalogActionSyntax).toBe(
      'do InstructionType dslName="exact serialized operand" (JSON-quote the exact type when it contains whitespace)'
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
      formatInstruction: createCatalogInstructionFormatter(
        serializationCatalog
      ),
    });
    expect(compatibilityDsl).not.toContain('@exact');
    expect(
      areLegacyEventsEquivalent(
        compatibilityInput,
        compileIfDoToLegacyEventsJson(compatibilityDsl, {
          resolveInstruction: createCatalogInstructionResolver(
            serializationCatalog
          ),
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
