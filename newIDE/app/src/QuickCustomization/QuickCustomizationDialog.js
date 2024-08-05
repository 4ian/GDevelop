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

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  onLaunchPreview: () => Promise<void>,
|};

export const QuickCustomizationDialog = ({
  project,
  resourceManagementProps,
  onLaunchPreview,
}: Props) => {
  const quickCustomizationState = useQuickCustomizationState();
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
        <FlatButton
          label={<Trans>Previous</Trans>}
          onClick={quickCustomizationState.goToPreviousStep}
          disabled={
            !quickCustomizationState.canGoToPreviousStep ||
            quickCustomizationState.isNavigationDisabled
          }
        />,
        <DialogPrimaryButton
          label={<Trans>Next</Trans>}
          primary
          onClick={quickCustomizationState.goToNextStep}
          disabled={
            !quickCustomizationState.canGoToNextStep ||
            quickCustomizationState.isNavigationDisabled
          }
        />,
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
