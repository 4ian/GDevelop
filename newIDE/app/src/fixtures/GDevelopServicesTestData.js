// @flow
import {
  type Usages,
  type Subscription,
  type Limits,
} from '../Utils/GDevelopServices/Usage';
import { User as FirebaseUser } from 'firebase/auth';
import { type Profile } from '../Utils/GDevelopServices/Authentication';
import { type Release } from '../Utils/GDevelopServices/Release';
import { type Build } from '../Utils/GDevelopServices/Build';
import { type ExtensionShortHeader } from '../Utils/GDevelopServices/Extension';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { type Game, type ShowcasedGame } from '../Utils/GDevelopServices/Game';
import { type GameMetrics } from '../Utils/GDevelopServices/Analytics';
import { type AuthenticatedUser } from '../Profile/AuthenticatedUserContext';
import {
  type AssetShortHeader,
  type Asset,
} from '../Utils/GDevelopServices/Asset';

export const indieFirebaseUser: FirebaseUser = {
  uid: 'indie-user',
  providerId: 'fake-provider.com',
  email: 'indie-user@example.com',
  emailVerified: true,
};

export const indieUserProfile: Profile = {
  id: 'indie-user',
  email: 'indie-user@example.com',
  username: 'im-the-indie-user',
};

export const usagesForIndieUser: Usages = [
  {
    id: '1',
    userId: 'indie-user',
    type: 'cordova-build',
    createdAt: 1515084391000,
  },
  {
    id: '56',
    userId: 'indie-user',
    type: 'cordova-build',
    createdAt: 1515084351000,
  },
  {
    id: '75',
    userId: 'indie-user',
    type: 'cordova-build',
    createdAt: 1515084311000,
  },
];

export const subscriptionForIndieUser: Subscription = {
  planId: 'gdevelop_indie',
  createdAt: 1515084011000,
  updatedAt: 1515084011000,
  userId: 'indie-user',
};

export const noSubscription: Subscription = {
  planId: null,
  createdAt: 1515084011000,
  updatedAt: 1515084011000,
  userId: 'no-subscription-user',
};

export const limitsForIndieUser: Limits = {
  'cordova-build': {
    current: 2,
    max: 10,
    limitReached: false,
  },
};

export const limitsReached: Limits = {
  'cordova-build': {
    current: 10,
    max: 10,
    limitReached: true,
  },
};

export const fakeIndieAuthenticatedUser: AuthenticatedUser = {
  authenticated: true,
  profile: indieUserProfile,
  firebaseUser: indieFirebaseUser,
  subscription: subscriptionForIndieUser,
  usages: usagesForIndieUser,
  limits: limitsForIndieUser,
  onLogout: () => {},
  onLogin: () => {},
  onEdit: () => {},
  onCreateAccount: () => {},
  onRefreshUserProfile: () => {
    console.info('This should refresh the user profile');
  },
  getAuthorizationHeader: () => Promise.resolve('fake-authorization-header'),
};

export const fakeNoSubscriptionAuthenticatedUser: AuthenticatedUser = {
  authenticated: true,
  profile: indieUserProfile,
  firebaseUser: indieFirebaseUser,
  subscription: noSubscription,
  usages: usagesForIndieUser,
  limits: limitsForIndieUser,
  onLogout: () => {},
  onLogin: () => {},
  onEdit: () => {},
  onCreateAccount: () => {},
  onRefreshUserProfile: () => {
    console.info('This should refresh the user profile');
  },
  getAuthorizationHeader: () => Promise.resolve('fake-authorization-header'),
};

export const fakeAuthenticatedButLoadingAuthenticatedUser: AuthenticatedUser = {
  authenticated: true,
  profile: null,
  firebaseUser: null,
  subscription: null,
  usages: null,
  limits: null,
  onLogout: () => {},
  onLogin: () => {},
  onEdit: () => {},
  onCreateAccount: () => {},
  onRefreshUserProfile: () => {
    console.info('This should refresh the user profile');
  },
  getAuthorizationHeader: () => Promise.resolve('fake-authorization-header'),
};

