// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type StorageProvider, type SaveAsLocation } from '../ProjectsStorage';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { type NewProjectSetup } from './NewProjectSetupDialog';
import { ColumnStackLayout } from '../UI/Layout';
import { LargeSpacer } from '../UI/Grid';
import {
  getGeneratedProject,
  type GeneratedProject,
} from '../Utils/GDevelopServices/Generation';
import { useInterval } from '../Utils/UseInterval';
import Text from '../UI/Text';
import ErrorFilled from '../UI/CustomSvgIcons/ErrorFilled';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import RaisedButton from '../UI/RaisedButton';
import RobotIcon from './RobotIcon';

type Props = {|
  onClose: () => void,
  onCreate: (
    generatedProject: GeneratedProject,
    projectSetup: NewProjectSetup
  ) => Promise<void>,
  storageProvider: StorageProvider,
  saveAsLocation: ?SaveAsLocation,
  generatingProjectId: ?string,
|};

const loadingMessages = [
  <Trans>Talking to the AI... beep boop beep boop...</Trans>,
  <Trans>
    The AI has accepted your request. It is now thinking about the best way to
    create your game...
  </Trans>,
  <Trans>It is now choosing objects from the asset store...</Trans>,
  <Trans>It is now placing everything in the scene...</Trans>,
  <Trans>Almost done...</Trans>,
];
const loadingMessagesInterval = 5;
const timeBeforeShowingError = 35;

const ProjectGeneratingDialog = ({
  generatingProjectId,
  storageProvider,
  saveAsLocation,
  onClose,
  onCreate,
}: Props): React.Node => {
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [isErrored, setIsErrored] = React.useState<boolean>(false);
  const [isReady, setIsReady] = React.useState<boolean>(false);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [loadingMessageIndex, setLoadingMessageIndex] = React.useState(0);
  const [overallLoadingTime, setOverallLoadingTime] = React.useState(0);

  const updateLoadingMessage = React.useCallback(
    () => {
      setOverallLoadingTime(overallLoadingTime + loadingMessagesInterval);
      if (loadingMessageIndex >= loadingMessages.length - 1) return;
      setLoadingMessageIndex(loadingMessageIndex + 1);
    },
    [loadingMessageIndex, setLoadingMessageIndex, overallLoadingTime]
  );

  useInterval(updateLoadingMessage, loadingMessagesInterval * 1000);

  const hasProbablyTimedOut = overallLoadingTime > timeBeforeShowingError;

  const updateGeneratingProject = React.useCallback(
    async () => {
      if (!generatingProjectId || !profile) return;

      try {
        const generatedProject = await getGeneratedProject(
          getAuthorizationHeader,
          {
            generatedProjectId: generatingProjectId,
            userId: profile.id,
          }
        );
        if (generatedProject.status === 'ready') {
          setIsReady(true);
          if (!generatedProject.fileUrl) {
            throw new Error('Generated project has no fileUrl');
          }
          await onCreate(generatedProject, {
            // We only update the project name, the rest is handled by the template.
            projectName: generatedProject.projectName,
            storageProvider,
            saveAsLocation,
          });
        } else if (generatedProject.status === 'error') {
          throw new Error('Generated project has an error');
        }
      } catch (err) {
        console.error(err);
        setIsErrored(true);
      }
    },
    [
      generatingProjectId,
      getAuthorizationHeader,
      profile,
      onCreate,
      saveAsLocation,
      storageProvider,
    ]
  );

  const shouldUpdateProject = !isReady && !isErrored && generatingProjectId;

  // Takes in average 20 seconds, so we check every 3 seconds.
  useInterval(
    () => {
      updateGeneratingProject();
    },
    shouldUpdateProject ? 3000 : null
  );

  return (
    <Dialog
      open
      title={null} // Don't display the title when generating a project, we handle it inside the dialog
      id="project-generating-dialog"
      maxWidth="sm"
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onClose}
        />,
      ]}
      cannotBeDismissed
      onRequestClose={onClose}
    >
      {isErrored ? (
        <ColumnStackLayout noMargin alignItems="center">
          <Text size="section-title" align="center">
            <Trans>Oh. We lost contact with the AI.</Trans>
          </Text>
          <ErrorFilled
            style={{
              color: gdevelopTheme.message.error,
              width: 40,
              height: 40,
            }}
          />
          <Text size="sub-title" align="center">
            <Trans>It's probably tired.</Trans>
          </Text>
          <Text size="sub-title" align="center">
            <Trans>Try making your prompt more specific.</Trans>
          </Text>
          <RaisedButton
            label={<Trans>Try again</Trans>}
            primary
            onClick={onClose}
          />
        </ColumnStackLayout>
      ) : (
        <ColumnStackLayout noMargin alignItems="center">
          <Text size="section-title" align="center">
            <Trans>Creating new project</Trans>
          </Text>
          <LargeSpacer />
          <RobotIcon rotating />
          <Text size="sub-title" align="center">
            {hasProbablyTimedOut ? (
              <Trans>
                This is taking longer than expected... We might have lost
                contact with the AI.
              </Trans>
            ) : (
              loadingMessages[loadingMessageIndex]
            )}
          </Text>
          {hasProbablyTimedOut && (
            <>
              <Text size="sub-title" align="center">
                <Trans>
                  You can wait a bit more, or try refining your prompt.
                </Trans>
              </Text>
              <RaisedButton
                label={<Trans>Try again</Trans>}
                primary
                onClick={onClose}
              />
            </>
          )}
        </ColumnStackLayout>
      )}
    </Dialog>
  );
};

export default ProjectGeneratingDialog;
