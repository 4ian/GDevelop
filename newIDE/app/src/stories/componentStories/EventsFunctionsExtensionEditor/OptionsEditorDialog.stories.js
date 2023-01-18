// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import OptionsEditorDialog from '../../../EventsFunctionsExtensionEditor/OptionsEditorDialog';
import EventsFunctionsExtensionsProvider from '../../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsProvider';

export default {
  title: 'EventsFunctionsExtensionEditor/OptionsEditorDialog',
  component: OptionsEditorDialog,
  decorators: [muiDecorator],
};

export const Default = () => (
  <I18n>
    {({ i18n }) => (
      <EventsFunctionsExtensionsProvider
        i18n={i18n}
        makeEventsFunctionCodeWriter={() => null}
        eventsFunctionsExtensionWriter={null}
        eventsFunctionsExtensionOpener={null}
      >
        <OptionsEditorDialog
          eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
          open
          onClose={action('close')}
        />
      </EventsFunctionsExtensionsProvider>
    )}
  </I18n>
);
