import * as React from 'react';
import { localExportPipeline } from './LocalExport';
import LocalS3Export from './LocalS3Export';
import { localOnlineCordovaExportPipeline } from './LocalOnlineCordovaExport.js';
import { localCordovaExportPipeline } from './LocalCordovaExport';
import { localCocos2dExportPipeline } from './LocalCocos2dExport';
import { localOnlineElectronExportPipeline } from './LocalOnlineElectronExport.js';
import { localFacebookInstantGamesExportPipeline } from './LocalFacebookInstantGamesExport';
import { localElectronExportPipeline } from './LocalElectronExport';
import PhoneIphone from '@material-ui/icons/PhoneIphone';
import LaptopMac from '@material-ui/icons/LaptopMac';
import Folder from '@material-ui/icons/Folder';
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
    exportPipeline: localOnlineCordovaExportPipeline,
  },
  {
    name: 'Facebook Instant Games',
    renderIcon: props => <Facebook {...props} />,
    helpPage: '/publishing/publishing-to-facebook-instant-games',
    description:
      'Package your game as a Facebook Instant Games that can be played on Facebook Messenger.',
    key: 'localfacebookinstantgames',
    exportPipeline: localFacebookInstantGamesExportPipeline,
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
    exportPipeline: localExportPipeline,
    advanced: true,
  },
  {
    name: 'iOS & Android (manual)',
    renderIcon: props => <Cordova {...props} />,
    helpPage: '/publishing/android_and_ios_with_cordova',
    description:
      'Build the game locally as a Cordova project, and export it manually to iOS or Android with Cordova developers tools.',
    key: 'localcordovaexport',
    exportPipeline: localCordovaExportPipeline,
    advanced: true,
  },
  {
    name: 'Windows/macOS/Linux (beta)',
    renderIcon: props => <LaptopMac {...props} />,
    helpPage: '/publishing/windows-macos-linux',
    description:
      'Package your game as an app for Windows, macOS or Linux directly from GDevelop.',
    key: 'localonlineelectronexport',
    exportPipeline: localOnlineElectronExportPipeline,
  },
  {
    name: 'Windows/macOS/Linux (manual)',
    renderIcon: props => <LaptopMac {...props} />,
    helpPage: '/publishing/windows-macos-linux-with-electron',
    description:
      'Build the game locally and export it manually to Windows, macOS or Linux with third-party developer tools.',
    key: 'localelectronexport',
    exportPipeline: localElectronExportPipeline,
    advanced: true,
  },
  {
    name: 'Cocos2d-JS',
    renderIcon: props => <PhoneIphone {...props} />,
    helpPage: '/publishing/android_and_ios_with_cocos2d-js',
    description:
      'Export your game using Cocos2d-JS game engine. The game can be compiled for Android or iOS if you install Cocos2d-JS developer tools.',
    key: 'localcocos2dexport',
    exportPipeline: localCocos2dExportPipeline,
    experimental: true,
  },
];
