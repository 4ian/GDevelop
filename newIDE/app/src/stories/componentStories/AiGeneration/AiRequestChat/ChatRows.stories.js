// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../../PaperDecorator';
import FixedWidthFlexContainer from '../../../FixedWidthFlexContainer';
import { ColumnStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import { EditApprovalRow } from '../../../../AiGeneration/AiRequestChat/EditApprovalRow';
import { AiRequestErrorRow } from '../../../../AiGeneration/AiRequestChat/AiRequestErrorRow';
import { AiCreditsLimitRow } from '../../../../AiGeneration/AiRequestChat/AiCreditsLimitRow';
import { type EditApprovalRequest } from '../../../../AiGeneration/Utils';
import {
  fakeGoldSubscriptionPlanWithPricingSystems,
  fakeProSubscriptionPlanWithPricingSystems,
  fakePlanWithoutSimplifiedFeatures,
  fakePlanWithMonthlyPricingOnly,
  fakePlanWithoutPricingSystems,
  fakeSubscriptionPlansWithPricingSystems,
} from '../../../../fixtures/GDevelopServicesTestData/FakeSubscriptionPlans';
import {
  noSubscription,
  subscriptionForSilverUser,
  subscriptionForGoldUser,
  subscriptionForStartupUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import { getSubscriptionPlanToUpsell } from '../../../../Profile/Subscription/SubscriptionUpsellUtils';
import { type Quota } from '../../../../Utils/GDevelopServices/Usage';
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

// Retried too many times in a row: the API would refuse to continue it again,
// so only starting a new chat is left.
export const AiRequestErrorWithExhaustedRetries = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiRequestErrorRow
      error={internalAiRequestError}
      hasExhaustedRetries
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

// The daily AI usage of a user without a subscription, all consumed, coming
// back in a few days.
const reachedDailyQuota: Quota = {
  limitReached: true,
  current: 12,
  max: 12,
  period: '1day',
  resetsAt: new Date('2026-09-03T08:00:00Z').getTime(),
};

const aiCreditsLimitActions = {
  onUpgradeSubscription: action('onUpgradeSubscription'),
  onSwitchToGDevelopCredits: action('onSwitchToGDevelopCredits'),
  onBuyCredits: action('onBuyCredits'),
};

// The user has no subscription and no credits: the upsell is the only way
// forward, so it takes all the space it needs.
export const AiCreditsLimitWithoutSubscription = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiCreditsLimitRow
      suggestedSubscriptionPlan={fakeGoldSubscriptionPlanWithPricingSystems}
      hasSubscription={false}
      availableCredits={0}
      canSwitchToGDevelopCredits={false}
      quota={reachedDailyQuota}
      {...aiCreditsLimitActions}
    />
  </FixedWidthFlexContainer>
);

// The user has credits left: continuing right away is offered next to the
// subscription, which stays the featured action.
export const AiCreditsLimitWithCreditsLeft = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiCreditsLimitRow
      suggestedSubscriptionPlan={fakeGoldSubscriptionPlanWithPricingSystems}
      hasSubscription={false}
      availableCredits={350}
      canSwitchToGDevelopCredits
      quota={reachedDailyQuota}
      {...aiCreditsLimitActions}
    />
  </FixedWidthFlexContainer>
);

// Already paying: the upsell is an upgrade to the plan above.
export const AiCreditsLimitWithSubscriptionToUpgrade = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiCreditsLimitRow
      suggestedSubscriptionPlan={fakeProSubscriptionPlanWithPricingSystems}
      hasSubscription
      availableCredits={120}
      canSwitchToGDevelopCredits
      quota={{ ...reachedDailyQuota, period: '30days' }}
      {...aiCreditsLimitActions}
    />
  </FixedWidthFlexContainer>
);

// Nothing left to upsell (the user is on the best plan): only credits can get
// the conversation going again.
export const AiCreditsLimitWithoutPlanToSuggest = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <ColumnStackLayout noMargin expand>
      <Text noMargin size="body-small" color="secondary">
        With credits to spend
      </Text>
      <AiCreditsLimitRow
        suggestedSubscriptionPlan={null}
        hasSubscription
        availableCredits={350}
        canSwitchToGDevelopCredits
        quota={reachedDailyQuota}
        {...aiCreditsLimitActions}
      />
      <Text noMargin size="body-small" color="secondary">
        Without enough credits to switch to (none, or fewer than a request
        costs), or already paying with them
      </Text>
      <AiCreditsLimitRow
        suggestedSubscriptionPlan={null}
        hasSubscription
        availableCredits={0}
        canSwitchToGDevelopCredits={false}
        quota={reachedDailyQuota}
        {...aiCreditsLimitActions}
      />
    </ColumnStackLayout>
  </FixedWidthFlexContainer>
);

// What each kind of account is shown once its AI usage is consumed. The plan to
// offer is resolved with the very function the chat uses, so this story can't
// drift from what users actually see.
const accountTypes = [
  { label: 'Free account', subscription: noSubscription },
  { label: 'Silver account', subscription: subscriptionForSilverUser },
  { label: 'Gold account', subscription: subscriptionForGoldUser },
  { label: 'Pro account', subscription: subscriptionForStartupUser },
];

