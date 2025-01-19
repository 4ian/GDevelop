// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import Text from '../../../UI/Text';
import { Column, LargeSpacer, Line, Spacer } from '../../../UI/Grid';
import {
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
  EDUCATION_PLAN_MAX_SEATS,
  EDUCATION_PLAN_MIN_SEATS,
  getSummarizedSubscriptionPlanFeatures,
} from '../../../Utils/GDevelopServices/Usage';
import { selectMessageByLocale } from '../../../Utils/i18n/MessageByLocale';
import { getPlanIcon } from '../PlanCard';
import RedemptionCodeIcon from '../../../UI/CustomSvgIcons/RedemptionCode';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import { t, Trans } from '@lingui/macro';
import Link from '../../../UI/Link';
import Window from '../../../Utils/Window';
import FlatButton from '../../../UI/FlatButton';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import CheckCircleFilled from '../../../UI/CustomSvgIcons/CheckCircleFilled';
import ShieldChecked from '../../../UI/CustomSvgIcons/ShieldChecked';
import classes from './PromotionSubscriptionPlan.module.css';
import Paper from '../../../UI/Paper';
import RaisedButton from '../../../UI/RaisedButton';
import LeftLoader from '../../../UI/LeftLoader';
import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import DiscountFlame from '../../../UI/HotMessage/DiscountFlame';
import ThumbsUp from '../../../UI/CustomSvgIcons/ThumbsUp';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import CircledClose from '../../../UI/CustomSvgIcons/CircledClose';

