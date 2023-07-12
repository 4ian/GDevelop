// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import NewBehaviorDialog from '../../../BehaviorsEditor/NewBehaviorDialog';
import { BehaviorStoreStateProvider } from '../../../AssetStore/BehaviorStore/BehaviorStoreContext';

export default {
  title: 'ObjectEditor/NewBehaviorDialog',
  component: NewBehaviorDialog,
  decorators: [muiDecorator],
};

export const DefaultForSpriteObject = () => (
  <BehaviorStoreStateProvider>
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
  </BehaviorStoreStateProvider>
);
