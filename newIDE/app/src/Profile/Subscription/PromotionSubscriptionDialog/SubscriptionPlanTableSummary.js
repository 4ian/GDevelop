// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import Text from '../../../UI/Text';
import { Column, LargeSpacer, Line } from '../../../UI/Grid';
import {
  type SubscriptionPlanWithPricingSystems,
  getSummarizedSubscriptionPlanFeatures,
} from '../../../Utils/GDevelopServices/Usage';
import { selectMessageByLocale } from '../../../Utils/i18n/MessageByLocale';
import { Trans } from '@lingui/macro';
import Link from '../../../UI/Link';
import Window from '../../../Utils/Window';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import CheckCircleFilled from '../../../UI/CustomSvgIcons/CheckCircleFilled';
import CircledClose from '../../../UI/CustomSvgIcons/CircledClose';
import RaisedButton from '../../../UI/RaisedButton';
import { SubscriptionContext } from '../SubscriptionContext';

const styles = {
  summarizeFeatureRow: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  tableRightItemContainer: {
    width: 120,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletText: { flex: 1 },
  bulletIcon: { width: 20, height: 20 },
  unlimitedContainer: {
    padding: '4px 8px',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    color: 'black',
  },
};

const SubscriptionPlanTableSummary = ({
  subscriptionPlanWithPricingSystems,
  displayedFeatures,
  hideFullTableLink,
  showChooseAction,
}: {|
  subscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems,
  displayedFeatures?: Array<string>,
  hideFullTableLink?: boolean,
  showChooseAction?: boolean,
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { openSubscriptionDialog } = React.useContext(SubscriptionContext);

  return (
    <I18n>
      {({ i18n }) => (
        <Column justifyContent="center" noMargin>
          <div
            style={{
              backgroundColor: gdevelopTheme.paper.backgroundColor.light,
            }}
          >
            <Line alignItems="center" justifyContent="flex-end" noMargin>
              <div style={styles.tableRightItemContainer}>
                <Text size="sub-title">
                  {selectMessageByLocale(
                    i18n,
                    subscriptionPlanWithPricingSystems.nameByLocale
                  )}{' '}
                </Text>
              </div>
            </Line>
          </div>
          {getSummarizedSubscriptionPlanFeatures(
            i18n,
            subscriptionPlanWithPricingSystems
          )
            .filter(
              summarizedFeature =>
                !displayedFeatures ||
                displayedFeatures.includes(summarizedFeature.featureName)
            )
            .map((summarizedFeature, index) => (
              <Column key={index} noMargin>
                <div
                  style={{
                    ...styles.summarizeFeatureRow,
                    borderTop:
                      index !== 0 &&
                      `1px solid ${gdevelopTheme.listItem.separatorColor}`,
                  }}
                >
                  <Line
                    noMargin
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text style={styles.bulletText}>
                      {summarizedFeature.displayedFeatureName}
                    </Text>
                    <div style={styles.tableRightItemContainer}>
                      {summarizedFeature.enabled === 'yes' ? (
                        <CheckCircleFilled
                          style={{
                            ...styles.bulletIcon,
                            color: gdevelopTheme.message.valid,
                          }}
                        />
                      ) : summarizedFeature.enabled === 'no' ? (
                        <CircledClose style={styles.bulletIcon} />
                      ) : summarizedFeature.unlimited ? (
                        <div
                          style={{
                            ...styles.unlimitedContainer,
                            backgroundColor: gdevelopTheme.message.valid,
                          }}
                        >
                          <Text noMargin color="inherit">
                            ∞ <Trans>Unlimited</Trans>
                          </Text>
                        </div>
                      ) : (
                        <Text>{summarizedFeature.description}</Text>
                      )}
                    </div>
                  </Line>
                </div>
              </Column>
            ))}
          {showChooseAction && (
            <Line alignItems="center" justifyContent="flex-end">
              <div style={styles.tableRightItemContainer}>
                <RaisedButton
                  color="premium"
                  label={<Trans>Choose</Trans>}
                  onClick={() => {
                    openSubscriptionDialog({
                      analyticsMetadata: {
                        reason: 'AI requests (subscribe)',
                        recommendedPlanId:
                          subscriptionPlanWithPricingSystems.id,
                        placementId: 'ai-requests',
                      },
                    });
                  }}
                />
              </div>
            </Line>
          )}
          {!hideFullTableLink && (
            <>
              <LargeSpacer />
              <Line noMargin justifyContent="center">
                <Text size="body" color="secondary">
                  <Trans>
                    Compare all the advantages of the different plans in this{' '}
                    <Link
                      href="https://gdevelop.io/pricing#feature-comparison"
                      onClick={() =>
                        Window.openExternalURL(
                          'https://gdevelop.io/pricing#feature-comparison'
                        )
                      }
                    >
                      big feature comparison table
                    </Link>
                    .
                  </Trans>
                </Text>
              </Line>
            </>
          )}
        </Column>
      )}
    </I18n>
  );
};

export default SubscriptionPlanTableSummary;
