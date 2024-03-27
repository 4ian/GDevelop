// @flow
import * as React from 'react';
import { type UserPublicProfile } from '../../Utils/GDevelopServices/User';
import PublicProfileContext from '../../Profile/PublicProfileContext';
import { Avatar, ButtonBase } from '@material-ui/core';
import Text from '../Text';
import { LineStackLayout } from '../Layout';
import { Trans } from '@lingui/macro';

type Props = {|
  user: UserPublicProfile | null,
  avatarSize: number,
  expand?: boolean,
|};

export const UserPublicProfileTextWithAvatar = ({
  user,
  avatarSize,
  expand,
}: Props) => {
  const { openUserPublicProfile } = React.useContext(PublicProfileContext);

  return (
    <ButtonBase
      onClick={user ? () => openUserPublicProfile(user.id) : undefined}
      style={{ width: expand ? '100%' : undefined }}
    >
      <LineStackLayout
        alignItems="center"
        justifyContent="flex-start"
        expand
        noMargin
      >
        <Avatar
          src={user ? user.iconUrl : undefined}
          style={{
            width: avatarSize,
            height: avatarSize,
          }}
        />
        <Text size="body">
          {user
            ? user.username || (
                <i>
                  <Trans>Anonymous</Trans>
                </i>
              )
            : ''}
        </Text>
      </LineStackLayout>
    </ButtonBase>
  );
};
