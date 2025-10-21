// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import Text from '../../../UI/Text';
import { Column, Line, Spacer } from '../../../UI/Grid';
import {
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
  EDUCATION_PLAN_MAX_SEATS,
  EDUCATION_PLAN_MIN_SEATS,
} from '../../../Utils/GDevelopServices/Usage';
import { selectMessageByLocale } from '../../../Utils/i18n/MessageByLocale';
import { getPlanIcon } from '../PlanCard';
import { ColumnStackLayout } from '../../../UI/Layout';
import { t, Trans } from '@lingui/macro';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import classes from './SubscriptionPlanPricingSummary.module.css';
import Paper from '../../../UI/Paper';
import RaisedButton from '../../../UI/RaisedButton';
import LeftLoader from '../../../UI/LeftLoader';
import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import DiscountFlame from '../../../UI/HotMessage/DiscountFlame';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import Chip from '../../../UI/Chip';

const styles = {
  paper: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    zIndex: 2,
    padding: 16,
  },
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
  discountChip: { height: 24, backgroundColor: '#F03F18', color: 'white' },
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

const SubscriptionPlanPricingSummary = ({
  subscriptionPlanWithPricingSystems,
  disabled,
  onClickChoosePlan,
  seatsCount,
  setSeatsCount,
  period,
  setPeriod,
  onlyShowDiscountedPrice,
}: {|
  subscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems,
  disabled?: boolean,
  onClickChoosePlan: (
    pricingSystem: SubscriptionPlanPricingSystem
  ) => Promise<void>,
  seatsCount: number,
  setSeatsCount: (seatsCount: number) => void,
  period: 'year' | 'month',
  setPeriod: ('year' | 'month') => void,
  onlyShowDiscountedPrice?: boolean,
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const planIcon = getPlanIcon({
    planId: subscriptionPlanWithPricingSystems.id,
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
              {subscriptionPlanWithPricingSystems.id === 'gdevelop_education' &&
                !onlyShowDiscountedPrice && (
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
              {!onlyShowDiscountedPrice && (
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
                      control={<Radio color="secondary" disabled={disabled} />}
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
                          <Column alignItems="center" justifyContent="center">
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
                      control={<Radio color="secondary" disabled={disabled} />}
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
              )}
              {!onlyShowDiscountedPrice && (
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
              )}
              {onlyShowDiscountedPrice && (
                <Column>
                  <Line alignItems="center" justifyContent="center">
                    <span style={styles.discountedPrice}>
                      <Text noMargin color="secondary">
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
                    </span>
                  </Line>
                  <Line noMargin alignItems="center" justifyContent="center">
                    <Chip
                      label={<Trans>Included</Trans>}
                      style={styles.discountChip}
                    />
                  </Line>
                </Column>
              )}
            </ColumnStackLayout>
          </Paper>
        </div>
      )}
    </I18n>
  );
};

export default SubscriptionPlanPricingSummary;
