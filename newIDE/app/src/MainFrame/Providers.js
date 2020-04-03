// @flow
import * as React from 'react';
import DragAndDropContextProvider from '../UI/DragAndDrop/DragAndDropContextProvider';
import { ThemeProvider } from '@material-ui/styles';
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
import GDevelopThemeContext from '../UI/Theme/ThemeContext';
import { UnsavedChangesContextProvider } from './UnsavedChangesContext';

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
      <DragAndDropContextProvider>
        <UnsavedChangesContextProvider>
          <PreferencesProvider disableCheckForUpdates={disableCheckForUpdates}>
            <PreferencesContext.Consumer>
              {({ values }) => {
                const theme = getTheme(values.themeName);
                return (
                  <GDI18nProvider language={values.language}>
                    <GDevelopThemeContext.Provider value={theme.gdevelopTheme}>
                      <ThemeProvider theme={theme.muiTheme}>
                        <UserProfileProvider
                          authentification={authentification}
                        >
                          <I18n update>
                            {({ i18n }) => (
                              <EventsFunctionsExtensionsProvider
                                i18n={i18n}
                                eventsFunctionCodeWriter={
                                  eventsFunctionCodeWriter
                                }
                                eventsFunctionsExtensionWriter={
                                  eventsFunctionsExtensionWriter
                                }
                                eventsFunctionsExtensionOpener={
                                  eventsFunctionsExtensionOpener
                                }
                              >
                                <EventsFunctionsExtensionsContext.Consumer>
                                  {eventsFunctionsExtensionsState =>
                                    children({
                                      i18n,
                                      eventsFunctionsExtensionsState,
                                    })
                                  }
                                </EventsFunctionsExtensionsContext.Consumer>
                              </EventsFunctionsExtensionsProvider>
                            )}
                          </I18n>
                        </UserProfileProvider>
                      </ThemeProvider>
                    </GDevelopThemeContext.Provider>
                  </GDI18nProvider>
                );
              }}
            </PreferencesContext.Consumer>
          </PreferencesProvider>
        </UnsavedChangesContextProvider>
      </DragAndDropContextProvider>
    );
  }
}
