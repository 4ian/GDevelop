// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import assignIn from 'lodash/assignIn';
import {
  type Build,
  buildElectron,
  uploadBuildFile,
  type TargetName,
} from '../../Utils/GDevelopServices/Build';
import { type UserProfile } from '../../Profile/UserProfileContext';
import { findGDJS } from './BrowserS3GDJSFinder';
import BrowserFileSystem from './BrowserFileSystem';
import {
  type UrlFileDescriptor,
  type TextFileDescriptor,
  type BlobFileDescriptor,
  downloadUrlsToBlobs,
  archiveFiles,
} from '../../Utils/BrowserArchiver';
import {
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
import Text from '../../UI/Text';
import Checkbox from '../../UI/Checkbox';
import { Line, Column } from '../../UI/Grid';
const gd = global.gd;

type ExportState = {|
  targets: Array<TargetName>,
|};

type PreparedExporter = {|
  exporter: gdjsExporter,
  abstractFileSystem: BrowserFileSystem,
  outputDir: string,
|};

type ExportOutput = {|
  textFiles: Array<TextFileDescriptor>,
  urlFiles: Array<UrlFileDescriptor>,
|};

type ResourcesDownloadOutput = {|
  textFiles: Array<TextFileDescriptor>,
  blobFiles: Array<BlobFileDescriptor>,
|};

type CompressionOutput = Blob;

export const browserOnlineElectronExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: 'browser-online-electron',
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
    return findGDJS('electron').then(({ gdjsRoot, filesContent }) => {
      console.info('GDJS found in ', gdjsRoot);

      const outputDir = '/export/';
      const abstractFileSystem = new BrowserFileSystem({
        textFiles: filesContent,
      });
      const fileSystem = assignIn(
        new gd.AbstractFileSystemJS(),
        abstractFileSystem
      );
      const exporter = new gd.Exporter(fileSystem, gdjsRoot);

      return {
        exporter,
        outputDir,
        abstractFileSystem,
      };
    });
  },

  launchExport: (
    context: ExportPipelineContext<ExportState>,
    { exporter, outputDir, abstractFileSystem }: PreparedExporter
  ): Promise<ExportOutput> => {
    const { project } = context;

    const exportOptions = new gd.MapStringBoolean();
    exportOptions.set('exportForElectron', true);
    exporter.exportWholePixiProject(project, outputDir, exportOptions);
    exportOptions.delete();
    exporter.delete();

    return Promise.resolve({
      textFiles: abstractFileSystem.getAllTextFilesIn(outputDir),
      urlFiles: abstractFileSystem.getAllUrlFilesIn(outputDir),
    });
  },

  launchResourcesDownload: (
    context: ExportPipelineContext<ExportState>,
    { textFiles, urlFiles }: ExportOutput
  ): Promise<ResourcesDownloadOutput> => {
    return downloadUrlsToBlobs({
      urlFiles,
      onProgress: context.updateStepProgress,
    }).then(blobFiles => ({
      blobFiles,
      textFiles,
    }));
  },

  launchCompression: (
    context: ExportPipelineContext<ExportState>,
    { textFiles, blobFiles }: ResourcesDownloadOutput
  ): Promise<Blob> => {
    return archiveFiles({
      blobFiles,
      textFiles,
      basePath: '/export/',
      onProgress: context.updateStepProgress,
    });
  },

  launchUpload: (
    context: ExportPipelineContext<ExportState>,
    blobFile: Blob
  ): Promise<string> => {
    return uploadBuildFile(blobFile, context.updateStepProgress);
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
