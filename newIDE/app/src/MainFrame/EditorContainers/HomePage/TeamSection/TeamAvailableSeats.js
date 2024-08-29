// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Line } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import TeamContext from '../../../../Profile/Team/TeamContext';

const TeamAvailableSeats = () => {
  const { getAvailableSeats } = React.useContext(TeamContext);
  const availableSeats = getAvailableSeats();

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
