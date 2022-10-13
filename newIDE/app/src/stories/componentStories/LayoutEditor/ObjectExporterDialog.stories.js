// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import ObjectExporterDialog from '../../../ObjectEditor/ObjectExporterDialog';
import EventsFunctionsExtensionsContext from '../../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import LocalEventsFunctionsExtensionWriter from '../../../EventsFunctionsExtensionsLoader/Storage/LocalEventsFunctionsExtensionWriter';
import LocalEventsFunctionsExtensionOpener from '../../../EventsFunctionsExtensionsLoader/Storage/LocalEventsFunctionsExtensionOpener';

export default {
  title: 'LayoutEditor/ObjectExporterDialog',
  component: ObjectExporterDialog,
  decorators: [muiDecorator, paperDecorator],
};

const fakeEventsFunctionsExtensionsContext = {
  loadProjectEventsFunctionsExtensions: async project => {},
  unloadProjectEventsFunctionsExtensions: project => {},
  unloadProjectEventsFunctionsExtension: (project, extensionName) => {},
  reloadProjectEventsFunctionsExtensions: async project => {},
  getEventsFunctionsExtensionWriter: () => LocalEventsFunctionsExtensionWriter,
  getEventsFunctionsExtensionOpener: () => LocalEventsFunctionsExtensionOpener,
  ensureLoadFinished: async () => {},
  getIncludeFileHashs: () => ({}),
  eventsFunctionsExtensionsError: null,
};

export const Default = () => (
  <EventsFunctionsExtensionsContext.Provider
    value={fakeEventsFunctionsExtensionsContext}
  >
    <ObjectExporterDialog
      object={testProject.customObject}
      onClose={() => action('Close the dialog')}
    />
  </EventsFunctionsExtensionsContext.Provider>
);
