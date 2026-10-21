// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import AboutDialog from '../../MainFrame/AboutDialog';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'AboutDialog',
};

const Default = (): React.Node => (
  <AboutDialog
    open
    onClose={action('close')}
    updateStatus={{
      message: '',
      status: 'unknown',
    }}
  />
);

export { Default as ________________Default };
Default.storyName = 'default';
