// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import ListItem from '@material-ui/core/ListItem';

import Text from '../../../../UI/Text';
import { Line, Column, Spacer } from '../../../../UI/Grid';
import { LineStackLayout } from '../../../../UI/Layout';
import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import CircularProgress from '../../../../UI/CircularProgress';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '../../../../UI/IconButton';
import ThreeDotsMenu from '../../../../UI/CustomSvgIcons/ThreeDotsMenu';
import {
  useLongTouch,
  type ClientCoordinates,
} from '../../../../Utils/UseLongTouch';
import {
  getStorageProviderByInternalName,
  type LastModifiedInfo,
} from './utils';
import { type FileMetadata } from '../../../../ProjectsStorage';
import LastModificationInfo from './LastModificationInfo';

const styles = {
  listItem: {
    padding: 0,
    borderRadius: 8,
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices.
  },
  projectSkeleton: { borderRadius: 6 },
  noProjectsContainer: { padding: 10 },
  mobileIconContainer: {
    marginTop: 4, // To align with project title.
  },
};

const PrettyBreakablePath = ({ path }: {| path: string |}) => {
  const separatorIndices = Array.from(path)
    .map((char, index) => (['/', '\\'].includes(char) ? index : null))
    .filter(Boolean);
  if (separatorIndices.length === 0) return path;

  return separatorIndices.reduce((acc, separatorIndex, listIndex) => {
    const nextSeparatorIndex = separatorIndices[listIndex + 1];
    return [
      ...acc,
      <wbr key={separatorIndex} />,
      path.substring(separatorIndex, nextSeparatorIndex || path.length),
    ];
  }, []);
};

type ProjectFileListItemProps = {|
  file: FileMetadataAndStorageProviderName,
  currentFileMetadata: ?FileMetadata,
  lastModifiedInfo?: LastModifiedInfo | null,
  storageProviders: Array<StorageProvider>,
  onOpenProject: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  isWindowSizeMediumOrLarger: boolean,
  disabled: boolean,
  isLoading: boolean,
  onOpenContextMenu: (
    event: ClientCoordinates,
    file: FileMetadataAndStorageProviderName
  ) => void,
|};

export const ProjectFileListItem = ({
  file,
  currentFileMetadata,
  lastModifiedInfo, // If null, the project has been modified last by the current user.
  storageProviders,
  onOpenProject,
  isWindowSizeMediumOrLarger,
  disabled,
  isLoading,
  onOpenContextMenu,
}: ProjectFileListItemProps) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const storageProvider = getStorageProviderByInternalName(
    storageProviders,
    file.storageProviderName
  );

  const onWillOpenContextMenu = React.useCallback(
    (event: ClientCoordinates, file: FileMetadataAndStorageProviderName) => {
      if (disabled) return;
      onOpenContextMenu(event, file);
    },
    [disabled, onOpenContextMenu]
  );

  const longTouchForContextMenuProps = useLongTouch(
    React.useCallback(
      event => {
        onWillOpenContextMenu(event, file);
      },
      [onWillOpenContextMenu, file]
    )
  );
  return (
    <I18n>
      {({ i18n }) => (
        <>
          <ListItem
            button
            key={file.fileMetadata.fileIdentifier}
            onClick={() => {
              if (disabled) return;
              onOpenProject(file);
            }}
            style={styles.listItem}
            onContextMenu={event => onWillOpenContextMenu(event, file)}
            {...longTouchForContextMenuProps}
          >
            {isWindowSizeMediumOrLarger ? (
              <LineStackLayout justifyContent="flex-start" expand>
                <Column expand>
                  <Line noMargin alignItems="center">
                    {storageProvider && storageProvider.renderIcon && (
                      <>
                        {storageProvider.renderIcon({
                          size: 'small',
                        })}
                        <Spacer />
                      </>
                    )}
                    <Text noMargin>
                      {file.fileMetadata.name || (
                        <PrettyBreakablePath
                          path={file.fileMetadata.fileIdentifier}
                        />
                      )}
                    </Text>

                    {isLoading && (
                      <>
                        <Spacer />
                        <CircularProgress size={16} />
                      </>
                    )}
                  </Line>
                </Column>
                <Column expand>
                  <Text noMargin>
                    {storageProvider ? i18n._(storageProvider.name) : ''}
                  </Text>
                </Column>
                <Column expand>
                  <LastModificationInfo
                    file={file}
                    lastModifiedInfo={lastModifiedInfo}
                    storageProvider={storageProvider}
                    authenticatedUser={authenticatedUser}
                    currentFileMetadata={currentFileMetadata}
                  />
                </Column>
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    edge="end"
                    aria-label="menu"
                    onClick={event => {
                      // prevent triggering the click on the list item.
                      event.stopPropagation();
                      onWillOpenContextMenu(event, file);
                    }}
                  >
                    <ThreeDotsMenu />
                  </IconButton>
                </ListItemSecondaryAction>
              </LineStackLayout>
            ) : (
              <Column expand>
                <LineStackLayout alignItems="start">
                  {storageProvider && storageProvider.renderIcon && (
                    <Column noMargin>
                      <div style={styles.mobileIconContainer}>
                        {storageProvider.renderIcon({
                          size: 'small',
                        })}
                      </div>
                    </Column>
                  )}
                  <Column noMargin>
                    <Text noMargin>
                      {file.fileMetadata.name || (
                        <PrettyBreakablePath
                          path={file.fileMetadata.fileIdentifier}
                        />
                      )}
                    </Text>
                    <LastModificationInfo
                      file={file}
                      lastModifiedInfo={lastModifiedInfo}
                      storageProvider={storageProvider}
                      authenticatedUser={authenticatedUser}
                      currentFileMetadata={currentFileMetadata}
                      textColor="secondary"
                    />
                  </Column>
                  {isLoading && <CircularProgress size={24} />}
                </LineStackLayout>
              </Column>
            )}
          </ListItem>
        </>
      )}
    </I18n>
  );
};

export default ProjectFileListItem;
