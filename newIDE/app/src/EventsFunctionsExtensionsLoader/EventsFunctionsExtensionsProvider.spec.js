// @flow
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import { act } from 'react-dom/test-utils';
import {
  loadProjectEventsFunctionsExtensions,
  unloadProjectEventsFunctionsExtensions,
  unloadProjectEventsFunctionsExtension,
  reloadProjectEventsFunctionsExtensionMetadata,
} from '.';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from './EventsFunctionsExtensionsContext';
import { EventsFunctionsExtensionsProvider } from './EventsFunctionsExtensionsProvider';

jest.mock('.', () => ({
  loadProjectEventsFunctionsExtensions: jest.fn(),
  unloadProjectEventsFunctionsExtensions: jest.fn(),
  unloadProjectEventsFunctionsExtension: jest.fn(),
  reloadProjectEventsFunctionsExtensionMetadata: jest.fn(),
}));
jest.mock('../UI/Messages/MessageBox', () => ({ showErrorBox: jest.fn() }));

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

const flushPromises = async () => {
  for (let index = 0; index < 5; index++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
};

const ContextCapture = ({
  contextRef,
}: {|
  contextRef: { current: EventsFunctionsExtensionsState | null },
|}) => {
  contextRef.current = React.useContext(EventsFunctionsExtensionsContext);
  return null;
};

const renderProvider = () => {
  const contextRef: { current: EventsFunctionsExtensionsState | null } = {
    current: null,
  };
  const codeWriter: any = {
    getIncludeFileFor: () => '',
    writeFunctionCode: () => Promise.resolve(),
    writeBehaviorCode: () => Promise.resolve(),
    writeObjectCode: () => Promise.resolve(),
  };
  const i18n: any = { _: message => message };
  let renderer: any = { unmount: () => {} };

  act(() => {
    renderer = TestRenderer.create(
      <EventsFunctionsExtensionsProvider
        i18n={i18n}
        makeEventsFunctionCodeWriter={() => codeWriter}
        eventsFunctionsExtensionWriter={null}
        eventsFunctionsExtensionOpener={null}
      >
        <ContextCapture contextRef={contextRef} />
      </EventsFunctionsExtensionsProvider>
    );
  });

  if (!contextRef.current) throw new Error('Context not captured.');
  return { context: contextRef.current, renderer };
};

describe('EventsFunctionsExtensionsProvider loading queues', () => {
  beforeEach(() => {
    mockFn(loadProjectEventsFunctionsExtensions).mockReset();
    mockFn(unloadProjectEventsFunctionsExtensions).mockReset();
    mockFn(unloadProjectEventsFunctionsExtension).mockReset();
    mockFn(reloadProjectEventsFunctionsExtensionMetadata).mockReset();
  });

  it('does not make a new project wait for another project loading', async () => {
    const oldProject: gdProject = ({}: any);
    const newProject: gdProject = ({}: any);
    let finishOldProjectLoad: () => void = () => {};
    const oldProjectLoad: Promise<void> = new Promise(resolve => {
      finishOldProjectLoad = () => resolve();
    });
    mockFn(loadProjectEventsFunctionsExtensions).mockImplementation(project =>
      project === oldProject ? oldProjectLoad : Promise.resolve()
    );
    const { context, renderer } = renderProvider();

    const pendingOldProjectLoad = context.loadProjectEventsFunctionsExtensions(
      oldProject
    );
    context.loadProjectEventsFunctionsExtensions(newProject);

    await act(async () => {
      await flushPromises();
    });

    expect(loadProjectEventsFunctionsExtensions).toHaveBeenCalledTimes(2);
    expect(loadProjectEventsFunctionsExtensions).toHaveBeenCalledWith(
      newProject,
      expect.any(Object),
      expect.any(Object)
    );

    let isNewProjectReady = false;
    context.ensureLoadFinished(newProject).then(() => {
      isNewProjectReady = true;
    });
    await act(async () => {
      await flushPromises();
    });
    expect(isNewProjectReady).toBe(true);

    await act(async () => {
      finishOldProjectLoad();
      await pendingOldProjectLoad;
    });
    act(() => renderer.unmount());
  });

  it('still serializes repeated loads for the same project', async () => {
    const project: gdProject = ({}: any);
    let finishFirstLoad: () => void = () => {};
    const firstLoad: Promise<void> = new Promise(resolve => {
      finishFirstLoad = () => resolve();
    });
    mockFn(loadProjectEventsFunctionsExtensions)
      .mockImplementationOnce(() => firstLoad)
      .mockResolvedValueOnce();
    const { context, renderer } = renderProvider();

    const firstQueuedLoad = context.loadProjectEventsFunctionsExtensions(
      project
    );
    await act(async () => {
      await flushPromises();
    });
    expect(loadProjectEventsFunctionsExtensions).toHaveBeenCalledTimes(1);

    const secondQueuedLoad = context.loadProjectEventsFunctionsExtensions(
      project
    );
    await act(async () => {
      finishFirstLoad();
      await firstQueuedLoad;
      await secondQueuedLoad;
    });
    expect(loadProjectEventsFunctionsExtensions).toHaveBeenCalledTimes(2);
    await context.ensureLoadFinished(project);
    act(() => renderer.unmount());
  });

  it('coalesces repeated loads into one trailing pass', async () => {
    const project: gdProject = ({}: any);
    let finishFirstLoad: () => void = () => {};
    let finishTrailingLoad: () => void = () => {};
    const firstLoad: Promise<void> = new Promise(resolve => {
      finishFirstLoad = () => resolve();
    });
    const trailingLoad: Promise<void> = new Promise(resolve => {
      finishTrailingLoad = () => resolve();
    });
    mockFn(loadProjectEventsFunctionsExtensions)
      .mockImplementationOnce(() => firstLoad)
      .mockImplementationOnce(() => trailingLoad);
    const { context, renderer } = renderProvider();

    const firstQueuedLoad = context.loadProjectEventsFunctionsExtensions(
      project
    );
    await act(async () => {
      await flushPromises();
    });
    expect(loadProjectEventsFunctionsExtensions).toHaveBeenCalledTimes(1);

    const coalescedLoads = Array.from({ length: 6 }, () =>
      context.loadProjectEventsFunctionsExtensions(project)
    );
    await act(async () => {
      finishFirstLoad();
      await flushPromises();
    });
    expect(loadProjectEventsFunctionsExtensions).toHaveBeenCalledTimes(2);

    await act(async () => {
      finishTrailingLoad();
      await firstQueuedLoad;
      await Promise.all(coalescedLoads);
    });
    expect(loadProjectEventsFunctionsExtensions).toHaveBeenCalledTimes(2);
    await context.ensureLoadFinished(project);
    act(() => renderer.unmount());
  });
});