const styles = {
  simpleSizeContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doubleSizeContainer: {
    display: 'flex',
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  paper: { flex: 1, zIndex: 2, padding: 16 },
  descriptionContainer: { minHeight: 70 }, // Keep height the same for 1 or 2 lines.
  discountContainer: {
    padding: '4px 8px',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
  },
  radioGroup: { flex: 1 },
  formControlLabel: {
    borderRadius: 4,
    // Override MUI margins
    marginLeft: 0,
    marginRight: 0,
    cursor: 'default',
  },
  discountedPrice: { textDecoration: 'line-through' },
  unlimitedContainer: {
    padding: '4px 8px',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    color: 'black',
  },
};

const formatPriceWithCurrency = (amountInCents: number, currency: string) => {
  if (currency === 'USD') {
    return `$${amountInCents / 100}`;
  }
  return `${amountInCents / 100}${currency === 'EUR' ? '€' : currency}`;
};

const getYearlyDiscountDisplayText = (
  monthlyPricingSystem: SubscriptionPlanPricingSystem,
  yearlyPricingSystem: SubscriptionPlanPricingSystem
): string | null => {
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

const PromotionSubscriptionPlan = ({
  subscriptionPlanWithPricingSystems,
  disabled,
  onClickRedeemCode,
  onClickChoosePlan,
  seatsCount,
  setSeatsCount,
}: {|
  subscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems,
  disabled?: boolean,
  onClickRedeemCode: () => void,
  onClickChoosePlan: (
    pricingSystem: SubscriptionPlanPricingSystem
  ) => Promise<void>,
  seatsCount: number,
  setSeatsCount: (seatsCount: number) => void,
|}) => {
  const { windowSize } = useResponsiveWindowSize();
  const isLargeScreen = windowSize === 'large' || windowSize === 'xlarge';
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [period, setPeriod] = React.useState<'year' | 'month'>('year');

  const planIcon = getPlanIcon({
    subscriptionPlan: subscriptionPlanWithPricingSystems,
    logoSize: 12,
  });

  const selectedPricingSystem = subscriptionPlanWithPricingSystems.pricingSystems.find(
    pricingSystem => pricingSystem.period === period
  );
  const yearlyPlanPrice = subscriptionPlanWithPricingSystems.pricingSystems.find(
    price => price.period === 'year'
  );
  const monthlyPlanPrice = subscriptionPlanWithPricingSystems.pricingSystems.find(
    price => price.period === 'month'
  );

  if (!selectedPricingSystem || !yearlyPlanPrice || !monthlyPlanPrice) {
    console.error(
      'No pricing system found for period',
      period,
      'in',
      subscriptionPlanWithPricingSystems
    );
    return null;
  }

  const yearlyPriceInCentsWithMonthlyPlan = Math.floor(
    monthlyPlanPrice.amountInCents * 12
  );
  const yearlyDiscountDisplayText = getYearlyDiscountDisplayText(
    monthlyPlanPrice,
    yearlyPlanPrice
  );

  return (
    <I18n>
      {({ i18n }) => (
        <ResponsiveLineStackLayout expand noColumnMargin>
          <div
            style={
              isLargeScreen
                ? styles.doubleSizeContainer
                : styles.simpleSizeContainer
            }
          >
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
              ).map((summarizedFeature, index) => (
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
            </Column>
          </div>
          <div style={styles.simpleSizeContainer}>
            <ColumnStackLayout expand noMargin>
              <div className={classes.choosePlanContainer}>
                <Paper background="dark" style={styles.paper}>
                  <ColumnStackLayout>
                    <Line alignItems="center" justifyContent="center">
                      {planIcon}
                      <Text size="block-title">
                        <span style={{ textTransform: 'uppercase' }}>
                          <b>
                            {selectMessageByLocale(
                              i18n,
                              subscriptionPlanWithPricingSystems.nameByLocale
                            )}
                          </b>
                        </span>
                      </Text>
                    </Line>
                    <Text size="section-title" noMargin align="center">
                      <div style={styles.descriptionContainer}>
                        {selectMessageByLocale(
                          i18n,
                          subscriptionPlanWithPricingSystems.descriptionByLocale
                        )}
                      </div>
                    </Text>
                    {subscriptionPlanWithPricingSystems.id ===
                      'gdevelop_education' && (
                      <ColumnStackLayout key="options" expand noMargin>
                        <SemiControlledTextField
                          value={seatsCount.toString()}
                          floatingLabelFixed
                          fullWidth
                          floatingLabelText={<Trans>Number of seats</Trans>}
                          commitOnBlur
                          type="number"
                          onChange={value => {
                            const newValue = parseInt(value);
                            setSeatsCount(
                              Math.min(
                                EDUCATION_PLAN_MAX_SEATS,
                                Math.max(
                                  Number.isNaN(newValue)
                                    ? EDUCATION_PLAN_MIN_SEATS
                                    : newValue,
                                  EDUCATION_PLAN_MIN_SEATS
                                )
                              )
                            );
                          }}
                          min={EDUCATION_PLAN_MIN_SEATS}
                          max={EDUCATION_PLAN_MAX_SEATS}
                          step={1}
                          helperMarkdownText={i18n._(
                            t`As a teacher, you will use one seat in the plan so make sure to include yourself!`
                          )}
                        />
                      </ColumnStackLayout>
                    )}
                    <Line noMargin expand>
                      <RadioGroup
                        value={period}
                        onChange={event => {
                          setPeriod(event.target.value);
                        }}
                        style={styles.radioGroup}
                      >
                        <FormControlLabel
                          style={{
                            ...styles.formControlLabel,
                            backgroundColor:
                              period === 'year'
                                ? gdevelopTheme.paper.backgroundColor.light
                                : gdevelopTheme.paper.backgroundColor.medium,
                          }}
                          value="year"
                          control={
                            <Radio color="secondary" disabled={disabled} />
                          }
                          label={
                            <Line>
                              <Column>
                                <Text noMargin color="inherit" size="sub-title">
                                  {!yearlyPlanPrice.isPerUser ? (
                                    <Trans>
                                      Yearly,
                                      {formatPriceWithCurrency(
                                        yearlyPlanPrice.amountInCents,
                                        yearlyPlanPrice.currency
                                      )}
                                    </Trans>
                                  ) : (
                                    <Trans>
                                      Yearly,
                                      {formatPriceWithCurrency(
                                        yearlyPlanPrice.amountInCents,
                                        yearlyPlanPrice.currency
                                      )}{' '}
                                      per seat
                                    </Trans>
                                  )}
                                </Text>
                                <Text color="secondary" noMargin>
                                  <Trans>
                                    Instead of{' '}
                                    <span style={styles.discountedPrice}>
                                      {formatPriceWithCurrency(
                                        yearlyPriceInCentsWithMonthlyPlan,
                                        yearlyPlanPrice.currency
                                      )}
                                    </span>
                                  </Trans>
                                </Text>
                              </Column>
                              <Column
                                alignItems="center"
                                justifyContent="center"
                              >
                                <span
                                  style={{
                                    ...styles.discountContainer,
                                    backgroundColor:
                                      gdevelopTheme.message.hot.backgroundColor,
                                    color: gdevelopTheme.message.hot.color,
                                  }}
                                >
                                  <DiscountFlame fontSize="small" />
                                  <Spacer />
                                  <Text color="inherit" noMargin>
                                    {yearlyDiscountDisplayText}
                                  </Text>
                                </span>
                              </Column>
                            </Line>
                          }
                        />
                        <Spacer />
                        <FormControlLabel
                          style={{
                            ...styles.formControlLabel,
                            backgroundColor:
                              period === 'month'
                                ? gdevelopTheme.paper.backgroundColor.light
                                : gdevelopTheme.paper.backgroundColor.medium,
                          }}
                          value="month"
                          control={
                            <Radio color="secondary" disabled={disabled} />
                          }
                          label={
                            <Line>
                              <Column>
                                <Text noMargin size="sub-title" color="inherit">
                                  {!monthlyPlanPrice.isPerUser ? (
                                    <Trans>
                                      Monthly,
                                      {formatPriceWithCurrency(
                                        monthlyPlanPrice.amountInCents,
                                        monthlyPlanPrice.currency
                                      )}
                                    </Trans>
                                  ) : (
                                    <Trans>
                                      Monthly,
                                      {formatPriceWithCurrency(
                                        monthlyPlanPrice.amountInCents,
                                        monthlyPlanPrice.currency
                                      )}{' '}
                                      per seat
                                    </Trans>
                                  )}
                                </Text>
                              </Column>
                            </Line>
                          }
                        />
                      </RadioGroup>
                    </Line>
                    <Line alignItems="center" justifyContent="center">
                      <RaisedButton
                        color="premium"
                        key="upgrade"
                        disabled={disabled}
                        label={
                          <LeftLoader isLoading={disabled}>
                            <Text size="block-title" color="inherit">
                              <Trans>Choose this plan</Trans>
                            </Text>
                          </LeftLoader>
                        }
                        onClick={() => onClickChoosePlan(selectedPricingSystem)}
                        size="large"
                        fullWidth
                      />
                    </Line>
                  </ColumnStackLayout>
                </Paper>
              </div>
              <LineStackLayout justifyContent="center" alignItems="center">
                <ShieldChecked style={{ color: gdevelopTheme.message.valid }} />
                <Text color="secondary">
                  <Trans>Paypal secure</Trans>
                </Text>
                <ShieldChecked style={{ color: gdevelopTheme.message.valid }} />
                <Text color="secondary">
                  <Trans>Stripe secure</Trans>
                </Text>
                <ThumbsUp
                  style={{
                    color: gdevelopTheme.message.valid,
                    width: 20,
                    height: 20,
                  }}
                />
                <Text color="secondary">
                  <Trans>Cancel anytime</Trans>
                </Text>
              </LineStackLayout>
              <FlatButton
                leftIcon={<RedemptionCodeIcon />}
                label={<Trans>Redeem a code</Trans>}
                key="redeem-code"
                disabled={disabled}
                onClick={onClickRedeemCode}
                primary
              />
            </ColumnStackLayout>
          </div>
        </ResponsiveLineStackLayout>
      )}
    </I18n>
  );
};

export default PromotionSubscriptionPlan;
