// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';

import Card from '../../UI/Card';
import { type PlanDetails } from '../../Utils/GDevelopServices/Usage';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import { Trans } from '@lingui/macro';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import CheckCircle from '../../UI/CustomSvgIcons/CheckCircle';

const styles = {
  bulletIcon: { width: 20, height: 20, marginRight: 10 },
  bulletText: { flex: 1 },
};

type Props = {|
  plan: PlanDetails,
  isHighlighted: boolean,
  actions?: React.Node,
  isPending?: boolean,
  hidePrice?: boolean,
  background: 'medium' | 'dark',
|};

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

const PlanCard = (props: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <I18n>
      {({ i18n }) => (
        <Card isHighlighted={props.isHighlighted} background={props.background}>
          <Line noMargin justifyContent="space-between" alignItems="center">
            <Text size="block-title">
              <span>
                <b>{props.plan.name}</b>
              </span>
            </Text>
            <Column noMargin alignItems="flex-end">
              {getPlanPrice({ plan: props.plan, hidePrice: props.hidePrice })}
            </Column>
          </Line>
          <Text color="secondary" noMargin>
            {props.plan.smallDescription
              ? i18n._(props.plan.smallDescription)
              : ''}
          </Text>
          <Line>
            <Column noMargin>
              {props.plan.descriptionBullets.map((descriptionBullet, index) => (
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
              ))}
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
        </Card>
      )}
    </I18n>
  );
};

export default PlanCard;
