// @flow
import { type Tutorial } from '../../Utils/GDevelopServices/Tutorial';
import { type PrivatePdfTutorial } from '../../Utils/GDevelopServices/Asset';

export const fakeEducationCurriculumPrivateTutorial: Tutorial = {
  id: 'education-curriculum-1',
  isPrivateTutorial: true,
  redeemHintByLocale: {
    en:
      'This tutorial is made for education and accessible to teachers and subscribers to the GDevelop Education plan only.',
  },
  redeemLinkByLocale: {
    en: 'https://gdevelop.io/pricing/education',
  },
  title: 'Fake education only tutorial',
  titleByLocale: {
    en: 'Fake education only tutorial',
  },
  description:
    'Teach the basics of GDevelop and game creation to your students.',
  descriptionByLocale: {
    en: 'Teach the basics of GDevelop and game creation to your students.',
  },
  type: 'pdf-tutorial',
  category: 'education-curriculum',
  duration: 360,
  link:
    'https://api-dev.gdevelop.io/asset/pdf-tutorial/education-curriculum-1/action/redirect-to-pdf',
  linkByLocale: {
    en:
      'https://api-dev.gdevelop.io/asset/pdf-tutorial/education-curriculum-1/action/redirect-to-pdf',
  },
  thumbnailUrl:
    'https://resources.gdevelop-app.com/tutorials/images/playlists/get-started.png',
  thumbnailUrlByLocale: {
    en:
      'https://resources.gdevelop-app.com/tutorials/images/playlists/get-started.png',
  },
  sectionByLocale: {
    en: 'Theoretical lessons',
  },
  tagsByLocale: [
    {
      en: 'GDevelop',
    },
    {
      en: 'Basics',
    },
    {
      en: 'Programming',
    },
  ],
};

export const fakeEducationCurriculumPrivatePdfTutorial: PrivatePdfTutorial = {
  id: 'education-curriculum-1',
  downloadUrl: 'https://example.com',
};

