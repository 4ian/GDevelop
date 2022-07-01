// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import AddIcon from '@material-ui/icons/Add';
import { Line, Column, Spacer } from '../../../UI/Grid';
import RaisedButton from '../../../UI/RaisedButton';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import PreferencesContext from '../../Preferences/PreferencesContext';
import { type FileMetadataAndStorageProviderName } from '../../../ProjectsStorage';
import TextButton from '../../../UI/TextButton';
import Text from '../../../UI/Text';
import { List, ListItem } from '../../../UI/List';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { SectionContainer } from './SectionContainer';

type Props = {|
  project: ?gdProject,
  canOpen: boolean,
  onOpen: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  onOpenExamples: () => void,
|};

export const BuildSection = ({
  project,
  canOpen,
  onOpen,
  onOpenExamples,
  onOpenRecentFile,
}: Props) => {
  const { getRecentProjectFiles } = React.useContext(PreferencesContext);
  const windowWidth = useResponsiveWindowWidth();

  const recentProjectFiles = getRecentProjectFiles();

  return (
    <SectionContainer>
      <Line>
        <Text size="main-title">My Projects</Text>
      </Line>
      <ResponsiveLineStackLayout justifyContent="start" alignItems="center">
        <RaisedButton
          primary
          label={<Trans>Create a project</Trans>}
          onClick={onOpenExamples}
          icon={<AddIcon />}
          id="home-create-blank-project-button"
        />
        {canOpen && (
          <>
            {windowWidth !== 'small' && (
              <>
                <Text>
                  <Trans>or</Trans>
                </Text>
                <Spacer />
              </>
            )}
            <TextButton
              primary
              label={<Trans>Open an existing project</Trans>}
              onClick={onOpen}
            />
          </>
        )}
      </ResponsiveLineStackLayout>
      {recentProjectFiles && recentProjectFiles.length > 0 && (
        <Line>
          <Column noMargin>
            <Text size="title">
              <Trans>Recent files</Trans>
            </Text>
            <List>
              {recentProjectFiles.map(file => (
                <ListItem
                  key={file.fileMetadata.fileIdentifier}
                  primaryText={file.fileMetadata.fileIdentifier}
                  onClick={() => {
                    onOpenRecentFile(file);
                  }}
                />
              ))}
            </List>
          </Column>
        </Line>
      )}
    </SectionContainer>
  );
};
