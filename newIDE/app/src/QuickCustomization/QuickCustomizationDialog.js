// @flow
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { renderQuickCustomization, useQuickCustomizationState } from '.';
import { Trans } from '@lingui/macro';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import FlatButton from '../UI/FlatButton';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import Paper from '../UI/Paper';
import { type Exporter } from '../ExportAndShare/ShareDialog';
import { useGameAndBuildsManager } from '../Utils/UseGameAndBuildsManager';
import { sendQuickCustomizationProgress } from '../Utils/Analytics/EventSender';

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  onLaunchPreview: () => Promise<void>,
  onClose: (?{| tryAnotherGame: boolean |}) => void,
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
  const gameAndBuildsManager = useGameAndBuildsManager({
    project,
    copyLeaderboardsAndMultiplayerLobbiesFromGameId: sourceGameId,
  });
  const quickCustomizationState = useQuickCustomizationState({ onClose });
  const { windowSize } = useResponsiveWindowSize();

  const isMediumOrSmaller = windowSize === 'small' || windowSize === 'medium';

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

  const {
    title,
    titleRightContent,
    titleTopContent,
    content,
  } = renderQuickCustomization({
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

  return (
    <Dialog
      open
      title={null}
      fixedContent={
        isMediumOrSmaller ? (
          <Paper background="dark">{titleTopContent}</Paper>
        ) : null
      }
      maxWidth="md"
      fullHeight
      actions={
        !quickCustomizationState.step.shouldHideNavigationButtons
          ? [
              quickCustomizationState.canGoToPreviousStep ? (
                <FlatButton
                  key="previous"
                  label={<Trans>Back</Trans>}
                  onClick={quickCustomizationState.goToPreviousStep}
                  disabled={
                    !quickCustomizationState.canGoToPreviousStep ||
                    quickCustomizationState.isNavigationDisabled
                  }
                />
              ) : null,
              <DialogPrimaryButton
                key="next"
                label={quickCustomizationState.step.nextLabel}
                primary
                onClick={quickCustomizationState.goToNextStep}
                disabled={quickCustomizationState.isNavigationDisabled}
              />,
            ]
          : undefined
      }
      secondaryActions={[
        quickCustomizationState.step.shouldHideNavigationButtons ||
        !canClose ? null : (
          <FlatButton
            key="close"
            label={<Trans>Close</Trans>}
            primary={false}
            onClick={onClose}
            disabled={quickCustomizationState.isNavigationDisabled}
          />
        ),
      ]}
    >
      <ColumnStackLayout noMargin expand>
        <LineStackLayout
          noMargin
          alignItems="center"
          justifyContent="space-between"
        >
          <Text noMargin size={'title'}>
            {title}
          </Text>
          {!isMediumOrSmaller ? titleRightContent : null}
        </LineStackLayout>
        {content}
      </ColumnStackLayout>
    </Dialog>
  );
};
