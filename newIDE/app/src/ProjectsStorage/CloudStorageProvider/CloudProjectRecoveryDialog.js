// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import AlertMessage from '../../UI/AlertMessage';
import CircularProgress from '../../UI/CircularProgress';
import Dialog from '../../UI/Dialog';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import {
  getLastVersionsOfProject,
  isCloudProjectVersionSane,
  type CloudProjectVersion,
} from '../../Utils/GDevelopServices/Project';

type Props = {|
  cloudProjectId: string,
  onOpenPreviousVersion: (versionId: string) => void,
  onClose: () => void,
|};

const CloudProjectRecoveryDialog = ({ cloudProjectId, onClose }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const [
    lastSaneVersion,
    setLastSaneVersion,
  ] = React.useState<?CloudProjectVersion>(null);
  const [isErrored, setIsErrored] = React.useState<boolean>(false);
  const [
    saneVersionHasNotBeenFound,
    setSaneVersionHasNotBeenFound,
  ] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(
    () => {
      const getVersions = async () => {
        try {
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
        } catch (error) {
          setIsErrored(true);
        } finally {
          setIsLoading(false);
        }
      };

      getVersions();
    },
    [cloudProjectId, authenticatedUser]
  );

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
          title={
            lastSaneVersion ? (
              <Trans>A functioning save has been found!</Trans>
            ) : (
              <Trans>An issue was found on this project</Trans>
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
                    <Trans>
                      The latest save of{' '}
                      {cloudProjectName ? (
                        `"${cloudProjectName}"`
                      ) : (
                        <Trans>this project</Trans>
                      )}{' '}
                      is corrupted and cannot be opened.
                    </Trans>
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
                      Please get in touch with us to find a solution.{' '}
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
                      The latest save of{' '}
                      {cloudProjectName ? (
                        `"${cloudProjectName}"`
                      ) : (
                        <Trans>this project</Trans>
                      )}{' '}
                      is corrupted and cannot be opened.
                    </Trans>
                  </Text>
                  <Text noMargin>
                    <Trans>
                      However, we have found a non-corrupted save from{' '}
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
                    Would you like to open the non-corrupted version instead?
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
