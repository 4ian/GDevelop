// @flow
import * as React from 'react';
import MuiDialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import classNames from 'classnames';

import {
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
} from '../../../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';
import Gold from '../Icons/Gold';
import Cross from '../../../UI/CustomSvgIcons/Cross';
import Check from '../../../UI/CustomSvgIcons/Check';
import Apple from '../../../UI/CustomSvgIcons/Apple';
import Android from '../../../UI/CustomSvgIcons/Android';
import Steam from '../../../UI/CustomSvgIcons/Steam';
import classes from './SimplifiedGoldSubscriptionDialog.module.css';

const formatPriceWithCurrency = (
  amountInCents: number,
  currency: string
): string => {
  const amount = amountInCents / 100;
  if (currency === 'USD') return `$${amount.toFixed(2)}`;
  if (currency === 'EUR') return `${amount.toFixed(2)} €`;
  return `${amount.toFixed(2)} ${currency}`;
};

const getMonthlyEquivalentAmountInCents = (
  pricingSystem: SubscriptionPlanPricingSystem
): number => {
  if (pricingSystem.period === 'year') {
    return Math.floor(pricingSystem.amountInCents / 12);
  }

  return pricingSystem.amountInCents;
};

const getDiscountDisplayText = (
  monthlyEquivalentAmountInCents: number,
  monthlyPricingSystem: SubscriptionPlanPricingSystem
): string | null => {
  if (monthlyPricingSystem.amountInCents <= monthlyEquivalentAmountInCents) {
    return null;
  }

  return `-${(
    100 -
    (monthlyEquivalentAmountInCents / monthlyPricingSystem.amountInCents) * 100
  ).toFixed(0)}%`;
};

const Benefit = ({
  children,
  muted,
  gold,
  unavailable,
}: {|
  children: React.Node,
  muted?: boolean,
  gold?: boolean,
  unavailable?: boolean,
|}) => (
  <div
    className={classNames(classes.benefit, {
      [classes.mutedBenefit]: muted,
      [classes.goldBenefit]: gold,
    })}
  >
    {unavailable ? (
      <span className={classes.dotIcon} />
    ) : (
      <Check className={gold ? classes.goldCheckIcon : classes.checkIcon} />
    )}
    <div className={classes.benefitContent}>{children}</div>
  </div>
);

const StoreBadge = ({ icon, label }: {| icon: React.Node, label: string |}) => (
  <span className={classes.storeBadge}>
    {icon}
    {label}
  </span>
);

type Props = {|
  availableSubscriptionPlansWithPrices: ?(SubscriptionPlanWithPricingSystems[]),
  disabled?: boolean,
  onClose: () => void,
  onClickChoosePlan: (
    pricingSystem: SubscriptionPlanPricingSystem | null
  ) => Promise<void>,
|};

