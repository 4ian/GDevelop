// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import Add from '@material-ui/icons/Add';
import { Column, Line } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';

type Props = {
  openNewBehaviorDialog: () => void,
};

const EmptyBehaviorsPlaceholder = (props: Props) => (
  <EmptyPlaceholder
    title={<Trans>Add your first behavior</Trans>}
    description={
      <Trans>Behaviors add features to objects in a matter of clicks.</Trans>
    }
    actionLabel={<Trans>Add a behavior</Trans>}
    helpPagePath="/behaviors"
    onAdd={props.openNewBehaviorDialog}
  />
);

export default EmptyBehaviorsPlaceholder;
