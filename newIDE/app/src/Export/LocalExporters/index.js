import * as React from 'react';
import LocalExport from './LocalExport';
import LocalS3Export from './LocalS3Export';
import LocalOnlineCordovaExport from './LocalOnlineCordovaExport';
import LocalCordovaExport from './LocalCordovaExport';
import LocalCocos2dExport from './LocalCocos2dExport';
import LocalOnlineElectronExport from './LocalOnlineElectronExport';
import LocalFacebookInstantGamesExport from './LocalFacebookInstantGamesExport';
import LocalElectronExport from './LocalElectronExport';
import PhoneIphone from 'material-ui/svg-icons/hardware/phone-iphone';
import LaptopMac from 'material-ui/svg-icons/hardware/laptop-mac';
import Folder from 'material-ui/svg-icons/file/folder';
import Facebook from '../../UI/CustomSvgIcons/Facebook';
import Cordova from '../../UI/CustomSvgIcons/Cordova';
import Chrome from '../../UI/CustomSvgIcons/Chrome';

export const getLocalExporters = () => [
  {
    name: 'Android (& iOS coming soon)',
    renderIcon: props => <PhoneIphone {...props} />,
    helpPage: '/publishing/android_and_ios',
    description:
      'Package your game for Android directly from GDevelop. iOS support is coming soon!',
    key: 'localonlinecordovaexport',
    ExportComponent: LocalOnlineCordovaExport,
  },
  {
    name: 'Facebook Instant Games',
    renderIcon: props => <Facebook {...props} />,
    helpPage: '/publishing/publishing-to-facebook-instant-games',
    description:
      'Package your game as a Facebook Instant Games that can be played on Facebook Messenger.',
    key: 'localfacebookinstantgames',
    ExportComponent: LocalFacebookInstantGamesExport,
  },
  {
    name: 'Web (upload online)',
    renderIcon: props => <Chrome {...props} />,
    helpPage: '/publishing/web',
    description:
      'Upload your game online directly from GDevelop and share the link to players. Play to your game using your browser on computers and mobile phones.',
    key: 'locals3export',
    ExportComponent: LocalS3Export,
  },
  {
    name: 'Local folder',
    renderIcon: props => <Folder {...props} />,
    helpPage: '/publishing/html5_game_in_a_local_folder',
    description:
      'Build the game locally as a HTML5 game. You can then export it on website like Itch.io or Kongregate.',
    key: 'localexport',
    ExportComponent: LocalExport,
    advanced: true,
  },
  {
    name: 'iOS & Android (manual)',
    renderIcon: props => <Cordova {...props} />,
    helpPage: '/publishing/android_and_ios_with_cordova',
    description:
      'Build the game locally as a Cordova project, and export it manually to iOS or Android with Cordova developers tools.',
    key: 'localcordovaexport',
    ExportComponent: LocalCordovaExport,
    advanced: true,
  },
  {
    name: 'Windows/macOS/Linux (beta)',
    renderIcon: props => <LaptopMac {...props} />,
    helpPage: '/publishing/windows-macos-linux',
    description:
      'Package your game as an app for Windows, macOS or Linux directly from GDevelop.',
    key: 'localonlineelectronexport',
    ExportComponent: LocalOnlineElectronExport,
  },
  {
    name: 'Windows/macOS/Linux (manual)',
    renderIcon: props => <LaptopMac {...props} />,
    helpPage: '/publishing/windows-macos-linux-with-electron',
    description:
      'Build the game locally and export it manually to Windows, macOS or Linux with third-party developer tools.',
    key: 'localelectronexport',
    ExportComponent: LocalElectronExport,
    advanced: true,
  },
  {
    name: 'Cocos2d-JS',
    renderIcon: props => <PhoneIphone {...props} />,
    helpPage: '/publishing/android_and_ios_with_cocos2d-js',
    description:
      'Export your game using Cocos2d-JS game engine. The game can be compiled for Android or iOS if you install Cocos2d-JS developer tools.',
    key: 'localcocos2dexport',
    ExportComponent: LocalCocos2dExport,
    experimental: true,
  },
];
