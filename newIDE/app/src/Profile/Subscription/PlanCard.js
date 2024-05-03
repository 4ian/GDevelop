// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';

import {
  type SubscriptionPlan,
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
} from '../../Utils/GDevelopServices/Usage';
import Text from '../../UI/Text';
import { Column, Line, Spacer } from '../../UI/Grid';
import { Trans } from '@lingui/macro';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { ColumnStackLayout } from '../../UI/Layout';
import CheckCircle from '../../UI/CustomSvgIcons/CheckCircle';
import Paper from '../../UI/Paper';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import Silver from './Icons/Silver';
import Gold from './Icons/Gold';
import Startup from './Icons/Startup';
import Business from './Icons/Business';
import Education from './Icons/Education';
import GDevelopGLogo from '../../UI/CustomSvgIcons/GDevelopGLogo';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import DiscountFlame from '../../UI/HotMessage/DiscountFlame';

const styles = {
  bulletIcon: { width: 20, height: 20, marginRight: 10 },
  planPricesPaper: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  bulletText: { flex: 1 },
  discountedPrice: { textDecoration: 'line-through', opacity: 0.7 },
  discountContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: '4px 8px',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
  },
};

const formatPricingSystemPriceAndCurrency = (
  pricingSystem: SubscriptionPlanPricingSystem
) => {
  if (pricingSystem.currency === 'USD') {
    return `$${pricingSystem.amountInCents / 100}`;
  }
  return `${pricingSystem.amountInCents / 100}${
    pricingSystem.currency === 'EUR' ? '€' : pricingSystem.currency
  }`;
};

const getPlanPrice = (
  pricingSystem: SubscriptionPlanPricingSystem
): React.Node => {
  const price = (
    <Column noMargin alignItems="center">
      <b>{formatPricingSystemPriceAndCurrency(pricingSystem)}</b>
    </Column>
  );

  if (pricingSystem.period === 'week') {
    if (pricingSystem.periodCount === 1) {
      if (pricingSystem.isPerUser) {
        return (
          <Text key="week" noMargin color="primary">
            <Trans>{price} per seat, each week</Trans>
          </Text>
        );
      } else {
        return (
          <Text key="week" noMargin color="primary">
            <Trans>{price} per week</Trans>
          </Text>
        );
      }
    } else {
      if (pricingSystem.isPerUser) {
        return (
          <Text key="week" noMargin color="primary">
            <Trans>
              {price} per seat, every {pricingSystem.periodCount} weeks
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="week" noMargin color="primary">
            <Trans>
              {price} every {pricingSystem.periodCount} weeks
            </Trans>
          </Text>
        );
      }
    }
  } else if (pricingSystem.period === 'month') {
    if (pricingSystem.periodCount === 1) {
      if (pricingSystem.isPerUser) {
        return (
          <Text key="month" noMargin color="primary">
            <Trans>{price} per seat, each month</Trans>
          </Text>
        );
      } else {
        return (
          <Text key="month" noMargin color="primary">
            <Trans>{price} per month</Trans>
          </Text>
        );
      }
    } else {
      if (pricingSystem.isPerUser) {
        return (
          <Text key="month" noMargin color="primary">
            <Trans>
              {price} per seat, every {pricingSystem.periodCount} months
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="month" noMargin color="primary">
            <Trans>
              {price} every {pricingSystem.periodCount} months
            </Trans>
          </Text>
        );
      }
    }
  } else {
    if (pricingSystem.periodCount === 1) {
      if (pricingSystem.isPerUser) {
        return (
          <Text key="year" noMargin color="primary">
            <Trans>{price} per seat, each year</Trans>
          </Text>
        );
      } else {
        return (
          <Text key="year" noMargin color="primary">
            <Trans>{price} per year</Trans>
          </Text>
        );
      }
    } else {
      if (pricingSystem.isPerUser) {
        return (
          <Text key="year" noMargin color="primary">
            <Trans>
              {price} per seat, every {pricingSystem.periodCount} years
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="year" noMargin color="primary">
            <Trans>
              {price} every {pricingSystem.periodCount} years
            </Trans>
          </Text>
        );
      }
    }
  }
};

const extrapolateMonthlyPricingSystemToYearlyBasis = (
  monthlyPricingSystem: SubscriptionPlanPricingSystem
): SubscriptionPlanPricingSystem => ({
  ...monthlyPricingSystem,
  amountInCents: monthlyPricingSystem.amountInCents * 12,
  period: 'year',
});

export const getPlanPrices = ({
  pricingSystems,
  hidePrice,
}: {|
  pricingSystems: SubscriptionPlanPricingSystem[],
  hidePrice?: boolean,
|}): React.Node => {
  if (hidePrice) return null;
  if (pricingSystems.length > 0) {
    const displayedPricingSystems = pricingSystems
      .map((pricingSystem, index) => [
        index !== 0 ? (
          <Text noMargin size="body2" color="primary">
            <Trans>or</Trans>
          </Text>
        ) : null,
        getPlanPrice(pricingSystem),
      ])
      .flat();

    return displayedPricingSystems;
  }

  return (
    <Text noMargin color="primary">
      <Trans>Free</Trans>
    </Text>
  );
};

