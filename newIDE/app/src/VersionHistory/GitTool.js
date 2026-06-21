// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans, t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import ScrollView from '../UI/ScrollView';
import EmptyMessage from '../UI/EmptyMessage';
import Text from '../UI/Text';
import TextField from '../UI/TextField';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import Chip from '../UI/Chip';
import { Line } from '../UI/Grid';
import { LineStackLayout } from '../UI/Layout';
import Refresh from '../UI/CustomSvgIcons/Refresh';
import Upload from '../UI/CustomSvgIcons/Upload';
import Restore from '../UI/CustomSvgIcons/Restore';
import { type FileMetadata } from '../ProjectsStorage';
import UnsavedChangesContext from '../MainFrame/UnsavedChangesContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import {
  invokeGitTool,
  isGitToolSupported,
  type GitChangedFile,
  type GitCommit,
  type GitStatus,
} from './GitToolApi';

const styles = {
  scrollView: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    padding: 8,
    gap: 12,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  fileRow: {
    display: 'grid',
    gridTemplateColumns: '70px minmax(0, 1fr)',
    gap: 8,
    alignItems: 'baseline',
    padding: '4px 0',
  },
  commitRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '8px 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  commitActions: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
};

type Props = {|
  fileMetadata: ?FileMetadata,
  isLocalProject: boolean,
  onReloadProject: () => Promise<void>,
|};

const getErrorMessage = (error: mixed): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

