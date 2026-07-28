// @flow
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import Resource3DPreviewContext, {
  Resource3DPreviewProvider,
} from './Resource3DPreviewContext';
import {
  burstResource3DPreviewCache,
  getResource3DPreviewOrRequest,
  setCachedResource3DPreview,
  setResource3DPreviewRequester,
} from './Resource3DPreviewCache';
import Resource3DPreviewWorker from './Resource3DPreview.worker';

const waitForMicrotasks = () => new Promise(resolve => setTimeout(resolve, 0));
global.requestAnimationFrame = callback => setTimeout(callback, 0);

describe('Resource3DPreviewProvider', () => {
  beforeEach(() => {
    // The worker can't render: every preview is the fallback image.
    // $FlowFixMe[prop-missing]
    Resource3DPreviewWorker.mockImplementation(() => {
      // $FlowFixMe[unclear-type] - Mock worker for tests
      const worker: any = {
        onmessage: null,
        onerror: null,
        terminate: () => {},
        postMessage: (message: { type: string }) => {
          if (message.type !== 'INIT') return;
          setTimeout(() =>
            worker.onmessage({ data: { type: 'INIT', success: false } })
          );
        },
      };
      return worker;
    });
    // The models can't be fetched either.
    global.fetch = jest.fn(() => Promise.reject(new Error('No network')));
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
  });

  it('renders again the last rendered model after the cache is burst', async () => {
    let getResourcePreview = null;
    const Consumer = () => {
      getResourcePreview = React.useContext(Resource3DPreviewContext)
        .getResourcePreview;
      return null;
    };
    let testRenderer;
    await act(async () => {
      testRenderer = renderer.create(
        <Resource3DPreviewProvider>
          <Consumer />
        </Resource3DPreviewProvider>
      );
    });
    if (!getResourcePreview) throw new Error('No context value.');
    const requestPreview = getResourcePreview;

    let preview;
    await act(async () => {
      preview = await requestPreview('https://example.com/model.glb');
    });
    expect(preview).toBe('JsPlatform/Extensions/3d_model.svg');

    burstResource3DPreviewCache();
    let previewAfterBurst = null;
    await act(async () => {
      requestPreview('https://example.com/model.glb').then(
        dataUrl => (previewAfterBurst = dataUrl)
      );
      for (let i = 0; i < 10; i++) await waitForMicrotasks();
    });
    expect(previewAfterBurst).toBe('JsPlatform/Extensions/3d_model.svg');
    expect(
      global.fetch.mock.calls.filter(
        ([url]) => url === 'https://example.com/model.glb'
      )
    ).toHaveLength(2);

    act(() => testRenderer.unmount());
  });

  it('sends the textures kept in separate files to the worker, with the model', async () => {
    // A worker able to render, remembering what it was asked to render.
    // $FlowFixMe[unclear-type] - Messages sent to the mock worker.
    const renderMessages: Array<any> = [];
    const transferredBuffers: Array<ArrayBuffer> = [];
    // $FlowFixMe[prop-missing]
    Resource3DPreviewWorker.mockImplementation(() => {
      // $FlowFixMe[unclear-type] - Mock worker for tests
      const worker: any = {
        onmessage: null,
        onerror: null,
        terminate: () => {},
        postMessage: (message: any, transfer: Array<ArrayBuffer>) => {
          if (message.type === 'INIT') {
            setTimeout(() =>
              worker.onmessage({ data: { type: 'INIT', success: true } })
            );
            return;
          }
          renderMessages.push(message);
          transferredBuffers.push(...transfer);
          setTimeout(() =>
            worker.onmessage({
              data: {
                type: 'RENDER_COMPLETE',
                resourceUrl: message.resourceUrl,
                screenshot: 'blob:rendered-model',
              },
            })
          );
        },
      };
      return worker;
    });
    // Each file is served with its URL as content.
    global.fetch = jest.fn((url: string) =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () =>
          Promise.resolve(new TextEncoder().encode(url).buffer),
      })
    );

    let getResourcePreview = null;
    const Consumer = () => {
      getResourcePreview = React.useContext(Resource3DPreviewContext)
        .getResourcePreview;
      return null;
    };
    let testRenderer;
    await act(async () => {
      testRenderer = renderer.create(
        <Resource3DPreviewProvider>
          <Consumer />
        </Resource3DPreviewProvider>
      );
    });
    if (!getResourcePreview) throw new Error('No context value.');
    const requestPreview = getResourcePreview;

    let preview;
    await act(async () => {
      preview = await requestPreview('https://example.com/models/barrels.glb', {
        'Textures/barrel.png': 'https://example.com/textures/barrel.png',
        'Textures/planks.png': 'https://example.com/textures/planks.png',
      });
    });

    expect(preview).toBe('blob:rendered-model');
    expect(renderMessages).toHaveLength(1);
    const { embeddedTextures, basePath } = renderMessages[0];
    expect(basePath).toBe('https://example.com/models/');
    // The textures are indexed by the paths written inside the model.
    expect(Object.keys(embeddedTextures).sort()).toEqual([
      'Textures/barrel.png',
      'Textures/planks.png',
    ]);
    expect(
      new TextDecoder().decode(embeddedTextures['Textures/planks.png'])
    ).toBe('https://example.com/textures/planks.png');
    // They are transferred to the worker, like the model.
    expect(transferredBuffers).toHaveLength(3);
    expect(transferredBuffers).toContain(
      embeddedTextures['Textures/barrel.png']
    );

    act(() => testRenderer.unmount());
  });
});

