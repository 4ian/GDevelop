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
import { useGameAndBuilds } from '../Utils/UseGameAndBuilds';

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  onLaunchPreview: () => Promise<void>,
  onClose: () => void,
  onlineWebExporter: Exporter,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  canClose: boolean,
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
}: Props) => {
  const gameAndBuilds = useGameAndBuilds({ project });
  const quickCustomizationState = useQuickCustomizationState({ onClose });
  const { windowSize } = useResponsiveWindowSize();

  const isMediumOrSmaller = windowSize === 'small' || windowSize === 'medium';

  const {
    title,
    titleRightContent,
    titleTopContent,
    content,
  } = renderQuickCustomization({
    project,
    gameAndBuilds,
    resourceManagementProps,
    onLaunchPreview,
    quickCustomizationState,
    onlineWebExporter,
    onSaveProject,
    isSavingProject,
  });

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
      actions={[
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
      ]}
      secondaryActions={[
        quickCustomizationState.step.shouldHideCloseButton ||
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