export const fakeTutorials: Array<Tutorial> = [
  fakeEducationCurriculumPrivateTutorial,
  {
    id: 'education-curriculum-2',
    isPrivateTutorial: true,
    redeemHintByLocale: {
      en: 'For education subscribers/teachers only.',
    },
    redeemLinkByLocale: {
      en: 'https://gdevelop.io/pricing/education',
    },
    title: 'Fake education only tutorial',
    titleByLocale: {
      en: 'Fake education only tutorial',
    },
    description:
      'Teach the basics of GDevelop and game creation to your students.',
    descriptionByLocale: {
      en: 'Teach the basics of GDevelop and game creation to your students.',
    },
    type: 'pdf-tutorial',
    category: 'education-curriculum',
    duration: 360,
    link:
      'https://api-dev.gdevelop.io/asset/pdf-tutorial/education-curriculum-2/action/redirect-to-pdf',
    linkByLocale: {
      en:
        'https://api-dev.gdevelop.io/asset/pdf-tutorial/education-curriculum-2/action/redirect-to-pdf',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/playlists/get-started.png',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/playlists/get-started.png',
    },
    sectionByLocale: {
      en: 'Theoretical lessons',
    },
    tagsByLocale: [
      {
        en: 'Enemy AI',
      },
      {
        en: '3D',
      },
      {
        en: 'Single player',
      },
    ],
  },
  {
    id: 'education-curriculum-3',
    isPrivateTutorial: true,
    redeemHintByLocale: {
      en: 'For education subscribers/teachers only.',
    },
    redeemLinkByLocale: {
      en: 'https://gdevelop.io/pricing/education',
    },
    title: 'Practical education lesson',
    titleByLocale: {
      en: 'Practical education lesson',
    },
    description:
      'Teach the basics of GDevelop and game creation to your students.',
    descriptionByLocale: {
      en: 'Teach the basics of GDevelop and game creation to your students.',
    },
    type: 'pdf-tutorial',
    category: 'education-curriculum',
    link:
      'https://api-dev.gdevelop.io/asset/pdf-tutorial/education-curriculum-2/action/redirect-to-pdf',
    linkByLocale: {
      en:
        'https://api-dev.gdevelop.io/asset/pdf-tutorial/education-curriculum-2/action/redirect-to-pdf',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/playlists/get-started.png',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/playlists/get-started.png',
    },
    sectionByLocale: {
      en: 'Practical lessons',
    },
    tagsByLocale: [
      {
        en: 'Enemy AI',
      },
      {
        en: 'Leaderboards',
      },
      {
        en: 'Projectiles',
      },
    ],
  },
  {
    id: 'playlist-get-started',
    title: 'How To Get Started',
    titleByLocale: {
      en: 'How To Get Started',
    },
    description:
      'Learn the basics of GDevelop and game creation. Start in a few minutes thanks to our playlist of 5 minutes video, and start making your own game today.',
    descriptionByLocale: {
      en:
        'Learn the basics of GDevelop and game creation. Start in a few minutes thanks to our playlist of 5 minutes video, and start making your own game today.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 360,
    link:
      'https://www.youtube.com/watch?v=595-swNh0Mw&list=PL3YlZTdKiS89Kj7IQVPoNElJCWrjZaCC8&ab_channel=GDevelop',
    linkByLocale: {
      en:
        'https://www.youtube.com/watch?v=595-swNh0Mw&list=PL3YlZTdKiS89Kj7IQVPoNElJCWrjZaCC8&ab_channel=GDevelop',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/playlists/get-started.png',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/playlists/get-started.png',
    },
  },
  {
    id: 'create-menus',
    title: 'The Easiest Way To Create Menus',
    titleByLocale: {
      en: 'The Easiest Way To Create Menus',
    },
    description:
      "Every gamedev knows that setting up menus can be a really time consuming task, but with GDevelop's new custom objects, it's one of the quickest parts of the game making process.",
    descriptionByLocale: {
      en:
        "Every gamedev knows that setting up menus can be a really time consuming task, but with GDevelop's new custom objects, it's one of the quickest parts of the game making process.",
    },
    type: 'video',
    category: 'official-beginner',
    duration: 255,
    link: 'https://youtu.be/plkHd4uPI4U',
    linkByLocale: {
      en: 'https://youtu.be/plkHd4uPI4U',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/plkHd4uPI4U',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'five-way-to-get-the-first-players',
    title: '5 Ways To Get Your First 10,000 Players',
    titleByLocale: {
      en: '5 Ways To Get Your First 10,000 Players',
    },
    description:
      'Get your game in front of a larger audience by doing these 5 things. Developing a good game is only half the battle, getting that good game in front of more people increases the chance your game will be a hit. Marketing and sharing your game can be just as much work as creating the game in the first place.\r',
    descriptionByLocale: {
      en:
        'Get your game in front of a larger audience by doing these 5 things. Developing a good game is only half the battle, getting that good game in front of more people increases the chance your game will be a hit. Marketing and sharing your game can be just as much work as creating the game in the first place.\r',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 305,
    link: 'https://youtu.be/ZXM4E_B0mTM',
    linkByLocale: {
      en: 'https://youtu.be/ZXM4E_B0mTM',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/ZXM4E_B0mTM',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'make-your-first-game',
    title: 'Make Your First Game',
    titleByLocale: {
      en: 'Make Your First Game',
    },
    description:
      "Create a wave defense game without coding, using GDevelop. We'll try to cover everything in this series from basic gun mechanics to enemies and more. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.",
    descriptionByLocale: {
      en:
        "Create a wave defense game without coding, using GDevelop. We'll try to cover everything in this series from basic gun mechanics to enemies and more. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.",
    },
    type: 'video',
    category: 'official-beginner',
    duration: 800,
    link:
      'https://www.youtube.com/watch?v=mckuSpr8vio&list=PL3YlZTdKiS8_R32-DlXGi7YGZNfG7B8Vf&ab_channel=GDevelop',
    linkByLocale: {
      en:
        'https://www.youtube.com/watch?v=mckuSpr8vio&list=PL3YlZTdKiS8_R32-DlXGi7YGZNfG7B8Vf&ab_channel=GDevelop',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/mckuSpr8vio',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'ten-best-game-development-extensions',
    title: '10 Best Game Development Extensions',
    titleByLocale: {
      en: '10 Best Game Development Extensions',
    },
    description:
      'Extensions make game development a LOT easier, giving you functionality that you would otherwise have to create yourself. Saving you time and energy in the process of developing your game. This video was created to show you the most commonly used extensions in the GDevelop game engine, which is a no-code, open-source, free, and easy game engine.\r',
    descriptionByLocale: {
      en:
        'Extensions make game development a LOT easier, giving you functionality that you would otherwise have to create yourself. Saving you time and energy in the process of developing your game. This video was created to show you the most commonly used extensions in the GDevelop game engine, which is a no-code, open-source, free, and easy game engine.\r',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 292,
    link: 'https://youtu.be/dqGoJKn3XOQ',
    linkByLocale: {
      en: 'https://youtu.be/dqGoJKn3XOQ',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/dqGoJKn3XOQ',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'publish-on-gdgames',
    title: 'Publish on gd.games',
    titleByLocale: {
      en: 'Publish on gd.games',
    },
    description:
      "This video shows how easy it is to publish your game on gd.games, formerly known as liluo, GDevelop's game hosting platform.",
    descriptionByLocale: {
      en:
        "This video shows how easy it is to publish your game on gd.games, formerly known as liluo, GDevelop's game hosting platform.",
    },
    type: 'video',
    category: 'official-beginner',
    duration: 42,
    link: 'https://youtu.be/WcJSf2_QDPY',
    linkByLocale: {
      en: 'https://youtu.be/WcJSf2_QDPY',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/WcJSf2_QDPY',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'chatgpt-with-gdevelop',
    title: 'ChatGPT With GDevelop',
    titleByLocale: {
      en: 'ChatGPT With GDevelop',
      fr: 'Utiliser ChatGPT pour GDevelop',
    },
    description:
      "This video goes over the basics of GDevelop by creating a quick example game. GDevelop's no code event system, behaviors and extensions, adding sound effects, and more.",
    descriptionByLocale: {
      en:
        "This video goes over the basics of GDevelop by creating a quick example game. GDevelop's no code event system, behaviors and extensions, adding sound effects, and more.",
      fr:
        'On vous montre comment utiliser ChatGPT pour créer des jeux vidéo avec GDevelop.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 365,
    link: 'https://youtu.be/aiE-INCUbuk',
    linkByLocale: {
      en: 'https://youtu.be/aiE-INCUbuk',
      fr: 'https://youtu.be/4Fk5hrCNcPU',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/aiE-INCUbuk',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intro-object-types',
    title: 'Intro: Object types',
    titleByLocale: {
      en: 'Intro: Object types',
      fr: "🇫🇷 Les types d'objets sous GDevelop\n",
    },
    description:
      "This video goes over the object types in GDevelop, and briefly shows what each one can be used for. This will be useful for any game developers who are just starting out with the engine, or someone who doesn't understand some of the object types.",
    descriptionByLocale: {
      en:
        "This video goes over the object types in GDevelop, and briefly shows what each one can be used for. This will be useful for any game developers who are just starting out with the engine, or someone who doesn't understand some of the object types.",
      fr: "Les différents type d'objets de GDevelop.",
    },
    type: 'video',
    category: 'official-beginner',
    duration: 286,
    link: 'https://youtu.be/KpLAYMSgoDI',
    linkByLocale: {
      en: 'https://youtu.be/KpLAYMSgoDI',
      fr: 'https://youtu.be/zbawEO4V1Dk',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/KpLAYMSgoDI',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intro-event-system',
    title: 'Intro: Event system',
    titleByLocale: {
      en: 'Intro: Event system',
      fr: "🇫🇷 Le système d'évènements",
    },
    description:
      "This will be useful for any game developers who are just starting out with the engine, or someone who hasn't been using all of the tools the game engine has to offer.",
    descriptionByLocale: {
      en:
        "This will be useful for any game developers who are just starting out with the engine, or someone who hasn't been using all of the tools the game engine has to offer.",
      fr:
        'Comment utiliser les événements, pour créer la logique de votre jeu.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 346,
    link: 'https://youtu.be/rBZ3kuvr9G0',
    linkByLocale: {
      en: 'https://youtu.be/rBZ3kuvr9G0',
      fr: 'https://youtu.be/X_4E9aEjDK4',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/rBZ3kuvr9G0',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intro-variables',
    title: 'Intro: Variables',
    titleByLocale: {
      en: 'Intro: Variables',
      fr: '🇫🇷 Utiliser les variables avec GDevelop',
    },
    description:
      "In this video, we'll take an introductory look at variables. We will learn the differences between scene, global, and object variables, as well as when to use them. The focus here is on concrete examples, so that you can leave with some real ideas of how to apply variables in your own game!",
    descriptionByLocale: {
      en:
        "In this video, we'll take an introductory look at variables. We will learn the differences between scene, global, and object variables, as well as when to use them. The focus here is on concrete examples, so that you can leave with some real ideas of how to apply variables in your own game!",
      fr:
        'Les différents types de variables de GDevelop et surtout dans quel contexte et comment les utiliser.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 311,
    link: 'https://youtu.be/MFvAd-96LWo',
    linkByLocale: {
      en: 'https://youtu.be/MFvAd-96LWo',
      fr: 'https://youtu.be/FAJsna58qNY',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/MFvAd-96LWo',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intro-expression-builder',
    title: 'Intro: Expression Builder',
    titleByLocale: {
      en: 'Intro: Expression Builder',
      fr: "Le générateur d'expressions de GDevelop",
    },
    description:
      "This video goes over the expression builder. What it's used for and what sort's of things it's capable of. It also goes over a practical example of adding health points to a character. This will be useful for any game developers who are just starting out with the engine, or someone who hasn't tried using the expression builder yet.",
    descriptionByLocale: {
      en:
        "This video goes over the expression builder. What it's used for and what sort's of things it's capable of. It also goes over a practical example of adding health points to a character. This will be useful for any game developers who are just starting out with the engine, or someone who hasn't tried using the expression builder yet.",
      fr:
        'Comment générer des expressions avec GDevelop sans programmer, quand et comment les utiliser.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 299,
    link: 'https://youtu.be/huKDtb8Ubd4',
    linkByLocale: {
      en: 'https://youtu.be/huKDtb8Ubd4',
      fr: 'https://youtu.be/G0EyWdKfD2c',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/huKDtb8Ubd4',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intro-behaviors-and-functions',
    title: 'Intro: Behaviors and Functions (Extensions)',
    titleByLocale: {
      en: 'Intro: Behaviors and Functions (Extensions)',
      fr: '🇫🇷 Les extensions GDevelop',
    },
    description:
      "As a game creator, you want to get from concept to finished product as soon as possible. Behaviors and functions (extensions) address this by letting you not reinvent the wheel, so you can focus on actually making your game! In this video, we'll go over the basics of behaviors and functions as well as how you can use them in your next project.",
    descriptionByLocale: {
      en:
        "As a game creator, you want to get from concept to finished product as soon as possible. Behaviors and functions (extensions) address this by letting you not reinvent the wheel, so you can focus on actually making your game! In this video, we'll go over the basics of behaviors and functions as well as how you can use them in your next project.",
      fr:
        'Présentation des extensions de GDevelop sans programmer, qui permettent de se concentrer sur le gameplay.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 233,
    link: 'https://youtu.be/-U8WFcpUmMg',
    linkByLocale: {
      en: 'https://youtu.be/-U8WFcpUmMg',
      fr: 'https://youtu.be/nyvg40XgwRU',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/-U8WFcpUmMg',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intro-optimization',
    title: 'Intro: Optimization',
    titleByLocale: {
      en: 'Intro: Optimization',
      fr: '🇫🇷 Intro: Optimisations',
    },
    description:
      'This video teaches GDevelop users about game optimization, and briefly goes over most of the areas that could be causing lag or poor performance in your game. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
    descriptionByLocale: {
      en:
        'This video teaches GDevelop users about game optimization, and briefly goes over most of the areas that could be causing lag or poor performance in your game. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
      fr:
        'Comment optimiser votre jeu vidéo pour gagner en rapidité et en volume de fichiers.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 352,
    link: 'https://youtu.be/vXQsWCdtcQE',
    linkByLocale: {
      en: 'https://youtu.be/vXQsWCdtcQE',
      fr: 'https://youtu.be/4JGIfanHU4c',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/vXQsWCdtcQE',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'shorts-randomize-sound-with-pitch',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Quickly randomize the sounds with pitch.',
    descriptionByLocale: {
      en: 'Quickly randomize the sounds with pitch.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 28,
    link: 'https://youtu.be/3akue2EwDPU',
    linkByLocale: {
      en: 'https://youtu.be/3akue2EwDPU',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/3akue2EwDPU',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-round-decimal-number',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Round a decimal number.',
    descriptionByLocale: {
      en: 'Round a decimal number.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 42,
    link: 'https://youtu.be/clNM7cODA3c',
    linkByLocale: {
      en: 'https://youtu.be/clNM7cODA3c',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/clNM7cODA3c',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-screen-shake',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Cause screen shake.',
    descriptionByLocale: {
      en: 'Cause screen shake.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 47,
    link: 'https://youtu.be/3P82paiVaTQ',
    linkByLocale: {
      en: 'https://youtu.be/3P82paiVaTQ',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/3P82paiVaTQ',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-fire-bullet',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Fire a bullet.',
    descriptionByLocale: {
      en: 'Fire a bullet.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 28,
    link: 'https://youtu.be/OsRGf49_Z6E',
    linkByLocale: {
      en: 'https://youtu.be/OsRGf49_Z6E',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/OsRGf49_Z6E',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-infinite-scrolling-background',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Make an infinite scrolling background.',
    descriptionByLocale: {
      en: 'Make an infinite scrolling background.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 54,
    link: 'https://youtu.be/sgap1eR9q4s',
    linkByLocale: {
      en: 'https://youtu.be/sgap1eR9q4s',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/sgap1eR9q4s',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-make-object-move',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Make an object move.',
    descriptionByLocale: {
      en: 'Make an object move.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 45,
    link: 'https://youtu.be/NWPg_8j5_VM',
    linkByLocale: {
      en: 'https://youtu.be/NWPg_8j5_VM',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/NWPg_8j5_VM',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-center-camera-on-object',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Center camera on object.',
    descriptionByLocale: {
      en: 'Center camera on object.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 29,
    link: 'https://youtu.be/KeX1QLJQskU',
    linkByLocale: {
      en: 'https://youtu.be/KeX1QLJQskU',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/KeX1QLJQskU',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-move-toward-mouse-position',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Move toward the mouse position.',
    descriptionByLocale: {
      en: 'Move toward the mouse position.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 45,
    link: 'https://youtu.be/GR26gkQHK7E',
    linkByLocale: {
      en: 'https://youtu.be/GR26gkQHK7E',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/GR26gkQHK7E',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-fix-blurry-pixel-art',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Fix blurry pixel art.',
    descriptionByLocale: {
      en: 'Fix blurry pixel art.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 32,
    link: 'https://youtu.be/w0Ll7FYhRbA',
    linkByLocale: {
      en: 'https://youtu.be/w0Ll7FYhRbA',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/w0Ll7FYhRbA',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'goodgis-video-how-to-get-started-with-game-dev',
    title: 'How to get started with game dev',
    titleByLocale: {
      en: 'How to get started with game dev',
      fr: " 🇫🇷 GDevelop c'est quoi?",
    },
    description:
      'How to get started with game dev. Check out GDevelop today!\nGDevelop is a 2D cross-platform, free and open-source game engine.',
    descriptionByLocale: {
      en:
        'How to get started with game dev. Check out GDevelop today!\nGDevelop is a 2D cross-platform, free and open-source game engine.',
      fr:
        'Cette vidéo passe rapidement en revue le fonctionnement de GDevelop, pour comprendre les principaux concepts.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 429,
    link: 'https://youtu.be/U9vqzH65Zzw',
    linkByLocale: {
      en: 'https://youtu.be/U9vqzH65Zzw',
      fr: 'https://youtu.be/7W2uaHzUsRk',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/U9vqzH65Zzw',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'freecodecamp-game-development-crash-course',
    title: '2D Game Development - Crash Course',
    titleByLocale: {
      en: '2D Game Development - Crash Course',
    },
    description:
      'Learn how to create games with GDevelop, a 2D cross-platform, free and open-source game engine. You can create games with minimal coding and run them on most major platforms.',
    descriptionByLocale: {
      en:
        'Learn how to create games with GDevelop, a 2D cross-platform, free and open-source game engine. You can create games with minimal coding and run them on most major platforms.',
    },
    type: 'video',
    category: 'official-beginner',
    duration: 2817,
    link: 'https://youtu.be/iHF5fwsqu4I',
    linkByLocale: {
      en: 'https://youtu.be/iHF5fwsqu4I',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/iHF5fwsqu4I',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'troubleshooting-tools-and-tricks',
    title: 'Troubleshooting Tools And Tricks',
    titleByLocale: {
      en: 'Troubleshooting Tools And Tricks',
      fr: 'Corriger les bugs de son jeu vidéo',
    },
    description:
      'Showing some of the tools you can use in GDevelop that will allow you to fix any problem you might run into while creating your game. Gamedev is stressful enough, use these development tools to help you create your dream game with less of a headache.',
    descriptionByLocale: {
      en:
        'Showing some of the tools you can use in GDevelop that will allow you to fix any problem you might run into while creating your game. Gamedev is stressful enough, use these development tools to help you create your dream game with less of a headache.',
      fr:
        'On vous montre une méthode pour corriger les bugs auxquels vous pourriez être confronté.',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 718,
    link:
      'https://youtu.be/8krGoBuQpBI?list=PL3YlZTdKiS89LrdlHcHo5vePN3O3UhGwm',
    linkByLocale: {
      en:
        'https://youtu.be/8krGoBuQpBI?list=PL3YlZTdKiS89LrdlHcHo5vePN3O3UhGwm',
      fr: 'https://youtu.be/K1yQUUmZJ2U',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/8krGoBuQpBI',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'playlist-get-better',
    title: 'How To Get Better',
    titleByLocale: {
      en: 'How To Get Better',
    },
    description:
      'Learn deeper concept related to game creation with GDevelop: make multiple levels, add leaderboards to your game, touch controls, save and load, use the physics engine... These videos are the best way to see everything you can do with GDevelop!',
    descriptionByLocale: {
      en:
        'Learn deeper concept related to game creation with GDevelop: make multiple levels, add leaderboards to your game, touch controls, save and load, use the physics engine... These videos are the best way to see everything you can do with GDevelop!',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 327,
    link:
      'https://www.youtube.com/watch?v=5NzMs1JRuXA&list=PL3YlZTdKiS89LrdlHcHo5vePN3O3UhGwm&ab_channel=GDevelop',
    linkByLocale: {
      en:
        'https://www.youtube.com/watch?v=5NzMs1JRuXA&list=PL3YlZTdKiS89LrdlHcHo5vePN3O3UhGwm&ab_channel=GDevelop',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/playlists/get-better.png',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/playlists/get-better.png',
    },
  },
  {
    id: 'six-ways-to-make-your-game-better',
    title: '6 Ways To Make Your Game Better',
    titleByLocale: {
      en: '6 Ways To Make Your Game Better',
    },
    description:
      'Improve game feel (Or Juice) by doing 4 of these 6 things, and then the other 2 will help you get and retain players for your game. Wikipedia says that "Game feel (sometimes referred to as "game juice") is the intangible, tactile sensation experienced when interacting with video games." But there are a number of common things that developers do the make games feel more fun to interact with. So in this video we\'ll explain those to help you make a better game, get more players for your game, and retain those players for longer.',
    descriptionByLocale: {
      en:
        'Improve game feel (Or Juice) by doing 4 of these 6 things, and then the other 2 will help you get and retain players for your game. Wikipedia says that "Game feel (sometimes referred to as "game juice") is the intangible, tactile sensation experienced when interacting with video games." But there are a number of common things that developers do the make games feel more fun to interact with. So in this video we\'ll explain those to help you make a better game, get more players for your game, and retain those players for longer.',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 529,
    link: 'https://youtu.be/27e3m906x7I',
    linkByLocale: {
      en: 'https://youtu.be/27e3m906x7I',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/27e3m906x7I',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'four-ways-to-make-money-with-gdevelop',
    title: '4 Ways to Make Money With Game Development',
    titleByLocale: {
      en: '4 Ways to Make Money With Game Development',
      fr: 'Monétiser facilement son jeu vidéo',
    },
    description:
      'Making money from your video games is possible and there are lots of ways to do it. This video quickly goes over 4 of the most straight forward ways to earn money through game development. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
    descriptionByLocale: {
      en:
        'Making money from your video games is possible and there are lots of ways to do it. This video quickly goes over 4 of the most straight forward ways to earn money through game development. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
      fr: '4 façons de monétiser facilement un jeu vidéo avec GDevelop.',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 240,
    link: 'https://youtu.be/zY5kv50XNnE',
    linkByLocale: {
      en: 'https://youtu.be/zY5kv50XNnE',
      fr: 'https://youtu.be/rQH7MF2Hre0',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/zY5kv50XNnE',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intermediate-object-picking',
    title: 'Intermediate: Object Picking',
    titleByLocale: {
      en: 'Intermediate: Object Picking',
      fr: '🇫🇷 Gérer des points de passage (checkpoint)',
    },
    description:
      'In this tutorial, we cover the object picking system, which is integral to certain kinds of game behaviors, such as checkpoint systems for instance! These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game making app.',
    descriptionByLocale: {
      en:
        'In this tutorial, we cover the object picking system, which is integral to certain kinds of game behaviors, such as checkpoint systems for instance! These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game making app.',
      fr: 'Comment gérer des checkpoints avec GDevelop.',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 242,
    link: 'https://youtu.be/KzC2dHa_SJE',
    linkByLocale: {
      en: 'https://youtu.be/KzC2dHa_SJE',
      fr: 'https://youtu.be/OKuqzPzdFdw',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/KzC2dHa_SJE',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intermediate-leaderboards ',
    title: 'Intermediate: Leaderboards ',
    titleByLocale: {
      en: 'Intermediate: Leaderboards ',
    },
    description:
      'This video shows you how to add a leaderboard to your game in the GDevelop game engine. How to set up the leaderboards, customize them, trigger them with events, and display them on screen. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
    descriptionByLocale: {
      en:
        'This video shows you how to add a leaderboard to your game in the GDevelop game engine. How to set up the leaderboards, customize them, trigger them with events, and display them on screen. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 346,
    link: 'https://youtu.be/FOdPORyeU20',
    linkByLocale: {
      en: 'https://youtu.be/FOdPORyeU20',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/FOdPORyeU20',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'Intermediate-externals',
    title: 'Intermediate: External Events, External Layouts & Global Objects',
    titleByLocale: {
      en: 'Intermediate: External Events, External Layouts & Global Objects',
      fr: '🇫🇷 Utiliser les calques et événements externes',
    },
    description:
      "You've created a level for your game, but now need to make a second level. How can you do this without copy pasting everything over to a new scene? In fact, GDevelop offers a suite of tools to solve problems like these, which will save you time as a game creator.",
    descriptionByLocale: {
      en:
        "You've created a level for your game, but now need to make a second level. How can you do this without copy pasting everything over to a new scene? In fact, GDevelop offers a suite of tools to solve problems like these, which will save you time as a game creator.",
      fr:
        'Comment utiliser les calques, événements externes et objets globaux pour gagner en productivité avec GDevelop.',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 328,
    link: 'https://youtu.be/_VUwAfD_7zQ',
    linkByLocale: {
      en: 'https://youtu.be/_VUwAfD_7zQ',
      fr: 'https://youtu.be/s05BGJh2nr8',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/_VUwAfD_7zQ',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intermediate-bitmap-text-and-tilemap',
    title: 'Intermediate: Bitmap Text & Tilemap',
    titleByLocale: {
      en: 'Intermediate: Bitmap Text & Tilemap',
      fr: '🇫🇷 Bitmap Text et Tilemap',
    },
    description:
      'To finish off our coverage of object types in GDevelop, we go over the two currently experimental types: Bitmap Text and Tiled!',
    descriptionByLocale: {
      en:
        'To finish off our coverage of object types in GDevelop, we go over the two currently experimental types: Bitmap Text and Tiled!',
      fr: 'Les objets Bitmap Text et Tiledmap et comment les utiliser.',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 242,
    link: 'https://youtu.be/tLd5HvqaWcU',
    linkByLocale: {
      en: 'https://youtu.be/tLd5HvqaWcU',
      fr: 'https://youtu.be/zJaKelb4Lnk',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/tLd5HvqaWcU',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intermediate-advanced-variables',
    title:
      'Intermediate: Advanced Variables (Booleans, Arrays, and Structures)',
    titleByLocale: {
      en: 'Intermediate: Advanced Variables (Booleans, Arrays, and Structures)',
      fr: '🇫🇷 Utilisation avancée des variables',
    },
    description:
      "Learn what the different variables' types are for and how to use them.\rBooleans, Arrays, and Structures won't hold any secrets for you anymore!",
    descriptionByLocale: {
      en:
        "Learn what the different variables' types are for and how to use them.\rBooleans, Arrays, and Structures won't hold any secrets for you anymore!",
      fr:
        'Les variables booléennes et des structures de données avec GDevelop.',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 281,
    link: 'https://youtu.be/0vlCEVUP1YA',
    linkByLocale: {
      en: 'https://youtu.be/0vlCEVUP1YA',
      fr: 'https://youtu.be/loPzSOnESQI',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/0vlCEVUP1YA',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intermediate-level-select-menu',
    title: 'Intermediate: Level Select Menu',
    titleByLocale: {
      en: 'Intermediate: Level Select Menu',
      fr: '🇫🇷 Menus et sélection de niveaux',
    },
    description:
      "This video shows how to create a level select menu. How to create a menu and change scenes, as well as how lock off levels so they can't be accessed until the level before it is beaten. This tutorial will be useful for any game developers using GDevelop, a no-code, open-source, free, and easy game-making app.",
    descriptionByLocale: {
      en:
        "This video shows how to create a level select menu. How to create a menu and change scenes, as well as how lock off levels so they can't be accessed until the level before it is beaten. This tutorial will be useful for any game developers using GDevelop, a no-code, open-source, free, and easy game-making app.",
      fr: 'Comment intégrer des menus et niveaux avec GDevelop.',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 341,
    link: 'https://youtu.be/tt7ylPTLuVA',
    linkByLocale: {
      en: 'https://youtu.be/tt7ylPTLuVA',
      fr: 'https://youtu.be/s0mCzNkHqeU',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/tt7ylPTLuVA',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intermediate-touchscreen-controls',
    title: 'Intermediate: Touchscreen Controls',
    titleByLocale: {
      en: 'Intermediate: Touchscreen Controls',
      fr: '🇫🇷 Intégrer des commandes tactiles dans un jeu vidéo',
    },
    description:
      'This video shows how to create basic touch screen controls, using them to control a platformer character. It also teaches the viewer how to set up your game to expand to fill up the entire screen regardless of the original resolution using the anchor behavior. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game making app.',
    descriptionByLocale: {
      en:
        'This video shows how to create basic touch screen controls, using them to control a platformer character. It also teaches the viewer how to set up your game to expand to fill up the entire screen regardless of the original resolution using the anchor behavior. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game making app.',
      fr: 'Comment ajouter le support pour un jeu vidéo mobile.',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 314,
    link: 'https://youtu.be/58AT-cH5gLc',
    linkByLocale: {
      en: 'https://youtu.be/58AT-cH5gLc',
      fr: 'https://youtu.be/zpi4LIUXt0E',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/58AT-cH5gLc',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intermediate-toggle-states-with-variable',
    title: 'Intermediate: Toggle States With A Variable',
    titleByLocale: {
      en: 'Intermediate: Toggle States With A Variable',
      fr: "🇫🇷 Modifier l'état d'un objet",
    },
    description:
      'This video shows how to toggle the state of an object, in this case a mute button, using a variable. As well as how toggling/cycling object states with variables can be used in a game. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game making app.',
    descriptionByLocale: {
      en:
        'This video shows how to toggle the state of an object, in this case a mute button, using a variable. As well as how toggling/cycling object states with variables can be used in a game. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game making app.',
      fr:
        "Comment modifier l'apparence d'un objet en fonction des actions du joueur en utilisant des variables.",
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 333,
    link: 'https://youtu.be/vuV_Q_hzACQ',
    linkByLocale: {
      en: 'https://youtu.be/vuV_Q_hzACQ',
      fr: 'https://youtu.be/xAw26Hj-hIk',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/vuV_Q_hzACQ',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intermediate-changing-animations',
    title: 'Intermediate: Changing Animations',
    titleByLocale: {
      en: 'Intermediate: Changing Animations',
      fr: '🇫🇷 Utiliser les animations',
    },
    description:
      "This video shows the actions and conditions related to animations for a sprite object. How to change an animation by it's name or number in order. As well as how toggling/cycling object states with variables can be used in a game. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game making app.",
    descriptionByLocale: {
      en:
        "This video shows the actions and conditions related to animations for a sprite object. How to change an animation by it's name or number in order. As well as how toggling/cycling object states with variables can be used in a game. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game making app.",
      fr:
        "Cette vidéo montre les actions et les conditions liées aux animations pour un objet sprite. Comment changer une animation par son nom ou son numéro d'animation. Ceci vous explique également les états d'un objet avec des variables.",
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 389,
    link: 'https://youtu.be/KOO9p4XKT8c',
    linkByLocale: {
      en: 'https://youtu.be/KOO9p4XKT8c',
      fr: 'https://youtu.be/UJsqjvwFFB4',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/KOO9p4XKT8c',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intermediate-physics-engine-2-events',
    title: 'Intermediate: Physics Engine 2.0 Events',
    titleByLocale: {
      en: 'Intermediate: Physics Engine 2.0 Events',
      fr: '🇫🇷 Le moteur Physics 2.0 - Les événements',
    },
    description:
      'This video goes over some of the events related to the physics engine in GDevelop. Explaining what forces and impulses are used for, and going over a use case for the revolute joint.(Pinball) These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
    descriptionByLocale: {
      en:
        'This video goes over some of the events related to the physics engine in GDevelop. Explaining what forces and impulses are used for, and going over a use case for the revolute joint.(Pinball) These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
      fr:
        'Cette vidéo montre comment utiliser les événements en lien avec le comportement Physics 2.0.',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 393,
    link: 'https://youtu.be/HzAFMb_q-a4',
    linkByLocale: {
      en: 'https://youtu.be/HzAFMb_q-a4',
      fr: 'https://youtu.be/yaRDsT-qP_A',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/HzAFMb_q-a4',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intermediate-expressions',
    title: 'Intermediate: Expressions',
    titleByLocale: {
      en: 'Intermediate: Expressions',
      fr: '🇫🇷 Les expressions couramment utilisées',
    },
    description:
      'This video goes over some commonly used expressions, that you will find useful for your games in GDevelop. Showing you where you would use these useful expressions, and why. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
    descriptionByLocale: {
      en:
        'This video goes over some commonly used expressions, that you will find useful for your games in GDevelop. Showing you where you would use these useful expressions, and why. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
      fr:
        'Comment et quels sont les expressions les plus couramment utilisées.',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 367,
    link: 'https://youtu.be/gGVJb0Mqry8',
    linkByLocale: {
      en: 'https://youtu.be/gGVJb0Mqry8',
      fr: 'https://youtu.be/OB5klhxtoYo',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/gGVJb0Mqry8',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intermediate-camera-controls',
    title: 'Intermediate:Camera Controls',
    titleByLocale: {
      en: 'Intermediate:Camera Controls',
      fr: 'Le contrôle de la caméra',
    },
    description:
      'This video goes over camera controls within the GDevelop game engine. Going over camera movement, zoom, rotation, and camera shake. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
    descriptionByLocale: {
      en:
        'This video goes over camera controls within the GDevelop game engine. Going over camera movement, zoom, rotation, and camera shake. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
      fr: "Comment utiliser la caméra à travers différents cas d'utilisation.",
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 327,
    link: 'https://youtu.be/5NzMs1JRuXA',
    linkByLocale: {
      en: 'https://youtu.be/5NzMs1JRuXA',
      fr: 'https://youtu.be/5NOlV_6vWT4',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/5NzMs1JRuXA',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intermediate-timers-and-waiting',
    title: 'Intermediate:Timers And Waiting',
    titleByLocale: {
      en: 'Intermediate:Timers And Waiting',
      fr: 'Utiliser les chronomètres (timer) et les pauses (wait)',
    },
    description:
      "This video goes over timers and the new wait action within the GDevelop game engine. Going over both timers by explaining how they're different, and showing some use cases for each. Including using the timers to control the firerate of a gun, and using the wait action to delay sections of a count down timer. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.",
    descriptionByLocale: {
      en:
        "This video goes over timers and the new wait action within the GDevelop game engine. Going over both timers by explaining how they're different, and showing some use cases for each. Including using the timers to control the firerate of a gun, and using the wait action to delay sections of a count down timer. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.",
      fr: 'Comment utiliser les chronomètres (timer) et les pauses (wait).',
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 314,
    link: 'https://youtu.be/mHiEnvE9iqE',
    linkByLocale: {
      en: 'https://youtu.be/mHiEnvE9iqE',
      fr: 'https://youtu.be/szizJjPF0QY',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/mHiEnvE9iqE',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'intermediate-storage',
    title: 'Intermediate: Saving & Loading (Storage)',
    titleByLocale: {
      en: 'Intermediate: Saving & Loading (Storage)',
    },
    description:
      "As you transcend the basics of GDevelop, you'll want to have things stay the same each time someone opens your game. In this video, we take a look at how to accomplish exactly this!",
    descriptionByLocale: {
      en:
        "As you transcend the basics of GDevelop, you'll want to have things stay the same each time someone opens your game. In this video, we take a look at how to accomplish exactly this!",
    },
    type: 'video',
    category: 'official-intermediate',
    duration: 282,
    link: 'https://youtu.be/AXd1nND7zQ0',
    linkByLocale: {
      en: 'https://youtu.be/AXd1nND7zQ0',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/AXd1nND7zQ0',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'playlist-in-depth',
    title: 'How To Go In-Depth',
    titleByLocale: {
      en: 'How To Go In-Depth',
    },
    description: 'Learn in deep a feature of the game engine.',
    descriptionByLocale: {
      en: 'Learn in deep a feature of the game engine.',
    },
    type: 'video',
    category: 'official-advanced',
    duration: 267,
    link:
      'https://www.youtube.com/watch?v=2eOhvUIL4vg&list=PL3YlZTdKiS886KwTTyWJ3Zg1CjZq9jxvI',
    linkByLocale: {
      en:
        'https://www.youtube.com/watch?v=2eOhvUIL4vg&list=PL3YlZTdKiS886KwTTyWJ3Zg1CjZq9jxvI',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/playlists/IndepthSeriesThumbnail.png',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/playlists/IndepthSeriesThumbnail.png',
    },
  },
  {
    id: 'advanced-saving-loading-storage',
    title: 'Advanced Tutorial: Saving & Loading (Storage)',
    titleByLocale: {
      en: 'Advanced Tutorial: Saving & Loading (Storage)',
      fr: '🇫🇷 Scores et parties : sauvegarde et chargement avec GDevelop',
    },
    description:
      "As you begin making more advanced games with GDevelop, you'll want to learn this trick to save/load all of your variables with just 3 actions. This will allow you to develop larger games without the worry of your save/load system getting too out of hand.",
    descriptionByLocale: {
      en:
        "As you begin making more advanced games with GDevelop, you'll want to learn this trick to save/load all of your variables with just 3 actions. This will allow you to develop larger games without the worry of your save/load system getting too out of hand.",
      fr: 'Comment enregistrer vos scores ou vos parties avec GDevelop.',
    },
    type: 'video',
    category: 'official-advanced',
    duration: 331,
    link: 'https://youtu.be/Fm-BJDTaBCg',
    linkByLocale: {
      en: 'https://youtu.be/Fm-BJDTaBCg',
      fr: 'https://youtu.be/yZaxHxA03r4',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/Fm-BJDTaBCg',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'export-to-itch',
    title: 'Exporting Your Game To Itch.io',
    titleByLocale: {
      en: 'Exporting Your Game To Itch.io',
    },
    description:
      "In this video we'll be exporting a game from GDevelop. We'll be exporting both a html game file and a PC build. This video will also show people how to upload that exported game to itch.io, as well as good practices to ensure your game can be found when you search for games made with the GDevelop engine.",
    descriptionByLocale: {
      en:
        "In this video we'll be exporting a game from GDevelop. We'll be exporting both a html game file and a PC build. This video will also show people how to upload that exported game to itch.io, as well as good practices to ensure your game can be found when you search for games made with the GDevelop engine.",
    },
    type: 'video',
    category: 'official-advanced',
    duration: 368,
    link: 'https://youtu.be/Q4FVvDfSzwk',
    linkByLocale: {
      en: 'https://youtu.be/Q4FVvDfSzwk',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/Q4FVvDfSzwk',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'in-depth-tweens',
    title: 'In Depth Tutorial: Tweens (Squash, Stretch, and More)',
    titleByLocale: {
      en: 'In Depth Tutorial: Tweens (Squash, Stretch, and More)',
    },
    description:
      'This video teaches GDevelop users about the tween behavior, and briefly goes over some simple juicy game effects and animations. We show an example of how to do squash and stretch, the Mario game ghost, and the Mario game coin block. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
    descriptionByLocale: {
      en:
        'This video teaches GDevelop users about the tween behavior, and briefly goes over some simple juicy game effects and animations. We show an example of how to do squash and stretch, the Mario game ghost, and the Mario game coin block. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
    },
    type: 'video',
    category: 'official-advanced',
    duration: 352,
    link: 'https://youtu.be/vdYi8Miwv2E',
    linkByLocale: {
      en: 'https://youtu.be/vdYi8Miwv2E',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/vdYi8Miwv2E',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'in-depth-tutorial-platformer',
    title: 'In Depth Tutorial: Platform(er)',
    titleByLocale: {
      en: 'In Depth Tutorial: Platform(er)',
    },
    description:
      'This video goes over the platformer behavior. How to use it, and what sort of events relate to the behavior. We take you from a blank scene to having a moving animated platformer character. This will be useful for any game developers who are just starting out with the engine, or someone who might have missed something with the platformer behavior.',
    descriptionByLocale: {
      en:
        'This video goes over the platformer behavior. How to use it, and what sort of events relate to the behavior. We take you from a blank scene to having a moving animated platformer character. This will be useful for any game developers who are just starting out with the engine, or someone who might have missed something with the platformer behavior.',
    },
    type: 'video',
    category: 'official-advanced',
    duration: 383,
    link: 'https://youtu.be/V0d93elLHkQ',
    linkByLocale: {
      en: 'https://youtu.be/V0d93elLHkQ',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/V0d93elLHkQ',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'in-depth-tutorial-top-down-behavior',
    title: 'In Depth Tutorial: Top Down Behavior',
    titleByLocale: {
      en: 'In Depth Tutorial: Top Down Behavior',
    },
    description:
      'This video goes over the top down movement behavior. How to use it, and what sort of conditions relate to the behavior. We show you the different styles of movement that can come from the behavior as well as how to achieve an isometric or 2.5D game effect with Z-ordering. This tutorial will be useful for any game developers using GDevelop, a no-code, open-source, free, and easy game-making app.',
    descriptionByLocale: {
      en:
        'This video goes over the top down movement behavior. How to use it, and what sort of conditions relate to the behavior. We show you the different styles of movement that can come from the behavior as well as how to achieve an isometric or 2.5D game effect with Z-ordering. This tutorial will be useful for any game developers using GDevelop, a no-code, open-source, free, and easy game-making app.',
    },
    type: 'video',
    category: 'official-advanced',
    duration: 361,
    link: 'https://youtu.be/zUV-lUtXpO4',
    linkByLocale: {
      en: 'https://youtu.be/zUV-lUtXpO4',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/zUV-lUtXpO4',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'in-depth-tutorial-physics-engine-two',
    title: 'In Depth Tutorial: Physics Engine 2.0',
    titleByLocale: {
      en: 'In Depth Tutorial: Physics Engine 2.0',
    },
    description:
      'This video goes over the basics of the physics engine in GDevelop. What the various options do within the behavior page, and some examples of how to use it. As well as how to make a basic brick breaker game. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game making app.',
    descriptionByLocale: {
      en:
        'This video goes over the basics of the physics engine in GDevelop. What the various options do within the behavior page, and some examples of how to use it. As well as how to make a basic brick breaker game. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game making app.',
    },
    type: 'video',
    category: 'official-advanced',
    duration: 405,
    link: 'https://youtu.be/cPwUh1669Gs',
    linkByLocale: {
      en: 'https://youtu.be/cPwUh1669Gs',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/cPwUh1669Gs',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'in-depth-tutorial-particle-emitter',
    title: 'In Depth Tutorial: Particle Emitter',
    titleByLocale: {
      en: 'In Depth Tutorial: Particle Emitter',
    },
    description:
      'This video goes over the basics of the particle emitter object in GDevelop. What the various options do within the object page, and some examples of how to use it. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
    descriptionByLocale: {
      en:
        'This video goes over the basics of the particle emitter object in GDevelop. What the various options do within the object page, and some examples of how to use it. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
    },
    type: 'video',
    category: 'official-advanced',
    duration: 441,
    link: 'https://youtu.be/mqXYlsOENpg',
    linkByLocale: {
      en: 'https://youtu.be/mqXYlsOENpg',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/mqXYlsOENpg',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'in-depth-sprite',
    title: 'In Depth Tutorial: Sprite',
    titleByLocale: {
      en: 'In Depth Tutorial: Sprite',
    },
    description:
      'This video goes over the sprite object for the GDevelop game engine. Going over collision masks, points, and animations while explaining the use cases for those tools. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
    descriptionByLocale: {
      en:
        'This video goes over the sprite object for the GDevelop game engine. Going over collision masks, points, and animations while explaining the use cases for those tools. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.',
    },
    type: 'video',
    category: 'official-advanced',
    duration: 267,
    link: 'https://youtu.be/2eOhvUIL4vg',
    linkByLocale: {
      en: 'https://youtu.be/2eOhvUIL4vg',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/2eOhvUIL4vg',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'geometry-monster',
    title: 'Geometry Monster Tutorial',
    titleByLocale: {
      en: 'Geometry Monster Tutorial',
    },
    description:
      'Make a hyper-casual mobile game where the player must grab shapes and avoid bombs.',
    descriptionByLocale: {
      en:
        'Make a hyper-casual mobile game where the player must grab shapes and avoid bombs.',
    },
    type: 'text',
    category: 'full-game',
    link:
      'https://wiki.gdevelop.io/gdevelop5/tutorials/geometry-monster?utm_source=gdevelop&utm_medium=help-link',
    linkByLocale: {
      en:
        'https://wiki.gdevelop.io/gdevelop5/tutorials/geometry-monster?utm_source=gdevelop&utm_medium=help-link',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/geometry-monster.png',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/geometry-monster.png',
    },
  },
  {
    id: 'playlist-platformer',
    title: 'How To Make a Platformer',
    titleByLocale: {
      en: 'How To Make a Platformer',
      fr: '🇫🇷 Créer un jeu de plateforme avec GDevelop',
    },
    description:
      'Learn how to make a Platformer game from scratch! Starting from zero, you will learn how to make a fun platform game, using assets found in the GDevelop asset store.',
    descriptionByLocale: {
      en:
        'Learn how to make a Platformer game from scratch! Starting from zero, you will learn how to make a fun platform game, using assets found in the GDevelop asset store.',
      fr: 'Comment créer un jeu de plateforme avec GDevelop.',
    },
    type: 'video',
    category: 'full-game',
    duration: 392,
    link:
      'https://www.youtube.com/watch?v=eU0kkLSdw0Y&list=PL3YlZTdKiS898Wio0tvKjQM0x3zo4V0Mb&ab_channel=GDevelop',
    linkByLocale: {
      en:
        'https://www.youtube.com/watch?v=eU0kkLSdw0Y&list=PL3YlZTdKiS898Wio0tvKjQM0x3zo4V0Mb&ab_channel=GDevelop',
      fr: 'https://youtu.be/VcOiDHpWgnE',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/playlists/platformer.png',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/playlists/platformer.png',
    },
  },
  {
    id: 'make--zelda-like-game',
    title: 'Make A Zelda-Like Game',
    titleByLocale: {
      en: 'Make A Zelda-Like Game',
      fr: 'Faire un jeu comme Zelda',
    },
    description: 'How to make Zelda without coding',
    descriptionByLocale: {
      en: 'How to make Zelda without coding',
      fr:
        "Du fait de l'excellente réputation dont bénéficie Zelda chez les joueurs de jeux vidéo, il semble important de passer en revue certains des mécanismes qui ont contribué à son succès. On vous montre ainsi comment sont gérés le mouvement, les états d'animation, la profondeur et les masques de collision.",
    },
    type: 'video',
    category: 'full-game',
    duration: 317,
    link:
      'https://www.youtube.com/watch?v=mWiLZ6fYXTU&list=PL3YlZTdKiS880W7Xh6ijk2cCEbSL3KSVo',
    linkByLocale: {
      en:
        'https://www.youtube.com/watch?v=mWiLZ6fYXTU&list=PL3YlZTdKiS880W7Xh6ijk2cCEbSL3KSVo',
      fr: 'https://youtu.be/6MwRZjgi9bs',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/mWiLZ6fYXTU',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'creating-tower-defense-part-1',
    title: 'Creating a Tower Defense Game - Part 1',
    titleByLocale: {
      en: 'Creating a Tower Defense Game - Part 1',
      fr: 'Créer un jeu Tower Defense',
    },
    description:
      'Learn how to make a tower defense game similar to Bloons TD or Kingdom Rush with this game development tutorial. Discover how to implement game mechanics like spawning waves of enemies, moving them to different waypoints, and utilizing the new array tool conditions/actions.\r\n',
    descriptionByLocale: {
      en:
        'Learn how to make a tower defense game similar to Bloons TD or Kingdom Rush with this game development tutorial. Discover how to implement game mechanics like spawning waves of enemies, moving them to different waypoints, and utilizing the new array tool conditions/actions.\r\n',
      fr:
        "Apprenez à créer un jeu de tower defense similaire à Bloons TD ou Kingdom Rush. Découvrez comment mettre en œuvre des mécanismes de jeu comme générer des vagues d'ennemis, les déplacer vers sur des chemins et utiliser les nouvelles conditions/actions de type tableau.",
    },
    type: 'video',
    category: 'full-game',
    duration: 380,
    link:
      'https://www.youtube.com/watch?v=b2eavtLhftI&list=PL3YlZTdKiS8_Fn9gR4COSVrTCQxxWkudZ',
    linkByLocale: {
      en:
        'https://www.youtube.com/watch?v=b2eavtLhftI&list=PL3YlZTdKiS8_Fn9gR4COSVrTCQxxWkudZ',
      fr: 'https://www.youtube.com/watch?v=b4HxfXIqjaE',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/b2eavtLhftI',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'how-to-make-a-game-step-by-step',
    title: 'How To Make A Game - Step By Step',
    titleByLocale: {
      en: 'How To Make A Game - Step By Step',
      fr: 'Créer un jeu vidéo pas à pas.',
    },
    description:
      "Create a wave defense game without coding, using GDevelop. We'll try to cover everything in this series from basic gun mechanics to enemies and more. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.",
    descriptionByLocale: {
      en:
        "Create a wave defense game without coding, using GDevelop. We'll try to cover everything in this series from basic gun mechanics to enemies and more. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.",
      fr:
        "Créez un jeu de défense contre des vagues d'ennemis en utilisant GDevelop. Dans cette série de didacticiels adaptés aux débutants, nous aborderons les mouvements des joueurs, le tir d'une balle, la logique de l'ennemi et l'apparition des ennemis.",
    },
    type: 'video',
    category: 'full-game',
    duration: 800,
    link:
      'https://www.youtube.com/watch?v=mckuSpr8vio&list=PL3YlZTdKiS8_R32-DlXGi7YGZNfG7B8Vf',
    linkByLocale: {
      en:
        'https://www.youtube.com/watch?v=mckuSpr8vio&list=PL3YlZTdKiS8_R32-DlXGi7YGZNfG7B8Vf',
      fr: 'https://youtu.be/HVORBXnQw10',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/mckuSpr8vio',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'how-to-make-roguelike',
    title: 'How To Make A Roguelike Game',
    titleByLocale: {
      en: 'How To Make A Roguelike Game',
    },
    description:
      "Roguelikes are deceptively simple to make. The two main features of modern day roguelikes are permadeath and randomized levels, so once you've created the base mechanics of the game you can just layer on new things to that core gameplay loop.",
    descriptionByLocale: {
      en:
        "Roguelikes are deceptively simple to make. The two main features of modern day roguelikes are permadeath and randomized levels, so once you've created the base mechanics of the game you can just layer on new things to that core gameplay loop.",
    },
    type: 'video',
    category: 'full-game',
    duration: 387,
    link: 'https://youtu.be/Qn85BbnSO5A',
    linkByLocale: {
      en: 'https://youtu.be/Qn85BbnSO5A',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/Qn85BbnSO5A',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'playlist-asteroids',
    title: 'How to make Asteroids',
    titleByLocale: {
      en: 'How to make Asteroids',
    },
    description:
      'Learn how to make the Asteroids game! Starting from zero, these videos will teach you how to make this game.',
    descriptionByLocale: {
      en:
        'Learn how to make the Asteroids game! Starting from zero, these videos will teach you how to make this game.',
    },
    type: 'video',
    category: 'full-game',
    duration: 413,
    link:
      'https://www.youtube.com/watch?v=w1SCpQ-mRCk&list=PL3YlZTdKiS8_Q8UPu2BJV5P5gYA-Q-k19&ab_channel=GDevelop',
    linkByLocale: {
      en:
        'https://www.youtube.com/watch?v=w1SCpQ-mRCk&list=PL3YlZTdKiS8_Q8UPu2BJV5P5gYA-Q-k19&ab_channel=GDevelop',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/playlists/asteroids.png',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/playlists/asteroids.png',
    },
  },
  {
    id: 'how-to-make-mobile-lane-racing-game',
    title: 'How To Make A Mobile Lane Racing Game',
    titleByLocale: {
      en: 'How To Make A Mobile Lane Racing Game',
    },
    description:
      'Creating a cyberpunk racing game with mobile touch screen controls. Game developers will be familiar with this obstacle dodging gameplay, but with good art and some game juice, you can create a compelling gameplay experience.',
    descriptionByLocale: {
      en:
        'Creating a cyberpunk racing game with mobile touch screen controls. Game developers will be familiar with this obstacle dodging gameplay, but with good art and some game juice, you can create a compelling gameplay experience.',
    },
    type: 'video',
    category: 'full-game',
    duration: 481,
    link: 'https://youtu.be/YTHodqxuvPQ',
    linkByLocale: {
      en: 'https://youtu.be/YTHodqxuvPQ',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/YTHodqxuvPQ',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'how-to-make-sokoban',
    title: 'How To Make A Sokoban Game',
    titleByLocale: {
      en: 'How To Make A Sokoban Game',
    },
    description:
      'Sokoban games are block pushing puzzle games, where the levels are small, and the player needs to figure out which sequence of pushes will result in them winning the game.',
    descriptionByLocale: {
      en:
        'Sokoban games are block pushing puzzle games, where the levels are small, and the player needs to figure out which sequence of pushes will result in them winning the game.',
    },
    type: 'video',
    category: 'full-game',
    duration: 346,
    link: 'https://youtu.be/Y2lI3JcJLV8',
    linkByLocale: {
      en: 'https://youtu.be/Y2lI3JcJLV8',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/Y2lI3JcJLV8',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'how-to-make-metroidvania-locks-and-keys',
    title: 'How To Make A Metroidvania - Locks & Keys',
    titleByLocale: {
      en: 'How To Make A Metroidvania - Locks & Keys',
      fr: 'Créer un jeu du type metroidvania',
    },
    description:
      "Metroidvania games all have 1 thing in common, the game worlds consist of a series of locks(Things you can't pass yet) and keys(The tool you needed to get passed it). So in this video we show game developers just how easy it is to create this sort of system in GDevelop using Boolean variables to unlock abilities, get over obstacles, and unlock doors.",
    descriptionByLocale: {
      en:
        "Metroidvania games all have 1 thing in common, the game worlds consist of a series of locks(Things you can't pass yet) and keys(The tool you needed to get passed it). So in this video we show game developers just how easy it is to create this sort of system in GDevelop using Boolean variables to unlock abilities, get over obstacles, and unlock doors.",
      fr:
        'Les jeux Metroidvania ont tous une chose en commun, les mondes du jeu consistent en une série de portes et de clés. Dans cette vidéo, nous montrons à quel point il est facile de créer ce genre de système dans GDevelop en utilisant des variables booléennes pour débloquer des capacités, franchir des obstacles et déverrouiller des portes.',
    },
    type: 'video',
    category: 'full-game',
    duration: 253,
    link: 'https://youtu.be/S_mLYcmElBQ',
    linkByLocale: {
      en: 'https://youtu.be/S_mLYcmElBQ',
      fr: 'https://youtu.be/rYKr9o1v17g',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/S_mLYcmElBQ',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'how-to-make-a-sim-city-like-game',
    title: 'How To Make A Sim City Like Game',
    titleByLocale: {
      en: 'How To Make A Sim City Like Game',
      fr: 'Créer un jeu Sim City like',
    },
    description:
      "City building games like Sim City have lots of individual mechanics that come together to create something fun. In this video we're going to show how simple the basics of creating a city builder can be.",
    descriptionByLocale: {
      en:
        "City building games like Sim City have lots of individual mechanics that come together to create something fun. In this video we're going to show how simple the basics of creating a city builder can be.",
      fr:
        "Les jeux de construction de villes comme Sim City comportent de nombreux mécanismes individuels qui s'assemblent pour créer quelque chose d'amusant. Dans cette vidéo, nous allons montrer à quel point les bases de la création d'un jeu de construction de ville peuvent être simples. ",
    },
    type: 'video',
    category: 'full-game',
    duration: 256,
    link: 'https://youtu.be/It0-QxpQtII',
    linkByLocale: {
      en: 'https://youtu.be/It0-QxpQtII',
      fr: 'https://www.youtube.com/watch?v=Gynz7Ca9dgI',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/It0-QxpQtII',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'stardew-valley-like',
    title: 'Make A Game Like Stardew Valley',
    titleByLocale: {
      en: 'Make A Game Like Stardew Valley',
    },
    description:
      "Stardew Valley is a great game created by a solo developer, and we thought it would be useful for game developers to see a video explaining some of it's mechanics, and how to add those mechanics to their game in GDevelop.",
    descriptionByLocale: {
      en:
        "Stardew Valley is a great game created by a solo developer, and we thought it would be useful for game developers to see a video explaining some of it's mechanics, and how to add those mechanics to their game in GDevelop.",
    },
    type: 'video',
    category: 'full-game',
    duration: 369,
    link: 'https://youtu.be/PPKw2kLk9IE',
    linkByLocale: {
      en: 'https://youtu.be/PPKw2kLk9IE',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/PPKw2kLk9IE',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'create-pokemon-style-monster-tamer-game',
    title: 'Create A Pokémon Style Monster Tamer Game',
    titleByLocale: {
      en: 'Create A Pokémon Style Monster Tamer Game',
    },
    description:
      'With Pokemon scarlet and violet coming out, we decided show game developers how to go about creating a top down rpg game in GDevelop. With top down movement and turn based battles, similar to pokemon.',
    descriptionByLocale: {
      en:
        'With Pokemon scarlet and violet coming out, we decided show game developers how to go about creating a top down rpg game in GDevelop. With top down movement and turn based battles, similar to pokemon.',
    },
    type: 'video',
    category: 'full-game',
    duration: 283,
    link: 'https://youtu.be/tDIiWk6V1Z4',
    linkByLocale: {
      en: 'https://youtu.be/tDIiWk6V1Z4',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/tDIiWk6V1Z4',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'cookie-clicker',
    title: 'How To Do a Cookie Clicker',
    titleByLocale: {
      en: 'How To Do a Cookie Clicker',
    },
    description:
      'Idle clicker games are incredibly popular, and surprisingly easy to make. So in this video we show how to add clicker game mechanics to your game with GDevelop.',
    descriptionByLocale: {
      en:
        'Idle clicker games are incredibly popular, and surprisingly easy to make. So in this video we show how to add clicker game mechanics to your game with GDevelop.',
    },
    type: 'video',
    category: 'full-game',
    duration: 306,
    link: 'https://youtu.be/I6Dez_6bbb4',
    linkByLocale: {
      en: 'https://youtu.be/I6Dez_6bbb4',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/I6Dez_6bbb4',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'how-to-platformer-part-1',
    title: 'How To Make A Platformer Game - Part 1',
    titleByLocale: {
      en: 'How To Make A Platformer Game - Part 1',
      fr: '🇫🇷 Créer un jeu de plateforme avec GDevelop',
    },
    description:
      "In this video we'll be creating a platformer, using the platformer behavior that comes with GDevelop by default. We'll be going through this tutorial at a fairly quick pace because you should have watched the other tutorials before watching this video. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.",
    descriptionByLocale: {
      en:
        "In this video we'll be creating a platformer, using the platformer behavior that comes with GDevelop by default. We'll be going through this tutorial at a fairly quick pace because you should have watched the other tutorials before watching this video. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.",
      fr: 'Comment créer un jeu de plateforme avec GDevelop.',
    },
    type: 'video',
    category: 'full-game',
    duration: 392,
    link: 'https://youtu.be/eU0kkLSdw0Y',
    linkByLocale: {
      en: 'https://youtu.be/eU0kkLSdw0Y',
      fr: 'https://youtu.be/VcOiDHpWgnE',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/eU0kkLSdw0Y',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'how-to-platformer-part-2',
    title: 'How To Make A Platformer Game - Part 2',
    titleByLocale: {
      en: 'How To Make A Platformer Game - Part 2',
      fr: 'Créer un jeu de plateforme avec GDevelop - 2ème Partie',
    },
    description:
      "In this video we'll be adding 2 types of enemies to our platformer game. We'll be going through this tutorial at a fairly quick pace because you should have watched our other tutorials before watching this video. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.",
    descriptionByLocale: {
      en:
        "In this video we'll be adding 2 types of enemies to our platformer game. We'll be going through this tutorial at a fairly quick pace because you should have watched our other tutorials before watching this video. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.",
      fr:
        "La 2ème partie consacrée à la création d'un jeu de plateforme avec GDevelop.",
    },
    type: 'video',
    category: 'full-game',
    duration: 361,
    link: 'https://youtu.be/Li4vhL1bXLc',
    linkByLocale: {
      en: 'https://youtu.be/Li4vhL1bXLc',
      fr: 'https://youtu.be/B8lyZPVSgLI',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/Li4vhL1bXLc',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'how-to-platformer-part-3',
    title: 'How To Make A Platformer Game - Part 3',
    titleByLocale: {
      en: 'How To Make A Platformer Game - Part 3',
      fr: '🇫🇷 Créer un jeu de plateforme avec GDevelop - 3ème Partie',
    },
    description:
      "In this platformer example video we'll be going over ladders, a checkpoint system, the parallaxing background, and a win screen with a points system. We'll be going through this tutorial at a fairly quick pace because you should have watched our other tutorials before watching this video. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.",
    descriptionByLocale: {
      en:
        "In this platformer example video we'll be going over ladders, a checkpoint system, the parallaxing background, and a win screen with a points system. We'll be going through this tutorial at a fairly quick pace because you should have watched our other tutorials before watching this video. These tutorials are designed to teach you how to make a game in GDevelop, a no-code, open-source, free, and easy game engine.",
      fr:
        "La 3ème partie consacrée à la création d'un jeu de plateforme avec GDevelop.",
    },
    type: 'video',
    category: 'full-game',
    duration: 518,
    link: 'https://youtu.be/RgClpUyeTGo',
    linkByLocale: {
      en: 'https://youtu.be/RgClpUyeTGo',
      fr: 'https://youtu.be/vIEkLP75PqQ',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/RgClpUyeTGo',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'example-asteroids',
    title: 'Example: Asteroids - Part 1',
    titleByLocale: {
      en: 'Example: Asteroids - Part 1',
      fr: "🇫🇷 Créer un jeu d'asteroïdes avec GDevelop",
    },
    description:
      "In this video we'll be recreating asteroids using the physics behavior that comes with GDevelop by default. We'll be going through this tutorial at a fairly quick pace because you should have watched the intro tutorial playlist before watching this video.",
    descriptionByLocale: {
      en:
        "In this video we'll be recreating asteroids using the physics behavior that comes with GDevelop by default. We'll be going through this tutorial at a fairly quick pace because you should have watched the intro tutorial playlist before watching this video.",
      fr: 'Comment créer un jeu d’astéroïdes avec GDevelop.',
    },
    type: 'video',
    category: 'full-game',
    duration: 413,
    link: 'https://youtu.be/w1SCpQ-mRCk',
    linkByLocale: {
      en: 'https://youtu.be/w1SCpQ-mRCk',
      fr: 'https://youtu.be/94otEb7Bb6A',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/w1SCpQ-mRCk',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'example-asteroids-second',
    title: 'Example: Asteroids + - Part 2',
    titleByLocale: {
      en: 'Example: Asteroids + - Part 2',
      fr: "🇫🇷 Créer un jeu d'asteroïdes avec GDevelop - la suite",
    },
    description:
      "In this video we'll be adding game juice. Which is basically particle effects, sound effects, screen shake, and everything that makes a game feel good to play. If you haven't watched the first video in this 2 part series, be sure to do so because it goes over how we actually built this game.",
    descriptionByLocale: {
      en:
        "In this video we'll be adding game juice. Which is basically particle effects, sound effects, screen shake, and everything that makes a game feel good to play. If you haven't watched the first video in this 2 part series, be sure to do so because it goes over how we actually built this game.",
      fr:
        'Voici la suite de la vidéo qui vous montre comment créer un jeu d’astéroïdes avec GDevelop sans programmer.',
    },
    type: 'video',
    category: 'full-game',
    duration: 269,
    link: 'https://youtu.be/z3C89rEp6YA',
    linkByLocale: {
      en: 'https://youtu.be/z3C89rEp6YA',
      fr: 'https://youtu.be/tDVPlKjcbtw',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/z3C89rEp6YA',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'platformer',
    title: 'Platformer Tutorial',
    titleByLocale: {
      en: 'Platformer Tutorial',
    },
    description: 'Make a platform game from scratch.',
    descriptionByLocale: {
      en: 'Make a platform game from scratch.',
    },
    type: 'text',
    category: 'full-game',
    link:
      'https://wiki.gdevelop.io/gdevelop5/tutorials/platformer/start?utm_source=gdevelop&utm_medium=help-link',
    linkByLocale: {
      en:
        'https://wiki.gdevelop.io/gdevelop5/tutorials/platformer/start?utm_source=gdevelop&utm_medium=help-link',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/platformer.png',
    thumbnailUrlByLocale: {
      en: 'https://resources.gdevelop-app.com/tutorials/images/platformer.png',
    },
  },
  {
    id: 'space-shooter',
    title: 'Space Shooter Tutorial',
    titleByLocale: {
      en: 'Space Shooter Tutorial',
    },
    description: 'Make a space shooter game from scratch.',
    descriptionByLocale: {
      en: 'Make a space shooter game from scratch.',
    },
    type: 'text',
    category: 'full-game',
    link:
      'https://wiki.gdevelop.io/gdevelop5/tutorials/space-shooter?utm_source=gdevelop&utm_medium=help-link',
    linkByLocale: {
      en:
        'https://wiki.gdevelop.io/gdevelop5/tutorials/space-shooter?utm_source=gdevelop&utm_medium=help-link',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/space-shooter.png',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/space-shooter.png',
    },
  },
  {
    id: '2d-car-physics-movement',
    title: 'How to Make a 2D Car or Bike Movement With Physics Engine',
    titleByLocale: {
      en: 'How to Make a 2D Car or Bike Movement With Physics Engine',
    },
    description: 'Learn how to create a physics based car movement.',
    descriptionByLocale: {
      en: 'Learn how to create a physics based car movement.',
    },
    type: 'video',
    category: 'full-game',
    duration: 1805,
    link: 'https://youtu.be/_-fX755cctU',
    linkByLocale: {
      en: 'https://youtu.be/_-fX755cctU',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/2d-car-physics-movement.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/2d-car-physics-movement.jpg',
    },
  },
  {
    id: '2d-platformer-shooter',
    title: 'Create a 2D Platformer Shooter',
    titleByLocale: {
      en: 'Create a 2D Platformer Shooter',
    },
    description:
      'Create a 2D platform game where the player can shoot at enemies chasing him.',
    descriptionByLocale: {
      en:
        'Create a 2D platform game where the player can shoot at enemies chasing him.',
    },
    type: 'video',
    category: 'full-game',
    duration: 2207,
    link: 'https://youtu.be/OOw3Sh6rga8',
    linkByLocale: {
      en: 'https://youtu.be/OOw3Sh6rga8',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/2d-platformer-shooter.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/2d-platformer-shooter.jpg',
    },
  },
  {
    id: 'tank-shooter',
    title: 'Tank Shooter Tutorial',
    titleByLocale: {
      en: 'Tank Shooter Tutorial',
    },
    description: 'Make a simple tank shooter game from scratch.',
    descriptionByLocale: {
      en: 'Make a simple tank shooter game from scratch.',
    },
    type: 'text',
    category: 'full-game',
    link:
      'https://wiki.gdevelop.io/gdevelop5/tutorials/tank-shooter?utm_source=gdevelop&utm_medium=help-link',
    linkByLocale: {
      en:
        'https://wiki.gdevelop.io/gdevelop5/tutorials/tank-shooter?utm_source=gdevelop&utm_medium=help-link',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/TankShooter.jpg',
    thumbnailUrlByLocale: {
      en: 'https://resources.gdevelop-app.com/tutorials/images/TankShooter.jpg',
    },
  },
  {
    id: 'endless-runner',
    title: 'Endless Runner Tutorial',
    titleByLocale: {
      en: 'Endless Runner Tutorial',
    },
    description:
      'Make a simple game where the player must jump on platforms for as long as possible.',
    descriptionByLocale: {
      en:
        'Make a simple game where the player must jump on platforms for as long as possible.',
    },
    type: 'text',
    category: 'full-game',
    link:
      'https://wiki.gdevelop.io/gdevelop5/tutorials/endless-runner?utm_source=gdevelop&utm_medium=help-link',
    linkByLocale: {
      en:
        'https://wiki.gdevelop.io/gdevelop5/tutorials/endless-runner?utm_source=gdevelop&utm_medium=help-link',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/EndlessRunner.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/EndlessRunner.jpg',
    },
  },
  {
    id: 'endless-car-game',
    title: 'Endless Car Game Tutorial',
    titleByLocale: {
      en: 'Endless Car Game Tutorial',
    },
    description:
      'Create a simple game where you must dodge the cars on the road.',
    descriptionByLocale: {
      en: 'Create a simple game where you must dodge the cars on the road.',
    },
    type: 'text',
    category: 'full-game',
    link:
      'https://wiki.gdevelop.io/gdevelop5/tutorials/roadrider?utm_source=gdevelop&utm_medium=help-link',
    linkByLocale: {
      en:
        'https://wiki.gdevelop.io/gdevelop5/tutorials/roadrider?utm_source=gdevelop&utm_medium=help-link',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/EndlessCar.jpg',
    thumbnailUrlByLocale: {
      en: 'https://resources.gdevelop-app.com/tutorials/images/EndlessCar.jpg',
    },
  },
  {
    id: 'breakout-tutorial',
    title: 'Breakout Tutorial',
    titleByLocale: {
      en: 'Breakout Tutorial',
    },
    description:
      'Create a simple breakout game where you must destroy all the bricks on the screen.',
    descriptionByLocale: {
      en:
        'Create a simple breakout game where you must destroy all the bricks on the screen.',
    },
    type: 'text',
    category: 'full-game',
    link:
      'https://wiki.gdevelop.io/gdevelop5/tutorials/breakout?utm_source=gdevelop&utm_medium=help-link',
    linkByLocale: {
      en:
        'https://wiki.gdevelop.io/gdevelop5/tutorials/breakout?utm_source=gdevelop&utm_medium=help-link',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/Breakout.jpg',
    thumbnailUrlByLocale: {
      en: 'https://resources.gdevelop-app.com/tutorials/images/Breakout.jpg',
    },
  },
  {
    id: 'mistake-and-tips-for-a-better-game',
    title: 'How to Make a Good Game: 5 Mistakes and Tips to Avoid',
    titleByLocale: {
      en: 'How to Make a Good Game: 5 Mistakes and Tips to Avoid',
      fr: '5 Conseils et erreurs à éviter pour créer son jeu correctement.',
    },
    description:
      'Create a playable game for everyone in an intuitive and comprehensive way with these five tips and common mistakes to avoid to enhance your game. How to keep the players playing longer your game, why a good intro for your game is important, and how to make gameplay moments more immersive by getting players emotionally engaged.',
    descriptionByLocale: {
      en:
        'Create a playable game for everyone in an intuitive and comprehensive way with these five tips and common mistakes to avoid to enhance your game. How to keep the players playing longer your game, why a good intro for your game is important, and how to make gameplay moments more immersive by getting players emotionally engaged.',
    },
    type: 'text',
    category: 'game-mechanic',
    link:
      'https://gdevelop.io/page/how-to-make-a-good-game-the-tips-and-mistakes-to-avoid',
    linkByLocale: {
      en:
        'https://gdevelop.io/page/how-to-make-a-good-game-the-tips-and-mistakes-to-avoid',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/b4d5d9b9f5661fca5be4522b578ffceb2d89c5e6-1200x630.png',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/b4d5d9b9f5661fca5be4522b578ffceb2d89c5e6-1200x630.png',
    },
  },
  {
    id: 'best-practices-when-making-games',
    title: 'Best Practices When Making Games',
    titleByLocale: {
      en: 'Best Practices When Making Games',
    },
    description:
      "Creating a game is an exciting journey that opens up a world of possibilities.\r\nThese best practices when making games guide will help you to bring our vision to life and create the best experiences for our players. Let's explore the essential knowledge you need to make your first game good and entertaining.",
    descriptionByLocale: {
      en:
        "Creating a game is an exciting journey that opens up a world of possibilities.\r\nThese best practices when making games guide will help you to bring our vision to life and create the best experiences for our players. Let's explore the essential knowledge you need to make your first game good and entertaining.",
    },
    type: 'text',
    category: 'game-mechanic',
    link: 'https://gdevelop.io/page/best-practices-when-making-games',
    linkByLocale: {
      en: 'https://gdevelop.io/page/best-practices-when-making-games',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/best-practices-when-making-games.png',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/best-practices-when-making-games.png',
    },
  },
  {
    id: 'save-all-one-event',
    title: 'Save All Of Your Objects With 1 Event ',
    titleByLocale: {
      en: 'Save All Of Your Objects With 1 Event ',
      fr: 'Sauvegarder tous vos objets en une seule fois',
    },
    description:
      'Saving and loading many objects in your game scene, so your objects can be persistent even after changing scene in your game, can be a tricky thing to do. This short tutorial video goes over the easiest way to save the name, position, and more properties into an array to use when loading object back in to your game',
    descriptionByLocale: {
      en:
        'Saving and loading many objects in your game scene, so your objects can be persistent even after changing scene in your game, can be a tricky thing to do. This short tutorial video goes over the easiest way to save the name, position, and more properties into an array to use when loading object back in to your game',
      fr:
        'On vous montre comment sauvegarder tous les objets de votre scène une seule instruction sans coder',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 626,
    link: 'https://www.youtube.com/watch?v=9ReOBFoSD3g',
    linkByLocale: {
      en: 'https://www.youtube.com/watch?v=9ReOBFoSD3g',
      fr: 'https://youtu.be/vBpjI_gFQjk',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/9ReOBFoSD3g',
    thumbnailUrlByLocale: {
      en: '',
    },
  },
  {
    id: 'game-feel-right',
    title: 'How To Do Game Feel Right',
    titleByLocale: {
      en: 'How To Do Game Feel Right',
    },
    description:
      'Game feel, or game juice, is that extra bit of polish that helps make a game go from "good" to great. In this video we\'ll cover and show examples of the different effects that add to game feel.',
    descriptionByLocale: {
      en:
        'Game feel, or game juice, is that extra bit of polish that helps make a game go from "good" to great. In this video we\'ll cover and show examples of the different effects that add to game feel.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 257,
    link: 'https://youtu.be/-0z7ZlLZNJQ',
    linkByLocale: {
      en: 'https://youtu.be/-0z7ZlLZNJQ',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/-0z7ZlLZNJQ',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'level-randomization-RNG',
    title: 'Creating Random Level Design',
    titleByLocale: {
      en: 'Creating Random Level Design',
    },
    description:
      'Randomly generated content in video games can create a lot of variety for your players. In this video we talk about 3 different ways to randomly generate levels in your game.\r\n',
    descriptionByLocale: {
      en:
        'Randomly generated content in video games can create a lot of variety for your players. In this video we talk about 3 different ways to randomly generate levels in your game.\r\n',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 315,
    link: 'https://youtu.be/OzjEQTEQwFg',
    linkByLocale: {
      en: 'https://youtu.be/OzjEQTEQwFg',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/OzjEQTEQwFg',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'how-to-make-a-boss-fight',
    title: 'How To Make A Boss Fight\r\n',
    titleByLocale: {
      en: 'How To Make A Boss Fight\r\n',
    },
    description:
      "This video shows 1 of the many ways there are to set up a boss fight. It goes over randomly picking behaviors from a set list you've created, and expanding on that list of boss behaviors and as the boss loses health.",
    descriptionByLocale: {
      en:
        "This video shows 1 of the many ways there are to set up a boss fight. It goes over randomly picking behaviors from a set list you've created, and expanding on that list of boss behaviors and as the boss loses health.",
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 266,
    link: 'https://youtu.be/emkqM9I8sQU',
    linkByLocale: {
      en: 'https://youtu.be/emkqM9I8sQU',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/emkqM9I8sQU',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'nocode-three-d-extension',
    title: '3D No-Code Game - A GDevelop Community Extension',
    titleByLocale: {
      en: '3D No-Code Game - A GDevelop Community Extension',
    },
    description:
      'It is possible to create a 3D game using GDevelop with an extension that was created by PANDAKO, who is a long time GDevelop user and community member. ',
    descriptionByLocale: {
      en:
        'It is possible to create a 3D game using GDevelop with an extension that was created by PANDAKO, who is a long time GDevelop user and community member. ',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 171,
    link: 'https://youtu.be/No9FlRmbvO8',
    linkByLocale: {
      en: 'https://youtu.be/No9FlRmbvO8',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/No9FlRmbvO8',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'melee-beat-em-up-combat',
    title: "Add Melee Beat'em Up Combat",
    titleByLocale: {
      en: "Add Melee Beat'em Up Combat",
    },
    description:
      'This video shows game developers using GDevelop how to easily implement melee combat in their game. Showing two different kinds of attacks, and how to make enemies attack the player.',
    descriptionByLocale: {
      en:
        'This video shows game developers using GDevelop how to easily implement melee combat in their game. Showing two different kinds of attacks, and how to make enemies attack the player.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 329,
    link: 'https://youtu.be/ZjxWwf7RslU',
    linkByLocale: {
      en: 'https://youtu.be/ZjxWwf7RslU',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/ZjxWwf7RslU',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'easy-rng-for-spawn-mobs',
    title: 'Easy RNG That Has A Big Effect In Your Game',
    titleByLocale: {
      en: 'Easy RNG That Has A Big Effect In Your Game',
    },
    description:
      'RNG is a useful tool for gamedevs, especially with roguelikes or games with repetition as part of their game loop. Loot drops, enemy behavior, and level generation can all be forms of randomization. And in this video we tackle some of the simplest forms of RNG to help get your game started.',
    descriptionByLocale: {
      en:
        'RNG is a useful tool for gamedevs, especially with roguelikes or games with repetition as part of their game loop. Loot drops, enemy behavior, and level generation can all be forms of randomization. And in this video we tackle some of the simplest forms of RNG to help get your game started.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 306,
    link: 'https://youtu.be/5C78xIecgiI',
    linkByLocale: {
      en: 'https://youtu.be/5C78xIecgiI',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/5C78xIecgiI',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'add-damage-armor-dodge',
    title: 'Add Damage, Armor, Dodge Chance, Etc.',
    titleByLocale: {
      en: 'Add Damage, Armor, Dodge Chance, Etc.',
    },
    description:
      'This new update makes managing the health and stats of your characters, enemies, and object in game much easier!  We show how to make a juicy hit, and then use the health extension to modify how the hit works with the player.',
    descriptionByLocale: {
      en:
        'This new update makes managing the health and stats of your characters, enemies, and object in game much easier!  We show how to make a juicy hit, and then use the health extension to modify how the hit works with the player.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 370,
    link: 'https://youtu.be/LLPtMO_ov-w',
    linkByLocale: {
      en: 'https://youtu.be/LLPtMO_ov-w',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/LLPtMO_ov-w',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'create-enemy-ai',
    title: 'Create Enemy AI\r\n',
    titleByLocale: {
      en: 'Create Enemy AI\r\n',
    },
    description:
      'We go over a number of simple game enemies, and then a couple more advanced versions that use similar mechanics to enemies in Mario and Hollow Knight. We create AI for patrolling enemies, flying enemies, and enemies that wait in place to attack the player.',
    descriptionByLocale: {
      en:
        'We go over a number of simple game enemies, and then a couple more advanced versions that use similar mechanics to enemies in Mario and Hollow Knight. We create AI for patrolling enemies, flying enemies, and enemies that wait in place to attack the player.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 389,
    link: 'https://youtu.be/0aGBYsrGwm0',
    linkByLocale: {
      en: 'https://youtu.be/0aGBYsrGwm0',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/0aGBYsrGwm0',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-squash-and-stretch',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Squash and stretch the player in your game',
    descriptionByLocale: {
      en: 'Squash and stretch the player in your game',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 60,
    link: 'https://youtu.be/zi1nI_p_KAw',
    linkByLocale: {
      en: 'https://youtu.be/zi1nI_p_KAw',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/zi1nI_p_KAw',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-spooky-ghost',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Make a spooky ghost chase the player',
    descriptionByLocale: {
      en: 'Make a spooky ghost chase the player',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 60,
    link: 'https://youtu.be/mE-7YM2TZto',
    linkByLocale: {
      en: 'https://youtu.be/mE-7YM2TZto',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/mE-7YM2TZto',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-typewritter-effect',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Make a typewriter effect in your game',
    descriptionByLocale: {
      en: 'Make a typewriter effect in your game',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 60,
    link: 'https://youtu.be/y_gMhdm9Ils',
    linkByLocale: {
      en: 'https://youtu.be/y_gMhdm9Ils',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/y_gMhdm9Ils',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-add-gamepad-in-game',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Add gamepad controls to your game',
    descriptionByLocale: {
      en: 'Add gamepad controls to your game',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 60,
    link: 'https://youtu.be/NdAWl17fcKY',
    linkByLocale: {
      en: 'https://youtu.be/NdAWl17fcKY',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/NdAWl17fcKY',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-endless-fountain',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Make an endless fountain of balls',
    descriptionByLocale: {
      en: 'Make an endless fountain of balls',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 60,
    link: 'https://youtu.be/ORiZPYFqjHM',
    linkByLocale: {
      en: 'https://youtu.be/ORiZPYFqjHM',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/ORiZPYFqjHM',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-fling-objects',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Fling objects in your game',
    descriptionByLocale: {
      en: 'Fling objects in your game',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 60,
    link: 'https://youtu.be/jnuK5SzG0p4',
    linkByLocale: {
      en: 'https://youtu.be/jnuK5SzG0p4',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/jnuK5SzG0p4',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-spawn-particle-at-point',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Spawn dust particles at a point',
    descriptionByLocale: {
      en: 'Spawn dust particles at a point',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 59,
    link: 'https://youtu.be/yQ-Cbm0HHww',
    linkByLocale: {
      en: 'https://youtu.be/yQ-Cbm0HHww',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/yQ-Cbm0HHww',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-change-game-resolution',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Change game resolution',
    descriptionByLocale: {
      en: 'Change game resolution',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 22,
    link: 'https://youtu.be/JhuRRwxrXF8',
    linkByLocale: {
      en: 'https://youtu.be/JhuRRwxrXF8',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/JhuRRwxrXF8',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-change-color-scheme',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Change color scheme',
    descriptionByLocale: {
      en: 'Change color scheme',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 19,
    link: 'https://youtu.be/_pQsEcY7rfk',
    linkByLocale: {
      en: 'https://youtu.be/_pQsEcY7rfk',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/_pQsEcY7rfk',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'shorts-add-platformer-to-the-player',
    title: 'How To:',
    titleByLocale: {
      en: 'How To:',
    },
    description: 'Add platformer behavior to the player',
    descriptionByLocale: {
      en: 'Add platformer behavior to the player',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 28,
    link: 'https://youtu.be/PMkqsAApUlI',
    linkByLocale: {
      en: 'https://youtu.be/PMkqsAApUlI',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/PMkqsAApUlI',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'animated-buttons',
    title: 'Create Animated Buttons',
    titleByLocale: {
      en: 'Create Animated Buttons',
    },
    description:
      'Create animated buttons that can be shown in your game menus (main menu, selection screen, etc...).',
    descriptionByLocale: {
      en:
        'Create animated buttons that can be shown in your game menus (main menu, selection screen, etc...).',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 870,
    link: 'https://youtu.be/7_oLY_x4vEk',
    linkByLocale: {
      en: 'https://youtu.be/7_oLY_x4vEk',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/animated-buttons.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/animated-buttons.jpg',
    },
  },
  {
    id: 'character-selection-feature',
    title: 'Character Selection',
    titleByLocale: {
      en: 'Character Selection',
    },
    description:
      'Learn how to add a selector to choose a character (or anything else) in your game.',
    descriptionByLocale: {
      en:
        'Learn how to add a selector to choose a character (or anything else) in your game.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 1346,
    link: 'https://youtu.be/8DpsjXHd4ro',
    linkByLocale: {
      en: 'https://youtu.be/8DpsjXHd4ro',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/character-selection-feature.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/character-selection-feature.jpg',
    },
  },
  {
    id: 'flickering-dynamic-light-effect',
    title: 'Create a Flickering Dynamic Light Effect',
    titleByLocale: {
      en: 'Create a Flickering Dynamic Light Effect',
    },
    description:
      'Learn how to create a dynamic light following the player, with a flickering effect.',
    descriptionByLocale: {
      en:
        'Learn how to create a dynamic light following the player, with a flickering effect.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 609,
    link: 'https://youtu.be/HolCWx4E0TU',
    linkByLocale: {
      en: 'https://youtu.be/HolCWx4E0TU',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/flickering-dynamic-light-effect.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/flickering-dynamic-light-effect.jpg',
    },
  },
  {
    id: 'ghost-enemy-following-player',
    title: 'Ghost Enemy Following the Player',
    titleByLocale: {
      en: 'Ghost Enemy Following the Player',
    },
    description: 'Make a ghost like enemy floating toward the player.',
    descriptionByLocale: {
      en: 'Make a ghost like enemy floating toward the player.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 910,
    link: 'https://youtu.be/SLUlnhKuuqE',
    linkByLocale: {
      en: 'https://youtu.be/SLUlnhKuuqE',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/ghost-enemy-following-player.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/ghost-enemy-following-player.jpg',
    },
  },
  {
    id: 'health-bar-and-health-potion',
    title: 'Create a Health Bar and Health Potion',
    titleByLocale: {
      en: 'Create a Health Bar and Health Potion',
    },
    description:
      'How to show a health bar on screen and a potion to give back health to the player.',
    descriptionByLocale: {
      en:
        'How to show a health bar on screen and a potion to give back health to the player.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 1052,
    link: 'https://youtu.be/P-scQW7PeVg',
    linkByLocale: {
      en: 'https://youtu.be/P-scQW7PeVg',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/health-bar-and-health-potion.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/health-bar-and-health-potion.jpg',
    },
  },
  {
    id: 'melee-sword-attack',
    title: 'Melee/Sword Attack',
    titleByLocale: {
      en: 'Melee/Sword Attack',
    },
    description:
      'Learn how to make a melee/sword attack with a randomly triggered animation each time a key is pressed.',
    descriptionByLocale: {
      en:
        'Learn how to make a melee/sword attack with a randomly triggered animation each time a key is pressed.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 1638,
    link: 'https://youtu.be/3XT40kDRp8g',
    linkByLocale: {
      en: 'https://youtu.be/3XT40kDRp8g',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/melee-sword-attack.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/melee-sword-attack.jpg',
    },
  },
  {
    id: 'opening-chest',
    title: 'Open a Loot Chest',
    titleByLocale: {
      en: 'Open a Loot Chest',
    },
    description:
      'How to open a loot chest with a key that the player can find in the level.',
    descriptionByLocale: {
      en:
        'How to open a loot chest with a key that the player can find in the level.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 1119,
    link: 'https://youtu.be/1qsCgwFtYfg',
    linkByLocale: {
      en: 'https://youtu.be/1qsCgwFtYfg',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/opening-chest.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/opening-chest.jpg',
    },
  },
  {
    id: 'particle-effects',
    title: 'Particle Effects',
    titleByLocale: {
      en: 'Particle Effects',
    },
    description:
      'Learn how to use particle emitters in GDevelop to create effects like fire, explosion, magic beam, etc...',
    descriptionByLocale: {
      en:
        'Learn how to use particle emitters in GDevelop to create effects like fire, explosion, magic beam, etc...',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 816,
    link: 'https://youtu.be/7sqMmTntvKs',
    linkByLocale: {
      en: 'https://youtu.be/7sqMmTntvKs',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/particle-effects.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/particle-effects.jpg',
    },
  },
  {
    id: 'pause-menu',
    title: 'Pause Menu',
    titleByLocale: {
      en: 'Pause Menu',
    },
    description: 'Learn how to stop the time and make a pause menu.',
    descriptionByLocale: {
      en: 'Learn how to stop the time and make a pause menu.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 1839,
    link: 'https://youtu.be/k2J784esdkc',
    linkByLocale: {
      en: 'https://youtu.be/k2J784esdkc',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/pause-menu.jpg',
    thumbnailUrlByLocale: {
      en: 'https://resources.gdevelop-app.com/tutorials/images/pause-menu.jpg',
    },
  },
  {
    id: 'physics-engine-platformer-game',
    title: 'Platformer with the physics engine',
    titleByLocale: {
      en: 'Platformer with the physics engine',
    },
    description:
      'Learn how to make a platformer game using the physics engine.',
    descriptionByLocale: {
      en: 'Learn how to make a platformer game using the physics engine.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 1905,
    link: 'https://youtu.be/96gNCmnQwaE',
    linkByLocale: {
      en: 'https://youtu.be/96gNCmnQwaE',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/physics-engine-platformer-game.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/physics-engine-platformer-game.jpg',
    },
  },
  {
    id: 'push-objects',
    title: 'Push Objects',
    titleByLocale: {
      en: 'Push Objects',
    },
    description: 'Learn how to push objects, like a box, in a platform game.',
    descriptionByLocale: {
      en: 'Learn how to push objects, like a box, in a platform game.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 901,
    link: 'https://youtu.be/11tjJ0JgYuk',
    linkByLocale: {
      en: 'https://youtu.be/11tjJ0JgYuk',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/push-objects.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/push-objects.jpg',
    },
  },
  {
    id: 'responsive-ui',
    title: 'Reponsive UI',
    titleByLocale: {
      en: 'Reponsive UI',
    },
    description: 'Learn how to add responsive UI using anchors.',
    descriptionByLocale: {
      en: 'Learn how to add responsive UI using anchors.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 608,
    link: 'https://youtu.be/VgrEhg0esCg',
    linkByLocale: {
      en: 'https://youtu.be/VgrEhg0esCg',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/responsive-ui.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/responsive-ui.jpg',
    },
  },
  {
    id: 'screen-shake-timer-variables',
    title: 'Screen Shake Effect with Timers and Variables',
    titleByLocale: {
      en: 'Screen Shake Effect with Timers and Variables',
    },
    description:
      'Learn how to add a screen shake effect when the player falls from a very high platform in a platformer.',
    descriptionByLocale: {
      en:
        'Learn how to add a screen shake effect when the player falls from a very high platform in a platformer.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 1034,
    link: 'https://youtu.be/0w0NGuj4OFQ',
    linkByLocale: {
      en: 'https://youtu.be/0w0NGuj4OFQ',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/screen-shake-timer-variables.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/screen-shake-timer-variables.jpg',
    },
  },
  {
    id: 'simple-game-physics-particles',
    title: 'How to Create a Simple Game with Physics and Particles',
    titleByLocale: {
      en: 'How to Create a Simple Game with Physics and Particles',
    },
    description: 'Create a game from scratch using physics and particles.',
    descriptionByLocale: {
      en: 'Create a game from scratch using physics and particles.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 3953,
    link: 'https://youtu.be/w8B84Dpgkjc',
    linkByLocale: {
      en: 'https://youtu.be/w8B84Dpgkjc',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/simple-game-physics-particles.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/simple-game-physics-particles.jpg',
    },
  },
  {
    id: 'simple-trampoline-platformer',
    title: 'Make a Simple Trampoline/Jump Pad',
    titleByLocale: {
      en: 'Make a Simple Trampoline/Jump Pad',
    },
    description:
      'Create a trampoline in your platformer game, making the player jump very high when stepped on.',
    descriptionByLocale: {
      en:
        'Create a trampoline in your platformer game, making the player jump very high when stepped on.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 849,
    link: 'https://youtu.be/p42i4omA7j8',
    linkByLocale: {
      en: 'https://youtu.be/p42i4omA7j8',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/simple-trampoline-platformer.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/simple-trampoline-platformer.jpg',
    },
  },
  {
    id: 'smooth-camera-movement',
    title: 'Smooth Camera Movement',
    titleByLocale: {
      en: 'Smooth Camera Movement',
    },
    description:
      'Learn how to make the camera follow the player in a smooth movement.',
    descriptionByLocale: {
      en:
        'Learn how to make the camera follow the player in a smooth movement.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 331,
    link: 'https://youtu.be/yUNisggNh7s',
    linkByLocale: {
      en: 'https://youtu.be/yUNisggNh7s',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/smooth-camera-movement.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/smooth-camera-movement.jpg',
    },
  },
  {
    id: 'touch-360-joystick-controller',
    title: 'Create a Touch 360 Joystick Controller',
    titleByLocale: {
      en: 'Create a Touch 360 Joystick Controller',
    },
    description:
      'How to create a joystick displayed on screen, useful to control the player in mobile games.',
    descriptionByLocale: {
      en:
        'How to create a joystick displayed on screen, useful to control the player in mobile games.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 1937,
    link: 'https://youtu.be/-k-bVU3QrfA',
    linkByLocale: {
      en: 'https://youtu.be/-k-bVU3QrfA',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/touch-360-joystick-controller.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/touch-360-joystick-controller.jpg',
    },
  },
  {
    id: 'tween-behavior',
    title: 'Tween Behavior',
    titleByLocale: {
      en: 'Tween Behavior',
    },
    description:
      'Learn how to use the Tween Behavior and how it can be used to add more life and animation to you projects.',
    descriptionByLocale: {
      en:
        'Learn how to use the Tween Behavior and how it can be used to add more life and animation to you projects.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 1175,
    link: 'https://youtu.be/SLqnwC9D5Q4',
    linkByLocale: {
      en: 'https://youtu.be/SLqnwC9D5Q4',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/tween-behavior.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/tween-behavior.jpg',
    },
  },
  {
    id: 'save-and-load',
    title: 'Save and Load',
    titleByLocale: {
      en: 'Save and Load',
    },
    description:
      'Learn how to save the player progress, and other information, and to load them again later.',
    descriptionByLocale: {
      en:
        'Learn how to save the player progress, and other information, and to load them again later.',
    },
    type: 'video',
    category: 'game-mechanic',
    duration: 1938,
    link: 'https://youtu.be/bXUGJqHhuCo',
    linkByLocale: {
      en: 'https://youtu.be/bXUGJqHhuCo',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/save-and-load.jpg',
    thumbnailUrlByLocale: {
      en:
        'https://resources.gdevelop-app.com/tutorials/images/save-and-load.jpg',
    },
  },
  {
    id: 'blog-teaching-kids',
    title: 'Use GDevelop to Teach Logic to Kids',
    titleByLocale: {
      en: 'Use GDevelop to Teach Logic to Kids',
    },
    description: 'Get ideas about how to use GDevelop as a teaching tool.',
    descriptionByLocale: {
      en: 'Get ideas about how to use GDevelop as a teaching tool.',
    },
    type: 'text',
    category: 'recommendations',
    link: 'https://gdevelop.io/blog/turning-teens-into-teachers-1',
    linkByLocale: {
      en: 'https://gdevelop.io/blog/turning-teens-into-teachers-1',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'wiki-play-music-and-sounds',
    title: 'Play Music and Sounds',
    titleByLocale: {
      en: 'Play Music and Sounds',
    },
    description: 'Learn how to use audio in your game.',
    descriptionByLocale: {
      en: 'Learn how to use audio in your game.',
    },
    type: 'text',
    category: 'recommendations',
    link: 'https://wiki.gdevelop.io/gdevelop5/all-features/audio/',
    linkByLocale: {
      en: 'https://wiki.gdevelop.io/gdevelop5/all-features/audio/',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'wiki-prefabs',
    title: 'Does GDevelop Have Prefabs?',
    titleByLocale: {
      en: 'Does GDevelop Have Prefabs?',
    },
    description:
      'Discover GDevelop Prefabs to speed up your game development journey.',
    descriptionByLocale: {
      en:
        'Discover GDevelop Prefabs to speed up your game development journey.',
    },
    type: 'text',
    category: 'recommendations',
    link:
      'https://wiki.gdevelop.io/gdevelop5/objects/custom-objects-prefab-template/',
    linkByLocale: {
      en:
        'https://wiki.gdevelop.io/gdevelop5/objects/custom-objects-prefab-template/',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'wiki-game-making-basics',
    title: 'Basics of Game Creation',
    titleByLocale: {
      en: 'Basics of Game Creation',
    },
    description:
      'Are you a beginner in game development? Get familiar with the basics here.',
    descriptionByLocale: {
      en:
        'Are you a beginner in game development? Get familiar with the basics here.',
    },
    type: 'text',
    category: 'recommendations',
    link:
      'https://wiki.gdevelop.io/gdevelop5/tutorials/basic-game-making-concepts/',
    linkByLocale: {
      en:
        'https://wiki.gdevelop.io/gdevelop5/tutorials/basic-game-making-concepts/',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'wiki-all-extensions',
    title: 'All GDevelop Extensions',
    titleByLocale: {
      en: 'All GDevelop Extensions',
    },
    description: 'Find the extensions you need for you next game.',
    descriptionByLocale: {
      en: 'Find the extensions you need for you next game.',
    },
    type: 'text',
    category: 'recommendations',
    link: 'https://wiki.gdevelop.io/gdevelop5/extensions/',
    linkByLocale: {
      en: 'https://wiki.gdevelop.io/gdevelop5/extensions/',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'top-ten-games-2022',
    title: 'Top 10 GDevelop Games of 2022',
    titleByLocale: {
      en: 'Top 10 GDevelop Games of 2022',
    },
    description:
      'Discover our top ten of the best games made with GDevelop in 2022',
    descriptionByLocale: {
      en: 'Discover our top ten of the best games made with GDevelop in 2022',
    },
    type: 'video',
    category: 'recommendations',
    duration: 646,
    link: 'https://youtu.be/vhVT_avcFgA',
    linkByLocale: {
      en: 'https://youtu.be/vhVT_avcFgA',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/vhVT_avcFgA',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'javascript-events',
    title: 'How to use Javascript',
    titleByLocale: {
      en: 'How to use Javascript',
    },
    description: 'How can you use Javascript in GDevelop?',
    descriptionByLocale: {
      en: 'How can you use Javascript in GDevelop?',
    },
    type: 'video',
    category: 'recommendations',
    duration: 343,
    link: 'https://youtu.be/cv3qn-M4OH0',
    linkByLocale: {
      en: 'https://youtu.be/cv3qn-M4OH0',
    },
    thumbnailUrl:
      'https://resources.gdevelop-app.com/tutorials/images/cv3qn-M4OH0',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'wiki-publish-games',
    title: 'How to publish your game',
    titleByLocale: {
      en: 'How to publish your game',
    },
    description:
      'Learn where to publish your game and the associated process to do so.',
    descriptionByLocale: {
      en:
        'Learn where to publish your game and the associated process to do so.',
    },
    type: 'text',
    category: 'recommendations',
    link: 'https://wiki.gdevelop.io/gdevelop5/publishing/',
    linkByLocale: {
      en: 'https://wiki.gdevelop.io/gdevelop5/publishing/',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'blog-teaching-support',
    title: 'Making Interactive Games to Teach on GDevelop',
    titleByLocale: {
      en: 'Making Interactive Games to Teach on GDevelop',
    },
    description:
      'Read about how GDevelop was used to create educational content for students.',
    descriptionByLocale: {
      en:
        'Read about how GDevelop was used to create educational content for students.',
    },
    type: 'text',
    category: 'recommendations',
    link:
      'https://gdevelop.io/blog/using-gdevelop-in-eu-backed-projects-in-croatia',
    linkByLocale: {
      en:
        'https://gdevelop.io/blog/using-gdevelop-in-eu-backed-projects-in-croatia',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'wiki-admob',
    title: 'Use AdMob to Display Ads',
    titleByLocale: {
      en: 'Use AdMob to Display Ads',
    },
    description: 'Learn how to integrate Google AdMob to your game',
    descriptionByLocale: {
      en: 'Learn how to integrate Google AdMob to your game',
    },
    type: 'text',
    category: 'recommendations',
    link: 'https://wiki.gdevelop.io/gdevelop5/all-features/admob/',
    linkByLocale: {
      en: 'https://wiki.gdevelop.io/gdevelop5/all-features/admob/',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'wiki-database',
    title: 'Fetch Data from an External Database',
    titleByLocale: {
      en: 'Fetch Data from an External Database',
    },
    description: 'Read about how to query a database from within your game.',
    descriptionByLocale: {
      en: 'Read about how to query a database from within your game.',
    },
    type: 'text',
    category: 'recommendations',
    link:
      'https://wiki.gdevelop.io/gdevelop5/all-features/firebase/realtime_database/',
    linkByLocale: {
      en:
        'https://wiki.gdevelop.io/gdevelop5/all-features/firebase/realtime_database/',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'wiki-publish-on-steam',
    title: 'Publish Your Game on Steam',
    titleByLocale: {
      en: 'Publish Your Game on Steam',
    },
    description: 'Learn the steps to publish your game on Steam.',
    descriptionByLocale: {
      en: 'Learn the steps to publish your game on Steam.',
    },
    type: 'text',
    category: 'recommendations',
    link: 'https://wiki.gdevelop.io/gdevelop5/publishing/publish-to-steam/',
    linkByLocale: {
      en: 'https://wiki.gdevelop.io/gdevelop5/publishing/publish-to-steam/',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'blog-publish-on-epic',
    title: 'Publish Your Game on Epic Games Store',
    titleByLocale: {
      en: 'Publish Your Game on Epic Games Store',
    },
    description:
      'Discover how to make your game appear on the Epic Games store.',
    descriptionByLocale: {
      en: 'Discover how to make your game appear on the Epic Games store.',
    },
    type: 'text',
    category: 'recommendations',
    link:
      'https://gdevelop.io/page/how-to-publish-game-on-epic-games-store-and-why-you-should',
    linkByLocale: {
      en:
        'https://gdevelop.io/page/how-to-publish-game-on-epic-games-store-and-why-you-should',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'blog-publish-on-newgrounds',
    title: 'Publish Your Game on Newgrounds',
    titleByLocale: {
      en: 'Publish Your Game on Newgrounds',
    },
    description:
      'Read this quick guide about publishing your game on Newgrounds',
    descriptionByLocale: {
      en: 'Read this quick guide about publishing your game on Newgrounds',
    },
    type: 'text',
    category: 'recommendations',
    link:
      'https://gdevelop.io/page/how-to-publish-your-game-on-newgrounds-and-why-you-should-do-it',
    linkByLocale: {
      en:
        'https://gdevelop.io/page/how-to-publish-your-game-on-newgrounds-and-why-you-should-do-it',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'wiki-publishing-ios',
    title: 'Publish Your Game on the App Store',
    titleByLocale: {
      en: 'Publish Your Game on the App Store',
    },
    description:
      'Want your game to be played on iPhones and iPads? Read this guide.',
    descriptionByLocale: {
      en: 'Want your game to be played on iPhones and iPads? Read this guide.',
    },
    type: 'text',
    category: 'recommendations',
    link:
      'https://wiki.gdevelop.io/gdevelop5/publishing/android_and_ios_with_cordova/',
    linkByLocale: {
      en:
        'https://wiki.gdevelop.io/gdevelop5/publishing/android_and_ios_with_cordova/',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'wiki-publishing-android',
    title: 'Publish Your Game on the Play Store',
    titleByLocale: {
      en: 'Publish Your Game on the Play Store',
    },
    description: 'Export your game for Android in 3 clicks.',
    descriptionByLocale: {
      en: 'Export your game for Android in 3 clicks.',
    },
    type: 'text',
    category: 'recommendations',
    link: 'https://wiki.gdevelop.io/gdevelop5/publishing/android_and_ios/',
    linkByLocale: {
      en: 'https://wiki.gdevelop.io/gdevelop5/publishing/android_and_ios/',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'wiki-publishing-amazon',
    title: 'Your Game on the Amazon App Store',
    titleByLocale: {
      en: 'Your Game on the Amazon App Store',
    },
    description: 'Learn about how to publish your game on the Amazon App Store',
    descriptionByLocale: {
      en: 'Learn about how to publish your game on the Amazon App Store',
    },
    type: 'text',
    category: 'recommendations',
    link:
      'https://wiki.gdevelop.io/gdevelop5/publishing/publishing-to-amazon-app-store/',
    linkByLocale: {
      en:
        'https://wiki.gdevelop.io/gdevelop5/publishing/publishing-to-amazon-app-store/',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'wiki-publishing-desktop',
    title: 'Export Your Game for Desktop Computers',
    titleByLocale: {
      en: 'Export Your Game for Desktop Computers',
    },
    description:
      'Learn how to make your game available for Windows, Mac and Linux',
    descriptionByLocale: {
      en: 'Learn how to make your game available for Windows, Mac and Linux',
    },
    type: 'text',
    category: 'recommendations',
    link: 'https://wiki.gdevelop.io/gdevelop5/publishing/windows-macos-linux/',
    linkByLocale: {
      en: 'https://wiki.gdevelop.io/gdevelop5/publishing/windows-macos-linux/',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
  {
    id: 'wiki-publishing-html5',
    title: 'Export Your Game as a Standalone Web Page',
    titleByLocale: {
      en: 'Export Your Game as a Standalone Web Page',
    },
    description: 'Host your game on your personal or company server',
    descriptionByLocale: {
      en: 'Host your game on your personal or company server',
    },
    type: 'text',
    category: 'recommendations',
    link:
      'https://wiki.gdevelop.io/gdevelop5/publishing/html5_game_in_a_local_folder/',
    linkByLocale: {
      en:
        'https://wiki.gdevelop.io/gdevelop5/publishing/html5_game_in_a_local_folder/',
    },
    thumbnailUrl: '',
    thumbnailUrlByLocale: {},
  },
];
