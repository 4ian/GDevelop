// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../../PaperDecorator';
import FixedWidthFlexContainer from '../../../FixedWidthFlexContainer';
import { ColumnStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import { EditApprovalRow } from '../../../../AiGeneration/AiRequestChat/EditApprovalRow';
import { AiRequestErrorRow } from '../../../../AiGeneration/AiRequestChat/AiRequestErrorRow';
import { type EditApprovalRequest } from '../../../../AiGeneration/Utils';

// The rows shown in the AI chat outside of a message: they ask the user
// something (approving an edit) or tell them what happened to their request
// (an error), so they are checked here on their own, at the widths the chat
// panel can have.
export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/ChatRows',
  component: EditApprovalRow,
  decorators: [paperDecorator],
};

const pendingEditApproval: EditApprovalRequest = {
  aiRequestId: 'fake-ai-request-id',
  callIds: ['fake_modifying_call_1'],
  label: 'Add a score display and update it on coin pickup',
};

export const EditApproval = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <EditApprovalRow
      pendingEditApproval={pendingEditApproval}
      onResolveEditApproval={action('onResolveEditApproval')}
      onAcceptAndEnableAutoEdit={action('onAcceptAndEnableAutoEdit')}
    />
  </FixedWidthFlexContainer>
);

export const EditApprovalWithLongLabel = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <EditApprovalRow
      pendingEditApproval={{
        ...pendingEditApproval,
        label:
          'Add a score display in the top left corner of the scene, update it every time a coin is picked up and save the best score in a storage variable',
      }}
      onResolveEditApproval={action('onResolveEditApproval')}
      onAcceptAndEnableAutoEdit={action('onAcceptAndEnableAutoEdit')}
    />
  </FixedWidthFlexContainer>
);

export const AiRequestError = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiRequestErrorRow
      error={{
        code: 'ai-request/internal-error',
        message: 'The AI request failed to complete.',
      }}
      onRetry={async () => action('onRetry')()}
      onStartNewChat={action('onStartNewChat')}
    />
  </FixedWidthFlexContainer>
);

// A request that can't be continued (no retry offered): only starting a new
// chat is left to the user.
export const AiRequestErrorWithoutRetry = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiRequestErrorRow onStartNewChat={action('onStartNewChat')} />
  </FixedWidthFlexContainer>
);

// The chat panel can be docked and narrow: the actions must then wrap instead
// of overflowing.
export const RowsInANarrowPanel = (): React.Node => (
  <FixedWidthFlexContainer width={280}>
    <ColumnStackLayout noMargin expand>
      <Text noMargin size="body-small" color="secondary">
        Edit approval
      </Text>
      <EditApprovalRow
        pendingEditApproval={pendingEditApproval}
        onResolveEditApproval={action('onResolveEditApproval')}
        onAcceptAndEnableAutoEdit={action('onAcceptAndEnableAutoEdit')}
      />
      <Text noMargin size="body-small" color="secondary">
        Request error
      </Text>
      <AiRequestErrorRow
        error={{
          code: 'ai-request/internal-error',
          message: 'The AI request failed to complete.',
        }}
        onRetry={async () => action('onRetry')()}
        onStartNewChat={action('onStartNewChat')}
      />
    </ColumnStackLayout>
  </FixedWidthFlexContainer>
);
