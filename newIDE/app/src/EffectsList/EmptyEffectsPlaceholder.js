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
  addEffect: () => void,
|};

export const EmptyEffectsPlaceholder = (props: Props) => (
  <EmptyPlaceholder
    title={<Trans>Add your first effect</Trans>}
    description={<Trans>Effects create visual changes to the object.</Trans>}
    actionLabel={<Trans>Add an effect</Trans>}
    helpPagePath={
      props.target === 'object'
        ? '/objects/effects'
        : '/interface/scene-editor/layer-effects'
    }
    onAdd={props.addEffect}
  />
);
