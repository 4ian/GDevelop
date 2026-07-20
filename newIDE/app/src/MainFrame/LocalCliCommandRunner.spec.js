// @flow
import fs from 'fs';
import os from 'os';
import path from 'path';
import { shouldBlockOnDiagnosticErrorsForCli } from './LocalCliCommandRunner';
import Window from '../Utils/Window';

const makeFakeProject = (projectFilePath: string): any => ({
  getProjectFile: () => projectFilePath,
});

const makeFakePreferences = (
  blockPreviewAndExportOnDiagnosticErrors: boolean
): any => ({
  getBlockPreviewAndExportOnDiagnosticErrors: () =>
    blockPreviewAndExportOnDiagnosticErrors,
});

describe('shouldBlockOnDiagnosticErrorsForCli', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gd-cli-diagnostics-'));
    jest.spyOn(Window, 'getArguments').mockReturnValue({});
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    jest.clearAllMocks();
  });

  const writeSettingsYaml = (content: string) => {
    fs.writeFileSync(path.join(tmpDir, 'gdevelop-settings.yaml'), content);
  };

  test('CLI flag --block-on-diagnostic-errors overrides the yaml and the persisted preference', async () => {
    writeSettingsYaml(
      'preferences:\n  blockPreviewAndExportOnDiagnosticErrors: false\n'
    );
    jest.spyOn(Window, 'getArguments').mockReturnValue({
      'block-on-diagnostic-errors': true,
    });

    const project = makeFakeProject(path.join(tmpDir, 'Game.json'));
    const preferences = makeFakePreferences(false);

    await expect(
      shouldBlockOnDiagnosticErrorsForCli(project, preferences)
    ).resolves.toBe(true);
  });

  test('CLI flag --no-block-on-diagnostic-errors overrides the yaml and the persisted preference', async () => {
    writeSettingsYaml(
      'preferences:\n  blockPreviewAndExportOnDiagnosticErrors: true\n'
    );
    jest.spyOn(Window, 'getArguments').mockReturnValue({
      'block-on-diagnostic-errors': false,
    });

    const project = makeFakeProject(path.join(tmpDir, 'Game.json'));
    const preferences = makeFakePreferences(true);

    await expect(
      shouldBlockOnDiagnosticErrorsForCli(project, preferences)
    ).resolves.toBe(false);
  });

  test('reads the value from gdevelop-settings.yaml when no CLI flag is passed, even if the persisted preference disagrees (no race)', async () => {
    writeSettingsYaml(
      'preferences:\n  blockPreviewAndExportOnDiagnosticErrors: false\n'
    );

    const project = makeFakeProject(path.join(tmpDir, 'Game.json'));
    // Simulates a stale/unrelated persisted preference (e.g. left over from a
    // previous session or another project) that hasn't been reconciled yet.
    const preferences = makeFakePreferences(true);

    await expect(
      shouldBlockOnDiagnosticErrorsForCli(project, preferences)
    ).resolves.toBe(false);
  });

  test('falls back to the preference when the project has no gdevelop-settings.yaml', async () => {
    const project = makeFakeProject(path.join(tmpDir, 'Game.json'));
    const preferences = makeFakePreferences(true);

    await expect(
      shouldBlockOnDiagnosticErrorsForCli(project, preferences)
    ).resolves.toBe(true);
  });

  test('falls back to the preference when gdevelop-settings.yaml does not define the preference', async () => {
    writeSettingsYaml('preferences:\n  autosaveOnPreview: true\n');

    const project = makeFakeProject(path.join(tmpDir, 'Game.json'));
    const preferences = makeFakePreferences(true);

    await expect(
      shouldBlockOnDiagnosticErrorsForCli(project, preferences)
    ).resolves.toBe(true);
  });
});
