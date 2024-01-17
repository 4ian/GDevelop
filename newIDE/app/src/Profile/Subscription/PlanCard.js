// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';

import {
  type SubscriptionPlan,
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
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
import Startup from './Icons/Startup';
import Business from './Icons/Business';
import Education from './Icons/Education';
import GDevelopGLogo from '../../UI/CustomSvgIcons/GDevelopGLogo';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';

const styles = {
  bulletIcon: { width: 20, height: 20, marginRight: 10 },
  bulletText: { flex: 1 },
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
  if (pricingSystem.period === 'week') {
    if (pricingSystem.periodCount === 1) {
      if (pricingSystem.isPerUser) {
        return (
          <Text key="week" noMargin color="secondary">
            <Trans>
              {formatPricingSystemPriceAndCurrency(pricingSystem)}/seat/week
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="week" noMargin color="secondary">
            <Trans>
              {formatPricingSystemPriceAndCurrency(pricingSystem)}/week
            </Trans>
          </Text>
        );
      }
    } else {
      if (pricingSystem.isPerUser) {
        return (
          <Text key="week" noMargin color="secondary">
            <Trans>
              {formatPricingSystemPriceAndCurrency(pricingSystem)}/seat every{' '}
              {pricingSystem.periodCount} weeks
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="week" noMargin color="secondary">
            <Trans>
              {formatPricingSystemPriceAndCurrency(pricingSystem)} every{' '}
              {pricingSystem.periodCount} weeks
            </Trans>
          </Text>
        );
      }
    }
  } else if (pricingSystem.period === 'month') {
    if (pricingSystem.periodCount === 1) {
      if (pricingSystem.isPerUser) {
        return (
          <Text key="month" noMargin color="secondary">
            <Trans>
              {formatPricingSystemPriceAndCurrency(pricingSystem)}/seat/month
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="month" noMargin color="secondary">
            <Trans>
              {formatPricingSystemPriceAndCurrency(pricingSystem)}/month
            </Trans>
          </Text>
        );
      }
    } else {
      if (pricingSystem.isPerUser) {
        return (
          <Text key="month" noMargin color="secondary">
            <Trans>
              {formatPricingSystemPriceAndCurrency(pricingSystem)}/seat every{' '}
              {pricingSystem.periodCount} months
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="month" noMargin color="secondary">
            <Trans>
              {formatPricingSystemPriceAndCurrency(pricingSystem)} every{' '}
              {pricingSystem.periodCount} months
            </Trans>
          </Text>
        );
      }
    }
  } else {
    if (pricingSystem.periodCount === 1) {
      if (pricingSystem.isPerUser) {
        return (
          <Text key="year" noMargin color="secondary">
            <Trans>
              {formatPricingSystemPriceAndCurrency(pricingSystem)}/seat/year
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="year" noMargin color="secondary">
            <Trans>
              {formatPricingSystemPriceAndCurrency(pricingSystem)}/year
            </Trans>
          </Text>
        );
      }
    } else {
      if (pricingSystem.isPerUser) {
        return (
          <Text key="year" noMargin color="secondary">
            <Trans>
              {formatPricingSystemPriceAndCurrency(pricingSystem)}/seat every{' '}
              {pricingSystem.periodCount} years
            </Trans>
          </Text>
        );
      } else {
        return (
          <Text key="year" noMargin color="secondary">
            <Trans>
              {formatPricingSystemPriceAndCurrency(pricingSystem)} every{' '}
              {pricingSystem.periodCount} years
            </Trans>
          </Text>
        );
      }
    }
  }
};

const getPlanPrices = ({
  pricingSystems,
  hidePrice,
}: {
  pricingSystems: SubscriptionPlanPricingSystem[],
  hidePrice?: boolean,
}): React.Node => {
  if (hidePrice) return null;
  if (pricingSystems.length > 0) {
    const displayedPricingSystems = pricingSystems.map(getPlanPrice);

    return displayedPricingSystems;
  }

  return (
    <Text noMargin color="secondary">
      <Trans>Free</Trans>
    </Text>
  );
};

const GDEVELOP_LOGO_SIZE = 25;
const GDEVELOP_LOGO_PADDING = 20;
// The plan logos are bigger than the GDevelop logo because they contain a glow effect,
// so we increase the size.
const PLAN_LOGO_SIZE = GDEVELOP_LOGO_SIZE + 2 * GDEVELOP_LOGO_PADDING;

const getPlanIcon = (
  subscriptionPlan: SubscriptionPlan | SubscriptionPlanWithPricingSystems
): React.Node => {
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
            width: GDEVELOP_LOGO_SIZE,
            height: GDEVELOP_LOGO_SIZE,
            padding: GDEVELOP_LOGO_PADDING,
          }}
        />
      );
  }
};

type Props = {|
  subscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems,
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

  const planIcon = getPlanIcon(props.subscriptionPlanWithPricingSystems);

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
                        props.subscriptionPlanWithPricingSystems.nameByLocale
                      )}
                    </b>
                  </span>
                </Text>
                <Column noMargin alignItems="flex-end">
                  {getPlanPrices({
                    pricingSystems:
                      props.subscriptionPlanWithPricingSystems.pricingSystems,
                    hidePrice: props.hidePrice,
                  })}
                </Column>
              </Line>
              <Text color="secondary" noMargin>
                {selectMessageByLocale(
                  i18n,
                  props.subscriptionPlanWithPricingSystems.descriptionByLocale
                )}
              </Text>
              <Line>
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
