// @flow
import {
  type EventsFunctionsExtensionWriter,
  type EventsFunctionsExtensionOpener,
} from './Storage';
import createReactContext from 'create-react-context';

export type EventsFunctionsExtensionsState = {|
  eventsFunctionsExtensionsError: ?Error,
  loadProjectEventsFunctionsExtensions: (project: ?gdProject) => Promise<void>,
  unloadProjectEventsFunctionsExtensions: (project: gdProject) => void,
  reloadProjectEventsFunctionsExtensions: (
    project: ?gdProject
  ) => Promise<void>,
  getEventsFunctionsExtensionWriter: () => ?EventsFunctionsExtensionWriter,
  getEventsFunctionsExtensionOpener: () => ?EventsFunctionsExtensionOpener,
|};

const defaultState = {
  eventsFunctionsExtensionsError: null,
  loadProjectEventsFunctionsExtensions: () =>
    Promise.reject(new Error('Use a provider')),
  unloadProjectEventsFunctionsExtensions: () => {},
  reloadProjectEventsFunctionsExtensions: () =>
    Promise.reject(new Error('Use a provider')),
  getEventsFunctionsExtensionWriter: () => null,
  getEventsFunctionsExtensionOpener: () => null,
};

const EventsFunctionsExtensionsContext = createReactContext<EventsFunctionsExtensionsState>(
  defaultState
);

export default EventsFunctionsExtensionsContext;
