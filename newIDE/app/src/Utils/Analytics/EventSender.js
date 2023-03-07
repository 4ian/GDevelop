// @flow
import posthog from 'posthog-js';
import { getUserUUID, resetUserUUID } from './UserUUID';
import Authentication from '../GDevelopServices/Authentication';
import {
  getProgramOpeningCount,
  incrementProgramOpeningCount,
} from './LocalStats';
import { getIDEVersion, getIDEVersionWithHash } from '../../Version';
import { loadPreferencesFromLocalStorage } from '../../MainFrame/Preferences/PreferencesProvider';
import { type AdditionalUserInfoForm } from '../../Utils/GDevelopServices/Authentication';
import { getBrowserLanguageOrLocale } from '../Language';
import optionalRequire from '../OptionalRequire';
import Window from '../Window';
const electron = optionalRequire('electron');

const isElectronApp = !!electron;
const isDev = Window.isDev();

let posthogLoaded = false;
const posthogAliasMade = [];
let posthogLastPropertiesSent = '';
let currentlyRunningInAppTutorial = null;

export const setCurrentlyRunningInAppTutorial = (tutorial: string | null) =>
  (currentlyRunningInAppTutorial = tutorial);

const recordEvent = (name: string, metadata?: { [string]: any }) => {
  if (isDev) return;

  if (!posthogLoaded) {
    console.info(`App analytics not ready for an event - retrying in 2s.`);
    setTimeout(() => {
      console.info(
        `Retrying to send the app analytics event with name ${name}`
      );
      recordEvent(name, metadata);
    }, 2000);

    return;
  }

  posthog.capture(name, {
    ...metadata,
    isInAppTutorialRunning: currentlyRunningInAppTutorial,
    isInDesktopApp: isElectronApp,
    isInWebApp: !isElectronApp,
  });
};

export const installAnalyticsEvents = (authentication: Authentication) => {
  if (isDev) {
    console.info('Development build - Analytics disabled');
    return;
  }

  const version = getIDEVersion();
  const versionWithHash = getIDEVersionWithHash();

  const updateUserInformation = () => {
    if (!posthogLoaded) {
      console.info(`App analytics not ready - retrying in 2s.`);
      setTimeout(() => {
        console.info(`Retrying to update the user for app analytics.`);
        updateUserInformation();
      }, 2000);

      return;
    }

    const firebaseUser = authentication.getFirebaseUserSync();
    const userPreferences = loadPreferencesFromLocalStorage();
    const appLanguage = userPreferences ? userPreferences.language : undefined;
    const browserLanguage = getBrowserLanguageOrLocale();

    const userProperties = {
      providerId: firebaseUser ? firebaseUser.providerId : undefined,
      email: firebaseUser ? firebaseUser.email : undefined,
      emailVerified: firebaseUser ? firebaseUser.emailVerified : undefined,
      // Only keep information useful to generate app usage statistics:
      uuid: getUserUUID(),
      version,
      versionWithHash,
      appLanguage,
      browserLanguage,
      programOpeningCount: getProgramOpeningCount(),
      themeName: userPreferences ? userPreferences.themeName : 'Unknown',
      ...(isElectronApp ? { usedDesktopApp: true } : { usedWebApp: true }),
    };

    // If the user is logged in, alias the user with its firebase id.
    if (firebaseUser) {
      const aliasKey = firebaseUser.uid + '#' + getUserUUID();
      if (!posthogAliasMade.includes(aliasKey)) {
        // Try to Alias the random UUID to the Firebase ID.
        // 2 cases:
        // - Either it's the first time the user logs in and posthog does not know
        //   about the Firebase ID, in which case we specify the firebaseId as 2nd parameter
        //   of the alias method.
        // - Or the user has already logged in and posthog knows about the Firebase ID,
        //   in which case PostHog will reject the merging of the 2 users.
        //   We then need to ensure we identify the user by its Firebase ID.
        posthog.alias(getUserUUID(), firebaseUser.uid);
        posthogAliasMade.push(aliasKey);
      }
    }

    // Identify which user is using the app, after de-duplicating the call to
    // avoid useless calls.
    // This is so we can build stats on the used version, languages and usage
    // of GDevelop features.
    const stringifiedUserProperties = JSON.stringify(userProperties);
    if (stringifiedUserProperties !== posthogLastPropertiesSent) {
      // If the user is not logged in, identify the user by its random UUID.
      // If the user is logged in, identify the user by its Firebase ID.
      const userId = firebaseUser ? firebaseUser.uid : getUserUUID();
      posthog.identify(userId, userProperties);
      posthogLastPropertiesSent = stringifiedUserProperties;
    }
  };

  const onUserLogout = () => {
    // Reset the UUID to generate a random new one and be sure
    // we don't count different users as a single one in our stats.
    resetUserUUID();
    posthog.reset();

    updateUserInformation();
  };

  authentication.addUserLogoutListener(onUserLogout);
  authentication.addUserUpdateListener(updateUserInformation);

  // Posthog
  posthog.init('phc_yjTVz4BMHUOhCLBhVImjk3Jn1AjMCg808bxENY228qu', {
    api_host: 'https://app.posthog.com',
    loaded: () => {
      posthogLoaded = true;
      updateUserInformation();
    },
    autocapture: false,
  });
};

