// @flow
import {
  type Usages,
  type Subscription,
  type Limits,
} from '../../Utils/GDevelopServices/Usage';
import { User as FirebaseUser } from 'firebase/auth';
import { type Profile } from '../../Utils/GDevelopServices/Authentication';
import { type Release } from '../../Utils/GDevelopServices/Release';
import { type Build } from '../../Utils/GDevelopServices/Build';
import { type CloudProjectWithUserAccessInfo } from '../../Utils/GDevelopServices/Project';
import {
  type ExtensionShortHeader,
  type ExtensionHeader,
} from '../../Utils/GDevelopServices/Extension';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import {
  type Game,
  type ShowcasedGame,
} from '../../Utils/GDevelopServices/Game';
import { type GameMetrics } from '../../Utils/GDevelopServices/Analytics';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import {
  type AssetShortHeader,
  type Asset,
  type PublicAssetPacks,
} from '../../Utils/GDevelopServices/Asset';
import { formatISO, subDays } from 'date-fns';
import { type Comment } from '../../Utils/GDevelopServices/Play';
import { type Announcement } from '../../Utils/GDevelopServices/Announcement';

export const indieFirebaseUser: FirebaseUser = {
  uid: 'indie-user',
  providerId: 'fake-provider.com',
  email: 'indie-user@example.com',
  emailVerified: false,
};

export const indieVerifiedFirebaseUser: FirebaseUser = {
  uid: 'indie-user',
  providerId: 'fake-provider.com',
  email: 'indie-user@example.com',
  emailVerified: true,
};

export const cloudProjectsForIndieUser: Array<CloudProjectWithUserAccessInfo> = [
  {
    id: 'af7a8282-746d-4d3a-8cb8-bb8cd9372143',
    name: 'Worms 2D',
    createdAt: '2022-02-05T00:36:53.972Z',
    lastModifiedAt: '2022-02-07T00:36:53.972Z',
  },
  {
    id: 'fb4d878a-1935-4916-b681-f9235475d35c',
    name: 'Crash Bandicoot',
    createdAt: '2020-01-24T00:36:53.972Z',
    lastModifiedAt: '2020-02-06T00:36:53.972Z',
  },
];

export const indieUserProfile: Profile = {
  id: 'indie-user',
  email: 'indie-user@example.com',
  username: 'im-the-indie-user',
  description: 'Just here to develop indie games',
  getGameStatsEmail: false,
  getNewsletterEmail: true,
  isCreator: true,
  isPlayer: false,
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
  capabilities: {
    analytics: {
      sessions: true,
      players: true,
      retention: true,
      sessionsTimeStats: true,
      platforms: true,
    },
    cloudProjects: {
      maximumCount: 50,
      canMaximumCountBeIncreased: true,
    },
  },
  limits: {
    'cordova-build': {
      current: 2,
      max: 10,
      limitReached: false,
    },
  },
  message: undefined,
};

export const limitsForProUser: Limits = {
  capabilities: {
    analytics: {
      sessions: true,
      players: true,
      retention: true,
      sessionsTimeStats: true,
      platforms: true,
    },
    cloudProjects: {
      maximumCount: 100,
      canMaximumCountBeIncreased: false,
    },
  },
  limits: {
    'cordova-build': {
      current: 2,
      max: 70,
      limitReached: false,
    },
  },
  message: undefined,
};

export const limitsReached: Limits = {
  capabilities: {
    analytics: {
      sessions: true,
      players: true,
      retention: true,
      sessionsTimeStats: true,
      platforms: true,
    },
    cloudProjects: {
      maximumCount: 10,
      canMaximumCountBeIncreased: false,
    },
  },
  limits: {
    'cordova-build': {
      current: 10,
      max: 10,
      limitReached: true,
    },
  },
  message: undefined,
};

export const fakeIndieAuthenticatedUser: AuthenticatedUser = {
  authenticated: true,
  profile: indieUserProfile,
  loginState: 'done',
  badges: null,
  cloudProjects: null,
  firebaseUser: indieFirebaseUser,
  subscription: subscriptionForIndieUser,
  usages: usagesForIndieUser,
  limits: limitsForIndieUser,
  receivedAssetPacks: [],
  receivedAssetShortHeaders: [],
  onLogout: () => {},
  onLogin: () => {},
  onEdit: () => {},
  onChangeEmail: () => {},
  onCreateAccount: () => {},
  onBadgesChanged: async () => {},
  onCloudProjectsChanged: async () => {},
  onRefreshUserProfile: async () => {
    console.info('This should refresh the user profile');
  },
  onRefreshFirebaseProfile: async () => {
    console.info('This should refresh the firebase profile');
  },
  onSendEmailVerification: async () => {
    console.info('This should send the email verification');
  },
  onAcceptGameStatsEmail: async () => {
    console.info('This should accept receiving game stats email');
  },
  getAuthorizationHeader: () => Promise.resolve('fake-authorization-header'),
};

