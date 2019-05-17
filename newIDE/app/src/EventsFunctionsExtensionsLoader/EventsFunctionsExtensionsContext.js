// @flow
import createReactContext, { type Context } from 'create-react-context';

export type EventsFunctionsExtensionsState = {|
  eventsFunctionsExtensionsError: ?Error,
  loadProjectEventsFunctionsExtensions: (project: ?gdProject) => Promise<void>,
  unloadProjectEventsFunctionsExtensions: (project: gdProject) => void,
  reloadProjectEventsFunctionsExtensions: (project: ?gdProject) => Promise<void>,
|};

const defaultState = {
  eventsFunctionsExtensionsError: null,
  loadProjectEventsFunctionsExtensions: () =>
    Promise.reject(new Error('Use a provider')),
  unloadProjectEventsFunctionsExtensions: () => {},
  reloadProjectEventsFunctionsExtensions: () => Promise.reject(new Error('Use a provider')),
};

const EventsFunctionsExtensionsContext: Context<EventsFunctionsExtensionsState> = createReactContext(
  defaultState
);

export default EventsFunctionsExtensionsContext;
