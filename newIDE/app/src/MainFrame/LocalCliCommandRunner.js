// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type CommandPaletteInterface } from '../CommandPalette/CommandPalette';
import { exportLocalHtml5Headless } from '../ExportAndShare/Headless/ExportLocalHtml5Headless';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import PreferencesContext, {
  type Preferences,
} from './Preferences/PreferencesContext';
import { scanProjectForValidationErrors } from '../Utils/EventsValidationScanner';
import Window from '../Utils/Window';
import optionalRequire from '../Utils/OptionalRequire';
import { type FileMetadata } from '../ProjectsStorage';

const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const process = optionalRequire('process');

export type ImportExtension = (options: {|
  i18n: I18nType,
  project: gdProject,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  filePaths?: Array<string>,
  skipUserPrompts?: boolean,
|}) => Promise<Array<string>>;

export type SaveProject = (options?: {|
  skipNewVersionWarning: boolean,
|}) => Promise<?FileMetadata>;

// Commands registered here are awaited by the CLI dispatcher so the process
// exits with a meaningful code. Unregistered commands fall back to
// fire-and-forget via launchCommand.
export type CliCommandRunner = (
  project: gdProject,
  i18n: I18nType,
  context: {|
    preferences: Preferences,
    commandArgs: Array<string>,
    importExtension: ImportExtension,
    onWillInstallExtension: (extensionNames: Array<string>) => void,
    onExtensionInstalled: (extensionNames: Array<string>) => void,
    saveProject: SaveProject,
  |}
) => Promise<void>;

const normalizeCommandArgs = (
  arg: string | Array<string> | void
): Array<string> => {
  if (!arg) return [];
  const values = Array.isArray(arg) ? arg : [arg];
  return values.map(value => value.trim()).filter(Boolean);
};

const getCommandArgs = (): Array<string> =>
  normalizeCommandArgs(Window.getArguments()['cmd-args']);

const parsePositiveInteger = (key: string, value: string): number => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `[CLI] Invalid value "${value}" for "${key}" (expected a positive integer).`
    );
  }
  return parsed;
};

const runners: { [commandName: string]: CliCommandRunner } = {
  EXPORT_HTML5_EXTERNAL: async (project, i18n, { preferences }) => {
    if (preferences.getBlockPreviewAndExportOnDiagnosticErrors()) {
      const errors = scanProjectForValidationErrors(project);
      if (errors.length > 0) {
        console.error(
          `[CLI] Diagnostic report has ${
            errors.length
          } error(s). Export blocked.`
        );
        throw new Error('Export blocked by diagnostic errors.');
      }
    }
    await exportLocalHtml5Headless({ project, i18n });
  },
  IMPORT_EXTENSION_AND_SAVE: async (
    project,
    i18n,
    {
      commandArgs,
      importExtension,
      onWillInstallExtension,
      onExtensionInstalled,
      saveProject,
    }
  ) => {
    if (commandArgs.length === 0) {
      throw new Error(
        '[CLI] IMPORT_EXTENSION_AND_SAVE requires at least one path via --cmd-args.'
      );
    }
    const importedExtensionNames = await importExtension({
      i18n,
      project,
      filePaths: commandArgs,
      skipUserPrompts: true,
      onWillInstallExtension,
      onExtensionInstalled,
    });
    if (importedExtensionNames.length === 0) {
      throw new Error(
        '[CLI] Extension import failed or produced no extensions.'
      );
    }

    const fileMetadata = await saveProject({ skipNewVersionWarning: true });
    if (!fileMetadata) {
      throw new Error('[CLI] Extension imported but project save failed.');
    }
  },
  SET_PROJECT_PROPERTIES: async (
    project,
    i18n,
    { commandArgs, saveProject }
  ) => {
    // Each --cmd-args entry is a `key=value` pair applied to the project.
    // Supported keys map to the game's public properties.
    const propertySetters: {
      [key: string]: (project: gdProject, value: string) => void,
    } = {
      name: (project, value) => project.setName(value),
      author: (project, value) => project.setAuthor(value),
      version: (project, value) => project.setVersion(value),
      packageName: (project, value) => project.setPackageName(value),
      description: (project, value) => project.setDescription(value),
      // 'default' | 'landscape' | 'portrait'
      orientation: (project, value) => project.setOrientation(value),
      resolutionWidth: (project, value) =>
        project.setGameResolutionSize(
          parsePositiveInteger('resolutionWidth', value),
          project.getGameResolutionHeight()
        ),
      resolutionHeight: (project, value) =>
        project.setGameResolutionSize(
          project.getGameResolutionWidth(),
          parsePositiveInteger('resolutionHeight', value)
        ),
    };

    if (commandArgs.length === 0) {
      throw new Error(
        '[CLI] SET_PROJECT_PROPERTIES requires at least one "key=value" pair via --cmd-args. ' +
          `Supported keys: ${Object.keys(propertySetters).join(', ')}.`
      );
    }

    for (const propertyAssignment of commandArgs) {
      const separatorIndex = propertyAssignment.indexOf('=');
      if (separatorIndex === -1) {
        throw new Error(
          `[CLI] Invalid project property "${propertyAssignment}" (expected "key=value").`
        );
      }
      const key = propertyAssignment.slice(0, separatorIndex).trim();
      const value = propertyAssignment.slice(separatorIndex + 1);
      const setProperty = propertySetters[key];
      if (!setProperty) {
        throw new Error(
          `[CLI] Unknown project property "${key}". ` +
            `Supported keys: ${Object.keys(propertySetters).join(', ')}.`
        );
      }
      setProperty(project, value);
      console.info(`[CLI] Set project property "${key}" = "${value}".`);
    }

    const fileMetadata = await saveProject({ skipNewVersionWarning: true });
    if (!fileMetadata) {
      throw new Error('[CLI] Project properties updated but save failed.');
    }
  },
};

