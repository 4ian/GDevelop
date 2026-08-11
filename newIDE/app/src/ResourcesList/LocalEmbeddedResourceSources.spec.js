// @flow
import {
  copyAllEmbeddedResourcesToProjectFolder,
  type EmbeddedResource,
  type EmbeddedResources,
} from './LocalEmbeddedResourceSources';
import optionalRequire from '../Utils/OptionalRequire';
const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const os = optionalRequire('os');
const path = optionalRequire('path');

describe('LocalEmbeddedResourceSources', () => {
  describe('copyAllEmbeddedResourcesToProjectFolder', () => {
    let tempDir: ?string = null;

    afterEach(() => {
      if (tempDir) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        tempDir = null;
      }
    });

    it('copies embedded resources to the requested imported resources folder', async () => {
      const createdTempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'gd-embedded-resource-utils-')
      );
      tempDir = createdTempDir;
      const projectFolder = path.join(createdTempDir, 'project');
      const sourceFolder = path.join(createdTempDir, 'source');
      fs.mkdirSync(path.join(projectFolder, 'assets'), { recursive: true });
      fs.mkdirSync(sourceFolder);
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.setProjectFile(path.join(projectFolder, 'game.json'));

      const existingAssetPath = path.join(projectFolder, 'assets', 'tiles.png');
      fs.writeFileSync(existingAssetPath, 'existing image content');
      const sourcePath = path.join(sourceFolder, 'tiles.png');
      fs.writeFileSync(sourcePath, 'new image content');

      const embeddedResources: Map<string, EmbeddedResource> = new Map();
      embeddedResources.set('tiles.png', {
        resourceKind: 'image',
        relPath: 'tiles.png',
        fullPath: sourcePath,
        isOutsideProjectFolder: true,
      });
      const filesWithEmbeddedResources: Map<
        string,
        EmbeddedResources
      > = new Map();
      filesWithEmbeddedResources.set(path.join(sourceFolder, 'map.json'), {
        hasAnyEmbeddedResourceOutsideProjectFolder: true,
        embeddedResources,
      });

      await copyAllEmbeddedResourcesToProjectFolder(
        project,
        filesWithEmbeddedResources,
        'assets'
      );

      const expectedCopiedPath = path.join(
        projectFolder,
        'assets',
        'tiles2.png'
      );
      expect(fs.readFileSync(existingAssetPath, 'utf8')).toBe(
        'existing image content'
      );
      expect(fs.readFileSync(expectedCopiedPath, 'utf8')).toBe(
        'new image content'
      );
      const copiedEmbeddedResource = embeddedResources.get('tiles.png');
      if (!copiedEmbeddedResource) {
        throw new Error('Expected embedded resource to exist.');
      }
      expect(copiedEmbeddedResource.resourceName).toBe('assets/tiles2.png');

      project.delete();
    });

    it('copies embedded resources from the project root to the requested imported resources folder', async () => {
      const createdTempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'gd-embedded-resource-utils-')
      );
      tempDir = createdTempDir;
      const projectFolder = path.join(createdTempDir, 'project');
      fs.mkdirSync(projectFolder);
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.setProjectFile(path.join(projectFolder, 'game.json'));

      const sourcePath = path.join(projectFolder, 'tiles.png');
      fs.writeFileSync(sourcePath, 'root image content');

      const embeddedResources: Map<string, EmbeddedResource> = new Map();
      embeddedResources.set('tiles.png', {
        resourceKind: 'image',
        relPath: 'tiles.png',
        fullPath: sourcePath,
        isOutsideProjectFolder: false,
      });
      const filesWithEmbeddedResources: Map<
        string,
        EmbeddedResources
      > = new Map();
      filesWithEmbeddedResources.set(path.join(projectFolder, 'map.json'), {
        hasAnyEmbeddedResourceOutsideProjectFolder: false,
        embeddedResources,
      });

      await copyAllEmbeddedResourcesToProjectFolder(
        project,
        filesWithEmbeddedResources,
        'assets'
      );

      const expectedCopiedPath = path.join(
        projectFolder,
        'assets',
        'tiles.png'
      );
      expect(fs.readFileSync(expectedCopiedPath, 'utf8')).toBe(
        'root image content'
      );
      const copiedEmbeddedResource = embeddedResources.get('tiles.png');
      if (!copiedEmbeddedResource) {
        throw new Error('Expected embedded resource to exist.');
      }
      expect(copiedEmbeddedResource.resourceName).toBe('assets/tiles.png');

      project.delete();
    });
  });
});
