// @flow
import * as React from 'react';
import DragAndDropContextProvider from '../UI/DragAndDrop/DragAndDropContextProvider';
import { ThemeProvider } from '@material-ui/styles';
import { StylesProvider, jssPreset } from '@material-ui/core/styles';
import { getTheme } from '../UI/Theme';
import AuthenticatedUserProvider from '../Profile/AuthenticatedUserProvider';
import PublicProfileProvider from '../Profile/PublicProfileProvider';
import Authentication from '../Utils/GDevelopServices/Authentication';
import PreferencesProvider from './Preferences/PreferencesProvider';
import PreferencesContext from './Preferences/PreferencesContext';
import GDI18nProvider from '../Utils/i18n/GDI18nProvider';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import EventsFunctionsExtensionsProvider from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsProvider';
import {
  type EventsFunctionCodeWriter,
  type EventsFunctionCodeWriterCallbacks,
} from '../EventsFunctionsExtensionsLoader';
import {
  type EventsFunctionsExtensionWriter,
  type EventsFunctionsExtensionOpener,
} from '../EventsFunctionsExtensionsLoader/Storage';
import GDevelopThemeContext from '../UI/Theme/ThemeContext';
import { UnsavedChangesContextProvider } from './UnsavedChangesContext';
import { CommandsContextProvider } from '../CommandPalette/CommandsContext';
import { create } from 'jss';
import rtl from 'jss-rtl';
import { AssetStoreStateProvider } from '../AssetStore/AssetStoreContext';
import { ResourceStoreStateProvider } from '../AssetStore/ResourceStore/ResourceStoreContext';
import { ExampleStoreStateProvider } from '../AssetStore/ExampleStore/ExampleStoreContext';
import { ExtensionStoreStateProvider } from '../AssetStore/ExtensionStore/ExtensionStoreContext';
import { GamesShowcaseStateProvider } from '../GamesShowcase/GamesShowcaseContext';
import { TutorialStateProvider } from '../Tutorial/TutorialContext';
import ConfirmProvider from '../UI/Confirm/ConfirmProvider';

// Add the rtl plugin to the JSS instance to support RTL languages in material-ui components.
const jss = create({
  plugins: [...jssPreset().plugins, rtl()],
});

type Props = {|
  authentication: Authentication,
  disableCheckForUpdates: boolean,
  makeEventsFunctionCodeWriter: EventsFunctionCodeWriterCallbacks => ?EventsFunctionCodeWriter,
  eventsFunctionsExtensionWriter: ?EventsFunctionsExtensionWriter,
  eventsFunctionsExtensionOpener: ?EventsFunctionsExtensionOpener,
  children: ({|
    i18n: I18nType,
  |}) => React.Node,
|};

/**
 * Wrap the children with Drag and Drop, Material UI theme and i18n React providers,
 * so that these modules can be used in the children.
 */
export default class Providers extends React.Component<Props, {||}> {
  render() {
    const {
      disableCheckForUpdates,
      authentication,
      children,
      makeEventsFunctionCodeWriter,
      eventsFunctionsExtensionWriter,
      eventsFunctionsExtensionOpener,
      resourceFetcher,
    } = this.props;
    return (
      <DragAndDropContextProvider>
        <UnsavedChangesContextProvider>
          <PreferencesProvider disableCheckForUpdates={disableCheckForUpdates}>
            <PreferencesContext.Consumer>
              {({ values }) => {
                const theme = getTheme({
                  themeName: values.themeName,
                  language: values.language,
                });
                return (
                  <GDI18nProvider language={values.language.replace('_', '-')}>
                    <GDevelopThemeContext.Provider value={theme.gdevelopTheme}>
                      <StylesProvider jss={jss}>
                        <ThemeProvider theme={theme.muiTheme}>
                          <AuthenticatedUserProvider
                            authentication={authentication}
                          >
                            <PublicProfileProvider>
                              <I18n update>
                                {({ i18n }) => (
                                  <EventsFunctionsExtensionsProvider
                                    i18n={i18n}
                                    makeEventsFunctionCodeWriter={
                                      makeEventsFunctionCodeWriter
                                    }
                                    eventsFunctionsExtensionWriter={
                                      eventsFunctionsExtensionWriter
                                    }
                                    eventsFunctionsExtensionOpener={
                                      eventsFunctionsExtensionOpener
                                    }
                                  >
                                    <ConfirmProvider>
                                      <CommandsContextProvider>
                                        <AssetStoreStateProvider>
                                          <ResourceStoreStateProvider>
                                            <ExampleStoreStateProvider>
                                              <ExtensionStoreStateProvider>
                                                <GamesShowcaseStateProvider>
                                                  <TutorialStateProvider>
                                                    {children({ i18n })}
                                                  </TutorialStateProvider>
                                                </GamesShowcaseStateProvider>
                                              </ExtensionStoreStateProvider>
                                            </ExampleStoreStateProvider>
                                          </ResourceStoreStateProvider>
                                        </AssetStoreStateProvider>
                                      </CommandsContextProvider>
                                    </ConfirmProvider>
                                  </EventsFunctionsExtensionsProvider>
                                )}
                              </I18n>
                            </PublicProfileProvider>
                          </AuthenticatedUserProvider>
                        </ThemeProvider>
                      </StylesProvider>
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
