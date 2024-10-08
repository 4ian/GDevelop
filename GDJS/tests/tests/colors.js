describe('gdjs', function () {
  it('should define gdjs', function () {
    expect(gdjs).to.be.ok();
  });

  describe('Color conversion', function () {
    describe('Hex strings to RGB components', () => {
      it('should convert hex strings', function () {
        expect(gdjs.hexToRGBColor('#FFFFfF')).to.eql([255, 255, 255]);
        expect(gdjs.hexToRGBColor('#000000')).to.eql([0, 0, 0]);
        expect(gdjs.hexToRGBColor('#1245F5')).to.eql([18, 69, 245]);
      });
      it('should convert hex strings without hashtag', function () {
        expect(gdjs.hexToRGBColor('FFFFfF')).to.eql([255, 255, 255]);
        expect(gdjs.hexToRGBColor('000000')).to.eql([0, 0, 0]);
        expect(gdjs.hexToRGBColor('1245F5')).to.eql([18, 69, 245]);
      });
      it('should convert shorthand hex strings', function () {
        expect(gdjs.shorthandHexToRGBColor('#FfF')).to.eql([255, 255, 255]);
        expect(gdjs.shorthandHexToRGBColor('#000')).to.eql([0, 0, 0]);
        expect(gdjs.shorthandHexToRGBColor('#F3a')).to.eql([255, 51, 170]);
      });
      it('should convert shorthand hex strings without hashtag', function () {
        expect(gdjs.shorthandHexToRGBColor('FFF')).to.eql([255, 255, 255]);
        expect(gdjs.shorthandHexToRGBColor('000')).to.eql([0, 0, 0]);
        expect(gdjs.shorthandHexToRGBColor('F3a')).to.eql([255, 51, 170]);
      });
    });
    describe('RGB strings to RGB components', () => {
      it('should convert rgb strings', function () {
        expect(gdjs.rgbOrHexToRGBColor('0;0;0')).to.eql([0, 0, 0]);
        expect(gdjs.rgbOrHexToRGBColor('255;255;255')).to.eql([255, 255, 255]);
        expect(gdjs.rgbOrHexToRGBColor('120;12;6')).to.eql([120, 12, 6]);
      });
      it('should max rgb values', function () {
        expect(gdjs.rgbOrHexToRGBColor('255;255;300')).to.eql([255, 255, 255]);
        expect(gdjs.rgbOrHexToRGBColor('999;12;6')).to.eql([255, 12, 6]);
      });
      it('should cut rgb values if string too long', function () {
        expect(gdjs.rgbOrHexToRGBColor('255;255;200456')).to.eql([
          255,
          255,
          200,
        ]);
      });
      it('should return components for black if unrecognized input', function () {
        expect(gdjs.rgbOrHexToRGBColor('NaN')).to.eql([0, 0, 0]);
        expect(gdjs.rgbOrHexToRGBColor('19819830803')).to.eql([0, 0, 0]);
        expect(gdjs.rgbOrHexToRGBColor('Infinity')).to.eql([0, 0, 0]);
        expect(gdjs.rgbOrHexToRGBColor('-4564')).to.eql([0, 0, 0]);
        expect(gdjs.rgbOrHexToRGBColor('9999;12;6')).to.eql([0, 0, 0]);
      });
    });
  });
});
