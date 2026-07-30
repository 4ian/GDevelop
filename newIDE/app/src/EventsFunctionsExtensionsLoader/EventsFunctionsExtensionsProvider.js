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

type ProjectLoadState = {|
  promise: Promise<void>,
  isLoadPassRunning: boolean,
  shouldRunTrailingPass: boolean,
  coalescedRequestCount: number,
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
}: Props): React.Node => {
  const [
    eventsFunctionsExtensionsError,
    setEventsFunctionsExtensionsError,
  ] = React.useState<Error | null>(null);
  const includeFileHashs = React.useRef<{ [string]: number }>({});
  // Extension generation is serialized per project. A single application-wide
  // queue makes a newly opened project wait for stale work from the project
  // that was just closed, which can block project creation indefinitely.
  //
  // Multiple editor callbacks can request generation while a pass is already
  // running. Keep at most one trailing pass: it observes the latest project
  // state without replaying every intermediate request and multiplying reload
  // time by the number of callbacks.
  const projectLoadStates = React.useRef<WeakMap<gdProject, ProjectLoadState>>(
    new WeakMap()
  );

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

  const ensureLoadFinished = React.useCallback(
    async (project: ?gdProject): Promise<void> => {
      if (!project) {
        console.info('Events functions extensions are ready.');
        return;
      }

      let loadState = projectLoadStates.current.get(project);
      if (!loadState) {
        console.info('Events functions extensions are ready.');
        return;
      }

      console.info(
        'Waiting on the events functions extensions to finish loading...'
      );

      // A new generation pass for this project can be queued while the
      // previous state is settling. Keep reading this project's entry until
      // its coalesced queue is actually empty.
      while (loadState) {
        await loadState.promise;
        loadState = projectLoadStates.current.get(project);
      }

      console.info('Events functions extensions finished loading.');
    },
    []
  );

  const _loadProjectEventsFunctionsExtensions = React.useCallback(
    (project: ?gdProject): Promise<void> => {
      if (!project || !eventsFunctionCodeWriter) return Promise.resolve();

      const existingLoadState = projectLoadStates.current.get(project);
      if (existingLoadState) {
        existingLoadState.coalescedRequestCount++;
        // A request made before the scheduled pass starts is already covered
        // by that pass. Once generation is running, preserve one trailing pass
        // so changes made during generation are reflected.
        if (existingLoadState.isLoadPassRunning) {
          existingLoadState.shouldRunTrailingPass = true;
        }
        console.info(
          `Coalescing project extension load request (${
            existingLoadState.coalescedRequestCount
          } request(s) coalesced).`
        );
        return existingLoadState.promise;
      }

      const loadState: ProjectLoadState = {
        promise: Promise.resolve(),
        isLoadPassRunning: false,
        shouldRunTrailingPass: false,
        coalescedRequestCount: 0,
      };
      const overallStartTime = Date.now();
      let passCount = 0;

      const loadPromise: Promise<void> = Promise.resolve()
        .then(async () => {
          do {
            loadState.shouldRunTrailingPass = false;
            loadState.isLoadPassRunning = true;
            passCount++;
            const passStartTime = Date.now();
            console.info(`Loading project extensions (pass ${passCount})...`);
            try {
              await loadProjectEventsFunctionsExtensions(
                project,
                eventsFunctionCodeWriter,
                i18n
              );
              setEventsFunctionsExtensionsError(null);
            } catch (eventsFunctionsExtensionsError) {
              setEventsFunctionsExtensionsError(eventsFunctionsExtensionsError);
              showErrorBox({
                message: i18n._(
                  t`An error has occurred during functions generation. If GDevelop is installed, verify that nothing is preventing GDevelop from writing on disk. If you're running GDevelop online, verify your internet connection and refresh functions from the Project Manager.`
                ),
                rawError: eventsFunctionsExtensionsError,
                errorId: 'events-functions-extensions-load-error',
              });
            } finally {
              loadState.isLoadPassRunning = false;
              console.info(
                `Finished loading project extensions pass ${passCount} in ${(
                  Date.now() - passStartTime
                ).toFixed(2)}ms.`
              );
            }
          } while (loadState.shouldRunTrailingPass);
        })
        .then(() => {
          console.info(
            `Project extensions are ready after ${passCount} pass(es), ${
              loadState.coalescedRequestCount
            } coalesced request(s), and ${(
              Date.now() - overallStartTime
            ).toFixed(2)}ms.`
          );
          if (projectLoadStates.current.get(project) === loadState) {
            projectLoadStates.current.delete(project);
          }
        });

      loadState.promise = loadPromise;
      projectLoadStates.current.set(project, loadState);
      return loadPromise;
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