export const getPlanIcon = ({
  subscriptionPlan,
  logoSize,
}: {
  subscriptionPlan: SubscriptionPlan | SubscriptionPlanWithPricingSystems,
  logoSize: number,
}): React.Node => {
  const GDEVELOP_LOGO_PADDING = 10;
  // The plan logos are bigger than the GDevelop logo because they contain a glow effect,
  // so we increase the size.
  const PLAN_LOGO_SIZE = logoSize + 2 * GDEVELOP_LOGO_PADDING;

  switch (subscriptionPlan.id) {
    case 'gdevelop_silver':
    case 'gdevelop_indie': // legacy
      return (
        <Silver
          style={{
            width: PLAN_LOGO_SIZE,
            height: PLAN_LOGO_SIZE,
          }}
        />
      );
    case 'gdevelop_gold':
    case 'gdevelop_pro': // legacy
      return (
        <Gold
          style={{
            width: PLAN_LOGO_SIZE,
            height: PLAN_LOGO_SIZE,
          }}
        />
      );
    case 'gdevelop_education':
      return (
        <Education
          style={{
            width: PLAN_LOGO_SIZE,
            height: PLAN_LOGO_SIZE,
          }}
        />
      );
    case 'gdevelop_startup':
      return (
        <Startup
          style={{
            width: PLAN_LOGO_SIZE,
            height: PLAN_LOGO_SIZE,
          }}
        />
      );
    case 'gdevelop_enterprise':
      return (
        <Business
          style={{
            width: PLAN_LOGO_SIZE,
            height: PLAN_LOGO_SIZE,
          }}
        />
      );
    default:
      return (
        <GDevelopGLogo
          style={{
            width: logoSize,
            height: logoSize,
            padding: GDEVELOP_LOGO_PADDING,
          }}
        />
      );
  }
};

const getYearlyDiscountDisplayText = (
  subscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems
): string | null => {
  const monthlyPricingSystem = subscriptionPlanWithPricingSystems.pricingSystems.find(
    pricingSystem => pricingSystem.period === 'month'
  );
  const yearlyPricingSystem = subscriptionPlanWithPricingSystems.pricingSystems.find(
    pricingSystem => pricingSystem.period === 'year'
  );
  if (!monthlyPricingSystem || !yearlyPricingSystem) return null;

  return (
    '-' +
    ((
      100 -
      (yearlyPricingSystem.amountInCents /
        (monthlyPricingSystem.amountInCents * 12)) *
        100
    ).toFixed(0) +
      '%')
  );
};

type Props = {|
  subscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems,
  isHighlighted: boolean,
  actions?: React.Node,
  isPending?: boolean,
  periodToDisplay: 'year' | 'month',
  background: 'medium' | 'dark',
|};

const PlanCard = (props: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { isMobile } = useResponsiveWindowSize();

  const planIcon = getPlanIcon({
    subscriptionPlan: props.subscriptionPlanWithPricingSystems,
    logoSize: 25,
  });
  const mainPricingSystem = props.subscriptionPlanWithPricingSystems.pricingSystems.find(
    pricingSystem => pricingSystem.period === props.periodToDisplay
  );
  const otherPricingSystem =
    props.periodToDisplay === 'year'
      ? props.subscriptionPlanWithPricingSystems.pricingSystems.find(
          pricingSystem => pricingSystem.period === 'month'
        )
      : null;

  const yearlyDiscountDisplayText =
    props.periodToDisplay === 'year'
      ? getYearlyDiscountDisplayText(props.subscriptionPlanWithPricingSystems)
      : null;

  return (
    <I18n>
      {({ i18n }) => (
        <Paper
          background={props.background}
          style={{
            padding: isMobile ? 8 : 16,
            border: `1px solid ${gdevelopTheme.text.color.disabled}`,
            maxWidth: isMobile ? undefined : 350,
            minWidth: 280,
            display: 'flex',
            flex: 1,
            position: 'relative',
            ...(props.isHighlighted
              ? {
                  borderTopWidth: 5,
                  borderTopColor: gdevelopTheme.palette.secondary,
                }
              : {}),
          }}
        >
          {yearlyDiscountDisplayText && (
            <span
              style={{
                ...styles.discountContainer,
                backgroundColor: gdevelopTheme.message.hot.backgroundColor,
                color: gdevelopTheme.message.hot.color,
              }}
            >
              <DiscountFlame fontSize="small" />
              <Spacer />
              <Text color="inherit" noMargin>
                {yearlyDiscountDisplayText}
              </Text>
            </span>
          )}
          <Column expand noMargin alignItems="stretch">
            <Column noMargin alignItems="center">
              {planIcon}
              <ColumnStackLayout
                noMargin
                justifyContent="space-between"
                alignItems="center"
              >
                <Text size="block-title" noMargin>
                  <span style={{ textTransform: 'uppercase' }}>
                    <b>
                      {selectMessageByLocale(
                        i18n,
                        props.subscriptionPlanWithPricingSystems.nameByLocale
                      )}
                    </b>
                  </span>
                </Text>
                <Text size="section-title" noMargin align="center">
                  <div style={{ minHeight: 82 }}>
                    {selectMessageByLocale(
                      i18n,
                      props.subscriptionPlanWithPricingSystems
                        .descriptionByLocale
                    )}
                  </div>
                </Text>
              </ColumnStackLayout>
            </Column>
            <Line expand alignItems="flex-start">
              <Column noMargin>
                {props.subscriptionPlanWithPricingSystems.bulletPointsByLocale.map(
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
            {mainPricingSystem && (
              <Paper background="light" style={styles.planPricesPaper}>
                {otherPricingSystem && (
                  <span style={styles.discountedPrice}>
                    {getPlanPrices({
                      pricingSystems: [
                        extrapolateMonthlyPricingSystemToYearlyBasis(
                          otherPricingSystem
                        ),
                      ],
                    })}
                  </span>
                )}
                {getPlanPrices({
                  pricingSystems: [mainPricingSystem],
                })}
              </Paper>
            )}
            <Spacer />
            {props.actions && (
              <ColumnStackLayout
                noMargin
                alignItems="center"
                justifyContent="flex-end"
              >
                {props.actions}
              </ColumnStackLayout>
            )}
          </Column>
        </Paper>
      )}
    </I18n>
  );
};

export default PlanCard;
