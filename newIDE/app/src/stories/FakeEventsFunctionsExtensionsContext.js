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
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[incompatible-exact]
  getEventsFunctionsExtensionWriter: () => LocalEventsFunctionsExtensionWriter,
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[incompatible-exact]
  getEventsFunctionsExtensionOpener: () => LocalEventsFunctionsExtensionOpener,
  ensureLoadFinished: async () => {},
  getIncludeFileHashs: () => ({}),
  eventsFunctionsExtensionsError: null,
};
