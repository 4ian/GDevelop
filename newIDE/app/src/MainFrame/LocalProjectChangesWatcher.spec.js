// @flow
import * as React from 'react';
// $FlowFixMe[missing-export] The react-test-renderer libdef is outdated.
import TestRenderer, { act } from 'react-test-renderer';
import { getLocalProjectLastModifiedDate } from '../ProjectsStorage/LocalFileStorageProvider/LocalProjectFileModificationTime';
import useLocalProjectChangesWatcher, {
  LOCAL_PROJECT_CHANGES_POLL_INTERVAL,
  showLocalProjectFilesChangedDialog,
} from './LocalProjectChangesWatcher';

jest.mock(
  '../ProjectsStorage/LocalFileStorageProvider/LocalProjectFileModificationTime',
  () => ({ getLocalProjectLastModifiedDate: jest.fn() })
);

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

const flushPromises = async () => {
  for (let index = 0; index < 5; index++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
};

const Watcher = ({
  enabled,
  onProjectFilesChanged,
  areProjectFilesSameAsMemory = async () => false,
  lastKnownModificationTime = 1000,
}: {|
  enabled: boolean,
  onProjectFilesChanged: (
    dismissSignal: AbortSignal,
    dismissDialog: () => void
  ) => Promise<void> | void,
  areProjectFilesSameAsMemory?: () => Promise<boolean>,
  lastKnownModificationTime?: number,
|}) => {
  useLocalProjectChangesWatcher({
    enabled,
    fileIdentifier: 'C:\\game\\project.settings',
    lastKnownModificationTime,
    areProjectFilesSameAsMemory,
    onProjectFilesChanged,
  });
  return null;
};

describe('useLocalProjectChangesWatcher', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockFn(getLocalProjectLastModifiedDate).mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('checks every five seconds and reports a newer disk version once', async () => {
    const onProjectFilesChanged: any = (jest.fn(): any);
    mockFn(getLocalProjectLastModifiedDate).mockResolvedValue(2000);
    let renderer;
    act(() => {
      renderer = TestRenderer.create(
        <Watcher enabled onProjectFilesChanged={onProjectFilesChanged} />
      );
    });

    expect(getLocalProjectLastModifiedDate).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(LOCAL_PROJECT_CHANGES_POLL_INTERVAL);
      await flushPromises();
    });
    expect(getLocalProjectLastModifiedDate).toHaveBeenCalledTimes(1);
    expect(onProjectFilesChanged).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(LOCAL_PROJECT_CHANGES_POLL_INTERVAL);
      await flushPromises();
    });
    expect(getLocalProjectLastModifiedDate).toHaveBeenCalledTimes(2);
    expect(onProjectFilesChanged).toHaveBeenCalledTimes(1);

    act(() => renderer.unmount());
  });

  it('does not poll while disabled', () => {
    const onProjectFilesChanged: any = (jest.fn(): any);
    let renderer;
    act(() => {
      renderer = TestRenderer.create(
        <Watcher
          enabled={false}
          onProjectFilesChanged={onProjectFilesChanged}
        />
      );
      jest.advanceTimersByTime(LOCAL_PROJECT_CHANGES_POLL_INTERVAL * 2);
    });

    expect(getLocalProjectLastModifiedDate).not.toHaveBeenCalled();
    expect(onProjectFilesChanged).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });

  it('keeps polling and leaves the dialog open while the disk version is unacknowledged', async () => {
    let dialogDismissSignal: ?AbortSignal = null;
    const onProjectFilesChanged: any = (jest.fn(
      (dismissSignal: AbortSignal) => {
        dialogDismissSignal = dismissSignal;
        return new Promise(resolve => {
          dismissSignal.addEventListener('abort', () => resolve(), {
            once: true,
          });
        });
      }
    ): any);
    const modificationTimeMock: any = mockFn(getLocalProjectLastModifiedDate);
    const areProjectFilesSameAsMemory: any = (jest.fn(): any).mockResolvedValue(
      false
    );
    modificationTimeMock
      .mockResolvedValueOnce(2000)
      .mockResolvedValueOnce(3000)
      .mockResolvedValue(1000);
    let renderer;
    act(() => {
      renderer = TestRenderer.create(
        <Watcher
          enabled
          areProjectFilesSameAsMemory={areProjectFilesSameAsMemory}
          onProjectFilesChanged={onProjectFilesChanged}
        />
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(LOCAL_PROJECT_CHANGES_POLL_INTERVAL);
      await flushPromises();
    });
    expect(onProjectFilesChanged).toHaveBeenCalledTimes(1);
    const activeDialogDismissSignal = dialogDismissSignal;
    if (!activeDialogDismissSignal) {
      throw new Error('Expected a dialog signal.');
    }
    expect(activeDialogDismissSignal.aborted).toBe(false);

    const replacementOnProjectFilesChanged: any = (jest.fn(): any);
    act(() => {
      renderer.update(
        <Watcher
          enabled
          areProjectFilesSameAsMemory={areProjectFilesSameAsMemory}
          lastKnownModificationTime={3000}
          onProjectFilesChanged={replacementOnProjectFilesChanged}
        />
      );
    });
    expect(activeDialogDismissSignal.aborted).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(LOCAL_PROJECT_CHANGES_POLL_INTERVAL);
      await flushPromises();
    });
    expect(getLocalProjectLastModifiedDate).toHaveBeenCalledTimes(2);
    expect(onProjectFilesChanged).toHaveBeenCalledTimes(1);
    expect(replacementOnProjectFilesChanged).not.toHaveBeenCalled();
    expect(areProjectFilesSameAsMemory).toHaveBeenCalledTimes(1);
    expect(activeDialogDismissSignal.aborted).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(LOCAL_PROJECT_CHANGES_POLL_INTERVAL);
      await flushPromises();
    });
    expect(getLocalProjectLastModifiedDate).toHaveBeenCalledTimes(3);
    expect(onProjectFilesChanged).toHaveBeenCalledTimes(1);
    expect(areProjectFilesSameAsMemory).toHaveBeenCalledTimes(2);
    expect(activeDialogDismissSignal.aborted).toBe(false);

    act(() => renderer.unmount());
  });

  it('closes the dialog when the disk files match the in-memory project', async () => {
    let activeDialogDismissSignal: ?AbortSignal = null;
    const onProjectFilesChanged: any = (jest.fn(
      (dismissSignal: AbortSignal) => {
        activeDialogDismissSignal = dismissSignal;
        return new Promise(resolve => {
          dismissSignal.addEventListener('abort', () => resolve(), {
            once: true,
          });
        });
      }
    ): any);
    mockFn(getLocalProjectLastModifiedDate).mockResolvedValue(2000);
    const areProjectFilesSameAsMemory: any = (jest.fn(): any).mockResolvedValue(
      true
    );
    let renderer;
    act(() => {
      renderer = TestRenderer.create(
        <Watcher
          enabled
          areProjectFilesSameAsMemory={areProjectFilesSameAsMemory}
          onProjectFilesChanged={onProjectFilesChanged}
        />
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(LOCAL_PROJECT_CHANGES_POLL_INTERVAL);
      await flushPromises();
    });
    const dismissSignal = activeDialogDismissSignal;
    if (!dismissSignal) throw new Error('Expected a dialog signal.');
    expect(dismissSignal.aborted).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(LOCAL_PROJECT_CHANGES_POLL_INTERVAL);
      await flushPromises();
    });

    expect(areProjectFilesSameAsMemory).toHaveBeenCalledTimes(1);
    expect(dismissSignal.aborted).toBe(true);
    act(() => renderer.unmount());
  });
});

