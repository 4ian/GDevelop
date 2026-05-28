// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import Link from '../../UI/Link';
import CircledInfo from '../../UI/CustomSvgIcons/CircledInfo';
import { SubscriptionContext } from '../../Profile/Subscription/SubscriptionContext';

/**
 * Small banner shown on top of the prompt when the AI request is run with
 * the "low" (free, open-source) preset, to let the user know about its
 * limitations and offer an upgrade to smarter (paid) models.
 */
export const FreeAiBanner = (): React.Node => {
  const { openSubscriptionDialog } = React.useContext(SubscriptionContext);

  return (
    <Line noMargin alignItems="center" justifyContent="center">
      <CircledInfo fontSize="small" />
      <Text size="body-small" color="secondary" noMargin>
        <Trans>Free/open-source AI has limited performance and speed.</Trans>{' '}
        <Link
          href="#"
          onClick={() =>
            openSubscriptionDialog({
              analyticsMetadata: {
                reason: 'AI requests (subscribe)',
                recommendedPlanId: 'gdevelop_gold',
                placementId: 'ai-requests',
              },
            })
          }
        >
          <Trans>Upgrade for smarter AI</Trans>
        </Link>
        .
      </Text>
    </Line>
  );
};