export const fakeNoSubscriptionAuthenticatedUser: AuthenticatedUser = {
  authenticated: true,
  profile: indieUserProfile,
  loginState: 'done',
  badges: null,
  cloudProjects: cloudProjectsForIndieUser,
  firebaseUser: indieFirebaseUser,
  subscription: noSubscription,
  usages: usagesForIndieUser,
  limits: limitsForIndieUser,
  receivedAssetPacks: [],
  receivedAssetShortHeaders: [],
  onLogout: () => {},
  onLogin: () => {},
  onEdit: () => {},
  onChangeEmail: () => {},
  onCreateAccount: () => {},
  onBadgesChanged: async () => {},
  onCloudProjectsChanged: async () => {},
  onRefreshUserProfile: async () => {
    console.info('This should refresh the user profile');
  },
  onRefreshFirebaseProfile: async () => {
    console.info('This should refresh the firebase profile');
  },
  onSendEmailVerification: async () => {
    console.info('This should send the email verification');
  },
  onAcceptGameStatsEmail: async () => {
    console.info('This should accept receiving game stats email');
  },
  getAuthorizationHeader: () => Promise.resolve('fake-authorization-header'),
};

export const fakeAuthenticatedAndEmailVerifiedUser: AuthenticatedUser = {
  authenticated: true,
  profile: indieUserProfile,
  loginState: 'done',
  badges: null,
  cloudProjects: cloudProjectsForIndieUser,
  firebaseUser: indieVerifiedFirebaseUser,
  subscription: noSubscription,
  usages: usagesForIndieUser,
  limits: limitsForIndieUser,
  receivedAssetPacks: [],
  receivedAssetShortHeaders: [],
  onLogout: () => {},
  onLogin: () => {},
  onEdit: () => {},
  onChangeEmail: () => {},
  onCreateAccount: () => {},
  onBadgesChanged: async () => {},
  onCloudProjectsChanged: async () => {},
  onRefreshUserProfile: async () => {
    console.info('This should refresh the user profile');
  },
  onRefreshFirebaseProfile: async () => {
    console.info('This should refresh the firebase profile');
  },
  onSendEmailVerification: async () => {
    console.info('This should send the email verification');
  },
  onAcceptGameStatsEmail: async () => {
    console.info('This should accept receiving game stats email');
  },
  getAuthorizationHeader: () => Promise.resolve('fake-authorization-header'),
};

export const fakeAuthenticatedButLoadingAuthenticatedUser: AuthenticatedUser = {
  authenticated: true,
  profile: null,
  loginState: 'loggingIn',
  badges: null,
  cloudProjects: null,
  firebaseUser: null,
  subscription: null,
  usages: null,
  limits: null,
  receivedAssetPacks: [],
  receivedAssetShortHeaders: [],
  onLogout: () => {},
  onLogin: () => {},
  onEdit: () => {},
  onChangeEmail: () => {},
  onCreateAccount: () => {},
  onBadgesChanged: async () => {},
  onCloudProjectsChanged: async () => {},
  onRefreshUserProfile: async () => {
    console.info('This should refresh the user profile');
  },
  onRefreshFirebaseProfile: async () => {
    console.info('This should refresh the firebase profile');
  },
  onSendEmailVerification: async () => {
    console.info('This should send the email verification');
  },
  onAcceptGameStatsEmail: async () => {
    console.info('This should accept receiving game stats email');
  },
  getAuthorizationHeader: () => Promise.resolve('fake-authorization-header'),
};

export const fakeNotAuthenticatedAuthenticatedUser: AuthenticatedUser = {
  authenticated: false,
  profile: null,
  loginState: 'done',
  badges: null,
  cloudProjects: null,
  firebaseUser: null,
  subscription: null,
  usages: null,
  limits: null,
  receivedAssetPacks: [],
  receivedAssetShortHeaders: [],
  onLogout: () => {},
  onLogin: () => {},
  onEdit: () => {},
  onChangeEmail: () => {},
  onCreateAccount: () => {},
  onBadgesChanged: async () => {},
  onCloudProjectsChanged: async () => {},
  onRefreshUserProfile: async () => {
    console.info('This should refresh the user profile');
  },
  onRefreshFirebaseProfile: async () => {
    console.info('This should refresh the firebase profile');
  },
  onSendEmailVerification: async () => {
    console.info('This should send the email verification');
  },
  onAcceptGameStatsEmail: async () => {
    console.info('This should accept receiving game stats email');
  },
  getAuthorizationHeader: () => Promise.resolve('fake-authorization-header'),
};

