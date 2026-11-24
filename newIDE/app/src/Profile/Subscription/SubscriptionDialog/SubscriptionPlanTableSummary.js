// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
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
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';

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
  comparisonTableRightItemContainer: {
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  lostFeatureValue: { opacity: 0.5, textDecoration: 'line-through' },
};

const SubscriptionPlanTableSummary = ({
  subscriptionPlanWithPricingSystems,
  displayedFeatures,
  hideFullTableLink,
  actionLabel,
  nextSubscriptionPlanWithPricingSystems,
}: {|
  subscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems,
  displayedFeatures?: Array<string>,
  hideFullTableLink?: boolean,
  actionLabel?: React.Node,
  /** Displayed in a column after the plan, which is shown as lost where they differ. */
  nextSubscriptionPlanWithPricingSystems?: ?SubscriptionPlanWithPricingSystems,
|}): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { openSubscriptionDialog } = React.useContext(SubscriptionContext);

  type FeatureValue = {
    +enabled?: ?('yes' | 'no'),
    +unlimited?: ?boolean,
    +description?: ?string,
    ...
  };

  const { isMobile } = useResponsiveWindowSize();

  const columnStyle = nextSubscriptionPlanWithPricingSystems
    ? {
        ...styles.comparisonTableRightItemContainer,
        width: isMobile ? 90 : 180,
      }
    : styles.tableRightItemContainer;

  const renderFeatureValue = (feature: FeatureValue) =>
    feature.enabled === 'yes' ? (
      <CheckCircleFilled
        style={{
          ...styles.bulletIcon,
          color: gdevelopTheme.message.valid,
        }}
      />
    ) : feature.enabled === 'no' ? (
      <CircledClose style={styles.bulletIcon} />
    ) : feature.unlimited ? (
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
      <Text>{feature.description}</Text>
    );

  const getNextFeatureValue = (
    i18n: I18nType,
    nextPlan: SubscriptionPlanWithPricingSystems,
    featureName: string
  ): FeatureValue => {
    const nextFeature = nextPlan.fullFeatures.find(
      feature => feature.featureName === featureName
    );
    if (!nextFeature) return { enabled: 'no' };
    return {
      enabled: nextFeature.enabled,
      unlimited: nextFeature.unlimited,
      description: nextFeature.descriptionByLocale
        ? selectMessageByLocale(i18n, nextFeature.descriptionByLocale)
        : null,
    };
  };

  const isSameFeatureValue = (a: FeatureValue, b: FeatureValue) =>
    (a.enabled || null) === (b.enabled || null) &&
    !!a.unlimited === !!b.unlimited &&
    (a.description || null) === (b.description || null);

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
              <div style={columnStyle}>
                <Text
                  size="sub-title"
                  color={
                    nextSubscriptionPlanWithPricingSystems
                      ? 'secondary'
                      : undefined
                  }
                >
                  {selectMessageByLocale(
                    i18n,
                    subscriptionPlanWithPricingSystems.nameByLocale
                  )}{' '}
                </Text>
              </div>
              {nextSubscriptionPlanWithPricingSystems && (
                <div style={columnStyle}>
                  <Text size="sub-title">
                    {selectMessageByLocale(
                      i18n,
                      nextSubscriptionPlanWithPricingSystems.nameByLocale
                    )}
                  </Text>
                </div>
              )}
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
            .map((summarizedFeature, index) => {
              const nextFeatureValue = nextSubscriptionPlanWithPricingSystems
                ? getNextFeatureValue(
                    i18n,
                    nextSubscriptionPlanWithPricingSystems,
                    summarizedFeature.featureName
                  )
                : null;
              return (
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
                      {/* $FlowFixMe[incompatible-type] */}
                      <Text style={styles.bulletText}>
                        {summarizedFeature.displayedFeatureName}
                      </Text>
                      <div
                        style={
                          nextFeatureValue &&
                          !isSameFeatureValue(
                            summarizedFeature,
                            nextFeatureValue
                          )
                            ? {
                                ...columnStyle,
                                ...styles.lostFeatureValue,
                              }
                            : columnStyle
                        }
                      >
                        {renderFeatureValue(summarizedFeature)}
                      </div>
                      {nextFeatureValue && (
                        <div style={columnStyle}>
                          {renderFeatureValue(nextFeatureValue)}
                        </div>
                      )}
                    </Line>
                  </div>
                </Column>
              );
            })}
          {actionLabel && (
            <Line alignItems="center" justifyContent="flex-end">
              <div style={styles.tableRightItemContainer}>
                <RaisedButton
                  color="premium"
                  label={actionLabel}
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
