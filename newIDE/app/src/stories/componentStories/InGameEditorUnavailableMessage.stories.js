// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../PaperDecorator';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';
import { InGameEditorUnavailableMessage } from '../../EmbeddedGame/InGameEditorUnavailableMessage';

export default {
  title: 'InGameEditorUnavailableMessage',
  component: InGameEditorUnavailableMessage,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => (
  <FixedHeightFlexContainer height={500}>
    <div style={{ flex: 1 }}>
      <InGameEditorUnavailableMessage
        onSwitchToInstancesEditor={action('onSwitchToInstancesEditor')}
      />
    </div>
  </FixedHeightFlexContainer>
);
