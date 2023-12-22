// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';

import {
  type SubscriptionPlan,
  type SubscriptionPlanWithPrices,
  type SubscriptionPlanPrice,
} from '../../Utils/GDevelopServices/Usage';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import { Trans } from '@lingui/macro';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import CheckCircle from '../../UI/CustomSvgIcons/CheckCircle';
import Paper from '../../UI/Paper';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import Silver from './Icons/Silver';
import Gold from './Icons/Gold';
import GDevelopGLogo from '../../UI/CustomSvgIcons/GDevelopGLogo';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';

const styles = {
  bulletIcon: { width: 20, height: 20, marginRight: 10 },
  bulletText: { flex: 1 },
};

const getPlanPrice = (price: SubscriptionPlanPrice): React.Node => {
  if (price.period === 'week') {
    if (price.periodCount === 1) {
      if (price.isPerUser) {
        return (
          <Text key="week" noMargin color="secondary">
            <Trans>
              {price.amountInCents / 100}
              {price.currency === 'EUR' ? '€' : '$'}/seat/week
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="week" noMargin color="secondary">
            <Trans>
              {price.amountInCents / 100}
              {price.currency === 'EUR' ? '€' : '$'}/week
            </Trans>
          </Text>
        );
      }
    } else {
      if (price.isPerUser) {
        return (
          <Text key="week" noMargin color="secondary">
            <Trans>
              {price.amountInCents / 100}
              {price.currency === 'EUR' ? '€' : '$'}/seat every{' '}
              {price.periodCount} weeks
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="week" noMargin color="secondary">
            <Trans>
              {price.amountInCents / 100}
              {price.currency === 'EUR' ? '€' : '$'} every {price.periodCount}{' '}
              weeks
            </Trans>
          </Text>
        );
      }
    }
  } else if (price.period === 'month') {
    if (price.periodCount === 1) {
      if (price.isPerUser) {
        return (
          <Text key="month" noMargin color="secondary">
            <Trans>
              {price.amountInCents / 100}
              {price.currency === 'EUR' ? '€' : '$'}/seat/month
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="month" noMargin color="secondary">
            <Trans>
              {price.amountInCents / 100}
              {price.currency === 'EUR' ? '€' : '$'}/month
            </Trans>
          </Text>
        );
      }
    } else {
      if (price.isPerUser) {
        return (
          <Text key="month" noMargin color="secondary">
            <Trans>
              {price.amountInCents / 100}
              {price.currency === 'EUR' ? '€' : '$'}/seat every{' '}
              {price.periodCount} months
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="month" noMargin color="secondary">
            <Trans>
              {price.amountInCents / 100}
              {price.currency === 'EUR' ? '€' : '$'} every {price.periodCount}{' '}
              months
            </Trans>
          </Text>
        );
      }
    }
  } else {
    if (price.periodCount === 1) {
      if (price.isPerUser) {
        return (
          <Text key="year" noMargin color="secondary">
            <Trans>
              {price.amountInCents / 100}
              {price.currency === 'EUR' ? '€' : '$'}/seat/year
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="year" noMargin color="secondary">
            <Trans>
              {price.amountInCents / 100}
              {price.currency === 'EUR' ? '€' : '$'}/year
            </Trans>
          </Text>
        );
      }
    } else {
      if (price.isPerUser) {
        return (
          <Text key="year" noMargin color="secondary">
            <Trans>
              {price.amountInCents / 100}
              {price.currency === 'EUR' ? '€' : '$'}/seat every{' '}
              {price.periodCount} years
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="year" noMargin color="secondary">
            <Trans>
              {price.amountInCents / 100}
              {price.currency === 'EUR' ? '€' : '$'} every {price.periodCount}{' '}
              years
            </Trans>
          </Text>
        );
      }
    }
  }
};

/**
 * If price is given, it will be displayed. Otherwise, the prices stored in the
 * subscription plan will be displayed.
 */
const getPlanPrices = ({
  prices,
  price,
  hidePrice,
}: {
  prices: ?(SubscriptionPlanPrice[]),
  price: ?SubscriptionPlanPrice,
  hidePrice?: boolean,
}): React.Node => {
  if (hidePrice) return null;
  if (price) {
    return getPlanPrice(price);
  }

  if (prices) {
    const displayedPrices = prices
      .sort((priceA, priceB) => {
        // TODO: Decide if the front end should sort the prices or if it should respect
        // the order sent by the back end.
        if (priceA.period === 'week' && priceB.period === 'month') return 1;
        if (priceA.period === 'week' && priceB.period === 'year') return 1;
        if (priceA.period === 'month' && priceB.period === 'year') return 1;
        if (priceA.period === priceB.period) return 0;
        return -1;
      })
      .map(getPlanPrice);

    return displayedPrices;
  }

  return (
    <Text noMargin color="secondary">
      <Trans>Free</Trans>
    </Text>
  );
};

