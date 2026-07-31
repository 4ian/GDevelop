// @flow

import {
  areLegacyEventsEquivalent,
  compileIfDoToLegacyEventsJson,
  convertLegacyEventsJsonToIfDo,
} from './index';
import {
  buildProjectDeprecatedInstructionCatalog,
  buildProjectInstructionCatalog,
  buildLegacyInstructionCatalogDelta,
  createCatalogInstructionFormatter,
  createCatalogInstructionResolver,
  getCatalogCodeOnlyParameterIndicesByType,
  mergeProjectInstructionCatalogs,
  normalizeLegacyProjectInstructionParameters,
  serializeProjectInstructionCatalog,
  validateProjectInstructionCatalog,
} from './ProjectInstructionCatalog';
import { enumerateAllInstructions } from '../../InstructionOrExpression/EnumerateInstructions';
import { enumerateAllExpressions } from '../../InstructionOrExpression/EnumerateExpressions';
import { normalizeInstructionParameterDslName } from '../../Mcp/McpEventKnowledge';

const catalogFixture = {
  format: 'gdevelop-ifdo-instruction-catalog',
  formatVersion: 2,
  actions: [
    {
      type: 'Network::Send',
      parameters: [
        {
          dslName: 'url',
          type: 'string',
          valueKind: 'text',
          isOptional: false,
          isCodeOnly: false,
        },
        {
          dslName: 'body',
          type: 'string',
          valueKind: 'text',
          isOptional: false,
          isCodeOnly: false,
        },
        {
          dslName: 'runtime',
          type: 'currentScene',
          isOptional: false,
          isCodeOnly: true,
        },
      ],
    },
  ],
  conditions: [
    {
      type: 'Network::Succeeded',
      parameters: [
        {
          dslName: 'request_id',
          type: 'identifier',
          valueKind: 'name',
          isOptional: false,
          isCodeOnly: false,
        },
      ],
    },
  ],
  expressions: [],
};

