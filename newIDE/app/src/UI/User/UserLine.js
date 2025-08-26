// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import Avatar from '@material-ui/core/Avatar';
import { getGravatarUrl } from '../../UI/GravatarUrl';
import { Column, Line } from '../Grid';
import Text from '../Text';
import IconButton from '../IconButton';
import Trash from '../CustomSvgIcons/Trash';
import { getTranslatableLevel } from '../../Utils/AclUtils';
import { type Level } from '../../Utils/GDevelopServices/Project';

const UserLine = ({
  username,
  fullName,
  email,
  level,
  onDelete,
  disabled,
}: {|
  username: ?string,
  fullName: ?string,
  email: string,
  level: ?Level,
  onDelete?: () => Promise<void> | void,
  disabled?: boolean,
|}) => (
  <I18n>
    {({ i18n }) => (
      <Line justifyContent="space-between">
        <Line noMargin expand>
          <Avatar src={getGravatarUrl(email, { size: 40 })} />
          <Column expand justifyContent="flex-end">
            {(username || fullName) && (
              <Text noMargin>
                {fullName ? (
                  username ? (
                    <Trans>
                      {fullName} ({username})
                    </Trans>
                  ) : (
                    fullName
                  )
                ) : (
                  username
                )}
              </Text>
            )}
            <Text noMargin color="secondary">
              {email}
            </Text>
          </Column>
        </Line>
        <Column>
          {!!level && (
            <Text color="secondary">{i18n._(getTranslatableLevel(level))}</Text>
          )}
        </Column>
        {onDelete && (
          <Column noMargin>
            <IconButton size="small" onClick={onDelete} disabled={disabled}>
              <Trash />
            </IconButton>
          </Column>
        )}
      </Line>
    )}
  </I18n>
);

export default UserLine;
