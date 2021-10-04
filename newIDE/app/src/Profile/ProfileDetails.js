// @flow
import { Trans, t } from '@lingui/macro';

import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Column, Line, Spacer } from '../UI/Grid';
import { type Profile } from '../Utils/GDevelopServices/Authentication';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { getGravatarUrl } from '../UI/GravatarUrl';
import Text from '../UI/Text';
import RaisedButton from '../UI/RaisedButton';
import TextField from '../UI/TextField';
import { I18n } from '@lingui/react';

type Props = {
  profile: ?Profile,
  onEditProfile: Function,
};

export default ({ profile, onEditProfile }: Props) => {
  return profile ? (
    <I18n>
      {({ i18n }) => (
        <Column>
          <Line alignItems="center">
            <Avatar src={getGravatarUrl(profile.email || '', { size: 40 })} />
            <Spacer />
            <Text
              size="title"
              style={{
                color: profile.username ? 'black' : '#888',
              }}
            >
              {profile.username ||
                i18n._(t`Edit your profile to pick a username!`)}
            </Text>
          </Line>
          <Line>
            <TextField
              value={profile.email}
              readOnly
              fullWidth
              floatingLabelText={<Trans>Email</Trans>}
              floatingLabelFixed={true}
            />
          </Line>
          <Line>
            <TextField
              value={
                profile.description ||
                i18n._(
                  t`No bio defined. Edit your profile to tell us what you are using GDevelop for!`
                )
              }
              readOnly
              fullWidth
              multiline
              floatingLabelText={<Trans>Bio</Trans>}
              floatingLabelFixed={true}
              inputStyle={{
                color: profile.description ? 'black' : '#888',
              }}
              rows={3}
              rowsMax={5}
            />
          </Line>
          <Line justifyContent="flex-end">
            <RaisedButton
              label={<Trans>Edit my profile</Trans>}
              primary
              onClick={onEditProfile}
            />
          </Line>
        </Column>
      )}
    </I18n>
  ) : (
    <PlaceholderLoader />
  );
};
