// @flow

import {
  buildJavaScriptAuthoringArtifacts,
  buildProjectApiDeclaration,
  buildRuntimeApiDeclaration,
  collectSourceFileJavaScriptBlocks,
  validateJavaScriptAuthoringBlocks,
  validateProjectJavaScriptAuthoring,
} from './JavaScriptAuthoringApi';

const serializedProject = {
  properties: { name: 'Typed project' },
  variables: [{ name: 'HighScore', type: 'number', value: 0 }],
  objects: [],
  objectsGroups: [],
  resources: {
    resources: [
      { name: 'player.png', kind: 'image', file: 'assets/player.png' },
    ],
  },
  layouts: [
    {
      name: 'Main',
      variables: [{ name: 'Score', type: 'number', value: 0 }],
      layers: [{ name: '' }, { name: 'UI' }],
      objects: [
        {
          name: 'Player',
          type: 'Sprite',
          variables: [{ name: 'Health', type: 'number', value: 3 }],
          behaviors: [
            {
              name: 'Platformer',
              type: 'PlatformBehavior::PlatformerObjectBehavior',
            },
          ],
        },
        {
          name: 'Bullet',
          type: 'Sprite',
          variables: [],
          behaviors: [],
        },
      ],
      objectsGroups: [{ name: 'Actors', objects: [{ name: 'Player' }] }],
      events: [],
    },
  ],
  externalEvents: [],
  eventsFunctionsExtensions: [
    {
      name: 'Combat',
      eventsFunctions: [
        {
          name: 'Damage',
          functionType: 'Action',
          parameters: [
            { name: 'Target', type: 'object' },
            { name: 'Amount', type: 'number' },
          ],
          events: [],
        },
      ],
      eventsBasedObjects: [],
      eventsBasedBehaviors: [],
    },
  ],
};

