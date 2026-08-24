// @flow
import { decodePercentEncodedFileName } from './PercentEncodedFileName';

describe('decodePercentEncodedFileName', () => {
  it('decodes percent-encoded characters', () => {
    expect(decodePercentEncodedFileName('Green%20Button_Hovered.png')).toBe(
      'Green Button_Hovered.png'
    );
    expect(decodePercentEncodedFileName('%C3%A9l%C3%A9phant.png')).toBe(
      'éléphant.png'
    );
    expect(decodePercentEncodedFileName('a%2Bb.png')).toBe('a+b.png');
  });

  it('keeps names without percent-encoded characters untouched', () => {
    expect(decodePercentEncodedFileName('player.png')).toBe('player.png');
    expect(decodePercentEncodedFileName('Green Button.png')).toBe(
      'Green Button.png'
    );
  });

  it('keeps names with invalid percent sequences untouched', () => {
    expect(decodePercentEncodedFileName('100%.png')).toBe('100%.png');
  });

  it('keeps names which would decode to unsafe characters untouched', () => {
    expect(decodePercentEncodedFileName('a%2Fb.png')).toBe('a%2Fb.png'); // "/"
    expect(decodePercentEncodedFileName('a%3Fb.png')).toBe('a%3Fb.png'); // "?"
    expect(decodePercentEncodedFileName('a%23b.png')).toBe('a%23b.png'); // "#"
    expect(decodePercentEncodedFileName('a%25b.png')).toBe('a%25b.png'); // "%"
    expect(decodePercentEncodedFileName('a%3Ab.png')).toBe('a%3Ab.png'); // ":"
  });
});
