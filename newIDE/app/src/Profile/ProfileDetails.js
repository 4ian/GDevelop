// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Column, Line, Spacer } from '../UI/Grid';
import { type Profile } from '../Utils/GDevelopServices/Authentication';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { getGravatarUrl } from '../UI/GravatarUrl';
import Text from '../UI/Text';
import RaisedButton from '../UI/RaisedButton';

type Props = {
  profile: ?Profile,
  onEditProfile: Function,
};

export default ({ profile, onEditProfile }: Props) => {
  return profile ? (
    <Column>
      <Line alignItems="center">
        <Avatar src={getGravatarUrl(profile.email || '', { size: 40 })} />
        <Spacer />
        <Text size="title">{profile.username}</Text>
      </Line>
      <Line alignItems="center">
        <Text>
          <Trans>You are connected as {profile.email}</Trans>
        </Text>
      </Line>
      <Line justifyContent="center">
        <RaisedButton
          label={<Trans>Edit my profile</Trans>}
          primary
          onClick={onEditProfile}
        />
      </Line>
    </Column>
  ) : (
    <PlaceholderLoader />
  );
};
