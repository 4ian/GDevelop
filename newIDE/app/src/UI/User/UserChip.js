// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { getGravatarUrl } from '../GravatarUrl';
import RaisedButton from '../RaisedButton';
import { shortenString } from '../../Utils/StringHelpers';
import TextButton from '../TextButton';
import { LineStackLayout } from '../Layout';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import CircularProgress from '../CircularProgress';
import { SubscriptionSuggestionContext } from '../../Profile/Subscription/SubscriptionSuggestionContext';
import { hasValidSubscriptionPlan } from '../../Utils/GDevelopServices/Usage';
import CrownShining from '../CustomSvgIcons/CrownShining';
import UserAvatar from './UserAvatar';
import { useResponsiveWindowSize } from '../Responsive/ResponsiveWindowMeasurer';
import IconButton from '../IconButton';
import FlatButton from '../FlatButton';

const styles = {
  buttonContainer: { flexShrink: 0 },
};

const GetPremiumButton = () => {
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  return (
    <RaisedButton
      icon={<CrownShining />}
      onClick={() => {
        openSubscriptionDialog({
          analyticsMetadata: {
            reason: 'Account get premium',
          },
        });
      }}
      id="get-premium-button"
      label={<Trans>Get premium</Trans>}
      color="premium"
    />
  );
};

type Props = {|
  onOpenProfile: () => void,
|};

const UserChip = ({ onOpenProfile }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    profile,
    onOpenCreateAccountDialog,
    onOpenLoginDialog,
    loginState,
    subscription,
  } = authenticatedUser;

  const isPremium = hasValidSubscriptionPlan(subscription);
  const { isMobile } = useResponsiveWindowSize();

  return !profile && loginState === 'loggingIn' ? (
    <CircularProgress size={25} />
  ) : profile ? (
    <LineStackLayout noMargin>
      {!isMobile ? (
        <TextButton
          label={shortenString(profile.username || profile.email, 20)}
          onClick={onOpenProfile}
          allowBrowserAutoTranslate={false}
          icon={
            <UserAvatar
              iconUrl={getGravatarUrl(profile.email || '', { size: 50 })}
              isPremium={isPremium}
            />
          }
        />
      ) : (
        <IconButton size="small" onClick={onOpenProfile}>
          <UserAvatar
            iconUrl={getGravatarUrl(profile.email || '', { size: 50 })}
            isPremium={isPremium}
          />
        </IconButton>
      )}
      {isPremium ? null : <GetPremiumButton />}
    </LineStackLayout>
  ) : (
    <div style={styles.buttonContainer}>
      <LineStackLayout noMargin alignItems="center">
        <FlatButton
          label={
            <span>
              <Trans>Log in</Trans>
            </span>
          }
          onClick={onOpenLoginDialog}
          primary
        />
        <RaisedButton
          label={
            <span>
              <Trans>Sign up</Trans>
            </span>
          }
          onClick={onOpenCreateAccountDialog}
          primary
        />
      </LineStackLayout>
    </div>
  );
};

export default UserChip;
