// @flow
import posthog from 'posthog-js';
import { getUserUUID, resetUserUUID } from './UserUUID';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { User as FirebaseUser } from 'firebase/auth';
import {
  getProgramOpeningCount,
  incrementProgramOpeningCount,
} from './LocalStats';
import { getIDEVersion, getIDEVersionWithHash } from '../../Version';
import { loadPreferencesFromLocalStorage } from '../../MainFrame/Preferences/PreferencesProvider';
import { getBrowserLanguageOrLocale } from '../Language';
import optionalRequire from '../OptionalRequire';
import Window from '../Window';
const electron = optionalRequire('electron');

const isElectronApp = !!electron;
const isDev = Window.isDev();

// Flag helpful to know if posthog is ready to send events.
let posthogLoaded = false;
// Flag helpful to know if the user has been identified, to avoid sending initial events
// to a random uuid (like program_opening), which may not be merged to the main user's account.
let userIdentified = false;
let posthogLastPropertiesSent = '';
let currentlyRunningInAppTutorial = null;

export const setCurrentlyRunningInAppTutorial = (tutorial: string | null) =>
  (currentlyRunningInAppTutorial = tutorial);

/**
 * Used to send an event to the analytics.
 * This function will retry to send the event if the analytics service is not ready.
 */
const recordEvent = (name: string, metadata?: { [string]: any }) => {
  if (isDev) {
    // Uncomment to inspect analytics in development.
    // console.log(`Should have sent analytics event "${name}"`, metadata);
    return;
  }

  if (!posthogLoaded || !userIdentified) {
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

/**
 * Used once at the beginning of the app to initialize the analytics.
 */
export const installAnalyticsEvents = () => {
  if (isDev) {
    console.info('Development build - Analytics disabled');
    return;
  }

  posthog.init('phc_yjTVz4BMHUOhCLBhVImjk3Jn1AjMCg808bxENY228qu', {
    api_host: 'https://app.posthog.com',
    loaded: () => {
      posthogLoaded = true;
    },
    autocapture: false, // we disable autocapture because we want to control which events we send.
  });
};

/**
 * Must be called every time the user is fetched (and also even if the user turns out to be not connected).
 * This allows updating the user properties (like the language used, the version of the app, etc...)
 * and to identify the user if not already done.
 * We can safely call it multiple times, as it will only send the user properties if they changed.
 */
export const identifyUserForAnalytics = (
  authenticatedUser: AuthenticatedUser
) => {
  if (isDev) {
    console.info('Development build - Analytics disabled');
    return;
  }

  if (!posthogLoaded) {
    console.info(`App analytics not ready - retrying in 2s.`);
    setTimeout(() => {
      console.info(`Retrying to update the user for app analytics.`);
      identifyUserForAnalytics(authenticatedUser);
    }, 2000);

    return;
  }

  const firebaseUser = authenticatedUser.firebaseUser;
  const profile = authenticatedUser.profile;
  const userPreferences = loadPreferencesFromLocalStorage();
  const appLanguage = userPreferences ? userPreferences.language : undefined;
  const browserLanguage = getBrowserLanguageOrLocale();

  const userProperties = {
    providerId: firebaseUser ? firebaseUser.providerId : undefined,
    email: firebaseUser ? firebaseUser.email : undefined,
    emailVerified: firebaseUser ? firebaseUser.emailVerified : undefined,
    // Only keep information useful to generate app usage statistics:
    uuid: getUserUUID(),
    version: getIDEVersion(),
    versionWithHash: getIDEVersionWithHash(),
    appLanguage,
    browserLanguage,
    programOpeningCount: getProgramOpeningCount(),
    themeName: userPreferences ? userPreferences.themeName : 'Unknown',
    ...(isElectronApp ? { usedDesktopApp: true } : { usedWebApp: true }),
    // Additional profile information:
    gdevelopUsage: profile ? profile.gdevelopUsage : undefined,
    teamOrCompanySize: profile ? profile.teamOrCompanySize : undefined,
    companyName: profile ? profile.companyName : undefined,
    creationExperience: profile ? profile.creationExperience : undefined,
    creationGoal: profile ? profile.creationGoal : undefined,
    hearFrom: profile ? profile.hearFrom : undefined,
  };

  // Identify which user is using the app, after de-duplicating the call to
  // avoid useless calls.
  // This is so we can build stats on the used version, languages and usage
  // of GDevelop features.
  const stringifiedUserProperties = JSON.stringify(userProperties);
  if (stringifiedUserProperties !== posthogLastPropertiesSent) {
    // If the user is not logged in, identify the user by its anonymous UUID.
    // If the user is logged in, identify the user by its Firebase ID.
    const userId = firebaseUser ? firebaseUser.uid : getUserUUID();
    posthog.identify(userId, userProperties);
    posthogLastPropertiesSent = stringifiedUserProperties;
    userIdentified = true;
  }
};

/**
 * Must be called on signup, to link the current user Firebase ID to the anonymous UUID
 * that was used before the signup (this allows linking the events sent before the signup)
 * This is only done on signup as an ID can only be an alias of another ID once.
 */
export const aliasUserForAnalyticsAfterSignUp = (
  firebaseUser: FirebaseUser
) => {
  if (isDev) {
    console.info('Development build - Analytics disabled');
    return;
  }

  if (!posthogLoaded) {
    console.info(`App analytics not ready for aliasing - retrying in 2s.`);
    setTimeout(() => {
      console.info(`Retrying to alias the user for app analytics.`);
      aliasUserForAnalyticsAfterSignUp(firebaseUser);
    }, 2000);

    return;
  }

  // This indicates to Posthog that the current user Firebase ID is now an alias
  // of the anonymous UUID that was used before the signup.
  posthog.alias(firebaseUser.uid, getUserUUID());
};

export const onUserLogoutForAnalytics = () => {
  if (isDev) {
    console.info('Development build - Analytics disabled');
    return;
  }

  // Reset the UUID to generate a random new one and be sure
  // we don't count different users as a single one in our stats.
  resetUserUUID();
  posthog.reset();
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

export const sendGameDetailsOpened = (options: {
  from: 'profile' | 'homepage' | 'projectManager',
}) => {
  recordEvent('game_details_opened', options);
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
  assetPackId: string | null,
  assetPackName: string,
  assetPackTag: string | null,
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
  currency?: string,
  usageType: string,
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

export const sendGameTemplateBuyClicked = (options: {|
  gameTemplateId: string,
  gameTemplateName: string,
  gameTemplateTag: string,
  currency?: string,
  usageType: string,
|}) => {
  recordEvent('game_template_buy_clicked', options);
};

export const sendGameTemplateInformationOpened = (options: {|
  gameTemplateId: string,
  gameTemplateName: string,
  source: 'store' | 'examples-list' | 'homepage' | 'web-link',
|}) => {
  recordEvent('game_template_information_opened', options);
};

export const sendUserSurveyStarted = () => {
  recordEvent('user_survey_started');
};
export const sendUserSurveyCompleted = () => {
  recordEvent('user_survey_completed');
};
export const sendUserSurveyHidden = () => {
  recordEvent('user_survey_hidden');
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
  | 'Extend redeemed subscription'
  | 'Generate project from prompt'
  | 'Version history'
  | 'Add collaborators on project'
  | 'Claim asset pack'
  | 'Unlock build type';

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

export const sendChoosePlanClicked = (metadata: {|
  planId: string | null,
  pricingSystemId: string | null,
|}) => {
  recordEvent('choose-plan-click', metadata);
};

export const sendCancelSubscriptionToChange = (metadata: {|
  planId: string,
  pricingSystemId: string | null,
|}) => {
  recordEvent('cancel-subscription-to-change', metadata);
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

export const sendCloudProjectCouldNotBeOpened = (metadata: {|
  userId: string,
  cloudProjectId: string,
|}) => {
  recordEvent('cloud-project-opening-failed', metadata);
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

const inAppTutorialProgressLastFiredEvents: {
  [string]: {
    lastStep: number,
    nextCheckTimeoutId: TimeoutID | null,
  },
} = {};

/**
 * Register the progress of a tutorial.
 *
 * To avoid sending too many events, we only send tutorial progress analytics events
 * when some steps are reached (step index == multiple of 5), when the tutorial is completed,
 * or after some inactivity (more than 30 seconds).
 */
export const sendInAppTutorialProgress = ({
  step,
  tutorialId,
  isCompleted,
}: {|
  tutorialId: string,
  step: number,
  isCompleted: boolean,
|}) => {
  const immediatelyRecordEvent = (
    spentMoreThan30SecondsSinceLastStep: ?boolean
  ) => {
    // Remember the last step we sent an event for.
    inAppTutorialProgressLastFiredEvents[tutorialId] = {
      lastStep: step,
      nextCheckTimeoutId: null,
    };
    recordEvent('in-app-tutorial-external', {
      tutorialId,
      step,
      isCompleted,
      spentMoreThan30SecondsSinceLastStep: !!spentMoreThan30SecondsSinceLastStep,
    });
  };

  // We receive a new progress event, so we can clear the timeout used
  // to send the last event in case there is no progress.
  const lastFiredEvent = inAppTutorialProgressLastFiredEvents[tutorialId];
  if (lastFiredEvent && lastFiredEvent.nextCheckTimeoutId !== null)
    clearTimeout(lastFiredEvent.nextCheckTimeoutId);

  // Immediately send the event if the tutorial is ended or it's the first progress.
  if (isCompleted || !lastFiredEvent) {
    immediatelyRecordEvent();
    return;
  }

  // Then, send an event every 5 steps, or if we had more than 5 steps since the last event.
  // This last point is important because some steps might be hidden/skipped.
  if (step % 5 === 0 || step >= lastFiredEvent.lastStep + 5) {
    immediatelyRecordEvent();
    return;
  }

  // Otherwise, continue to remember the last step that was sent, and force to send it 30 seconds
  // later if there was no more progress.
  inAppTutorialProgressLastFiredEvents[tutorialId] = {
    lastStep: lastFiredEvent.lastStep,
    nextCheckTimeoutId: setTimeout(() => immediatelyRecordEvent(true), 30000),
  };
};
