// @flow
import { type I18n as I18nType } from '@lingui/core';
import optionalRequire from '../../Utils/OptionalRequire';
import { localHTML5ExportPipeline } from '../LocalExporters/LocalHTML5Export';

const path = optionalRequire('path');

// Default sub-folder used when the project does not yet have a stored
// last compilation directory. Created next to the project file.
const DEFAULT_BUILD_FOLDER_NAME = 'build';

/**
 * Resolve the output directory used by the headless HTML5 export.
 * Reads `latestCompilationDirectory` from the project; if empty or absent,
 * falls back to `<projectDirectory>/build`.
 */
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
 * Run the local HTML5 ("Share -> Browser -> HTML5 external websites") export
 * pipeline without any UI: no Share dialog, no progress, no notifications.
 *
 * On success, the resolved output directory is returned and persisted on the
 * project via `setLastCompilationDirectory` (matching the regular dialog
 * behavior). On failure, the returned promise rejects.
 *
 * Designed to be reused from a future CLI entry point: this module has no
 * React/UI dependencies and accepts a stub `i18n` such as
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
