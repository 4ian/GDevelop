// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../../ThemeDecorator';
import { MaxProjectCountAlertMessage } from '../../../../MainFrame/EditorContainers/HomePage/BuildSection/MaxProjectCountAlertMessage';
import paperDecorator from '../../../PaperDecorator';
import {
  limitsForIndieUser,
  limitsForProUser,
} from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'HomePage/BuildSection/MaxProjectCountAlertMessage',
  component: MaxProjectCountAlertMessage,
  decorators: [paperDecorator, muiDecorator],
};

export const ForIndieUser = () => (
  <MaxProjectCountAlertMessage
    limits={limitsForIndieUser}
    onUpgrade={action('onUpgrade')}
  />
);

export const ForProUser = () => (
  <MaxProjectCountAlertMessage
    limits={limitsForProUser}
    onUpgrade={action('onUpgrade')}
  />
);
