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
import {
  internalAiRequestError,
  contextTooLargeAiRequestError,
  repeatedToolCallLoopAiRequestError,
} from '../../../../fixtures/GDevelopServicesTestData/FakeAiRequests';

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

export const AiRequestInternalError = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiRequestErrorRow
      error={internalAiRequestError}
      onRetry={async () => action('onRetry')()}
      onStartNewChat={action('onStartNewChat')}
    />
  </FixedWidthFlexContainer>
);

// The conversation is too large for the AI model: retrying would fail in the
// exact same way, so it is not offered - even though the chat could resume it.
export const AiRequestErrorWithContextTooLarge = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiRequestErrorRow
      error={contextTooLargeAiRequestError}
      onRetry={async () => action('onRetry')()}
      onStartNewChat={action('onStartNewChat')}
    />
  </FixedWidthFlexContainer>
);

export const AiRequestErrorWithRepeatedToolCallLoop = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiRequestErrorRow
      error={repeatedToolCallLoopAiRequestError}
      onRetry={async () => action('onRetry')()}
      onStartNewChat={action('onStartNewChat')}
    />
  </FixedWidthFlexContainer>
);

// An unknown code is presented like any other failure: worth retrying.
export const AiRequestErrorWithUnknownCode = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiRequestErrorRow
      error={{
        code: 'some-code-added-later-in-the-api',
        message: 'Something new went wrong.',
      }}
      onRetry={async () => action('onRetry')()}
      onStartNewChat={action('onStartNewChat')}
    />
  </FixedWidthFlexContainer>
);

// Older requests, and requests killed by an infrastructure failure, have no
// error details to show.
export const AiRequestErrorWithoutDetails = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiRequestErrorRow
      onRetry={async () => action('onRetry')()}
      onStartNewChat={action('onStartNewChat')}
    />
  </FixedWidthFlexContainer>
);

// A request that can't be continued (no retry offered): only starting a new
// chat is left to the user.
export const AiRequestErrorWithoutRetry = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiRequestErrorRow
      error={internalAiRequestError}
      onStartNewChat={action('onStartNewChat')}
    />
  </FixedWidthFlexContainer>
);

// All of them side by side, to compare what is said and offered for each.
export const AllAiRequestErrors = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <ColumnStackLayout noMargin expand>
      {[
        internalAiRequestError,
        contextTooLargeAiRequestError,
        repeatedToolCallLoopAiRequestError,
        null,
      ].map(error => (
        <AiRequestErrorRow
          key={error ? error.code : 'no-error'}
          error={error}
          onRetry={async () => action('onRetry')()}
          onStartNewChat={action('onStartNewChat')}
        />
      ))}
    </ColumnStackLayout>
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
        error={internalAiRequestError}
        onRetry={async () => action('onRetry')()}
        onStartNewChat={action('onStartNewChat')}
      />
    </ColumnStackLayout>
  </FixedWidthFlexContainer>
);
