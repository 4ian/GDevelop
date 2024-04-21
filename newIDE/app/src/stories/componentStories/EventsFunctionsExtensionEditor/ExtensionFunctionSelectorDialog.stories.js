// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import ExtensionFunctionSelectorDialog from '../../../EventsFunctionsExtensionEditor/ExtensionFunctionSelectorDialog';

export default {
  title: 'EventsFunctionsExtensionEditor/ExtensionFunctionSelectorDialog',
  component: ExtensionFunctionSelectorDialog,
};

export const Default = () => (
  <I18n>
    {({ i18n }) => (
      <ExtensionFunctionSelectorDialog
        eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
        onCancel={() => action('Cancel')}
        onChoose={parameters => action('Choose function type', parameters)}
      />
    )}
  </I18n>
);
