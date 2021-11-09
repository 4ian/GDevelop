// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type Exporter } from '../ExportDialog';
import { browserOnlineCordovaExportPipeline } from './BrowserOnlineCordovaExport.js';
import { browserOnlineElectronExportPipeline } from './BrowserOnlineElectronExport.js';
import { browserOnlineWebExportPipeline } from './BrowserOnlineWebExport';
import { browserHTML5ExportPipeline } from './BrowserHTML5Export';
import { browserCordovaExportPipeline } from './BrowserCordovaExport';
import { browserElectronExportPipeline } from './BrowserElectronExport';
import { browserFacebookInstantGamesExportPipeline } from './BrowserFacebookInstantGamesExport';
import PhoneIphone from '@material-ui/icons/PhoneIphone';
import LaptopMac from '@material-ui/icons/LaptopMac';
import Folder from '@material-ui/icons/Folder';
import Facebook from '../../UI/CustomSvgIcons/Facebook';
import Cordova from '../../UI/CustomSvgIcons/Cordova';
import Chrome from '../../UI/CustomSvgIcons/Chrome';

export const getBrowserExporters = (): Array<Exporter> => [
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
    key: 'browseronlinecordovaexport',
    exportPipeline: browserOnlineCordovaExportPipeline,
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
    key: 'browsers3export',
    exportPipeline: browserOnlineWebExportPipeline,
  },
  {
    name: <Trans>HTML5 game (zip)</Trans>,
    renderIcon: props => <Folder {...props} />,
    helpPage: '/publishing/html5_game_in_a_local_folder',
    description: (
      <Trans>
        Build the game locally as a HTML5 game. You can then publish it on
        website like Poki, CrazyGames, Game Jolt, itch.io, Newsground...
      </Trans>
    ),
    key: 'browserhtml5export',
    exportPipeline: browserHTML5ExportPipeline,
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
    key: 'browserfacebookinstantgames',
    exportPipeline: browserFacebookInstantGamesExportPipeline,
    advanced: true,
  },
  {
    name: <Trans>iOS &amp; Android (manual)</Trans>,
    renderIcon: props => <Cordova {...props} />,
    helpPage: '/publishing/android_and_ios_with_cordova',
    description: (
      <Trans>
        Build the game locally as a Cordova project, and export it manually then
        to iOS or Android with Cordova developers tools.
      </Trans>
    ),
    key: 'browsercordovaexport',
    exportPipeline: browserCordovaExportPipeline,
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
    key: 'browseronlineelectronexport',
    exportPipeline: browserOnlineElectronExportPipeline,
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
    key: 'browserelectronexport',
    exportPipeline: browserElectronExportPipeline,
    advanced: true,
  },
];

/**
 * Open an URL generated from a blob, to download it with the specified filename.
 */
export const openBlobDownloadUrl = (url: string, filename: string) => {
  const { body } = document;
  if (!body) return;

  // Not using Window.openExternalURL because blob urls are blocked
  // by Adblock Plus (and maybe other ad blockers).
  const a = document.createElement('a');
  body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  a.click();
  body.removeChild(a);
};
