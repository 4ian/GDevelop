// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { type StorageProvider, type SaveAsLocation } from '../ProjectsStorage';
import TextField from '../UI/TextField';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import IconButton from '../UI/IconButton';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import { Column, Line } from '../UI/Grid';
import { useOnlineStatus } from '../Utils/OnlineStatus';
import Refresh from '../UI/CustomSvgIcons/Refresh';
import { type GeneratedProject } from '../Utils/GDevelopServices/Generation';
import Text from '../UI/Text';
import generatePrompt from '../Utils/ProjectPromptGenerator';
import ProjectGeneratingDialog from './ProjectGeneratingDialog';
import RobotIcon from './RobotIcon';
import GetSubscriptionCard from '../Profile/Subscription/GetSubscriptionCard';
import { type NewProjectSetup } from './NewProjectSetupDialog';

type Props = {|
  onCreateFromAIGeneration: (
    generatedProject: GeneratedProject,
    newProjectSetup: NewProjectSetup
  ) => Promise<void>,
  isProjectOpening?: boolean,
  isGeneratingProject: boolean,
  storageProvider: StorageProvider,
  saveAsLocation: ?SaveAsLocation,
  generatingProjectId: ?string,
  onGenerationClosed: () => void,
  generationPrompt: string,
  onGenerationPromptChange: (generationPrompt: string) => void,
|};

const AIPromptField = ({
  onCreateFromAIGeneration,
  isProjectOpening,
  isGeneratingProject,
  storageProvider,
  saveAsLocation,
  generatingProjectId,
  onGenerationClosed,
  generationPrompt,
  onGenerationPromptChange,
}: Props): React.Node => {
  const { authenticated, limits } = React.useContext(AuthenticatedUserContext);
  const isOnline = useOnlineStatus();
  const generationCurrentUsage = limits
    ? limits.quotas['ai-project-generation']
    : null;
  const canGenerateProjectFromPrompt =
    generationCurrentUsage && !generationCurrentUsage.limitReached;
  const disabled = isProjectOpening || isGeneratingProject;

  return (
    <>
      <ColumnStackLayout noMargin expand>
        <LineStackLayout
          expand
          noMargin
          alignItems="center"
          justifyContent="center"
        >
          <RobotIcon />
          <TextField
            type="text"
            multiline
            maxLength={200}
            fullWidth
            disabled={
              disabled ||
              !authenticated ||
              !isOnline ||
              !canGenerateProjectFromPrompt
            }
            value={generationPrompt}
            onChange={(e, text) => onGenerationPromptChange(text)}
            floatingLabelText={<Trans>AI prompt</Trans>}
            floatingLabelFixed
            translatableHintText={
              !authenticated || !isOnline
                ? t`Log in to enter a prompt`
                : t`Type a prompt or generate one`
            }
            endAdornment={
              <IconButton
                size="small"
                onClick={() => onGenerationPromptChange(generatePrompt())}
                tooltip={t`Generate random prompt`}
                disabled={
                  disabled ||
                  !authenticated ||
                  !isOnline ||
                  !canGenerateProjectFromPrompt
                }
              >
                <Refresh />
              </IconButton>
            }
          />
        </LineStackLayout>
        {authenticated && !canGenerateProjectFromPrompt && (
          <GetSubscriptionCard subscriptionDialogOpeningReason="Generate project from prompt">
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
          onClose={onGenerationClosed}
        />
      )}
    </>
  );
};

export default AIPromptField;