describe('JavaScript authoring API', () => {
  test('reports one validator-environment diagnostic when TypeScript is unavailable', () => {
    const validation = validateJavaScriptAuthoringBlocks({
      serializedProject,
      typescript: null,
      blocks: [
        { inlineCode: 'const first = 1;', useStrict: true },
        { inlineCode: 'const second = 2;', useStrict: true },
      ],
    });

    expect(validation).toMatchObject({
      checked: false,
      valid: false,
      blocks: 2,
      checkedBlocks: 0,
      typescriptAvailable: false,
      typescriptVersion: null,
    });
    expect(validation.environmentDiagnostics).toEqual([
      expect.objectContaining({
        code: 'JS_API_TYPESCRIPT_UNAVAILABLE',
        scope: 'validator',
        affectedBlocks: 2,
      }),
    ]);
    expect(validation.sourceDiagnostics).toEqual([]);
    expect(validation.errors).toHaveLength(1);
  });

  test('generates a deterministic curated runtime declaration', () => {
    const declaration = buildRuntimeApiDeclaration();
    expect(buildRuntimeApiDeclaration()).toBe(declaration);
    expect(declaration).toContain('class RuntimeScene');
    expect(declaration).toContain('class RuntimeObject');
    expect(declaration).toContain('addPolarForce');
    expect(declaration).toContain('resetTimer(name: string)');
    expect(declaration).toContain('setCameraX(value: number');
    expect(declaration).toContain(
      'Return the live, engine-owned array of living instances'
    );
    expect(declaration).toContain(
      'iterate backward when calling deleteFromScene()'
    );
    expect(declaration).not.toContain('_instances');
    expect(declaration).not.toContain('_behaviorData');
    expect(declaration).not.toContain('evtsExt__');
  });

  test('generates project-aware scene, object, variable, resource, and function types', () => {
    const declaration = buildProjectApiDeclaration(serializedProject);
    expect(declaration).toContain('readonly "Main"');
    expect(declaration).toContain(
      'readonly "Player": ObjectDefinition<gdjs.SpriteRuntimeObject'
    );
    expect(declaration).toContain('readonly "Health": number');
    expect(declaration).toContain('readonly "Actors": "Player"');
    expect(declaration).toContain('readonly "Score": number');
    expect(declaration).toContain('readonly "player.png"');
    expect(declaration).toContain('readonly "Combat::Damage"');

    const artifacts = buildJavaScriptAuthoringArtifacts(serializedProject);
    expect(artifacts.counts).toEqual({
      scenes: 1,
      globalObjects: 0,
      resources: 1,
      functions: 1,
    });
    expect(artifacts.hashes.runtimeApi).toHaveLength(64);
    expect(artifacts.hashes.projectApi).toHaveLength(64);
  });

  test('extracts JavaScript with exact IfDo source locations', () => {
    const blocks = collectSourceFileJavaScriptBlocks({
      'game://scenes/Main/Main.events': `@event
if SceneJustBegins
> @js objects="Player" strict=true
const value = 1;
> @end js
`,
    });
    expect(blocks).toEqual([
      expect.objectContaining({
        fileUri: 'game://scenes/Main/Main.events',
        parameterObjects: 'Player',
        useStrict: true,
        headerLine: 3,
        bodyLine: 4,
        inlineCode: 'const value = 1;',
      }),
    ]);
  });

  test('accepts public project-aware JavaScript in strict blocks', () => {
    const validation = validateProjectJavaScriptAuthoring({
      serializedProject,
      sourceFiles: {
        'game://scenes/Main/Main.events': `@js objects="Player" strict=true
for (const player of objects) {
  player.setX(player.getX() + 1);
  player.getVariables().get("Health").sub(1);
  const platformer = player.getBehavior("Platformer");
  if (platformer) platformer.activate(true);
}
runtimeScene.getVariables().get("Score").add(10);
runtimeScene.getGame().getVariables().get("HighScore").add(10);
if (runtimeScene.getElapsedTime() < 0) return;
const bullet = runtimeScene.createObject("Bullet");
if (bullet) bullet.addPolarForce(0, 720, 1);
@end js
`,
      },
    });
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);
    expect(validation.blocks).toBe(1);
    expect(validation.strictBlocks).toBe(1);
  });

  test('rejects stale project literals in a known scene context', () => {
    const validation = validateProjectJavaScriptAuthoring({
      serializedProject,
      sourceFiles: {
        'game://scenes/Main/Main.events': `@js objects="Player" strict=true
runtimeScene.getObjects("Plaeyr");
runtimeScene.getLayer("HUD");
runtimeScene.getVariables().get("Scroe");
objects[0].getVariables().get("HP");
objects[0].getBehavior("Physics");
@end js
`,
      },
    });
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThanOrEqual(5);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'JS_API_TYPE_MISMATCH',
          fileUri: 'game://scenes/Main/Main.events',
        }),
      ])
    );
  });

  test('rejects private fields, forbidden globals, and unknown public methods in strict blocks', () => {
    const validation = validateProjectJavaScriptAuthoring({
      serializedProject,
      sourceFiles: {
        'game://scenes/Main/Main.events': `@js objects="Player" strict=true
objects[0]._behaviorData;
objects[0].notAPublicMethod();
fetch("https://example.com");
@end js
`,
      },
    });
    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'JS_API_PRIVATE_MEMBER',
          fileUri: 'game://scenes/Main/Main.events',
          line: 2,
        }),
        expect.objectContaining({ code: 'JS_API_UNKNOWN_MEMBER' }),
        expect.objectContaining({ code: 'JS_API_FORBIDDEN_GLOBAL' }),
      ])
    );
  });

  test('keeps compatibility diagnostics non-blocking without strict=true', () => {
    const validation = validateProjectJavaScriptAuthoring({
      serializedProject,
      sourceFiles: {
        'game://scenes/Main/Main.events': `@js objects="Player"
objects[0]._behaviorData;
@end js
`,
      },
    });
    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
    expect(validation.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'JS_API_PRIVATE_MEMBER' }),
      ])
    );
  });

  test('checks every JavaScript block with its own source and location', () => {
    const validation = validateProjectJavaScriptAuthoring({
      serializedProject,
      sourceFiles: {
        'game://scenes/Main/Main.events': `@js strict=true
runtimeScene.getObjects("Player");
@end js
@js strict=true
runtimeScene._instances.length;
@end js
`,
      },
    });
    expect(validation.blocks).toBe(2);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'JS_API_PRIVATE_MEMBER',
          line: 5,
        }),
      ])
    );
  });

  test('always blocks syntax errors and warns about unbounded loops', () => {
    const syntaxValidation = validateProjectJavaScriptAuthoring({
      serializedProject,
      sourceFiles: {
        'game://scenes/Main/Main.events': `@js
if (
@end js
`,
      },
    });
    expect(syntaxValidation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'JS_API_SYNTAX_ERROR', line: 2 }),
      ])
    );

    const loopValidation = validateProjectJavaScriptAuthoring({
      serializedProject,
      sourceFiles: {
        'game://scenes/Main/Main.events': `@js strict=true
while (true) {}
@end js
`,
      },
    });
    expect(loopValidation.valid).toBe(true);
    expect(loopValidation.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'JS_API_PERFORMANCE_RISK' }),
      ])
    );
  });

  test('exposes eventsFunctionContext only in extension function sources', () => {
    const functionValidation = validateProjectJavaScriptAuthoring({
      serializedProject,
      sourceFiles: {
        'game://extensions/Combat/functions/Damage/Damage.events': `@js strict=true
const amount = eventsFunctionContext.getArgument("Amount");
eventsFunctionContext.returnValue = typeof amount === "number" ? amount : 0;
@end js
`,
      },
    });
    expect(functionValidation.errors).toEqual([]);

    const sceneValidation = validateProjectJavaScriptAuthoring({
      serializedProject,
      sourceFiles: {
        'game://scenes/Main/Main.events': `@js strict=true
eventsFunctionContext.returnValue = 1;
@end js
`,
      },
    });
    expect(sceneValidation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'JS_API_UNKNOWN_MEMBER' }),
      ])
    );
  });
});
