// @flow

type SaveProjectFileMetadata = { fileIdentifier: string, version?: string };

const delay = (milliseconds: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

export const saveProjectAfterPendingSave = async ({
  isSaveProjectInProgress,
  saveProject,
  hasExtensionLoadErrors,
  waitTimeoutMs = 30000,
  pollIntervalMs = 100,
  now = () => Date.now(),
  wait = delay,
}: {|
  isSaveProjectInProgress: () => boolean,
  saveProject: () => Promise<?SaveProjectFileMetadata>,
  hasExtensionLoadErrors: boolean,
  waitTimeoutMs?: number,
  pollIntervalMs?: number,
  now?: () => number,
  wait?: (milliseconds: number) => Promise<void>,
|}): Promise<Object> => {
  const waitStartedAt = now();
  while (isSaveProjectInProgress()) {
    if (now() - waitStartedAt >= waitTimeoutMs) {
      return {
        saved: false,
        reason: 'save-in-progress-timeout',
        waitedForPreviousSaveMs: now() - waitStartedAt,
      };
    }
    await wait(pollIntervalMs);
  }

  const waitedForPreviousSaveMs = now() - waitStartedAt;
  const fileMetadata = await saveProject();
  if (!fileMetadata) {
    return {
      saved: false,
      reason: hasExtensionLoadErrors
        ? 'extension-module-load-errors'
        : 'project-save-returned-no-result',
      waitedForPreviousSaveMs,
    };
  }

  return {
    saved: true,
    fileIdentifier: fileMetadata.fileIdentifier,
    version: fileMetadata.version,
    waitedForPreviousSaveMs,
  };
};
