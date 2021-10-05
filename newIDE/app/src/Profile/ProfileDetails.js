// @flow
import { Trans, t } from '@lingui/macro';

import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Column, Line, Spacer } from '../UI/Grid';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { getGravatarUrl } from '../UI/GravatarUrl';
import Text from '../UI/Text';
import RaisedButton from '../UI/RaisedButton';
import TextField from '../UI/TextField';
import { I18n } from '@lingui/react';

type DisplayedProfile = {
  email: string,
  description: ?string,
  username: ?string,
};

type Props = {
  profile: ?DisplayedProfile,
  onEditProfile?: Function,
  canEdit?: boolean,
};

export default ({ profile, onEditProfile, canEdit }: Props) => {
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
                opacity: profile.username ? 1.0 : 0.5,
              }}
            >
              {profile.username ||
                (canEdit
                  ? i18n._(t`Edit your profile to pick a username!`)
                  : i18n._(t`No username`))}
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
              value={profile.description || ''}
              readOnly
              fullWidth
              multiline
              floatingLabelText={<Trans>Bio</Trans>}
              floatingLabelFixed={true}
              hintText={
                canEdit
                  ? t`No bio defined. Edit your profile to tell us what you are using GDevelop for!`
                  : t`No bio defined`
              }
              rows={3}
              rowsMax={5}
            />
          </Line>
          {canEdit && (
            <Line justifyContent="flex-end">
              <RaisedButton
                label={<Trans>Edit my profile</Trans>}
                primary
                onClick={onEditProfile}
              />
            </Line>
          )}
        </Column>
      )}
    </I18n>
  ) : (
    <PlaceholderLoader />
  );
};