export const fakeNotAuthenticatedAuthenticatedUser: AuthenticatedUser = {
  authenticated: false,
  profile: null,
  firebaseUser: null,
  subscription: null,
  usages: null,
  limits: null,
  onLogout: () => {},
  onLogin: () => {},
  onEdit: () => {},
  onCreateAccount: () => {},
  onRefreshUserProfile: () => {
    console.info('This should refresh the user profile');
  },
  getAuthorizationHeader: () => Promise.resolve('fake-authorization-header'),
};

export const release: Release = {
  name: '5.0.0-beta62',
  publishedAt: '2019-01-14T23:32:41Z',
  url: 'https://github.com/4ian/GDevelop/releases/tag/v5.0.0-beta62',
  description:
    '> 💌Before listing the new features/improvements/bug fixes, a huge thanks to the contributors that allowed this new version to be what it is: @blurymind, @Bouh, @Lizard-13, @Wend1go, @zatsme 👏 GDevelop is growing thanks to you!\r\n\r\n## ✨New features\r\n\r\n* **Functions** are now "out of alpha testing" and always shown in the project manager. Functions are a powerful way to create new conditions, actions and expression using events. This allow to make your events and the logic of your game easier to understand and create. This also allow you to share common functions between games and create advanced features that are easy to use. [Learn more about functions on the wiki](http://wiki.compilgames.net/doku.php/gdevelop5/events/functions)\r\n* A brand new Physics engine: **Physics Engine 2.0**. (Thanks @Lizard-13 for creating it, testing it, improving it and creating examples and tests, and @zatsme for various update and examples!). While still based on the same internal physics engine, it is much more complete and powerful than the previous one:\r\n  * Support for a lot of joints (revolute, gear, mouse, prismatic, rope, pulley, wheel and more!)\r\n  * Support more options for bodies\r\n  * Support more shape and even custom polygons for objects.\r\n  * Look at the updated and **new examples** to learn how to use it and to see what\'s possible!\r\n\r\n  > Your existing games will continue to work with the old physics engine. You can still continue to use it. For new games, prefer to use the new Physics Engine 2.0. In your existing game, you can also replace *the behavior of all of your objects* by the new behavior, and replace *all the conditions and actions* by the conditions and actions from the new engine.\r\n* New **Screenshot** action, to take in-game screenshot for games running on Windows/macOS/Linux. (thanks @Wend1go!)\r\n  * This also come with new expressions to access to the **file system paths**, useful to save the screenshots in a folder of the user.\r\n\r\n## 💝 Improvements\r\n\r\n* Display missing files in resource editor as red (thanks @blurymind!)\r\n* Add option to set scale mode ("sampling") of the game to nearest (for "pixel perfect" or 8bit games) in the game properties.\r\n* Usability: autoclose project manager when opening an editor (thanks @blurymind!)\r\n* Add button to choose a new file for a resource in the resource editor (thanks @blurymind!)\r\n* New "Pixel perfect platform engine" example.\r\n* Usability: add shortcut to open Project Manager and focus search field when opening it.\r\n* Updated "Isometric Game" starter game to have better collision handling and mobile support.\r\n* Add GetAngle/GetXVelocity and GetYVelocity expressions to top-down movement behavior.\r\n* Extensions written in JavaScript can now be used to create new type of objects.\r\n* Usability: icons in the list of instructions or expressions are now displayed.\r\n\r\n## 🐛 Bug fixes \r\n\r\n* Update **Facebook Instant Games export** to have the now required bundle file (fbapp-config.json).\r\n* Fix the sentence in the events sheet of a Facebook Instant Games action. (thanks @Bouh!)\r\n* Fix descriptions of Storage actions to make clear that no "real" files are written.\r\n* Fix Left Shift key\r\n* Fix middle mouse button (thanks @Bouh!)\r\n* Fix visual artifacts when rendering rescaled games\r\n* Fix platform engine 1-pixel offset bug\r\n* Fix initial opacity undefined for text objects (thanks @Lizard-13)\r\n* Fix the condition checking if the cursor is on an object (thanks @Lizard-13)\r\n* Avoid crash of the debugger with Particle Emitters\r\n* Add explicit "OK" button in message box to fix issue on Linux\r\n* Usability: hide object drop-down list after an object is selected\r\n* Fix login dialog not showing on top of export dialog',
};

