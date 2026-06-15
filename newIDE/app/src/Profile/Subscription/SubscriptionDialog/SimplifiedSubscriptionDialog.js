// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../../../UI/Dialog';
import AuthenticatedUserContext from '../../AuthenticatedUserContext';
import {
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
} from '../../../Utils/GDevelopServices/Usage';
import Text from '../../../UI/Text';
import { Column } from '../../../UI/Grid';
import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';
import RaisedButton from '../../../UI/RaisedButton';
import FlatButton from '../../../UI/FlatButton';
import LeftLoader from '../../../UI/LeftLoader';
import Paper from '../../../UI/Paper';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import { getPlanIcon, formatPriceWithCurrency } from '../PlanSmallCard';
import Check from '../../../UI/CustomSvgIcons/Check';
import Apple from '../../../UI/CustomSvgIcons/Apple';
import Android from '../../../UI/CustomSvgIcons/Android';
import Steam from '../../../UI/CustomSvgIcons/Steam';
import GDevelopGLogo from '../../../UI/CustomSvgIcons/GDevelopGLogo';
import { useSubscriptionPlanChange } from './useSubscriptionPlanChange';

// The plan promoted by this dialog. Kept simple on purpose: this dialog is an
// alternate, streamlined way to upgrade to GDevelop Gold.
const PROMOTED_PLAN_ID = 'gdevelop_gold';

// Accent colors matching the GDevelop Gold branding. They are not part of the
// theme as they are specific to this marketing dialog.
const goldAccentColor = '#FFD789';
const goldBorderColor = 'rgba(255,194,75,.55)';

const styles = {
  columnsContainer: {
    display: 'flex',
    gap: 16,
    alignItems: 'stretch',
    flexWrap: 'wrap',
  },
  column: {
    flex: 1,
    minWidth: 220,
    borderRadius: 16,
    padding: '20px 18px',
    boxSizing: 'border-box',
  },
  goldColumn: {
    flex: 1.25,
    minWidth: 240,
    borderRadius: 16,
    padding: '20px 18px',
    boxSizing: 'border-box',
    border: `1px solid ${goldBorderColor}`,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -11,
    left: 18,
    borderRadius: 999,
    padding: '3px 10px',
    backgroundColor: goldAccentColor,
    color: '#2A1B00',
  },
  benefitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  benefitLine: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginTop: 7,
    flexShrink: 0,
  },
  checkIcon: {
    width: 18,
    height: 18,
    flexShrink: 0,
  },
  storesChips: {
    display: 'flex',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  storeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    padding: '5px 9px',
  },
  storeChipIcon: {
    width: 14,
    height: 14,
  },
  priceBarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    flexWrap: 'wrap',
  },
  priceLine: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
  },
  strikethrough: { textDecoration: 'line-through' },
  discountChip: {
    borderRadius: 6,
    padding: '2px 8px',
  },
};

const getMonthlyEquivalentOfYearlyAmountInCents = (
  yearlyPricingSystem: SubscriptionPlanPricingSystem
): number => Math.floor(yearlyPricingSystem.amountInCents / 12);

const getDiscountPercentDisplay = (
  monthlyPricingSystem: SubscriptionPlanPricingSystem,
  yearlyPricingSystem: SubscriptionPlanPricingSystem
): string =>
  '-' +
  (
    100 -
    (yearlyPricingSystem.amountInCents /
      (monthlyPricingSystem.amountInCents * 12)) *
      100
  ).toFixed(0) +
  '%';

type Props = {|
  onClose: () => void,
  availableSubscriptionPlansWithPrices: ?(SubscriptionPlanWithPricingSystems[]),
  onOpenPendingDialog: (open: boolean) => void,
  couponCode?: ?string,
|};

/**
 * A simplified, marketing-oriented subscription dialog that contrasts the free
 * plan with GDevelop Gold and lets the user upgrade in a single click.
 * Benefits are hardcoded in English; prices are read from the API like the
 * regular SubscriptionDialog.
 */
