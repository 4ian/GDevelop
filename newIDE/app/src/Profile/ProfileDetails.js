// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Column, Line, Spacer } from '../UI/Grid';
import { type Profile } from '../Utils/GDevelopServices/Authentification';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { getGravatarUrl } from '../UI/GravatarUrl';
import Text from '../UI/Text';

type Props = {
  profile: ?Profile,
};

export default ({ profile }: Props) =>
  profile ? (
    <Column>
      <Line alignItems="center">
        <Avatar src={getGravatarUrl(profile.email || '', { size: 40 })} />
        <Spacer />
        <Text size="title">
          You are connected as {profile.username} ({profile.email})
        </Text>
      </Line>
      <Line>
        <Text>
          <Trans>
            An account allows you to access GDevelop services online.
          </Trans>
        </Text>
      </Line>
    </Column>
  ) : (
    <PlaceholderLoader />
  );
