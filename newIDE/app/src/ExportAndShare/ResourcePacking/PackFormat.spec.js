// @flow
import {
  PACK_ALIGNMENT,
  PACK_VERSION,
  buildPackLayout,
  getResourceMimeType,
  parsePackIndex,
  type PackLayout,
} from './PackFormat';

/**
 * Assemble a whole pack the way the export pipelines do: the header, then each
 * file content followed by its padding.
 */
const assemblePack = (
  contents: Array<Uint8Array>
): {| packBytes: Uint8Array, layout: PackLayout |} => {
  const layout = buildPackLayout(
    contents.map((content, index) => ({
      filePath: `file-${index}.png`,
      size: content.length,
    }))
  );

  const packBytes = new Uint8Array(layout.totalSize);
  packBytes.set(layout.headerBytes, 0);
  layout.entries.forEach((entry, index) => {
    packBytes.set(contents[index], entry.offset);
  });

  return { packBytes, layout };
};

const makeContent = (size: number, seed: number): Uint8Array => {
  const content = new Uint8Array(size);
  for (let index = 0; index < size; index++) {
    content[index] = (index * 7 + seed) % 256;
  }
  return content;
};

describe('PackFormat', () => {
  describe('getResourceMimeType', () => {
    it('recognises the resource kinds used by the engine', () => {
      expect(getResourceMimeType('player.png')).toBe('image/png');
      expect(getResourceMimeType('Player.PNG')).toBe('image/png');
      expect(getResourceMimeType('music.mp3')).toBe('audio/mpeg');
      expect(getResourceMimeType('jump.ogg')).toBe('audio/ogg');
      expect(getResourceMimeType('intro.mp4')).toBe('video/mp4');
      expect(getResourceMimeType('title.ttf')).toBe('font/ttf');
      expect(getResourceMimeType('level.json')).toBe('application/json');
      expect(getResourceMimeType('character.glb')).toBe('model/gltf-binary');
      expect(getResourceMimeType('hero.atlas')).toBe('text/plain');
    });

    it('falls back to a generic type for unknown or missing extensions', () => {
      expect(getResourceMimeType('some-file.unknown')).toBe(
        'application/octet-stream'
      );
      expect(getResourceMimeType('no-extension')).toBe(
        'application/octet-stream'
      );
    });

    it('ignores a query string left over from a URL', () => {
      expect(getResourceMimeType('player.png?token=abc')).toBe('image/png');
    });
  });

  describe('buildPackLayout', () => {
    it('writes a readable header', () => {
      const layout = buildPackLayout([{ filePath: 'a.png', size: 10 }]);
      const { version, entries } = parsePackIndex(layout.headerBytes);

      expect(version).toBe(PACK_VERSION);
      expect(entries).toHaveLength(1);
      expect(entries[0]).toEqual({
        path: 'a.png',
        offset: layout.entries[0].offset,
        size: 10,
        type: 'image/png',
      });
    });

    it('aligns the contents and the header', () => {
      const layout = buildPackLayout([
        { filePath: 'a.png', size: 1 },
        { filePath: 'b.png', size: 17 },
        { filePath: 'c.png', size: 32 },
      ]);

      expect(layout.headerBytes.length % PACK_ALIGNMENT).toBe(0);
      expect(layout.totalSize % PACK_ALIGNMENT).toBe(0);
      layout.entries.forEach(entry => {
        expect(entry.offset % PACK_ALIGNMENT).toBe(0);
        expect(entry.offset).toBeGreaterThanOrEqual(layout.headerBytes.length);
      });
      // Contents must not overlap.
      expect(layout.entries[1].offset).toBeGreaterThanOrEqual(
        layout.entries[0].offset + layout.entries[0].size
      );
      expect(layout.entries[2].offset).toBeGreaterThanOrEqual(
        layout.entries[1].offset + layout.entries[1].size
      );
    });

    it('reports the padding needed after each content', () => {
      const layout = buildPackLayout([
        { filePath: 'a.png', size: 1 },
        { filePath: 'b.png', size: 16 },
      ]);

      expect(layout.paddings[0]).toBe(PACK_ALIGNMENT - 1);
      expect(layout.paddings[1]).toBe(0);
      // Everything written must add up to the announced total size.
      const writtenSize =
        layout.headerBytes.length +
        layout.entries.reduce(
          (total, entry, index) => total + entry.size + layout.paddings[index],
          0
        );
      expect(writtenSize).toBe(layout.totalSize);
    });

    it('handles an empty pack', () => {
      const layout = buildPackLayout([]);

      expect(layout.entries).toHaveLength(0);
      expect(layout.totalSize).toBe(layout.headerBytes.length);
      expect(parsePackIndex(layout.headerBytes).entries).toHaveLength(0);
    });

    it('keeps the index consistent with the offsets for a large pack', () => {
      // Enough files that the index is long enough for the offsets to gain
      // digits while the layout is being computed.
      const layout = buildPackLayout(
        Array.from({ length: 2000 }, (_, index) => ({
          filePath: `some/rather/long/resource/name-${index}.png`,
          size: 1000 + index,
        }))
      );

      const { entries } = parsePackIndex(layout.headerBytes);
      expect(entries).toHaveLength(2000);
      entries.forEach((entry, index) => {
        expect(entry.offset).toBe(layout.entries[index].offset);
        expect(entry.offset).toBeGreaterThanOrEqual(layout.headerBytes.length);
      });
    });

    it('supports non-ASCII file names', () => {
      const layout = buildPackLayout([
        { filePath: 'héros-épée.png', size: 4 },
        { filePath: '主人公.png', size: 4 },
      ]);

      const { entries } = parsePackIndex(layout.headerBytes);
      expect(entries.map(entry => entry.path)).toEqual([
        'héros-épée.png',
        '主人公.png',
      ]);
      expect(entries[0].offset).toBe(layout.entries[0].offset);
      expect(entries[1].offset).toBe(layout.entries[1].offset);
    });
  });

  describe('round trip', () => {
    it('reads back exactly what was written', () => {
      const contents = [
        makeContent(1, 1),
        makeContent(0, 2),
        makeContent(1000, 3),
        makeContent(16, 4),
      ];
      const { packBytes, layout } = assemblePack(contents);

      expect(packBytes.length).toBe(layout.totalSize);

      const { entries } = parsePackIndex(packBytes);
      entries.forEach((entry, index) => {
        const readContent = packBytes.slice(
          entry.offset,
          entry.offset + entry.size
        );
        expect(Array.from(readContent)).toEqual(Array.from(contents[index]));
      });
    });
  });

  describe('parsePackIndex', () => {
    it('rejects a file that is not a pack', () => {
      const notAPack = new Uint8Array(64);
      expect(() => parsePackIndex(notAPack)).toThrow(/Not a resource pack/);
    });
  });
});
