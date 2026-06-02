// @flow
import {
  buildNanoBananaDebugDetails,
  buildNanoBananaProgressDebugDetails,
  buildNanoBananaRequestParts,
  buildResourcesToolsSettings,
  createImageAttachmentFromFilePath,
  createImageAttachmentFromProjectFileDragData,
  getImageAttachmentErrorMessage,
  getImageAttachmentPreviewUrl,
  getGeneratedImagesFolderPath,
  getResourcesToolsSettingsWithDefaults,
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

  it('saves Nano Banana output in the project generated folder', () => {
    expect(getGeneratedImagesFolderPath('D:\\Project')).toBe(
      'D:\\Project\\generated'
    );
  });

  it('builds Nano Banana HTTP debug details', () => {
    const debugDetails = buildNanoBananaDebugDetails({
      request: {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1/models/test:generateContent',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': 'secret-key',
        },
        body: {
          contents: [{ parts: [{ text: 'make it blue' }] }],
        },
      },
      response: {
        ok: true,
        status: 200,
        statusText: 'OK',
        body: {
          candidates: [{ content: { parts: [{ text: 'ok' }] } }],
        },
      },
      generatedImagePath: 'D:\\Project\\generated\\coin.png',
      generatedImageUrl: 'file:///D:/Project/generated/coin.png',
    });

    expect(debugDetails.requestText).toContain('POST ');
    expect(debugDetails.requestText).toContain('x-goog-api-key');
    expect(debugDetails.requestText).toContain('secret-key');
    expect(debugDetails.requestText).toContain('make it blue');
    expect(debugDetails.responseText).toContain('HTTP 200 OK');
    expect(debugDetails.responseText).toContain('candidates');
    expect(debugDetails.generatedImagePath).toBe(
      'D:\\Project\\generated\\coin.png'
    );
  });

  it('builds Nano Banana progress debug details before the response arrives', () => {
    const debugDetails = buildNanoBananaProgressDebugDetails({
      statusText: 'Preparing Nano Banana request...',
    });

    expect(debugDetails.statusText).toBe('Preparing Nano Banana request...');
    expect(debugDetails.requestText).toBe('Preparing HTTP request...');
    expect(debugDetails.responseText).toBe('Waiting for HTTP response...');
    expect(debugDetails.generatedImagePath).toBe(null);
  });

  it('keeps the Nano Banana action enabled without an attached image', () => {
    expect(shouldDisableNanoBananaButton({ isGeneratingImage: false })).toBe(
      false
    );
  });

  it('builds persisted editor settings from every user-editable Tools field', () => {
    expect(
      buildResourcesToolsSettings({
        activeToolCategory: 'sound',
        selectedImageTool: 'nano-banana',
        selectedSoundTool: 'elevenlabs',
        geminiApiKey: 'gemini-key',
        nanoBananaModel: 'gemini-image',
        nanoBananaPrompt: 'make a coin',
        imageAttachment: {
          absolutePath: 'D:\\Project\\assets\\coin.png',
          name: 'coin.png',
          extension: '.png',
        },
        elevenLabsApiKey: 'eleven-key',
        elevenLabsMode: 'text-to-speech',
        elevenLabsText: 'hello',
        elevenLabsVoiceId: 'voice',
        elevenLabsModel: 'speech-model',
        elevenLabsSoundModel: 'sound-model',
        elevenLabsOutputFormat: 'mp3_44100_128',
        elevenLabsDuration: '2.5',
      })
    ).toEqual({
      activeToolCategory: 'sound',
      selectedImageTool: 'nano-banana',
      selectedSoundTool: 'elevenlabs',
      geminiApiKey: 'gemini-key',
      nanoBananaModel: 'gemini-image',
      nanoBananaPrompt: 'make a coin',
      imageAttachmentPath: 'D:\\Project\\assets\\coin.png',
      elevenLabsApiKey: 'eleven-key',
      elevenLabsMode: 'text-to-speech',
      elevenLabsText: 'hello',
      elevenLabsVoiceId: 'voice',
      elevenLabsModel: 'speech-model',
      elevenLabsSoundModel: 'sound-model',
      elevenLabsOutputFormat: 'mp3_44100_128',
      elevenLabsDuration: '2.5',
    });
  });

  it('normalizes persisted Tools settings when older preferences are incomplete', () => {
    expect(
      getResourcesToolsSettingsWithDefaults({
        activeToolCategory: 'sound',
        geminiApiKey: 'saved-key',
        nanoBananaPrompt: 'saved prompt',
      })
    ).toMatchObject({
      activeToolCategory: 'sound',
      selectedImageTool: 'nano-banana',
      selectedSoundTool: 'elevenlabs',
      geminiApiKey: 'saved-key',
      nanoBananaPrompt: 'saved prompt',
      imageAttachmentPath: '',
      elevenLabsMode: 'sound-effect',
      elevenLabsVoiceId: 'JBFqnCBsd6RMkjVDRZzb',
    });
  });
});