export const release: Release = {
  name: '5.0.0-beta62',
  publishedAt: '2019-01-14T23:32:41Z',
  url: 'https://github.com/4ian/GDevelop/releases/tag/v5.0.0-beta62',
  description:
    '> 💌Before listing the new features/improvements/bug fixes, a huge thanks to the contributors that allowed this new version to be what it is: @blurymind, @Bouh, @Lizard-13, @Wend1go, @zatsme 👏 GDevelop is growing thanks to you!\r\n\r\n## ✨New features\r\n\r\n* **Functions** are now "out of alpha testing" and always shown in the project manager. Functions are a powerful way to create new conditions, actions and expression using events. This allow to make your events and the logic of your game easier to understand and create. This also allow you to share common functions between games and create advanced features that are easy to use. [Learn more about functions on the wiki](https://wiki.gdevelop.io/gdevelop5/events/functions)\r\n* A brand new Physics engine: **Physics Engine 2.0**. (Thanks @Lizard-13 for creating it, testing it, improving it and creating examples and tests, and @zatsme for various update and examples!). While still based on the same internal physics engine, it is much more complete and powerful than the previous one:\r\n  * Support for a lot of joints (revolute, gear, mouse, prismatic, rope, pulley, wheel and more!)\r\n  * Support more options for bodies\r\n  * Support more shape and even custom polygons for objects.\r\n  * Look at the updated and **new examples** to learn how to use it and to see what\'s possible!\r\n\r\n  > Your existing games will continue to work with the old physics engine. You can still continue to use it. For new games, prefer to use the new Physics Engine 2.0. In your existing game, you can also replace *the behavior of all of your objects* by the new behavior, and replace *all the conditions and actions* by the conditions and actions from the new engine.\r\n* New **Screenshot** action, to take in-game screenshot for games running on Windows/macOS/Linux. (thanks @Wend1go!)\r\n  * This also come with new expressions to access to the **file system paths**, useful to save the screenshots in a folder of the user.\r\n\r\n## 💝 Improvements\r\n\r\n* Display missing files in resource editor as red (thanks @blurymind!)\r\n* Add option to set scale mode ("sampling") of the game to nearest (for "pixel perfect" or 8bit games) in the game properties.\r\n* Usability: autoclose project manager when opening an editor (thanks @blurymind!)\r\n* Add button to choose a new file for a resource in the resource editor (thanks @blurymind!)\r\n* New "Pixel perfect platform engine" example.\r\n* Usability: add shortcut to open Project Manager and focus search field when opening it.\r\n* Updated "Isometric Game" starter game to have better collision handling and mobile support.\r\n* Add GetAngle/GetXVelocity and GetYVelocity expressions to top-down movement behavior.\r\n* Extensions written in JavaScript can now be used to create new type of objects.\r\n* Usability: icons in the list of instructions or expressions are now displayed.\r\n\r\n## 🐛 Bug fixes \r\n\r\n* Update **Facebook Instant Games export** to have the now required bundle file (fbapp-config.json).\r\n* Fix the sentence in the events sheet of a Facebook Instant Games action. (thanks @Bouh!)\r\n* Fix descriptions of Storage actions to make clear that no "real" files are written.\r\n* Fix Left Shift key\r\n* Fix middle mouse button (thanks @Bouh!)\r\n* Fix visual artifacts when rendering rescaled games\r\n* Fix platform engine 1-pixel offset bug\r\n* Fix initial opacity undefined for text objects (thanks @Lizard-13)\r\n* Fix the condition checking if the cursor is on an object (thanks @Lizard-13)\r\n* Avoid crash of the debugger with Particle Emitters\r\n* Add explicit "OK" button in message box to fix issue on Linux\r\n* Usability: hide object drop-down list after an object is selected\r\n* Fix login dialog not showing on top of export dialog',
};

