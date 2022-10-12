// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import NewBehaviorDialog from '../../../BehaviorsEditor/NewBehaviorDialog';
import { ExtensionStoreStateProvider } from '../../../AssetStore/ExtensionStore/ExtensionStoreContext';

export default {
  title: 'ObjectEditor/NewBehaviorDialog',
  component: NewBehaviorDialog,
  decorators: [muiDecorator, paperDecorator],
};

export const DefaultForSpriteObject = () => (
  <ExtensionStoreStateProvider>
    <NewBehaviorDialog
      open
      project={testProject.project}
      objectType={'Sprite'}
      onClose={action('on close')}
      onChoose={action('on choose')}
      objectBehaviorsTypes={[
        'DestroyOutsideBehavior::DestroyOutside',
        'PlatformBehavior::PlatformBehavior',
      ]}
    />
  </ExtensionStoreStateProvider>
);
