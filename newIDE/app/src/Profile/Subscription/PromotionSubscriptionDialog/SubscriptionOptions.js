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
import { LineStackLayout } from '../../../UI/Layout';
import classes from './SubscriptionOptions.module.css';
import classNames from 'classnames';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import { Trans } from '@lingui/macro';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';

const styles = {
  optionsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))',
    gridGap: '0.5rem',
    margin: 2,
  },
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
  const { windowSize } = useResponsiveWindowSize();
  const isMobileOrMediumScreen =
    windowSize === 'small' || windowSize === 'medium';
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <div className={classes.optionAndBadgeContainer}>
      {recommended && (
        <div className={classes.recommendedBadge}>
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
        <div style={styles.optionsContainer}>
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
        </div>
      )}
    </I18n>
  );
};

export default SubscriptionOptions;
