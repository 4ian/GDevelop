// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../../PaperDecorator';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import FixedWidthFlexContainer from '../../../FixedWidthFlexContainer';
import Paper from '../../../../UI/Paper';
import {
  AiUsageIndicator,
  AiUsagePopoverContent,
} from '../../../../AiGeneration/AiRequestChat/AiUsageIndicator';
import {
  type Quota,
  type UsagePrice,
} from '../../../../Utils/GDevelopServices/Usage';

export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/AiUsageIndicator',
  component: AiUsageIndicator,
  decorators: [paperDecorator],
};

const inTwoDays = Date.now() + 1000 * 60 * 60 * 24 * 2;

const quotaWithPlentyLeft: Quota = {
  limitReached: false,
  current: 20,
  max: 200,
  resetsAt: inTwoDays,
  period: '7days',
};

const quotaAlmostConsumed: Quota = {
  limitReached: false,
  current: 185,
  max: 200,
  resetsAt: inTwoDays,
  period: '1day',
};

const quotaLimitReached: Quota = {
  limitReached: true,
  current: 200,
  max: 200,
  resetsAt: inTwoDays,
  period: '30days',
};

const quotaWithoutResetDate: Quota = {
  limitReached: false,
  current: 100,
  max: 200,
  period: '7days',
};

const price: UsagePrice = {
  priceInCredits: 5,
  variablePrice: {
    orchestrator: {
      default: { minimumPriceInCredits: 4, maximumPriceInCredits: 20 },
    },
  },
};

/** The indicator at the bottom right of a chat, where the popover opens. */
const IndicatorInChat = ({
  hideLabel,
  ...props
}: {|
  quota: Quota | null,
  availableCredits: number,
  automaticallyUseCreditsForAiRequests: boolean,
  isRefreshingLimits?: boolean,
  hideLabel?: boolean,
  contextUsedRatio: ?number,
|}) => (
  <FixedHeightFlexContainer height={350}>
    <FixedWidthFlexContainer width={hideLabel ? 320 : 600}>
      <Paper
        background="dark"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: 12,
        }}
      >
        <AiUsageIndicator
          {...props}
          price={price}
          hideLabel={hideLabel}
          onOpenSubscriptionDialog={action('onOpenSubscriptionDialog')}
        />
      </Paper>
    </FixedWidthFlexContainer>
  </FixedHeightFlexContainer>
);

export const Default = (): React.Node => (
  <IndicatorInChat
    quota={quotaWithPlentyLeft}
    availableCredits={400}
    automaticallyUseCreditsForAiRequests={false}
    contextUsedRatio={0.32}
  />
);

export const OnMobile = (): React.Node => (
  <IndicatorInChat
    quota={quotaWithPlentyLeft}
    availableCredits={400}
    automaticallyUseCreditsForAiRequests={false}
    contextUsedRatio={0.32}
    hideLabel
  />
);

export const LimitReachedUsingCredits = (): React.Node => (
  <IndicatorInChat
    quota={quotaLimitReached}
    availableCredits={400}
    automaticallyUseCreditsForAiRequests={true}
    contextUsedRatio={0.32}
  />
);

export const OnMobileLimitReachedUsingCredits = (): React.Node => (
  <IndicatorInChat
    quota={quotaLimitReached}
    availableCredits={400}
    automaticallyUseCreditsForAiRequests={true}
    contextUsedRatio={0.32}
    hideLabel
  />
);

export const LimitReachedNotUsingCredits = (): React.Node => (
  <IndicatorInChat
    quota={quotaLimitReached}
    availableCredits={400}
    automaticallyUseCreditsForAiRequests={false}
    contextUsedRatio={0.32}
  />
);

export const RefreshingLimits = (): React.Node => (
  <IndicatorInChat
    quota={quotaWithPlentyLeft}
    availableCredits={400}
    automaticallyUseCreditsForAiRequests={false}
    contextUsedRatio={null}
    isRefreshingLimits
  />
);

export const RefreshingLimitsWithoutQuotaYet = (): React.Node => (
  <IndicatorInChat
    quota={null}
    availableCredits={0}
    automaticallyUseCreditsForAiRequests={false}
    contextUsedRatio={null}
    isRefreshingLimits
  />
);

/** The content of the popover, as opened from the indicator. */
const PopoverContent = (props: {|
  quota: Quota,
  availableCredits: number,
  automaticallyUseCreditsForAiRequests: boolean,
  contextUsedRatio: ?number,
|}) => (
  <Paper background="light" style={{ borderRadius: 10, width: 'fit-content' }}>
    <AiUsagePopoverContent
      {...props}
      onOpenSubscriptionDialog={action('onOpenSubscriptionDialog')}
    />
  </Paper>
);

export const PopoverPlentyLeft = (): React.Node => (
  <PopoverContent
    quota={quotaWithPlentyLeft}
    availableCredits={400}
    automaticallyUseCreditsForAiRequests={false}
    contextUsedRatio={0.32}
  />
);

export const PopoverNoChatOpened = (): React.Node => (
  <PopoverContent
    quota={quotaWithPlentyLeft}
    availableCredits={400}
    automaticallyUseCreditsForAiRequests={false}
    contextUsedRatio={null}
  />
);

export const PopoverAlmostConsumedDailyQuota = (): React.Node => (
  <PopoverContent
    quota={quotaAlmostConsumed}
    availableCredits={0}
    automaticallyUseCreditsForAiRequests={true}
    contextUsedRatio={0.85}
  />
);

export const PopoverLimitReachedUsingCredits = (): React.Node => (
  <PopoverContent
    quota={quotaLimitReached}
    availableCredits={400}
    automaticallyUseCreditsForAiRequests={true}
    contextUsedRatio={1.15}
  />
);

export const PopoverLimitReachedNoCredits = (): React.Node => (
  <PopoverContent
    quota={quotaLimitReached}
    availableCredits={0}
    automaticallyUseCreditsForAiRequests={false}
    contextUsedRatio={0.1}
  />
);

export const PopoverWithoutResetDate = (): React.Node => (
  <PopoverContent
    quota={quotaWithoutResetDate}
    availableCredits={120}
    automaticallyUseCreditsForAiRequests={false}
    contextUsedRatio={0.5}
  />
);
