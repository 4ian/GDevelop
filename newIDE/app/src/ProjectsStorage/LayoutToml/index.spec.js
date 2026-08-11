// @noflow

import {
  LayoutTomlError,
  areLayoutFragmentsEquivalent,
  compileLayoutDocument,
  compileEmbeddedLayoutToml,
  compileLayoutToml,
  decompileLayoutDocument,
  decompileEmbeddedLayoutToml,
  decompileLayoutToml,
  formatLayoutToml,
  parseLayoutToml,
} from './index';

const uuid = index =>
  `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;

const sceneSource = body => `[layout]
version = 1
background = "#000000"

${body}`;

const baseLayer = `[[layers]]
id = "base"
name = ""
`;

describe('layout TOML', () => {
  test('compiles and decompiles logical documents without a standalone source owner', () => {
    const context = {
      kind: 'scene',
      fileUri: 'game://scenes/Main/scene.settings',
      objects: new Map(),
      usedInstanceUuids: new Set(),
    };
    const layout = compileLayoutDocument(
      {
        layout: { version: 1, background: '#000000' },
        layers: [{ id: 'base', name: '' }],
      },
      context
    );

    expect(layout).toMatchObject({ r: 0, v: 0, b: 0, instances: [] });
    expect(
      decompileLayoutDocument(layout, {
        ...context,
        usedInstanceUuids: new Set(),
      })
    ).toMatchObject({
      layout: { version: 1, background: '#000000' },
      layers: [{ id: 'base', name: '' }],
    });
  });

  test('compiles embedded layout tables while preserving owner-file locations', () => {
    const fileUri = 'game://scenes/Main/scene.settings';
    const source = `kind = "scene"
settingsFormatVersion = 5

[layout]
version = 1
background = "#000000"

[[layout.layers]]
id = "base"
name = ""

[[layout.instances]]
id = "not-a-uuid"
object = "Player"
layer = "base"
at = [1, 2]
`;

    expect(() =>
      compileEmbeddedLayoutToml(source, {
        kind: 'scene',
        fileUri,
        objects: new Map([['Player', { name: 'Player', behaviors: [] }]]),
      })
    ).toThrow(
      expect.objectContaining({
        code: 'LAYOUT_INVALID_UUID',
        fileUri,
        line: 12,
      })
    );
  });

  test('decompiles embedded layout headers below the reserved owner subtree', () => {
    const source = decompileEmbeddedLayoutToml(
      {
        r: 0,
        v: 0,
        b: 0,
        uiSettings: {},
        layers: [{ name: '', effects: [], cameras: [] }],
        instances: [],
      },
      { kind: 'scene', usedInstanceUuids: new Set() }
    );

    expect(source).toContain('[layout]');
    expect(source).toContain('[[layout.layers]]');
    expect(source).not.toContain('\n[[layers]]');
  });

  test('parses standard TOML tables and typed inline values', () => {
    const document = parseLayoutToml(
      sceneSource(`${baseLayer}
[[instances]]
id = "${uuid(1)}"
object = "Player"
layer = "base"
at = [1, 2]
properties = { animation = 2, text = "a>b" }
`)
    );

    expect(document.layout).toEqual({ version: 1, background: '#000000' });
    expect(document.instances[0].properties).toEqual({
      animation: 2,
      text: 'a>b',
    });
  });

  test.each([
    ['', 'LAYOUT_MISSING_FIELD'],
    ['version = 1', 'LAYOUT_MISSING_FIELD'],
    ['[layout]\nversion = 2', 'LAYOUT_UNSUPPORTED_VERSION'],
    [
      '[layout]\nversion = 1\nbackground = "#000000"\nfuture = true',
      'LAYOUT_UNKNOWN_FIELD',
    ],
    [
      '[layout]\nversion = 1\nbackground = "#000000"\n[[layer]\nid = "base"',
      'LAYOUT_INVALID_TOML',
    ],
    [
      '[layout]\nversion = 1\nbackground = "#000000"\n[layer]\nid = "base"\nname = ""',
      'LAYOUT_UNKNOWN_FIELD',
    ],
    [
      '[layout]\nversion = 1\nbackground = "#000000"\n[[layer]]\nid = "base"\nname = ""',
      'LAYOUT_UNKNOWN_FIELD',
    ],
    [
      '[layout]\nversion = 1\nbackground = "#000000"\n[[effect]]\nname = "X"',
      'LAYOUT_UNKNOWN_FIELD',
    ],
    [
      '[layout]\nversion = 1\nbackground = "#000000"\n[[instance]]\nid = "bad"',
      'LAYOUT_UNKNOWN_FIELD',
    ],
    [
      '[layout]\nversion = 1\nbackground = "#000000"\n[editor]\nfuture = false',
      'LAYOUT_UNKNOWN_FIELD',
    ],
  ])('rejects an invalid document %#', (source, code) => {
    expect(() => compileLayoutToml(source, { kind: 'scene' })).toThrow(
      expect.objectContaining({ code })
    );
  });

  test('compiles and round-trips a complete scene', () => {
    const source = `[layout]
