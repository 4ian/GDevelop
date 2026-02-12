// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import DismissableInfoBar from '../../../UI/Messages/DismissableInfoBar';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';

export default {
  title: 'UI Building Blocks/DismissableInfoBar',
  component: DismissableInfoBar,
  decorators: [paperDecorator],
};

export const Default = () => {
  return (
    <FixedHeightFlexContainer height={600}>
      <DismissableInfoBar
        identifier="default-additional-work"
        message="This is a message that you should be able to read"
        touchScreenMessage={false}
        show
      />
    </FixedHeightFlexContainer>
  );
};
