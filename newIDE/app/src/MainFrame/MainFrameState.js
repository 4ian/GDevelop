// @flow

import { type EditorTabsState } from './EditorTabs/EditorTabsHandler';
import { type ElectronUpdateStatus } from './UpdaterTools';
import { type FileMetadata } from '../ProjectsStorage';
import { type ToolbarButtonConfig } from './CustomToolbarButton';

// Note: avoid adding to this state. Prefer using hooks in MainFrame.
export type State = {|
  currentProject: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  editorTabs: EditorTabsState,
  snackMessage: string,
  snackMessageOpen: boolean,
  snackDuration: ?number,
  updateStatus: ElectronUpdateStatus,
  openFromStorageProviderDialogOpen: boolean,
  saveToStorageProviderDialogOpen: boolean,
  gdjsDevelopmentWatcherEnabled: boolean,
  toolbarButtons: Array<ToolbarButtonConfig>,
|};
