// @flow
import { type I18n as I18nType } from '@lingui/core';
import optionalRequire from '../../Utils/OptionalRequire';
import { localHTML5ExportPipeline } from '../LocalExporters/LocalHTML5Export';

const path = optionalRequire('path');

const DEFAULT_BUILD_FOLDER_NAME = 'build';

export const resolveHtml5OutputDir = (project: gdProject): string => {
  const stored = project.getLastCompilationDirectory();
  if (stored) return stored;

  if (!path) {
    throw new Error(
      'Cannot derive a default build folder: Node "path" module is not available (this requires Electron / Node).'
    );
  }
  const projectFile = project.getProjectFile();
  if (!projectFile) {
    throw new Error(
      'Cannot derive a default build folder: project has no file path on disk. Save the project first or pass an explicit outputDir.'
    );
  }
  return path.join(path.dirname(projectFile), DEFAULT_BUILD_FOLDER_NAME);
};

type Options = {|
  project: gdProject,
  i18n: I18nType,
  outputDir?: string,
|};

type Result = {| outputDir: string |};

/**
 * Headless HTML5 export — no UI, no dialogs.
 * Has no React dependencies; accepts a stub i18n like
 * `{ _: msg => (msg && msg.message) || String(msg) }`.
 */
export const exportLocalHtml5Headless = async ({
  project,
  i18n,
  outputDir,
}: Options): Promise<Result> => {
  const resolvedOutputDir = outputDir || resolveHtml5OutputDir(project);
  project.setLastCompilationDirectory(resolvedOutputDir);

  const context = {
    project,
    exportState: { outputDir: resolvedOutputDir },
    updateStepProgress: (count: number, total: number) => {},
    i18n,
  };

  const preparedExporter = await localHTML5ExportPipeline.prepareExporter(
    context
  );
  const exportOutput = await localHTML5ExportPipeline.launchExport(
    context,
    preparedExporter,
    null
  );
  const resourcesDownloadOutput = await localHTML5ExportPipeline.launchResourcesDownload(
    context,
    exportOutput
  );
  await localHTML5ExportPipeline.launchCompression(
    context,
    resourcesDownloadOutput
  );

  return { outputDir: resolvedOutputDir };
};
