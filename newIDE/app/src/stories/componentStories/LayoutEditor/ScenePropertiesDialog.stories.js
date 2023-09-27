// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import ScenePropertiesDialog from '../../../SceneEditor/ScenePropertiesDialog';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'LayoutEditor/ScenePropertiesDialog',
  component: ScenePropertiesDialog,
  decorators: [muiDecorator],
};

export const Default = () => (
  <ScenePropertiesDialog
    open
    project={testProject.project}
    layout={testProject.testLayout}
    onClose={() => action('Close the dialog')}
    onApply={() => action('Apply changes')}
    onEditVariables={() => action('Edit variables')}
    resourceManagementProps={fakeResourceManagementProps}
  />
);

export const MoreSettings = () => (
  <ScenePropertiesDialog
    open
    project={testProject.project}
    layout={testProject.testLayout}
    onClose={() => action('Close the dialog')}
    onApply={() => action('Apply changes')}
    onEditVariables={() => action('Edit variables')}
    onOpenMoreSettings={() => action('Open more settings')}
    resourceManagementProps={fakeResourceManagementProps}
  />
);
