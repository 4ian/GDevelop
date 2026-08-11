// @flow

import {
  buildJavaScriptAuthoringArtifacts,
  buildProjectApiDeclaration,
  buildRuntimeApiDeclaration,
  collectSerializedProjectJavaScriptBlocks,
  collectSourceFileJavaScriptBlocks,
  validateJavaScriptAuthoringBlocks,
  validateProjectJavaScriptAuthoring,
  validateReviewedExtensionJavaScriptAuthoring,
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

  test('uses scene-owned source paths and scene context for external JavaScript', () => {
    const projectWithExternal = {
      ...serializedProject,
      externalEvents: [
        {
          name: 'Shared Combat',
          associatedLayout: 'Main',
          events: [
            {
              type: 'BuiltinCommonInstructions::JsCode',
              useStrict: true,
              inlineCode: 'runtimeScene.getObjects("Plaeyr");',
            },
          ],
        },
      ],
    };
    expect(
      collectSerializedProjectJavaScriptBlocks(projectWithExternal)
    ).toEqual([
      expect.objectContaining({
        fileUri:
          'game://scenes/Main/external-events/Shared%20Combat/functions/sceneUpdate.events',
      }),
    ]);
    expect(
      validateProjectJavaScriptAuthoring({
        serializedProject: projectWithExternal,
      }).errors
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'JS_API_TYPE_MISMATCH',
          fileUri:
            'game://scenes/Main/external-events/Shared%20Combat/functions/sceneUpdate.events',
        }),
      ])
    );
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

  test('exposes pointer-lock and bounded 3D raycast facades to strict code', () => {
    const validation = validateProjectJavaScriptAuthoring({
      serializedProject,
      sourceFiles: {
        'game://scenes/Main/Main.events': `@js objects="Player" strict=true
gdjs.evtTools.input.requestPointerLock(runtimeScene, "first-person-camera");
if (gdjs.evtTools.input.isPointerLocked(runtimeScene)) {
  const movementX = gdjs.evtTools.input.getPointerMovementX(runtimeScene);
  const movementY = gdjs.evtTools.input.getPointerMovementY(runtimeScene);
  objects[0].setPosition(movementX, movementY);
  gdjs.evtTools.input.exitPointerLock(runtimeScene);
}
const hits = gdjs.evtTools.scene3d.raycastObjects(
  0, 0, 0, 1, 0, 0, objects, 0, 1000, true
);
if (hits.length > 0) hits[0].object.setX(hits[0].pointX);
@end js
`,
      },
    });

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
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

  test('limits reviewed registry compatibility to pinned downloaded content', () => {
    const serializedExtension = {
      name: 'MousePointerLock',
      eventsFunctions: [
        {
          name: 'Request',
          events: [
            {
              type: 'BuiltinCommonInstructions::JsCode',
              useStrict: true,
              inlineCode:
                'document.body.requestPointerLock(); runtimeScene._instances;',
            },
          ],
        },
      ],
      eventsBasedBehaviors: [],
      eventsBasedObjects: [],
    };
    const validation = validateReviewedExtensionJavaScriptAuthoring({
      serializedExtension,
      registryHeader: { name: 'MousePointerLock', version: '1.2.3' },
    });

    expect(validation.valid).toBe(true);
    expect(validation.provenanceVerified).toBe(true);
    expect(validation.contentHash).toHaveLength(64);
    expect(validation.errors).toEqual([]);
    expect(validation.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'EXTENSION_REVIEWED_COMPATIBILITY_PROFILE',
        }),
        expect.objectContaining({ code: 'JS_API_FORBIDDEN_GLOBAL' }),
        expect.objectContaining({ code: 'JS_API_PRIVATE_MEMBER' }),
      ])
    );

    const spoofed = validateReviewedExtensionJavaScriptAuthoring({
      serializedExtension,
      registryHeader: { name: 'DifferentExtension', version: '1.2.3' },
    });
    expect(spoofed.valid).toBe(false);
    expect(spoofed.code).toBe('EXTENSION_STRICT_API_INCOMPATIBLE');
  });

  test('warns about syntax failures without blocking reviewed extensions', () => {
    const validation = validateReviewedExtensionJavaScriptAuthoring({
      serializedExtension: {
        name: 'Raycaster3D',
        eventsFunctions: [
          {
            name: 'Raycast',
            events: [
              {
                type: 'BuiltinCommonInstructions::JsCode',
                useStrict: true,
                inlineCode: 'const broken = ;',
              },
            ],
          },
        ],
        eventsBasedBehaviors: [],
        eventsBasedObjects: [],
      },
      registryHeader: { name: 'Raycaster3D', version: '2.0.0' },
    });

    expect(validation.valid).toBe(true);
    expect(validation.code).toBeUndefined();
    expect(validation.errors).toEqual([]);
    expect(validation.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'JS_API_SYNTAX_ERROR' }),
        expect.objectContaining({
          code: 'EXTENSION_REVIEWED_COMPATIBILITY_PROFILE',
        }),
      ])
    );
  });

  test('keeps installed store extension JavaScript warnings non-blocking during project validation', () => {
    const validation = validateProjectJavaScriptAuthoring({
      serializedProject: {
        ...serializedProject,
        eventsFunctionsExtensions: [
          {
            name: 'MousePointerLock',
            origin: {
              name: 'gdevelop-extension-store',
              identifier: 'MousePointerLock',
            },
            eventsFunctions: [],
            eventsBasedBehaviors: [],
            eventsBasedObjects: [],
          },
        ],
      },
      sourceFiles: {
        'game://extensions/MousePointerLock/functions/RequestPointerLock.events': `@js strict=true
document.body.requestPointerLock();
gdjs._MousePointerLockExtension.handler.requestPointerLock();
const broken = ;
@end js
`,
      },
    });

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
    expect(validation.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'JS_API_FORBIDDEN_GLOBAL' }),
        expect.objectContaining({ code: 'JS_API_PRIVATE_MEMBER' }),
        expect.objectContaining({ code: 'JS_API_SYNTAX_ERROR' }),
        expect.objectContaining({
          code: 'EXTENSION_REVIEWED_COMPATIBILITY_PROFILE',
          provenance: expect.objectContaining({
            source: 'installed-gdevelop-extension-store',
            extensionNames: ['MousePointerLock'],
          }),
        }),
      ])
    );
  });

  test('does not trust a local extension or mismatched store origin during project validation', () => {
    const extensionSource = `@js strict=true
document.body.requestPointerLock();
@end js
`;
    const validateExtension = (extension: Object) =>
      validateProjectJavaScriptAuthoring({
        serializedProject: {
          ...serializedProject,
          eventsFunctionsExtensions: [extension],
        },
        sourceFiles: {
          'game://extensions/MousePointerLock/functions/RequestPointerLock.events': extensionSource,
        },
      });

    const localValidation = validateExtension({
      name: 'MousePointerLock',
      eventsFunctions: [],
      eventsBasedBehaviors: [],
      eventsBasedObjects: [],
    });
    const mismatchedOriginValidation = validateExtension({
      name: 'MousePointerLock',
      origin: {
        name: 'gdevelop-extension-store',
        identifier: 'DifferentExtension',
      },
      eventsFunctions: [],
      eventsBasedBehaviors: [],
      eventsBasedObjects: [],
    });

    expect(localValidation.valid).toBe(false);
    expect(mismatchedOriginValidation.valid).toBe(false);
    expect(localValidation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'JS_API_FORBIDDEN_GLOBAL' }),
      ])
    );
    expect(mismatchedOriginValidation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'JS_API_FORBIDDEN_GLOBAL' }),
      ])
    );
  });

  test('keeps strict scene JavaScript blocking when store extensions are installed', () => {
    const validation = validateProjectJavaScriptAuthoring({
      serializedProject: {
        ...serializedProject,
        eventsFunctionsExtensions: [
          {
            name: 'MousePointerLock',
            origin: {
              name: 'gdevelop-extension-store',
              identifier: 'MousePointerLock',
            },
            eventsFunctions: [],
            eventsBasedBehaviors: [],
            eventsBasedObjects: [],
          },
        ],
      },
      sourceFiles: {
        'game://scenes/Main/Main.events': `@js strict=true
document.body.requestPointerLock();
@end js
`,
      },
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'JS_API_FORBIDDEN_GLOBAL',
          fileUri: 'game://scenes/Main/Main.events',
        }),
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

  test('exposes eventsFunctionContext in extension and scene lifecycle function sources', () => {
    const functionValidation = validateProjectJavaScriptAuthoring({
      serializedProject,
      sourceFiles: {
        'game://extensions/Combat/functions/Damage.events': `@js strict=true
const amount = eventsFunctionContext.getArgument("Amount");
eventsFunctionContext.returnValue = typeof amount === "number" ? amount : 0;
@end js
`,
      },
    });
    expect(functionValidation.errors).toEqual([]);

    const lifecycleValidation = validateProjectJavaScriptAuthoring({
      serializedProject,
      sourceFiles: {
        'game://scenes/Main/functions/sceneSignal.events': `@js strict=true
const signalName = eventsFunctionContext.getArgument("SignalName");
if (typeof signalName === "string" && signalName.length > 0) runtimeScene.getElapsedTime();
@end js
`,
      },
    });
    expect(lifecycleValidation.errors).toEqual([]);

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
