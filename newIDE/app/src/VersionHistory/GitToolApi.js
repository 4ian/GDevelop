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

type GitToolAction =
  | 'status'
  | 'init'
  | 'commit'
  | 'commit-and-push'
  | 'push'
  | 'revert'
  | 'reset';

export const isGitToolSupported = (): boolean =>
  !!ipcRenderer && typeof ipcRenderer.invoke === 'function';

export const invokeGitTool = async (
  projectFilePath: string,
  action: GitToolAction,
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
