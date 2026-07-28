// @flow
import optionalRequire from '../Utils/OptionalRequire';
import { listModel3DEmbeddedResources } from './LocalEmbeddedResourceSources';
const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const os = optionalRequire('os');
const path = optionalRequire('path');
const { Buffer } = optionalRequire('buffer');

const glbJsonChunkType = 0x4e4f534a; // "JSON"
const glbBinChunkType = 0x004e4942; // "BIN\0"

/** Build the content of a GLB file holding the given glTF description. */
const createGlbFileContent = (gltf: Object) => {
  const jsonChunk = Buffer.from(JSON.stringify(gltf), 'utf8');
  // Chunks must be padded so that the next one starts on a 4 bytes boundary.
  const jsonPadding = (4 - (jsonChunk.byteLength % 4)) % 4;
  const paddedJsonChunk = Buffer.concat([
    jsonChunk,
    Buffer.alloc(jsonPadding, 0x20 /* a space */),
  ]);
  // A tiny binary chunk, as a real model would have.
  const paddedBinChunk = Buffer.alloc(4);

  const fileContent = Buffer.alloc(
    12 + 8 + paddedJsonChunk.byteLength + 8 + paddedBinChunk.byteLength
  );
  fileContent.writeUInt32LE(0x46546c67 /* "glTF" */, 0);
  fileContent.writeUInt32LE(2 /* version */, 4);
  fileContent.writeUInt32LE(fileContent.byteLength, 8);

  fileContent.writeUInt32LE(paddedJsonChunk.byteLength, 12);
  fileContent.writeUInt32LE(glbJsonChunkType, 16);
  paddedJsonChunk.copy(fileContent, 20);

  const binChunkStart = 20 + paddedJsonChunk.byteLength;
  fileContent.writeUInt32LE(paddedBinChunk.byteLength, binChunkStart);
  fileContent.writeUInt32LE(glbBinChunkType, binChunkStart + 4);
  paddedBinChunk.copy(fileContent, binChunkStart + 8);

  return fileContent;
};

