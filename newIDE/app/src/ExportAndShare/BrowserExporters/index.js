// @flow
import { type Exporter } from '../ShareDialog';
import { browserOnlineCordovaExportPipeline } from './BrowserOnlineCordovaExport';
import { browserOnlineElectronExportPipeline } from './BrowserOnlineElectronExport';
import { browserOnlineWebExportPipeline } from './BrowserOnlineWebExport';
import { browserHTML5ExportPipeline } from './BrowserHTML5Export';
import { browserCordovaExportPipeline } from './BrowserCordovaExport';
import { browserElectronExportPipeline } from './BrowserElectronExport';
import { browserFacebookInstantGamesExportPipeline } from './BrowserFacebookInstantGamesExport';
import { cordovaExporter } from '../GenericExporters/CordovaExport';
import { onlineWebExporter } from '../GenericExporters/OnlineWebExport';
import { html5Exporter } from '../GenericExporters/HTML5Export';
import { facebookInstantGamesExporter } from '../GenericExporters/FacebookInstantGamesExport';
import { onlineCordovaExporter } from '../GenericExporters/OnlineCordovaExport';
import { onlineElectronExporter } from '../GenericExporters/OnlineElectronExport';
import { electronExporter } from '../GenericExporters/ElectronExport';

export const browserOnlineWebExporter: Exporter = {
  ...onlineWebExporter,
  exportPipeline: browserOnlineWebExportPipeline,
};

export const browserAutomatedExporters: Array<Exporter> = [
  {
    ...html5Exporter,
    exportPipeline: browserHTML5ExportPipeline,
  },
  {
    ...onlineCordovaExporter,
    exportPipeline: browserOnlineCordovaExportPipeline,
  },
  {
    ...onlineElectronExporter,
    exportPipeline: browserOnlineElectronExportPipeline,
  },
  {
    ...facebookInstantGamesExporter,
    exportPipeline: browserFacebookInstantGamesExportPipeline,
  },
];

export const browserManualExporters: Array<Exporter> = [
  {
    ...html5Exporter,
    exportPipeline: browserHTML5ExportPipeline,
  },
  {
    ...cordovaExporter,
    exportPipeline: browserCordovaExportPipeline,
  },
  {
    ...electronExporter,
    exportPipeline: browserElectronExportPipeline,
  },
];
