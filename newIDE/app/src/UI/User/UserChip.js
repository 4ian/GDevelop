// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Avatar from '@material-ui/core/Avatar';
import { getGravatarUrl } from '../GravatarUrl';
import RaisedButton from '../RaisedButton';
import { shortenString } from '../../Utils/StringHelpers';
import TextButton from '../TextButton';
import { LineStackLayout } from '../Layout';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import CircularProgress from '../CircularProgress';
import User from '../CustomSvgIcons/User';

const styles = {
  avatar: {
    width: 20,
    height: 20,
  },
  buttonContainer: { flexShrink: 0 },
};

type Props = {|
  onOpenProfile: () => void,
|};

const UserChip = ({ onOpenProfile }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile, onOpenCreateAccountDialog, loginState } = authenticatedUser;

  return !profile && loginState === 'loggingIn' ? (
    <CircularProgress size={25} />
  ) : profile ? (
    <TextButton
      label={shortenString(profile.username || profile.email, 20)}
      onClick={onOpenProfile}
      allowBrowserAutoTranslate={false}
      icon={
        <Avatar
          src={getGravatarUrl(profile.email || '', { size: 50 })}
          style={styles.avatar}
        />
      }
    />
  ) : (
    <div style={styles.buttonContainer}>
      <LineStackLayout noMargin alignItems="center">
        <RaisedButton
          label={
            <span>
              <Trans>Create account</Trans>
            </span>
          }
          onClick={onOpenCreateAccountDialog}
          primary
          icon={<User fontSize="small" />}
        />
      </LineStackLayout>
    </div>
  );
};

export default UserChip;
