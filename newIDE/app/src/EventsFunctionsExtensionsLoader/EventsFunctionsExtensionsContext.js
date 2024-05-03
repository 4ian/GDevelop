// @flow
import * as React from 'react';
import {
  type EventsFunctionsExtensionWriter,
  type EventsFunctionsExtensionOpener,
} from './Storage';

export type EventsFunctionsExtensionsState = {|
  eventsFunctionsExtensionsError: ?Error,
  loadProjectEventsFunctionsExtensions: (project: ?gdProject) => Promise<void>,
  unloadProjectEventsFunctionsExtensions: (project: gdProject) => void,
  unloadProjectEventsFunctionsExtension: (
    project: gdProject,
    extensionName: string
  ) => void,
  reloadProjectEventsFunctionsExtensions: (
    project: ?gdProject
  ) => Promise<void>,
  reloadProjectEventsFunctionsExtensionMetadata: (
    project: ?gdProject,
    extension: gdEventsFunctionsExtension
  ) => void,
  getEventsFunctionsExtensionWriter: () => ?EventsFunctionsExtensionWriter,
  getEventsFunctionsExtensionOpener: () => ?EventsFunctionsExtensionOpener,
  ensureLoadFinished: () => Promise<void>,
  getIncludeFileHashs: () => { [string]: number },
|};

const defaultState = {
  eventsFunctionsExtensionsError: null,
  loadProjectEventsFunctionsExtensions: () =>
    Promise.reject(new Error('Use a provider')),
  unloadProjectEventsFunctionsExtensions: () => {},
  reloadProjectEventsFunctionsExtensions: () =>
    Promise.reject(new Error('Use a provider')),
  reloadProjectEventsFunctionsExtensionMetadata: () => {
    throw new Error('Use a provider');
  },
  unloadProjectEventsFunctionsExtension: () => {},
  getEventsFunctionsExtensionWriter: () => null,
  getEventsFunctionsExtensionOpener: () => null,
  ensureLoadFinished: () => Promise.reject(new Error('Use a provider')),
  getIncludeFileHashs: () => ({}),
};

const EventsFunctionsExtensionsContext = React.createContext<EventsFunctionsExtensionsState>(
  defaultState
);

export default EventsFunctionsExtensionsContext;