export const releaseWithBreakingChange: Release = {
  name: '5.0.0-beta60',
  publishedAt: '2019-01-07T23:32:41Z',
  url: 'https://github.com/4ian/GDevelop/releases/tag/v5.0.0-beta60',
  description:
    '> ⚠️ Blabla, beware there is a breaking change!!!\r\n\r\n## ✨New features\r\n\r\n* **Functions** are now "out of alpha testing" and always shown in the project manager. Functions are a powerful way to create new conditions, actions and expression using events. This allow to make your events and the logic of your game easier to understand and create. This also allow you to share common functions between games and create advanced features that are easy to use. [Learn more about functions on the wiki](https://wiki.gdevelop.io/gdevelop5/events/functions)\r\n* A brand new Physics engine: **Physics Engine 2.0**. (Thanks @Lizard-13 for creating it, testing it, improving it and creating examples and tests, and @zatsme for various update and examples!). While still based on the same internal physics engine, it is much more complete and powerful than the previous one:\r\n  * Support for a lot of joints (revolute, gear, mouse, prismatic, rope, pulley, wheel and more!)\r\n  * Support more options for bodies\r\n  * Support more shape and even custom polygons for objects.\r\n  * Look at the updated and **new examples** to learn how to use it and to see what\'s possible!\r\n\r\n  > Your existing games will continue to work with the old physics engine. You can still continue to use it. For new games, prefer to use the new Physics Engine 2.0. In your existing game, you can also replace *the behavior of all of your objects* by the new behavior, and replace *all the conditions and actions* by the conditions and actions from the new engine.\r\n* New **Screenshot** action, to take in-game screenshot for games running on Windows/macOS/Linux. (thanks @Wend1go!)\r\n  * This also come with new expressions to access to the **file system paths**, useful to save the screenshots in a folder of the user.\r\n\r\n## 💝 Improvements\r\n\r\n* Display missing files in resource editor as red (thanks @blurymind!)\r\n* Add option to set scale mode ("sampling") of the game to nearest (for "pixel perfect" or 8bit games) in the game properties.\r\n* Usability: autoclose project manager when opening an editor (thanks @blurymind!)\r\n* Add button to choose a new file for a resource in the resource editor (thanks @blurymind!)\r\n* New "Pixel perfect platform engine" example.\r\n* Usability: add shortcut to open Project Manager and focus search field when opening it.\r\n* Updated "Isometric Game" starter game to have better collision handling and mobile support.\r\n* Add GetAngle/GetXVelocity and GetYVelocity expressions to top-down movement behavior.\r\n* Extensions written in JavaScript can now be used to create new type of objects.\r\n* Usability: icons in the list of instructions or expressions are now displayed.\r\n\r\n## 🐛 Bug fixes \r\n\r\n* Update **Facebook Instant Games export** to have the now required bundle file (fbapp-config.json).\r\n* Fix the sentence in the events sheet of a Facebook Instant Games action. (thanks @Bouh!)\r\n* Fix descriptions of Storage actions to make clear that no "real" files are written.\r\n* Fix Left Shift key\r\n* Fix middle mouse button (thanks @Bouh!)\r\n* Fix visual artifacts when rendering rescaled games\r\n* Fix platform engine 1-pixel offset bug\r\n* Fix initial opacity undefined for text objects (thanks @Lizard-13)\r\n* Fix the condition checking if the cursor is on an object (thanks @Lizard-13)\r\n* Avoid crash of the debugger with Particle Emitters\r\n* Add explicit "OK" button in message box to fix issue on Linux\r\n* Usability: hide object drop-down list after an object is selected\r\n* Fix login dialog not showing on top of export dialog',
};

export const releaseWithoutDescription: Release = {
  name: '5.0.0-beta60',
  publishedAt: '2019-01-07T23:32:41Z',
  url: 'https://github.com/4ian/GDevelop/releases/tag/v5.0.0-beta60',
  description: null,
};

export const erroredCordovaBuild: Build = {
  id: 'errored-build-id',
  gameId: 'errored-game-id',
  status: 'error',
  logsKey: '/fake-error.log',
  createdAt: 1515084391000,
  updatedAt: Date.now(),
  userId: 'fake-user-id',
  type: 'cordova-build',
};

export const pendingCordovaBuild: Build = {
  id: 'pending-build-id',
  gameId: 'pending-game-id',
  status: 'pending',
  createdAt: 1515084391000,
  updatedAt: Date.now(),
  userId: 'fake-user-id',
  type: 'cordova-build',
};

export const pendingElectronBuild: Build = {
  id: 'pending-build-id',
  gameId: 'pending-game-id',
  status: 'pending',
  createdAt: 1515084391000,
  updatedAt: Date.now(),
  userId: 'fake-user-id',
  type: 'electron-build',
};

export const completeCordovaBuild: Build = {
  id: 'complete-build-id',
  gameId: 'complete-game-id',
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
  gameId: 'complete-game-id',
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
  gameId: 'complete-game-id',
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
  animationsCount: 6,
  maxFramesCount: 6,
  height: 36,
  width: 36,
  objectType: 'sprite',
  gdevelopVersion: '5.0.0-beta100',
  version: '1.0.0',
  authors: ['test author'],
  license: 'MIT',
  tags: ['space shooter', 'tag2'],
  dominantColors: [255],
  objectAssets: [
    {
      object: spaceshipSerializedObject,
      resources: spaceshipSerializedResources,
      customization: [],
    },
  ],
};

export const fakePixelArtAsset1: Asset = {
  ...fakeAsset1,
  tags: ['space shooter', 'tag2', 'pixel art'],
};