describe('listModel3DEmbeddedResources', () => {
  let projectFolderPath: string;
  let project: gdProject;

  beforeEach(() => {
    projectFolderPath = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-model3d-test-')
    );
    project = gd.ProjectHelper.createNewGDJSProject();
    project.setProjectFile(path.join(projectFolderPath, 'game.json'));
  });

  afterEach(() => {
    project.delete();
    fs.rmSync(projectFolderPath, { recursive: true, force: true });
  });

  const writeModel = (fileName: string, gltf: Object): string => {
    const filePath = path.join(projectFolderPath, fileName);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, createGlbFileContent(gltf));
    return filePath;
  };

  const writeTexture = (relativeFilePath: string) => {
    const filePath = path.join(projectFolderPath, relativeFilePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, 'not-a-real-png');
  };

  it('lists the texture files kept outside of a model', async () => {
    writeTexture('Textures/colormap.png');
    const filePath = writeModel('Models/sword.glb', {
      images: [{ uri: '../Textures/colormap.png' }],
    });

    const embeddedResources = await listModel3DEmbeddedResources(
      project,
      filePath
    );

    if (!embeddedResources) throw new Error('Expected embedded resources.');
    expect(embeddedResources.hasAnyEmbeddedResourceOutsideProjectFolder).toBe(
      false
    );
    expect([...embeddedResources.embeddedResources.keys()]).toEqual([
      '../Textures/colormap.png',
    ]);

    const embeddedResource = embeddedResources.embeddedResources.get(
      '../Textures/colormap.png'
    );
    if (!embeddedResource) throw new Error('Expected an embedded resource.');
    expect(embeddedResource.resourceKind).toBe('image');
    // The path written in the model is kept as it is, as this is what the
    // loaders will look for.
    expect(embeddedResource.relPath).toBe('../Textures/colormap.png');
    expect(embeddedResource.fullPath).toBe(
      path.join(projectFolderPath, 'Textures', 'colormap.png')
    );
  });

  it('lists a texture file used more than once only once', async () => {
    writeTexture('colormap.png');
    const filePath = writeModel('sword.glb', {
      images: [
        { uri: 'colormap.png' },
        { uri: 'colormap.png' },
        { uri: 'colormap.png' },
      ],
    });

    const embeddedResources = await listModel3DEmbeddedResources(
      project,
      filePath
    );

    if (!embeddedResources) throw new Error('Expected embedded resources.');
    expect(embeddedResources.embeddedResources.size).toBe(1);
  });

  it('finds the file of a texture whose path is percent-encoded', async () => {
    writeTexture('color map.png');
    const filePath = writeModel('sword.glb', {
      images: [{ uri: 'color%20map.png' }],
    });

    const embeddedResources = await listModel3DEmbeddedResources(
      project,
      filePath
    );

    if (!embeddedResources) throw new Error('Expected embedded resources.');
    const embeddedResource = embeddedResources.embeddedResources.get(
      'color%20map.png'
    );
    if (!embeddedResource) throw new Error('Expected an embedded resource.');
    expect(embeddedResource.fullPath).toBe(
      path.join(projectFolderPath, 'color map.png')
    );
  });

  it('reports textures stored outside of the project folder', async () => {
    const outsideFolderPath = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-model3d-outside-')
    );
    try {
      fs.writeFileSync(
        path.join(outsideFolderPath, 'colormap.png'),
        'not-a-real-png'
      );
      const filePath = writeModel('sword.glb', {
        images: [
          {
            uri: path
              .relative(
                projectFolderPath,
                path.join(outsideFolderPath, 'colormap.png')
              )
              .replace(/\\/g, '/'),
          },
        ],
      });

      const embeddedResources = await listModel3DEmbeddedResources(
        project,
        filePath
      );

      if (!embeddedResources) throw new Error('Expected embedded resources.');
      expect(embeddedResources.hasAnyEmbeddedResourceOutsideProjectFolder).toBe(
        true
      );
    } finally {
      fs.rmSync(outsideFolderPath, { recursive: true, force: true });
    }
  });

  it('ignores textures that are stored in the model itself', async () => {
    const filePath = writeModel('sword.glb', {
      images: [
        // Stored in the binary chunk of the GLB file.
        { bufferView: 0, mimeType: 'image/png' },
        // Stored in the glTF description itself.
        { uri: 'data:image/png;base64,iVBORw0KGgo=' },
      ],
    });

    expect(await listModel3DEmbeddedResources(project, filePath)).toBe(null);
  });

  it('ignores textures downloaded from the internet', async () => {
    const filePath = writeModel('sword.glb', {
      images: [{ uri: 'https://example.com/colormap.png' }],
    });

    expect(await listModel3DEmbeddedResources(project, filePath)).toBe(null);
  });

  it('ignores texture files that are missing', async () => {
    const filePath = writeModel('sword.glb', {
      images: [{ uri: 'colormap.png' }],
    });

    expect(await listModel3DEmbeddedResources(project, filePath)).toBe(null);
  });

  it('returns nothing for a model without any texture', async () => {
    const filePath = writeModel('sword.glb', { images: [] });

    expect(await listModel3DEmbeddedResources(project, filePath)).toBe(null);
  });

  it('returns nothing for a file that is not a GLB file', async () => {
    const filePath = path.join(projectFolderPath, 'sword.glb');
    fs.writeFileSync(filePath, JSON.stringify({ images: [{ uri: 'a.png' }] }));

    expect(await listModel3DEmbeddedResources(project, filePath)).toBe(null);
  });

  it('returns nothing for a truncated GLB file', async () => {
    writeTexture('colormap.png');
    const filePath = writeModel('sword.glb', {
      images: [{ uri: 'colormap.png' }],
    });
    const fileContent = fs.readFileSync(filePath);
    fs.writeFileSync(filePath, fileContent.subarray(0, 16));

    expect(await listModel3DEmbeddedResources(project, filePath)).toBe(null);
  });
});