describe('project IfDo instruction catalog', () => {
  test('requires the semantic version 2 catalog without authoring prose', () => {
    expect(() =>
      validateProjectInstructionCatalog({
        ...catalogFixture,
        formatVersion: 1,
      })
    ).toThrow('expected version 2');
    expect(() =>
      validateProjectInstructionCatalog({
        ...catalogFixture,
        authoring: { rules: [] },
      })
    ).toThrow('must not contain authoring prose');
  });

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
              type: 'object',
              valueKind: 'object',
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

  test('compiles named catalog instructions with semantic operands', () => {
    const output = JSON.parse(
      compileIfDoToLegacyEventsJson(
        `if Network::Succeeded request_id="RequestId"\n` +
          `do Network::Send url="https://example.com" body=expr(VariableString(Payload))\n`,
        { resolveInstruction: createCatalogInstructionResolver(catalogFixture) }
      )
    );

    expect(output[0].conditions[0]).toMatchObject({
      type: { value: 'Network::Succeeded' },
      parameters: ['RequestId'],
    });
    expect(output[0].actions[0]).toMatchObject({
      type: { value: 'Network::Send' },
      parameters: ['"https://example.com"', 'VariableString(Payload)', ''],
    });
  });

  test('omits empty legacy operands without encoding them as typed values', () => {
    const input = JSON.stringify([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'Network::Send' },
            parameters: ['', '"payload"', 'legacy runtime data'],
          },
        ],
      },
    ]);
    const dsl = convertLegacyEventsJsonToIfDo(input, {
      formatInstruction: createCatalogInstructionFormatter(catalogFixture),
    });

    expect(dsl).toContain('do Network::Send body="payload"');
    expect(dsl).not.toContain('url=');
    expect(dsl).not.toContain('legacy runtime data');
    expect(
      JSON.parse(
        compileIfDoToLegacyEventsJson(dsl, {
          resolveInstruction: createCatalogInstructionResolver(catalogFixture),
        })
      )[0].actions[0].parameters
    ).toEqual(['', '"payload"', '']);
    expect(getCatalogCodeOnlyParameterIndicesByType(catalogFixture)).toEqual({
      'Network::Send': [2],
    });
  });

  test('normalizes parameters that cannot be represented by a catalog signature', () => {
    const normalizationCatalog = {
      ...catalogFixture,
      actions: [
        ...catalogFixture.actions,
        {
          type: 'Property::Set',
          parameters: [
            { dslName: 'object', type: 'object', valueKind: 'object' },
            {
              dslName: 'operator',
              type: 'operator',
              valueKind: 'name',
              acceptedValues: ['=', '+'],
            },
            { dslName: 'value', type: 'string', valueKind: 'text' },
          ],
        },
      ],
      conditions: [
        ...catalogFixture.conditions,
        {
          type: 'SceneBool',
          parameters: [
            { dslName: 'variable', type: 'scenevar', valueKind: 'variable' },
            {
              dslName: 'check',
              type: 'trueorfalse',
              valueKind: 'boolean',
            },
          ],
        },
      ],
    };
    const normalized = normalizeLegacyProjectInstructionParameters(
      {
        layouts: [
          {
            events: [
              {
                actions: [
                  {
                    type: { value: 'Network::Send' },
                    parameters: [
                      '"url"',
                      'ToString(\r\n  Variable(Value), \r\n)',
                      'stale runtime data',
                      'removed parameter',
                    ],
                  },
                  {
                    type: { value: 'Property::Set' },
                    parameters: ['Object', 'GetArgumentAsString("Color")'],
                  },
                ],
                whileConditions: [
                  {
                    type: { value: 'SceneBool' },
                    parameters: ['Flag', 'shouldBreakTheLoop'],
                  },
                ],
              },
            ],
          },
        ],
      },
      normalizationCatalog
    );

    expect(normalized.layouts[0].events[0].actions[0].parameters).toEqual([
      '"url"',
      'ToString(\nVariable(Value),\n)',
      '',
    ]);
    expect(normalized.layouts[0].events[0].actions[1].parameters).toEqual([
      'Object',
      '=',
      'GetArgumentAsString("Color")',
    ]);
    expect(
      normalized.layouts[0].events[0].whileConditions[0].parameters
    ).toEqual(['Flag', '']);
  });

  test('infers semantic signatures for legacy instructions absent from metadata', () => {
    const input = JSON.stringify([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'Removed::Action' },
            parameters: [
              'Object',
              'Object.PointX("Center")',
              '"Checkpoint"',
              '',
            ],
          },
        ],
      },
    ]);
    const delta = buildLegacyInstructionCatalogDelta(
      catalogFixture,
      JSON.parse(input)
    );
    const catalog = mergeProjectInstructionCatalogs(catalogFixture, delta);
    const dsl = convertLegacyEventsJsonToIfDo(input, {
      formatInstruction: createCatalogInstructionFormatter(catalog),
    });

    expect(dsl).toContain('parameter_0="Object"');
    expect(dsl).toContain('parameter_1=expr(Object.PointX("Center"))');
    expect(dsl).toContain('parameter_2="Checkpoint"');
    expect(dsl).not.toContain('\\"');
    expect(
      areLegacyEventsEquivalent(
        input,
        compileIfDoToLegacyEventsJson(dsl, {
          resolveInstruction: createCatalogInstructionResolver(catalog),
        })
      )
    ).toBe(true);
  });

  test('rejects operands that do not match the catalog valueKind', () => {
    const typedCatalog = {
      ...catalogFixture,
      actions: [
        {
          type: 'Typed::Action',
          parameters: [
            { dslName: 'count', type: 'number', valueKind: 'number' },
            { dslName: 'object', type: 'object', valueKind: 'object' },
            { dslName: 'runtime', type: 'currentScene', isCodeOnly: true },
          ],
        },
      ],
    };
    const compile = (source: string): string =>
      compileIfDoToLegacyEventsJson(source, {
        resolveInstruction: createCatalogInstructionResolver(typedCatalog),
      });

    expect(() =>
      compile('do Typed::Action count="1" object="Enemy"\n')
    ).toThrow('expects a semantic number');
    expect(() =>
      compile('do Typed::Action count=1 object=expr("Enemy")\n')
    ).toThrow('does not accept expr(...)');
    expect(() =>
      compile('do Typed::Action count=1 object="Enemy" runtime="scene"\n')
    ).toThrow('code-only and must be omitted');
  });

  test('scans nested calculated expressions without exposing raw operands', () => {
    const output = JSON.parse(
      compileIfDoToLegacyEventsJson(
        'do Network::Send url="https://example.com" body=expr(ToString(Max(Variable(A), Variable(B))))\n',
        { resolveInstruction: createCatalogInstructionResolver(catalogFixture) }
      )
    );
    expect(output[0].actions[0].parameters[1]).toBe(
      'ToString(Max(Variable(A), Variable(B)))'
    );
    expect(() =>
      compileIfDoToLegacyEventsJson(
        'do Network::Send url="https://example.com" body=expr()\n',
        { resolveInstruction: createCatalogInstructionResolver(catalogFixture) }
      )
    ).toThrow('cannot be empty');
    expect(
      JSON.parse(
        compileIfDoToLegacyEventsJson(
          'do Network::Send url="https://example.com" body=expr(ToString(\n  Max(Variable(A), Variable(B))\n))\n',
          {
            resolveInstruction: createCatalogInstructionResolver(
              catalogFixture
            ),
          }
        )
      )[0].actions[0].parameters[1]
    ).toContain('Max(Variable(A), Variable(B))');
    expect(
      JSON.parse(
        compileIfDoToLegacyEventsJson(
          'do Network::Send url="https://example.com" body=expr("first line\nsecond line")\n',
          {
            resolveInstruction: createCatalogInstructionResolver(
              catalogFixture
            ),
          }
        )
      )[0].actions[0].parameters[1]
    ).toBe('"first line\nsecond line"');
  });

  test('writes empty text and calculated text without nested operand quoting', () => {
    const textCatalog = {
      ...catalogFixture,
      actions: [
        {
          type: 'Text::Set',
          parameters: [
            {
              dslName: 'text',
              type: 'string',
              valueKind: 'text',
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
          { type: { value: 'Text::Set' }, parameters: ['""'] },
          {
            type: { value: 'Text::Set' },
            parameters: ['"Score: " + ToString(Variable(Score))'],
          },
        ],
      },
    ]);
    const dsl = convertLegacyEventsJsonToIfDo(input, {
      formatInstruction: createCatalogInstructionFormatter(textCatalog),
    });
    const output = compileIfDoToLegacyEventsJson(dsl, {
      resolveInstruction: createCatalogInstructionResolver(textCatalog),
    });

    expect(dsl).toContain('do Text::Set text=""');
    expect(dsl).toContain(
      'do Text::Set text=expr("Score: " + ToString(Variable(Score)))'
    );
    expect(dsl).not.toContain('\\"');
    expect(areLegacyEventsEquivalent(input, output)).toBe(true);
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
            { dslName: 'object', type: 'object', valueKind: 'object' },
            {
              dslName: 'behavior',
              type: 'behavior',
              valueKind: 'behavior',
            },
            { dslName: 'joint_id', type: 'number', valueKind: 'number' },
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
            parameters: ['Object', 'PhysicsBehavior', '12'],
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
    expect(deprecatedCatalog.authoring).toBeUndefined();
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
    expect(catalog.formatVersion).toBe(2);
    expect(catalog.authoring).toBeUndefined();
    expect(serialized).not.toContain('"authoring"');
    expect(serialized).not.toContain('serialized operand');
    expect(serialized).not.toContain('embedded quotes');
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
    expect(
      [...catalog.actions, ...catalog.conditions, ...catalog.expressions].every(
        entry =>
          entry.parameters.every(
            parameter =>
              parameter.isCodeOnly ||
              [
                'text',
                'number',
                'boolean',
                'object',
                'behavior',
                'variable',
                'resource',
                'name',
              ].includes(parameter.valueKind)
          )
      )
    ).toBe(true);
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
    const setTextEntry = catalog.actions.find(
      entry =>
        entry.type ===
        'TextContainerCapability::TextContainerBehavior::SetValue'
    );
    expect(setTextEntry).toBeDefined();
    expect(
      setTextEntry.parameters.map(parameter => parameter.valueKind)
    ).toEqual(['object', 'behavior', 'name', 'text']);
    const emptyTextInput = JSON.stringify([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: {
              value: 'TextContainerCapability::TextContainerBehavior::SetValue',
            },
            parameters: ['MessageText', 'Text', '=', '""'],
          },
        ],
      },
    ]);
    const emptyTextDsl = convertLegacyEventsJsonToIfDo(emptyTextInput, {
      formatInstruction: createCatalogInstructionFormatter(catalog),
    });
    expect(emptyTextDsl).toContain('text=""');
    expect(emptyTextDsl).not.toContain('\\"');
    expect(
      areLegacyEventsEquivalent(
        emptyTextInput,
        compileIfDoToLegacyEventsJson(emptyTextDsl, {
          resolveInstruction: createCatalogInstructionResolver(catalog),
        })
      )
    ).toBe(true);
    const collisionEntry = catalog.conditions.find(
      entry => entry.type === 'CollisionNP'
    );
    expect(collisionEntry).toBeDefined();
    if (!collisionEntry) throw new Error('CollisionNP catalog entry missing.');
    const optionalCollisionParameter = collisionEntry.parameters[4];
    expect(optionalCollisionParameter).toMatchObject({
      type: 'yesorno',
      valueKind: 'boolean',
      isOptional: true,
      defaultValue: false,
    });
    const omittedCollisionDefaultInput = JSON.stringify([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'CollisionNP' },
            parameters: ['Player', 'Platform', ''],
          },
        ],
        actions: [],
      },
    ]);
    const omittedCollisionDefaultDsl = convertLegacyEventsJsonToIfDo(
      omittedCollisionDefaultInput,
      {
        formatInstruction: createCatalogInstructionFormatter(catalog),
      }
    );
    expect(omittedCollisionDefaultDsl).toContain(
      'if CollisionNP first_object="Player" second_object="Platform"'
    );
    expect(omittedCollisionDefaultDsl).not.toContain(
      `${optionalCollisionParameter.dslName}=`
    );
    const normalizedCollisionDefaultOutput = JSON.parse(
      compileIfDoToLegacyEventsJson(omittedCollisionDefaultDsl, {
        resolveInstruction: createCatalogInstructionResolver(catalog),
      })
    );
    expect(
      normalizedCollisionDefaultOutput[0].conditions[0].parameters
    ).toEqual(['Player', 'Platform', '', '', '']);
    const explicitCollisionDefaultOutput = JSON.parse(
      compileIfDoToLegacyEventsJson(
        `if CollisionNP first_object="Player" second_object="Platform" ${
          optionalCollisionParameter.dslName
        }=false\n`,
        {
          resolveInstruction: createCatalogInstructionResolver(catalog),
        }
      )
    );
    expect(explicitCollisionDefaultOutput[0].conditions[0].parameters[4]).toBe(
      'no'
    );
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
