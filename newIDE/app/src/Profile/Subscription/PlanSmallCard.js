// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';

import { type SubscriptionPlanWithPricingSystems } from '../../Utils/GDevelopServices/Usage';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import CheckCircle from '../../UI/CustomSvgIcons/CheckCircle';
import Paper from '../../UI/Paper';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import { getPlanIcon, getPlanPrices } from './PlanCard';

const styles = {
  bulletIcon: { width: 20, height: 20, marginRight: 10 },
  planPricesPaper: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  bulletText: { flex: 1 },
};

type Props = {|
  subscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems,
  isHighlighted: boolean,
  actions?: React.Node,
  isPending?: boolean,
  hidePrice?: boolean,
  background: 'medium' | 'dark',
|};

const PlanSmallCard = (props: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { isMobile } = useResponsiveWindowSize();

  const planIcon = getPlanIcon({
    subscriptionPlan: props.subscriptionPlanWithPricingSystems,
    logoSize: 40,
  });

  return (
    <I18n>
      {({ i18n }) => (
        <Paper
          background={props.background}
          style={{
            paddingRight: isMobile ? 8 : 32,
            paddingLeft: !!planIcon ? 0 : isMobile ? 8 : 65,
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

export default PlanSmallCard;
