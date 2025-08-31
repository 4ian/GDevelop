// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import ManageEducationAccountDialog from '../../../../MainFrame/EditorContainers/HomePage/TeamSection/ManageEducationAccountDialog';
import {
  emptySubscriptionPlanMockData,
  MockTeamProvider,
} from '../../../MockTeamProvider';

export default {
  title: 'HomePage/TeamSection/ManageEducationAccountDialog',
  component: ManageEducationAccountDialog,
  decorators: [paperDecorator],
};

export const Default = () => {
  return (
    <MockTeamProvider loading={false} teamSize={12}>
      <FixedHeightFlexContainer height={600}>
        <ManageEducationAccountDialog onClose={action('onClose')} />
      </FixedHeightFlexContainer>
    </MockTeamProvider>
  );
};
Default.parameters = {
  mockData: [...emptySubscriptionPlanMockData],
};