export default function SimplifiedSubscriptionDialog({
  onClose,
  availableSubscriptionPlansWithPrices,
  onOpenPendingDialog,
  couponCode,
}: Props): React.Node {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { isMobile } = useResponsiveWindowSize();

  const {
    buyUpdateOrCancelPlan,
    isChangingSubscription,
    cancelReasonDialog,
  } = useSubscriptionPlanChange({
    onClose,
    onOpenPendingDialog,
    couponCode,
  });

  const goldPlanWithPricingSystems = React.useMemo(
    () =>
      availableSubscriptionPlansWithPrices
        ? availableSubscriptionPlansWithPrices.find(
            planWithPricingSystems =>
              planWithPricingSystems.id === PROMOTED_PLAN_ID
          )
        : null,
    [availableSubscriptionPlansWithPrices]
  );

  const yearlyPricingSystem =
    goldPlanWithPricingSystems &&
    goldPlanWithPricingSystems.pricingSystems.find(
      pricingSystem => pricingSystem.period === 'year'
    );
  const monthlyPricingSystem =
    goldPlanWithPricingSystems &&
    goldPlanWithPricingSystems.pricingSystems.find(
      pricingSystem => pricingSystem.period === 'month'
    );

  const isLoading =
    authenticatedUser.loginState === 'loggingIn' || isChangingSubscription;

  const validColor = gdevelopTheme.message.valid;
  const secondaryTextColor = gdevelopTheme.text.color.secondary;

  const renderBenefit = (
    icon: 'check' | 'dot',
    label: React.Node,
    {
      highlighted,
      extraContent,
    }: {| highlighted?: boolean, extraContent?: React.Node |} = {}
  ) => (
    <div style={styles.benefitLine}>
      {icon === 'check' ? (
        <Check
          style={{
            ...styles.checkIcon,
            color: highlighted ? validColor : secondaryTextColor,
          }}
        />
      ) : (
        <span
          style={{ ...styles.bulletDot, backgroundColor: secondaryTextColor }}
        />
      )}
      <div>
        <Text noMargin color={highlighted ? 'primary' : 'secondary'}>
          {label}
        </Text>
        {extraContent}
      </div>
    </div>
  );

  const renderStoreChip = (icon: React.Node, label: React.Node) => (
    <span
      style={{
        ...styles.storeChip,
        backgroundColor: gdevelopTheme.paper.backgroundColor.light,
      }}
    >
      {icon}
      <Text noMargin size="body-small" displayInlineAsSpan>
        {label}
      </Text>
    </span>
  );

  return (
    <I18n>
      {({ i18n }) => {
        const isReady =
          goldPlanWithPricingSystems &&
          yearlyPricingSystem &&
          monthlyPricingSystem &&
          authenticatedUser.loginState !== 'loggingIn';

        return (
          <>
            <Dialog
              title={<Trans>Upgrade to GDevelop Gold</Trans>}
              subtitle={<Trans>You've reached your free limit</Trans>}
              open
              onRequestClose={onClose}
              maxWidth="md"
              flexColumnBody
              secondaryActions={
                isReady
                  ? [
                      <FlatButton
                        key="continue-free"
                        label={<Trans>Continue with Free</Trans>}
                        onClick={onClose}
                        disabled={isLoading}
                      />,
                    ]
                  : undefined
              }
              actions={
                isReady
                  ? [
                      <RaisedButton
                        key="upgrade"
                        color="premium"
                        disabled={isLoading}
                        label={
                          <LeftLoader isLoading={isLoading}>
                            <Trans>Upgrade to Gold →</Trans>
                          </LeftLoader>
                        }
                        onClick={async () => {
                          if (!authenticatedUser.authenticated) {
                            authenticatedUser.onOpenCreateAccountDialog();
                            return;
                          }
                          // Upgrade using the yearly pricing system (billed
                          // annually), matching the headline price below.
                          await buyUpdateOrCancelPlan(
                            i18n,
                            yearlyPricingSystem || null
                          );
                        }}
                      />,
                    ]
                  : undefined
              }
            >
              {!isReady || !yearlyPricingSystem || !monthlyPricingSystem ? (
                <PlaceholderLoader />
              ) : (
                <ColumnStackLayout noMargin>
                  <LineStackLayout noMargin alignItems="center">
                    {getPlanIcon({
                      planId: PROMOTED_PLAN_ID,
                      logoSize: 24,
                    })}
                    <Text noMargin>
                      <Trans>See everything you unlock, side by side.</Trans>
                    </Text>
                  </LineStackLayout>
                  <div
                    style={{
                      ...styles.columnsContainer,
                      flexDirection: isMobile ? 'column' : 'row',
                    }}
                  >
                    {/* Free column */}
                    <Paper
                      background="medium"
                      variant="outlined"
                      style={styles.column}
                    >
                      <ColumnStackLayout noMargin>
                        <Text noMargin color="secondary" size="body-small">
                          <span style={{ textTransform: 'uppercase' }}>
                            <b>
                              <Trans>Free</Trans>
                            </b>
                          </span>
                        </Text>
                        <div style={styles.benefitsList}>
                          {renderBenefit(
                            'check',
                            <Trans>Unlimited game creation in the editor</Trans>
                          )}
                          {renderBenefit(
                            'dot',
                            <Trans>AI assistant — 3 prompts</Trans>
                          )}
                          {renderBenefit(
                            'dot',
                            <Trans>Publish on the GDevelop store only</Trans>
                          )}
                        </div>
                      </ColumnStackLayout>
                    </Paper>

                    {/* Gold column */}
                    <Paper
                      background="medium"
                      variant="outlined"
                      style={styles.goldColumn}
                    >
                      <span style={styles.badge}>
                        <Text
                          noMargin
                          color="inherit"
                          size="body-small"
                          displayInlineAsSpan
                        >
                          <b>
                            <Trans>Gold</Trans>
                          </b>
                        </Text>
                      </span>
                      <ColumnStackLayout noMargin>
                        <Text noMargin size="body-small" color="inherit">
                          <span
                            style={{
                              textTransform: 'uppercase',
                              color: goldAccentColor,
                            }}
                          >
                            <b>
                              <Trans>Everything unlocked</Trans>
                            </b>
                          </span>
                        </Text>
                        <div style={styles.benefitsList}>
                          {renderBenefit(
                            'check',
                            <Trans>
                              Unlimited game creation in the editor
                            </Trans>,
                            { highlighted: true }
                          )}
                          {renderBenefit(
                            'check',
                            <Trans>
                              Extended AI assistant usage — 1,000 prompts
                            </Trans>,
                            { highlighted: true }
                          )}
                          {renderBenefit(
                            'check',
                            <Trans>Publish on all stores</Trans>,
                            {
                              highlighted: true,
                              extraContent: (
                                <div style={styles.storesChips}>
                                  {renderStoreChip(
                                    <Apple style={styles.storeChipIcon} />,
                                    <Trans>iOS</Trans>
                                  )}
                                  {renderStoreChip(
                                    <Android style={styles.storeChipIcon} />,
                                    <Trans>Android</Trans>
                                  )}
                                  {renderStoreChip(
                                    <Steam style={styles.storeChipIcon} />,
                                    <Trans>Steam</Trans>
                                  )}
                                  {renderStoreChip(
                                    <GDevelopGLogo
                                      style={styles.storeChipIcon}
                                    />,
                                    'GDevelop'
                                  )}
                                </div>
                              ),
                            }
                          )}
                        </div>
                      </ColumnStackLayout>
                    </Paper>
                  </div>

                  {/* Price + info bar */}
                  <div style={styles.priceBarContainer}>
                    <Column noMargin>
                      <div style={styles.priceLine}>
                        <Text noMargin size="title">
                          <b>
                            {formatPriceWithCurrency(
                              getMonthlyEquivalentOfYearlyAmountInCents(
                                yearlyPricingSystem
                              ),
                              yearlyPricingSystem.currency
                            )}
                          </b>
                        </Text>
                        <Text noMargin color="secondary">
                          <Trans>/ month</Trans>
                        </Text>
                        <Text noMargin color="secondary">
                          <span style={styles.strikethrough}>
                            {formatPriceWithCurrency(
                              monthlyPricingSystem.amountInCents,
                              monthlyPricingSystem.currency
                            )}
                          </span>
                        </Text>
                        <span
                          style={{
                            ...styles.discountChip,
                            backgroundColor: validColor,
                            color: 'black',
                          }}
                        >
                          <Text
                            noMargin
                            color="inherit"
                            size="body-small"
                            displayInlineAsSpan
                          >
                            <b>
                              {getDiscountPercentDisplay(
                                monthlyPricingSystem,
                                yearlyPricingSystem
                              )}
                            </b>
                          </Text>
                        </span>
                      </div>
                      <Text noMargin color="secondary" size="body-small">
                        <Trans>Billed annually · cancel anytime</Trans>
                      </Text>
                    </Column>
                  </div>
                </ColumnStackLayout>
              )}
            </Dialog>
            {cancelReasonDialog}
          </>
        );
      }}
    </I18n>
  );
}
