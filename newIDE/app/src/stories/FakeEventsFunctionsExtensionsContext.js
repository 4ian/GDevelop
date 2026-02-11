// @flow
import LocalEventsFunctionsExtensionWriter from '../EventsFunctionsExtensionsLoader/Storage/LocalEventsFunctionsExtensionWriter';
import LocalEventsFunctionsExtensionOpener from '../EventsFunctionsExtensionsLoader/Storage/LocalEventsFunctionsExtensionOpener';
import { type EventsFunctionsExtensionsState } from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';

export const fakeEventsFunctionsExtensionsState: EventsFunctionsExtensionsState = {
  loadProjectEventsFunctionsExtensions: async project => {},
  unloadProjectEventsFunctionsExtensions: project => {},
  unloadProjectEventsFunctionsExtension: (project, extensionName) => {},
  reloadProjectEventsFunctionsExtensions: async project => {},
  reloadProjectEventsFunctionsExtensionMetadata: (project, extension) => {},
  getEventsFunctionsExtensionWriter: () => LocalEventsFunctionsExtensionWriter,
  getEventsFunctionsExtensionOpener: () => LocalEventsFunctionsExtensionOpener,
  ensureLoadFinished: async () => {},
  getIncludeFileHashs: () => ({}),
  eventsFunctionsExtensionsError: null,
};