export const getAwaitableCliRunner = (commandName: string): ?CliCommandRunner =>
  runners[commandName] || null;

const CLI_PROJECT_LOAD_TIMEOUT_MS = 120_000;
const FIRE_AND_FORGET_GRACE_MS = 1500;

const exitApp = (exitCode: number) => {
  if (ipcRenderer) ipcRenderer.send('app-exit', exitCode);
};

// Must match electron-app/app/OpenProjectsRegistry.js normalizeFileIdentifier (IPC routing).
const normalizeFileIdentifier = (fileIdentifier: ?string): ?string => {
  if (!fileIdentifier || !path) return null;
  const resolved = path.resolve(fileIdentifier);
  return process && process.platform === 'win32'
    ? resolved.toLowerCase()
    : resolved;
};

type RunCliCommandIpcPayload = {|
  commandName: string,
  commandArgs: string | Array<string> | void,
  fileIdentifier: ?string,
|};

const ensureProjectExtensionsReadyForCli = async (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState
): Promise<boolean> => {
  await eventsFunctionsExtensionsState.ensureLoadFinished();

  if (eventsFunctionsExtensionsState.eventsFunctionsExtensionsError) {
    console.error(
      '[CLI] Project extensions failed to load:',
      eventsFunctionsExtensionsState.eventsFunctionsExtensionsError
    );
    return false;
  }

  if (fs) {
    const includeFileHashs = eventsFunctionsExtensionsState.getIncludeFileHashs();
    const missingIncludeFiles = Object.keys(includeFileHashs).filter(
      includeFile => !fs.existsSync(includeFile)
    );
    if (missingIncludeFiles.length > 0) {
      console.warn(
        '[CLI] Some generated extension code files are missing on disk (extension compatibility issue):',
        missingIncludeFiles
      );
    }
  }

  return true;
};

type RunCliCommandOptions = {|
  project: gdProject,
  i18n: I18nType,
  commandName: string,
  commandArgs: Array<string>,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  commandPaletteRef: {| current: ?CommandPaletteInterface |},
  preferences: Preferences,
  importExtension: ImportExtension,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  saveProject: SaveProject,
  onFinished: (exitCode: number) => void,
|};

const runCliCommand = async ({
  project,
  i18n,
  commandName,
  commandArgs,
  eventsFunctionsExtensionsState,
  commandPaletteRef,
  preferences,
  importExtension,
  onWillInstallExtension,
  onExtensionInstalled,
  saveProject,
  onFinished,
}: RunCliCommandOptions): Promise<void> => {
  try {
    const extensionsReady = await ensureProjectExtensionsReadyForCli(
      eventsFunctionsExtensionsState
    );
    if (!extensionsReady) {
      onFinished(1);
      return;
    }

    const awaitableRunner = getAwaitableCliRunner(commandName);
    if (awaitableRunner) {
      await awaitableRunner(project, i18n, {
        preferences,
        commandArgs,
        importExtension,
        onWillInstallExtension,
        onExtensionInstalled,
        saveProject,
      });
      console.info(`[CLI] Command "${commandName}" finished successfully.`);
      onFinished(0);
      return;
    }

    if (commandPaletteRef.current && commandPaletteRef.current.launchCommand) {
      commandPaletteRef.current.launchCommand((commandName: any));
      console.info(
        `[CLI] Command "${commandName}" dispatched (fire-and-forget).`
      );
      setTimeout(() => onFinished(0), FIRE_AND_FORGET_GRACE_MS);
      return;
    }

    console.error(
      `[CLI] Command "${commandName}" could not be dispatched: command palette not ready.`
    );
    onFinished(1);
  } catch (error) {
    console.error(`[CLI] Command "${commandName}" failed:`, error);
    onFinished(1);
  }
};

