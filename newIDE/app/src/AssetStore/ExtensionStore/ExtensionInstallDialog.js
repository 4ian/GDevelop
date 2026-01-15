// @flow
import { t, Trans } from '@lingui/macro';
import React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import {
  type ExtensionShortHeader,
  type ExtensionHeader,
  type BehaviorShortHeader,
  type ObjectShortHeader,
  getExtensionHeader,
} from '../../Utils/GDevelopServices/Extension';
import {
  getBreakingChanges,
  formatOldBreakingChanges,
  formatBreakingChanges,
  isCompatibleWithGDevelopVersion,
} from '../../Utils/Extension/ExtensionCompatibilityChecker.js';
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
import Window from '../../Utils/Window';
import { useExtensionUpdate } from './UseExtensionUpdates';
import HelpButton from '../../UI/HelpButton';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { Accordion, AccordionHeader, AccordionBody } from '../../UI/Accordion';

export const useOutOfDateAlertDialog = () => {
  const { showConfirmation } = useAlertDialog();
  return async (): Promise<boolean> => {
    return await showConfirmation({
      title: t`Outdated extension`,
      message: t`The extension installed in this project is not up to date.
      Consider upgrading it before reporting any issue.`,
      confirmButtonLabel: t`Close`,
      dismissButtonLabel: t`Report anyway`,
    });
  };
};

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
  extensionShortHeader:
    | ExtensionShortHeader
    | BehaviorShortHeader
    | ObjectShortHeader,
  isInstalling: boolean,
  onClose: () => void,
  onInstall?: () => Promise<void>,
  onEdit?: () => void,
  project: gdProject,
|};

