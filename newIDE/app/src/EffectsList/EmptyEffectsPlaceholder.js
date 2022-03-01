// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import Add from '@material-ui/icons/Add';
import { Column, Line } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';

type Props = {|
  target: 'object' | 'layer',
  openNewBehaviorDialog: () => void,
|};

export const EmptyEffectsPlaceholder = (props: Props) => (
  <EmptyPlaceholder
    renderButtons={() => (
      <HelpButton
        label={<Trans>Read the doc</Trans>}
        helpPagePath={
          props.target === 'object'
            ? '/objects/effects'
            : '/interface/scene-editor/layer-effects'
        }
      />
    )}
  >
    <Text size="title" align="center">
      <Trans>Add your first effect</Trans>
    </Text>
    <Text align="center">
      <Trans>Effects create visual changes to the object.</Trans>
    </Text>
    <Line justifyContent="center" expand>
      <RaisedButton
        primary
        label={<Trans>Add an effect</Trans>}
        onClick={props.addEffect}
        icon={<Add />}
      />
    </Line>
  </EmptyPlaceholder>
);