const SimplifiedGoldSubscriptionDialog = ({
  availableSubscriptionPlansWithPrices,
  disabled,
  onClose,
  onClickChoosePlan,
}: Props): React.Node => {
  const goldPlan = availableSubscriptionPlansWithPrices
    ? availableSubscriptionPlansWithPrices.find(
        plan => plan.id === 'gdevelop_gold'
      )
    : null;
  const yearlyPricingSystem = goldPlan
    ? goldPlan.pricingSystems.find(price => price.period === 'year')
    : null;
  const monthlyPricingSystem = goldPlan
    ? goldPlan.pricingSystems.find(price => price.period === 'month')
    : null;
  const selectedPricingSystem = yearlyPricingSystem || monthlyPricingSystem;

  const monthlyEquivalentAmountInCents = selectedPricingSystem
    ? getMonthlyEquivalentAmountInCents(selectedPricingSystem)
    : null;
  const discountDisplayText =
    monthlyEquivalentAmountInCents !== null && monthlyPricingSystem
      ? getDiscountDisplayText(
          monthlyEquivalentAmountInCents,
          monthlyPricingSystem
        )
      : null;

  return (
    <MuiDialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        className: classes.dialogPaper,
      }}
    >
      <DialogContent className={classes.dialogContent}>
        <div className={classes.container}>
          <div className={classes.mainContent}>
            <button
              className={classes.closeButton}
              onClick={onClose}
              aria-label="Close"
            >
              <Cross fontSize="small" />
            </button>
            <div className={classes.header}>
              <span className={classes.goldIconContainer}>
                <Gold style={{ width: 30, height: 30 }} />
              </span>
              <div>
                <div className={classes.eyebrow}>
                  You have reached your free limit
                </div>
                <h2 className={classes.title}>Upgrade to GDevelop Gold</h2>
              </div>
            </div>

            <div className={classes.comparisonGrid}>
              <div className={classes.freeCard}>
                <div className={classes.cardTitle}>Free</div>
                <div className={classes.benefitsList}>
                  <Benefit>Unlimited game creation in the editor</Benefit>
                  <Benefit muted unavailable>
                    AI assistant -{' '}
                    <span className={classes.highlight}>3 prompts</span>
                  </Benefit>
                  <Benefit muted unavailable>
                    Publish on the{' '}
                    <span className={classes.highlight}>GDevelop store</span>{' '}
                    only
                  </Benefit>
                </div>
              </div>
              <div className={classes.goldCard}>
                <div className={classes.goldBadge}>Gold</div>
                <div className={classes.goldCardTitle}>Everything unlocked</div>
                <div className={classes.benefitsList}>
                  <Benefit gold>Unlimited game creation in the editor</Benefit>
                  <Benefit gold>
                    Extended AI assistant usage -{' '}
                    <span className={classes.goldHighlight}>1,000 prompts</span>
                  </Benefit>
                  <Benefit gold>
                    <div>
                      Publish to{' '}
                      <span className={classes.goldHighlight}>all stores</span>
                      <div className={classes.storeBadges}>
                        <StoreBadge
                          icon={<Apple className={classes.storeBadgeIcon} />}
                          label="iOS"
                        />
                        <StoreBadge
                          icon={<Android className={classes.storeBadgeIcon} />}
                          label="Android"
                        />
                        <StoreBadge
                          icon={<Steam className={classes.storeBadgeIcon} />}
                          label="Steam"
                        />
                        <StoreBadge
                          icon={<span className={classes.gdevelopBadgeIcon} />}
                          label="GDevelop"
                        />
                      </div>
                    </div>
                  </Benefit>
                </div>
              </div>
            </div>
          </div>

          <div className={classes.priceBar}>
            {!selectedPricingSystem ||
            monthlyEquivalentAmountInCents === null ? (
              <PlaceholderLoader />
            ) : (
              <>
                <div className={classes.priceDetails}>
                  <span className={classes.price}>
                    {formatPriceWithCurrency(
                      monthlyEquivalentAmountInCents,
                      selectedPricingSystem.currency
                    )}
                  </span>
                  <span className={classes.period}>/ month</span>
                  {monthlyPricingSystem &&
                    selectedPricingSystem.period === 'year' && (
                      <span className={classes.originalPrice}>
                        {formatPriceWithCurrency(
                          monthlyPricingSystem.amountInCents,
                          monthlyPricingSystem.currency
                        )}
                      </span>
                    )}
                  {discountDisplayText && (
                    <span className={classes.discountBadge}>
                      {discountDisplayText}
                    </span>
                  )}
                  <span className={classes.billingNote}>
                    {selectedPricingSystem.period === 'year'
                      ? 'Billed annually - cancel anytime'
                      : 'Billed monthly - cancel anytime'}
                  </span>
                </div>
                <div className={classes.ctaColumn}>
                  <button
                    className={classes.ctaButton}
                    disabled={disabled}
                    onClick={() => onClickChoosePlan(selectedPricingSystem)}
                  >
                    Upgrade to Gold -&gt;
                  </button>
                  <button className={classes.continueButton} onClick={onClose}>
                    Continue for free
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </MuiDialog>
  );
};

export default SimplifiedGoldSubscriptionDialog;