export const releaseWithBreakingChange: Release = {
  name: '5.0.0-beta60',
  publishedAt: '2019-01-07T23:32:41Z',
  url: 'https://github.com/4ian/GDevelop/releases/tag/v5.0.0-beta60',
  description:
    '> ⚠️ Blabla, beware there is a breaking change!!!\r\n\r\n## ✨New features\r\n\r\n* **Functions** are now "out of alpha testing" and always shown in the project manager. Functions are a powerful way to create new conditions, actions and expression using events. This allow to make your events and the logic of your game easier to understand and create. This also allow you to share common functions between games and create advanced features that are easy to use. [Learn more about functions on the wiki](http://wiki.compilgames.net/doku.php/gdevelop5/events/functions)\r\n* A brand new Physics engine: **Physics Engine 2.0**. (Thanks @Lizard-13 for creating it, testing it, improving it and creating examples and tests, and @zatsme for various update and examples!). While still based on the same internal physics engine, it is much more complete and powerful than the previous one:\r\n  * Support for a lot of joints (revolute, gear, mouse, prismatic, rope, pulley, wheel and more!)\r\n  * Support more options for bodies\r\n  * Support more shape and even custom polygons for objects.\r\n  * Look at the updated and **new examples** to learn how to use it and to see what\'s possible!\r\n\r\n  > Your existing games will continue to work with the old physics engine. You can still continue to use it. For new games, prefer to use the new Physics Engine 2.0. In your existing game, you can also replace *the behavior of all of your objects* by the new behavior, and replace *all the conditions and actions* by the conditions and actions from the new engine.\r\n* New **Screenshot** action, to take in-game screenshot for games running on Windows/macOS/Linux. (thanks @Wend1go!)\r\n  * This also come with new expressions to access to the **file system paths**, useful to save the screenshots in a folder of the user.\r\n\r\n## 💝 Improvements\r\n\r\n* Display missing files in resource editor as red (thanks @blurymind!)\r\n* Add option to set scale mode ("sampling") of the game to nearest (for "pixel perfect" or 8bit games) in the game properties.\r\n* Usability: autoclose project manager when opening an editor (thanks @blurymind!)\r\n* Add button to choose a new file for a resource in the resource editor (thanks @blurymind!)\r\n* New "Pixel perfect platform engine" example.\r\n* Usability: add shortcut to open Project Manager and focus search field when opening it.\r\n* Updated "Isometric Game" starter game to have better collision handling and mobile support.\r\n* Add GetAngle/GetXVelocity and GetYVelocity expressions to top-down movement behavior.\r\n* Extensions written in JavaScript can now be used to create new type of objects.\r\n* Usability: icons in the list of instructions or expressions are now displayed.\r\n\r\n## 🐛 Bug fixes \r\n\r\n* Update **Facebook Instant Games export** to have the now required bundle file (fbapp-config.json).\r\n* Fix the sentence in the events sheet of a Facebook Instant Games action. (thanks @Bouh!)\r\n* Fix descriptions of Storage actions to make clear that no "real" files are written.\r\n* Fix Left Shift key\r\n* Fix middle mouse button (thanks @Bouh!)\r\n* Fix visual artifacts when rendering rescaled games\r\n* Fix platform engine 1-pixel offset bug\r\n* Fix initial opacity undefined for text objects (thanks @Lizard-13)\r\n* Fix the condition checking if the cursor is on an object (thanks @Lizard-13)\r\n* Avoid crash of the debugger with Particle Emitters\r\n* Add explicit "OK" button in message box to fix issue on Linux\r\n* Usability: hide object drop-down list after an object is selected\r\n* Fix login dialog not showing on top of export dialog',
};

