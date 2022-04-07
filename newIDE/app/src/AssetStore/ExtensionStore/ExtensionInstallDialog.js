// @flow
import { Trans, t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import {
  type ExtensionShortHeader,
  type ExtensionHeader,
  getExtensionHeader,
  isCompatibleWithExtension,
} from '../../Utils/GDevelopServices/Extension';
import LeftLoader from '../../UI/LeftLoader';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import PlaceholderError from '../../UI/PlaceholderError';
import { MarkdownText } from '../../UI/MarkdownText';
import Text from '../../UI/Text';
import AlertMessage from '../../UI/AlertMessage';
import { getIDEVersion } from '../../Version';
import { Column, Line } from '../../UI/Grid';
import { Divider } from '@material-ui/core';
import { ColumnStackLayout } from '../../UI/Layout';
import { IconContainer } from '../../UI/IconContainer';
import { UserPublicProfileChip } from '../../UI/User/UserPublicProfileChip';
import RaisedButton from '../../UI/RaisedButton';
import Window from '../../Utils/Window';
import { useExtensionUpdate } from './UseExtensionUpdates';

const getTransformedDescription = (extensionHeader: ExtensionHeader) => {
  if (
    extensionHeader.description.substr(
      0,
      extensionHeader.shortDescription.length
    ) === extensionHeader.shortDescription
  ) {
    return extensionHeader.description.substr(
      extensionHeader.shortDescription.length
    );
  }

  return extensionHeader.description;
};

type Props = {|
  extensionShortHeader: ExtensionShortHeader,
  isInstalling: boolean,
  onClose: () => void,
  onInstall: () => Promise<void>,
  onEdit?: () => void,
  project: gdProject,
  i18n: I18nType,
|};

const ExtensionInstallDialog = ({
  extensionShortHeader,
  isInstalling,
  onClose,
  onInstall,
  onEdit,
  project,
  i18n,
}: Props) => {
  const alreadyInstalled = project.hasEventsFunctionsExtensionNamed(
    extensionShortHeader.name
  );
  const extensionUpdate = useExtensionUpdate(project, extensionShortHeader);

  const [error, setError] = React.useState<?Error>(null);
  const [
    extensionHeader,
    setExtensionHeader,
  ] = React.useState<?ExtensionHeader>(null);

  const loadExtensionheader = React.useCallback(
    () => {
      setError(null);
      getExtensionHeader(extensionShortHeader).then(
        extensionHeader => {
          setExtensionHeader(extensionHeader);
        },
        error => {
          setError(error);
        }
      );
    },
    [extensionShortHeader]
  );

  React.useEffect(() => loadExtensionheader(), [loadExtensionheader]);

  const isCompatible = isCompatibleWithExtension(
    getIDEVersion(),
    extensionShortHeader
  );

  const canInstallExtension = !isInstalling && isCompatible;
  const onInstallExtension = React.useCallback(
    () => {
      if (canInstallExtension) {
        if (extensionUpdate) {
          if (extensionUpdate.type === 'major') {
            const answer = Window.showConfirmDialog(
              i18n._(
                t`This extension update contains a breaking change. You will have to do some adaptations to make sure your game still works. We advise to back up your game before proceeding. Do you want to continue?`
              )
            );
            if (!answer) return;
          }

          if (extensionUpdate.type === 'unknown') {
            const answer = Window.showConfirmDialog(
              i18n._(
                t`The latest version will be installed, but it isn't indicated whether this update includes breaking changes. You may have to do some adaptations to make sure your game still works. We advise to back up your game before proceeding. Do you want to continue?`
              )
            );
            if (!answer) return;
          }
        }
        onInstall();
      }
    },
    [onInstall, canInstallExtension, extensionUpdate, i18n]
  );

  return (
    <Dialog
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Back</Trans>}
          primary={false}
          onClick={onClose}
          disabled={isInstalling}
        />,

        <LeftLoader isLoading={isInstalling} key="install">
          <RaisedButton
            label={
              !isCompatible ? (
                <Trans>Not compatible</Trans>
              ) : alreadyInstalled ? (
                extensionUpdate ? (
                  <Trans>Update</Trans>
                ) : (
                  <Trans>Re-install</Trans>
                )
              ) : (
                <Trans>Install in project</Trans>
              )
            }
            primary
            onClick={onInstallExtension}
            disabled={!canInstallExtension}
          />
        </LeftLoader>,
      ]}
      secondaryActions={
        onEdit
          ? [
              <FlatButton
                key="edit-extension"
                label={<Trans>Open in editor</Trans>}
                onClick={onEdit}
              />,
            ]
          : undefined
      }
      cannotBeDismissed={false}
      open
      onRequestClose={onClose}
    >
      <ColumnStackLayout expand noMargin>
        {!isCompatible && (
          <AlertMessage kind="error">
            <Trans>
              Unfortunately, this extension requires a newer version of GDevelop
              to work. Update GDevelop to be able to use this extension in your
              project.
            </Trans>
          </AlertMessage>
        )}
        <Line alignItems="center" noMargin>
          <IconContainer
            alt={extensionShortHeader.fullName}
            src={extensionShortHeader.previewIconUrl}
            size={64}
          />
          <Column expand>
            <Text noMargin size="title">
              {extensionShortHeader.fullName}
            </Text>
            <Text noMargin size="body2">
              <Trans>Version {' ' + extensionShortHeader.version}</Trans>
            </Text>
            <Line>
              {extensionShortHeader.authors &&
                extensionShortHeader.authors.map(author => (
                  <UserPublicProfileChip
                    user={author}
                    key={author.id}
                    isClickable
                  />
                ))}
            </Line>
          </Column>
        </Line>
        <Text noMargin>{extensionShortHeader.shortDescription}</Text>
        <Divider />
        {extensionHeader && (
          <MarkdownText
            source={getTransformedDescription(extensionHeader)}
            isStandaloneText
          />
        )}
        {!extensionHeader && !error && <PlaceholderLoader />}
        {!extensionHeader && error && (
          <PlaceholderError onRetry={loadExtensionheader}>
            <Trans>
              Can't load the extension registry. Verify your internet connection
              or try again later.
            </Trans>
          </PlaceholderError>
        )}
      </ColumnStackLayout>
    </Dialog>
  );
};

export default ExtensionInstallDialog;
