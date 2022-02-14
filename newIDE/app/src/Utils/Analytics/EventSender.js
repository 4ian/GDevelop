// @flow
import Keen from 'keen-tracking';
import userflow from 'userflow.js';
import Window from '../Window';
import { getUserUUID } from './UserUUID';
import Authentication from '../GDevelopServices/Authentication';
import {
  getProgramOpeningCount,
  incrementProgramOpeningCount,
} from './LocalStats';
import { getStartupTimesSummary } from '../StartupTimes';
import { getIDEVersion, getIDEVersionWithHash } from '../../Version';
import optionalRequire from '../OptionalRequire';
import { loadPreferencesFromLocalStorage } from '../../MainFrame/Preferences/PreferencesProvider';
import { isMobile } from '../Platform';

const electron = optionalRequire('electron');

const isDev = Window.isDev();
let client = null;
let startupTimesSummary = null;
export let isUserflowRunning = false;

export const installAnalyticsEvents = (authentication: Authentication) => {
  // Activate userflow onboarding only on a portion of new users on web app on desktop.
  if (
    !electron &&
    getProgramOpeningCount() <= 1 &&
    !isMobile() &&
    Math.random() < 0.1
  ) {
    if (isDev) {
      userflow.init('ct_y5qogyfo6zbahjejcbo3dybnta');
    } else {
      userflow.init('ct_paaz6o2t2bhlrlyi7a3toojn7e');
    }
    userflow.on(
      // Undocumented legacy userflow event that is fired
      // "when a flow either becomes active or removed"
      // (tip given by a tech member of Userflow - it shouldn't be removed
      // in the near future given the fact that some of their users still use it).
      'flowvisibilitychange',
      isRunning => (isUserflowRunning = isRunning)
    );
    const userPreferences = loadPreferencesFromLocalStorage();
    const userLanguage = userPreferences ? userPreferences.language : undefined;
    userflow.identify(getUserUUID(), { language: userLanguage });
  }
  if (isDev) {
    console.info('Development build - Analytics disabled');
    return;
  }

  const version = getIDEVersion();
  const versionWithHash = getIDEVersionWithHash();

  const sessionCookie = Keen.utils.cookie('visitor-stats');
  const sessionTimer = Keen.utils.timer();
  sessionTimer.start();

  client = new Keen({
    projectId: '593d9f0595cfc907a1f8126a',
    writeKey:
      'B917F1DB50EE4C8949DBB374D2962845A22838B425AA43322A37138691A5270EB0358AEE45A4F61AFA7713B9765B4980517A1E276D4973A2E546EA851BF7757523706367ED430C041D2728A63BF61B5D1B2079C75E455DDDFAAC4324128AC2DB',
  });

  client.extendEvents(function() {
    // Include the user public profile.
    const firebaseUser = authentication.getFirebaseUserSync();

    // Compute the startup times (only once to avoid doing this for every event).
    startupTimesSummary = startupTimesSummary || getStartupTimesSummary();

    return {
      user: {
        uuid: getUserUUID(),
        uid: firebaseUser ? firebaseUser.uid : undefined,
        providerId: firebaseUser ? firebaseUser.providerId : undefined,
        email: firebaseUser ? firebaseUser.email : undefined,
        emailVerified: firebaseUser ? firebaseUser.emailVerified : undefined,
      },
      localStats: {
        programOpeningCount: getProgramOpeningCount(),
      },
      versionMetadata: {
        version,
        versionWithHash,
      },
      startupTimesSummary,
      page: {
        title: document.title,
        url: document.location.href,
        // info: {} (add-on)
      },
      referrer: {
        url: document.referrer,
        // info: {} (add-on)
      },
      tech: {
        browser: Keen.helpers.getBrowserProfile(),
        // info: {} (add-on)
        ip: '${keen.ip}', // eslint-disable-line
        ua: '${keen.user_agent}', // eslint-disable-line
      },
      time: Keen.helpers.getDatetimeIndex(),
      visitor: {
        id: sessionCookie.get('user_id'),
        time_on_page: sessionTimer.value(),
      },
      // geo: {} (add-on)
      keen: {
        timestamp: new Date().toISOString(),
        addons: [
          {
            name: 'keen:ip_to_geo',
            input: {
              ip: 'tech.ip',
            },
            output: 'geo',
          },
          {
            name: 'keen:ua_parser',
            input: {
              ua_string: 'tech.ua',
            },
            output: 'tech.info',
          },
          {
            name: 'keen:url_parser',
            input: {
              url: 'page.url',
            },
            output: 'page.info',
          },
          {
            name: 'keen:referrer_parser',
            input: {
              page_url: 'page.url',
              referrer_url: 'referrer.url',
            },
            output: 'referrer.info',
          },
        ],
      },
    };
  });
};

