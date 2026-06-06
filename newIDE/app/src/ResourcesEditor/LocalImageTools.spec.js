// @flow
import {
  drawLocalImageOperationToCanvas,
  getExpandedCanvasGeometry,
  getLocalImageOutputBaseName,
  isValidLocalImageCrop,
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
  });

  it('draws crop and expansion operations to a canvas', () => {
    const context = {
      clearRect: jest.fn(),
      drawImage: jest.fn(),
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
    context.drawImage.mockClear();

    drawLocalImageOperationToCanvas({
      canvas,
      image,
      sourceSize,
      operation: 'expand-canvas',
      crop: { x: 0, y: 0, width: 10, height: 10 },
      expandDirection: 'left',
      expandAmount: 16,
    });

    expect(canvas.width).toBe(116);
    expect(canvas.height).toBe(80);
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 116, 80);
    expect(context.drawImage).toHaveBeenCalledWith(image, 16, 0);
  });
});
