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
import { TutorialStateProvider } from '../Tutorial/TutorialContext';
import AlertProvider from '../UI/Alert/AlertProvider';
import { AnnouncementsFeedStateProvider } from '../AnnouncementsFeed/AnnouncementsFeedContext';
import PrivateAssetsAuthorizationProvider from '../AssetStore/PrivateAssets/PrivateAssetsAuthorizationProvider';
import InAppTutorialProvider from '../InAppTutorial/InAppTutorialProvider';
import { SubscriptionSuggestionProvider } from '../Profile/Subscription/SubscriptionSuggestionContext';
import { RouterContextProvider } from './RouterContext';
import ErrorBoundary from '../UI/ErrorBoundary';

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
const Providers = ({
  disableCheckForUpdates,
  authentication,
  children,
  makeEventsFunctionCodeWriter,
  eventsFunctionsExtensionWriter,
  eventsFunctionsExtensionOpener,
}: Props) => {
  return (
    <DragAndDropContextProvider>
      <UnsavedChangesContextProvider>
        <RouterContextProvider>
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
                          <ErrorBoundary
                            title="GDevelop encountered an issue"
                            scope="app"
                          >
                            <InAppTutorialProvider>
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
                                        <AlertProvider>
                                          <SubscriptionSuggestionProvider>
                                            <CommandsContextProvider>
                                              <AssetStoreStateProvider>
                                                <ResourceStoreStateProvider>
                                                  <ExampleStoreStateProvider>
                                                    <ExtensionStoreStateProvider>
                                                      <TutorialStateProvider>
                                                        <AnnouncementsFeedStateProvider>
                                                          <PrivateAssetsAuthorizationProvider>
                                                            {children({ i18n })}
                                                          </PrivateAssetsAuthorizationProvider>
                                                        </AnnouncementsFeedStateProvider>
                                                      </TutorialStateProvider>
                                                    </ExtensionStoreStateProvider>
                                                  </ExampleStoreStateProvider>
                                                </ResourceStoreStateProvider>
                                              </AssetStoreStateProvider>
                                            </CommandsContextProvider>
                                          </SubscriptionSuggestionProvider>
                                        </AlertProvider>
                                      </EventsFunctionsExtensionsProvider>
                                    )}
                                  </I18n>
                                </PublicProfileProvider>
                              </AuthenticatedUserProvider>
                            </InAppTutorialProvider>
                          </ErrorBoundary>
                        </ThemeProvider>
                      </StylesProvider>
                    </GDevelopThemeContext.Provider>
                  </GDI18nProvider>
                );
              }}
            </PreferencesContext.Consumer>
          </PreferencesProvider>
        </RouterContextProvider>
      </UnsavedChangesContextProvider>
    </DragAndDropContextProvider>
  );
};

export default Providers;
