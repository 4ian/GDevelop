// @flow

import * as React from 'react';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from './EventsFunctionsExtensionsContext';
import {
  loadProjectEventsFunctionsExtensions,
  type IncludeFileContent,
  type EventsFunctionCodeWriterCallbacks,
  type EventsFunctionCodeWriter,
  unloadProjectEventsFunctionsExtensions,
  unloadProjectEventsFunctionsExtension,
  reloadProjectEventsFunctionsExtensionMetadata,
} from '.';
import {
  type EventsFunctionsExtensionWriter,
  type EventsFunctionsExtensionOpener,
} from './Storage';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import xxhashjs from 'xxhashjs';

type Props = {|
  children: React.Node,
  i18n: I18nType,
  makeEventsFunctionCodeWriter: EventsFunctionCodeWriterCallbacks => ?EventsFunctionCodeWriter,
  eventsFunctionsExtensionWriter: ?EventsFunctionsExtensionWriter,
  eventsFunctionsExtensionOpener: ?EventsFunctionsExtensionOpener,
|};

/**
 * Allow children components to request the loading (or unloading) of
 * the events functions extensions of the project.
 * Useful when dealing with events functions extensions (new extension created,
 * removed, pasted, installed, etc...).
 */
export const EventsFunctionsExtensionsProvider = ({
  children,
  i18n,
  makeEventsFunctionCodeWriter,
  eventsFunctionsExtensionWriter,
  eventsFunctionsExtensionOpener,
}: Props) => {
  const [
    eventsFunctionsExtensionsError,
    setEventsFunctionsExtensionsError,
  ] = React.useState<Error | null>(null);
  const includeFileHashs = React.useRef<{ [string]: number }>({});
  const lastLoadPromise = React.useRef<?Promise<void>>(null);

  const onWriteFile = React.useCallback(
    ({ includeFile, content }: IncludeFileContent) => {
      includeFileHashs.current[includeFile] = xxhashjs
        .h32(content, 0xabcd)
        .toNumber();
    },
    []
  );

  const eventsFunctionCodeWriter: ?EventsFunctionCodeWriter = React.useMemo(
    () => makeEventsFunctionCodeWriter({ onWriteFile }),
    [onWriteFile, makeEventsFunctionCodeWriter]
  );

  const ensureLoadFinished = React.useCallback((): Promise<void> => {
    if (lastLoadPromise.current) {
      console.info(
        'Waiting on the events functions extensions to finish loading...'
      );
    } else {
      console.info('Events functions extensions are ready.');
    }

    return lastLoadPromise.current
      ? lastLoadPromise.current.then(() => {
          console.info('Events functions extensions finished loading.');
        })
      : Promise.resolve();
  }, []);

  const _loadProjectEventsFunctionsExtensions = React.useCallback(
    (project: ?gdProject): Promise<void> => {
      if (!project || !eventsFunctionCodeWriter) return Promise.resolve();

      const previousLastLoadPromise =
        lastLoadPromise.current || Promise.resolve();

      lastLoadPromise.current = previousLastLoadPromise
        .then(() =>
          loadProjectEventsFunctionsExtensions(
            project,
            eventsFunctionCodeWriter,
            i18n
          )
        )
        .then(() => setEventsFunctionsExtensionsError(null))
        .catch((eventsFunctionsExtensionsError: Error) => {
          setEventsFunctionsExtensionsError(eventsFunctionsExtensionsError);
          showErrorBox({
            message: i18n._(
              t`An error has occurred during functions generation. If GDevelop is installed, verify that nothing is preventing GDevelop from writing on disk. If you're running GDevelop online, verify your internet connection and refresh functions from the Project Manager.`
            ),
            rawError: eventsFunctionsExtensionsError,
            errorId: 'events-functions-extensions-load-error',
          });
        })
        .then(() => {
          lastLoadPromise.current = null;
        });

      return lastLoadPromise.current;
    },
    [eventsFunctionCodeWriter, i18n]
  );

  const _reloadProjectEventsFunctionsExtensionMetadata = React.useCallback(
    (project: ?gdProject, extension: gdEventsFunctionsExtension): void => {
      if (!project || !eventsFunctionCodeWriter) return;

      try {
        reloadProjectEventsFunctionsExtensionMetadata(
          project,
          extension,
          eventsFunctionCodeWriter,
          i18n
        );
      } catch (eventsFunctionsExtensionsError) {
        setEventsFunctionsExtensionsError(eventsFunctionsExtensionsError);
        showErrorBox({
          message: i18n._(
            t`An error has occurred during functions generation. If GDevelop is installed, verify that nothing is preventing GDevelop from writing on disk. If you're running GDevelop online, verify your internet connection and refresh functions from the Project Manager.`
          ),
          rawError: eventsFunctionsExtensionsError,
          errorId: 'events-functions-extensions-load-error',
        });
      }
    },
    [eventsFunctionCodeWriter, i18n]
  );

  const _unloadProjectEventsFunctionsExtensions = React.useCallback(
    (project: gdProject) => {
      unloadProjectEventsFunctionsExtensions(project);
    },
    []
  );

  const _unloadProjectEventsFunctionsExtension = React.useCallback(
    (project: gdProject, extensionName: string) => {
      unloadProjectEventsFunctionsExtension(project, extensionName);
    },
    []
  );

  const _reloadProjectEventsFunctionsExtensions = React.useCallback(
    (project: ?gdProject): Promise<void> => {
      if (project) {
        _unloadProjectEventsFunctionsExtensions(project);
      }
      return _loadProjectEventsFunctionsExtensions(project);
    },
    [
      _loadProjectEventsFunctionsExtensions,
      _unloadProjectEventsFunctionsExtensions,
    ]
  );

  const state = React.useMemo<EventsFunctionsExtensionsState>(
    () => ({
      eventsFunctionsExtensionsError,
      loadProjectEventsFunctionsExtensions: _loadProjectEventsFunctionsExtensions,
      unloadProjectEventsFunctionsExtensions: _unloadProjectEventsFunctionsExtensions,
      unloadProjectEventsFunctionsExtension: _unloadProjectEventsFunctionsExtension,
      reloadProjectEventsFunctionsExtensions: _reloadProjectEventsFunctionsExtensions,
      reloadProjectEventsFunctionsExtensionMetadata: _reloadProjectEventsFunctionsExtensionMetadata,
      ensureLoadFinished,
      getEventsFunctionsExtensionWriter: () => eventsFunctionsExtensionWriter,
      getEventsFunctionsExtensionOpener: () => eventsFunctionsExtensionOpener,
      getIncludeFileHashs: () => includeFileHashs.current,
    }),
    [
      ensureLoadFinished,
      _loadProjectEventsFunctionsExtensions,
      _reloadProjectEventsFunctionsExtensionMetadata,
      _reloadProjectEventsFunctionsExtensions,
      _unloadProjectEventsFunctionsExtension,
      _unloadProjectEventsFunctionsExtensions,
      eventsFunctionsExtensionOpener,
      eventsFunctionsExtensionWriter,
      eventsFunctionsExtensionsError,
    ]
  );

  return (
    <EventsFunctionsExtensionsContext.Provider value={state}>
      {children}
    </EventsFunctionsExtensionsContext.Provider>
  );
};
