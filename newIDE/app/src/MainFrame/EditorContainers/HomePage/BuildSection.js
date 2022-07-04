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
import { SectionContainer } from './SectionContainer';
import { List, ListItem, ListItemText } from '@material-ui/core';

const styles = {
  listItem: {
    padding: 0,
  },
};

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
    <I18n>
      {({ i18n }) => (
        <SectionContainer title={<Trans>My projects</Trans>}>
          <Line noMargin>
            <ResponsiveLineStackLayout
              justifyContent="start"
              alignItems="center"
            >
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
          </Line>
          {recentProjectFiles && recentProjectFiles.length > 0 && (
            <Line>
              <Column noMargin expand>
                <LineStackLayout justifyContent="space-between">
                  <Column expand noMargin>
                    <Text color="secondary">
                      <Trans>File name</Trans>
                    </Text>
                  </Column>
                  {windowWidth !== 'small' && (
                    <Column expand noMargin>
                      <Text color="secondary">
                        <Trans>Last edited</Trans>
                      </Text>
                    </Column>
                  )}
                </LineStackLayout>
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
                                {i18n.date(file.fileMetadata.lastModifiedDate)}
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
        </SectionContainer>
      )}
    </I18n>
  );
};
