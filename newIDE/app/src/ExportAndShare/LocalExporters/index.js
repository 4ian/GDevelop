// @flow
import { type Exporter } from '../ShareDialog';
import { localCordovaExportPipeline } from './LocalCordovaExport';
import { localElectronExportPipeline } from './LocalElectronExport';
import { localHTML5ExportPipeline } from './LocalHTML5Export';
import { localFacebookInstantGamesExportPipeline } from './LocalFacebookInstantGamesExport';
import { localOnlineCordovaExportPipeline } from './LocalOnlineCordovaExport';
import { localOnlineCordovaIosExportPipeline } from './LocalOnlineCordovaIosExport';
import { localOnlineElectronExportPipeline } from './LocalOnlineElectronExport';
import { localOnlineWebExportPipeline } from './LocalOnlineWebExport';
import { cordovaExporter } from '../GenericExporters/CordovaExport';
import { onlineWebExporter } from '../GenericExporters/OnlineWebExport';
import { html5Exporter } from '../GenericExporters/HTML5Export';
import { facebookInstantGamesExporter } from '../GenericExporters/FacebookInstantGamesExport';
import { onlineCordovaExporter } from '../GenericExporters/OnlineCordovaExport';
import { onlineCordovaIosExporter } from '../GenericExporters/OnlineCordovaIosExport';
import { onlineElectronExporter } from '../GenericExporters/OnlineElectronExport';
import { electronExporter } from '../GenericExporters/ElectronExport';

export const localOnlineWebExporter: Exporter = {
  ...onlineWebExporter,
  exportPipeline: localOnlineWebExportPipeline,
};

export const localAutomatedExporters: Array<Exporter> = [
  {
    ...html5Exporter,
    exportPipeline: localHTML5ExportPipeline,
  },
  {
    ...onlineCordovaExporter,
    exportPipeline: localOnlineCordovaExportPipeline,
  },
  {
    ...onlineCordovaIosExporter,
    exportPipeline: localOnlineCordovaIosExportPipeline,
  },
  {
    ...onlineElectronExporter,
    exportPipeline: localOnlineElectronExportPipeline,
  },
  {
    ...facebookInstantGamesExporter,
    exportPipeline: localFacebookInstantGamesExportPipeline,
  },
];

export const localManualExporters: Array<Exporter> = [
  {
    ...html5Exporter,
    exportPipeline: localHTML5ExportPipeline,
  },
  {
    ...cordovaExporter,
    exportPipeline: localCordovaExportPipeline,
  },
  {
    ...electronExporter,
    exportPipeline: localElectronExportPipeline,
  },
];
