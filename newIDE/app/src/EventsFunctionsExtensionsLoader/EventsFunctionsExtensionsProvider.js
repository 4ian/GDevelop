// @flow

import * as React from 'react';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from './EventsFunctionsExtensionsContext';
import {
  loadProjectEventsFunctionsExtensions,
  type EventsFunctionWriter,
  unloadProjectEventsFunctionsExtensions,
} from '.';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

type Props = {|
  children: React.Node,
  i18n: I18nType,
  eventsFunctionWriter: ?EventsFunctionWriter,
|};

type State = EventsFunctionsExtensionsState;

export default class EventsFunctionsExtensionsProvider extends React.Component<
  Props,
  State
> {
  state = {
    eventsFunctionsExtensionsError: null,
    loadProjectEventsFunctionsExtensions: this._loadProjectEventsFunctionsExtensions.bind(
      this
    ),
    unloadProjectEventsFunctionsExtensions: this._unloadProjectEventsFunctionsExtensions.bind(
      this
    ),
    reloadProjectEventsFunctionsExtensions: this._reloadProjectEventsFunctionsExtensions.bind(
      this
    ),
  };

  _loadProjectEventsFunctionsExtensions(project: ?gdProject): Promise<void> {
    const { i18n, eventsFunctionWriter } = this.props;
    if (!project || !eventsFunctionWriter) return Promise.resolve();

    return loadProjectEventsFunctionsExtensions(project, eventsFunctionWriter)
      .then(() =>
        this.setState({
          eventsFunctionsExtensionsError: null,
        })
      )
      .catch((eventsFunctionsExtensionsError: Error) => {
        this.setState({
          eventsFunctionsExtensionsError,
        });
        showErrorBox(
          i18n._(
            t`An error has occured during functions generation. If GDevelop is installed, verify that nothing is preventing GDevelop from writing on disk. If you're running GDevelop online, verify your internet connection and refresh functions from the Project Manager.`
          ),
          eventsFunctionsExtensionsError
        );
      });
  }

  _unloadProjectEventsFunctionsExtensions(project: gdProject) {
    unloadProjectEventsFunctionsExtensions(project);
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
