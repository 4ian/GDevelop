// @flow
import * as React from 'react';
import DragAndDropContextProvider from '../UI/DragAndDrop/DragAndDropContextProvider';
import AuthenticatedUserProvider from '../Profile/AuthenticatedUserProvider';
import { PublicProfileProvider } from '../Profile/PublicProfileContext';
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
import { UnsavedChangesContextProvider } from './UnsavedChangesContext';
import { CommandsContextProvider } from '../CommandPalette/CommandsContext';
import { AssetStoreStateProvider } from '../AssetStore/AssetStoreContext';
import { ResourceStoreStateProvider } from '../AssetStore/ResourceStore/ResourceStoreContext';
import { ExampleStoreStateProvider } from '../AssetStore/ExampleStore/ExampleStoreContext';
import { PrivateGameTemplateStoreStateProvider } from '../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import { BundleStoreStateProvider } from '../AssetStore/Bundles/BundleStoreContext';
import { ExtensionStoreStateProvider } from '../AssetStore/ExtensionStore/ExtensionStoreContext';
import { BehaviorStoreStateProvider } from '../AssetStore/BehaviorStore/BehaviorStoreContext';
import { TutorialStateProvider } from '../Tutorial/TutorialContext';
import AlertProvider from '../UI/Alert/AlertProvider';
import { AnnouncementsFeedStateProvider } from '../AnnouncementsFeed/AnnouncementsFeedContext';
import PrivateAssetsAuthorizationProvider from '../AssetStore/PrivateAssets/PrivateAssetsAuthorizationProvider';
import InAppTutorialProvider from '../InAppTutorial/InAppTutorialProvider';
import { SubscriptionSuggestionProvider } from '../Profile/Subscription/SubscriptionSuggestionContext';
import { RouterContextProvider } from './RouterContext';
import ErrorBoundary from '../UI/ErrorBoundary';
import { FullThemeProvider } from '../UI/Theme/FullThemeProvider';
import { AssetStoreNavigatorStateProvider } from '../AssetStore/AssetStoreNavigator';
import { Trans } from '@lingui/macro';
import { CreditsPackageStoreStateProvider } from '../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import { ProductLicenseStoreStateProvider } from '../AssetStore/ProductLicense/ProductLicenseStoreContext';
import { MarketingPlansStoreStateProvider } from '../MarketingPlans/MarketingPlansStoreContext';
import { CourseStoreStateProvider } from '../Course/CourseStoreContext';
import { Resource3DPreviewProvider } from '../ResourcesList/ResourcePreview/Resource3DPreviewContext';
import { AiRequestProvider } from '../AiGeneration/AiRequestContext';

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
              {({ values }) => (
                <GDI18nProvider language={values.language.replace('_', '-')}>
                  <FullThemeProvider>
                    <ErrorBoundary
                      componentTitle={<Trans>GDevelop app</Trans>}
                      scope="app"
                    >
                      <InAppTutorialProvider>
                        <AlertProvider>
                          <AuthenticatedUserProvider
                            authentication={authentication}
                            preferencesValues={values}
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
                                    <SubscriptionSuggestionProvider>
                                      <CommandsContextProvider>
                                        <AssetStoreNavigatorStateProvider>
                                          <AssetStoreStateProvider>
                                            <ResourceStoreStateProvider>
                                              <ExampleStoreStateProvider>
                                                <PrivateGameTemplateStoreStateProvider>
                                                  <BundleStoreStateProvider>
                                                    <CreditsPackageStoreStateProvider>
                                                      <CourseStoreStateProvider>
                                                        <ProductLicenseStoreStateProvider>
                                                          <MarketingPlansStoreStateProvider>
                                                            <ExtensionStoreStateProvider
                                                              i18n={i18n}
                                                            >
                                                              <BehaviorStoreStateProvider
                                                                i18n={i18n}
                                                              >
                                                                <TutorialStateProvider>
                                                                  <AnnouncementsFeedStateProvider>
                                                                    <PrivateAssetsAuthorizationProvider>
                                                                      <Resource3DPreviewProvider>
                                                                        <AiRequestProvider>
                                                                          {children(
                                                                            {
                                                                              i18n,
                                                                            }
                                                                          )}
                                                                        </AiRequestProvider>
                                                                      </Resource3DPreviewProvider>
                                                                    </PrivateAssetsAuthorizationProvider>
                                                                  </AnnouncementsFeedStateProvider>
                                                                </TutorialStateProvider>
                                                              </BehaviorStoreStateProvider>
                                                            </ExtensionStoreStateProvider>
                                                          </MarketingPlansStoreStateProvider>
                                                        </ProductLicenseStoreStateProvider>
                                                      </CourseStoreStateProvider>
                                                    </CreditsPackageStoreStateProvider>
                                                  </BundleStoreStateProvider>
                                                </PrivateGameTemplateStoreStateProvider>
                                              </ExampleStoreStateProvider>
                                            </ResourceStoreStateProvider>
                                          </AssetStoreStateProvider>
                                        </AssetStoreNavigatorStateProvider>
                                      </CommandsContextProvider>
                                    </SubscriptionSuggestionProvider>
                                  </EventsFunctionsExtensionsProvider>
                                )}
                              </I18n>
                            </PublicProfileProvider>
                          </AuthenticatedUserProvider>
                        </AlertProvider>
                      </InAppTutorialProvider>
                    </ErrorBoundary>
                  </FullThemeProvider>
                </GDI18nProvider>
              )}
            </PreferencesContext.Consumer>
          </PreferencesProvider>
        </RouterContextProvider>
      </UnsavedChangesContextProvider>
    </DragAndDropContextProvider>
  );
};

export default Providers;