export const releaseWithoutDescription: Release = {
  name: '5.0.0-beta60',
  publishedAt: '2019-01-07T23:32:41Z',
  url: 'https://github.com/4ian/GDevelop/releases/tag/v5.0.0-beta60',
  description: null,
};

export const erroredCordovaBuild: Build = {
  id: 'errored-build-id',
  status: 'error',
  logsKey: '/fake-error.log',
  createdAt: 1515084391000,
  updatedAt: 1515084399000,
  userId: 'fake-user-id',
  type: 'cordova-build',
};

export const pendingCordovaBuild: Build = {
  id: 'pending-build-id',
  status: 'pending',
  createdAt: 1515084391000,
  updatedAt: 1515084399000,
  userId: 'fake-user-id',
  type: 'cordova-build',
};

export const pendingElectronBuild: Build = {
  id: 'pending-build-id',
  status: 'pending',
  createdAt: 1515084391000,
  updatedAt: 1515084399000,
  userId: 'fake-user-id',
  type: 'electron-build',
};

export const completeCordovaBuild: Build = {
  id: 'complete-build-id',
  createdAt: 1515084391000,
  userId: 'fake-user-id',
  type: 'cordova-build',
  status: 'complete',
  logsKey: '/fake-error.log',
  apkKey: '/fake-game.apk',
  updatedAt: Date.now(),
};

export const completeElectronBuild: Build = {
  id: 'complete-build-id',
  createdAt: 1515084391000,
  userId: 'fake-user-id',
  type: 'electron-build',
  status: 'complete',
  logsKey: '/fake-error.log',
  windowsExeKey: '/fake-windows-game.exe',
  windowsZipKey: '/fake-windows-game.zip',
  macosZipKey: '/fake-macos-game.zip',
  linuxAppImageKey: '/fake-linux-game.AppImage',
  updatedAt: Date.now(),
};

export const completeWebBuild: Build = {
  id: 'complete-build-id',
  createdAt: 1515084391000,
  userId: 'fake-user-id',
  type: 'web-build',
  status: 'complete',
  logsKey: '/fake-error.log',
  s3Key: 'game-12345',
  updatedAt: Date.now(),
};

const spaceshipSerializedObject = {
  name: 'PlayerSpaceship',
  tags: '',
  type: 'Sprite',
  updateIfNotVisible: false,
  variables: [
    {
      name: 'State',
      value: 'Spaceship',
    },
  ],
  behaviors: [],
  animations: [
    {
      name: 'SpaceshipIdle',
      useMultipleDirections: false,
      directions: [
        {
          looping: true,
          timeBetweenFrames: 0.08,
          sprites: [
            {
              hasCustomCollisionMask: false,
              image: 'player-ship1.png',
              points: [],
              originPoint: {
                name: 'origine',
                x: 0,
                y: 0,
              },
              centerPoint: {
                automatic: true,
                name: 'centre',
                x: 0,
                y: 0,
              },
              customCollisionMask: [],
            },
            {
              hasCustomCollisionMask: false,
              image: 'player-ship2.png',
              points: [],
              originPoint: {
                name: 'origine',
                x: 0,
                y: 0,
              },
              centerPoint: {
                automatic: true,
                name: 'centre',
                x: 0,
                y: 0,
              },
              customCollisionMask: [],
            },
          ],
        },
      ],
    },
  ],
};

const spaceshipSerializedResources = [
  {
    alwaysLoaded: false,
    file: 'https://example.com/player-ship1.png',
    origin: {
      name: 'gdevelop-asset-store',
      identifier: 'https://example.com/player-ship1.png',
    },
    kind: 'image',
    metadata: '',
    name: 'player-ship1.png',
    smoothed: false,
    userAdded: false,
  },
  {
    alwaysLoaded: false,
    file: 'https://example.com/player-ship2.png',
    origin: {
      name: 'gdevelop-asset-store',
      identifier: 'https://example.com/player-ship2.png',
    },
    kind: 'image',
    metadata: '',
    name: 'player-ship2.png',
    smoothed: false,
    userAdded: false,
  },
];

