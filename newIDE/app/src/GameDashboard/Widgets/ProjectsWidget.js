// @flow
import * as React from 'react';
import { I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
import { type Game } from '../../Utils/GDevelopServices/Game';
import {
  type FileMetadataAndStorageProviderName,
  type FileMetadata,
  type StorageProvider,
} from '../../ProjectsStorage';
import DashboardWidget from './DashboardWidget';
import ProjectFileList from '../../MainFrame/EditorContainers/HomePage/CreateSection/ProjectFileList';

type Props = {|
  game: Game,
  onOpenProject: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  storageProviders: Array<StorageProvider>,
  onDeleteCloudProject: (
    i18n: I18nType,
    file: FileMetadataAndStorageProviderName
  ) => Promise<void>,
  disabled: boolean,

  project: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  closeProject: () => Promise<void>,
|};

const ProjectsWidget = (props: Props) => {
  return (
    <DashboardWidget
      widgetSize={'full'}
      title={<Trans>Projects</Trans>}
      widgetName="projects"
    >
      <ProjectFileList {...props} />
    </DashboardWidget>
  );
};

export default ProjectsWidget;
