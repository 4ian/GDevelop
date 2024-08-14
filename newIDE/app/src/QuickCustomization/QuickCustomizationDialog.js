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

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  onLaunchPreview: () => Promise<void>,
  onClose: () => void,
  onlineWebExporter: Exporter,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
|};

export const QuickCustomizationDialog = ({
  project,
  resourceManagementProps,
  onLaunchPreview,
  onClose,
  onlineWebExporter,
  onSaveProject,
  isSavingProject,
}: Props) => {
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
      maxWidth="lg"
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
          label={quickCustomizationState.nextLabel}
          primary
          onClick={quickCustomizationState.goToNextStep}
          disabled={
            !quickCustomizationState.canGoToNextStep ||
            quickCustomizationState.isNavigationDisabled
          }
        />,
      ]}
      secondaryActions={[
        quickCustomizationState.showCloseButton ? (
          <FlatButton
            key="close"
            label={<Trans>Close</Trans>}
            primary={false}
            onClick={onClose}
            disabled={quickCustomizationState.isNavigationDisabled}
          />
        ) : null,
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
