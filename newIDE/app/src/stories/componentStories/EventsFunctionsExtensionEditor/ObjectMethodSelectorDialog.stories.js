// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import ObjectMethodSelectorDialog from '../../../EventsFunctionsExtensionEditor/ObjectMethodSelectorDialog';

export default {
  title: 'EventsFunctionsExtensionEditor/ObjectMethodSelectorDialog',
  component: ObjectMethodSelectorDialog,
};

export const Default = () => (
  <I18n>
    {({ i18n }) => (
      <ObjectMethodSelectorDialog
        eventsBasedObject={testProject.testEventsBasedObject}
        onCancel={() => action('Cancel')}
        onChoose={parameters => action('Choose function type', parameters)}
      />
    )}
  </I18n>
);