describe('Resource3DPreviewCache', () => {
  let revokedUrls = [];
  beforeEach(() => {
    revokedUrls = [];
    // $FlowFixMe[cannot-write]
    URL.revokeObjectURL = (url: string) => revokedUrls.push(url);
  });
  afterEach(() => {
    setResource3DPreviewRequester(null);
  });

  it('keeps the preview of a local file while it is rendered again after a URL cache burst', async () => {
    let renderCount = 0;
    const requester = jest.fn(
      async (url: string, _embeddedTextureUrls: ?{ [string]: string }) => {
        renderCount++;
        const preview = `blob:preview-${renderCount}`;
        setCachedResource3DPreview(url, preview);
        return preview;
      }
    );
    setResource3DPreviewRequester(requester);

    expect(getResource3DPreviewOrRequest('file:///a.glb?cache=1')).toBe(null);
    await waitForMicrotasks();
    expect(getResource3DPreviewOrRequest('file:///a.glb?cache=1')).toBe(
      'blob:preview-1'
    );

    // The URL changed (the URL cache was burst): the previous preview is
    // still shown while the model is rendered again.
    expect(getResource3DPreviewOrRequest('file:///a.glb?cache=2')).toBe(
      'blob:preview-1'
    );
    await waitForMicrotasks();
    expect(requester).toHaveBeenCalledTimes(2);
    expect(getResource3DPreviewOrRequest('file:///a.glb?cache=2')).toBe(
      'blob:preview-2'
    );
    expect(revokedUrls).toEqual(['blob:preview-1']);
  });

  it('gives the URLs of the textures kept in separate files to the requester', async () => {
    const requester = jest.fn(
      async (url: string, _embeddedTextureUrls: ?{ [string]: string }) =>
        'blob:preview'
    );
    setResource3DPreviewRequester(requester);

    getResource3DPreviewOrRequest('file:///models/barrels.glb', {
      'Textures/barrel.png': 'file:///models/Textures/barrel.png',
    });
    await waitForMicrotasks();

    expect(requester).toHaveBeenCalledWith('file:///models/barrels.glb', {
      'Textures/barrel.png': 'file:///models/Textures/barrel.png',
    });
  });
});
