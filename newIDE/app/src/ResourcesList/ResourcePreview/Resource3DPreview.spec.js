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
    const requester = jest.fn(async (url: string) => {
      renderCount++;
      const preview = `blob:preview-${renderCount}`;
      setCachedResource3DPreview(url, preview);
      return preview;
    });
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
});
