// @flow
import {
  isRelativePathToDocumentationRoot,
  isDocumentationAbsoluteUrl,
  getHelpLink,
} from './HelpLink';

describe('HelpLink', () => {
  describe('isRelativePathToDocumentationRoot', () => {
    it('returns true for paths starting with /', () => {
      expect(isRelativePathToDocumentationRoot('/test')).toBe(true);
      expect(isRelativePathToDocumentationRoot('/all-features/audio')).toBe(
        true
      );
    });

    it('returns false for absolute URLs', () => {
      expect(isRelativePathToDocumentationRoot('https://example.com')).toBe(
        false
      );
      expect(isRelativePathToDocumentationRoot('http://example.com')).toBe(
        false
      );
    });

    it('returns false for empty string', () => {
      expect(isRelativePathToDocumentationRoot('')).toBe(false);
    });
  });

  describe('isDocumentationAbsoluteUrl', () => {
    it('returns true for https URLs', () => {
      expect(isDocumentationAbsoluteUrl('https://example.com/help')).toBe(true);
      expect(isDocumentationAbsoluteUrl('https://wiki.gdevelop.io')).toBe(true);
    });

    it('returns true for http URLs', () => {
      expect(isDocumentationAbsoluteUrl('http://example.com/help')).toBe(true);
    });

    it('returns false for relative paths', () => {
      expect(isDocumentationAbsoluteUrl('/test')).toBe(false);
      expect(isDocumentationAbsoluteUrl('/all-features/audio')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isDocumentationAbsoluteUrl('')).toBe(false);
    });
  });

  describe('getHelpLink', () => {
    it('returns wiki link for relative paths', () => {
      expect(getHelpLink('/test')).toBe(
        'https://wiki.gdevelop.io/gdevelop5/test?utm_source=gdevelop&utm_medium=help-link'
      );
    });

    it('returns wiki link with anchor for relative paths', () => {
      expect(getHelpLink('/test', 'section1')).toBe(
        'https://wiki.gdevelop.io/gdevelop5/test?utm_source=gdevelop&utm_medium=help-link#section1'
      );
    });

    it('returns the absolute URL as-is', () => {
      expect(getHelpLink('https://example.com/custom-help')).toBe(
        'https://example.com/custom-help'
      );
    });

    it('returns empty string for invalid paths', () => {
      expect(getHelpLink('')).toBe('');
      expect(getHelpLink('invalid')).toBe('');
    });
  });
});