const PLAN_LOGO_SIZE = 25;
const PLAN_LOGO_PADDING = 20;

const getPlanIcon = (
  subscriptionPlan: SubscriptionPlan | SubscriptionPlanWithPrices
): React.Node => {
  switch (subscriptionPlan.id) {
    case 'gdevelop_silver':
    case 'gdevelop_indie': // legacy
      return (
        <Silver
          style={{
            // Those icons have a glow effect, so the padding is in the size of the image.
            width: PLAN_LOGO_SIZE + 2 * PLAN_LOGO_PADDING,
            height: PLAN_LOGO_SIZE + 2 * PLAN_LOGO_PADDING,
          }}
        />
      );
    case 'gdevelop_gold':
    case 'gdevelop_pro': // legacy
      return (
        <Gold
          style={{
            // Those icons have a glow effect, so the padding is in the size of the image.
            width: PLAN_LOGO_SIZE + 2 * PLAN_LOGO_PADDING,
            height: PLAN_LOGO_SIZE + 2 * PLAN_LOGO_PADDING,
          }}
        />
      );
    // TODO: Add icons for other plans.
    case 'gdevelop_education':
    case 'gdevelop_startup':
    case 'gdevelop_enterprise':
    default:
      return (
        <GDevelopGLogo
          style={{
            width: PLAN_LOGO_SIZE,
            height: PLAN_LOGO_SIZE,
            padding: PLAN_LOGO_PADDING,
          }}
        />
      );
  }
};

type Props = {|
  subscriptionPlanWithPrices: SubscriptionPlanWithPrices | SubscriptionPlan,
  subscriptionPlanPrice?: ?SubscriptionPlanPrice,
  isHighlighted: boolean,
  actions?: React.Node,
  isPending?: boolean,
  hidePrice?: boolean,
  background: 'medium' | 'dark',
|};

const PlanCard = (props: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const windowWidth = useResponsiveWindowWidth();
  const isMobileScreen = windowWidth === 'small';

  const planIcon = getPlanIcon(props.subscriptionPlanWithPrices);

  return (
    <I18n>
      {({ i18n }) => (
        <Paper
          background={props.background}
          style={{
            paddingRight: isMobileScreen ? 8 : 32,
            paddingLeft: !!planIcon ? 0 : isMobileScreen ? 8 : 65,
            border: `1px solid ${gdevelopTheme.text.color.disabled}`,
            paddingTop: 16,
            paddingBottom: 16,
            ...(props.isHighlighted
              ? {
                  borderLeftWidth: 4,
                  borderLeftColor: gdevelopTheme.palette.secondary,
                }
              : {}),
          }}
        >
          <Line noMargin>
            <Column noMargin>{planIcon}</Column>
            <Column noMargin expand>
              <Line noMargin justifyContent="space-between" alignItems="center">
                <Text size="block-title">
                  <span>
                    <b>
                      {selectMessageByLocale(
                        i18n,
                        props.subscriptionPlanWithPrices.nameByLocale
                      )}
                    </b>
                  </span>
                </Text>
                <Column noMargin alignItems="flex-end">
                  {getPlanPrices({
                    prices: props.subscriptionPlanWithPrices.prices || null,
                    price: props.subscriptionPlanPrice,
                    hidePrice: props.hidePrice,
                  })}
                </Column>
              </Line>
              <Text color="secondary" noMargin>
                {selectMessageByLocale(
                  i18n,
                  props.subscriptionPlanWithPrices.descriptionByLocale
                )}
              </Text>
              <Line>
                <Column noMargin>
                  {props.subscriptionPlanWithPrices.bulletPointsByLocale.map(
                    (bulletPointByLocale, index) => (
                      <Column key={index} expand noMargin>
                        <Line noMargin alignItems="center">
                          {props.isHighlighted ? (
                            <CheckCircle
                              style={{
                                ...styles.bulletIcon,
                                color: gdevelopTheme.message.valid,
                              }}
                            />
                          ) : (
                            <CheckCircle style={styles.bulletIcon} />
                          )}
                          <Text style={styles.bulletText}>
                            {selectMessageByLocale(i18n, bulletPointByLocale)}
                          </Text>
                        </Line>
                      </Column>
                    )
                  )}
                </Column>
              </Line>
              {props.actions && (
                <ResponsiveLineStackLayout
                  expand
                  noMargin
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  {props.actions}
                </ResponsiveLineStackLayout>
              )}
            </Column>
          </Line>
        </Paper>
      )}
    </I18n>
  );
};

export default PlanCard;