const ExtensionInstallDialog = ({
  extensionShortHeader,
  isInstalling,
  onClose,
  onInstall,
  onEdit,
  project,
}: Props) => {
  const isAlreadyInstalled: boolean = project.hasEventsFunctionsExtensionNamed(
    extensionShortHeader.name
  );

  const installedExtension = isAlreadyInstalled
    ? project.getEventsFunctionsExtension(extensionShortHeader.name)
    : null;

  const isFromStore = installedExtension
    ? installedExtension.getOriginName() === 'gdevelop-extension-store'
    : false;

  const newBreakingChangesText = installedExtension
    ? formatBreakingChanges(
        getBreakingChanges(
          installedExtension.getVersion(),
          extensionShortHeader
        )
      )
    : null;
  const oldBreakingChangesText = installedExtension
    ? formatOldBreakingChanges(
        installedExtension.getVersion(),
        extensionShortHeader
      )
    : null;

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

  const isCompatible = isCompatibleWithGDevelopVersion(
    getIDEVersion(),
    extensionShortHeader.gdevelopVersion
  );

  const canInstallExtension = !isInstalling && isCompatible;
  const onInstallExtension = React.useCallback(
    () => {
      if (canInstallExtension && onInstall) {
        if (isAlreadyInstalled) {
          let dialogText =
            'This extension is already in your project, this will install the latest version. You may have to do some adaptations to make sure your game still works. Do you want to continue?';
          if (!isFromStore)
            dialogText =
              'An other extension with the same name is already in your project. Installing this extension will overwrite your current extension. Do you want to continue?';

          const answer = Window.showConfirmDialog(dialogText);
          if (!answer) return;
          onInstall();
        } else {
          onInstall();
        }
      }
    },
    [onInstall, canInstallExtension, isAlreadyInstalled, isFromStore]
  );

  const showOutOfDateAlert = useOutOfDateAlertDialog();
  const onUserReportIssue = React.useCallback(
    async () => {
      if (extensionUpdate) {
        const shouldNotReportIssue = await showOutOfDateAlert();
        if (shouldNotReportIssue) {
          return;
        }
      }
      Window.openExternalURL(
        `https://github.com/GDevelopApp/GDevelop-extensions/issues/new` +
          `?assignees=&labels=&template=bug-report.yml&title=[${
            extensionShortHeader.name
          }] Issue short description`
      );
    },
    [extensionShortHeader.name, extensionUpdate, showOutOfDateAlert]
  );

  return (
    <Dialog
      title={extensionShortHeader.fullName}
      id="install-extension-dialog"
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Back</Trans>}
          primary={false}
          onClick={onClose}
          disabled={isInstalling}
        />,
        onInstall ? (
          <LeftLoader isLoading={isInstalling} key="install">
            <DialogPrimaryButton
              id="install-extension-button"
              label={
                !isCompatible ? (
                  <Trans>Not compatible</Trans>
                ) : isAlreadyInstalled ? (
                  isFromStore ? (
                    extensionUpdate &&
                    installedExtension &&
                    extensionShortHeader.version !==
                      installedExtension.getVersion() ? (
                      extensionShortHeader.tier === 'experimental' ? (
                        <Trans>Update (could break the project)</Trans>
                      ) : (
                        <Trans>Update</Trans>
                      )
                    ) : (
                      <Trans>Re-install</Trans>
                    )
                  ) : (
                    <Trans>Replace existing extension</Trans>
                  )
                ) : (
                  <Trans>Install in project</Trans>
                )
              }
              primary
              onClick={onInstallExtension}
              disabled={!canInstallExtension}
            />
          </LeftLoader>
        ) : null,
      ]}
      secondaryActions={[
        onEdit ? (
          <FlatButton
            key="edit-extension"
            label={<Trans>Open in editor</Trans>}
            onClick={onEdit}
          />
        ) : (
          undefined
        ),
        isAlreadyInstalled ? (
          <FlatButton
            key="report-extension"
            label={<Trans>Report an issue</Trans>}
            onClick={() => onUserReportIssue()}
          />
        ) : (
          undefined
        ),
        extensionHeader && extensionHeader.helpPath ? (
          <HelpButton
            key="help-button"
            helpPagePath={extensionHeader.helpPath}
          />
        ) : (
          undefined
        ),
      ].filter(Boolean)}
      open
      cannotBeDismissed={isInstalling}
      onRequestClose={onClose}
      onApply={onInstall ? onInstallExtension : onClose}
    >
      <ColumnStackLayout expand noMargin>
        <Line alignItems="flex-start" noMargin>
          <IconContainer
            alt={extensionShortHeader.fullName}
            src={extensionShortHeader.previewIconUrl}
            size={64}
          />
          <Column expand>
            <Text noMargin size="body2">
              {extensionUpdate &&
              installedExtension &&
              extensionShortHeader.version !==
                installedExtension.getVersion() ? (
                <Trans>{`Version ${installedExtension.getVersion()} (${
                  extensionShortHeader.version
                } available)`}</Trans>
              ) : (
                <Trans>{`Version ${extensionShortHeader.version}`}</Trans>
              )}
            </Text>
            <Line>
              <div style={{ flexWrap: 'wrap' }}>
                {extensionShortHeader.authors &&
                  extensionShortHeader.authors.map(author => (
                    <UserPublicProfileChip
                      user={author}
                      key={author.id}
                      isClickable
                    />
                  ))}
              </div>
            </Line>
          </Column>
        </Line>
        <Text noMargin>
          {extensionHeader
            ? extensionHeader.shortDescription
            : typeof extensionShortHeader.shortDescription === 'string'
            ? extensionShortHeader.shortDescription || ''
            : ''}
        </Text>
        <Divider />
        {extensionHeader && (
          <MarkdownText
            source={getTransformedDescription(extensionHeader)}
            isStandaloneText
          />
        )}
        {extensionShortHeader.tier === 'experimental' && (
          <AlertMessage kind="warning">
            <Trans>
              This is an extension made by a community member and it only got
              through a light review by the GDevelop extension team. As such, we
              can't guarantee it meets all the quality standards of fully
              reviewed extensions.
            </Trans>
          </AlertMessage>
        )}
        {!isCompatible && (
          <AlertMessage kind="error">
            <Trans>
              Unfortunately, this extension requires a newer version of GDevelop
              to work. Update GDevelop to be able to use this extension in your
              project.
            </Trans>
          </AlertMessage>
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
        {newBreakingChangesText && (
          <>
            <Text size="sub-title">
              <Trans>Breaking changes</Trans>
            </Text>
            <MarkdownText source={newBreakingChangesText} isStandaloneText />
          </>
        )}
        {oldBreakingChangesText && (
          <Accordion noMargin>
            <AccordionHeader noMargin>
              <Text size="sub-title">
                <Trans>Previous breaking changes (no longer relevant)</Trans>
              </Text>
            </AccordionHeader>
            <AccordionBody disableGutters>
              <MarkdownText source={oldBreakingChangesText} isStandaloneText />
            </AccordionBody>
          </Accordion>
        )}
      </ColumnStackLayout>
    </Dialog>
  );
};

export default ExtensionInstallDialog;
