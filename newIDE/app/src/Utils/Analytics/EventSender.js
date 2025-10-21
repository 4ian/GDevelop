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
import { type SubscriptionAnalyticsMetadata } from '../../Profile/Subscription/SubscriptionSuggestionContext';
import optionalRequire from '../OptionalRequire';
import Window from '../Window';
import { isMobile, isNativeMobileApp } from '../Platform';
import { retryIfFailed } from '../RetryIfFailed';
import { type NewProjectCreationSource } from '../../ProjectCreation/NewProjectSetupDialog';
import { isServiceWorkerSupported } from '../../ServiceWorkerSetup';
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

let gdevelopEditorAnalytics: {|
  initialize: (rootElement: HTMLElement) => Promise<void>,
  identify: (
    userId: string,
    userProperties: { [string]: any }
  ) => Promise<void>,
  trackEvent: (eventName: string, metadata: { [string]: any }) => Promise<void>,
|} | null = null;
let gdevelopEditorAnalyticsPromise: Promise<void> | null = null;

const ensureGDevelopEditorAnalyticsReady = async () => {
  if (gdevelopEditorAnalytics) {
    // Already loaded.
    return;
  }

  if (gdevelopEditorAnalyticsPromise) {
    // Being loaded.
    return gdevelopEditorAnalyticsPromise;
  }

  gdevelopEditorAnalyticsPromise = (async () => {
    try {
      // Load the library. If it fails, retry or throw so we can retry later.
      const module = await retryIfFailed(
        { times: 2 },
        async () =>
          // $FlowExpectedError - Remote script cannot be found.
          (await import(/* webpackIgnore: true */ 'https://resources.gdevelop.io/a/gea.js'))
            .default
      );
      if (module) {
        await module.initialize({
          documentBody: document.body,
          isNativeMobileApp: isNativeMobileApp(),
          isElectronApp,
          isDev,
          isMobile: isMobile(),
          ideVersionWithHash: getIDEVersionWithHash(),
        });
        gdevelopEditorAnalytics = module;
      }
    } catch (error) {
      console.error('Error while loading GDevelop Editor Analytics:', error);
    } finally {
      // If loading fails, retry later.
      gdevelopEditorAnalyticsPromise = null;
    }
  })();

  return gdevelopEditorAnalyticsPromise;
};

export const setCurrentlyRunningInAppTutorial = (tutorial: string | null) =>
  (currentlyRunningInAppTutorial = tutorial);

const makeCanSendEvent = (options: {| minimumTimeBetweenEvents: number |}) => {
  const lastSentEventTimestamps = {};
  return (eventName: string) => {
    const now = Date.now();
    if (lastSentEventTimestamps[eventName]) {
      const timeSinceLastEvent = now - lastSentEventTimestamps[eventName];
      if (timeSinceLastEvent < options.minimumTimeBetweenEvents) {
        return false;
      }
    }
    lastSentEventTimestamps[eventName] = now;
    return true;
  };
};

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

  (() => {
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
      // Always add metadata about the app:
      isInAppTutorialRunning: currentlyRunningInAppTutorial,
      isInDesktopApp: isElectronApp,
      isInWebApp: !isElectronApp,
      appKind: isElectronApp
        ? 'desktop-app'
        : isNativeMobileApp()
        ? 'mobile-app'
        : 'web-app',
      appVersion: getIDEVersion(),
      appVersionWithHash: getIDEVersionWithHash(),
      serviceWorkerSupported: isServiceWorkerSupported(),
    });
  })();

  (async () => {
    await ensureGDevelopEditorAnalyticsReady();
    if (gdevelopEditorAnalytics) {
      await gdevelopEditorAnalytics.trackEvent(name, metadata || {});
    }
  })();
};

/**
 * Used once at the beginning of the app to initialize the analytics.
 */
