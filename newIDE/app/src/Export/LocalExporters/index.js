// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type Exporter } from '../ExportDialog';
import { localCordovaExportPipeline } from './LocalCordovaExport';
import { localElectronExportPipeline } from './LocalElectronExport';
import { localHTML5ExportPipeline } from './LocalHTML5Export';
import { localFacebookInstantGamesExportPipeline } from './LocalFacebookInstantGamesExport';
import { localOnlineCordovaExportPipeline } from './LocalOnlineCordovaExport.js';
import { localOnlineElectronExportPipeline } from './LocalOnlineElectronExport.js';
import { localOnlineWebExportPipeline } from './LocalOnlineWebExport';
import PhoneIphone from '@material-ui/icons/PhoneIphone';
import LaptopMac from '@material-ui/icons/LaptopMac';
import Folder from '@material-ui/icons/Folder';
import Facebook from '../../UI/CustomSvgIcons/Facebook';
import Cordova from '../../UI/CustomSvgIcons/Cordova';
import Chrome from '../../UI/CustomSvgIcons/Chrome';

export const getLocalExporters = (): Array<Exporter> => [
  {
    name: <Trans>Android (&amp; iOS coming soon)</Trans>,
    renderIcon: props => <PhoneIphone {...props} />,
    helpPage: '/publishing/android_and_ios',
    description: (
      <Trans>
        Package your game for Android directly from GDevelop. iOS support is
        coming soon!
      </Trans>
    ),
    key: 'localonlinecordovaexport',
    exportPipeline: localOnlineCordovaExportPipeline,
  },
  {
    name: <Trans>Web (upload online)</Trans>,
    renderIcon: props => <Chrome {...props} />,
    helpPage: '/publishing/web',
    description: (
      <Trans>
        Upload your game online directly from GDevelop and share the link to
        players. Play to your game using your browser on computers and mobile
        phones.
      </Trans>
    ),
    key: 'localonlinewebexport',
    exportPipeline: localOnlineWebExportPipeline,
  },
  {
    name: <Trans>Local folder</Trans>,
    renderIcon: props => <Folder {...props} />,
    helpPage: '/publishing/html5_game_in_a_local_folder',
    description: (
      <Trans>
        Build the game locally as a HTML5 game. You can then publish it on
        website like Poki, CrazyGames, Game Jolt, itch.io, Newsground...
      </Trans>
    ),
    key: 'localexport',
    exportPipeline: localHTML5ExportPipeline,
    advanced: true,
  },
  {
    name: <Trans>Facebook Instant Games</Trans>,
    renderIcon: props => <Facebook {...props} />,
    helpPage: '/publishing/publishing-to-facebook-instant-games',
    description: (
      <Trans>
        Package your game as a Facebook Instant Games that can be played on
        Facebook Messenger.
      </Trans>
    ),
    key: 'localfacebookinstantgames',
    exportPipeline: localFacebookInstantGamesExportPipeline,
    advanced: true,
  },
  {
    name: <Trans>iOS &amp; Android (manual)</Trans>,
    renderIcon: props => <Cordova {...props} />,
    helpPage: '/publishing/android_and_ios_with_cordova',
    description: (
      <Trans>
        Build the game locally as a Cordova project, and export it manually to
        iOS or Android with Cordova developers tools.
      </Trans>
    ),
    key: 'localcordovaexport',
    exportPipeline: localCordovaExportPipeline,
    advanced: true,
  },
  {
    name: <Trans>Windows/macOS/Linux</Trans>,
    renderIcon: props => <LaptopMac {...props} />,
    helpPage: '/publishing/windows-macos-linux',
    description: (
      <Trans>
        Package your game as an app for Windows, macOS or Linux directly from
        GDevelop.
      </Trans>
    ),
    key: 'localonlineelectronexport',
    exportPipeline: localOnlineElectronExportPipeline,
  },
  {
    name: <Trans>Windows/macOS/Linux (manual)</Trans>,
    renderIcon: props => <LaptopMac {...props} />,
    helpPage: '/publishing/windows-macos-linux-with-electron',
    description: (
      <Trans>
        Build the game locally and export it manually to Windows, macOS or Linux
        with third-party developer tools.
      </Trans>
    ),
    key: 'localelectronexport',
    exportPipeline: localElectronExportPipeline,
    advanced: true,
  },
];
