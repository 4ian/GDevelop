// @flow
/**
 * Runs a real HTML5 export (through libGD.js and the actual exporter) and packs
 * its resources, so that the whole chain is checked: the exporter writes
 * `data.js` and `index.html`, the packer reads them back, and the game engine
 * would find `gdjs.ResourcePackManager` in the script list.
 */
import assignIn from 'lodash/assignIn';
import { packResourcesInFolder } from './LocalResourcePacker';
import { parsePackIndex } from './PackFormat';
import optionalRequire from '../../Utils/OptionalRequire';

const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');
const os = optionalRequire('os');
const process = optionalRequire('process');

const gd: libGDevelop = global.gd;

// The tests are run from `newIDE/app`, where the built game engine lives.
const GDJS_ROOT = path.resolve(process.cwd(), 'resources/GDJS');

const addImageResource = (
  project: gdProject,
  name: string,
  absoluteFilePath: string
) => {
  const resource = new gd.ImageResource();
  resource.setName(name);
  resource.setFile(absoluteFilePath);
  project.getResourcesManager().addResource(resource);
  resource.delete();
};

/**
 * Add a sprite object using the given image, so that the resource is really
 * "used" by the scene and ends up in its `usedResources`.
 */
const addSpriteObject = (
  container: gdObjectsContainer,
  objectName: string,
  imageResourceName: string
) => {
  const object = container.insertNewObject(
    // $FlowFixMe[prop-missing] - the project is the platform holder here.
    global.testProject,
    'Sprite',
    objectName,
    container.getObjectsCount()
  );
  const configuration = gd.asSpriteConfiguration(object.getConfiguration());
  const animation = new gd.Animation();
  animation.setDirectionsCount(1);
  const direction = animation.getDirection(0);
  const sprite = new gd.Sprite();
  sprite.setImageName(imageResourceName);
  direction.addSprite(sprite);
  animation.setDirection(direction, 0);
  configuration.getAnimations().addAnimation(animation);
  animation.delete();
  sprite.delete();
};

