// @flow
import optionalRequire from '../Utils/OptionalRequire';

const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

export type GitChangedFile = {|
  path: string,
  oldPath: ?string,
  indexStatus: string,
  workingTreeStatus: string,
  status: string,
|};

export type GitDiff = {|
  path: string,
  oldPath: ?string,
  status: string,
  diff: string,
|};

export type GitCommitDiff = {|
  commitHash: string,
  diff: string,
|};

export type GitCommit = {|
  hash: string,
  shortHash: string,
  author: string,
  date: string,
  subject: string,
|};

export type GitStatus = {|
  isAvailable: boolean,
  projectDirectory: string,
  repoRoot: ?string,
  branch: string,
  upstream: ?string,
  remotes: Array<string>,
  ahead: number,
  behind: number,
  changedFiles: Array<GitChangedFile>,
  commits: Array<GitCommit>,
  error?: string,
|};

type GitToolStatusAction =
  | 'status'
  | 'init'
  | 'commit'
  | 'push'
  | 'revert'
  | 'reset';

export const isGitToolSupported = (): boolean =>
  !!ipcRenderer && typeof ipcRenderer.invoke === 'function';

export const invokeGitTool = async (
  projectFilePath: string,
  action: GitToolStatusAction,
  payload?: Object
): Promise<GitStatus> => {
  const renderer = ipcRenderer;
  if (!renderer || typeof renderer.invoke !== 'function') {
    throw new Error('The Git tool is only available in the desktop app.');
  }

  return renderer.invoke('git-tool-request', {
    projectFilePath,
    action,
    payload: payload || {},
  });
};

export const invokeGitToolDiff = async (
  projectFilePath: string,
  file: GitChangedFile
): Promise<GitDiff> => {
  const renderer = ipcRenderer;
  if (!renderer || typeof renderer.invoke !== 'function') {
    throw new Error('The Git tool is only available in the desktop app.');
  }

  return renderer.invoke('git-tool-request', {
    projectFilePath,
    action: 'diff',
    payload: { file },
  });
};

export const invokeGitToolCommitDiff = async (
  projectFilePath: string,
  commitHash: string
): Promise<GitCommitDiff> => {
  const renderer = ipcRenderer;
  if (!renderer || typeof renderer.invoke !== 'function') {
    throw new Error('The Git tool is only available in the desktop app.');
  }

  return renderer.invoke('git-tool-request', {
    projectFilePath,
    action: 'commit-diff',
    payload: { commitHash },
  });
};
