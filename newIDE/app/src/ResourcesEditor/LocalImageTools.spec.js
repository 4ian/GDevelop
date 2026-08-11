// @flow
import {
  drawLocalImageOperationToCanvas,
  drawLocalImageSplitTileToCanvas,
  getExpandedCanvasGeometry,
  getLocalImageOutputBaseName,
  getLocalImageSplitFileName,
  getLocalImageSplitOutputFolderName,
  getLocalImageSplitTiles,
  isValidLocalImageCrop,
  isValidLocalImageSplit,
  normalizeLocalImageCrop,
  shouldDisableLocalImageApplyButton,
} from './LocalImageTools';

describe('LocalImageTools', () => {
  const imageAttachment = {
    absolutePath: 'D:\\Project\\assets\\coin.png',
    name: 'coin.png',
    extension: '.png',
  };
  const sourceSize = { width: 100, height: 80 };

  it('clamps crop rectangles to the source image bounds', () => {
    expect(
      normalizeLocalImageCrop({
        sourceSize,
        crop: { x: -10, y: 70, width: 30, height: 20 },
      })
    ).toEqual({ x: 0, y: 70, width: 20, height: 10 });
  });

  it('detects invalid crop rectangles after clamping', () => {
    expect(
      isValidLocalImageCrop(
        normalizeLocalImageCrop({
          sourceSize,
          crop: { x: 100, y: 20, width: 20, height: 20 },
        })
      )
    ).toBe(false);
  });

  it('computes expanded canvas geometry for every direction', () => {
    expect(
      getExpandedCanvasGeometry({
        sourceSize,
        direction: 'left',
        amount: 16,
      })
    ).toEqual({ width: 116, height: 80, sourceX: 16, sourceY: 0 });
    expect(
      getExpandedCanvasGeometry({
        sourceSize,
        direction: 'right',
        amount: 16,
      })
    ).toEqual({ width: 116, height: 80, sourceX: 0, sourceY: 0 });
    expect(
      getExpandedCanvasGeometry({
        sourceSize,
        direction: 'top',
        amount: 16,
      })
    ).toEqual({ width: 100, height: 96, sourceX: 0, sourceY: 16 });
    expect(
      getExpandedCanvasGeometry({
        sourceSize,
        direction: 'bottom',
        amount: 16,
      })
    ).toEqual({ width: 100, height: 96, sourceX: 0, sourceY: 0 });
  });

  it('builds output base names from the source image and operation', () => {
    expect(
      getLocalImageOutputBaseName({
        sourceName: 'coin.png',
        operation: 'crop',
      })
    ).toBe('coin-crop');
    expect(
      getLocalImageOutputBaseName({
        sourceName: 'coin.png',
        operation: 'expand-canvas',
        expandDirection: 'right',
      })
    ).toBe('coin-expand-right');
    expect(
      getLocalImageOutputBaseName({
        sourceName: 'coin.png',
        operation: 'split-spritesheet',
      })
    ).toBe('coin');
  });

  it('builds row-major spritesheet tiles that cover the whole image', () => {
    expect(
      getLocalImageSplitTiles({
        sourceSize: { width: 101, height: 81 },
        rows: 2,
        columns: 2,
      })
    ).toEqual([
      { x: 0, y: 0, width: 50, height: 40 },
      { x: 50, y: 0, width: 51, height: 40 },
      { x: 0, y: 40, width: 50, height: 41 },
      { x: 50, y: 40, width: 51, height: 41 },
    ]);
  });

  it('limits spritesheet splits to the 001 through 999 file range', () => {
    expect(isValidLocalImageSplit({ sourceSize, rows: 27, columns: 37 })).toBe(
      true
    );
    expect(isValidLocalImageSplit({ sourceSize, rows: 25, columns: 40 })).toBe(
      false
    );
    expect(isValidLocalImageSplit({ sourceSize, rows: 81, columns: 1 })).toBe(
      false
    );
    expect(getLocalImageSplitFileName(1)).toBe('001.png');
    expect(getLocalImageSplitFileName(999)).toBe('999.png');
    expect(() => getLocalImageSplitFileName(0)).toThrow(
      'Spritesheet image number must be between 1 and 999.'
    );
  });

  it('uses the raw source image name as the split output folder', () => {
    expect(getLocalImageSplitOutputFolderName('hero.walk.png')).toBe(
      'hero.walk'
    );
    expect(getLocalImageSplitOutputFolderName('../unsafe.png')).toBe('unsafe');
    expect(getLocalImageSplitOutputFolderName('..png')).toBe('image');
  });

  it('disables apply until inputs are usable', () => {
    expect(
      shouldDisableLocalImageApplyButton({
        imageAttachment: null,
        isProcessing: false,
        sourceSize,
        operation: 'crop',
        crop: { x: 0, y: 0, width: 10, height: 10 },
        expandAmount: 16,
      })
    ).toBe(true);
    expect(
      shouldDisableLocalImageApplyButton({
        imageAttachment,
        isProcessing: false,
        sourceSize: null,
        operation: 'crop',
        crop: { x: 0, y: 0, width: 10, height: 10 },
        expandAmount: 16,
      })
    ).toBe(true);
    expect(
      shouldDisableLocalImageApplyButton({
        imageAttachment,
        isProcessing: false,
        sourceSize,
        operation: 'crop',
        crop: { x: 100, y: 0, width: 10, height: 10 },
        expandAmount: 16,
      })
    ).toBe(true);
    expect(
      shouldDisableLocalImageApplyButton({
        imageAttachment,
        isProcessing: false,
        sourceSize,
        operation: 'expand-canvas',
        crop: { x: 0, y: 0, width: 10, height: 10 },
        expandAmount: 0,
      })
    ).toBe(true);
    expect(
      shouldDisableLocalImageApplyButton({
        imageAttachment,
        isProcessing: false,
        sourceSize,
        operation: 'expand-canvas',
        crop: { x: 0, y: 0, width: 10, height: 10 },
        expandAmount: 16,
      })
    ).toBe(false);
    expect(
      shouldDisableLocalImageApplyButton({
        imageAttachment,
        isProcessing: false,
        sourceSize,
        operation: 'split-spritesheet',
        crop: { x: 0, y: 0, width: 10, height: 10 },
        expandAmount: 16,
        splitRows: 27,
        splitColumns: 37,
      })
    ).toBe(false);
    expect(
      shouldDisableLocalImageApplyButton({
        imageAttachment,
        isProcessing: false,
        sourceSize,
        operation: 'split-spritesheet',
        crop: { x: 0, y: 0, width: 10, height: 10 },
        expandAmount: 16,
        splitRows: 25,
        splitColumns: 40,
      })
    ).toBe(true);
  });

  it('draws crop and expansion operations to a canvas', () => {
    const context: any = {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      drawImage: jest.fn(),
      fillStyle: '',
    };
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => context,
    };
    const image = { id: 'image' };

    drawLocalImageOperationToCanvas({
      canvas,
      image,
      sourceSize,
      operation: 'crop',
      crop: { x: -10, y: 70, width: 30, height: 20 },
      expandDirection: 'right',
      expandAmount: 16,
    });

    expect(canvas.width).toBe(20);
    expect(canvas.height).toBe(10);
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 20, 10);
    expect(context.drawImage).toHaveBeenCalledWith(
      image,
      0,
      70,
      20,
      10,
      0,
      0,
      20,
      10
    );

    context.clearRect.mockClear();
    context.fillRect.mockClear();
    context.drawImage.mockClear();

    drawLocalImageOperationToCanvas({
      canvas,
      image,
      sourceSize,
      operation: 'expand-canvas',
      crop: { x: 0, y: 0, width: 10, height: 10 },
      expandDirection: 'left',
      expandAmount: 16,
      expandFill: {
        color: '10;20;30',
        alpha: 0.5,
      },
    });

    expect(canvas.width).toBe(116);
    expect(canvas.height).toBe(80);
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 116, 80);
    expect(context.fillStyle).toBe('rgba(10, 20, 30, 0.5)');
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 116, 80);
    expect(context.drawImage).toHaveBeenCalledWith(image, 16, 0);
  });

  it('draws one spritesheet tile to a canvas', () => {
    const context: any = {
      clearRect: jest.fn(),
      drawImage: jest.fn(),
    };
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => context,
    };
    const image = { id: 'image' };

    drawLocalImageSplitTileToCanvas({
      canvas,
      image,
      tile: { x: 25, y: 40, width: 25, height: 40 },
    });

    expect(canvas.width).toBe(25);
    expect(canvas.height).toBe(40);
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 25, 40);
    expect(context.drawImage).toHaveBeenCalledWith(
      image,
      25,
      40,
      25,
      40,
      0,
      0,
      25,
      40
    );
  });
});
