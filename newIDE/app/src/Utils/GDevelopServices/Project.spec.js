// @flow
import {
  extractFilenameFromProjectResourceUrl,
  extractProjectUuidFromProjetResourceUrl,
} from './Project';

describe('Project service', () => {
  describe('extractFilenameFromProjectResourceUrl', () => {
    it('extracts filename from a gdevelop.io bucket URL', () => {
      expect(
        extractFilenameFromProjectResourceUrl(
          'https://project-resources.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/resources/6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy'
        )
      ).toBe('Pea-Happy');
      expect(
        extractFilenameFromProjectResourceUrl(
          'https://project-resources.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/resources/6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy.png'
        )
      ).toBe('Pea-Happy.png');
      expect(
        extractFilenameFromProjectResourceUrl(
          'https://project-resources.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/resources/6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy?some=parameter'
        )
      ).toBe('Pea-Happy');
      expect(
        extractFilenameFromProjectResourceUrl(
          'https://project-resources.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/resources/6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy.png?some=parameter'
        )
      ).toBe('Pea-Happy.png');
    });
    it('extracts filename from a gdevelop.io bucket URL, and handles sub folders', () => {
      expect(
        extractFilenameFromProjectResourceUrl(
          'https://project-resources.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/resources/some/other-folder/1/2/_/6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy'
        )
      ).toBe('Pea-Happy');
      expect(
        extractFilenameFromProjectResourceUrl(
          'https://project-resources.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/resources/some/other-folder/1/2/_/6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy.png'
        )
      ).toBe('Pea-Happy.png');
      expect(
        extractFilenameFromProjectResourceUrl(
          'https://project-resources.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/resources/some/other-folder/1/2/_/6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy?some=parameter'
        )
      ).toBe('Pea-Happy');
      expect(
        extractFilenameFromProjectResourceUrl(
          'https://project-resources.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/resources/some/other-folder/1/2/_/6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy.png?some=parameter'
        )
      ).toBe('Pea-Happy.png');
    });
    it('just extracts the filename from an URL which is not from GDevelop Cloud (or not valid)', () => {
      expect(
        extractFilenameFromProjectResourceUrl('example.com/test.png')
      ).toBe('test.png');
      expect(extractFilenameFromProjectResourceUrl('example.com/test')).toBe(
        'test'
      );

      // In case the resources buckets are used, but the URL is not valid,
      // we can't extract the filename without the hash. So we take everything.
      expect(
        extractFilenameFromProjectResourceUrl(
          'https://project-resources.gdevelop.io/whatever/some/other-folder/1/2/_/6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy.png'
        )
      ).toBe(
        '6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy.png'
      );
      expect(
        extractFilenameFromProjectResourceUrl(
          'https://project-resources.gdevelop.io/whatever/some/other-folder/1/2/_/6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy.png?some=parameter'
        )
      ).toBe(
        '6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy.png?some=parameter'
      );
    });
    it('returns the name given if its not a URL', () => {
      expect(extractFilenameFromProjectResourceUrl('test.png')).toBe(
        'test.png'
      );
      expect(extractFilenameFromProjectResourceUrl('test.png?what')).toBe(
        'test.png?what'
      );
    });
  });
  describe('getProjectUuidFromProjetResourceUrl', () => {
    it('gives the project UUID from an URL', () => {
      expect(
        extractProjectUuidFromProjetResourceUrl(
          'https://project-resources.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/resources/6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy.png?some=parameter'
        )
      ).toBe('a9fe5bce-de39-4147-a669-93fc5cd69632');
      expect(
        extractProjectUuidFromProjetResourceUrl(
          'https://project-resources.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy.png?some=parameter'
        )
      ).toBe(null);
      expect(
        extractProjectUuidFromProjetResourceUrl('https://example.com')
      ).toBe(null);
      expect(extractProjectUuidFromProjetResourceUrl('example')).toBe(null);
    });
  });
});
