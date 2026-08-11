// @flow
import {
  createProjectAssetResourceFromFile,
  createProjectAssetResourceFromResourceName,
  getProjectAssetsFolderResources,
  isSupportedProjectAssetResourceFile,
} from './ProjectAssetsFolderResources';
import optionalRequire from '../../Utils/OptionalRequire';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const os = optionalRequire('os');
const path = optionalRequire('path');

describe('ProjectResourcesChooser', () => {
  it('detects supported files for image project assets', () => {
    expect(
      isSupportedProjectAssetResourceFile({
        filePath: 'assets/player.PNG',
        resourceKind: 'image',
      })
    ).toBe(true);
    expect(
      isSupportedProjectAssetResourceFile({
        filePath: 'assets/readme.txt',
        resourceKind: 'image',
      })
    ).toBe(false);
  });

  it('creates project-relative resources from asset files', () => {
    if (!path) return;

    const projectRootPath = path.join('tmp', 'Project');
    const resource = createProjectAssetResourceFromFile({
      projectRootPath,
      resourceKind: 'image',
      filePath: path.join(projectRootPath, 'assets', 'hero.png'),
    });

    expect(resource).not.toBe(null);
    if (!resource) return;
    expect(resource.getName()).toBe('assets/hero.png');
    expect(resource.getFile()).toBe('assets/hero.png');
    expect(resource.getKind()).toBe('image');
    resource.delete();
  });

  it('creates project-relative resources from existing asset resource names', () => {
    if (!fs || !os || !path) return;

    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gd-project-assets-')
    );
    const projectFolder = path.join(tempDir, 'project');
    fs.mkdirSync(path.join(projectFolder, 'assets', 'animations'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(projectFolder, 'assets', 'animations', 'walk.json'),
      '{}'
    );

    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setProjectFile(path.join(projectFolder, 'game.json'));

    try {
      const resource = createProjectAssetResourceFromResourceName({
        project,
        resourceKind: 'json',
        resourceName: 'assets/animations/walk.json',
      });

      expect(resource).not.toBe(null);
      if (!resource) return;
      expect(resource.getName()).toBe('assets/animations/walk.json');
      expect(resource.getFile()).toBe('assets/animations/walk.json');
      expect(resource.getKind()).toBe('json');
      resource.delete();

      expect(
        createProjectAssetResourceFromResourceName({
          project,
          resourceKind: 'json',
          resourceName: '../outside.json',
        })
      ).toBe(null);
    } finally {
      project.delete();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('lists unregistered resources from the project assets folder', async () => {
    if (!fs || !os || !path) return;

    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gd-project-assets-')
    );
    const projectFolder = path.join(tempDir, 'project');
    const assetsFolder = path.join(projectFolder, 'assets');
    const nestedAssetsFolder = path.join(assetsFolder, 'nested');
    fs.mkdirSync(nestedAssetsFolder, { recursive: true });
    fs.writeFileSync(path.join(assetsFolder, 'hero.png'), 'fake image');
    fs.writeFileSync(path.join(assetsFolder, 'registered.png'), 'fake image');
    fs.writeFileSync(path.join(assetsFolder, 'readme.txt'), 'not an image');
    fs.writeFileSync(path.join(nestedAssetsFolder, 'enemy.webp'), 'fake image');

    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setProjectFile(path.join(projectFolder, 'game.json'));

    const registeredResource = new gd.ImageResource();
    registeredResource.setName('assets/registered.png');
    registeredResource.setFile('assets/registered.png');
    project.getResourcesManager().addResource(registeredResource);
    registeredResource.delete();

    try {
      const resources = await getProjectAssetsFolderResources({
        project,
        resourceKind: 'image',
      });

      expect(resources.map(resource => resource.getName()).sort()).toEqual([
        'assets/hero.png',
        'assets/nested/enemy.webp',
      ]);
      resources.forEach(resource => resource.delete());
    } finally {
      project.delete();
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
