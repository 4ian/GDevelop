// @flow
import * as React from 'react';
import Avatar from 'material-ui/Avatar';
import { Column, Line } from '../UI/Grid';
import { type Profile } from '../Utils/GDevelopServices/Authentification';
import PlaceholderLoader from '../UI/PlaceholderLoader';

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
      <Line>
        <Avatar src={profile.picture} />
        <span style={styles.title}>You are connect as {profile.nickname}</span>
      </Line>
      <Line>
        <p>With your account, you can access to GDevelop online services.</p>
      </Line>
    </Column>
  ) : (
    <PlaceholderLoader />
  );
