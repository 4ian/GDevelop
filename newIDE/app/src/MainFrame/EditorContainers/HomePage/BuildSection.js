// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import AddIcon from '@material-ui/icons/Add';
import Text from '../../../UI/Text';
import TextButton from '../../../UI/TextButton';
import RaisedButton from '../../../UI/RaisedButton';
import { Line, Column, Spacer } from '../../../UI/Grid';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { LineStackLayout, ResponsiveLineStackLayout } from '../../../UI/Layout';

import { type FileMetadataAndStorageProviderName } from '../../../ProjectsStorage';
import PreferencesContext from '../../Preferences/PreferencesContext';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import SectionContainer, { SectionRow } from './SectionContainer';

const styles = {
  listItem: {
    padding: 0,
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 8,
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices.
  },
};

type Props = {|
  project: ?gdProject,
  canOpen: boolean,
  onOpen: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  onCreateProject: () => void,
|};

const BuildSection = ({
  project,
  canOpen,
  onOpen,
  onCreateProject,
  onOpenRecentFile,
}: Props) => {
  const { getRecentProjectFiles } = React.useContext(PreferencesContext);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const windowWidth = useResponsiveWindowWidth();

  let projectFiles: Array<FileMetadataAndStorageProviderName> = getRecentProjectFiles().filter(
    file => file.fileMetadata
  );

  const { cloudProjects } = authenticatedUser;

  if (cloudProjects) {
    projectFiles = projectFiles.concat(
      cloudProjects.map(cloudProject => {
        const file: FileMetadataAndStorageProviderName = {
          storageProviderName: 'Cloud',
          fileMetadata: {
            fileIdentifier: cloudProject.id,
            lastModifiedDate: Date.parse(cloudProject.lastModifiedAt),
            name: cloudProject.name,
          },
        };
        return file;
      })
    );
  }

  projectFiles.sort((a, b) => {
    if (!a.fileMetadata.lastModifiedDate) return 1;
    if (!b.fileMetadata.lastModifiedDate) return -1;
    return b.fileMetadata.lastModifiedDate - a.fileMetadata.lastModifiedDate;
  });

  return (
    <I18n>
      {({ i18n }) => (
        <SectionContainer title={<Trans>My projects</Trans>}>
          <SectionRow>
            <Line noMargin>
              <ResponsiveLineStackLayout
                justifyContent="start"
                alignItems="center"
              >
                <RaisedButton
                  primary
                  label={<Trans>Create a project</Trans>}
                  onClick={onCreateProject}
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
            </Line>
            {authenticatedUser.loginState === 'loading' ? (
              <Column
                useFullHeight
                expand
                noMargin
                justifyContent="flex-start"
                alignItems="center"
              >
                <CircularProgress />
                <Text>
                  <Trans>Loading user projects...</Trans>
                </Text>
              </Column>
            ) : (
              projectFiles &&
              projectFiles.length > 0 && (
                <Line>
                  <Column noMargin expand>
                    {windowWidth !== 'small' && (
                      <LineStackLayout justifyContent="space-between">
                        <Column expand noMargin>
                          <Text color="secondary">
                            <Trans>File name</Trans>
                          </Text>
                        </Column>
                        <Column expand noMargin>
                          <Text color="secondary">
                            <Trans>Last edited</Trans>
                          </Text>
                        </Column>
                      </LineStackLayout>
                    )}
                    <List>
                      {projectFiles.map(file => (
                        <ListItem
                          button
                          key={file.fileMetadata.fileIdentifier}
                          onClick={() => {
                            onOpenRecentFile(file);
                          }}
                          style={styles.listItem}
                        >
                          {windowWidth !== 'small' ? (
                            <LineStackLayout justifyContent="flex-start" expand>
                              <Column expand noMargin>
                                <Text noMargin>
                                  {file.fileMetadata.name
                                    ? file.fileMetadata.name
                                    : file.fileMetadata.fileIdentifier}
                                </Text>
                              </Column>
                              <Column expand noMargin>
                                {file.fileMetadata.lastModifiedDate && (
                                  <Text noMargin>
                                    {i18n.date(
                                      file.fileMetadata.lastModifiedDate
                                    )}
                                  </Text>
                                )}
                              </Column>
                            </LineStackLayout>
                          ) : (
                            <ListItemText
                              primary={file.fileMetadata.fileIdentifier}
                              secondary={
                                file.fileMetadata.lastModifiedDate
                                  ? i18n.date(
                                      file.fileMetadata.lastModifiedDate
                                    )
                                  : undefined
                              }
                            />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Column>
                </Line>
              )
            )}
          </SectionRow>
        </SectionContainer>
      )}
    </I18n>
  );
};

export default BuildSection;
