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
  <EmptyPlaceholder
    title={<Trans>Add your first event</Trans>}
    description={<Trans>Events define the rules of a game</Trans>}
    actionLabel={<Trans>Add an event</Trans>}
    helpPagePath="/events"
    onAdd={props.addEvent}
  />
);

export default EmptyEventsPlaceholder;