describe('showLocalProjectFilesChangedDialog', () => {
  it('reloads the project when reload is confirmed', async () => {
    const onReloadProject: any = (jest.fn(): any);
    const onBackupProject: any = (jest.fn(): any);

    await showLocalProjectFilesChangedDialog({
      showConfirmation: (jest.fn(): any).mockResolvedValue(true),
      onReloadProject,
      onBackupProject,
    });

    expect(onReloadProject).toHaveBeenCalledTimes(1);
    expect(onBackupProject).not.toHaveBeenCalled();
  });

  it('backs up the in-memory project when backup is selected', async () => {
    const onReloadProject: any = (jest.fn(): any);
    const onBackupProject: any = (jest.fn(): any);
    const showConfirmation: any = (jest.fn((options: any) => {
      options.onClickSecondaryAction();
      return Promise.resolve(false);
    }): any);

    await showLocalProjectFilesChangedDialog({
      showConfirmation: (showConfirmation: any),
      onReloadProject,
      onBackupProject,
    });

    expect(onReloadProject).not.toHaveBeenCalled();
    expect(onBackupProject).toHaveBeenCalledTimes(1);
  });

  it('allows the watcher to dismiss the dialog', async () => {
    const dismissController = new AbortController();
    const showConfirmation: any = (jest.fn(() => Promise.resolve(false)): any);

    await showLocalProjectFilesChangedDialog({
      showConfirmation,
      onReloadProject: (jest.fn(): any),
      onBackupProject: (jest.fn(): any),
      dismissSignal: dismissController.signal,
    });

    expect(showConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        dismissOnAbortSignal: dismissController.signal,
      })
    );
  });

  it('dismisses the dialog before reloading the project', async () => {
    const callOrder = [];
    const dismissDialog: any = (jest.fn(() => {
      callOrder.push('dismiss');
    }): any);
    const onReloadProject: any = (jest.fn(async () => {
      callOrder.push('reload');
    }): any);

    await showLocalProjectFilesChangedDialog({
      showConfirmation: (jest.fn(): any).mockResolvedValue(true),
      onReloadProject,
      onBackupProject: (jest.fn(): any),
      dismissDialog,
    });

    expect(dismissDialog).toHaveBeenCalledTimes(1);
    expect(onReloadProject).toHaveBeenCalledTimes(1);
    expect(callOrder).toEqual(['dismiss', 'reload']);
  });
});