export const fakeAsset1: Asset = {
  id: '123',
  name: 'My spaceship',
  shortDescription:
    'A spaceship that can be moved with the keyboard or by touching the screen',
  description: "A very nice way to start a shoot'em up.",
  previewImageUrls: ['res/GD-logo.png'],
  gdevelopVersion: '5.0.0-beta100',
  version: '1.0.0',
  authors: ['test author'],
  license: 'MIT',
  tags: ['space shooter', 'tag2'],
  objectAssets: [
    {
      object: spaceshipSerializedObject,
      resources: spaceshipSerializedResources,
      customization: [],
    },
  ],
};

export const fakeAssetWithBehaviorCustomizations1: Asset = {
  id: '123',
  name: 'My spaceship',
  shortDescription:
    'A spaceship that can be moved with the keyboard or by touching the screen',
  description: "A very nice way to start a shoot'em up.",
  previewImageUrls: ['res/GD-logo.png'],
  gdevelopVersion: '5.0.0-beta100',
  version: '1.0.0',
  authors: ['test author'],
  license: 'MIT',
  tags: ['space shooter', 'tag2'],
  objectAssets: [
    {
      object: spaceshipSerializedObject,
      resources: spaceshipSerializedResources,
      customization: [
        {
          behaviorName: 'MyBehavior',
          behaviorType: 'FakeBehavior::FakeBehavior',
          required: true,
          extensionName: 'FakeBehavior',
          extensionVersion: '1.0.0',
          properties: [
            {
              codeOnly: false,
              description: 'Example of a parameter',
              longDescription: '',
              supplementaryInformation: '',
              optional: false,
              type: 'string',
              name: 'property1',
              defaultValue: 'Overriden value',
            },
          ],
        },
      ],
    },
  ],
};

export const fakeAssetWithUnknownBehaviorCustomizations1: Asset = {
  id: '123',
  name: 'My spaceship',
  shortDescription:
    'A spaceship that can be moved with the keyboard or by touching the screen',
  description: "A very nice way to start a shoot'em up.",
  previewImageUrls: ['res/GD-logo.png'],
  gdevelopVersion: '5.0.0-beta100',
  version: '1.0.0',
  authors: ['test author'],
  license: 'MIT',
  tags: ['space shooter', 'tag2'],
  objectAssets: [
    {
      object: spaceshipSerializedObject,
      resources: spaceshipSerializedResources,
      customization: [
        {
          behaviorName: 'MyUnknownBehavior',
          behaviorType: 'UnknownBehavior::UnknownBehavior',
          required: true,
          extensionName: 'UnknownBehavior',
          extensionVersion: '1.0.0',
          properties: [],
        },
      ],
    },
  ],
};

export const fakeAssetWithFlashBehaviorCustomizations1: Asset = {
  id: '123',
  name: 'My spaceship',
  shortDescription:
    'A spaceship that can be moved with the keyboard or by touching the screen',
  description: "A very nice way to start a shoot'em up.",
  previewImageUrls: ['res/GD-logo.png'],
  gdevelopVersion: '5.0.0-beta100',
  version: '1.0.0',
  authors: ['test author'],
  license: 'MIT',
  tags: ['space shooter', 'tag2'],
  objectAssets: [
    {
      object: spaceshipSerializedObject,
      resources: spaceshipSerializedResources,
      customization: [
        {
          behaviorName: 'MyFlashBehavior',
          behaviorType: 'Flash::Flash',
          required: true,
          extensionName: 'Flash',
          extensionVersion: '1.0.0',
          properties: [],
        },
      ],
    },
  ],
};

