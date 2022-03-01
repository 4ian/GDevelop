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
    renderButtons={() => (
      <HelpButton
        label={<Trans>Read the doc</Trans>}
        helpPagePath="/behaviors"
      />
    )}
  >
    <Text size="title" align="center">
      <Trans>Add your first behavior</Trans>
    </Text>
    <Text align="center">
      <Trans>Behaviors add features to objects in a matter of clicks.</Trans>
    </Text>
    <Line justifyContent="center" expand>
      <RaisedButton
        key="add-behavior-line"
        label={<Trans>Add a behavior</Trans>}
        primary
        onClick={props.openNewBehaviorDialog}
        icon={<Add />}
        id="add-behavior-button"
      />
    </Line>
  </EmptyPlaceholder>
);

export default EmptyBehaviorsPlaceholder;
