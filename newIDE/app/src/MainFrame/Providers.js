// @flow
import * as React from 'react';
import DragDropContextProvider from '../Utils/DragDropHelpers/DragDropContextProvider';
import V0MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { getTheme } from '../UI/Theme';
import UserProfileProvider from '../Profile/UserProfileProvider';
import Authentification from '../Utils/GDevelopServices/Authentification';
import PreferencesProvider from './Preferences/PreferencesProvider';
import PreferencesContext from './Preferences/PreferencesContext';
import GDI18nProvider from '../Utils/i18n/GDI18nProvider';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import EventsFunctionsExtensionsProvider from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsProvider';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { type EventsFunctionCodeWriter } from '../EventsFunctionsExtensionsLoader';
import {
  type EventsFunctionsExtensionWriter,
  type EventsFunctionsExtensionOpener,
} from '../EventsFunctionsExtensionsLoader/Storage';

type Props = {|
  authentification: Authentification,
  disableCheckForUpdates: boolean,
  eventsFunctionCodeWriter: ?EventsFunctionCodeWriter,
  eventsFunctionsExtensionWriter: ?EventsFunctionsExtensionWriter,
  eventsFunctionsExtensionOpener: ?EventsFunctionsExtensionOpener,
  children: ({
    i18n: I18nType,
    eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  }) => React.Node,
|};

/**
 * Wrap the children with Drag and Drop, Material UI theme and i18n React providers,
 * so that these modules can be used in the children.
 */
export default class Providers extends React.Component<Props, {||}> {
  render() {
    const {
      disableCheckForUpdates,
      authentification,
      children,
      eventsFunctionCodeWriter,
      eventsFunctionsExtensionWriter,
      eventsFunctionsExtensionOpener,
    } = this.props;
    return (
      <DragDropContextProvider>
        <PreferencesProvider disableCheckForUpdates={disableCheckForUpdates}>
          <PreferencesContext.Consumer>
            {({ values }) => (
              <GDI18nProvider language={values.language}>
                <V0MuiThemeProvider muiTheme={getTheme(values.themeName)}>
                  <UserProfileProvider authentification={authentification}>
                    <I18n update>
                      {({ i18n }) => (
                        <EventsFunctionsExtensionsProvider
                          i18n={i18n}
                          eventsFunctionCodeWriter={eventsFunctionCodeWriter}
                          eventsFunctionsExtensionWriter={
                            eventsFunctionsExtensionWriter
                          }
                          eventsFunctionsExtensionOpener={
                            eventsFunctionsExtensionOpener
                          }
                        >
                          <EventsFunctionsExtensionsContext.Consumer>
                            {eventsFunctionsExtensionsState =>
                              children({ i18n, eventsFunctionsExtensionsState })
                            }
                          </EventsFunctionsExtensionsContext.Consumer>
                        </EventsFunctionsExtensionsProvider>
                      )}
                    </I18n>
                  </UserProfileProvider>
                </V0MuiThemeProvider>
              </GDI18nProvider>
            )}
          </PreferencesContext.Consumer>
        </PreferencesProvider>
      </DragDropContextProvider>
    );
  }
}
