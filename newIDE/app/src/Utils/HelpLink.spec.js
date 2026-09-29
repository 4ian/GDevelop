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
    it('keeps an anchor contained in the path after the query string', () => {
      expect(getHelpLink('/behaviors/tween#easing-functions')).toBe(
        'https://wiki.gdevelop.io/gdevelop5/behaviors/tween?utm_source=gdevelop&utm_medium=help-link#easing-functions'
      );
      // An explicit anchor takes precedence.
      expect(getHelpLink('/behaviors/tween#easing-functions', 'other')).toBe(
        'https://wiki.gdevelop.io/gdevelop5/behaviors/tween?utm_source=gdevelop&utm_medium=help-link#other'
      );
    });

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