export const installAnalyticsEvents = () => {
  if (isDev) {
    console.info('Development build - Analytics disabled');
    return;
  }

  ensureGDevelopEditorAnalyticsReady().catch(() => {
    // Will be retried when an event is sent.
  });

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

  // If the user is not logged in, identify the user by its anonymous UUID.
  // If the user is logged in, identify the user by its Firebase ID.
  const userId = firebaseUser ? firebaseUser.uid : getUserUUID();

  (() => {
    if (!posthogLoaded) {
      console.info(`App analytics not ready - retrying in 2s.`);
      setTimeout(() => {
        console.info(`Retrying to update the user for app analytics.`);
        identifyUserForAnalytics(authenticatedUser);
      }, 2000);

      return;
    }

    // Identify which user is using the app, after de-duplicating the call to
    // avoid useless calls.
    // This is so we can build stats on the used version, languages and usage
    // of GDevelop features.
    const stringifiedUserProperties = JSON.stringify(userProperties);
    if (stringifiedUserProperties !== posthogLastPropertiesSent) {
      posthog.identify(userId, userProperties);
      posthogLastPropertiesSent = stringifiedUserProperties;
      userIdentified = true;
    }
  })();

  (async () => {
    await ensureGDevelopEditorAnalyticsReady();
    if (gdevelopEditorAnalytics) {
      await gdevelopEditorAnalytics.identify(userId, userProperties);
    }
  })();
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
  exampleCompositeSlug,
  creationSource,
}: {|
  exampleUrl: string,
  exampleSlug: string,
  exampleCompositeSlug: string,
  creationSource: NewProjectCreationSource,
|}) => {
  recordEvent('new_game_creation', {
    platform: 'GDevelop JS Platform', // Hardcoded here for now
    templateName: exampleUrl,
    exampleSlug,
    exampleCompositeSlug,
    creationSource,
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
  isUIRestricted: boolean,
|}) => {
  recordEvent('in-app-tutorial-started', metadata);
};

export const sendInAppTutorialExited = (metadata: {|
  tutorialId: string,
  reason: 'completed' | 'user-early-exit',
  isUIRestricted: boolean,
|}) => {
  recordEvent('in-app-tutorial-exited', metadata);
};

const patchWithCurrencyField = (options: { [string]: any }) => {
  return {
    ...options,
    currency: options.priceCurrency,
  };
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
  priceValue: number | void,
  priceCurrency: string | void,
  usageType: string,
|}) => {
  recordEvent('asset_pack_buy_clicked', patchWithCurrencyField(options));
};

export const sendAssetPackInformationOpened = (options: {|
  assetPackId: string,
  assetPackName: string,
  assetPackKind: 'public' | 'private' | 'unknown',
  priceValue: number | void,
  priceCurrency: string | void,
|}) => {
  recordEvent('asset_pack_information_opened', patchWithCurrencyField(options));
};

export const sendGameTemplateBuyClicked = (options: {|
  gameTemplateId: string,
  gameTemplateName: string,
  gameTemplateTag: string,
  usageType: string,
  priceValue: number | void,
  priceCurrency: string | void,
|}) => {
  recordEvent('game_template_buy_clicked', patchWithCurrencyField(options));
};

export const sendGameTemplateInformationOpened = (options: {|
  gameTemplateId: string,
  gameTemplateName: string,
  source: 'store' | 'examples-list' | 'homepage' | 'web-link',
  priceValue: number | void,
  priceCurrency: string | void,
|}) => {
  recordEvent(
    'game_template_information_opened',
    patchWithCurrencyField(options)
  );
};

export const sendBundleBuyClicked = (options: {|
  bundleId: string,
  bundleName: string,
  bundleTag: string,
  usageType: string,
  priceValue: number | void,
  priceCurrency: string | void,
|}) => {
  recordEvent('bundle_buy_clicked', patchWithCurrencyField(options));
};
export const sendBundleInformationOpened = (options: {|
  bundleId: string,
  bundleName: string,
  source: 'store' | 'learn' | 'web-link',
  priceValue: number | void,
  priceCurrency: string | void,
|}) => {
  recordEvent('bundle_information_opened', patchWithCurrencyField(options));
};

export const sendCourseInformationOpened = (options: {|
  courseId: string,
  courseName: string,
  source: 'store' | 'learn',
  priceValue: number | void,
  priceCurrency: string | void,
|}) => {
  recordEvent('course_information_opened', patchWithCurrencyField(options));
};

