// @flow
import {
  decodePercentEncodedFileName,
  encodeLocalFileNameForUrl,
} from './PercentEncodedFileName';

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

describe('encodeLocalFileNameForUrl', () => {
  it('encodes the characters with a special meaning in a URL', () => {
    expect(encodeLocalFileNameForUrl('Track #3.wav')).toBe('Track %233.wav');
    expect(encodeLocalFileNameForUrl('100%.png')).toBe('100%25.png');
    expect(encodeLocalFileNameForUrl('what?.png')).toBe('what%3F.png');
    expect(encodeLocalFileNameForUrl('/Users/me/Sounds #1/100%.wav')).toBe(
      '/Users/me/Sounds %231/100%25.wav'
    );
  });

  it('leaves other characters untouched', () => {
    expect(encodeLocalFileNameForUrl('Green Button.png')).toBe(
      'Green Button.png'
    );
    expect(encodeLocalFileNameForUrl('C:/Games/éléphant (2).png')).toBe(
      'C:/Games/éléphant (2).png'
    );
  });

  it('leaves URLs untouched', () => {
    expect(
      encodeLocalFileNameForUrl(
        'https://project-resources.gdevelop.io/project/a%23b.png?token=1'
      )
    ).toBe('https://project-resources.gdevelop.io/project/a%23b.png?token=1');
    expect(encodeLocalFileNameForUrl('data:image/png;base64,#%?')).toBe(
      'data:image/png;base64,#%?'
    );
  });
});