const formatCommitDate = (i18n: I18nType, date: string): string => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return i18n.date(parsedDate, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

const ChangedFileRow = ({ file }: {| file: GitChangedFile |}) => (
  <div style={styles.fileRow}>
    <Chip size="small" label={file.status} variant="outlined" />
    <Text
      noMargin
      size="body-small"
      allowSelection
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      tooltip={file.oldPath ? `${file.oldPath} -> ${file.path}` : file.path}
    >
      {file.oldPath ? `${file.oldPath} -> ${file.path}` : file.path}
    </Text>
  </div>
);

const CommitRow = ({
  commit,
  i18n,
  disabled,
  onRevert,
  onReset,
}: {|
  commit: GitCommit,
  i18n: I18nType,
  disabled: boolean,
  onRevert: GitCommit => void | Promise<void>,
  onReset: GitCommit => void | Promise<void>,
|}) => (
  <div style={styles.commitRow}>
    <LineStackLayout
      noMargin
      alignItems="baseline"
      justifyContent="space-between"
    >
      <Text
        noMargin
        size="body2"
        style={{
          fontWeight: 'bold',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        tooltip={commit.subject}
      >
        {commit.subject || <Trans>No commit message</Trans>}
      </Text>
      <Text noMargin size="body-small" color="secondary" noShrink>
        {commit.shortHash}
      </Text>
    </LineStackLayout>
    <Text noMargin size="body-small" color="secondary">
      {commit.author} - {formatCommitDate(i18n, commit.date)}
    </Text>
    <div style={styles.commitActions}>
      <FlatButton
        label={<Trans>Revert</Trans>}
        onClick={() => onRevert(commit)}
        disabled={disabled}
        leftIcon={<Restore />}
      />
      <FlatButton
        label={<Trans>Reset here</Trans>}
        onClick={() => onReset(commit)}
        disabled={disabled}
        color="danger"
      />
    </div>
  </div>
);

const GitTool = ({
  fileMetadata,
  isLocalProject,
  onReloadProject,
}: Props): React.Node => {
  const { hasUnsavedChanges } = React.useContext(UnsavedChangesContext);
  const { showAlert, showConfirmation } = useAlertDialog();
  const [status, setStatus] = React.useState<?GitStatus>(null);
  const [commitMessage, setCommitMessage] = React.useState<string>('');
  const [remoteRepositoryUrl, setRemoteRepositoryUrl] = React.useState<string>(
    ''
  );
  const [isRemoteDialogOpen, setIsRemoteDialogOpen] = React.useState<boolean>(
    false
  );
  const [hasPushSuccessHint, setHasPushSuccessHint] = React.useState<boolean>(
    false
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [runningAction, setRunningAction] = React.useState<?string>(null);
  const [errorMessage, setErrorMessage] = React.useState<?string>(null);

  const projectFilePath = fileMetadata ? fileMetadata.fileIdentifier : null;
  const canUseGitTool =
    !!projectFilePath && isLocalProject && isGitToolSupported();

  const refreshStatus = React.useCallback(
    async () => {
      if (!projectFilePath || !canUseGitTool) return;

      setIsLoading(true);
      setErrorMessage(null);
      setHasPushSuccessHint(false);
      try {
        const nextStatus = await invokeGitTool(projectFilePath, 'status');
        setStatus(nextStatus);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
    [projectFilePath, canUseGitTool]
  );

  React.useEffect(
    () => {
      setStatus(null);
      setCommitMessage('');
      setRemoteRepositoryUrl('');
      setIsRemoteDialogOpen(false);
      setHasPushSuccessHint(false);
      setErrorMessage(null);
      refreshStatus();
    },
    [refreshStatus]
  );

  const runAction = React.useCallback(
    async (
      action:
        | 'init'
        | 'commit'
        | 'commit-and-push'
        | 'push'
        | 'revert'
        | 'reset',
      payload?: Object
    ): Promise<boolean> => {
      if (!projectFilePath) return false;

      setRunningAction(action);
      setErrorMessage(null);
      setHasPushSuccessHint(false);
      try {
        const nextStatus = await invokeGitTool(
          projectFilePath,
          action,
          payload
        );
        setStatus(nextStatus);
        return true;
      } catch (error) {
        const message = getErrorMessage(error);
        setErrorMessage(message);
        await showAlert({
          title: t`Git action failed`,
          message: t`An error occurred while running Git: ${message}`,
        });
        return false;
      } finally {
        setRunningAction(null);
      }
    },
    [projectFilePath, showAlert]
  );

  const reloadProjectAfterGitAction = React.useCallback(
    async () => {
      try {
        await onReloadProject();
      } catch (error) {
        const message = getErrorMessage(error);
        await showAlert({
          title: t`Unable to reload project`,
          message: t`The Git action succeeded, but the project could not be reloaded: ${message}`,
        });
      }
    },
    [onReloadProject, showAlert]
  );

  const confirmUnsavedChanges = React.useCallback(
    async (): Promise<boolean> => {
      if (!hasUnsavedChanges) return true;

      return showConfirmation({
        title: t`There are unsaved changes`,
        message: t`Git can only commit files that have been saved on disk. Save the project first if these editor changes should be included.`,
        confirmButtonLabel: t`Continue`,
        dismissButtonLabel: t`Cancel`,
        level: 'warning',
      });
    },
    [hasUnsavedChanges, showConfirmation]
  );

  const performCommitAndPush = React.useCallback(
    async (remoteUrl?: string): Promise<boolean> => {
      if (!status || !status.isAvailable) return false;
      if (!status.changedFiles.length && !status.commits.length) {
        await showAlert({
          title: t`Nothing to push`,
          message: t`There are no commits or changed files to push.`,
        });
        return false;
      }
      if (status.changedFiles.length && !commitMessage.trim()) {
        await showAlert({
          title: t`Add a commit message`,
          message: t`Write a short comment describing this version before committing.`,
        });
        return false;
      }

      if (status.changedFiles.length) {
        const shouldContinue = await confirmUnsavedChanges();
        if (!shouldContinue) return false;
      }

      const wasSuccessful = await runAction('commit-and-push', {
        message: status.changedFiles.length ? commitMessage : '',
        remoteUrl,
      });
      if (wasSuccessful) {
        setCommitMessage('');
        setHasPushSuccessHint(true);
      }
      return wasSuccessful;
    },
    [status, commitMessage, confirmUnsavedChanges, runAction, showAlert]
  );

  const commitAndPush = React.useCallback(
    async () => {
      if (!status || !status.isAvailable) return;
      if (!status.changedFiles.length && !status.commits.length) {
        await performCommitAndPush();
        return;
      }
      if (status.changedFiles.length && !commitMessage.trim()) {
        await performCommitAndPush();
        return;
      }

      if (!status.remotes.length) {
        setRemoteRepositoryUrl('');
        setIsRemoteDialogOpen(true);
        return;
      }

      await performCommitAndPush();
    },
    [status, commitMessage, performCommitAndPush]
  );

  const closeRemoteDialog = React.useCallback(
    () => {
      if (runningAction) return;
      setIsRemoteDialogOpen(false);
    },
    [runningAction]
  );

  const commitAndPushWithRemote = React.useCallback(
    async () => {
      const remoteUrl = remoteRepositoryUrl.trim();
      if (!remoteUrl) return;

      const wasSuccessful = await performCommitAndPush(remoteUrl);
      if (wasSuccessful) {
        setIsRemoteDialogOpen(false);
        setRemoteRepositoryUrl('');
      }
    },
    [remoteRepositoryUrl, performCommitAndPush]
  );

  const initializeGit = React.useCallback(
    async () => {
      await runAction('init');
    },
    [runAction]
  );

  const revertCommit = React.useCallback(
    async (commit: GitCommit) => {
      const shouldRevert = await showConfirmation({
        title: t`Revert this commit?`,
        message: hasUnsavedChanges
          ? t`A new commit will be created that reverses ${
              commit.shortHash
            }. Your worktree must be clean before reverting. The project will reload after reverting, so unsaved editor changes will be lost.`
          : t`A new commit will be created that reverses ${
              commit.shortHash
            }. Your worktree must be clean before reverting. The project will reload after reverting.`,
        confirmButtonLabel: t`Revert`,
        dismissButtonLabel: t`Cancel`,
        level: 'warning',
      });
      if (!shouldRevert) return;

      const wasSuccessful = await runAction('revert', {
        commitHash: commit.hash,
      });
      if (wasSuccessful) await reloadProjectAfterGitAction();
    },
    [
      hasUnsavedChanges,
      reloadProjectAfterGitAction,
      runAction,
      showConfirmation,
    ]
  );

  const resetToCommit = React.useCallback(
    async (commit: GitCommit) => {
      const shouldReset = await showConfirmation({
        title: t`Reset to this commit?`,
        message: hasUnsavedChanges
          ? t`This moves the current branch back to ${
              commit.shortHash
            } and discards tracked local changes. The project will reload after resetting, so unsaved editor changes will be lost. This is difficult to undo if the commits are not pushed elsewhere.`
          : t`This moves the current branch back to ${
              commit.shortHash
            } and discards tracked local changes. The project will reload after resetting. This is difficult to undo if the commits are not pushed elsewhere.`,
        confirmButtonLabel: t`Reset`,
        dismissButtonLabel: t`Cancel`,
        level: 'warning',
      });
      if (!shouldReset) return;

      const wasSuccessful = await runAction('reset', {
        commitHash: commit.hash,
      });
      if (wasSuccessful) await reloadProjectAfterGitAction();
    },
    [
      hasUnsavedChanges,
      reloadProjectAfterGitAction,
      runAction,
      showConfirmation,
    ]
  );

  if (!fileMetadata) {
    return (
      <EmptyMessage>
        <Trans>Open or save a local project before using the Git tool.</Trans>
      </EmptyMessage>
    );
  }

  if (!isLocalProject) {
    return (
      <EmptyMessage>
        <Trans>
          The Git tool is available for projects saved on this computer.
        </Trans>
      </EmptyMessage>
    );
  }

  if (!isGitToolSupported()) {
    return (
      <EmptyMessage>
        <Trans>The Git tool is only available in the desktop app.</Trans>
      </EmptyMessage>
    );
  }

  const isBusy = isLoading || !!runningAction;
  const changedFiles = status && status.isAvailable ? status.changedFiles : [];
  const commits = status && status.isAvailable ? status.commits : [];
  const canCommitAndPush =
    !!status &&
    status.isAvailable &&
    (!!changedFiles.length || !!commits.length);
  const hasStatusError = !!status && !status.isAvailable;
  const currentError = errorMessage || (status && status.error);
  const remoteDialogActions: Array<?React.Node> = [
    <FlatButton
      key="cancel"
      label={<Trans>Cancel</Trans>}
      onClick={closeRemoteDialog}
      disabled={isBusy}
    />,
    <DialogPrimaryButton
      key="commit-and-push"
      label={<Trans>Commit & push</Trans>}
      onClick={commitAndPushWithRemote}
      disabled={isBusy || !remoteRepositoryUrl.trim()}
      icon={<Upload />}
      primary
    />,
  ];

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <ScrollView style={styles.scrollView}>
            <div style={styles.content}>
              <div style={styles.section}>
                <div style={styles.headerRow}>
                  <Text noMargin size="block-title">
                    <Trans>Git tool</Trans>
                  </Text>
                  <FlatButton
                    label={<Trans>Refresh</Trans>}
                    onClick={refreshStatus}
                    disabled={isBusy}
                    leftIcon={<Refresh />}
                  />
                </div>
                {status && status.isAvailable && (
                  <>
                    <Text
                      noMargin
                      size="body-small"
                      color="secondary"
                      allowSelection
                      style={{
                        overflowWrap: 'anywhere',
                        whiteSpace: 'normal',
                      }}
                      tooltip={status.repoRoot || ''}
                    >
                      {status.repoRoot}
                    </Text>
                    <div style={styles.chipRow}>
                      <Chip
                        size="small"
                        label={status.branch || i18n._(t`Detached`)}
                        variant="outlined"
                      />
                      {status.upstream && (
                        <Chip
                          size="small"
                          label={status.upstream}
                          variant="outlined"
                        />
                      )}
                      {!status.upstream &&
                        status.remotes.map(remote => (
                          <Chip
                            key={remote}
                            size="small"
                            label={i18n._(t`Remote ${remote}`)}
                            variant="outlined"
                          />
                        ))}
                      {!!status.ahead && (
                        <Chip
                          size="small"
                          label={i18n._(t`Ahead ${status.ahead}`)}
                        />
                      )}
                      {!!status.behind && (
                        <Chip
                          size="small"
                          label={i18n._(t`Behind ${status.behind}`)}
                        />
                      )}
                    </div>
                  </>
                )}
                {isLoading && (
                  <Text noMargin color="secondary">
                    <Trans>Loading Git status...</Trans>
                  </Text>
                )}
                {currentError && (
                  <Text noMargin color="error" allowSelection>
                    {currentError}
                  </Text>
                )}
                {hasStatusError && (
                  <Line noMargin>
                    <RaisedButton
                      label={<Trans>Initialize Git</Trans>}
                      onClick={initializeGit}
                      disabled={isBusy}
                    />
                  </Line>
                )}
              </div>

              {status && status.isAvailable && (
                <>
                  <div style={styles.section}>
                    <Text noMargin size="block-title">
                      <Trans>Changed files</Trans>
                    </Text>
                    {hasUnsavedChanges && (
                      <Text noMargin size="body-small" color="secondary">
                        <Trans>
                          The editor has unsaved changes. Save before committing
                          to include them.
                        </Trans>
                      </Text>
                    )}
                    {changedFiles.length ? (
                      changedFiles.map(file => (
                        <ChangedFileRow
                          key={`${file.indexStatus}${file.workingTreeStatus}:${
                            file.path
                          }`}
                          file={file}
                        />
                      ))
                    ) : (
                      <Text noMargin color="secondary">
                        <Trans>No changed files.</Trans>
                      </Text>
                    )}
                  </div>

                  <div style={styles.section}>
                    <TextField
                      value={commitMessage}
                      onChange={(event, value) => setCommitMessage(value)}
                      floatingLabelText={<Trans>Commit comment</Trans>}
                      translatableHintText={t`Describe the change`}
                      multiline
                      rows={2}
                      fullWidth
                      disabled={isBusy}
                    />
                    <RaisedButton
                      label={<Trans>Commit & push</Trans>}
                      onClick={commitAndPush}
                      disabled={isBusy || !canCommitAndPush}
                      icon={<Upload />}
                    />
                    {hasPushSuccessHint && (
                      <Text noMargin size="body-small" color="secondary">
                        <Trans>Project pushed successfully.</Trans>
                      </Text>
                    )}
                  </div>

                  <div style={styles.section}>
                    <Text noMargin size="block-title">
                      <Trans>Recent commits</Trans>
                    </Text>
                    {commits.length ? (
                      commits.map(commit => (
                        <CommitRow
                          key={commit.hash}
                          commit={commit}
                          i18n={i18n}
                          disabled={isBusy}
                          onRevert={revertCommit}
                          onReset={resetToCommit}
                        />
                      ))
                    ) : (
                      <Text noMargin color="secondary">
                        <Trans>No commits yet.</Trans>
                      </Text>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollView>
          <Dialog
            open={isRemoteDialogOpen}
            title={<Trans>Connect remote repository</Trans>}
            actions={remoteDialogActions}
            onRequestClose={closeRemoteDialog}
            onApply={commitAndPushWithRemote}
            cannotBeDismissed={isBusy}
            maxWidth="sm"
          >
            <Text noMargin>
              <Trans>
                Enter the remote Git repository URL to connect this project and
                push the current commits.
              </Trans>
            </Text>
            <TextField
              value={remoteRepositoryUrl}
              onChange={(event, value) => setRemoteRepositoryUrl(value)}
              floatingLabelText={<Trans>Remote repository URL</Trans>}
              translatableHintText={t`https://github.com/user/repository.git`}
              fullWidth
              disabled={isBusy}
              autoFocus="desktop"
            />
          </Dialog>
        </>
      )}
    </I18n>
  );
};

export default GitTool;