describe('Full HTML5 export with packed resources', () => {
  let workingDir = '';
  let exportDir = '';
  let project: any = null;

  beforeAll(async () => {
    workingDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gdevelop-export-'));
    exportDir = path.join(workingDir, 'export');
    await fs.ensureDir(exportDir);

    // Real files on disk, so that the exporter really copies them.
    const assetsDir = path.join(workingDir, 'assets');
    await fs.ensureDir(assetsDir);
    const imagePaths: { [string]: string } = {};
    for (const name of ['global', 'menu', 'level']) {
      const filePath = path.join(assetsDir, `${name}.png`);
      await fs.writeFile(filePath, `the ${name} image`, 'utf8');
      imagePaths[name] = filePath;
    }

    project = gd.ProjectHelper.createNewGDJSProject();
    global.testProject = project;
    project.setName('Packing test');

    addImageResource(project, 'globalImage', imagePaths.global);
    addImageResource(project, 'menuImage', imagePaths.menu);
    addImageResource(project, 'levelImage', imagePaths.level);

    // A global object, so that its image lands in the project-wide resources.
    addSpriteObject(project.getObjects(), 'GlobalSprite', 'globalImage');

    const menuScene = project.insertNewLayout('Menu', 0);
    addSpriteObject(menuScene.getObjects(), 'MenuSprite', 'menuImage');
    const levelScene = project.insertNewLayout('Level', 1);
    addSpriteObject(levelScene.getObjects(), 'LevelSprite', 'levelImage');

    // `LocalFileSystem` transitively imports a web worker module that expects
    // `self` to exist, so it is required here rather than imported at the top.
    if (typeof global.self === 'undefined') global.self = global;
    const LocalFileSystem = require('../LocalExporters/LocalFileSystem')
      .default;

    // Run the actual exporter, as the export pipeline does.
    const localFileSystem = new LocalFileSystem({
      downloadUrlsToLocalFiles: true,
    });
    const fileSystem = assignIn(new gd.AbstractFileSystemJS(), localFileSystem);
    const exporter = new gd.Exporter(fileSystem, GDJS_ROOT);
    const exportOptions = new gd.ExportOptions(project, exportDir);
    const exportSucceeded = exporter.exportWholePixiProject(exportOptions);
    exportOptions.delete();
    exporter.delete();

    if (!exportSucceeded) throw new Error('The export failed.');
  }, 60000);

  afterAll(async () => {
    if (project) project.delete();
    global.testProject = null;
    if (workingDir) await fs.remove(workingDir);
  });

  it('exports a game whose index.html loads the resource pack manager', async () => {
    const indexHtml = await fs.readFile(
      path.join(exportDir, 'index.html'),
      'utf8'
    );

    // Without this script, `gdjs.ResourcePackManager` would be undefined and
    // the game would not start.
    expect(indexHtml).toContain('<script src="ResourcePackManager.js"');
    // It must come before the resource loader that instantiates it.
    expect(indexHtml.indexOf('ResourcePackManager.js')).toBeLessThan(
      indexHtml.indexOf('ResourceLoader.js')
    );
    expect(
      await fs.pathExists(path.join(exportDir, 'ResourcePackManager.js'))
    ).toBe(true);
  });

  it('packs the exported resources and keeps the game readable', async () => {
    const filesBeforePacking = await fs.readdir(exportDir);
    // The exporter flattens the resources at the root of the export.
    expect(filesBeforePacking).toContain('global.png');
    expect(filesBeforePacking).toContain('menu.png');
    expect(filesBeforePacking).toContain('level.png');

    await packResourcesInFolder({
      exportDir,
      onProgress: (count: number, total: number) => {},
    });

    const filesAfterPacking = await fs.readdir(exportDir);
    // Every resource is now inside a pack...
    expect(filesAfterPacking).not.toContain('global.png');
    expect(filesAfterPacking).not.toContain('menu.png');
    expect(filesAfterPacking).not.toContain('level.png');
    // ...and the engine files are untouched.
    expect(filesAfterPacking).toContain('index.html');
    expect(filesAfterPacking).toContain('data.js');
    expect(filesAfterPacking).toContain('runtimegame.js');

    const packNames = filesAfterPacking.filter(name => name.endsWith('.pak'));
    expect(packNames.sort()).toEqual([
      'resources.pak',
      'scene-0.pak',
      'scene-1.pak',
    ]);

    // The global image is used by a global object: it must be in the global
    // pack, and each scene image in its own pack.
    const readPack = async (name: string) =>
      parsePackIndex(
        new Uint8Array(await fs.readFile(path.join(exportDir, name)))
      ).entries.map(entry => entry.path);

    expect(await readPack('resources.pak')).toEqual(['global.png']);
    expect(await readPack('scene-0.pak')).toEqual(['menu.png']);
    expect(await readPack('scene-1.pak')).toEqual(['level.png']);
  });

  it('declares the packs in data.js, in a way the engine can read', async () => {
    const dataJs = await fs.readFile(path.join(exportDir, 'data.js'), 'utf8');

    // Evaluate data.js the way the browser would, and check what the engine
    // will find on the `gdjs` object.
    const gdjs: Object = {};
    // eslint-disable-next-line no-new-func
    const runDataJs: Function = new Function('gdjs', dataJs);
    runDataJs(gdjs);

    expect(gdjs.resourcePacks).toBeDefined();
    expect(gdjs.resourcePacks.version).toBe(1);
    expect(gdjs.resourcePacks.packs).toEqual([
      'resources.pak',
      'scene-0.pak',
      'scene-1.pak',
    ]);
    expect(gdjs.resourcePacks.files).toEqual({
      'global.png': 0,
      'menu.png': 1,
      'level.png': 2,
    });

    // Every packed file must still be a resource the engine knows about, under
    // the same name: this is what ties the manifest to `resource.file`.
    const resourceFiles = gdjs.projectData.resources.resources.map(
      resource => resource.file
    );
    Object.keys(gdjs.resourcePacks.files).forEach(filePath => {
      expect(resourceFiles).toContain(filePath);
    });
  });
});
