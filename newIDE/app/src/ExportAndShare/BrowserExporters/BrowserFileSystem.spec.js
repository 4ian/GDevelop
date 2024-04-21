// @flow
import BrowserFileSystem from './BrowserFileSystem';

describe('BrowserFileSystem', () => {
  describe('file content storing and reading', () => {
    test('it can read text files originally passed as argument', () => {
      const browserFileSystem = new BrowserFileSystem({
        textFiles: [
          {
            filePath: '/file1',
            text: 'content1',
          },
        ],
      });

      expect(browserFileSystem.readFile('/file1')).toBe('content1');
    });

    test('it can write files in memory and read them', () => {
      const browserFileSystem = new BrowserFileSystem({ textFiles: [] });

      browserFileSystem.writeToFile('/file1', 'content1');
      browserFileSystem.writeToFile('/folder/file2', 'content2');
      expect(browserFileSystem.readFile('/file1')).toBe('content1');
      expect(browserFileSystem.readFile('/folder/file2')).toBe('content2');
    });

    test('it can store text files and retrieve them', () => {
      const browserFileSystem = new BrowserFileSystem({ textFiles: [] });

      browserFileSystem.writeToFile('/folder/file1', 'content1');
      browserFileSystem.writeToFile('/folder/file2', 'content2');

      const expectedTextFiles = [
        { filePath: '/folder/file1', text: 'content1' },
        { filePath: '/folder/file2', text: 'content2' },
      ];

      expect(browserFileSystem.getAllTextFilesIn('/')).toEqual(
        expectedTextFiles
      );
      expect(browserFileSystem.getAllTextFilesIn('/folder/')).toEqual(
        expectedTextFiles
      );
      expect(browserFileSystem.getAllTextFilesIn('/another-folder/')).toEqual(
        []
      );
    });

    test('it can write files in memory and clear them', () => {
      const browserFileSystem = new BrowserFileSystem({ textFiles: [] });

      browserFileSystem.writeToFile('/folder/file1', 'content1');
      browserFileSystem.writeToFile('/another-folder/file2', 'content2');

      const expectedTextFiles = [
        { filePath: '/another-folder/file2', text: 'content2' },
      ];

      browserFileSystem.clearDir('/folder/');
      expect(browserFileSystem.getAllTextFilesIn('/')).toEqual(
        expectedTextFiles
      );
      expect(browserFileSystem.getAllTextFilesIn('/another-folder/')).toEqual(
        expectedTextFiles
      );
      expect(browserFileSystem.getAllTextFilesIn('/folder/')).toEqual([]);
    });

    test('it can copy files previously wrote in memory', () => {
      const browserFileSystem = new BrowserFileSystem({ textFiles: [] });

      browserFileSystem.writeToFile('/file1', 'content1');
      browserFileSystem.copyFile('/file1', '/copied-file1');
      expect(browserFileSystem.readFile('/file1')).toBe('content1');
      expect(browserFileSystem.readFile('/copied-file1')).toBe('content1');
    });

    test('it can mark files to be copied from an URL as to be downloaded', () => {
      const browserFileSystem = new BrowserFileSystem({ textFiles: [] });

      browserFileSystem.copyFile(
        'http://file.com/from/url',
        '/folder/downloaded-file'
      );
      expect(browserFileSystem.getAllUrlFilesIn('/')).toEqual([
        {
          filePath: '/folder/downloaded-file',
          url: 'http://file.com/from/url',
        },
      ]);
      expect(browserFileSystem.getAllUrlFilesIn('/folder/')).toEqual([
        {
          filePath: '/folder/downloaded-file',
          url: 'http://file.com/from/url',
        },
      ]);
      expect(browserFileSystem.getAllUrlFilesIn('/another-folder/')).toEqual(
        []
      );
    });
    test('it can tell if a file exists', () => {
      const browserFileSystem = new BrowserFileSystem({
        textFiles: [
          {
            filePath: '/file1',
            text: 'content1',
          },
        ],
      });

      expect(browserFileSystem.fileExists('/file1')).toBe(true);
      expect(browserFileSystem.fileExists('/folder/downloaded-file')).toBe(
        false
      );

      browserFileSystem.copyFile(
        'http://file.com/from/url',
        '/folder/downloaded-file'
      );

      expect(browserFileSystem.fileExists('/file1')).toBe(true);
      expect(browserFileSystem.fileExists('/folder/downloaded-file')).toBe(
        true
      );

      browserFileSystem.writeToFile('/another-folder/file2', 'content2');

      expect(browserFileSystem.fileExists('/file1')).toBe(true);
      expect(browserFileSystem.fileExists('/another-folder/file2')).toBe(true);
      expect(browserFileSystem.fileExists('/folder/downloaded-file')).toBe(
        true
      );

      // Paths should be normalized:
      expect(browserFileSystem.fileExists('///file1')).toBe(true);
      expect(browserFileSystem.fileExists('/folder///downloaded-file')).toBe(
        true
      );
    });
  });

  describe('file path manipulation', () => {
    test('it can make a path relative to another', () => {
      const browserFileSystem = new BrowserFileSystem({ textFiles: [] });

      expect(browserFileSystem.makeRelative('/folder/file1', '/folder')).toBe(
        'file1'
      );
      expect(browserFileSystem.makeRelative('/folder/file1', '/')).toBe(
        'folder/file1'
      );
    });
    test('it can make URL relative to another one if on the same domain', () => {
      const browserFileSystem = new BrowserFileSystem({ textFiles: [] });

      expect(
        browserFileSystem.makeRelative(
          'http://test.com/path/to/file1',
          'http://test.com/path/'
        )
      ).toBe('to/file1');
    });
    test('it does not make URL relative to another one if not on the same domain', () => {
      const browserFileSystem = new BrowserFileSystem({ textFiles: [] });

      expect(
        browserFileSystem.makeRelative(
          'http://test.com/url1',
          'http://test2.com/url1'
        )
      ).toBe('http://test.com/url1');
    });
    test('it can make a path absolute', () => {
      const browserFileSystem = new BrowserFileSystem({ textFiles: [] });

      expect(browserFileSystem.makeAbsolute('subfolder/file1', '/folder')).toBe(
        '/folder/subfolder/file1'
      );
      expect(browserFileSystem.makeAbsolute('/folder/file2', '/')).toBe(
        '/folder/file2'
      );
    });
  });
});
