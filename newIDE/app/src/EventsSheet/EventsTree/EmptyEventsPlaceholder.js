// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import HelpButton from '../../UI/HelpButton';
import Text from '../../UI/Text';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import Add from '@material-ui/icons/Add';
import { Column, Line } from '../../UI/Grid';
import RaisedButton from '../../UI/RaisedButton';

type Props = {
  addEvent: () => void,
};

const EmptyEventsPlaceholder = (props: Props) => (
  <EmptyPlaceholder renderButtons={() => <HelpButton helpPagePath="/events" />}>
    <Text size="title" align="center">
      <Trans>Add your first event</Trans>
    </Text>
    <Text align="center">
      <Trans>Events define the rules of a game.</Trans>
    </Text>
    <Line justifyContent="center" expand>
      <RaisedButton
        primary
        label={<Trans>Add an event</Trans>}
        onClick={props.addEvent}
        icon={<Add />}
      />
    </Line>
  </EmptyPlaceholder>
);

export default EmptyEventsPlaceholder;