export const sendProgramOpening = () => {
  if (isDev || !client) return;

  incrementProgramOpeningCount();
  client.recordEvent('program_opening');
};

export const sendExportLaunched = (exportKind: string) => {
  if (isDev || !client) return;

  client.recordEvent('export_launched', {
    platform: 'GDevelop JS Platform', // Hardcoded here for now
    exportKind,
  });
};

export const sendNewGameCreated = (templateName: string) => {
  if (isDev || !client) return;

  client.recordEvent('new_game_creation', {
    platform: 'GDevelop JS Platform', // Hardcoded here for now
    templateName,
  });
};

export const sendTutorialOpened = (tutorialName: string) => {
  if (isDev || !client) return;

  client.recordEvent('tutorial_opened', {
    tutorialName,
  });
};

export const sendHelpFinderOpened = () => {
  if (isDev || !client) return;

  client.recordEvent('help_finder_opened', {});
};

export const sendHelpSearch = (searchText: string) => {
  if (isDev || !client) return;

  client.recordEvent('help_search', {
    searchText,
  });
};

export const sendErrorMessage = (
  message: string,
  type: 'error' | 'error-boundary',
  rawError: any,
  errorId: string
) => {
  if (isDev || !client) return;

  client.recordEvent('error_message', {
    message,
    type,
    rawError,
    errorId,
  });
};

export const sendSignupDone = (email: string) => {
  if (isDev || !client) return;

  client.recordEvent('signup', {
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
  if (isDev || !client) return;

  client.recordEvent('subscription-check-dialog-shown', {
    mode,
    title: id,
  });
};

export const sendSubscriptionCheckDismiss = () => {
  if (isDev || !client) return;

  client.recordEvent('subscription-check-dialog-dismiss');
};

export const sendSubscriptionDialogShown = () => {
  if (isDev || !client) return;

  client.recordEvent('subscription-dialog-shown', {});
};

export const sendAssetOpened = ({
  id,
  name,
}: {|
  id: string,
  name: string,
|}) => {
  if (isDev || !client) return;

  client.recordEvent('asset-opened', { id, name });
};

export const sendAssetAddedToProject = ({
  id,
  name,
}: {|
  id: string,
  name: string,
|}) => {
  if (isDev || !client) return;

  client.recordEvent('asset-added-to-project', { id, name });
};

export const sendNewObjectCreated = (name: string) => {
  if (isDev || !client) return;

  client.recordEvent('new-object-created', { name });
};

export const sendShowcaseGameLinkOpened = (title: string, linkType: string) => {
  if (isDev || !client) return;

  client.recordEvent('showcase-open-game-link', { title, linkType });
};

export const sendChoosePlanClicked = (planId: string | null) => {
  if (isDev || !client) return;

  client.recordEvent('choose-plan-click', { planId });
};

export const sendExternalEditorOpened = (editorName: string) => {
  if (isDev || !client) return;

  client.recordEvent('open_external_editor', { editorName });
};

const trackInAppTutorialProgress = (
  stepIndex: number,
  isCompleted: boolean = false
) => {
  if (isDev || !client) return;

  client.recordEvent('user-flow-onboarding', { stepIndex, isCompleted });
};

// Make this function global so it can be accessed from userflow's
// step "Evaluate JS" actions
global.trackInAppTutorialProgress = trackInAppTutorialProgress;