export const sendProgramOpening = () => {
  incrementProgramOpeningCount();
  recordEvent('program_opening');
};

export const sendExportLaunched = (exportKind: string) => {
  recordEvent('export_launched', {
    platform: 'GDevelop JS Platform', // Hardcoded here for now
    exportKind,
  });
};

export const sendExampleDetailsOpened = (slug: string) => {
  recordEvent('example-details-opened', { slug });
};

export const sendNewGameCreated = ({
  exampleUrl,
  exampleSlug,
}: {|
  exampleUrl: string,
  exampleSlug: string,
|}) => {
  recordEvent('new_game_creation', {
    platform: 'GDevelop JS Platform', // Hardcoded here for now
    templateName: exampleUrl,
    exampleSlug,
  });
};

export const sendTutorialOpened = (tutorialName: string) => {
  recordEvent('tutorial_opened', {
    tutorialName,
  });
};

export const sendInAppTutorialStarted = (metadata: {|
  tutorialId: string,
  scenario: 'startOver' | 'resume' | 'start',
|}) => {
  recordEvent('in-app-tutorial-started', metadata);
};

export const sendAssetPackOpened = (options: {|
  assetPackName: string,
  assetPackTag: string | null,
  assetPackId: string | null,
  assetPackKind: 'public' | 'private' | 'unknown',
  source: 'store-home' | 'author-profile' | 'new-object',
|}) => {
  recordEvent('asset_pack_opened', options);
};

export const sendAssetPackBuyClicked = (options: {|
  assetPackId: string,
  assetPackName: string,
  assetPackTag: string,
  assetPackKind: 'public' | 'private' | 'unknown',
|}) => {
  recordEvent('asset_pack_buy_clicked', options);
};

export const sendAssetPackInformationOpened = (options: {|
  assetPackId: string,
  assetPackName: string,
  assetPackKind: 'public' | 'private' | 'unknown',
|}) => {
  recordEvent('asset_pack_information_opened', options);
};

export const sendHelpFinderOpened = () => {
  recordEvent('help_finder_opened', {});
};

export const sendHelpSearch = (searchText: string) => {
  recordEvent('help_search', {
    searchText,
  });
};

export const sendErrorMessage = (
  message: string,
  type:
    | 'error'
    | 'error-boundary_mainframe'
    | 'error-boundary_list-search-result'
    | 'error-boundary_box-search-result'
    | 'error-boundary_app',
  rawError: any,
  errorId: string
) => {
  recordEvent('error_message', {
    message,
    type,
    rawError,
    errorId,
  });
};

export const sendSignupDone = (email: string) => {
  recordEvent('signup', {
    email,
  });
};

