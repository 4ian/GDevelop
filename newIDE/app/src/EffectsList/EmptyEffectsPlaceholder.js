// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';

type Props = {|
  target: 'object' | 'layer',
|};

export const EmptyEffectsPlaceholder = (props: Props) => (
  <EmptyPlaceholder
    renderButtons={() => (
      <HelpButton
        helpPagePath={
          props.target === 'object'
            ? '/objects/effects'
            : '/interface/scene-editor/layer-effects'
        }
      />
    )}
  >
    <Text>
      <Trans>
        Effects can change how layers or objects are rendered on screen.
      </Trans>
    </Text>
    <Text>
      <Trans>
        After adding an effect, set up its parameters. Launch a preview to see
        the result. Using the events and the name of the effect, you can change
        the parameters during the game.
      </Trans>
    </Text>
  </EmptyPlaceholder>
);
