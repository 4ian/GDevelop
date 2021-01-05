// @flow
import * as React from 'react';
import DragAndDropContextProvider from '../UI/DragAndDrop/DragAndDropContextProvider';
import { ThemeProvider } from '@material-ui/styles';
import { StylesProvider, jssPreset } from '@material-ui/core/styles';
import { getTheme } from '../UI/Theme';
import UserProfileProvider from '../Profile/UserProfileProvider';
import Authentification from '../Utils/GDevelopServices/Authentification';
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
import { ExtensionStoreStateProvider } from '../AssetStore/ExtensionStore/ExtensionStoreContext';
import {
  type ResourceFetcher,
  ResourceFetcherContext,
} from '../ProjectsStorage/ResourceFetcher';

// Add the rtl plugin to the JSS instance to support RTL languages in material-ui components.
const jss = create({
  plugins: [...jssPreset().plugins, rtl()],
});

type Props = {|
  authentification: Authentification,
  disableCheckForUpdates: boolean,
  makeEventsFunctionCodeWriter: EventsFunctionCodeWriterCallbacks => ?EventsFunctionCodeWriter,
  eventsFunctionsExtensionWriter: ?EventsFunctionsExtensionWriter,
  eventsFunctionsExtensionOpener: ?EventsFunctionsExtensionOpener,
  resourceFetcher: ResourceFetcher,
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
      authentification,
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
                  <GDI18nProvider language={values.language}>
                    <GDevelopThemeContext.Provider value={theme.gdevelopTheme}>
                      <StylesProvider jss={jss}>
                        <ThemeProvider theme={theme.muiTheme}>
                          <UserProfileProvider
                            authentification={authentification}
                          >
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
                                  <CommandsContextProvider>
                                    <AssetStoreStateProvider>
                                      <ResourceStoreStateProvider>
                                        <ExtensionStoreStateProvider>
                                          <ResourceFetcherContext.Provider
                                            value={resourceFetcher}
                                          >
                                            {children({ i18n })}
                                          </ResourceFetcherContext.Provider>
                                        </ExtensionStoreStateProvider>
                                      </ResourceStoreStateProvider>
                                    </AssetStoreStateProvider>
                                  </CommandsContextProvider>
                                </EventsFunctionsExtensionsProvider>
                              )}
                            </I18n>
                          </UserProfileProvider>
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
