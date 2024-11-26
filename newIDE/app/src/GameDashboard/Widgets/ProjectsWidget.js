// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
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

  project: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  closeProject: () => Promise<void>,
|};

const ProjectsWidget = (props: Props) => {
  return (
    <I18n>
      {({ i18n }) => (
        <DashboardWidget gridSize={3} title={<Trans>Projects</Trans>}>
          <ProjectFileList {...props} i18n={i18n} />
        </DashboardWidget>
      )}
    </I18n>
  );
};

export default ProjectsWidget;
