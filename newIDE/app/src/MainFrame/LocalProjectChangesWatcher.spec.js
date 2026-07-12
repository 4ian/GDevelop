// @flow
import * as React from 'react';
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
}: {|
  enabled: boolean,
  onProjectFilesChanged: () => Promise<void> | void,
|}) => {
  useLocalProjectChangesWatcher({
    enabled,
    fileIdentifier: 'C:\\game\\project.settings',
    lastKnownModificationTime: 1000,
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
});
