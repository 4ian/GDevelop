// @flow
import {
  applyStarterThemeToProjectContent,
  hasStarterPlaceholders,
} from './StarterTheme';
import {
  type StarterPlaceholders,
  type StarterTheme,
} from '../Utils/GDevelopServices/StarterTheme';

const makeStarterPlaceholders = (): StarterPlaceholders => ({
  version: 1,
  slots: [
    { id: 'character.player', kind: 'model', label: 'Player character' },
    { id: 'character.enemy', kind: 'model', label: 'Enemy character' },
    { id: 'env.ground', kind: 'texture', label: 'Ground' },
    { id: 'sky.day.front', kind: 'texture', label: 'Day skybox, front face' },
  ],
  models: {
    'starting_unit_orange.glb': 'character.player',
    'starting_unit_red.glb': 'character.enemy',
  },
  textures: {
    'StartingGround.png': 'env.ground',
    'Skybox_Front.png': 'sky.day.front',
  },
  ignoredTextures: ['StartingCameraBody.png'],
});

const makeStarterTheme = (): StarterTheme => ({
  id: 'pirate',
  name: 'Pirate islands',
  slots: {
    'character.player': {
      kind: 'model',
      file: 'https://asset-resources.gdevelop.io/public-resources/Henry.glb',
      assetStoreId: 'abc123',
      objectContent: {
        modelResourceName: 'Henry.glb',
        width: 200,
        height: 200,
        depth: 200,
        rotationX: 90,
        rotationY: 0,
        rotationZ: 90,
        materialType: 'StandardWithoutMetalness',
        originLocation: 'ModelOrigin',
        centerLocation: 'CenteredOnZ',
        animations: [
          { name: 'Idle', source: 'Henry_Idle', loop: true },
          { name: 'Run', source: 'Henry_Run', loop: true },
        ],
      },
    },
    'env.ground': {
      kind: 'texture',
      file: 'https://asset-resources.gdevelop.io/public-resources/Sand.png',
    },
    'sky.day.front': {
      kind: 'texture',
      file: 'https://asset-resources.gdevelop.io/public-resources/Tropical.png',
      origin: { name: 'gdevelop-asset-store', identifier: 'tropical-front' },
    },
  },
});

const makeProjectContent = (): Object => ({
  resources: {
    resources: [
      {
        name: 'assets\\starting_unit_orange.glb',
        file: 'assets/starting_unit_orange.glb',
        kind: 'model3D',
      },
      {
        name: 'assets\\starting_unit_red.glb',
        file: 'assets/starting_unit_red.glb',
        kind: 'model3D',
      },
      {
        name: 'assets/StartingGround.png',
        file: 'assets/StartingGround.png',
        kind: 'image',
      },
      {
        name: 'assets/Skybox_Front.png',
        file: 'assets/Skybox_Front.png',
        kind: 'image',
      },
      {
        name: 'assets/StartingCameraBody.png',
        file: 'assets/StartingCameraBody.png',
        kind: 'image',
      },
      {
        name: 'assets/Flat dark joystick thumb.png',
        file: 'assets/Flat dark joystick thumb.png',
        kind: 'image',
      },
    ],
  },
  layouts: [
    {
      name: 'Game Scene',
      objects: [
        {
          name: 'Player',
          type: 'Scene3D::Model3DObject',
          behaviors: [
            { name: 'Physics3D', type: 'Physics3D::Physics3DBehavior' },
          ],
          variables: [{ name: 'Health', value: 3 }],
          content: {
            modelResourceName: 'assets\\starting_unit_orange.glb',
            width: 100,
            height: 100,
            depth: 100,
            rotationX: 90,
            rotationY: 0,
            rotationZ: 90,
            originLocation: 'ModelOrigin',
            centerLocation: 'ModelOrigin',
            animations: [],
          },
        },
        {
          name: 'Ground',
          type: 'Scene3D::Cube3DObject',
          content: {
            frontFaceResourceName: 'assets/StartingGround.png',
            topFaceResourceName: 'assets/StartingGround.png',
          },
        },
        {
          name: 'Joystick',
          type: 'Sprite',
          content: {},
        },
      ],
    },
  ],
});