export const fakeAssetWithBehaviorCustomizations1: Asset = {
  id: '123',
  name: 'My spaceship',
  shortDescription:
    'A spaceship that can be moved with the keyboard or by touching the screen',
  description: "A very nice way to start a shoot'em up.",
  previewImageUrls: ['res/GD-logo.png'],
  animationsCount: 6,
  maxFramesCount: 6,
  height: 36,
  width: 36,
  objectType: 'sprite',
  gdevelopVersion: '5.0.0-beta100',
  version: '1.0.0',
  authors: ['test author'],
  license: 'MIT',
  tags: ['space shooter', 'tag2'],
  dominantColors: [255],
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
  animationsCount: 6,
  maxFramesCount: 6,
  height: 36,
  width: 36,
  objectType: 'sprite',
  gdevelopVersion: '5.0.0-beta100',
  version: '1.0.0',
  authors: ['test author'],
  license: 'MIT',
  tags: ['space shooter', 'tag2'],
  dominantColors: [255],
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
  animationsCount: 6,
  maxFramesCount: 6,
  height: 36,
  width: 36,
  objectType: 'sprite',
  gdevelopVersion: '5.0.0-beta100',
  version: '1.0.0',
  authors: ['test author'],
  license: 'MIT',
  tags: ['space shooter', 'tag2'],
  dominantColors: [255],
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
  animationsCount: 6,
  maxFramesCount: 6,
  height: 36,
  width: 36,
  objectType: 'sprite',
  gdevelopVersion: '5.0.0-beta100',
  authors: ['test author'],
  license: 'MIT',
  version: '1.0.0',
  tags: ['space shooter', 'tag2'],
  dominantColors: [255],
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
  animationsCount: 6,
  maxFramesCount: 6,
  height: 36,
  width: 36,
  objectType: 'sprite',
  gdevelopVersion: '5.0.0-beta100',
  authors: ['test author'],
  license: 'MIT',
  version: '1.0.0',
  tags: ['space shooter', 'tag2'],
  dominantColors: [255],
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
  id: 'a4eb5460ffc062ece1f3ff45d24b07e40e9d4247d21602de70973049eb4f6ee5',
  license:
    'CC-BY 4.0 (Attribution to the artist is required, click for details)',
  animationsCount: 6,
  maxFramesCount: 6,
  height: 36,
  width: 36,
  name: 'Dino Doux',
  objectType: 'sprite',
  previewImageUrls: [
    'https://resources.gdevelop-app.com/assets/24x24 Dino Characters/Dino Doux_Crouch.png',
  ],
  shortDescription: 'with 6 animations',
  tags: [
    '24x24 dino characters',
    'side view',
    'pixel art',
    'character',
    'player',
    'enemy',
  ],
  dominantColors: [255],
};

export const fireBulletExtensionShortHeader: ExtensionShortHeader = {
  tier: 'reviewed',
  authorIds: [],
  shortDescription:
    'Allow the object to fire bullets, with customizable speed, angle and fire rate.',
  extensionNamespace: '',
  fullName: 'Fire bullets',
  name: 'FireBullet',
  version: '0.0.2',
  url: 'https://resources.gdevelop-app.com/extensions/FireBullet.json',
  headerUrl:
    'https://resources.gdevelop-app.com/extensions/FireBullet-header.json',
  tags: ['fire', 'bullets', 'spawn', 'firerate'],
  category: 'Movement',
  previewIconUrl: 'https://resources.gdevelop-app.com/assets/Icons/repeat.svg',
  eventsBasedBehaviorsCount: 1,
  eventsFunctionsCount: 0,
};

export const fireBulletExtensionHeader: ExtensionHeader = {
  ...fireBulletExtensionShortHeader,
  description:
    'This is a longer description explaining:\n* How to\n* Use the extension\n\nWith *some* **markdown** :)',
  helpPath: 'https://example.com',
  iconUrl: 'https://resources.gdevelop-app.com/assets/Icons/repeat.svg',
};

export const uncompatibleFireBulletExtensionShortHeader: ExtensionShortHeader = {
  ...fireBulletExtensionShortHeader,
  gdevelopVersion: '2000.0.0',
};

export const alreadyInstalledExtensionShortHeader: ExtensionShortHeader = {
  ...fireBulletExtensionShortHeader,
  name: 'SomeAlreadyInstalledExtension',
};

export const alreadyInstalledCommunityExtensionShortHeader: ExtensionShortHeader = {
  ...fireBulletExtensionShortHeader,
  tier: 'community',
  name: 'SomeAlreadyInstalledExtension',
};

