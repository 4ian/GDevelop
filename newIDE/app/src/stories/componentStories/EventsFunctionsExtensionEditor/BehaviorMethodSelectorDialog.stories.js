// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import BehaviorMethodSelectorDialog from '../../../EventsFunctionsExtensionEditor/BehaviorMethodSelectorDialog';

export default {
  title: 'EventsFunctionsExtensionEditor/BehaviorMethodSelectorDialog',
  component: BehaviorMethodSelectorDialog,
};

export const Default = () => (
  <I18n>
    {({ i18n }) => (
      <BehaviorMethodSelectorDialog
        eventsBasedBehavior={testProject.testEventsBasedBehavior}
        onCancel={() => action('Cancel')}
        onChoose={parameters => action('Choose function type', parameters)}
      />
    )}
  </I18n>
);
