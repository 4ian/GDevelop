// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import { OpenConfirmDialog } from '../../ProjectsStorage/OpenConfirmDialog';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'OpenConfirmDialog',
};

const Default = (): React.Node => (
  <OpenConfirmDialog
    onClose={action('on close')}
    onConfirm={action('on confirm')}
  />
);

export { Default as _________________Default };
Default.storyName = 'default';