export const sendAdditionalUserInfo = (
  additionalUserInfo: AdditionalUserInfoForm
) => {
  recordEvent('additional_user_info', {
    ...additionalUserInfo,
  });
};

export const sendSubscriptionCheckDialogShown = ({
  mode,
  id,
}: {|
  mode: string,
  id: string,
|}) => {
  recordEvent('subscription-check-dialog-shown', {
    mode,
    title: id,
  });
};

export const sendSubscriptionCheckDismiss = () => {
  recordEvent('subscription-check-dialog-dismiss');
};

export type SubscriptionDialogDisplayReason =
  | 'Disable GDevelop splash at startup'
  | 'Debugger'
  | 'Hot reloading'
  | 'Preview over wifi'
  | 'Landing dialog at opening'
  | 'Leaderboard count per game limit reached'
  | 'Cloud Project limit reached'
  | 'Consult profile'
  | 'Build limit reached'
  | 'Leaderboard customization'
  | 'Extend redeemed subscription';

export const sendSubscriptionDialogShown = (metadata: {|
  reason: SubscriptionDialogDisplayReason,
  preStep?: 'subscriptionChecker',
|}) => {
  recordEvent('subscription-dialog-shown', metadata);
};

export const sendAssetOpened = (options: {|
  id: string,
  name: string,
  assetPackName: string | null,
  assetPackTag: string | null,
  assetPackId: string | null,
  assetPackKind: 'public' | 'private' | 'unknown',
|}) => {
  recordEvent('asset-opened', options);
};

export const sendAssetAddedToProject = (options: {|
  id: string,
  name: string,
  assetPackName: string | null,
  assetPackTag: string | null,
  assetPackId: string | null,
  assetPackKind: 'public' | 'private' | 'unknown',
|}) => {
  recordEvent('asset-added-to-project', options);
};

export const sendExtensionDetailsOpened = (name: string) => {
  recordEvent('extension-details-opened', { name });
};

export const sendExtensionAddedToProject = (name: string) => {
  recordEvent('extension-added-to-project', { name });
};

export const sendNewObjectCreated = (name: string) => {
  recordEvent('new-object-created', { name });
};

export const sendShowcaseGameLinkOpened = (title: string, linkType: string) => {
  recordEvent('showcase-open-game-link', { title, linkType });
};

export const sendChoosePlanClicked = (planId: string | null) => {
  recordEvent('choose-plan-click', { planId });
};

export const sendExternalEditorOpened = (editorName: string) => {
  recordEvent('open_external_editor', { editorName });
};

export const sendBehaviorsEditorShown = (metadata: {|
  parentEditor: 'object-editor-dialog',
|}) => {
  // It would be costly to send an event for each opening of the behaviors editor.
  // We would rather have this aggregated by the app and sent as a property for the user.
  // TODO: investigate a more generic way of collecting some useful counters to understand
  // which editors are used (and how much/how long),
  // and send these as properties in the `identify` event (or in a debounced event?).
  // recordEvent('behaviors-editor-shown', metadata);
};

export const sendBehaviorAdded = (metadata: {|
  behaviorType: string,
  parentEditor: 'behaviors-editor' | 'instruction-editor-dialog',
|}) => {
  recordEvent('behavior-added', metadata);
};

export const sendEventsExtractedAsFunction = (metadata: {|
  step: 'begin' | 'end',
  parentEditor:
    | 'scene-events-editor'
    | 'extension-events-editor'
    | 'external-events-editor',
|}) => {
  recordEvent('events-extracted-as-function', metadata);
};

export const sendInAppTutorialProgress = (metadata: {|
  tutorialId: string,
  step: number,
  isCompleted: boolean,
|}) => {
  const builtInTutorialIds = ['onboarding'];
  recordEvent(
    builtInTutorialIds.includes(metadata.tutorialId)
      ? 'in-app-tutorial-built-in'
      : 'in-app-tutorial-external',
    metadata
  );
};
