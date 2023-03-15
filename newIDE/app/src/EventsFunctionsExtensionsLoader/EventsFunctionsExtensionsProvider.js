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

type State = EventsFunctionsExtensionsState;

/**
 * Allow children components to request the loading (or unloading) of
 * the events functions extensions of the project.
 * Useful when dealing with events functions extensions (new extension created,
 * removed, pasted, installed, etc...).
 */
export default class EventsFunctionsExtensionsProvider extends React.Component<
  Props,
  State
> {
  _eventsFunctionCodeWriter: ?EventsFunctionCodeWriter = this.props.makeEventsFunctionCodeWriter(
    {
      onWriteFile: this._onWriteFile.bind(this),
    }
  );
  _includeFileHashs: { [string]: number } = {};
  _lastLoadPromise: ?Promise<void> = null;
  state = {
    eventsFunctionsExtensionsError: null,
    loadProjectEventsFunctionsExtensions: this._loadProjectEventsFunctionsExtensions.bind(
      this
    ),
    unloadProjectEventsFunctionsExtensions: this._unloadProjectEventsFunctionsExtensions.bind(
      this
    ),
    unloadProjectEventsFunctionsExtension: this._unloadProjectEventsFunctionsExtension.bind(
      this
    ),
    reloadProjectEventsFunctionsExtensions: this._reloadProjectEventsFunctionsExtensions.bind(
      this
    ),
    reloadProjectEventsFunctionsExtensionMetadata: this._reloadProjectEventsFunctionsExtensionMetadata.bind(
      this
    ),
    ensureLoadFinished: this._ensureLoadFinished.bind(this),
    getEventsFunctionsExtensionWriter: () =>
      this.props.eventsFunctionsExtensionWriter,
    getEventsFunctionsExtensionOpener: () =>
      this.props.eventsFunctionsExtensionOpener,
    getIncludeFileHashs: () => this._includeFileHashs,
  };

  _onWriteFile({ includeFile, content }: IncludeFileContent) {
    this._includeFileHashs[includeFile] = xxhashjs
      .h32(content, 0xabcd)
      .toNumber();
  }

  _ensureLoadFinished(): Promise<void> {
    if (this._lastLoadPromise) {
      console.info(
        'Waiting on the events functions extensions to finish loading...'
      );
    } else {
      console.info('Events functions extensions are ready.');
    }

    return this._lastLoadPromise
      ? this._lastLoadPromise.then(() => {
          console.info('Events functions extensions finished loading.');
        })
      : Promise.resolve();
  }

  _loadProjectEventsFunctionsExtensions(project: ?gdProject): Promise<void> {
    const { i18n } = this.props;
    const eventsFunctionCodeWriter = this._eventsFunctionCodeWriter;
    if (!project || !eventsFunctionCodeWriter) return Promise.resolve();

    const lastLoadPromise = this._lastLoadPromise || Promise.resolve();

    this._lastLoadPromise = lastLoadPromise
      .then(() =>
        loadProjectEventsFunctionsExtensions(
          project,
          eventsFunctionCodeWriter,
          i18n
        )
      )
      .then(() =>
        this.setState({
          eventsFunctionsExtensionsError: null,
        })
      )
      .catch((eventsFunctionsExtensionsError: Error) => {
        this.setState({
          eventsFunctionsExtensionsError,
        });
        showErrorBox({
          message: i18n._(
            t`An error has occurred during functions generation. If GDevelop is installed, verify that nothing is preventing GDevelop from writing on disk. If you're running GDevelop online, verify your internet connection and refresh functions from the Project Manager.`
          ),
          rawError: eventsFunctionsExtensionsError,
          errorId: 'events-functions-extensions-load-error',
        });
      })
      .then(() => {
        this._lastLoadPromise = null;
      });

    return this._lastLoadPromise;
  }

  _reloadProjectEventsFunctionsExtensionMetadata(
    project: ?gdProject,
    extension: gdEventsFunctionsExtension
  ): void {
    const { i18n } = this.props;
    const eventsFunctionCodeWriter = this._eventsFunctionCodeWriter;
    if (!project || !eventsFunctionCodeWriter) return;

    try {
      reloadProjectEventsFunctionsExtensionMetadata(
        project,
        extension,
        eventsFunctionCodeWriter,
        i18n
      );
    } catch (eventsFunctionsExtensionsError) {
      this.setState({
        eventsFunctionsExtensionsError,
      });
      showErrorBox({
        message: i18n._(
          t`An error has occurred during functions generation. If GDevelop is installed, verify that nothing is preventing GDevelop from writing on disk. If you're running GDevelop online, verify your internet connection and refresh functions from the Project Manager.`
        ),
        rawError: eventsFunctionsExtensionsError,
        errorId: 'events-functions-extensions-load-error',
      });
    }
  }

  _unloadProjectEventsFunctionsExtensions(project: gdProject) {
    unloadProjectEventsFunctionsExtensions(project);
  }

  _unloadProjectEventsFunctionsExtension(
    project: gdProject,
    extensionName: string
  ) {
    unloadProjectEventsFunctionsExtension(project, extensionName);
  }

  _reloadProjectEventsFunctionsExtensions(project: ?gdProject): Promise<void> {
    if (project) {
      this._unloadProjectEventsFunctionsExtensions(project);
    }
    return this._loadProjectEventsFunctionsExtensions(project);
  }

  render() {
    return (
      <EventsFunctionsExtensionsContext.Provider value={this.state}>
        {this.props.children}
      </EventsFunctionsExtensionsContext.Provider>
    );
  }
}
