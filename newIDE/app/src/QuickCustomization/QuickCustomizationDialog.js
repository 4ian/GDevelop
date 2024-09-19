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

const styles = {
  scrollView: {
    display: 'flex',
  },
};

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  onLaunchPreview: () => Promise<void>,
  onClose: (?{| tryAnotherGame: boolean |}) => Promise<void>,
  onlineWebExporter: Exporter,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  canClose: boolean,
  sourceGameId: string,
|};

export const QuickCustomizationDialog = ({
  project,
  resourceManagementProps,
  onLaunchPreview,
  onClose,
  onlineWebExporter,
  onSaveProject,
  isSavingProject,
  canClose,
  sourceGameId,
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

  const onTryAnotherGame = React.useCallback(
    () => {
      onClose({ tryAnotherGame: true });
    },
    [onClose]
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
    onClose,
    onContinueQuickCustomization,
    onTryAnotherGame,
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
        <ScrollView
          key={quickCustomizationState.step.name}
          style={styles.scrollView}
        >
          <ColumnStackLayout noMargin expand>
            {content}
          </ColumnStackLayout>
        </ScrollView>
        {showPreview && <PreviewLine onLaunchPreview={onLaunchPreview} />}
      </ColumnStackLayout>
    </Dialog>
  );
};
