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
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import {
  invokeGitToolDiff,
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
  fileRowButton: {
    display: 'block',
    width: '100%',
    margin: 0,
    padding: 0,
    border: 0,
    background: 'transparent',
    color: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
    WebkitAppearance: 'none',
  },
  diffViewer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    borderRadius: 4,
    overflow: 'hidden',
    border: '1px solid rgba(127, 127, 127, 0.35)',
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: 12,
    lineHeight: '18px',
  },
  diffHeader: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    borderBottom: '1px solid rgba(127, 127, 127, 0.35)',
    fontFamily: 'inherit',
    fontWeight: 600,
    flexShrink: 0,
  },
  diffHeaderCell: {
    padding: '6px 8px',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  diffRows: {
    overflow: 'auto',
    flex: 1,
    minHeight: 0,
  },
  diffRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    minWidth: 720,
  },
  diffCell: {
    display: 'grid',
    gridTemplateColumns: '48px minmax(0, 1fr)',
    minWidth: 0,
  },
  diffLineNumber: {
    padding: '0 8px',
    textAlign: 'right',
    userSelect: 'none',
    opacity: 0.65,
    borderRight: '1px solid rgba(127, 127, 127, 0.25)',
  },
  diffCode: {
    padding: '0 8px',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    userSelect: 'text',
    minWidth: 0,
  },
  diffNoteRow: {
    minWidth: 720,
    padding: '2px 8px',
    fontStyle: 'italic',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    userSelect: 'text',
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

const ChangedFileRow = ({
  file,
  onOpenDiff,
}: {|
  file: GitChangedFile,
  onOpenDiff: GitChangedFile => mixed,
|}) => (
  <button
    type="button"
    style={styles.fileRowButton}
    onClick={() => onOpenDiff(file)}
  >
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
  </button>
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

type DiffRowKind = 'context' | 'delete' | 'add' | 'changed' | 'note';

type SideBySideDiffRow = {|
  kind: DiffRowKind,
  oldLineNumber: ?number,
  newLineNumber: ?number,
  oldText: string,
  newText: string,
  label: ?string,
|};

const parseHunkHeader = (
  line: string
): ?{| oldLineNumber: number, newLineNumber: number |} => {
  const match = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
  if (!match) return null;

  return {
    oldLineNumber: Number(match[1]),
    newLineNumber: Number(match[2]),
  };
};

const parseUnifiedDiff = (diffText: string): Array<SideBySideDiffRow> => {
  const rows: Array<SideBySideDiffRow> = [];
  const lines = diffText.split(/\r?\n/);
  let oldLineNumber: number | null = null;
  let newLineNumber: number | null = null;
  let index = 0;

  const addChangeRows = (
    deletedLines: Array<{| lineNumber: number, text: string |}>,
    addedLines: Array<{| lineNumber: number, text: string |}>
  ) => {
    const lineCount = Math.max(deletedLines.length, addedLines.length);
    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      const deletedLine = deletedLines[lineIndex];
      const addedLine = addedLines[lineIndex];
      rows.push({
        kind:
          deletedLine && addedLine ? 'changed' : deletedLine ? 'delete' : 'add',
        oldLineNumber: deletedLine ? deletedLine.lineNumber : null,
        newLineNumber: addedLine ? addedLine.lineNumber : null,
        oldText: deletedLine ? deletedLine.text : '',
        newText: addedLine ? addedLine.text : '',
        label: null,
      });
    }
  };

  while (index < lines.length) {
    const line = lines[index];

    if (
      line === 'Staged changes' ||
      line === 'Unstaged changes' ||
      line === 'Untracked file'
    ) {
      oldLineNumber = null;
      newLineNumber = null;
      index++;
      continue;
    }

    if (line.startsWith('@@')) {
      const hunkHeader = parseHunkHeader(line);
      oldLineNumber = hunkHeader ? hunkHeader.oldLineNumber : null;
      newLineNumber = hunkHeader ? hunkHeader.newLineNumber : null;
      index++;
      continue;
    }

    if (
      oldLineNumber !== null &&
      newLineNumber !== null &&
      (line.startsWith('-') || line.startsWith('+'))
    ) {
      const deletedLines: Array<{| lineNumber: number, text: string |}> = [];
      const addedLines: Array<{| lineNumber: number, text: string |}> = [];
      let currentOldLineNumber: number = oldLineNumber;
      let currentNewLineNumber: number = newLineNumber;

      while (
        index < lines.length &&
        (lines[index].startsWith('-') || lines[index].startsWith('+'))
      ) {
        const changedLine = lines[index];
        if (changedLine.startsWith('-')) {
          deletedLines.push({
            lineNumber: currentOldLineNumber,
            text: changedLine.slice(1),
          });
          currentOldLineNumber++;
        } else {
          addedLines.push({
            lineNumber: currentNewLineNumber,
            text: changedLine.slice(1),
          });
          currentNewLineNumber++;
        }
        index++;
      }

      oldLineNumber = currentOldLineNumber;
      newLineNumber = currentNewLineNumber;
      addChangeRows(deletedLines, addedLines);
      continue;
    }

    if (
      oldLineNumber !== null &&
      newLineNumber !== null &&
      line.startsWith(' ')
    ) {
      const currentOldLineNumber: number = oldLineNumber;
      const currentNewLineNumber: number = newLineNumber;
      rows.push({
        kind: 'context',
        oldLineNumber: currentOldLineNumber,
        newLineNumber: currentNewLineNumber,
        oldText: line.slice(1),
        newText: line.slice(1),
        label: null,
      });
      oldLineNumber = currentOldLineNumber + 1;
      newLineNumber = currentNewLineNumber + 1;
      index++;
      continue;
    }

    if (
      oldLineNumber !== null &&
      newLineNumber !== null &&
      line.startsWith('\\')
    ) {
      rows.push({
        kind: 'note',
        oldLineNumber: null,
        newLineNumber: null,
        oldText: '',
        newText: '',
        label: line,
      });
      index++;
      continue;
    }

    oldLineNumber = null;
    newLineNumber = null;
    index++;
  }

  return rows;
};

const DiffCodeCell = ({
  row,
  side,
  gdevelopTheme,
}: {|
  row: SideBySideDiffRow,
  side: 'old' | 'new',
  gdevelopTheme: any,
|}) => {
  const isDeleted = side === 'old' && row.kind === 'delete';
  const isAdded = side === 'new' && row.kind === 'add';
  const isChanged =
    row.kind === 'changed' && (side === 'old' || side === 'new');
  const isEmptyDeletionSide = side === 'new' && row.kind === 'delete';
  const isEmptyAdditionSide = side === 'old' && row.kind === 'add';
  const text = side === 'old' ? row.oldText : row.newText;
  const lineNumber = side === 'old' ? row.oldLineNumber : row.newLineNumber;
  const marker =
    isDeleted || (isChanged && side === 'old')
      ? '-'
      : isAdded || (isChanged && side === 'new')
      ? '+'
      : ' ';
  const backgroundColor =
    isDeleted || (isChanged && side === 'old')
      ? 'rgba(248, 81, 73, 0.18)'
      : isAdded || (isChanged && side === 'new')
      ? 'rgba(46, 160, 67, 0.18)'
      : undefined;
  const markerColor =
    marker === '-'
      ? gdevelopTheme.statusIndicator.error
      : marker === '+'
      ? gdevelopTheme.statusIndicator.success
      : undefined;

  return (
    <div
      style={{
        ...styles.diffCell,
        backgroundColor,
        opacity: isEmptyDeletionSide || isEmptyAdditionSide ? 0.55 : undefined,
      }}
    >
      <span style={styles.diffLineNumber}>
        {lineNumber === null ? '' : lineNumber}
      </span>
      <span style={styles.diffCode}>
        <span style={{ color: markerColor }}>{marker}</span>
        {text}
      </span>
    </div>
  );
};

const SideBySideDiffViewer = ({
  diffText,
}: {|
  diffText: string,
|}): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const rows = React.useMemo(() => parseUnifiedDiff(diffText), [diffText]);

  if (!diffText.trim() || !rows.length) {
    return (
      <Text noMargin color="secondary">
        <Trans>
          No textual diff is available for this file. It may be binary or
          unchanged in the selected Git area.
        </Trans>
      </Text>
    );
  }

  return (
    <div
      style={{
        ...styles.diffViewer,
        backgroundColor: gdevelopTheme.paper.backgroundColor.dark,
      }}
    >
      <div
        style={{
          ...styles.diffHeader,
          backgroundColor: gdevelopTheme.paper.backgroundColor.medium,
        }}
      >
        <div
          style={{
            ...styles.diffHeaderCell,
            borderRight: '1px solid rgba(127, 127, 127, 0.25)',
          }}
        >
          <Trans>Original</Trans>
        </div>
        <div style={styles.diffHeaderCell}>
          <Trans>Changed</Trans>
        </div>
      </div>
      <div style={styles.diffRows}>
        {rows.map((row, index) => {
          if (row.kind === 'note') {
            return (
              <div
                key={index}
                style={{
                  ...styles.diffNoteRow,
                  color: gdevelopTheme.text.color.secondary,
                }}
              >
                {row.label}
              </div>
            );
          }

          return (
            <div key={index} style={styles.diffRow}>
              <DiffCodeCell
                row={row}
                side="old"
                gdevelopTheme={gdevelopTheme}
              />
              <DiffCodeCell
                row={row}
                side="new"
                gdevelopTheme={gdevelopTheme}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
  const [diffFile, setDiffFile] = React.useState<?GitChangedFile>(null);
  const [diffText, setDiffText] = React.useState<string>('');
  const [isDiffLoading, setIsDiffLoading] = React.useState<boolean>(false);
  const [diffErrorMessage, setDiffErrorMessage] = React.useState<?string>(null);

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
      setDiffFile(null);
      setDiffText('');
      setDiffErrorMessage(null);
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

  const openChangedFileDiff = React.useCallback(
    async (file: GitChangedFile) => {
      if (!projectFilePath) return;

      setDiffFile(file);
      setDiffText('');
      setDiffErrorMessage(null);
      setIsDiffLoading(true);
      try {
        const result = await invokeGitToolDiff(projectFilePath, file);
        setDiffText(result.diff || '');
      } catch (error) {
        setDiffErrorMessage(getErrorMessage(error));
      } finally {
        setIsDiffLoading(false);
      }
    },
    [projectFilePath]
  );

  const closeDiffDialog = React.useCallback(() => {
    setDiffFile(null);
    setDiffText('');
    setDiffErrorMessage(null);
  }, []);

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
                          onOpenDiff={openChangedFileDiff}
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
          <Dialog
            open={!!diffFile}
            title={
              diffFile ? (
                <React.Fragment>
                  <Trans>Diff</Trans>: {diffFile.path}
                </React.Fragment>
              ) : (
                <Trans>Diff</Trans>
              )
            }
            actions={[
              <FlatButton
                key="close"
                label={<Trans>Close</Trans>}
                onClick={closeDiffDialog}
              />,
            ]}
            onRequestClose={closeDiffDialog}
            maxWidth="lg"
            fullHeight
            flexColumnBody
          >
            {isDiffLoading ? (
              <Text noMargin color="secondary">
                <Trans>Loading diff...</Trans>
              </Text>
            ) : diffErrorMessage ? (
              <Text noMargin color="error" allowSelection>
                {diffErrorMessage}
              </Text>
            ) : (
              <SideBySideDiffViewer diffText={diffText} />
            )}
          </Dialog>
        </>
      )}
    </I18n>
  );
};

export default GitTool;
