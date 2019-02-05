// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Avatar from 'material-ui/Avatar';
import { Column, Line } from '../UI/Grid';
import { type Profile } from '../Utils/GDevelopServices/Authentification';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { getGravatarUrl } from '../UI/GravatarUrl';

const styles = {
  title: {
    fontSize: 25,
    lineHeight: '40px',
    marginLeft: 10,
  },
};

type Props = {
  profile: ?Profile,
};

export default ({ profile }: Props) =>
  profile ? (
    <Column>
      <Line alignItems="center">
        <Avatar src={getGravatarUrl(profile.email || '', { size: 40 })} />
        <span style={styles.title}>You are connected as {profile.email}</span>
      </Line>
      <Line>
        <p>
          <Trans>
            An account allows you to access GDevelop services online.
          </Trans>
        </p>
      </Line>
    </Column>
  ) : (
    <PlaceholderLoader />
  );