export const flashExtensionShortHeader: ExtensionShortHeader = {
  tier: 'reviewed',
  authorIds: [],
  shortDescription:
    'Make the object flash (blink) for a period of time, so that it is alternately visible and invisible.\nTrigger the effect by using the Flash action.',
  extensionNamespace: '',
  fullName: 'Flash (blink)',
  name: 'Flash',
  version: '1.0.0',
  url: 'Extensions/Flash.json',
  headerUrl: 'Extensions/Flash-header.json',
  tags: ['flash', 'blink', 'visible', 'invisible', 'hit', 'damage'],
  category: 'Visual effect',
  previewIconUrl: 'https://resources.gdevelop-app.com/assets/Icons/repeat.svg',
  eventsBasedBehaviorsCount: 1,
  eventsFunctionsCount: 0,
};

export const communityTierExtensionShortHeader: ExtensionShortHeader = {
  tier: 'community',
  authorIds: [],
  shortDescription:
    'This is an example of an extension that is a community extension (not reviewed).',
  extensionNamespace: '',
  fullName: 'Fake Community extension',
  name: 'FakeCommunityExtension',
  version: '0.0.2',
  url:
    'https://resources.gdevelop-app.com/extensions/FakeCommunityExtension.json',
  headerUrl:
    'https://resources.gdevelop-app.com/extensions/FakeCommunityExtension-header.json',
  tags: ['fire', 'bullets', 'spawn', 'firerate'],
  category: '',
  previewIconUrl: 'https://resources.gdevelop-app.com/assets/Icons/repeat.svg',
  eventsBasedBehaviorsCount: 1,
  eventsFunctionsCount: 0,
};

export const communityTierExtensionHeader: ExtensionHeader = {
  ...communityTierExtensionShortHeader,
  description:
    'This is a longer description explaining:\n* How to\n* Use the extension\n\nWith *some* **markdown** :)',
  helpPath: 'https://example.com',
  iconUrl: 'https://resources.gdevelop-app.com/assets/Icons/repeat.svg',
};

export const game1: Game = {
  id: 'fake-game1-id',
  authorName: 'My company',
  gameName: 'My Great Game',
  createdAt: 1606065498,
  publicWebBuildId: 'fake-publicwebbuild-id',
  displayAdsOnGamePage: true,
};

export const game2: Game = {
  id: 'fake-game2-id',
  authorName: 'My company',
  gameName: 'My Other Game',
  createdAt: 1607065498,
};

export const gameWithDisplayAdsOnGamePageEnabled: Game = {
  ...game1,
  displayAdsOnGamePage: true,
};

export const gameWithDisplayAdsOnGamePageDisabled: Game = {
  ...game1,
  displayAdsOnGamePage: false,
};

/**
 * It uses the ANSI C one because Number.MAX_SAFE_INTEGER is 2^53
 * and this one multiply a seed of 2^15 with a multiplier of 2^32.
 * https://en.wikipedia.org/wiki/Linear_congruential_generator
 * The randomization is poor, but ok for placeholder values.
 */
class NumberGenerator {
  x: number;

  constructor(x = 1) {
    this.x = x % 2 ** 15;
  }

  /**
   * @returns a number inside [0 ; 1[.
   */
  getNextRandomNumber(): number {
    // Masks would more efficient but less readable.
    this.x = (1103515245 * this.x + 12345) % 2 ** 31 >> 16;
    return this.x / 2 ** 15;
  }
}

const interpolateWithNoise = (
  leftValue: number,
  rightValue: number,
  ratio: number,
  numberGenerator: NumberGenerator
) =>
  ((1 - ratio) * leftValue + ratio * rightValue) *
  (0.95 + 0.1 * numberGenerator.getNextRandomNumber());

