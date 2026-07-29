// @flow

import { saveProjectAfterPendingSave } from './McpSaveCoordinator';

describe('McpSaveCoordinator', () => {
  it('waits for an active save and then performs a fresh project save', async () => {
    let saveInProgress = true;
    let nowMs = 10;
    const wait = jest.fn(async (milliseconds: number) => {
      nowMs += milliseconds;
      saveInProgress = false;
    });
    const saveProject = jest.fn(async () => ({
      fileIdentifier: 'C:\\game\\project.gdevelop',
      version: '2',
    }));

    const result = await saveProjectAfterPendingSave({
      isSaveProjectInProgress: () => saveInProgress,
      saveProject,
      hasExtensionLoadErrors: false,
      now: () => nowMs,
      wait,
    });

    expect(wait).toHaveBeenCalledWith(100);
    expect(saveProject).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      saved: true,
      fileIdentifier: 'C:\\game\\project.gdevelop',
      version: '2',
      waitedForPreviousSaveMs: 100,
    });
  });

  it('does not start another save when the active save never finishes', async () => {
    let nowMs = 0;
    const saveProject = jest.fn(async () => ({
      fileIdentifier: 'C:\\game\\project.gdevelop',
    }));

    const result = await saveProjectAfterPendingSave({
      isSaveProjectInProgress: () => true,
      saveProject,
      hasExtensionLoadErrors: false,
      waitTimeoutMs: 100,
      now: () => nowMs,
      wait: async (milliseconds: number) => {
        nowMs += milliseconds;
      },
    });

    expect(saveProject).not.toHaveBeenCalled();
    expect(result).toEqual({
      saved: false,
      reason: 'save-in-progress-timeout',
      waitedForPreviousSaveMs: 100,
    });
  });

  it('returns a specific receipt when the host save has no result', async () => {
    const result = await saveProjectAfterPendingSave({
      isSaveProjectInProgress: () => false,
      saveProject: async () => undefined,
      hasExtensionLoadErrors: true,
    });

    expect(result).toEqual({
      saved: false,
      reason: 'extension-module-load-errors',
      waitedForPreviousSaveMs: expect.any(Number),
    });
  });

  it('propagates the original writer error to the MCP caller', async () => {
    await expect(
      saveProjectAfterPendingSave({
        isSaveProjectInProgress: () => false,
        saveProject: async () => {
          throw new Error(
            'MULTIFILE_DUPLICATE_NAMESPACE in extensions/FireBullet'
          );
        },
        hasExtensionLoadErrors: false,
      })
    ).rejects.toThrow('MULTIFILE_DUPLICATE_NAMESPACE in extensions/FireBullet');
  });
});
