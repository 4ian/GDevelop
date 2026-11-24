// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';
import { rasterizeSvgToPng } from './SvgRasterizer';
import { getMatchingCollisionMask } from '../ObjectEditor/Editors/SpriteEditor/CollisionMasksEditor/CollisionMaskHelper';
import { type ResourceFilesStorage } from './AttachmentResources';

// Drawing an SVG and reading its pixels needs a browser.
jest.mock('./SvgRasterizer', () => ({ rasterizeSvgToPng: jest.fn() }));
jest.mock(
  '../ObjectEditor/Editors/SpriteEditor/CollisionMasksEditor/CollisionMaskHelper',
  () => ({ getMatchingCollisionMask: jest.fn() })
);

const gd: libGDevelop = global.gd;

// The test environment has no Blob: the one of Node can be given an object URL.
global.Blob = require('buffer').Blob;

const shipSvg = `<svg width="64" height="48" viewBox="0 0 64 48" onclick="alert(1)">
  <script>alert(1)</script>
  <polygon points="32,2 60,48 4,48" fill="#3af"/>
</svg>`;

const makeRectangleMask = (width: number, height: number) => {
  const polygon = gd.Polygon2d.createRectangle(width, height);
  const polygons = new gd.VectorPolygon2d();
  polygons.push_back(polygon);
  return polygons;
};

const getFirstFrame = (object: gdObject): gdSprite =>
  gd
    .asSpriteConfiguration(object.getConfiguration())
    .getAnimations()
    .getAnimation(0)
    .getDirection(0)
    .getSprite(0);

