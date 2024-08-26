// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Line } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import { type Team } from '../../../../Utils/GDevelopServices/User';
import { type User } from '../../../../Utils/GDevelopServices/User';

type Props = {|
  team?: ?Team,
  members?: ?Array<User>,
  admins?: ?Array<User>,
|};

const TeamAvailableSeats = ({ team, members, admins }: Props) => {
  if (!(team && members && admins)) return null;
  const availableSeats = team.seats - members.length - admins.length;

  return (
    <Line noMargin alignItems="center">
      <Text noMargin style={{ opacity: 0.7 }} displayInlineAsSpan>
        <Trans>Seats available: </Trans>
      </Text>
      <Text noMargin displayInlineAsSpan>
        <b>&nbsp;{availableSeats}</b>
      </Text>
    </Line>
  );
};

export default TeamAvailableSeats;
