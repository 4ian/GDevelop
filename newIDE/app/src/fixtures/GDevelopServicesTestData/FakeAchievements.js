// @flow
import { type Achievement } from '../../Utils/GDevelopServices/Badge';

export const fakeAchievements: Array<Achievement> = [
  {
    name: 'First event',
    nameByLocale: { en: 'First event' },
    category: 'Trivial',
    id: 'trivial_first-event',
    description: "You added your first event, we're sure it won't be the last!",
    descriptionByLocale: {
      en: "You added your first event, we're sure it won't be the last!",
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'scenes',
    iconUrl: 'https://resources.gdevelop-app.com/badges/icons/scenes.svg',
    publicDescription: 'First event in a scene',
    publicDescriptionByLocale: { en: 'First event in a scene' },
  },
  {
    name: 'First behavior',
    nameByLocale: { en: 'First behavior' },
    category: 'Trivial',
    id: 'trivial_first-behavior',
    description:
      "You used a behavior for the first time, things are way simpler with them don't you think?",
    descriptionByLocale: {
      en:
        "You used a behavior for the first time, things are way simpler with them don't you think?",
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'extension-creator',
    iconUrl: 'https://resources.gdevelop-app.com/badges/icons/objects.svg',
    publicDescription: 'First behavior added to an object',
    publicDescriptionByLocale: { en: 'First behavior added to an object' },
  },
  {
    name: 'First preview',
    nameByLocale: { en: 'First preview' },
    category: 'Trivial',
    id: 'trivial_first-preview',
    description:
      'Previewing your game is the first step towards a complete game!',
    descriptionByLocale: {
      en: 'Previewing your game is the first step towards a complete game!',
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'preview',
    iconUrl: 'https://resources.gdevelop-app.com/badges/icons/preview.svg',
    publicDescription: 'First preview of a game',
    publicDescriptionByLocale: { en: 'First preview of a game' },
  },
  {
    name: 'First web export',
    nameByLocale: { en: 'First web export' },
    category: 'Trivial',
    id: 'trivial_first-web-export',
    description:
      "Amazing, you just exported your first game! It's truly the quickest way to share it.",
    descriptionByLocale: {
      en:
        "Amazing, you just exported your first game! It's truly the quickest way to share it.",
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'publishing',
    iconUrl: 'https://resources.gdevelop-app.com/badges/icons/publishing.svg',
    publicDescription: 'First online export',
    publicDescriptionByLocale: { en: 'First online export' },
  },
  {
    name: 'First effect',
    nameByLocale: { en: 'First effect' },
    category: 'Trivial',
    id: 'trivial_first-effect',
    description:
      'Want to improve your game graphics? Select as many effects as you want from our list!',
    descriptionByLocale: {
      en:
        'Want to improve your game graphics? Select as many effects as you want from our list!',
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'objects',
    iconUrl: '',
    publicDescription: 'First effect added to an object',
    publicDescriptionByLocale: { en: 'First effect added to an object' },
  },
  {
    name: 'First debug',
    nameByLocale: { en: 'First debug' },
    category: 'Trivial',
    id: 'trivial_first-debug',
    description:
      'Was it an unexpected animation, or were you just curious? Anyway, congrats on using the debugger for the first time!',
    descriptionByLocale: {
      en:
        'Was it an unexpected animation, or were you just curious? Anyway, congrats on using the debugger for the first time!',
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'debugger',
    iconUrl: 'https://resources.gdevelop-app.com/badges/icons/debugger.svg',
    publicDescription: 'First use of the debugger',
    publicDescriptionByLocale: { en: 'First use of the debugger' },
  },
  {
    name: 'First extension',
    nameByLocale: { en: 'First extension' },
    category: 'Trivial',
    id: 'trivial_first-extension',
    description:
      'Extensions will speed up your project, so use as many as you can!',
    descriptionByLocale: {
      en: 'Extensions will speed up your project, so use as many as you can!',
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'extension-user',
    iconUrl:
      'https://resources.gdevelop-app.com/badges/icons/extension-user.svg',
    publicDescription: 'First extension installed in a project',
    publicDescriptionByLocale: { en: 'First extension installed in a project' },
  },
  {
    name: 'Insert a coin',
    nameByLocale: { en: 'Insert a coin' },
    category: 'Game Success',
    id: 'gs_10/1/y',
    description:
      'If 10 people played your game, it has to mean something right?',
    descriptionByLocale: {
      en: 'If 10 people played your game, it has to mean something right?',
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'game-sessions',
    iconLevel: 1,
    iconUrl:
      'https://resources.gdevelop-app.com/badges/icons/game-sessions-1.svg',
    publicDescription: '{user} got 10 plays on a game',
    publicDescriptionByLocale: { en: '{user} got 10 plays on a game' },
  },
  {
    name: 'Into Space',
    nameByLocale: { en: 'Into Space' },
    category: 'Game Success',
    id: 'gs_100/1/y',
    description:
      "Wow! 100 people played your game, that's amazing, congratulations!",
    descriptionByLocale: {
      en: "Wow! 100 people played your game, that's amazing, congratulations!",
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'game-sessions',
    iconLevel: 1,
    iconUrl:
      'https://resources.gdevelop-app.com/badges/icons/game-sessions-1.svg',
    publicDescription: '{user} got 100 plays on a game',
    publicDescriptionByLocale: { en: '{user} got 100 plays on a game' },
  },
  {
    name: 'Millenium Falcon',
    nameByLocale: { en: 'Millenium Falcon' },
    category: 'Game Success',
    id: 'gs_1k/1/y',
    description:
      "1000 people played your game, you're on a whole new level. What is your secret?",
    descriptionByLocale: {
      en:
        "1000 people played your game, you're on a whole new level. What is your secret?",
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'game-sessions',
    iconLevel: 2,
    iconUrl:
      'https://resources.gdevelop-app.com/badges/icons/game-sessions-2.svg',
    publicDescription: '{user} got 1000 plays on a game',
    publicDescriptionByLocale: { en: '{user} got 1000 plays on a game' },
  },
  {
    name: "It's over 9000!",
    nameByLocale: { en: "It's over 9000!" },
    category: 'Game Success',
    id: 'gs_10k/1/y',
    description:
      "Can you imagine if 10k people came to visit you? They probably wouldn't all fit in your living room!",
    descriptionByLocale: {
      en:
        "Can you imagine if 10k people came to visit you? They probably wouldn't all fit in your living room!",
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'game-sessions',
    iconLevel: 2,
    iconUrl:
      'https://resources.gdevelop-app.com/badges/icons/game-sessions-2.svg',
    publicDescription: '{user} got 10,000 plays on a game',
    publicDescriptionByLocale: { en: '{user} got 10,000 plays on a game' },
  },
  {
    name: 'Fits in your house?',
    nameByLocale: { en: 'Fits in your house?' },
    category: 'Game Success',
    id: 'gs_50k/1/y',
    description:
      '50k people playing your game must feel really rewarding, all of the time you put in to making it is paying off.',
    descriptionByLocale: {
      en:
        '50k people playing your game must feel really rewarding, all of the time you put in to making it is paying off.',
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'game-sessions',
    iconLevel: 3,
    iconUrl:
      'https://resources.gdevelop-app.com/badges/icons/game-sessions-3.svg',
    publicDescription: '{user} got 50,000 plays on a game',
    publicDescriptionByLocale: { en: '{user} got 50,000 plays on a game' },
  },
  {
    name: 'Fits in your yard?',
    nameByLocale: { en: 'Fits in your yard?' },
    category: 'Game Success',
    id: 'gs_100k/a/y',
    description:
      "100k people had a good time playing your games, isn't it the best feeling in the world? You must have come a long way to achieve that.",
    descriptionByLocale: {
      en:
        "100k people had a good time playing your games, isn't it the best feeling in the world? You must have come a long way to achieve that.",
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'game-sessions',
    iconLevel: 3,
    iconUrl:
      'https://resources.gdevelop-app.com/badges/icons/game-sessions-3.svg',
    publicDescription: '{user} got 100,000 plays on all their games',
    publicDescriptionByLocale: {
      en: '{user} got 100,000 plays on all their games',
    },
  },
  {
    name: 'Solid Snake',
    nameByLocale: { en: 'Solid Snake' },
    category: 'Game Success',
    id: 'gs_10/2/y',
    description:
      'A second game with 10 players? Is it the same genre as the first?',
    descriptionByLocale: {
      en: 'A second game with 10 players? Is it the same genre as the first?',
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'game-sessions',
    iconLevel: 1,
    iconUrl:
      'https://resources.gdevelop-app.com/badges/icons/game-sessions-1.svg',
    publicDescription: '{user} got 10 plays on two different games',
    publicDescriptionByLocale: {
      en: '{user} got 10 plays on two different games',
    },
  },
  {
    name: 'Eevee',
    nameByLocale: { en: 'Eevee' },
    category: 'Game Success',
    id: 'gs_100/3/y',
    description:
      '3 games that each had 100 players! Have you found a name for your game studio?',
    descriptionByLocale: {
      en:
        '3 games that each had 100 players! Have you found a name for your game studio?',
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'game-sessions',
    iconLevel: 2,
    iconUrl:
      'https://resources.gdevelop-app.com/badges/icons/game-sessions-2.svg',
    publicDescription: '{user} got 100 plays on three different games',
    publicDescriptionByLocale: {
      en: '{user} got 100 plays on three different games',
    },
  },
  {
    name: 'Open-source love',
    nameByLocale: { en: 'Open-source love' },
    category: 'Contributor',
    id: 'github-star',
    description: 'You put a star for GDevelop on GitHub - thank you!',
    descriptionByLocale: {
      en: 'You put a star for GDevelop on GitHub - thank you!',
    },
    shortDescriptionByLocale: { en: 'Star the GDevelop open-source project.' },
    rewardValueInCredits: 100,
    iconName: 'github-star',
    iconUrl: 'https://resources.gdevelop-app.com/badges/icons/github-star.svg',
    publicDescription: "{user} starred GDevelop's source code on GitHub",
    publicDescriptionByLocale: {
      en: "{user} starred GDevelop's source code on GitHub",
    },
  },
  {
    name: 'Marketer',
    nameByLocale: { en: 'Marketer' },
    category: 'Marketer',
    id: 'marketer',
    description: 'Thank you for representing GDevelop in a major event!',
    descriptionByLocale: {
      en: 'Thank you for representing GDevelop in a major event!',
    },
    shortDescriptionByLocale: { en: '' },
    iconName: 'marketer',
    iconUrl: 'https://resources.gdevelop-app.com/badges/icons/marketer.svg',
    publicDescription: '{user} represented GDevelop in a major event',
    publicDescriptionByLocale: {
      en: '{user} represented GDevelop in a major event',
    },
  },
  {
    name: 'Tiktok fan',
    nameByLocale: { en: 'Tiktok fan' },
    category: 'Contributor',
    id: 'tiktok-follow',
    description: 'You follow GDevelop on Tiktok - thank you!',
    descriptionByLocale: { en: 'You follow GDevelop on Tiktok - thank you!' },
    shortDescriptionByLocale: { en: 'Follow GDevelop on TikTok.' },
    rewardValueInCredits: 80,
    iconName: 'tiktok-follow',
    iconUrl:
      'https://resources.gdevelop-app.com/badges/icons/twitter-follow.svg',
    publicDescription: "{user} subscribed to GDevelop's account on TikTok",
    publicDescriptionByLocale: {
      en: "{user} subscribed to GDevelop's account on TikTok",
    },
  },
  {
    name: 'X follower',
    nameByLocale: { en: 'X follower' },
    category: 'Contributor',
    id: 'twitter-follow',
    description: 'You follow GDevelop on X/Twitter',
    descriptionByLocale: { en: 'You follow GDevelop on X/Twitter' },
    shortDescriptionByLocale: { en: 'Follow GDevelop on X (Twitter).' },
    rewardValueInCredits: 80,
    iconName: 'twitter-follow',
    iconUrl:
      'https://resources.gdevelop-app.com/badges/icons/tiktok-follow.svg',
    publicDescription: "{user} follows GDevelop's account on X/Twitter",
    publicDescriptionByLocale: {
      en: "{user} follows GDevelop's account on X/Twitter",
    },
  },
];