describe('create_image_from_code', () => {
  let project: gdProject;
  let scene: gdLayout;

  beforeEach(() => {
    project = gd.ProjectHelper.createNewGDJSProject();
    scene = project.insertNewLayout('Level', 0);
    // $FlowFixMe[prop-missing]
    rasterizeSvgToPng.mockResolvedValue(
      new Blob(['fake png'], { type: 'image/png' })
    );
    // $FlowFixMe[prop-missing]
    getMatchingCollisionMask.mockImplementation(async () =>
      makeRectangleMask(56, 46)
    );
  });

  afterEach(() => {
    project.delete();
  });

  const createImageFromCode = (
    args: Object,
    storeResourceFiles: () => Promise<ResourceFilesStorage> = async () =>
      'stored-when-project-is-saved'
  ): Promise<EditorFunctionGenericOutput> =>
    editorFunctions.create_image_from_code.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      attachmentsForResources: {
        getFiles: async () => ({}),
        storeResourceFiles,
      },
      args: { scope: { type: 'scene', scene_name: 'Level' }, ...args },
    });

  it('creates a sprite from an SVG, with the opaque part as collision mask', async () => {
    const result = await createImageFromCode({
      svg: shipSvg,
      object_name: 'Ship',
    });

    expect(result).toEqual({
      success: true,
      message:
        'Created the image resource "Ship.png" (64×48 px) and the object "Ship" (Sprite) using it in scene "Level". Removed from the SVG (the image must be self-contained): 1 <script>, 1 event handler attribute (on...). The project is not saved yet: the image will be stored in it when it is saved.',
    });
    const resource = project.getResourcesManager().getResource('Ship.png');
    expect(resource.getKind()).toBe('image');
    expect(resource.getFile()).toMatch(/^blob:/);
    const frame = getFirstFrame(scene.getObjects().getObject('Ship'));
    expect(frame.getImageName()).toBe('Ship.png');
    expect(frame.isFullImageCollisionMask()).toBe(false);
    // $FlowFixMe[prop-missing]
    const [drawnSvg, width, height] = rasterizeSvgToPng.mock.calls[0];
    expect([width, height]).toEqual([64, 48]);
    expect(drawnSvg).not.toMatch(/script|onclick/);
    expect(drawnSvg).toMatch(
      /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="64" height="48" viewBox="0 0 64 48">/
    );
  });

  it('creates only the image resource when no object name is given', async () => {
    const result = await createImageFromCode(
      {
        scope: undefined,
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"/>',
      },
      async () => {
        project
          .getResourcesManager()
          .getResource('image.png')
          .setFile('assets/image.png');
        return 'stored';
      }
    );

    expect(result).toEqual({
      success: true,
      message: 'Created the image resource "image.png" (32×32 px).',
    });
    expect(
      project
        .getResourcesManager()
        .getResource('image.png')
        .getFile()
    ).toBe('assets/image.png');
  });

  it('creates a tiled sprite and a panel sprite sized to the image', async () => {
    await createImageFromCode({
      svg: '<svg width="40" height="20"/>',
      object_name: 'Ground',
      object_type: 'TiledSpriteObject::TiledSprite',
    });
    await createImageFromCode({
      svg: '<svg width="40" height="20"/>',
      object_name: 'Button',
      object_type: 'PanelSpriteObject::PanelSprite',
    });

    const tiledSprite = gd.asTiledSpriteConfiguration(
      scene
        .getObjects()
        .getObject('Ground')
        .getConfiguration()
    );
    expect(tiledSprite.getTexture()).toBe('Ground.png');
    expect([tiledSprite.getWidth(), tiledSprite.getHeight()]).toEqual([40, 20]);
    const panelSprite = gd.asPanelSpriteConfiguration(
      scene
        .getObjects()
        .getObject('Button')
        .getConfiguration()
    );
    expect(panelSprite.getTexture()).toBe('Button.png');
    expect([panelSprite.getWidth(), panelSprite.getHeight()]).toEqual([40, 20]);
  });

  it('keeps an existing object unless asked to replace its image', async () => {
    await createImageFromCode({ svg: shipSvg, object_name: 'Ship' });

    const refusedResult = await createImageFromCode({
      svg: shipSvg,
      object_name: 'Ship',
    });
    expect(refusedResult.success).toBe(false);
    expect(refusedResult.message).toBe(
      'An object "Ship" already exists (Sprite): it was kept unchanged. Set `replace_existing_object` to true to give it the image, or use another `object_name`. Nothing was created.'
    );
    expect(project.getResourcesManager().hasResource('Ship2.png')).toBe(false);

    const replacedResult = await createImageFromCode({
      svg: '<svg width="10" height="10"/>',
      object_name: 'Ship',
      replace_existing_object: true,
    });
    expect(replacedResult.message).toBe(
      'Created the image resource "Ship2.png" (10×10 px) and set it as the image of the existing object "Ship" (Sprite) in scene "Level". The project is not saved yet: the image will be stored in it when it is saved.'
    );
    expect(scene.getObjects().getObjectsCount()).toBe(1);
    expect(
      getFirstFrame(scene.getObjects().getObject('Ship')).getImageName()
    ).toBe('Ship2.png');
  });

  it('fails without creating anything for an SVG too large or without a size', async () => {
    const tooLargeResult = await createImageFromCode({
      svg: '<svg width="5000" height="10"/>',
      object_name: 'Ship',
    });
    expect(tooLargeResult).toEqual({
      success: false,
      message:
        'The SVG is 5000x10 pixels: each side must be between 1 and 4096. Nothing was created.',
    });
    const noSizeResult = await createImageFromCode({
      svg: '<svg><rect/></svg>',
      object_name: 'Ship',
    });
    expect(noSizeResult.success).toBe(false);
    expect(scene.getObjects().hasObjectNamed('Ship')).toBe(false);
    expect(
      project
        .getResourcesManager()
        .getAllResourceNames()
        .size()
    ).toBe(0);
  });

  it('removes the image when its file could not be stored', async () => {
    const notSavedResult = await createImageFromCode(
      { svg: shipSvg, object_name: 'Ship' },
      async () => 'project-not-saved'
    );
    const notStoredResult = await createImageFromCode(
      { svg: shipSvg, object_name: 'Ship' },
      async () => 'stored'
    );

    expect(notSavedResult.success).toBe(false);
    expect(notStoredResult).toEqual({
      success: false,
      message:
        'The image could not be stored in the project. Nothing was created.',
    });
    expect(scene.getObjects().hasObjectNamed('Ship')).toBe(false);
    expect(project.getResourcesManager().hasResource('Ship.png')).toBe(false);
  });
});
