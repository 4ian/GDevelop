// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import ButtonBase from '@material-ui/core/ButtonBase';
import { shouldValidate } from '../../../UI/KeyboardShortcuts/InteractionKeys';
import Text from '../../../UI/Text';
import { Column } from '../../../UI/Grid';
import { type SubscriptionPlanWithPricingSystems } from '../../../Utils/GDevelopServices/Usage';
import { selectMessageByLocale } from '../../../Utils/i18n/MessageByLocale';
import { getPlanIcon } from '../PlanCard';
import { LineStackLayout, ResponsiveLineStackLayout } from '../../../UI/Layout';
import classes from './SubscriptionOptions.module.css';
import classNames from 'classnames';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import { Trans } from '@lingui/macro';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';

const styles = {
  buttonBase: {
    height: '100%',
    width: '100%',
    borderRadius: 8,
    padding: 8,
    cursor: 'default',
    overflow: 'hidden',
    boxSizing: 'border-box',
    alignItems: 'flex-start',
  },
};

type Props = {|
  children: React.Node,
  onClick: () => void,
  selected: boolean,
  recommended: boolean,
  disabled?: boolean,
|};

const SubscriptionOptionButton = ({
  children,
  onClick,
  selected,
  recommended,
  disabled,
}: Props) => {
  const { windowSize, isMobile } = useResponsiveWindowSize();
  const isMobileOrMediumScreen = isMobile || windowSize === 'medium';
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <div className={classes.optionAndBadgeContainer}>
      {recommended && (
        <div
          className={classNames({
            [classes.recommendedBadge]: true,
            [classes.mobile]: isMobile,
          })}
        >
          <Text color="inherit" noMargin>
            {isMobileOrMediumScreen ? (
              <Trans>Recommended</Trans>
            ) : (
              <Trans>Recommended for you</Trans>
            )}
          </Text>
        </div>
      )}
      <div
        className={classNames({
          [classes.optionContainer]: true,
          [classes.selected]: selected,
        })}
      >
        <ButtonBase
          onClick={onClick}
          elevation={2}
          style={{
            ...styles.buttonBase,
            backgroundColor: selected
              ? gdevelopTheme.paper.backgroundColor.dark
              : gdevelopTheme.paper.backgroundColor.medium,
          }}
          tabIndex={0}
          onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
            if (shouldValidate(event) && !selected) {
              onClick();
            }
          }}
          disableTouchRipple={selected} // Avoid ripple effect even if already selected.
          disabled={disabled}
        >
          {children}
        </ButtonBase>
      </div>
    </div>
  );
};

const SubscriptionOptions = ({
  subscriptionPlansWithPricingSystems,
  selectedPlanId,
  recommendedPlanId,
  onClick,
  disabled,
}: {|
  subscriptionPlansWithPricingSystems: SubscriptionPlanWithPricingSystems[],
  selectedPlanId: string,
  recommendedPlanId: string,
  onClick: string => void,
  disabled?: boolean,
|}) => {
  return (
    <I18n>
      {({ i18n }) => (
        <ResponsiveLineStackLayout noMargin>
          {subscriptionPlansWithPricingSystems.map(
            (subscriptionPlanWithPricingSystems, index) => {
              const isSelected =
                selectedPlanId === subscriptionPlanWithPricingSystems.id;
              const isRecommended =
                recommendedPlanId === subscriptionPlanWithPricingSystems.id;
              return (
                <Column
                  expand
                  noMargin
                  key={subscriptionPlanWithPricingSystems.id}
                >
                  <SubscriptionOptionButton
                    onClick={() =>
                      onClick(subscriptionPlanWithPricingSystems.id)
                    }
                    selected={isSelected}
                    recommended={isRecommended}
                    disabled={disabled}
                  >
                    <Column expand noMargin>
                      <LineStackLayout noMargin alignItems="center">
                        {getPlanIcon({
                          subscriptionPlan: subscriptionPlanWithPricingSystems,
                          logoSize: 12,
                        })}
                        <Text
                          noMargin
                          align="left"
                          color={isSelected ? 'primary' : 'secondary'}
                        >
                          {selectMessageByLocale(
                            i18n,
                            subscriptionPlanWithPricingSystems.nameByLocale
                          )}
                        </Text>
                      </LineStackLayout>
                      <Column>
                        <Text
                          noMargin
                          align="left"
                          color={isSelected ? 'primary' : 'secondary'}
                        >
                          {selectMessageByLocale(
                            i18n,
                            subscriptionPlanWithPricingSystems.descriptionByLocale
                          )}
                        </Text>
                      </Column>
                    </Column>
                  </SubscriptionOptionButton>
                </Column>
              );
            }
          )}
        </ResponsiveLineStackLayout>
      )}
    </I18n>
  );
};

export default SubscriptionOptions;