version = 1
background = "#102030"

[editor]
grid = true
grid_type = "isometric"
grid_size = [16, 32, 48]
grid_offset = [-1, 2, 3]
grid_color = "#AABBCC"
grid_alpha = 0.5
snap = true
zoom = 2
window_mask = true
selected_layer = "HUD"
mode = "embedded-game"

[[layers]]
id = "base"
name = ""
rendering = "2d+3d"
camera_type = "perspective"
visible = false
locked = true
lighting = false
follow_base_camera = true
ambient = "#010203"
near = 1
far = 500
fov = 60
max_2d_distance = 200
cameras = [{ size = { default = [640, 480] }, viewport = { default = [0, 0, 0.5, 1] } }]

[[layers]]
id = "hud"
name = "HUD"

[[effects]]
layer = "base"
name = "Glow"
type = "Test::Glow"
folded = true
enabled = false
strength = 2
mode = "soft"
fast = true

[[instances]]
id = "${uuid(1)}"
object = "Player"
layer = "base"
at = [1, 2, 3]
rotation = [4, 5, 6]
z_order = -2
auto_size = [10, 20]
depth = 30
opacity = 42
flip = ["x", "z"]
locked = true
sealed = true
hidden = true
keep_ratio = false
properties = { animation = 1, text = "Ready" }

[[variables]]
instance = "${uuid(1)}"
name = "Health"
type = "number"
value = 100

[[variables]]
instance = "${uuid(1)}"
name = "Mode"
type = "enum"
value = "Idle"
values = ["Idle", "Run"]

[[variables]]
instance = "${uuid(1)}"
name = "Data"
type = "structure"
children = [{ name = "Ready", type = "boolean", value = true }]

[[variables]]
instance = "${uuid(1)}"
name = "Path"
type = "array"
children = [{ type = "string", value = "A" }, { type = "string", value = "B" }]

[[behaviors]]
instance = "${uuid(1)}"
name = "Move"
properties = { speed = 12 }
folded = true
quick = "visible"
property_visibility = { speed = "hidden" }
`;
    const context = {
      kind: 'scene',
      objectNames: ['Player'],
      behaviorTypesByObject: { Player: { Move: 'Movement::Move' } },
      effectTypes: ['Test::Glow'],
      effectParameterTypesByType: {
        'Test::Glow': {
          strength: 'number',
          mode: 'string',
          fast: 'boolean',
        },
      },
    };
    const output = compileLayoutToml(source, context);

    expect(output).toMatchObject({
      r: 16,
      v: 32,
      b: 48,
      uiSettings: {
        gridType: 'isometric',
        gridColor: 0xaabbcc,
        selectedLayer: 'HUD',
      },
      layers: [
        {
          name: '',
          renderingType: '2d+3d',
          cameraType: 'perspective',
          cameras: [{ defaultSize: true, width: 640, height: 480 }],
          effects: [
            {
              name: 'Glow',
              disabled: true,
              doubleParameters: { strength: 2 },
              stringParameters: { mode: 'soft' },
              booleanParameters: { fast: true },
            },
          ],
        },
        { name: 'HUD' },
      ],
      instances: [
        {
          name: 'Player',
          x: 1,
          y: 2,
          z: 3,
          rotationX: 4,
          rotationY: 5,
          angle: 6,
          customSize: false,
          width: 10,
          height: 20,
          depth: 30,
          opacity: 42,
          flippedX: true,
          flippedZ: true,
          hidden: true,
          behaviorOverridings: [
            { name: 'Move', type: 'Movement::Move', speed: 12 },
          ],
        },
      ],
    });
    const canonicalSource = decompileLayoutToml(output, context);
    expect(canonicalSource).toContain(
      'fast = true\nmode = "soft"\nstrength = 2'
    );
    expect(canonicalSource).not.toContain('params =');
    expect(canonicalSource).toContain('hidden = true');
    expect(compileLayoutToml(canonicalSource, context)).toEqual(output);
  });

  test('compiles prefab bounds and external layer references', () => {
    expect(
      compileLayoutToml(
        `[layout]