export const fakeAssetWithEventCustomizationsAndFlashExtension1: Asset = {
  id: '123',
  name: 'My spaceship',
  shortDescription:
    'A spaceship that can be moved with the keyboard or by touching the screen',
  description: "A very nice way to start a shoot'em up.",
  previewImageUrls: ['res/GD-logo.png'],
  gdevelopVersion: '5.0.0-beta100',
  authors: ['test author'],
  license: 'MIT',
  version: '1.0.0',
  tags: ['space shooter', 'tag2'],
  objectAssets: [
    {
      object: spaceshipSerializedObject,
      resources: spaceshipSerializedResources,
      customization: [
        {
          required: true,
          extensions: [
            {
              extensionName: 'Flash', // Not really used in events, just for tests.
              extensionVersion: '1.0.0',
            },
          ],
          events: [
            {
              disabled: false,
              folded: false,
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [
                {
                  type: { inverted: false, value: 'VarScene' },
                  parameters: [
                    'Counter',
                    '<',
                    'TEXT_TO_REPLACE + PlayerSpaceship.Variable(test)',
                  ],
                  subInstructions: [],
                },
              ],
              actions: [
                {
                  type: { inverted: false, value: 'ModVarScene' },
                  parameters: [
                    'Counter',
                    '=',
                    'TEXT_TO_REPLACE + PlayerSpaceship.Variable(test2)',
                  ],
                  subInstructions: [],
                },
              ],
              events: [],
            },
          ],
          parameters: [
            {
              codeOnly: false,
              description: 'Example of a parameter',
              longDescription: '',
              supplementaryInformation: '',
              optional: false,
              type: 'string',
              name: 'TEXT_TO_REPLACE',
              defaultValue: '3',
            },
          ],
        },
      ],
    },
  ],
};

export const fakeAssetWithEventCustomizationsAndUnknownExtension1: Asset = {
  id: '123',
  name: 'My spaceship',
  shortDescription:
    'A spaceship that can be moved with the keyboard or by touching the screen',
  description: "A very nice way to start a shoot'em up.",
  previewImageUrls: ['res/GD-logo.png'],
  gdevelopVersion: '5.0.0-beta100',
  authors: ['test author'],
  license: 'MIT',
  version: '1.0.0',
  tags: ['space shooter', 'tag2'],
  objectAssets: [
    {
      object: spaceshipSerializedObject,
      resources: spaceshipSerializedResources,
      customization: [
        {
          required: true,
          extensions: [
            {
              extensionName: 'UnknownExtension', // Not really used in events, just for tests.
              extensionVersion: '1.0.0',
            },
          ],
          events: [
            {
              disabled: false,
              folded: false,
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [],
              events: [],
            },
          ],
          parameters: [
            {
              codeOnly: false,
              description: 'Example of a parameter',
              longDescription: '',
              supplementaryInformation: '',
              optional: false,
              type: 'string',
              name: 'EXAMPLE_PARAMETER',
              defaultValue: 'Hello World',
            },
          ],
        },
      ],
    },
  ],
};

export const fakeAssetShortHeader1: AssetShortHeader = {
  id: '123',
  name: 'My spaceship',
  shortDescription:
    'A spaceship that can be moved with the keyboard or by touching the screen',
  previewImageUrls: ['res/GD-logo.png'],
  tags: ['space shooter', 'tag2'],
};

export const fakeAssetShortHeader2: AssetShortHeader = {
  id: '456',
  name: 'Zombie',
  shortDescription: 'A zombie attacking the player and wandering around.',
  previewImageUrls: ['res/GD-logo.png'],
  tags: ['survival', 'tag2'],
};

export const fakeAssetShortHeader3: AssetShortHeader = {
  id: '789',
  name: 'Sword',
  shortDescription: 'A small sword.',
  previewImageUrls: ['res/GD-logo.png'],
  tags: ['medieval', 'tag2'],
};

export const fireBulletExtensionShortHeader: ExtensionShortHeader = {
  shortDescription:
    'Allow the object to fire bullets, with customizable speed, angle and fire rate.',
  extensionNamespace: '',
  fullName: 'Fire bullets',
  name: 'FireBullet',
  version: '0.0.2',
  url: 'Extensions/FireBullet.json',
  headerUrl: 'Extensions/FireBullet-header.json',
  tags: ['fire', 'bullets', 'spawn', 'firerate'],
  previewIconUrl: 'http://example.com/icon.svg',
  eventsBasedBehaviorsCount: 1,
  eventsFunctionsCount: 0,
};

