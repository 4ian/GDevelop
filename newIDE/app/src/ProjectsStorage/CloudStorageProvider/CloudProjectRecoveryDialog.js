// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import AlertMessage from '../../UI/AlertMessage';
import CircularProgress from '../../UI/CircularProgress';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import {
  getLastVersionsOfProject,
  isCloudProjectVersionSane,
  type ExpandedCloudProjectVersion,
} from '../../Utils/GDevelopServices/Project';
import FlatButton from '../../UI/FlatButton';
import { sendCloudProjectCouldNotBeOpened } from '../../Utils/Analytics/EventSender';

const DELAY_TO_READ_DIALOG_IN_MS = 15000;

type Props = {|
  cloudProjectId: string,
  onOpenPreviousVersion: (versionId: string) => void,
  onClose: () => void,
|};

const CloudProjectRecoveryDialog = ({
  cloudProjectId,
  onClose,
  onOpenPreviousVersion,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile } = authenticatedUser;
  const [
    lastSaneVersion,
    setLastSaneVersion,
  ] = React.useState<?ExpandedCloudProjectVersion>(null);
  const [isErrored, setIsErrored] = React.useState<boolean>(false);
  const [
    saneVersionHasNotBeenFound,
    setSaneVersionHasNotBeenFound,
  ] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(
    () => {
      if (cloudProjectId && profile && profile.id) {
        sendCloudProjectCouldNotBeOpened({
          cloudProjectId,
          userId: profile.id,
        });
      }
    },
    [cloudProjectId, profile]
  );

  React.useEffect(
    () => {
      const getVersions = async () => {
        const lastVersions = await getLastVersionsOfProject(
          authenticatedUser,
          cloudProjectId
        );
        if (!lastVersions) {
          throw new Error("We couldn't get the project last versions.");
        }
        for (
          let versionIndex = 1; // The first version is the current one
          versionIndex < lastVersions.length;
          versionIndex++
        ) {
          const version = lastVersions[versionIndex];
          const isSane = await isCloudProjectVersionSane(
            authenticatedUser,
            cloudProjectId,
            version.id
          );
          if (isSane) {
            setLastSaneVersion(version);
            return;
          }
        }
        setSaneVersionHasNotBeenFound(true);
      };

      let timeoutId;
      const setDelay = (delayInMs: number) =>
        new Promise(resolve => {
          timeoutId = setTimeout(() => {
            resolve();
          }, delayInMs);
          return;
        });

      const getVersionsAndWait = async () => {
        try {
          // Give time to user to read the content of the dialog.
          await Promise.all([
            getVersions(),
            setDelay(DELAY_TO_READ_DIALOG_IN_MS),
          ]);
        } catch (error) {
          setIsErrored(true);
        } finally {
          setIsLoading(false);
        }
      };
      getVersionsAndWait();
      return () => clearTimeout(timeoutId);
    },
    [cloudProjectId, authenticatedUser]
  );

  const actions =
    isErrored || saneVersionHasNotBeenFound
      ? [
          <DialogPrimaryButton
            key="close"
            label={<Trans>Close</Trans>}
            onClick={onClose}
          />,
        ]
      : isLoading
      ? []
      : lastSaneVersion
      ? [
          <FlatButton
            key="cancel"
            label={<Trans>Cancel</Trans>}
            onClick={onClose}
          />,
          <DialogPrimaryButton
            primary
            key="restore"
            label={<Trans>Accept</Trans>}
            onClick={() => onOpenPreviousVersion(lastSaneVersion.id)}
          />,
        ]
      : [];

  const onApply =
    isErrored || saneVersionHasNotBeenFound
      ? onClose
      : isLoading
      ? undefined
      : lastSaneVersion
      ? () => onOpenPreviousVersion(lastSaneVersion.id)
      : undefined;

  const cloudProject = authenticatedUser.cloudProjects
    ? authenticatedUser.cloudProjects.find(
        project => project.id === cloudProjectId
      )
    : null;
  const cloudProjectName = cloudProject ? cloudProject.name : null;

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          open
          flexColumnBody
          maxWidth="sm"
          onRequestClose={onClose}
          onApply={onApply}
          actions={actions}
          title={
            lastSaneVersion && !isLoading ? (
              <Trans>A functioning save has been found!</Trans>
            ) : (
              <Trans>This file is corrupt</Trans>
            )
          }
        >
          {isErrored ? (
            <AlertMessage kind="error">
              <Trans>
                An error occurred while trying to recover your project last
                versions. Please try again later.
              </Trans>
            </AlertMessage>
          ) : isLoading ? (
            <>
              <Line>
                <Column noMargin>
                  <Text noMargin>
                    {cloudProjectName ? (
                      <Trans>
                        The latest save of "{cloudProjectName}" is corrupt and
                        cannot be opened.
                      </Trans>
                    ) : (
                      <Trans>
                        The latest save of this project is corrupt and cannot be
                        opened.
                      </Trans>
                    )}
                  </Text>
                  <Text noMargin>
                    <Trans>
                      Please wait while we scan your project to find a solution.
                    </Trans>
                  </Text>
                </Column>
              </Line>
              <Line justifyContent="center">
                <CircularProgress />
              </Line>
            </>
          ) : saneVersionHasNotBeenFound ? (
            <>
              <Line>
                <Column noMargin>
                  <Text noMargin>
                    <Trans>We couldn't find a version to go back to.</Trans>
                  </Text>
                  <Text noMargin>
                    <Trans>
                      Please get in touch with us to find a solution.
                    </Trans>
                  </Text>
                </Column>
              </Line>
            </>
          ) : lastSaneVersion ? (
            <>
              <Line>
                <Column noMargin>
                  <Text noMargin>
                    <Trans>
                      We have found a non-corrupt save from{' '}
                      {i18n.date(lastSaneVersion.createdAt, {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}{' '}
                      available for modification.
                    </Trans>
                  </Text>
                </Column>
              </Line>
              <Line>
                <Text>
                  <Trans>
                    Would you like to open the non-corrupt version instead?
                  </Trans>
                </Text>
              </Line>
            </>
          ) : null}
        </Dialog>
      )}
    </I18n>
  );
};

export default CloudProjectRecoveryDialog;