version = 1
bounds = { min = [-1, 0, 2], max = [3, 4, 5] }
`,
        { kind: 'prefab' }
      )
    ).toMatchObject({ areaMinX: -1, areaMaxZ: 5, layers: [], instances: [] });

    expect(
      compileLayoutToml(
        `[layout]
version = 1

[[layers]]
id = "world"
name = "World"

[[instances]]
id = "${uuid(2)}"
object = "Coin"
layer = "world"
at = [1, 2]
`,
        { kind: 'external', objectNames: ['Coin'], layerNames: ['World'] }
      )
    ).toEqual({
      editionSettings: {},
      instances: [expect.objectContaining({ layer: 'World' })],
    });
  });

  test('normalizes partial editor tuples with defaults', () => {
    const source = decompileLayoutToml(
      {
        areaMinX: 0,
        areaMinY: 0,
        areaMinZ: 0,
        areaMaxX: 64,
        areaMaxY: 64,
        areaMaxZ: 0,
        editionSettings: { gridWidth: 16, gridOffsetY: 5 },
        layers: [],
        instances: [],
      },
      { kind: 'prefab' }
    );

    expect(source).toContain('grid_size = [16, 32, 32]');
    expect(source).toContain('grid_offset = [0, 5, 0]');
    expect(
      compileLayoutToml(source, { kind: 'prefab' }).editionSettings
    ).toMatchObject({
      gridWidth: 16,
      gridHeight: 32,
      gridDepth: 32,
      gridOffsetX: 0,
      gridOffsetY: 5,
      gridOffsetZ: 0,
    });
  });

  test('preserves serialized color components outside the RGB byte range', () => {
    const layout = {
      r: 1,
      v: 2,
      b: 3,
      uiSettings: {},
      layers: [
        {
          name: '',
          ambientLightColorR: 1869181824,
          ambientLightColorG: 150995056,
          ambientLightColorB: 16,
          cameras: [],
          effects: [],
        },
      ],
      instances: [],
    };
    const source = decompileLayoutToml(layout, { kind: 'scene' });

    expect(source).toContain('background = "#010203"');
    expect(source).toContain('ambient = "rgb(1869181824,150995056,16)"');
    expect(
      compileLayoutToml(source, { kind: 'scene' }).layers[0]
    ).toMatchObject({
      ambientLightColorR: 1869181824,
      ambientLightColorG: 150995056,
      ambientLightColorB: 16,
    });
  });

  test('preserves explicitly marked stale object and selected-layer references', () => {
    const source = sceneSource(`[editor]
selected_layer = "Removed Layer"
selected_layer_unresolved = true

