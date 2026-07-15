// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import AdvancedStudentOptionsDialog from '../../../../MainFrame/EditorContainers/HomePage/TeamSection/AdvancedStudentOptionsDialog';
import { MockTeamProvider } from '../../../MockTeamProvider';

export default {
  title: 'HomePage/TeamSection/AdvancedStudentOptionsDialog',
  component: AdvancedStudentOptionsDialog,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => {
  return (
    <MockTeamProvider loading={false}>
      <FixedHeightFlexContainer height={400}>
        <AdvancedStudentOptionsDialog onClose={action('onClose')} />
      </FixedHeightFlexContainer>
    </MockTeamProvider>
  );
};