type Props = {|
  project: ?gdProject,
  i18n: I18nType,
  fileIdentifier: ?string,
  commandPaletteRef: {| current: ?CommandPaletteInterface |},
  importExtension: ImportExtension,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  saveProject: SaveProject,
|};

export const useCliCommandRunner = ({
  project,
  i18n,
  fileIdentifier,
  commandPaletteRef,
  importExtension,
  onWillInstallExtension,
  onExtensionInstalled,
  saveProject,
}: Props) => {
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const preferences = React.useContext(PreferencesContext);

  React.useEffect(
    () => {
      if (ipcRenderer)
        ipcRenderer.send('set-window-project-path', fileIdentifier);
    },
    [fileIdentifier]
  );

  // Dispatch `--run-command` once the project is loaded. "Awaitable" commands
  // are awaited for a proper exit code; others fall back to fire-and-forget
  // via commandPaletteRef.launchCommand.
  const cliCommandRanRef = React.useRef(false);
  React.useEffect(
    () => {
      if (cliCommandRanRef.current) return;
      if (!project) return;

      const appArguments = Window.getArguments();
      const commandName = appArguments['run-command'];
      if (!commandName || typeof commandName !== 'string') return;

      cliCommandRanRef.current = true;
      const keepOpen = !!appArguments['keep-open'];

      runCliCommand({
        project,
        i18n,
        commandName,
        commandArgs: getCommandArgs(),
        eventsFunctionsExtensionsState,
        commandPaletteRef,
        preferences,
        importExtension,
        onWillInstallExtension,
        onExtensionInstalled,
        saveProject,
        onFinished: exitCode => {
          if (!keepOpen) exitApp(exitCode);
        },
      });
    },
    [
      project,
      i18n,
      commandPaletteRef,
      eventsFunctionsExtensionsState,
      preferences,
      importExtension,
      onWillInstallExtension,
      onExtensionInstalled,
      saveProject,
    ]
  );

  React.useEffect(
    () => {
      if (!ipcRenderer || !project) return;

      const onRunCliCommand = (
        event: any,
        {
          commandName,
          commandArgs,
          fileIdentifier: routedFileIdentifier,
        }: RunCliCommandIpcPayload
      ) => {
        if (
          normalizeFileIdentifier(routedFileIdentifier) !==
          normalizeFileIdentifier(fileIdentifier)
        ) {
          console.error(
            `[CLI] Command "${commandName}" was routed to this window for "${routedFileIdentifier ||
              ''}", but it now has "${fileIdentifier || ''}" open. Ignoring.`
          );
          return;
        }

        runCliCommand({
          project,
          i18n,
          commandName,
          commandArgs: normalizeCommandArgs(commandArgs),
          eventsFunctionsExtensionsState,
          commandPaletteRef,
          preferences,
          importExtension,
          onWillInstallExtension,
          onExtensionInstalled,
          saveProject,
          onFinished: () => {},
        });
      };

      ipcRenderer.on('run-cli-command', onRunCliCommand);
      return () =>
        ipcRenderer.removeListener('run-cli-command', onRunCliCommand);
    },
    [
      project,
      i18n,
      fileIdentifier,
      commandPaletteRef,
      eventsFunctionsExtensionsState,
      preferences,
      importExtension,
      onWillInstallExtension,
      onExtensionInstalled,
      saveProject,
    ]
  );

  React.useEffect(
    () => {
      if (!Window.isRunningCommandFromCli()) return;
      if (project) return;
      const timer = setTimeout(() => {
        console.error('[CLI] Project failed to load within timeout. Exiting.');
        exitApp(1);
      }, CLI_PROJECT_LOAD_TIMEOUT_MS);
      return () => clearTimeout(timer);
    },
    [project]
  );
};
