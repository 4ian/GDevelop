// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import DelayedPlaceholderLoader from '../../../UI/DelayedPlaceholderLoader';

export default {
  title: 'UI Building Blocks/DelayedPlaceholderLoader',
  component: DelayedPlaceholderLoader,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => (
  <FixedHeightFlexContainer height={200}>
    <DelayedPlaceholderLoader />
  </FixedHeightFlexContainer>
);

export const ShortDelay = (): React.Node => (
  <FixedHeightFlexContainer height={200}>
    <DelayedPlaceholderLoader delayMs={200} size={24} />
  </FixedHeightFlexContainer>
);
