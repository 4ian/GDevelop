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

// $FlowFixMe[incompatible-type]
export const localOnlineWebExporter: Exporter = {
  ...onlineWebExporter,
  exportPipeline: localOnlineWebExportPipeline,
};

export const localAutomatedExporters: Array<Exporter> = [
  // $FlowFixMe[incompatible-type]
  {
    ...html5Exporter,
    exportPipeline: localHTML5ExportPipeline,
  },
  // $FlowFixMe[incompatible-type]
  {
    ...onlineCordovaExporter,
    exportPipeline: localOnlineCordovaExportPipeline,
  },
  // $FlowFixMe[incompatible-type]
  {
    ...onlineCordovaIosExporter,
    exportPipeline: localOnlineCordovaIosExportPipeline,
  },
  // $FlowFixMe[incompatible-type]
  {
    ...onlineElectronExporter,
    exportPipeline: localOnlineElectronExportPipeline,
  },
  // $FlowFixMe[incompatible-type]
  {
    ...facebookInstantGamesExporter,
    exportPipeline: localFacebookInstantGamesExportPipeline,
  },
];

export const localManualExporters: Array<Exporter> = [
  // $FlowFixMe[incompatible-type]
  {
    ...html5Exporter,
    exportPipeline: localHTML5ExportPipeline,
  },
  // $FlowFixMe[incompatible-type]
  {
    ...cordovaExporter,
    exportPipeline: localCordovaExportPipeline,
  },
  // $FlowFixMe[incompatible-type]
  {
    ...electronExporter,
    exportPipeline: localElectronExportPipeline,
  },
];
