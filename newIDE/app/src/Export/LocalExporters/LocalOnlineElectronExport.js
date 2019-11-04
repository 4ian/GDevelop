// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import assignIn from 'lodash/assignIn';
import {
  type Build,
  buildElectron,
  type TargetName,
} from '../../Utils/GDevelopServices/Build';
import { type UserProfile } from '../../Profile/UserProfileContext';
import { findGDJS } from './LocalGDJSFinder';
import { archiveLocalFolder } from '../../Utils/LocalArchiver';
import optionalRequire from '../../Utils/OptionalRequire.js';
import localFileSystem from './LocalFileSystem';
import {
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
import Text from '../../UI/Text';
import Checkbox from '../../UI/Checkbox';
import { Line, Column } from '../../UI/Grid';
const path = optionalRequire('path');
const os = optionalRequire('os');
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const gd = global.gd;

type ExportState = {|
  targets: Array<TargetName>,
|};

type PreparedExporter = {|
  exporter: gdjsExporter,
  temporaryOutputDir: string,
|};

type ExportOutput = {|
  temporaryOutputDir: string,
|};

type ResourcesDownloadOutput = {|
  temporaryOutputDir: string,
|};

type CompressionOutput = string;

export const localOnlineElectronExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: 'local-online-electron',
  onlineBuildType: 'electron-build',

  getInitialExportState: () => ({
    targets: [],
  }),

  canLaunchBuild: (exportState: ExportState) => !!exportState.targets.length,

  renderHeader: ({ exportState, updateExportState }) => {
    const setTarget = (targetName: TargetName, enable: boolean) => {
      updateExportState(prevExportState => {
        if (enable && prevExportState.targets.indexOf(targetName) === -1) {
          return {
            ...prevExportState,
            targets: [...prevExportState.targets, targetName],
          };
        } else if (
          !enable &&
          prevExportState.targets.indexOf(targetName) !== -1
        ) {
          return {
            ...prevExportState,
            targets: prevExportState.targets.filter(
              name => name !== targetName
            ),
          };
        }

        return prevExportState;
      });
    };

    return (
      <React.Fragment>
        <Column noMargin>
          <Line>
            <Text>
              <Trans>
                Your game will be exported and packaged online as a stand-alone
                game for Windows, Linux and/or macOS.
              </Trans>
            </Text>
          </Line>
          <Checkbox
            label={<Trans>Windows (zip file)</Trans>}
            checked={exportState.targets.indexOf('winZip') !== -1}
            onCheck={(e, checked) => setTarget('winZip', checked)}
          />
          <Checkbox
            label={<Trans>Windows (auto-installer file)</Trans>}
            checked={exportState.targets.indexOf('winExe') !== -1}
            onCheck={(e, checked) => setTarget('winExe', checked)}
          />
          <Checkbox
            label={<Trans>macOS (zip file)</Trans>}
            checked={exportState.targets.indexOf('macZip') !== -1}
            onCheck={(e, checked) => setTarget('macZip', checked)}
          />
          <Checkbox
            label={<Trans>Linux (AppImage)</Trans>}
            checked={exportState.targets.indexOf('linuxAppImage') !== -1}
            onCheck={(e, checked) => setTarget('linuxAppImage', checked)}
          />
        </Column>
      </React.Fragment>
    );
  },

  renderLaunchButtonLabel: () => <Trans>Package</Trans>,

  prepareExporter: (
    context: ExportPipelineContext<ExportState>
  ): Promise<PreparedExporter> => {
    return findGDJS().then(({ gdjsRoot }) => {
      console.info('GDJS found in ', gdjsRoot);

      const fileSystem = assignIn(
        new gd.AbstractFileSystemJS(),
        localFileSystem
      );
      const exporter = new gd.Exporter(fileSystem, gdjsRoot);
      const temporaryOutputDir = path.join(
        fileSystem.getTempDir(),
        'OnlineElectronExport'
      );
      fileSystem.mkDir(temporaryOutputDir);
      fileSystem.clearDir(temporaryOutputDir);

      return {
        exporter,
        temporaryOutputDir,
      };
    });
  },

  launchExport: (
    context: ExportPipelineContext<ExportState>,
    { exporter, temporaryOutputDir }: PreparedExporter
  ): Promise<ExportOutput> => {
    const exportOptions = new gd.MapStringBoolean();
    exportOptions.set('exportForElectron', true);
    exporter.exportWholePixiProject(
      context.project,
      temporaryOutputDir,
      exportOptions
    );
    exportOptions.delete();
    exporter.delete();

    return Promise.resolve({ temporaryOutputDir });
  },

  launchResourcesDownload: (
    context: ExportPipelineContext<ExportState>,
    { temporaryOutputDir }: ExportOutput
  ): Promise<ResourcesDownloadOutput> => {
    return Promise.resolve({ temporaryOutputDir });
  },

  launchCompression: (
    context: ExportPipelineContext<ExportState>,
    { temporaryOutputDir }: ResourcesDownloadOutput
  ): Promise<CompressionOutput> => {
    const archiveOutputDir = os.tmpdir();
    return archiveLocalFolder({
      path: temporaryOutputDir,
      outputFilename: path.join(archiveOutputDir, 'game-archive.zip'),
    });
  },

  launchUpload: (
    context: ExportPipelineContext<ExportState>,
    outputFile: CompressionOutput
  ): Promise<string> => {
    if (!ipcRenderer) return Promise.reject('No support for upload');

    ipcRenderer.removeAllListeners('s3-file-upload-progress');
    ipcRenderer.removeAllListeners('s3-file-upload-done');

    return new Promise((resolve, reject) => {
      ipcRenderer.on(
        's3-file-upload-progress',
        (event, stepCurrentProgress, stepMaxProgress) => {
          context.updateStepProgress(stepCurrentProgress, stepMaxProgress);
        }
      );
      ipcRenderer.on('s3-file-upload-done', (event, err, prefix) => {
        if (err) return reject(err);
        resolve(prefix);
      });
      ipcRenderer.send('s3-file-upload', outputFile);
    });
  },

  launchOnlineBuild: (
    exportState: ExportState,
    userProfile: UserProfile,
    uploadBucketKey: string
  ): Promise<Build> => {
    const { getAuthorizationHeader, profile } = userProfile;
    if (!profile) return Promise.reject(new Error('User is not authenticated'));

    return buildElectron(
      getAuthorizationHeader,
      profile.uid,
      uploadBucketKey,
      exportState.targets
    );
  },
};
