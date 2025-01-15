// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { type StorageProvider, type SaveAsLocation } from '../ProjectsStorage';
import TextField from '../UI/TextField';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import IconButton from '../UI/IconButton';
import {
  ColumnStackLayout,
  LineStackLayout,
  TextFieldWithButtonLayout,
} from '../UI/Layout';
import { Column, Line } from '../UI/Grid';
import { useOnlineStatus } from '../Utils/OnlineStatus';
import Refresh from '../UI/CustomSvgIcons/Refresh';
import {
  createGeneratedProject,
  type GeneratedProject,
} from '../Utils/GDevelopServices/Generation';
import Text from '../UI/Text';
import generatePrompt from '../Utils/ProjectPromptGenerator';
import ProjectGeneratingDialog from './ProjectGeneratingDialog';
import RobotIcon from './RobotIcon';
import GetSubscriptionCard from '../Profile/Subscription/GetSubscriptionCard';
import {
  generateProjectName,
  type NewProjectSetup,
} from './NewProjectSetupDialog';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import RaisedButton from '../UI/RaisedButton';

type Props = {|
  onCreateFromAIGeneration: (
    generatedProject: GeneratedProject,
    newProjectSetup: NewProjectSetup
  ) => Promise<void>,
  isProjectOpening?: boolean,
  isGeneratingProject: boolean,
  storageProvider: StorageProvider,
  saveAsLocation: ?SaveAsLocation,
  onGenerationStarted: () => void,
  onGenerationEnded: () => void,
|};

const AIPromptField = ({
  onCreateFromAIGeneration,
  isProjectOpening,
  isGeneratingProject,
  storageProvider,
  saveAsLocation,
  onGenerationStarted,
  onGenerationEnded,
}: Props): React.Node => {
  const [generationPrompt, setGenerationPrompt] = React.useState<string>('');
  const {
    authenticated,
    limits,
    profile,
    getAuthorizationHeader,
    onRefreshLimits,
  } = React.useContext(AuthenticatedUserContext);
  const isOnline = useOnlineStatus();
  const generationCurrentUsage = limits
    ? limits.quotas['ai-project-generation']
    : null;
  const hasUsagesAvailable =
    generationCurrentUsage && !generationCurrentUsage.limitReached;
  const disabled =
    isProjectOpening ||
    isGeneratingProject ||
    !authenticated ||
    !isOnline ||
    !hasUsagesAvailable;
  const { showAlert } = useAlertDialog();
  const [generatingProjectId, setGeneratingProjectId] = React.useState<?string>(
    null
  );
  const generateProject = React.useCallback(
    async () => {
      if (disabled || !profile) return;

      onGenerationStarted();
      try {
        const generatedProject = await createGeneratedProject(
          getAuthorizationHeader,
          {
            userId: profile.id,
            prompt: generationPrompt,
            width: 1280, // This will be overriden by the AI service.
            height: 720, // This will be overriden by the AI service.
            projectName: generateProjectName(),
          }
        );
        setGeneratingProjectId(generatedProject.id);
      } catch (error) {
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (
          extractedStatusAndCode &&
          extractedStatusAndCode.code === 'project-generation/quota-exceeded'
        ) {
          setGenerationPrompt('');
          // Fetch the limits again to show the warning about quota.
          await onRefreshLimits();
        } else {
          showAlert({
            title: t`Unable to generate project`,
            message: t`Looks like the AI service is not available. Please try again later or create a project without a prompt.`,
          });
        }
        setGeneratingProjectId(null);
        onGenerationEnded();
      }
    },
    [
      disabled,
      getAuthorizationHeader,
      generationPrompt,
      profile,
      showAlert,
      onRefreshLimits,
      onGenerationStarted,
      onGenerationEnded,
    ]
  );

  return (
    <>
      <ColumnStackLayout noMargin expand>
        <TextFieldWithButtonLayout
          margin="none"
          renderTextField={() => (
            <LineStackLayout
              expand
              noMargin
              alignItems="center"
              justifyContent="center"
            >
              <RobotIcon />
              <TextField
                type="text"
                maxLength={200}
                fullWidth
                disabled={disabled}
                value={generationPrompt}
                onChange={(e, text) => setGenerationPrompt(text)}
                floatingLabelText={<Trans>Type a prompt</Trans>}
                floatingLabelFixed
                translatableHintText={
                  !authenticated || !isOnline
                    ? t`Log in to enter a prompt`
                    : t`Type a prompt or generate one`
                }
                endAdornment={
                  <IconButton
                    size="small"
                    onClick={() => setGenerationPrompt(generatePrompt())}
                    tooltip={t`Generate random prompt`}
                    disabled={disabled}
                  >
                    <Refresh />
                  </IconButton>
                }
              />
            </LineStackLayout>
          )}
          renderButton={style => (
            <RaisedButton
              primary
              label={<Trans>Create game</Trans>}
              onClick={generateProject}
              disabled={disabled || !generationPrompt}
              style={style}
            />
          )}
        />
        {authenticated && !hasUsagesAvailable && (
          <GetSubscriptionCard
            subscriptionDialogOpeningReason="Generate project from prompt"
            recommendedPlanIdIfNoSubscription="gdevelop_silver"
          >
            <Line>
              <Column noMargin>
                <Text noMargin>
                  <Trans>
                    You've used all your daily pre-made AI scenes! Generate as
                    many as you want with a subscription.
                  </Trans>
                </Text>
              </Column>
            </Line>
          </GetSubscriptionCard>
        )}
      </ColumnStackLayout>
      {isGeneratingProject && generatingProjectId && (
        <ProjectGeneratingDialog
          generatingProjectId={generatingProjectId}
          storageProvider={storageProvider}
          saveAsLocation={saveAsLocation}
          onCreate={onCreateFromAIGeneration}
          onClose={() => {
            setGeneratingProjectId(null);
            onGenerationEnded();
          }}
        />
      )}
    </>
  );
};

export default AIPromptField;
