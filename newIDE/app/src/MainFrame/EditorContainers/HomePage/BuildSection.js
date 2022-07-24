// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import AddIcon from '@material-ui/icons/Add';
import { I18n } from '@lingui/react';
import { Line, Column, Spacer } from '../../../UI/Grid';
import RaisedButton from '../../../UI/RaisedButton';
import { LineStackLayout, ResponsiveLineStackLayout } from '../../../UI/Layout';
import PreferencesContext from '../../Preferences/PreferencesContext';
import { type FileMetadataAndStorageProviderName } from '../../../ProjectsStorage';
import TextButton from '../../../UI/TextButton';
import Text from '../../../UI/Text';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import SectionContainer, { SectionRow } from './SectionContainer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

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
  const windowWidth = useResponsiveWindowWidth();

  const recentProjectFiles = getRecentProjectFiles().filter(
    file => file.fileMetadata
  );

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
                  id="home-create-project-button"
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
            {recentProjectFiles && recentProjectFiles.length > 0 && (
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
                    {recentProjectFiles.map(file => (
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
                                {file.fileMetadata.fileIdentifier}
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
                                ? i18n.date(file.fileMetadata.lastModifiedDate)
                                : undefined
                            }
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Column>
              </Line>
            )}
          </SectionRow>
        </SectionContainer>
      )}
    </I18n>
  );
};

export default BuildSection;