${baseLayer}
[[instances]]
id = "${uuid(9)}"
object = "RemovedObject"
layer = "base"
unresolved = true
at = [1, 2]
`);
    const context = { kind: 'scene', objectNames: [] };
    const layout = compileLayoutToml(source, context);

    expect(layout.instances[0]).toMatchObject({ name: 'RemovedObject' });
    const canonical = decompileLayoutToml(layout, context);
    expect(canonical).toContain('unresolved = true');
    expect(canonical).toContain('selected_layer_unresolved = true');
    expect(() =>
      compileLayoutToml(
        source.replace('\nunresolved = true\nat =', '\nat ='),
        context
      )
    ).toThrow(expect.objectContaining({ code: 'LAYOUT_UNKNOWN_OBJECT' }));
  });

  test.each([
    [
      sceneSource(
        `${baseLayer}\n[[instances]]\nid = "${uuid(
          1
        )}"\nobject = "Missing"\nlayer = "base"\nat = [0, 0]\n`
      ),
      { kind: 'scene', objectNames: [] },
      'LAYOUT_UNKNOWN_OBJECT',
    ],
    [
      `[layout]\nversion = 1\n\n[[layers]]\nid = "missing"\nname = "Missing"\n`,
      { kind: 'external', layerNames: [''] },
      'LAYOUT_UNKNOWN_LAYER',
    ],
    [
      sceneSource(
        `${baseLayer}\n[[instances]]\nid = "bad"\nobject = "Player"\nlayer = "base"\nat = [0, 0]\n`
      ),
      { kind: 'scene' },
      'LAYOUT_INVALID_UUID',
    ],
    [
      sceneSource(
        `${baseLayer}\n[[instances]]\nid = "${uuid(
          1
        )}"\nobject = "Player"\nlayer = "base"\nat = [0, 0]\nopacity = 256\n`
      ),
      { kind: 'scene' },
      'LAYOUT_INVALID_INSTANCE',
    ],
    [
      sceneSource(
        `[[layers]]\nid = "base"\nname = ""\nrendering = "3d"\nlighting = true\n`
      ),
      { kind: 'scene' },
      'LAYOUT_3D_LAYER_MARKED_AS_LIGHTING_LAYER',
    ],
    [
      sceneSource(
        `[[layers]]\nid = "base"\nname = ""\nrendering = "2d+3d"\nlighting = true\n`
      ),
      { kind: 'scene' },
      'LAYOUT_3D_LAYER_MARKED_AS_LIGHTING_LAYER',
    ],
    [
      sceneSource(
        `[[layers]]\nid = "base"\nname = ""\ncamera_type = "perspective"\nnear = 0\n`
      ),
      { kind: 'scene' },
      'LAYOUT_INVALID_LAYER',
    ],
    [
      sceneSource(
        `${baseLayer}\n[[instances]]\nid = "${uuid(
          1
        )}"\nobject = "Player"\nlayer = "base"\nat = [0, 0]\n\n[[instances]]\nid = "${uuid(
          1
        )}"\nobject = "Player"\nlayer = "base"\nat = [1, 1]\n`
      ),
      { kind: 'scene' },
      'LAYOUT_DUPLICATE_UUID',
    ],
    [
      sceneSource(
        `[[layers]]\nid = "base"\nname = ""\ncameras = [{ size = "default", viewport = [0, 0, 2, 1] }]\n`
      ),
      { kind: 'scene' },
      'LAYOUT_INVALID_CAMERA',
    ],
    [
      sceneSource(
        `${baseLayer}\n[[effects]]\nlayer = "base"\nname = "X"\ntype = "T"\n\n[[effects]]\nlayer = "base"\nname = "X"\ntype = "T"\n`
      ),
      { kind: 'scene' },
      'LAYOUT_DUPLICATE_EFFECT',
    ],
    [
      sceneSource(
        `${baseLayer}\n[[effects]]\nlayer = "base"\nname = "X"\ntype = "T"\nx = "wrong"\n`
      ),
      {
        kind: 'scene',
        effectTypes: ['T'],
        effectParameterTypesByType: { T: { x: 'number' } },
      },
      'LAYOUT_INVALID_EFFECT_PARAMETER',
    ],
    [
      sceneSource(
        `${baseLayer}\n[[effects]]\nlayer = "base"\nname = "X"\ntype = "T"\nparams = { x = 1 }\n`
      ),
      { kind: 'scene' },
      'LAYOUT_UNKNOWN_FIELD',
    ],
    [
      sceneSource(
        `${baseLayer}\n[[instances]]\nid = "${uuid(
          1
        )}"\nobject = "Player"\nlayer = "base"\nat = [0, 0]\n\n[[variable]]\ninstance = "${uuid(
          1
        )}"\nname = "X"\ntype = "number"\nvalue = 1\n`
      ),
      { kind: 'scene' },
      'LAYOUT_UNKNOWN_FIELD',
    ],
    [
      sceneSource(
        `${baseLayer}\n[[instances]]\nid = "${uuid(
          1
        )}"\nobject = "Player"\nlayer = "base"\nat = [0, 0]\n\n[[behavior]]\ninstance = "${uuid(
          1
        )}"\nname = "Move"\n`
      ),
      { kind: 'scene' },
      'LAYOUT_UNKNOWN_FIELD',
    ],
    [
      sceneSource(
        `${baseLayer}\n[[effects]]\nlayer = "base"\nname = "X"\ntype = "T"\n`
      ),
      {
        kind: 'scene',
        effectTypes: ['T'],
        effectParameterTypesByType: { T: { enabled: 'boolean' } },
      },
      'LAYOUT_EFFECT_PARAMETER_COLLISION',
    ],
    [
      sceneSource(
        `${baseLayer}\n[[instances]]\nid = "${uuid(
          1
        )}"\nobject = "Player"\nlayer = "base"\nat = [0, 0]\n\n[[variables]]\ninstance = "${uuid(
          1
        )}"\nname = "X"\ntype = "enum"\nvalue = "C"\nvalues = ["A", "B"]\n`
      ),
      { kind: 'scene' },
      'LAYOUT_INVALID_VARIABLE',
    ],
    [
      sceneSource(
        `${baseLayer}\n[[instances]]\nid = "${uuid(
          1
        )}"\nobject = "Player"\nlayer = "base"\nat = [0, 0]\n\n[[behaviors]]\ninstance = "${uuid(
          1
        )}"\nname = "Move"\n`
      ),
      { kind: 'scene' },
      'LAYOUT_UNKNOWN_BEHAVIOR',
    ],
    [
      sceneSource(
        `${baseLayer}\n[[instances]]\nid = "${uuid(
          1
        )}"\nobject = "Player"\nlayer = "base"\nat = [0, 0]\nproperties = { animation = "wrong" }\n`
      ),
      {
        kind: 'scene',
        instancePropertyTypesByObject: { Player: { animation: 'number' } },
      },
      'LAYOUT_INVALID_INSTANCE_PROPERTY',
    ],
    [
      `[layout]\nversion = 1\n\n[[layers]]\nid = "base"\nname = ""\ncameras = [{ size = "default", viewport = "default" }]\n`,
      { kind: 'external', layerNames: [''] },
      'LAYOUT_UNKNOWN_FIELD',
    ],
  ])('validates semantic rule %#', (source, context, code) => {
    expect(() => compileLayoutToml(source, context)).toThrow(
      expect.objectContaining({ code })
    );
  });

  test('enforces the camera limit', () => {
    const cameras = Array.from(
      { length: 51 },
      () => '{ size = "default", viewport = "default" }'
    ).join(', ');
    expect(() =>
      compileLayoutToml(
        sceneSource(
          `[[layers]]\nid = "base"\nname = ""\ncameras = [${cameras}]\n`
        ),
        { kind: 'scene' }
      )
    ).toThrow(expect.objectContaining({ code: 'LAYOUT_TOO_MANY_CAMERAS' }));
  });

  test('uses flat instance order without synthetic order fields', () => {
    const layout = {
      r: 0,
      v: 0,
      b: 0,
      uiSettings: {},
      layers: [{ name: '' }, { name: 'HUD' }],
      instances: ['A', 'B', 'C'].map((name, index) => ({
        name,
        x: 0,
        y: 0,
        angle: 0,
        zOrder: 0,
        layer: index === 1 ? 'HUD' : '',
        customSize: false,
        width: 0,
        height: 0,
        persistentUuid: uuid(index + 1),
        numberProperties: [],
        stringProperties: [],
        initialVariables: [],
      })),
    };
    const source = decompileLayoutToml(layout, { kind: 'scene' });

    expect(source).not.toContain('order =');
    expect(
      compileLayoutToml(source, { kind: 'scene' }).instances.map(
        item => item.name
      )
    ).toEqual(['A', 'B', 'C']);
  });

  test('has stable canonical formatting and equivalence checks', () => {
    const layout = {
      editionSettings: {},
      instances: [
        {
          name: 'layer',
          x: 1,
          y: 2,
          angle: 0,
          zOrder: 0,
          layer: '',
          customSize: false,
          width: 0,
          height: 0,
          persistentUuid: uuid(4),
          numberProperties: [],
          stringProperties: [],
          initialVariables: [],
        },
      ],
    };
    const source = decompileLayoutToml(layout, { kind: 'external' });

    expect(source).toContain('object = "layer"');
    expect(
      decompileLayoutToml(compileLayoutToml(source, { kind: 'external' }), {
        kind: 'external',
      })
    ).toBe(source);
    expect(source.endsWith('\n')).toBe(true);
    expect(formatLayoutToml(source, { kind: 'external' })).toBe(source);
    expect(
      areLayoutFragmentsEquivalent(
        layout,
        compileLayoutToml(source, { kind: 'external' }),
        { kind: 'external' }
      )
    ).toBe(true);
  });

  test('fails rather than losing unknown serializer fields', () => {
    expect(() =>
      decompileLayoutToml(
        {
          r: 0,
          v: 0,
          b: 0,
          uiSettings: {},
          layers: [],
          instances: [],
          futureField: true,
        },
        { kind: 'scene' }
      )
    ).toThrow(expect.objectContaining({ code: 'LAYOUT_UNSUPPORTED_FIELD' }));
  });

  test('rejects ambiguous typed-map keys instead of silently overwriting them', () => {
    const instance = {
      name: 'Player',
      x: 0,
      y: 0,
      angle: 0,
      zOrder: 0,
      layer: '',
      customSize: false,
      width: 0,
      height: 0,
      persistentUuid: uuid(30),
      numberProperties: [{ name: 'value', value: 1 }],
      stringProperties: [{ name: 'value', value: 'one' }],
      initialVariables: [],
    };
    expect(() =>
      decompileLayoutToml(
        {
          r: 0,
          v: 0,
          b: 0,
          uiSettings: {},
          layers: [{ name: '', effects: [] }],
          instances: [instance],
        },
        { kind: 'scene' }
      )
    ).toThrow(
      expect.objectContaining({ code: 'LAYOUT_DUPLICATE_INSTANCE_PROPERTY' })
    );

    instance.numberProperties = [];
    instance.stringProperties = [];
    expect(() =>
      decompileLayoutToml(
        {
          r: 0,
          v: 0,
          b: 0,
          uiSettings: {},
          layers: [
            {
              name: '',
              effects: [
                {
                  name: 'Light',
                  effectType: 'Light',
                  doubleParameters: { value: 1 },
                  stringParameters: { value: 'one' },
                  booleanParameters: {},
                },
              ],
            },
          ],
          instances: [instance],
        },
        { kind: 'scene' }
      )
    ).toThrow(
      expect.objectContaining({ code: 'LAYOUT_DUPLICATE_EFFECT_PARAMETER' })
    );
  });

  test('rejects serialized effect parameters that collide with record fields', () => {
    expect(() =>
      decompileLayoutToml(
        {
          r: 0,
          v: 0,
          b: 0,
          uiSettings: {},
          layers: [
            {
              name: '',
              effects: [
                {
                  name: 'Light',
                  effectType: 'Light',
                  doubleParameters: { enabled: 1 },
                  stringParameters: {},
                  booleanParameters: {},
                },
              ],
            },
          ],
          instances: [],
        },
        { kind: 'scene' }
      )
    ).toThrow(
      expect.objectContaining({ code: 'LAYOUT_EFFECT_PARAMETER_COLLISION' })
    );
  });

  test('validates behavior properties in serialized key space', () => {
    const makeSource = properties =>
      sceneSource(`${baseLayer}
[[instances]]
id = "${uuid(20)}"
object = "Player"
layer = "base"
at = [0, 0]

[[behaviors]]
instance = "${uuid(20)}"
name = "Move"
properties = ${properties}
`);
    const context = {
      kind: 'scene',
      objectNames: ['Player'],
      behaviorTypesByObject: { Player: { Move: 'Movement::Move' } },
      behaviorPropertySchemasByType: {
        'Movement::Move': {
          keySpace: 'serialized',
          unknownPropertyPolicy: 'error',
          properties: [
            {
              authoringKey: 'Speed',
              serializedKey: 'speed',
              type: 'Number',
            },
          ],
        },
      },
    };

    expect(() =>
      compileLayoutToml(makeSource('{ Speed = 12 }'), context)
    ).toThrow(
      expect.objectContaining({ code: 'BEHAVIOR_PROPERTY_KEY_MISMATCH' })
    );
    expect(
      compileLayoutToml(makeSource('{ speed = 12 }'), context).instances[0]
        .behaviorOverridings[0]
    ).toMatchObject({ name: 'Move', speed: 12 });
    expect(() =>
      compileLayoutToml(makeSource('{ speed = "fast" }'), context)
    ).toThrow(
      expect.objectContaining({ code: 'LAYOUT_INVALID_BEHAVIOR_PROPERTY' })
    );
  });

  test('reports TOML file, line and column', () => {
    try {
      compileLayoutToml(
        '[layout]\nversion = 1\nbackground = "#000000"\n[[layer]\n',
        {
          kind: 'scene',
          fileUri: 'game://scenes/Main/Main.layout',
        }
      );
      throw new Error('Expected compilation failure.');
    } catch (error) {
      expect(error).toBeInstanceOf(LayoutTomlError);
      expect(error.fileUri).toBe('game://scenes/Main/Main.layout');
      expect(error.line).toBeGreaterThanOrEqual(1);
      expect(error.column).toBeGreaterThanOrEqual(1);
    }
  });
});
