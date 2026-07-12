// @noflow

import {
  LayoutDslError,
  areLayoutFragmentsEquivalent,
  compileLayoutDsl,
  decompileLayoutDsl,
  formatLayoutDsl,
  parseLayoutDsl,
} from './index';

const uuid = index => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;

describe('Layout DSL', () => {
  test('parses the component tree and strict JSON literals', () => {
    const root = parseLayoutDsl(`<layout version=1 background=#102030>
  <layer name="">
    <Player id="${uuid(1)}" at=1,2>
      <properties numbers={"animation":2} strings={"text":"a>b"} />
    </Player>
  </layer>
</layout>`);
    expect(root.name).toBe('layout');
    expect(root.children[0].children[0].children[0].attributes[1].value).toEqual({
      text: 'a>b',
    });
  });

  test.each([
    ['', 'LAYOUT_EMPTY'],
    ['<scene />', 'LAYOUT_INVALID_ROOT'],
    ['<layout version=2></layout>', 'LAYOUT_UNSUPPORTED_VERSION'],
    ['<layout version=1 background=#000000></layout><layout />', 'LAYOUT_MULTIPLE_ROOTS'],
    ['<layout version=1 background=#000000>text</layout>', 'LAYOUT_TEXT_NODE'],
    ['<layout version=1 version=1 background=#000000></layout>', 'LAYOUT_DUPLICATE_ATTRIBUTE'],
    ['<layout version=1 background=#000000><bad /></layout>', 'LAYOUT_INVALID_CHILD'],
    ['<layout background=#000000 version=1></layout>', 'LAYOUT_ATTRIBUTE_ORDER'],
    ['<layout version=1 background=#000000 />', 'LAYOUT_INVALID_ROOT'],
    ['<layout version=1 background=#000000><editor></editor></layout>', 'LAYOUT_EXPECTED_EMPTY_ELEMENT'],
    ['<layout version=1 background=#000000><layer name="" /></layout>', 'LAYOUT_EXPECTED_CONTAINER'],
    ['<layout version=1 background=#000000><editor grid /></layout>', 'LAYOUT_INVALID_BARE_ATTRIBUTE'],
    ['<layout version=1 background=#000000><!-- no --></layout>', 'LAYOUT_SYNTAX'],
    ['<layout version=1 background=#000000><layer name=""></layout>', 'LAYOUT_MISMATCHED_TAG'],
    ['<layout version=1 background=#000000><editor grid=true future=false /></layout>', 'LAYOUT_UNKNOWN_ATTRIBUTE'],
  ])('rejects invalid document %#', (source, code) => {
    expect(() => compileLayoutDsl(source, { kind: 'scene' })).toThrow(
      expect.objectContaining({ code })
    );
  });

  test('compiles a complete scene', () => {
    const source = `<layout version=1 background=#102030>
  <editor grid=true grid-type=isometric grid-size=16,32,48 grid-offset=-1,2,3 grid-color=#AABBCC grid-alpha=0.5 snap=true zoom=2 window-mask=true selected-layer="HUD" mode=embedded-game />
  <layer name="" rendering=2d+3d camera-type=perspective visible=false locked=true lighting=true follow-base-camera=true ambient=#010203 near=1 far=500 fov=60 max-2d-distance=200>
    <camera size=default(640,480) viewport=default(0,0,0.5,1) />
    <effect name="Glow" type="Test::Glow" folded=true enabled=false numbers={"strength":2} strings={"mode":"soft"} booleans={"fast":true} />
    <Player id="${uuid(1)}" at=1,2,3 rotation=4,5,6 z-order=-2 size=auto(10x20) depth=30 opacity=42 flip=x,z locked sealed keep-ratio=false>
      <properties numbers={"animation":1} strings={"text":"Ready"} />
      <variables>
        <var name="Health" type=number value=100 />
        <var name="Mode" type=enum value="Idle" values=["Idle","Run"] />
        <var name="Data" type=structure><var name="Ready" type=boolean value=true /></var>
        <var name="Path" type=array><var type=string value="A" /><var type=string value="B" /></var>
      </variables>
      <override behavior="Move" data={"speed":12} folded=true quick=visible property-visibility={"speed":"hidden"} />
    </Player>
  </layer>
  <layer name="HUD"></layer>
</layout>`;
    const output = compileLayoutDsl(source, {
      kind: 'scene',
      objectNames: ['Player'],
      behaviorTypesByObject: { Player: { Move: 'Movement::Move' } },
    });
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
          effects: [{ name: 'Glow', disabled: true }],
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
          behaviorOverridings: [{ name: 'Move', type: 'Movement::Move', speed: 12 }],
        },
      ],
    });
    const semanticContext = {
      kind: 'scene',
      objectNames: ['Player'],
      behaviorTypesByObject: { Player: { Move: 'Movement::Move' } },
    };
    expect(
      compileLayoutDsl(
        decompileLayoutDsl(output, semanticContext),
        semanticContext
      )
    ).toEqual(output);
  });

  test('compiles prefab bounds and external layer references', () => {
    expect(
      compileLayoutDsl(
        `<layout version=1><bounds min=-1,0,2 max=3,4,5 /></layout>`,
        { kind: 'prefab' }
      )
    ).toMatchObject({ areaMinX: -1, areaMaxZ: 5, layers: [], instances: [] });

    expect(
      compileLayoutDsl(
        `<layout version=1><layer name="World"><Coin id="${uuid(2)}" at=1,2 /></layer></layout>`,
        { kind: 'external', objectNames: ['Coin'], layerNames: ['World'] }
      )
    ).toEqual({ editionSettings: {}, instances: [expect.objectContaining({ layer: 'World' })] });
  });

  test('normalizes partial current editor tuples with editor defaults', () => {
    const source = decompileLayoutDsl(
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
    expect(source).toContain('grid-size=16,32,32');
    expect(source).toContain('grid-offset=0,5,0');
    expect(
      compileLayoutDsl(source, { kind: 'prefab' }).editionSettings
    ).toMatchObject({
      gridWidth: 16,
      gridHeight: 32,
      gridDepth: 32,
      gridOffsetX: 0,
      gridOffsetY: 5,
      gridOffsetZ: 0,
    });
  });

  test.each([
    [`<layout version=1 background=#000000><layer name=""><Missing id="${uuid(1)}" at=0,0 /></layer></layout>`, { kind: 'scene', objectNames: [] }, 'LAYOUT_UNKNOWN_OBJECT'],
    [`<layout version=1><layer name="Missing"></layer></layout>`, { kind: 'external', layerNames: [''] }, 'LAYOUT_UNKNOWN_LAYER'],
    [`<layout version=1 background=#000000><layer name=""><Player id="bad" at=0,0 /></layer></layout>`, { kind: 'scene' }, 'LAYOUT_INVALID_UUID'],
    [`<layout version=1 background=#000000><layer name=""><Player id="${uuid(1)}" at=0,0 order=1 /></layer></layout>`, { kind: 'scene' }, 'LAYOUT_INVALID_ORDER'],
    [`<layout version=1 background=#000000><layer name=""><Player id="${uuid(1)}" at=0,0 opacity=256 /></layer></layout>`, { kind: 'scene' }, 'LAYOUT_INVALID_INSTANCE'],
    [`<layout version=1 background=#000000><layer name="" camera-type=perspective near=0></layer></layout>`, { kind: 'scene' }, 'LAYOUT_INVALID_LAYER'],
    [`<layout version=1 background=#000000><layer name=""><Player id="${uuid(1)}" at=0,0 /><Player id="${uuid(1)}" at=1,1 /></layer></layout>`, { kind: 'scene' }, 'LAYOUT_DUPLICATE_UUID'],
    [`<layout version=1 background=#000000><layer name=""><Player id="${uuid(1)}" at=0,0 order=0 /><Player id="${uuid(2)}" at=1,1 /></layer></layout>`, { kind: 'scene' }, 'LAYOUT_INVALID_ORDER'],
    [`<layout version=1 background=#000000><layer name=""><camera size=default viewport=0,0,2,1 /></layer></layout>`, { kind: 'scene' }, 'LAYOUT_INVALID_CAMERA'],
    [`<layout version=1 background=#000000><layer name=""><effect name="X" type="T" /><effect name="X" type="T" /></layer></layout>`, { kind: 'scene' }, 'LAYOUT_DUPLICATE_EFFECT'],
    [`<layout version=1 background=#000000><layer name=""><effect name="X" type="T" numbers={"x":"wrong"} /></layer></layout>`, { kind: 'scene' }, 'LAYOUT_INVALID_NUMBER'],
    [`<layout version=1 background=#000000><layer name=""><effect name="X" type="T" /></layer></layout>`, { kind: 'scene', effectTypes: [] }, 'LAYOUT_UNKNOWN_EFFECT_TYPE'],
    [`<layout version=1 background=#000000><layer name=""><effect name="X" type="T" strings={"strength":"wrong"} /></layer></layout>`, { kind: 'scene', effectTypes: ['T'], effectParameterTypesByType: { T: { strength: 'number' } } }, 'LAYOUT_INVALID_EFFECT_PARAMETER'],
    [`<layout version=1 background=#000000><layer name=""><camera size=default viewport=default /><effect name="X" type="T" /><camera size=default viewport=default /></layer></layout>`, { kind: 'scene' }, 'LAYOUT_CHILD_ORDER'],
    [`<layout version=1 background=#000000><layer name=""><Player id="${uuid(1)}" at=0,0><variables><var name="X" type=enum value="C" values=["A","B"] /></variables></Player></layer></layout>`, { kind: 'scene' }, 'LAYOUT_INVALID_VARIABLE'],
    [`<layout version=1 background=#000000><layer name=""><Player id="${uuid(1)}" at=0,0><override behavior="Move" data={} /></Player></layer></layout>`, { kind: 'scene' }, 'LAYOUT_UNKNOWN_BEHAVIOR'],
    [`<layout version=1 background=#000000><layer name=""><Player id="${uuid(1)}" at=0,0><properties strings={"animation":"wrong"} /></Player></layer></layout>`, { kind: 'scene', instancePropertyTypesByObject: { Player: { animation: 'number' } } }, 'LAYOUT_INVALID_INSTANCE_PROPERTY'],
    [`<layout version=1><layer name=""><camera size=default viewport=default /></layer></layout>`, { kind: 'external', layerNames: [''] }, 'LAYOUT_INVALID_CHILD'],
  ])('validates semantic rule %#', (source, context, code) => {
    expect(() => compileLayoutDsl(source, context)).toThrow(
      expect.objectContaining({ code })
    );
  });

  test('rejects the current camera duplication guard limit', () => {
    const cameras = Array.from(
      { length: 51 },
      () => '<camera size=default viewport=default />'
    ).join('');
    expect(() =>
      compileLayoutDsl(
        `<layout version=1 background=#000000><layer name="">${cameras}</layer></layout>`,
        { kind: 'scene' }
      )
    ).toThrow(expect.objectContaining({ code: 'LAYOUT_TOO_MANY_CAMERAS' }));
  });

  test('rejects malformed typed literals before semantic compilation', () => {
    expect(() =>
      parseLayoutDsl(
        `<layout version=1><layer name=""><effect name="X" type="T" numbers={"x":1,} /></layer></layout>`
      )
    ).toThrow(expect.objectContaining({ code: 'LAYOUT_INVALID_LITERAL' }));
  });

  test('normalizes explicitly authored instance defaults to serializer omission', () => {
    const instance = compileLayoutDsl(
      `<layout version=1 background=#000000><layer name=""><Player id="${uuid(
        9
      )}" at=0,0 opacity=255 locked=false sealed=false keep-ratio=true /></layer></layout>`,
      { kind: 'scene' }
    ).instances[0];
    expect(instance).not.toHaveProperty('opacity');
    expect(instance).not.toHaveProperty('locked');
    expect(instance).not.toHaveProperty('sealed');
    expect(instance.keepRatio).toBe(true);
  });

  test('preserves interleaved global instance order with all-or-none order', () => {
    const layout = {
      r: 0,
      v: 0,
      b: 0,
      uiSettings: {},
      layers: [{ name: '' }, { name: 'HUD' }],
      instances: [
        { name: 'A', x: 0, y: 0, angle: 0, zOrder: 0, layer: '', customSize: false, width: 0, height: 0, persistentUuid: uuid(1), numberProperties: [], stringProperties: [], initialVariables: [] },
        { name: 'B', x: 0, y: 0, angle: 0, zOrder: 0, layer: 'HUD', customSize: false, width: 0, height: 0, persistentUuid: uuid(2), numberProperties: [], stringProperties: [], initialVariables: [] },
        { name: 'C', x: 0, y: 0, angle: 0, zOrder: 0, layer: '', customSize: false, width: 0, height: 0, persistentUuid: uuid(3), numberProperties: [], stringProperties: [], initialVariables: [] },
      ],
    };
    const source = decompileLayoutDsl(layout, { kind: 'scene' });
    expect(source.match(/ order=/g)).toHaveLength(3);
    expect(compileLayoutDsl(source, { kind: 'scene' }).instances.map(item => item.name)).toEqual(['A', 'B', 'C']);
  });

  test('uses fallback object tags and canonical stable formatting', () => {
    const layout = {
      editionSettings: {},
      instances: [{ name: 'layer', x: 1, y: 2, angle: 0, zOrder: 0, layer: '', customSize: false, width: 0, height: 0, persistentUuid: uuid(4), numberProperties: [], stringProperties: [], initialVariables: [] }],
    };
    const source = decompileLayoutDsl(layout, { kind: 'external' });
    expect(source).toContain('<object of="layer"');
    expect(decompileLayoutDsl(compileLayoutDsl(source, { kind: 'external' }), { kind: 'external' })).toBe(source);
    expect(source.endsWith('\n')).toBe(true);
    expect(
      formatLayoutDsl(source.replace(/^ {2}/gm, '      '), {
        kind: 'external',
      })
    ).toBe(source);
    expect(
      areLayoutFragmentsEquivalent(
        layout,
        compileLayoutDsl(source, { kind: 'external' }),
        { kind: 'external' }
      )
    ).toBe(true);
  });

  test('fails rather than losing unknown serializer fields', () => {
    expect(() =>
      decompileLayoutDsl(
        { r: 0, v: 0, b: 0, uiSettings: {}, layers: [], instances: [], futureField: true },
        { kind: 'scene' }
      )
    ).toThrow(expect.objectContaining({ code: 'LAYOUT_UNSUPPORTED_FIELD' }));

    expect(() =>
      decompileLayoutDsl(
        {
          editionSettings: {},
          instances: [
            {
              name: 'Player',
              x: 0,
              y: 0,
              angle: 0,
              zOrder: 0,
              layer: '',
              customSize: false,
              width: 0,
              height: 0,
              persistentUuid: uuid(8),
              numberProperties: [
                { name: 'animation', value: 1 },
                { name: 'animation', value: 2 },
              ],
              stringProperties: [],
              initialVariables: [],
            },
          ],
        },
        { kind: 'external' }
      )
    ).toThrow(
      expect.objectContaining({ code: 'LAYOUT_INVALID_INSTANCE_PROPERTY' })
    );
  });

  test('reports file, line and column', () => {
    try {
      compileLayoutDsl('<layout version=1 background=#000000>\n  <bad />\n</layout>', {
        kind: 'scene',
        fileUri: 'game://scenes/Main/Main.layout',
      });
      throw new Error('Expected compilation failure.');
    } catch (error) {
      expect(error).toBeInstanceOf(LayoutDslError);
      expect(error).toMatchObject({ line: 2, column: 3, fileUri: 'game://scenes/Main/Main.layout' });
    }
  });
});
