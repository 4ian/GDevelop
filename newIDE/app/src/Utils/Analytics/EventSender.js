import Keen from 'keen-tracking';
import { getUserUUID } from './UserUUID';

const sessionCookie = Keen.utils.cookie('visitor-stats');
const sessionTimer = Keen.utils.timer();
sessionTimer.start();

const isDev = process.env.NODE_ENV === 'development';

var client = new Keen({
  projectId: '593d9f0595cfc907a1f8126a',
  writeKey:
    'B917F1DB50EE4C8949DBB374D2962845A22838B425AA43322A37138691A5270EB0358AEE45A4F61AFA7713B9765B4980517A1E276D4973A2E546EA851BF7757523706367ED430C041D2728A63BF61B5D1B2079C75E455DDDFAAC4324128AC2DB',
});

client.extendEvents(function() {
  return {
    user: {
      uuid: getUserUUID(),
    },
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

export const sendProgramOpening = () => {
  if (isDev) return;

  client.recordEvent('program_opening');
};

export const sendExportLaunched = exportKind => {
  if (isDev) return;

  client.recordEvent('export_launched', {
    platform: 'GDevelop JS Platform', // Hardcoded here for now
    exportKind,
  });
};

export const sendNewGameCreated = templateName => {
  if (isDev) return;

  client.recordEvent('new_game_creation', {
    platform: 'GDevelop JS Platform', // Hardcoded here for now
    templateName,
  });
};

export const sendTutorialOpened = tutorialName => {
  if (isDev) return;

  client.recordEvent('tutorial_opened', {
    tutorialName,
  });
};

export const sendErrorMessage = (errorMessage, type, rawError) => {
  if (isDev) return;

  client.recordEvent('error_message', {
    message: errorMessage,
    type,
    rawError,
  });
};
