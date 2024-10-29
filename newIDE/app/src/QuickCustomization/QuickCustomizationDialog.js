// @flow
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { renderQuickCustomization, useQuickCustomizationState } from '.';
import { Trans } from '@lingui/macro';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import FlatButton from '../UI/FlatButton';
import { ColumnStackLayout } from '../UI/Layout';
import { type Exporter } from '../ExportAndShare/ShareDialog';
import { useGameAndBuildsManager } from '../Utils/UseGameAndBuildsManager';
import { sendQuickCustomizationProgress } from '../Utils/Analytics/EventSender';
import ScrollView from '../UI/ScrollView';
import PreviewLine from './PreviewLine';
import UnsavedChangesContext from '../MainFrame/UnsavedChangesContext';

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  onLaunchPreview: () => Promise<void>,
  onClose: () => Promise<void>,
  onlineWebExporter: Exporter,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  /**
   * Should return true if the project will be saved as a new cloud project,
   * false otherwise (i.e: if the project is *already saved* as a cloud project,
   * and so there are no risks, notably, to get beyond the limit of cloud projects).
   */
  isRequiredToSaveAsNewCloudProject: () => boolean,
  canClose: boolean,
  sourceGameId: string,
  gameScreenshotUrls: Array<string>,
  onScreenshotsClaimed: () => void,
|};

export const QuickCustomizationDialog = ({
  project,
  resourceManagementProps,
  onLaunchPreview,
  onClose,
  onlineWebExporter,
  onSaveProject,
  isSavingProject,
  isRequiredToSaveAsNewCloudProject,
  canClose,
  sourceGameId,
  gameScreenshotUrls,
  onScreenshotsClaimed,
}: Props) => {
  const { triggerUnsavedChanges } = React.useContext(UnsavedChangesContext);
  const gameAndBuildsManager = useGameAndBuildsManager({
    project,
    copyLeaderboardsAndMultiplayerLobbiesFromGameId: sourceGameId,
  });
  const quickCustomizationState = useQuickCustomizationState({ onClose });

  const onContinueQuickCustomization = React.useCallback(
    () => {
      quickCustomizationState.goToPreviousStep();
    },
    [quickCustomizationState]
  );

  const { title, content, showPreview } = renderQuickCustomization({
    project,
    gameAndBuildsManager,
    resourceManagementProps,
    onLaunchPreview,
    quickCustomizationState,
    onlineWebExporter,
    onSaveProject,
    isSavingProject,
    isRequiredToSaveAsNewCloudProject,
    onClose,
    onContinueQuickCustomization,
    gameScreenshotUrls,
    onScreenshotsClaimed,
  });

  const name = project.getName();
  React.useEffect(
    () => {
      sendQuickCustomizationProgress({
        stepName: quickCustomizationState.step.name,
        sourceGameId,
        projectName: name,
      });
    },
    [quickCustomizationState.step.name, sourceGameId, name]
  );

  React.useEffect(
    () => {
      triggerUnsavedChanges();
    },
    // Trigger unsaved changes when the dialog is opened,
    // so the user is warned if they try to close the dialog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Dialog
      open
      title={title}
      maxWidth="md"
      fullHeight
      actions={
        !!quickCustomizationState.step.nextLabel
          ? [
              <DialogPrimaryButton
                key="next"
                label={quickCustomizationState.step.nextLabel}
                primary
                onClick={quickCustomizationState.goToNextStep}
                disabled={quickCustomizationState.isNavigationDisabled}
                fullWidth
              />,
            ]
          : []
      }
      secondaryActions={[
        !quickCustomizationState.canGoToPreviousStep ? null : (
          <FlatButton
            key="previous"
            primary
            label={<Trans>Back</Trans>}
            onClick={quickCustomizationState.goToPreviousStep}
            disabled={
              !quickCustomizationState.canGoToPreviousStep ||
              quickCustomizationState.isNavigationDisabled
            }
            fullWidth
          />
        ),
      ]}
      onRequestClose={canClose ? onClose : undefined}
      flexBody
      actionsFullWidthOnMobile
      cannotBeDismissed={quickCustomizationState.isNavigationDisabled}
    >
      <ColumnStackLayout noMargin expand>
        <ScrollView key={quickCustomizationState.step.name}>
          <ColumnStackLayout noMargin expand>
            {content}
          </ColumnStackLayout>
        </ScrollView>
        {showPreview && <PreviewLine onLaunchPreview={onLaunchPreview} />}
      </ColumnStackLayout>
    </Dialog>
  );
};