const generateGameRollingMetricsFor364Days = () => {
  const numberGenerator = new NumberGenerator();
  const metrics = [];
  const count = 364;
  for (let index = 0; index < count; index++) {
    const ratio = 1 - index / count;
    const playersCount = Math.round(
      interpolateWithNoise(50, 250, ratio, numberGenerator)
    );
    metrics.push({
      date: formatISO(subDays(new Date(), index)),

      sessions: {
        d0Sessions: Math.round(
          interpolateWithNoise(80, 350, ratio, numberGenerator)
        ),
        d0SessionsDurationTotal: Math.round(
          interpolateWithNoise(15000, 175000, ratio, numberGenerator)
        ),
      },
      players: {
        d0Players: playersCount,
        d0NewPlayers: Math.round(
          interpolateWithNoise(80, 120, ratio, numberGenerator)
        ),
        d0PlayersBelow60s: Math.round(
          playersCount * interpolateWithNoise(0.8, 0.4, ratio, numberGenerator)
        ),
        d0PlayersBelow180s: Math.round(
          playersCount * interpolateWithNoise(0.9, 0.55, ratio, numberGenerator)
        ),
        d0PlayersBelow300s: Math.round(
          playersCount * interpolateWithNoise(0.95, 0.6, ratio, numberGenerator)
        ),
        d0PlayersBelow600s: Math.round(
          playersCount * interpolateWithNoise(0.98, 0.7, ratio, numberGenerator)
        ),
        d0PlayersBelow900s: Math.round(
          playersCount *
            Math.min(1, interpolateWithNoise(1, 0.9, ratio, numberGenerator))
        ),
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
    });
  }
  return metrics;
};

const deleteDurationMetrics = (
  gameMetrics: GameMetrics[],
  startDays: number
): GameMetrics[] => {
  for (let index = startDays; index < gameMetrics.length; index++) {
    const gameMetric = gameMetrics[index];
    const sessions = gameMetric.sessions;
    const players = gameMetric.players;
    if (sessions) {
      sessions.d0SessionsDurationTotal = undefined;
    }
    if (players) {
      players.d0PlayersBelow60s = undefined;
      players.d0PlayersBelow180s = undefined;
      players.d0PlayersBelow300s = undefined;
      players.d0PlayersBelow600s = undefined;
      players.d0PlayersBelow900s = undefined;
    }
  }
  return gameMetrics;
};

export const gameRollingMetricsFor364Days: GameMetrics[] = generateGameRollingMetricsFor364Days();
export const gameRollingMetricsWithUndefinedDurationMetrics: GameMetrics[] = deleteDurationMetrics(
  generateGameRollingMetricsFor364Days(),
  17
);
export const gameRollingMetricsWithOnly19Days: GameMetrics[] = gameRollingMetricsFor364Days.slice(
  0,
  19
);
export const gameRollingMetricsWithOnly1Day: GameMetrics[] = gameRollingMetricsFor364Days.slice(
  0,
  1
);
export const gameRollingMetricsWithHoles: GameMetrics[] = [
  4,
  12,
  13,
  25,
  33,
  107,
  108,
  109,
  110,
  230,
].map(index => gameRollingMetricsFor364Days[index]);
export const gameRollingMetricsWithoutPlayersAndRetention1: GameMetrics[] = [
  {
    date: '2020-10-01',

    sessions: {
      d0Sessions: 350,
      d0SessionsDurationTotal: 175000,
    },
    players: null,
    retention: null,
  },
];

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
  slug: 'fake-slug',
  name: 'Fake example',
  shortDescription: 'This is a fake example made in a future GDevelop version',
  license: 'MIT',
  tags: [],
  previewImageUrls: [],
  gdevelopVersion: '99.0.0',
};

export const geometryMonsterExampleShortHeader: ExampleShortHeader = {
  id: '2ff24efa0de9b1340d7e8c8aedb494af6b4db9a72c6a643303734755efb977df',
  name: 'Geometry monster',
  slug: 'geometry-monster',
  shortDescription:
    'A hyper casual endless game where you have to collect shapes and avoid bombs, with a progressively increasing difficulty.\n',
  license: 'MIT',
  previewImageUrls: [
    'https://resources.gdevelop-app.com/examples/geometry-monster/thumbnail.png',
  ],
  authorIds: [],
  tags: [
    'geometry-monster',
    '',
    'Advanced control features',
    'Audio',
    'Standard Conversions',
    'Builtin events',
    'Keyboard features',
    'Mathematical tools',
    'Mouse and touch',
    'Features for all objects',
    'Scene management features',
    'Time',
    'Variable features',
    'Particle system',
    'Sprite',
    'Text object',
    'Stay On Screen',
    'Sine (or ellipsis) Movement',
    'Flash (blink)',
    'Health (life points and damages for objects)',
  ],
  gdevelopVersion: '',
};

