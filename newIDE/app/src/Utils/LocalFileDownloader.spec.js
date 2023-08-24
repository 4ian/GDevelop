// @flow

import { sanitizeUrlWithEncodedPath } from './LocalFileDownloader';

describe('LocalFileDownloader', () => {
  describe('sanitizeUrlWith', () => {
    test('sanitize filenames', () => {
      expect(
        sanitizeUrlWithEncodedPath(
          'https://project-resources.gdevelop.io/1234-56a1-4cf9-8e84-123456789/resources/123456789-ROOM1.jpg'
        )
      ).toBe(
        'https://project-resources.gdevelop.io/1234-56a1-4cf9-8e84-123456789/resources/123456789-ROOM1.jpg'
      );
      expect(
        sanitizeUrlWithEncodedPath(
          'https://project-resources.gdevelop.io/1234-56a1-4cf9-8e84-123456789/resources/123456789-testé.jpg'
        )
      ).toBe(
        'https://project-resources.gdevelop.io/1234-56a1-4cf9-8e84-123456789/resources/123456789-test%C3%A9.jpg'
      );
      expect(
        sanitizeUrlWithEncodedPath(
          'https://project-resources.gdevelop.io/1234-56a1-4cf9-8e84-123456789/resources/123456789-testé 汉字.jpg'
        )
      ).toBe(
        'https://project-resources.gdevelop.io/1234-56a1-4cf9-8e84-123456789/resources/123456789-test%C3%A9%20%E6%B1%89%E5%AD%97.jpg'
      );
      expect(
        sanitizeUrlWithEncodedPath(
          'https://project-resources.gdevelop.io/1234-56a1-4cf9-8e84-123456789/resources/123456789-testé 👋.jpg'
        )
      ).toBe(
        'https://project-resources.gdevelop.io/1234-56a1-4cf9-8e84-123456789/resources/123456789-test%C3%A9%20%F0%9F%91%8B.jpg'
      );
      expect(
        sanitizeUrlWithEncodedPath(
          'https://project-resources.gdevelop.io/1234-56a1-4cf9-8e84-123456789/resources/123456789-testé 👋.jpg?token=abc'
        )
      ).toBe(
        'https://project-resources.gdevelop.io/1234-56a1-4cf9-8e84-123456789/resources/123456789-test%C3%A9%20%F0%9F%91%8B.jpg%3Ftoken%3Dabc'
      );
    });
  });
});
