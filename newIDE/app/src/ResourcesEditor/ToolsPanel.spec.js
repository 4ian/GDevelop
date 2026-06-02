// @flow
import {
  buildNanoBananaRequestParts,
  createImageAttachmentFromFilePath,
  createImageAttachmentFromProjectFileDragData,
  getImageAttachmentErrorMessage,
  getImageAttachmentPreviewUrl,
  hasProjectFileDragData,
  shouldShowClearImageAttachmentButton,
  shouldDisableNanoBananaButton,
} from './ToolsPanel';

describe('ToolsPanel', () => {
  it('normalizes an attached image selected from the image tool picker', () => {
    expect(
      createImageAttachmentFromFilePath(
        'D:\\GDevelop projects\\Game\\assets\\Coin.PNG'
      )
    ).toEqual({
      absolutePath: 'D:\\GDevelop projects\\Game\\assets\\Coin.PNG',
      name: 'Coin.PNG',
      extension: '.png',
    });
  });

  it('normalizes an attached image dragged from project files', () => {
    expect(
      createImageAttachmentFromProjectFileDragData(
        JSON.stringify({
          type: 'file',
          absolutePath: 'D:\\Project\\assets\\coin.png',
        })
      )
    ).toEqual({
      absolutePath: 'D:\\Project\\assets\\coin.png',
      name: 'coin.png',
      extension: '.png',
    });
    expect(
      createImageAttachmentFromProjectFileDragData(
        JSON.stringify({
          type: 'file',
          absolutePath: 'D:\\Project\\assets\\coin.mp3',
        })
      )
    ).toBe(null);
  });

  it('detects project file drag data from dragover types without reading the payload', () => {
    expect(
      hasProjectFileDragData([
        'text/plain',
        'application/x-gdevelop-project-file',
      ])
    ).toBe(true);
    expect(
      hasProjectFileDragData({
        length: 2,
        0: 'text/plain',
        1: 'application/x-gdevelop-project-file',
      })
    ).toBe(true);
    expect(hasProjectFileDragData(['text/plain'])).toBe(false);
  });

  it('builds a browser-readable preview url for the attached image', () => {
    expect(
      getImageAttachmentPreviewUrl({
        absolutePath: 'D:\\Project\\assets\\coin.png',
        name: 'coin.png',
        extension: '.png',
      })
    ).toBe('file:///D:/Project/assets/coin.png');
    expect(getImageAttachmentPreviewUrl(null)).toBe(null);
  });

  it('shows the clear image action only when an image is attached', () => {
    expect(
      shouldShowClearImageAttachmentButton({
        absolutePath: 'D:\\Project\\assets\\coin.png',
        name: 'coin.png',
        extension: '.png',
      })
    ).toBe(true);
    expect(shouldShowClearImageAttachmentButton(null)).toBe(false);
  });

  it('does not show an unsupported image error when clearing an attachment', () => {
    expect(
      getImageAttachmentErrorMessage({
        imageAttachment: null,
        action: 'clear',
      })
    ).toBe(null);
    expect(
      getImageAttachmentErrorMessage({
        imageAttachment: null,
        action: 'select',
      })
    ).toBe('Choose a supported image file.');
  });

  it('builds Nano Banana request parts from the dedicated attached image', () => {
    expect(
      buildNanoBananaRequestParts({
        prompt: 'make this coin golden',
        imageMimeType: 'image/png',
        imageData: 'base64-image',
      })
    ).toEqual([
      { text: 'make this coin golden' },
      {
        inline_data: {
          mime_type: 'image/png',
          data: 'base64-image',
        },
      },
    ]);
  });

  it('builds Nano Banana request parts without an attached image', () => {
    expect(
      buildNanoBananaRequestParts({
        prompt: 'create a forest background',
      })
    ).toEqual([{ text: 'create a forest background' }]);
  });

  it('keeps the Nano Banana action enabled without an attached image', () => {
    expect(shouldDisableNanoBananaButton({ isGeneratingImage: false })).toBe(
      false
    );
  });
});
