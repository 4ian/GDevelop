// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import DismissableInfoBar from '../../../UI/Messages/DismissableInfoBar';

export default {
  title: 'UI Building Blocks/DismissableInfoBar',
  component: DismissableInfoBar,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  return (
    <DismissableInfoBar
      identifier="default-additional-work"
      message="This is a message that you should be able to read"
      touchScreenMessage={false}
      show
    />
  );
};