export const sendCourseBuyClicked = (options: {|
  courseId: string,
  courseName: string,
  usageType: string,
  priceValue: number | void,
  priceCurrency: string | void,
|}) => {
  recordEvent('course_buy_clicked', patchWithCurrencyField(options));
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
    | 'error-boundary_app'
    | 'error-boundary_extension-loader',
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
  | 'Generate project from prompt'
  | 'Version history'
  | 'Add collaborators on project'
  | 'Claim asset pack'
  | 'Callout in Classroom tab'
  | 'Unlock build type'
  | 'Manage subscription as teacher'
  | 'Unlock course chapter'
  | 'Account get premium'
  | 'AI requests (subscribe)'
  | 'AI requests (upgrade)';

export type SubscriptionPlacementId =
  | 'builds'
  | 'debugger'
  | 'gdevelop-branding'
  | 'generate-from-prompt'
  | 'hot-reloading'
  | 'leaderboards-customization'
  | 'leaderboards'
  | 'max-projects-reached'
  | 'opening-from-link'
  | 'preview-wifi'
  | 'profile'
  | 'invite-collaborators'
  | 'version-history'
  | 'claim-asset-pack'
  | 'unlock-course-chapter'
  | 'account-get-premium'
  | 'education'
  | 'ai-requests';

export const sendSubscriptionDialogShown = (
  metadata: SubscriptionAnalyticsMetadata
) => {
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

const canSendExternalEditorOpened = makeCanSendEvent({
  minimumTimeBetweenEvents: 1000 * 60 * 60, // Only once per hour per external editor.
});

export const sendExternalEditorOpened = (editorName: string) => {
  if (!canSendExternalEditorOpened(editorName)) {
    return;
  }

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

const canSendPreviewStarted = makeCanSendEvent({
  minimumTimeBetweenEvents: 1000 * 60 * 60 * 6, // Only once every 6 hours per preview kind (outside quick customization).
});

const canSendPreviewStartedForQuickCustomization = makeCanSendEvent({
  minimumTimeBetweenEvents: 1000 * 60 * 10, // Only once every 10 minutes per game for quick customization.
});

export const sendPreviewStarted = (metadata: {|
  quickCustomizationGameId: string | null,
  networkPreview: boolean,
  numberOfWindows: number,
  hotReload: boolean,
  projectDataOnlyExport: boolean,
  fullLoadingScreen: boolean,
  forceDiagnosticReport: boolean,
  previewLaunchDuration: number,
|}) => {
  if (
    metadata.quickCustomizationGameId &&
    !canSendPreviewStartedForQuickCustomization(
      metadata.quickCustomizationGameId
    )
  ) {
    return;
  }

  if (
    !metadata.quickCustomizationGameId &&
    !canSendPreviewStarted(
      JSON.stringify({
        networkPreview: metadata.networkPreview,
        hotReload: metadata.hotReload,
        projectDataOnlyExport: metadata.projectDataOnlyExport,
        fullLoadingScreen: metadata.fullLoadingScreen,
        forceDiagnosticReport: metadata.forceDiagnosticReport,
      })
    )
  ) {
    return;
  }

  recordEvent('preview-started', metadata);
};

const canSendQuickCustomizationProgress = makeCanSendEvent({
  // Send only one event per step every minute, to avoid sending too many events.
  minimumTimeBetweenEvents: 1000 * 60 * 1,
});

export const sendQuickCustomizationProgress = (metadata: {|
  stepName: string,
  sourceGameId: string,
  projectName: string,
|}) => {
  if (!canSendQuickCustomizationProgress(metadata.stepName)) {
    return;
  }

  recordEvent('quick-customization-progress', metadata);
};

export const sendSocialFollowUpdated = (
  achievementId: string,
  metadata: {| code: string |}
) => {
  recordEvent(`${achievementId}-updated`, metadata);
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
 * when some steps are reached, when the tutorial is completed,
 * or after some inactivity (more than 90 seconds).
 */
export const sendInAppTutorialProgress = ({
  step,
  tutorialId,
  isCompleted,
  isUIRestricted,
}: {|
  tutorialId: string,
  step: number,
  isCompleted: boolean,
  isUIRestricted: boolean,
|}) => {
  const immediatelyRecordEvent = (
    spentMoreThan90SecondsSinceLastStep: ?boolean
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
      isUIRestricted,
      spentMoreThan90SecondsSinceLastStep: !!spentMoreThan90SecondsSinceLastStep,
    });

    if (isCompleted) {
      recordEvent('in-app-tutorial-completed', {
        tutorialId,
        step,
        isUIRestricted,
      });
    }
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

  // For long tutorials:
  // send an event every 30 steps, or if we had more than 30 steps since the last event.
  // This last point is important because some steps might be hidden/skipped.
  if (step % 30 === 0 || step >= lastFiredEvent.lastStep + 30) {
    immediatelyRecordEvent();
    return;
  }

  // Otherwise, continue to remember the last step that was sent, and force to send it 90 seconds
  // later if there was no more progress.
  inAppTutorialProgressLastFiredEvents[tutorialId] = {
    lastStep: lastFiredEvent.lastStep,
    nextCheckTimeoutId: setTimeout(() => immediatelyRecordEvent(true), 90000),
  };
};

export const sendAssetSwapStart = ({
  originalObjectName,
  objectType,
}: {|
  originalObjectName: string,
  objectType: string,
|}) => {
  recordEvent('asset-swap-start', {
    originalObjectName,
    objectType,
  });
};

export const sendAssetSwapFinished = ({
  originalObjectName,
  newObjectName,
  objectType,
}: {|
  originalObjectName: string,
  newObjectName: string,
  objectType: string,
|}) => {
  recordEvent('asset-swap-finished', {
    originalObjectName,
    newObjectName,
    objectType,
  });
};

const canSendPlaySectionOpened = makeCanSendEvent({
  minimumTimeBetweenEvents: 1000 * 60 * 60 * 2, // Only once every 2 hours.
});

export const sendPlaySectionOpened = () => {
  if (!canSendPlaySectionOpened('play-section-opened')) {
    return;
  }

  recordEvent('play-section-opened');
};

export const sendAiRequestStarted = (metadata: {|
  simplifiedProjectJsonLength: number,
  projectSpecificExtensionsSummaryJsonLength: number,
  payWithCredits: boolean,
  storageProviderName: string | null,
  mode: string,
  aiRequestId: string,
|}) => {
  recordEvent('ai-request-started', metadata);
};

export const sendAiRequestMessageSent = (metadata: {|
  simplifiedProjectJsonLength: number,
  projectSpecificExtensionsSummaryJsonLength: number,
  payWithCredits: boolean,
  mode: string,
  aiRequestId: string,
  outputLength: number,
|}) => {
  recordEvent('ai-request-message-sent', metadata);
};