export const flashExtensionShortHeader: ExtensionShortHeader = {
  shortDescription:
    'Make the object flash (blink) for a period of time, so that it is alternately visible and invisible.\nTrigger the effect by using the Flash action.',
  extensionNamespace: '',
  fullName: 'Flash (blink)',
  name: 'Flash',
  version: '1.0.0',
  url: 'Extensions/Flash.json',
  headerUrl: 'Extensions/Flash-header.json',
  tags: ['flash', 'blink', 'visible', 'invisible', 'hit', 'damage'],
  previewIconUrl: 'http://example.com/icon.svg',
  eventsBasedBehaviorsCount: 1,
  eventsFunctionsCount: 0,
};

export const game1: Game = {
  id: 'fake-game1-id',
  authorName: 'My company',
  gameName: 'My Great Game',
  createdAt: 1606065498,
};

export const game2: Game = {
  id: 'fake-game2-id',
  authorName: 'My company',
  gameName: 'My Other Game',
  createdAt: 1607065498,
};

export const gameRollingMetrics1: GameMetrics = {
  date: '2020-10-01',

  sessions: {
    d0Sessions: 350,
  },
  players: {
    d0Players: 200,
    d0NewPlayers: 220,
  },
  retention: {
    d1RetainedPlayers: 193,
    d2RetainedPlayers: 153,
    d3RetainedPlayers: 121,
    d4RetainedPlayers: 83,
    d5RetainedPlayers: 74,
    d6RetainedPlayers: 73,
    d7RetainedPlayers: 67,
  },
};
export const gameRollingMetricsWithoutPlayersAndRetention1: GameMetrics = {
  date: '2020-10-01',

  sessions: {
    d0Sessions: 350,
  },
  players: null,
  retention: null,
};

export const showcasedGame1: ShowcasedGame = {
  title: "Lil BUB's HELLO EARTH",
  author: "Lil BUB's Team",
  description:
    'BUB is a very special, one of a kind critter. More specifically, she is the [most amazing cat on the planet](http://lilbub.com)... and her game is made with GDevelop!\n\nThe game is a retro 8-bit game, with beautiful arts and soundtrack, which alternates between platformers levels, with hidden secrets, and shooter levels with bosses, multiple enemies and bonuses.',
  tags: [
    'Action',
    'Platform',
    'Shooter',
    'Adventure',
    'Android',
    'iOS',
    'Windows',
    'macOS',
    'Linux',
  ],
  genres: ['Action', 'Platform', 'Shooter', 'Adventure'],
  platforms: ['Android', 'iOS', 'Windows', 'macOS', 'Linux'],
  imageUrls: [
    'https://resources.gdevelop-app.com/games-showcase/images/18JKXDTWljabX3O09SW2VKYOThZkIf1jG',
  ],
  links: [
    {
      url:
        'https://itunes.apple.com/us/app/lil-bubs-hello-earth/id1123383033?mt=8',
      type: 'app-store',
    },
    {
      url: 'https://play.google.com/store/apps/details?id=com.lilbub.game',
      type: 'play-store',
    },
    {
      url: 'http://compilgames.net/bub-landing-page',
      type: 'download-win-mac-linux',
    },
    { url: '/games/lil-bub-hello-earth', type: 'learn-more' },
  ],
  isFeatured: false,
  bannerUrl:
    'https://resources.gdevelop-app.com/games-showcase/images/bub-game-banner.jpg',
  bannerBackgroundPosition: '',
  thumbnailUrl:
    'https://resources.gdevelop-app.com/games-showcase/images/bub-animated-logo.gif',
  editorDescription: '',
};

export const exampleFromFutureVersion: ExampleShortHeader = {
  id: 'fake-id',
  name: 'Fake example',
  shortDescription: 'This is a fake example made in a future GDevelop version',
  license: 'MIT',
  tags: [],
  previewImageUrls: [],
  gdevelopVersion: '99.0.0',
};