export const fakeAssetPacks: PublicAssetPacks = {
  starterPacks: [
    {
      name: 'GDevelop Platformer',
      tag: 'platformer',
      thumbnailUrl:
        'https://resources.gdevelop-app.com/assets/Packs/platformer.png',
      assetsCount: 16,
    },
    {
      name: 'Space Shooter',
      tag: 'space shooter',
      thumbnailUrl:
        'https://resources.gdevelop-app.com/assets/Packs/space shooter.png',
      assetsCount: 140,
    },
    {
      name: 'Tanks',
      tag: 'tank pack',
      thumbnailUrl:
        'https://resources.gdevelop-app.com/assets/Packs/tank pack.png',
      assetsCount: 32,
    },
    {
      name: 'Pixel Adventure',
      tag: 'pixel adventure pack',
      thumbnailUrl:
        'https://resources.gdevelop-app.com/assets/Packs/pixel adventure pack.png',
      assetsCount: 80,
    },
    {
      name: 'Fake Paid External',
      tag: 'pirate bomb pack',
      thumbnailUrl:
        'https://resources.gdevelop-app.com/assets/Packs/pirate bomb pack.png',
      assetsCount: 48,
      externalWebLink: 'https://example.com',
      userFriendlyPrice: '$4.99',
    },
    {
      name: 'Particles',
      tag: 'pixel effects pack',
      thumbnailUrl:
        'https://resources.gdevelop-app.com/assets/Packs/pixel effects pack.png',
      assetsCount: 20,
    },
    {
      name: 'Emotes',
      tag: 'emote',
      thumbnailUrl: 'https://resources.gdevelop-app.com/assets/Packs/emote.png',
      assetsCount: 176,
    },
    {
      name: 'Dinosaurus Characters',
      tag: '24x24 dino characters',
      thumbnailUrl:
        'https://resources.gdevelop-app.com/assets/Packs/24x24 dino characters.png',
      assetsCount: 5,
    },
    {
      name: 'Fake Paid Spinning Items',
      tag: '16x16 pixel art spinning items',
      thumbnailUrl:
        'https://resources.gdevelop-app.com/assets/Packs/16x16 pixel art spinning items.png',
      assetsCount: 30,
      userFriendlyPrice: '$4.99',
    },
    {
      name: 'RPG Items #2',
      tag: '16x16 pixel art rpg items',
      thumbnailUrl:
        'https://resources.gdevelop-app.com/assets/Packs/16x16 pixel art rpg items.png',
      assetsCount: 64,
    },
    {
      name: 'RPG Items',
      tag: '16x16 rpg item pack',
      thumbnailUrl:
        'https://resources.gdevelop-app.com/assets/Packs/16x16 rpg item pack.png',
      assetsCount: 144,
    },
    {
      name: 'Fantasy Icons',
      tag: '32x32 fantasy icons pack v2',
      thumbnailUrl:
        'https://resources.gdevelop-app.com/assets/Packs/32x32 fantasy icons pack v2.png',
      assetsCount: 285,
    },
    {
      name: 'On-Screen Controls',
      tag: 'on-screen controls',
      thumbnailUrl:
        'https://resources.gdevelop-app.com/assets/Packs/on-screen controls.png',
      assetsCount: 287,
    },
  ],
};

export const commentUnprocessed: Comment = {
  id: 'comment-unprocessed-id',
  type: 'FEEDBACK',
  gameId: 'complete-game-id',
  buildId: 'complete-build-id',
  text:
    "This is my honest feedback: I think the art is cute. Specially on the screen when it jumps over the chickens. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. ",
  ratings: {
    version: 1,
    visuals: 2,
    sound: 4,
    fun: 6,
    easeOfUse: 8,
  },
  playerName: 'playerName', // For non-authenticated comments.
  createdAt: 1515084391000,
  updatedAt: 1515084393000,
};

export const commentProcessed: Comment = {
  id: 'comment-processed-id',
  type: 'FEEDBACK',
  gameId: 'complete-game-id',
  buildId: 'complete-build-id',
  text:
    "This is my honest feedback: I think the art is cute. Specially on the screen when it jumps over the chickens. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. ",
  ratings: {
    version: 1,
    visuals: 2,
    sound: 4,
    fun: 6,
    easeOfUse: 8,
  },
  playerName: 'playerName', // For non-authenticated comments.
  createdAt: 1515084391000,
  updatedAt: 1515084393000,
  processedAt: 1515084393000,
};

export const fakeAnnouncements: Announcement[] = [
  {
    id: '123',
    type: 'info',
    level: 'normal',
    titleByLocale: {
      en: 'Some title',
    },
    markdownMessageByLocale: {
      en:
        'Something to announce which is really really cool [with a link](https://gdevelop.io) and *other* **markdown** ~~formatting~~!',
    },
  },
  {
    id: '124',
    type: 'info',
    level: 'urgent',
    titleByLocale: {
      en: 'Some title',
    },
    markdownMessageByLocale: {
      en:
        'Something nothing important but urgent to announce, with a button and [with a link](https://gdevelop.io) too.',
    },
    buttonLabelByLocale: { en: 'View' },
    buttonUrl: 'https://gdevelop.io',
  },
  {
    id: '125',
    type: 'warning',
    level: 'urgent',
    titleByLocale: {
      en: 'Some title',
    },
    markdownMessageByLocale: {
      en: 'Something important and urgent to announce.\n\n- With\n- a list',
    },
    buttonLabelByLocale: { en: 'View' },
    buttonUrl: 'https://gdevelop.io',
  },
  {
    id: '126',
    type: 'warning',
    level: 'normal',
    titleByLocale: {
      en: 'Some title',
    },
    markdownMessageByLocale: {
      en:
        'Something important but not urgent to announce, with a big image.\n\n![some image](https://raw.githubusercontent.com/4ian/GDevelop/master/newIDE/GDevelop%20banner.png)',
    },
    buttonLabelByLocale: { en: 'View' },
    buttonUrl: 'https://gdevelop.io',
  },
];
