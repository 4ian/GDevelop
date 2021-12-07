// @flow
import { type Exporter } from '../ExportDialog';
import { localCordovaExportPipeline } from './LocalCordovaExport';
import { localElectronExportPipeline } from './LocalElectronExport';
import { localHTML5ExportPipeline } from './LocalHTML5Export';
import { localFacebookInstantGamesExportPipeline } from './LocalFacebookInstantGamesExport';
import { localOnlineCordovaExportPipeline } from './LocalOnlineCordovaExport.js';
import { localOnlineElectronExportPipeline } from './LocalOnlineElectronExport.js';
import { localOnlineWebExportPipeline } from './LocalOnlineWebExport';
import { cordovaExporter } from '../GenericExporters/CordovaExport';
import { onlineWebExporter } from '../GenericExporters/OnlineWebExport';
import { html5Exporter } from '../GenericExporters/HTML5Export';
import { facebookInstantGamesExporter } from '../GenericExporters/FacebookInstantGamesExport';
import { onlineCordovaExporter } from '../GenericExporters/OnlineCordovaExport';
import { onlineElectronExporter } from '../GenericExporters/OnlineElectronExport';
import { electronExporter } from '../GenericExporters/ElectronExport';

export const getLocalExporters = (): Array<Exporter> => [
  {
    ...onlineCordovaExporter,
    key: 'localonlinecordovaexport',
    exportPipeline: localOnlineCordovaExportPipeline,
  },
  {
    ...onlineWebExporter,
    key: 'localonlinewebexport',
    exportPipeline: localOnlineWebExportPipeline,
  },
  {
    ...html5Exporter,
    key: 'localexport',
    exportPipeline: localHTML5ExportPipeline,
  },
  {
    ...facebookInstantGamesExporter,
    key: 'localfacebookinstantgames',
    exportPipeline: localFacebookInstantGamesExportPipeline,
  },
  {
    ...cordovaExporter,
    key: 'localcordovaexport',
    exportPipeline: localCordovaExportPipeline,
  },
  {
    ...onlineElectronExporter,
    key: 'localonlineelectronexport',
    exportPipeline: localOnlineElectronExportPipeline,
  },
  {
    ...electronExporter,
    key: 'localelectronexport',
    exportPipeline: localElectronExportPipeline,
  },
];
