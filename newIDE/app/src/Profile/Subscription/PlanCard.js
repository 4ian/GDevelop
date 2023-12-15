// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';

import { type PlanDetails } from '../../Utils/GDevelopServices/Usage';
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

const styles = {
  bulletIcon: { width: 20, height: 20, marginRight: 10 },
  bulletText: { flex: 1 },
};

const getPlanPrice = ({
  plan,
  hidePrice,
}: {
  plan: PlanDetails,
  hidePrice?: boolean,
}): React.Node => {
  if (hidePrice || plan.monthlyPriceInEuros === null) return null;
  if (plan.monthlyPriceInEuros === 0)
    return (
      <Text noMargin color="secondary">
        <Trans>Free</Trans>
      </Text>
    );
  const prices = [];
  prices.push(
    plan.isPerUser ? (
      <Text key="month" noMargin color="secondary">
        <Trans>{plan.monthlyPriceInEuros}€/seat/month</Trans>
      </Text>
    ) : (
      <Text key="month" noMargin color="secondary">
        <Trans>{plan.monthlyPriceInEuros}€/month</Trans>
      </Text>
    )
  );
  if (plan.yearlyPriceInEuros) {
    prices.push(
      plan.isPerUser ? (
        <Text key="year" noMargin color="secondary">
          <Trans>or {plan.yearlyPriceInEuros}€/seat/year</Trans>
        </Text>
      ) : (
        <Text key="year" noMargin color="secondary">
          <Trans>or {plan.yearlyPriceInEuros}€/year</Trans>
        </Text>
      )
    );
  }
  return prices;
};

const PLAN_LOGO_SIZE = 25;
const PLAN_LOGO_PADDING = 20;

const getPlanIcon = (plan: PlanDetails): React.Node => {
  switch (plan.planId) {
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
  plan: PlanDetails,
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

  const planIcon = getPlanIcon(props.plan);

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
                    <b>{props.plan.name}</b>
                  </span>
                </Text>
                <Column noMargin alignItems="flex-end">
                  {getPlanPrice({
                    plan: props.plan,
                    hidePrice: props.hidePrice,
                  })}
                </Column>
              </Line>
              <Text color="secondary" noMargin>
                {props.plan.smallDescription
                  ? i18n._(props.plan.smallDescription)
                  : ''}
              </Text>
              <Line>
                <Column noMargin>
                  {props.plan.descriptionBullets.map(
                    (descriptionBullet, index) => (
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
                            {i18n._(descriptionBullet.message)}
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
