// @ts-check

describe('PIXI.TextMetrics.graphemeSegmenter', function () {
  it('splits texts in graphemes like Intl.Segmenter does', function () {
    // Not yet in the TypeScript types used by the project.
    const segmenter = new /** @type {any} */ (Intl).Segmenter();
    for (const text of [
      '',
      'Score: 1234',
      ' ~!"#$%&\'()*+,-./0123456789:;<=>?@[\\]^_`{|}',
      'Line\r\nbreak\nand\ttab',
      'Accentué',
      'Pontuação: déjà vu ¿Qué? Straße ½ © ÿ ­',
      'é combining mark',
      '👍🏽 emoji 👨‍👩‍👧',
      '日本語のテキスト',
    ]) {
      expect(PIXI.TextMetrics.graphemeSegmenter(text)).to.eql(
        [...segmenter.segment(text)].map((segment) => segment.segment)
      );
    }
  });
});