describe('applyStarterThemeToProjectContent', () => {
  it('repoints placeholder resources at the theme files', () => {
    const projectContent = makeProjectContent();

    const result = applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders: makeStarterPlaceholders(),
      starterTheme: makeStarterTheme(),
    });

    const resources = projectContent.resources.resources;
    expect(resources[0].file).toBe(
      'https://asset-resources.gdevelop.io/public-resources/Henry.glb'
    );
    expect(resources[2].file).toBe(
      'https://asset-resources.gdevelop.io/public-resources/Sand.png'
    );
    expect(resources[3].file).toBe(
      'https://asset-resources.gdevelop.io/public-resources/Tropical.png'
    );
    expect(resources[3].origin).toEqual({
      name: 'gdevelop-asset-store',
      identifier: 'tropical-front',
    });
    expect(result.changedResourcesCount).toBe(3);
  });

  it('leaves resource names untouched so every user of a texture follows', () => {
    const projectContent = makeProjectContent();

    applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders: makeStarterPlaceholders(),
      starterTheme: makeStarterTheme(),
    });

    const ground = projectContent.layouts[0].objects[1];
    expect(projectContent.resources.resources[2].name).toBe(
      'assets/StartingGround.png'
    );
    expect(ground.content.frontFaceResourceName).toBe(
      'assets/StartingGround.png'
    );
  });

  it('does not touch resources that are not placeholders', () => {
    const projectContent = makeProjectContent();

    applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders: makeStarterPlaceholders(),
      starterTheme: makeStarterTheme(),
    });

    expect(projectContent.resources.resources[4].file).toBe(
      'assets/StartingCameraBody.png'
    );
    expect(projectContent.resources.resources[5].file).toBe(
      'assets/Flat dark joystick thumb.png'
    );
  });

  it('takes the theme model content while keeping the object identity', () => {
    const projectContent = makeProjectContent();

    applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders: makeStarterPlaceholders(),
      starterTheme: makeStarterTheme(),
    });

    const player = projectContent.layouts[0].objects[0];
    expect(player.name).toBe('Player');
    expect(player.behaviors).toEqual([
      { name: 'Physics3D', type: 'Physics3D::Physics3DBehavior' },
    ]);
    expect(player.variables).toEqual([{ name: 'Health', value: 3 }]);
    expect(player.assetStoreId).toBe('abc123');
    expect(player.content.materialType).toBe('StandardWithoutMetalness');
    expect(player.content.modelResourceName).toBe(
      'assets\\starting_unit_orange.glb'
    );
  });

  it('keeps the origin and center of the starter object', () => {
    const projectContent = makeProjectContent();

    applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders: makeStarterPlaceholders(),
      starterTheme: makeStarterTheme(),
    });

    const player = projectContent.layouts[0].objects[0];
    expect(player.content.originLocation).toBe('ModelOrigin');
    expect(player.content.centerLocation).toBe('ModelOrigin');
  });

  it('scales the theme model to the volume the placeholder occupied', () => {
    const projectContent = makeProjectContent();

    applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders: makeStarterPlaceholders(),
      starterTheme: makeStarterTheme(),
    });

    const player = projectContent.layouts[0].objects[0];
    expect(player.content.width).toBeCloseTo(100);
    expect(player.content.height).toBeCloseTo(100);
    expect(player.content.depth).toBeCloseTo(100);
  });

  it('gives the object the theme animations when it had none', () => {
    const projectContent = makeProjectContent();

    applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders: makeStarterPlaceholders(),
      starterTheme: makeStarterTheme(),
    });

    const player = projectContent.layouts[0].objects[0];
    expect(player.content.animations).toEqual([
      { name: 'Idle', source: 'Henry_Idle', loop: true },
      { name: 'Run', source: 'Henry_Run', loop: true },
    ]);
  });

  it('keeps the animation names the object already had', () => {
    const projectContent = makeProjectContent();
    projectContent.layouts[0].objects[0].content.animations = [
      { name: 'Run', source: 'Placeholder_Run', loop: true },
      { name: 'Jump', source: 'Placeholder_Jump', loop: false },
    ];

    applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders: makeStarterPlaceholders(),
      starterTheme: makeStarterTheme(),
    });

    const animations = projectContent.layouts[0].objects[0].content.animations;
    expect(animations.map(animation => animation.name)).toEqual([
      'Run',
      'Jump',
      'Idle',
    ]);
    expect(animations[0].source).toBe('Henry_Run');
    // An animation the theme does not have falls back to its first one.
    expect(animations[1].source).toBe('Henry_Idle');
  });

  it('reports the slots the theme does not fill and leaves them untouched', () => {
    const projectContent = makeProjectContent();

    const result = applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders: makeStarterPlaceholders(),
      starterTheme: makeStarterTheme(),
    });

    expect(result.missingSlots).toEqual(['character.enemy']);
    expect(result.appliedSlots).toEqual([
      'character.player',
      'env.ground',
      'sky.day.front',
    ]);
    expect(projectContent.resources.resources[1].file).toBe(
      'assets/starting_unit_red.glb'
    );
  });

  it('themes the 3D objects held by events-based objects', () => {
    const projectContent = makeProjectContent();
    projectContent.eventsFunctionsExtensions = [
      {
        name: 'TankConfiguration',
        eventsBasedObjects: [
          {
            name: 'CombinedTank',
            objects: [
              {
                name: 'TankBase',
                type: 'Scene3D::Model3DObject',
                content: {
                  modelResourceName: 'assets\\starting_unit_orange.glb',
                  width: 100,
                  height: 100,
                  depth: 100,
                  animations: [],
                },
              },
            ],
          },
        ],
      },
    ];

    const result = applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders: makeStarterPlaceholders(),
      starterTheme: makeStarterTheme(),
    });

    const tankBase =
      projectContent.eventsFunctionsExtensions[0].eventsBasedObjects[0]
        .objects[0];
    expect(tankBase.content.materialType).toBe('StandardWithoutMetalness');
    expect(result.changedObjectsCount).toBe(2);
  });

  it('can be applied again to change the theme of an already themed project', () => {
    const projectContent = makeProjectContent();
    const starterPlaceholders = makeStarterPlaceholders();

    applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders,
      starterTheme: makeStarterTheme(),
    });

    const secondTheme = makeStarterTheme();
    secondTheme.id = 'medieval';
    secondTheme.slots['character.player'] = {
      kind: 'model',
      file: 'https://asset-resources.gdevelop.io/public-resources/Knight.glb',
      objectContent: {
        modelResourceName: 'Knight.glb',
        width: 150,
        height: 150,
        depth: 150,
        animations: [{ name: 'Idle', source: 'Knight_Idle', loop: true }],
      },
    };

    const result = applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders,
      starterTheme: secondTheme,
    });

    expect(result.themeId).toBe('medieval');
    expect(projectContent.resources.resources[0].file).toBe(
      'https://asset-resources.gdevelop.io/public-resources/Knight.glb'
    );
    expect(
      projectContent.layouts[0].objects[0].content.animations[0].source
    ).toBe('Knight_Idle');
  });

  it('changes nothing when the theme fills no slot of the project', () => {
    const projectContent = makeProjectContent();

    const result = applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders: makeStarterPlaceholders(),
      starterTheme: { id: 'empty', name: 'Empty', slots: {} },
    });

    expect(result.changedObjectsCount).toBe(0);
    expect(result.changedResourcesCount).toBe(0);
    expect(projectContent.resources.resources[0].file).toBe(
      'assets/starting_unit_orange.glb'
    );
  });
});

describe('hasStarterPlaceholders', () => {
  it('is true for a freshly created starter', () => {
    expect(
      hasStarterPlaceholders(makeProjectContent(), makeStarterPlaceholders())
    ).toBe(true);
  });

  it('is true for an already themed starter, whose resource names are kept', () => {
    const projectContent = makeProjectContent();
    applyStarterThemeToProjectContent(projectContent, {
      starterPlaceholders: makeStarterPlaceholders(),
      starterTheme: makeStarterTheme(),
    });

    expect(
      hasStarterPlaceholders(projectContent, makeStarterPlaceholders())
    ).toBe(true);
  });

  it('is false for a project built without the starter placeholders', () => {
    const projectContent = {
      resources: {
        resources: [
          { name: 'MyHero.glb', file: 'MyHero.glb', kind: 'model3D' },
          { name: 'MyGround.png', file: 'MyGround.png', kind: 'image' },
        ],
      },
      layouts: [],
    };

    expect(
      hasStarterPlaceholders(projectContent, makeStarterPlaceholders())
    ).toBe(false);
  });
});