export const AiCreditsLimitPerAccountType = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <ColumnStackLayout noMargin expand>
      {accountTypes.map(({ label, subscription }) => (
        <React.Fragment key={label}>
          <Text noMargin size="body-small" color="secondary">
            {label}
          </Text>
          <AiCreditsLimitRow
            suggestedSubscriptionPlan={getSubscriptionPlanToUpsell({
              subscription,
              subscriptionPlansWithPricingSystems: fakeSubscriptionPlansWithPricingSystems,
            })}
            hasSubscription={!!subscription.planId}
            availableCredits={350}
            canSwitchToGDevelopCredits
            quota={reachedDailyQuota}
            {...aiCreditsLimitActions}
          />
        </React.Fragment>
      ))}
    </ColumnStackLayout>
  </FixedWidthFlexContainer>
);

// The user already pays their AI requests with GDevelop credits but doesn't
// have enough of them left: switching is not something they can do, so the
// actionable offer is to buy credits (never a disabled button).
export const AiCreditsLimitAlreadyUsingCredits = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiCreditsLimitRow
      suggestedSubscriptionPlan={fakeGoldSubscriptionPlanWithPricingSystems}
      hasSubscription={false}
      availableCredits={2}
      canSwitchToGDevelopCredits={false}
      quota={reachedDailyQuota}
      {...aiCreditsLimitActions}
    />
  </FixedWidthFlexContainer>
);

// Every kind of AI usage allowance, and the case where we don't know when it
// comes back: each must be said with the right wording (or not at all).
export const AiCreditsLimitWithAllQuotaPeriods = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <ColumnStackLayout noMargin expand>
      {[
        { label: 'Daily allowance', quota: reachedDailyQuota },
        {
          label: 'Weekly allowance',
          quota: { ...reachedDailyQuota, period: '7days' },
        },
        {
          label: 'Monthly allowance',
          quota: { ...reachedDailyQuota, period: '30days' },
        },
        {
          label: 'Reset date already passed (not shown)',
          quota: {
            ...reachedDailyQuota,
            resetsAt: new Date('2020-01-01T08:00:00Z').getTime(),
          },
        },
        { label: 'No allowance known (not shown)', quota: null },
      ].map(({ label, quota }) => (
        <React.Fragment key={label}>
          <Text noMargin size="body-small" color="secondary">
            {label}
          </Text>
          <AiCreditsLimitRow
            suggestedSubscriptionPlan={
              fakeGoldSubscriptionPlanWithPricingSystems
            }
            hasSubscription={false}
            availableCredits={350}
            canSwitchToGDevelopCredits
            // $FlowFixMe[incompatible-type] - the periods are the ones of a Quota.
            quota={quota}
            {...aiCreditsLimitActions}
          />
        </React.Fragment>
      ))}
    </ColumnStackLayout>
  </FixedWidthFlexContainer>
);

// What the plan is sold for decides what the row can promise: a yearly plan is
// shown as a monthly equivalent with the saving, and a plan whose prices are
// missing must show no price rather than a broken one.
export const AiCreditsLimitWithAllPricingCases = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <ColumnStackLayout noMargin expand>
      {[
        {
          label: 'Sold yearly and monthly',
          plan: fakeGoldSubscriptionPlanWithPricingSystems,
        },
        { label: 'Sold monthly only', plan: fakePlanWithMonthlyPricingOnly },
        {
          label: 'Prices unavailable (no price line)',
          plan: fakePlanWithoutPricingSystems,
        },
      ].map(({ label, plan }) => (
        <React.Fragment key={label}>
          <Text noMargin size="body-small" color="secondary">
            {label}
          </Text>
          <AiCreditsLimitRow
            suggestedSubscriptionPlan={plan}
            hasSubscription={false}
            availableCredits={0}
            canSwitchToGDevelopCredits={false}
            quota={reachedDailyQuota}
            {...aiCreditsLimitActions}
          />
        </React.Fragment>
      ))}
    </ColumnStackLayout>
  </FixedWidthFlexContainer>
);

// An older backend that doesn't describe the plan features: the row falls back
// to its own wording.
export const AiCreditsLimitWithoutBackendFeatures = (): React.Node => (
  <FixedWidthFlexContainer width={600}>
    <AiCreditsLimitRow
      suggestedSubscriptionPlan={fakePlanWithoutSimplifiedFeatures}
      hasSubscription={false}
      availableCredits={0}
      canSwitchToGDevelopCredits={false}
      quota={null}
      {...aiCreditsLimitActions}
    />
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
      <Text noMargin size="body-small" color="secondary">
        AI credits limit
      </Text>
      <AiCreditsLimitRow
        suggestedSubscriptionPlan={fakeGoldSubscriptionPlanWithPricingSystems}
        hasSubscription={false}
        availableCredits={350}
        canSwitchToGDevelopCredits
        quota={reachedDailyQuota}
        {...aiCreditsLimitActions}
      />
    </ColumnStackLayout>
  </FixedWidthFlexContainer>
);
