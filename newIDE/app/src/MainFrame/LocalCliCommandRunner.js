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
import {
  runProjectGameplayTests,
  makeGameplayTestResultReadableOutput,
  type GameplayTestToRun,
  type GameplayTestResult,
} from '../GameplayTests/GameplayTestRunner';
import Window, { type AppArguments } from '../Utils/Window';
import UnsavedChangesContext from './UnsavedChangesContext';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { delay } from '../Utils/Delay';
import {
  describeCliEditorFunctions,
  parseCliEditorFunctionCalls,
  runCliEditorFunctionCalls,
  type CliEditorFunctionCall,
  type CliEditorFunctionCallsReport,
  type CliEditorFunctionsEditorCallbacks,
  type CliProjectCreationCallbacks,
} from './CliEditorFunctions';
import optionalRequire from '../Utils/OptionalRequire';
import { type FileMetadata } from '../ProjectsStorage';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { useEditorFunctionsServices } from '../AiGeneration/UseEditorFunctionsServices';
import { useMcpServers } from './McpServerTools/UseMcpServers';
import {
  runAutomatedAiRequest,
  DEFAULT_AI_REQUEST_CONTINUE_MESSAGE,
  DEFAULT_AI_REQUEST_MAX_USER_CONTINUES,
  DEFAULT_AI_REQUEST_TIMEOUT_MS,
} from '../AiGeneration/AskAiAutomation';
import { type OpenAskAiOptions } from '../AiGeneration/Utils';
import LocalFileStorageProvider from '../ProjectsStorage/LocalFileStorageProvider';
import { POSITIONAL_ARGUMENTS_KEY } from '../Utils/Window';
import { readCliLoginForm } from './CliLogin';
import { removeLocalTempDirOfCli } from '../ExportAndShare/LocalExporters/LocalFileSystem';

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
/**
 * The flags of a command, read from the command line - or forwarded with the
 * command when it's routed to an opened editor.
 */
export type CliOptions = {|
  resultsPath: string | null,
  // Print the result of the command as JSON on stdout (the logs are then
  // printed on stderr).
  json: boolean,
  // Don't save the project changed by the command.
  dryRun: boolean,
  // Only allow the functions that don't modify the project.
  readOnly: boolean,
|};

export type RunEditorFunctionCalls = (
  functionCalls: Array<CliEditorFunctionCall>,
  options: {| runScriptReadOnly: boolean |}
) => Promise<CliEditorFunctionCallsReport>;

type CliCommandContext = {|
  preferences: Preferences,
  commandArgs: Array<string>,
  cliOptions: CliOptions,
  // True when the command was routed to an editor that has the project
  // opened (instead of opening it headless).
  isRunInOpenedEditor: boolean,
  importExtension: ImportExtension,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  saveProject: SaveProject,
  runEditorFunctionCalls: RunEditorFunctionCalls,
  triggerUnsavedChanges: () => void,
  // `SERVE_MCP`: lets the tool calls of the MCP server run.
  onMcpProjectReady: () => void,
|};

export type CliCommandRunner = (
  project: gdProject,
  i18n: I18nType,
  context: CliCommandContext
) => Promise<void>;

const getCliOptions = (appArguments: AppArguments): CliOptions => ({
  resultsPath:
    typeof appArguments['results-path'] === 'string' &&
    appArguments['results-path']
      ? appArguments['results-path']
      : null,
  json: !!appArguments['json'],
  dryRun: !!appArguments['dry-run'],
  readOnly: !!appArguments['read-only'],
});

const normalizeCommandArgs = (
  arg: string | Array<string> | void
): Array<string> => {
  if (!arg) return [];
  const values = Array.isArray(arg) ? arg : [arg];
  return values.map(value => value.trim()).filter(Boolean);
};

const getCommandArgs = (): Array<string> =>
  normalizeCommandArgs(Window.getArguments()['cmd-args']);

/**
 * Whether diagnostic-error export blocking should be enforced for this CLI run.
 *
 * Priority (highest first):
 *  1. `--block-on-diagnostic-errors` / `--no-block-on-diagnostic-errors` CLI flags,
 *     for CI/release scripts that want to force the behavior explicitly.
 *     Only an explicit boolean counts; `null`/`undefined` means the flag was not passed.
 *  2. The current `blockPreviewAndExportOnDiagnosticErrors` preference, which
 *     reflects the project's own `gdevelop-settings.yaml` once
 *     `ensureProjectSettingsApplied` has resolved (see `useCliCommandRunner`).
 */
export const shouldBlockOnDiagnosticErrorsForCli = (preferences: {
  +getBlockPreviewAndExportOnDiagnosticErrors: () => boolean,
  ...
}): boolean => {
  const appArguments = Window.getArguments();
  const cliOverride = appArguments['block-on-diagnostic-errors'];
  if (typeof cliOverride === 'boolean') return cliOverride;

  return preferences.getBlockPreviewAndExportOnDiagnosticErrors();
};

/**
 * Whether a test is selected by the names passed via `--cmd-args`: a test
 * name, or a filter where `*` matches anything (`"Enemy*"`, `"*jump*"`).
 */
export const isGameplayTestSelected = (
  testName: string,
  testNamesOrFilters: Array<string>
): boolean =>
  testNamesOrFilters.length === 0 ||
  testNamesOrFilters.some(testNameOrFilter =>
    testNameOrFilter.includes('*')
      ? new RegExp(
          '^' +
            testNameOrFilter
              .split('*')
              .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
              .join('.*') +
            '$'
        ).test(testName)
      : testNameOrFilter === testName
  );

/** A number of milliseconds passed as a CLI argument, like `--timeout-ms`. */
const getMillisecondsArgument = (argumentName: string): ?number => {
  const value = Number(Window.getArguments()[argumentName]);
  return value > 0 ? value : null;
};

const sanitizeForFileName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9-_]+/g, '_').substring(0, 60) || 'unnamed';

/**
 * Write the full results of a gameplay tests run (the same content the
 * GDevelop AI reads: assertions, logs, event log, final state, profiles...)
 * to a JSON file, with the screenshots extracted to JPEG files next to it.
 * The path is taken from `--results-path`, defaulting to
 * `gameplay-test-results.json` next to the project file.
 */
const writeCliGameplayTestResults = (
  project: gdProject,
  results: Array<GameplayTestResult>,
  forcedResultsPath?: string
): ?string => {
  if (!fs || !path) return null;

  const appArguments = Window.getArguments();
  const resultsPath = forcedResultsPath
    ? path.resolve(forcedResultsPath)
    : typeof appArguments['results-path'] === 'string' &&
      appArguments['results-path']
    ? path.resolve(appArguments['results-path'])
    : path.join(
        path.dirname(project.getProjectFile()),
        'gameplay-test-results.json'
      );
  const screenshotsDirectoryPath = path.join(
    path.dirname(resultsPath),
    'gameplay-test-screenshots'
  );

  const outputs = results.map(result => {
    const output = makeGameplayTestResultReadableOutput(result);
    return {
      ...output,
      screenshots: result.screenshots.map((screenshot, index) => {
        const { pngBase64 } = screenshot;
        const screenshotPath = path.join(
          screenshotsDirectoryPath,
          `${sanitizeForFileName(result.testName)}-frame-${
            screenshot.frame
          }-${sanitizeForFileName(screenshot.label || `${index}`)}.${
            pngBase64 ? 'png' : 'jpg'
          }`
        );
        try {
          fs.mkdirSync(screenshotsDirectoryPath, { recursive: true });
          fs.writeFileSync(
            screenshotPath,
            pngBase64 || screenshot.jpegBase64,
            'base64'
          );
          return {
            label: screenshot.label,
            frame: screenshot.frame,
            width: screenshot.width,
            height: screenshot.height,
            file: screenshotPath,
          };
        } catch (error) {
          console.error('[CLI] Could not write a screenshot:', error);
          return { label: screenshot.label, frame: screenshot.frame };
        }
      }),
    };
  });

  fs.writeFileSync(resultsPath, JSON.stringify(outputs, null, 2));
  return resultsPath;
};

/**
 * Read an input of a command: inline JSON, `-` for stdin, or a file path.
 */
const readCliInput = async (commandArg: string): Promise<string> => {
  if (commandArg.startsWith('{') || commandArg.startsWith('[')) {
    return commandArg;
  }
  if (commandArg === '-') {
    if (!ipcRenderer) throw new Error('[CLI] stdin is not available.');
    return ipcRenderer.invoke('cli-read-stdin');
  }
  if (!fs || !path) throw new Error('[CLI] Files are not available.');
  return fs.readFileSync(path.resolve(commandArg), 'utf8');
};

/**
 * Output the result of a command: to the `--results-path` file, and/or as
 * JSON on stdout with `--json`, or in the logs otherwise.
 */
const writeCliCommandResult = async (
  cliOptions: CliOptions,
  result: any
): Promise<void> => {
  const text = JSON.stringify(result, null, 2);
  if (cliOptions.resultsPath && fs && path) {
    const resultsPath = path.resolve(cliOptions.resultsPath);
    fs.writeFileSync(resultsPath, text);
    console.info(`[CLI] Results written to: ${resultsPath}`);
  }
  if (cliOptions.json && ipcRenderer) {
    await ipcRenderer.invoke('cli-write-stdout', text + '\n');
  }
  if (!cliOptions.resultsPath && !cliOptions.json) {
    console.info(`[CLI] Results:\n${text}`);
  }
};

const runEditorFunctionCallsAndReport = async ({
  functionCalls,
  context,
}: {|
  functionCalls: Array<CliEditorFunctionCall>,
  context: CliCommandContext,
|}): Promise<void> => {
  const {
    cliOptions,
    isRunInOpenedEditor,
    saveProject,
    runEditorFunctionCalls,
    triggerUnsavedChanges,
  } = context;
  const report = await runEditorFunctionCalls(functionCalls, {
    runScriptReadOnly: cliOptions.readOnly,
  });

  let savedProject = false;
  if (report.didModifyProject) {
    if (isRunInOpenedEditor) {
      // The user saves (or not) the changes in the opened editor.
      triggerUnsavedChanges();
    } else if (!cliOptions.dryRun) {
      const fileMetadata = await saveProject({ skipNewVersionWarning: true });
      if (!fileMetadata) {
        await writeCliCommandResult(cliOptions, { ...report, savedProject });
        throw new Error(
          '[CLI] The project was changed but could not be saved.'
        );
      }
      savedProject = true;
    }
  }

  await writeCliCommandResult(cliOptions, { ...report, savedProject });
  if (!report.success) {
    const failedResult = report.results[report.results.length - 1];
    throw new Error(
      `"${failedResult ? failedResult.name : ''}" failed${
        report.notRunCalls.length
          ? ` (${report.notRunCalls.length} following call(s) not run)`
          : ''
      }.`
    );
  }
};

const readOnlyFunctionCallsGuard = (
  functionCalls: Array<CliEditorFunctionCall>,
  cliOptions: CliOptions
) => {
  if (!cliOptions.readOnly) return;
  const modifyingFunctionNames = describeCliEditorFunctions()
    .filter(description => description.modifiesProject)
    .map(description => description.name);
  const modifyingCall = functionCalls.find(
    functionCall =>
      functionCall.name !== 'run_script' &&
      modifyingFunctionNames.includes(functionCall.name)
  );
  if (modifyingCall) {
    throw new Error(
      `[CLI] "${
        modifyingCall.name
      }" modifies the project, which --read-only forbids.`
    );
  }
};

const runners: { [commandName: string]: CliCommandRunner } = {
  EXPORT_HTML5_EXTERNAL: async (project, i18n, { preferences }) => {
    if (shouldBlockOnDiagnosticErrorsForCli(preferences)) {
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
  RUN_ALL_TESTS: async (project, i18n, { commandArgs }) => {
    // Run the gameplay tests of the project and of every extension,
    // optionally filtered by names or filters passed via --cmd-args (see
    // `isGameplayTestSelected`). The time budget of each test and the
    // longest the game can stay silent while loading can be changed with
    // --timeout-ms and --loading-timeout-ms.
    const tests: Array<GameplayTestToRun> = [];
    const projectTests = project.getTests();
    for (let i = 0; i < projectTests.getTestsCount(); i++) {
      tests.push({
        scope: { type: 'project' },
        testName: projectTests.getTestAt(i).getName(),
      });
    }
    for (
      let extensionIndex = 0;
      extensionIndex < project.getEventsFunctionsExtensionsCount();
      extensionIndex++
    ) {
      const extension = project.getEventsFunctionsExtensionAt(extensionIndex);
      const extensionTests = extension.getTests();
      for (let i = 0; i < extensionTests.getTestsCount(); i++) {
        tests.push({
          scope: { type: 'extension', extensionName: extension.getName() },
          testName: extensionTests.getTestAt(i).getName(),
        });
      }
    }
    const filteredTests = tests.filter(test =>
      isGameplayTestSelected(test.testName, commandArgs)
    );
    if (filteredTests.length === 0) {
      console.info('[CLI] No gameplay tests to run.');
      return;
    }

    const results = await runProjectGameplayTests({
      project,
      tests: filteredTests,
      options: {
        screenshots: 'on',
        timeoutMs: getMillisecondsArgument('timeout-ms') || undefined,
        loadingTimeoutMs:
          getMillisecondsArgument('loading-timeout-ms') || undefined,
      },
    });
    let failedCount = 0;
    for (const result of results) {
      const passed = result.status === 'passed';
      if (!passed) failedCount++;
      // Loading (game boot, scene assets) is excluded from the timeout
      // budget: only the running time counts against it.
      const loadingMs = result.loadingMs || 0;
      const runningMs = Math.max(0, result.durationMs - loadingMs);
      const loadingText = loadingMs
        ? ` + ${(loadingMs / 1000).toFixed(1)}s loading`
        : '';
      const budgetText = result.timeoutMs
        ? `, ${(runningMs / 1000).toFixed(1)}s / ${result.timeoutMs /
            1000}s budget${loadingText}`
        : '';
      console.info(
        `[CLI] ${passed ? 'PASSED' : 'FAILED'} (${result.status}): ${
          result.testName
        } (${result.framesExecuted} frames${budgetText})${
          result.errors.length ? ' - ' + result.errors.join(' | ') : ''
        }`
      );
      if (passed && result.timeoutMs && runningMs >= 0.8 * result.timeoutMs) {
        console.warn(
          `[CLI] WARNING: "${result.testName}" used ${Math.round(
            (100 * runningMs) / result.timeoutMs
          )}% of its wall-clock budget - it is at risk of timing out on a slower machine. Shorten it or raise its timeout.`
        );
      }
    }
    try {
      const resultsPath = writeCliGameplayTestResults(project, results);
      if (resultsPath)
        console.info(`[CLI] Full test results written to: ${resultsPath}`);
    } catch (error) {
      console.error('[CLI] Could not write the full test results:', error);
    }
    console.info(
      `[CLI] ${results.length - failedCount}/${
        results.length
      } gameplay tests passed.`
    );
    if (failedCount > 0) {
      throw new Error(`${failedCount} gameplay test(s) failed.`);
    }
  },
  LIST_EDITOR_FUNCTIONS: async (project, i18n, { cliOptions }) => {
    await writeCliCommandResult(cliOptions, {
      functions: describeCliEditorFunctions(),
    });
  },

  // Run editor functions calls (the same as the GDevelop AI uses), given as
  // JSON: `--cmd-args calls.json` (or inline JSON, or `-` for stdin).
  RUN_EDITOR_FUNCTIONS: async (project, i18n, context) => {
    const { commandArgs, cliOptions } = context;
    if (commandArgs.length === 0) {
      throw new Error(
        '[CLI] RUN_EDITOR_FUNCTIONS requires the calls (a JSON file, inline JSON or - for stdin) via --cmd-args.'
      );
    }
    const functionCalls: Array<CliEditorFunctionCall> = [];
    for (const commandArg of commandArgs) {
      const calls = parseCliEditorFunctionCalls(
        JSON.parse(await readCliInput(commandArg))
      );
      functionCalls.push(...calls);
    }
    readOnlyFunctionCallsGuard(functionCalls, cliOptions);
    await runEditorFunctionCallsAndReport({ functionCalls, context });
  },

  // Run a JavaScript file calling the editor functions, like the scripts of
  // the GDevelop AI edit (or, with `--read-only`, explorer) agent:
  // `await inspect_variables({ variable_scope: 'global' })`.
  RUN_EDITOR_SCRIPT: async (project, i18n, context) => {
    const { commandArgs } = context;
    if (commandArgs.length !== 1) {
      throw new Error(
        '[CLI] RUN_EDITOR_SCRIPT requires one script (a .js file or - for stdin) via --cmd-args.'
      );
    }
    const jsCode = await readCliInput(commandArgs[0]);
    await runEditorFunctionCallsAndReport({
      functionCalls: [
        {
          name: 'run_script',
          arguments: { title: 'CLI script', js_code: jsCode },
        },
      ],
      context,
    });
  },

  // Serve the editor functions to an AI agent with the Model Context
  // Protocol, until the agent stops (see `--mcp`). The server itself is set
  // up as soon as the editor is loaded (see `useCliCommandRunner`): this only
  // lets the tool calls run, now that the project is ready.
  SERVE_MCP: async (project, i18n, { onMcpProjectReady }) => {
    if (!ipcRenderer) throw new Error('[CLI] SERVE_MCP requires Electron.');
    onMcpProjectReady();
    console.info(`[CLI] MCP server ready for "${project.getName()}".`);
    // The main process exits the app when the agent closes stdin.
    await new Promise(() => {});
  },
};

// `RUN_AI_REQUEST`: run a request of the GDevelop AI from start to end, as a
// user would in the Ask AI editor, to compare what prompts, models or tools
// versions give. Unlike the other commands, it can start without a project
// (the AI then creates it), so it is not one of the `runners`.
const RUN_AI_REQUEST_COMMAND_NAME = 'RUN_AI_REQUEST';

type CliAiRequestInput = {|
  userRequest: string,
  aiConfigurationPresetId: string,
  toolsVersion: string | null,
  continueMessage: string,
  maxUserContinues: number,
  timeoutMs: number,
  // Pay the request with the credits of the user once the AI credits of
  // their plan are used (the preference of the chat, which a new profile
  // does not have: the request would not start).
  payWithCredits: boolean,
  // The source of a gameplay test run (and not saved) once the request is
  // finished, to take the same screenshots of the game for every request.
  judgeTestSource: string | null,
  // Where the results of the judge test and its screenshots are written.
  outputDirectory: string | null,
  // Where a copy of the project is saved (a `.json` file).
  localCopyPath: string | null,
|};

const parseCliAiRequestInput = (json: any): CliAiRequestInput => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    throw new Error('[CLI] The AI request must be a JSON object.');
  }
  if (typeof json.userRequest !== 'string' || !json.userRequest.trim()) {
    throw new Error('[CLI] Missing `userRequest`.');
  }
  const getString = (name: string): string | null =>
    typeof json[name] === 'string' && json[name] ? json[name] : null;
  const getNumber = (name: string, defaultValue: number): number =>
    typeof json[name] === 'number' && json[name] >= 0
      ? json[name]
      : defaultValue;
  return {
    userRequest: json.userRequest,
    aiConfigurationPresetId: getString('aiConfigurationPresetId') || 'default',
    toolsVersion: getString('toolsVersion'),
    continueMessage:
      getString('continueMessage') || DEFAULT_AI_REQUEST_CONTINUE_MESSAGE,
    maxUserContinues: getNumber(
      'maxUserContinues',
      DEFAULT_AI_REQUEST_MAX_USER_CONTINUES
    ),
    timeoutMs: getNumber('timeoutMs', DEFAULT_AI_REQUEST_TIMEOUT_MS),
    payWithCredits: !!json.payWithCredits,
    judgeTestSource: getString('judgeTestSource'),
    outputDirectory: getString('outputDirectory'),
    localCopyPath: getString('localCopyPath'),
  };
};

const cliExpectsProject = (appArguments: AppArguments): boolean => {
  const positionalArguments = appArguments[POSITIONAL_ARGUMENTS_KEY];
  return Array.isArray(positionalArguments) && positionalArguments.length > 0;
};

export const getAwaitableCliRunner = (commandName: string): ?CliCommandRunner =>
  runners[commandName] || null;

const CLI_PROJECT_LOAD_TIMEOUT_MS = 120_000;
const CLI_LOGIN_SETTLE_TIMEOUT_MS = 30_000;

const FIRE_AND_FORGET_GRACE_MS = 1500;

const exitApp = (exitCode: number) => {
  removeLocalTempDirOfCli();
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
  // The flags given with the command (see `CliCommandHandoff.js`).
  commandOptions?: AppArguments,
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
  cliOptions: CliOptions,
  isRunInOpenedEditor: boolean,
  runEditorFunctionCalls: RunEditorFunctionCalls,
  triggerUnsavedChanges: () => void,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  commandPaletteRef: {| current: ?CommandPaletteInterface |},
  preferences: Preferences,
  importExtension: ImportExtension,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  saveProject: SaveProject,
  // Resolves once the project's `gdevelop-settings.yaml` has been read and
  // applied to the preferences, so the command runner can rely on `preferences`
  // as the single source of truth without racing the project load.
  ensureProjectSettingsApplied: () => Promise<void>,
  // Resolves once the user found at startup is logged in (or when there is
  // none): the editor services (the asset store, the events generation...)
  // need the user, and a command can start before the login is done.
  ensureLoginSettled: () => Promise<void>,
  onMcpProjectReady: () => void,
  onFinished: (exitCode: number) => void,
|};

const runCliCommand = async ({
  project,
  i18n,
  commandName,
  commandArgs,
  cliOptions,
  isRunInOpenedEditor,
  runEditorFunctionCalls,
  triggerUnsavedChanges,
  eventsFunctionsExtensionsState,
  commandPaletteRef,
  preferences,
  importExtension,
  onWillInstallExtension,
  onExtensionInstalled,
  saveProject,
  ensureProjectSettingsApplied,
  ensureLoginSettled,
  onMcpProjectReady,
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

    // Wait until the project's gdevelop-settings.yaml has been applied to
    // the preferences, so commands (e.g. the diagnostic-error export block)
    // read the project's own settings rather than a stale global value.
    await ensureProjectSettingsApplied();
    await ensureLoginSettled();

    const awaitableRunner = getAwaitableCliRunner(commandName);
    if (awaitableRunner) {
      await awaitableRunner(project, i18n, {
        preferences,
        commandArgs,
        cliOptions,
        isRunInOpenedEditor,
        importExtension,
        onWillInstallExtension,
        onExtensionInstalled,
        saveProject,
        runEditorFunctionCalls,
        triggerUnsavedChanges,
        onMcpProjectReady,
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
  fileMetadata: ?FileMetadata,
  fileIdentifier: ?string,
  storageProviderName: ?string,
  resourceManagementProps: ResourceManagementProps,
  // What the editor functions notify (to refresh the opened editors) or wait
  // for (to close the editors of what they delete).
  editorFunctionsEditorCallbacks: CliEditorFunctionsEditorCallbacks,
  commandPaletteRef: {| current: ?CommandPaletteInterface |},
  importExtension: ImportExtension,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  saveProject: SaveProject,
  // Resolves once the project's `gdevelop-settings.yaml` has been read and
  // applied to the preferences, so the command runner can rely on `preferences`
  // as the single source of truth without racing the project load.
  ensureProjectSettingsApplied: () => Promise<void>,
  // To create the project an agent connected to the editor works on.
  projectCreationCallbacks: CliProjectCreationCallbacks,
  openAskAi: (?OpenAskAiOptions) => void,
|};

export const useCliCommandRunner = ({
  project,
  i18n,
  fileMetadata,
  fileIdentifier,
  storageProviderName,
  resourceManagementProps,
  editorFunctionsEditorCallbacks,
  commandPaletteRef,
  importExtension,
  onWillInstallExtension,
  onExtensionInstalled,
  saveProject,
  ensureProjectSettingsApplied,
  projectCreationCallbacks,
  openAskAi,
}: Props) => {
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const preferences = React.useContext(PreferencesContext);
  const { triggerUnsavedChanges } = React.useContext(UnsavedChangesContext);
  const {
    loginState,
    profile,
    onLogin,
    authenticationError,
  } = React.useContext(AuthenticatedUserContext);
  const loginRef = React.useRef({
    loginState,
    profile,
    onLogin,
    authenticationError,
  });
  loginRef.current = { loginState, profile, onLogin, authenticationError };
  const cliLoginPromiseRef = React.useRef<Promise<void> | null>(null);
  // What `RUN_AI_REQUEST` reads once the request is finished: the project is
  // then usually not the one (if any) opened when the command started.
  const latestStateRef = React.useRef({
    project,
    profile,
    fileMetadata,
    storageProviderName,
    projectCreationCallbacks,
    openAskAi,
    preferences,
  });
  latestStateRef.current = {
    project,
    profile,
    fileMetadata,
    storageProviderName,
    projectCreationCallbacks,
    openAskAi,
    preferences,
  };
  const ensureLoginSettled = React.useCallback(async () => {
    const startTime = Date.now();
    const isWaiting = () =>
      Date.now() - startTime < CLI_LOGIN_SETTLE_TIMEOUT_MS;
    const loginForm = readCliLoginForm();
    while (
      // An account to log in with is only used once it is known that nobody
      // is logged in.
      (loginForm
        ? loginRef.current.loginState !== 'done'
        : loginRef.current.loginState === 'loggingIn') &&
      isWaiting()
    ) {
      await delay(200);
    }
    if (!loginForm) return;

    const loggedInProfile = loginRef.current.profile;
    if (loggedInProfile) {
      if (loggedInProfile.email.toLowerCase() !== loginForm.email.toLowerCase())
        console.warn(
          '[CLI] A user is already logged in: the account given in the environment variables is not used.'
        );
      return;
    }
    if (!cliLoginPromiseRef.current) {
      console.info(
        '[CLI] Logging in with the account given in the environment variables...'
      );
      cliLoginPromiseRef.current = loginRef.current.onLogin(loginForm);
    }
    await cliLoginPromiseRef.current;
    while (!loginRef.current.profile && isWaiting()) {
      if (loginRef.current.authenticationError) break;
      await delay(200);
    }
    if (!loginRef.current.profile) {
      const { authenticationError } = loginRef.current;
      console.error(
        `[CLI] Could not log in with the account given in the environment variables${
          authenticationError ? `: ${authenticationError.code}` : '.'
        }`
      );
    }
  }, []);
  const editorFunctionsServices = useEditorFunctionsServices({
    project,
    i18n,
    fileMetadata,
    resourceManagementProps,
    onWillInstallExtension,
    onExtensionInstalled,
  });

  // Not memoized by MainFrame: the latest ones are read when the calls run.
  const editorFunctionsEditorCallbacksRef = React.useRef(
    editorFunctionsEditorCallbacks
  );
  editorFunctionsEditorCallbacksRef.current = editorFunctionsEditorCallbacks;

  const runEditorFunctionCalls = React.useCallback(
    (
      functionCalls: Array<CliEditorFunctionCall>,
      { runScriptReadOnly }: {| runScriptReadOnly: boolean |}
    ): Promise<CliEditorFunctionCallsReport> => {
      if (!project) throw new Error('No project is opened.');
      return runCliEditorFunctionCalls({
        project,
        i18n,
        functionCalls,
        runScriptReadOnly,
        collaborators: {
          ...editorFunctionsEditorCallbacksRef.current,
          services: editorFunctionsServices,
          eventsFunctionsExtensionsState,
          onWillInstallExtension,
          onExtensionInstalled,
          onExtensionsRegenerated: triggerUnsavedChanges,
        },
      });
    },
    [
      project,
      i18n,
      editorFunctionsServices,
      eventsFunctionsExtensionsState,
      onWillInstallExtension,
      onExtensionInstalled,
      triggerUnsavedChanges,
    ]
  );

  // The MCP server runs for the whole session: it must use the latest
  // callbacks (the editor services need the user profile, fetched after the
  // startup), not the ones captured when the command started.
  const runEditorFunctionCallsRef = React.useRef(runEditorFunctionCalls);
  runEditorFunctionCallsRef.current = runEditorFunctionCalls;
  const saveProjectRef = React.useRef(saveProject);
  saveProjectRef.current = saveProject;
  const latestRunEditorFunctionCalls: RunEditorFunctionCalls = React.useCallback(
    (functionCalls, options) =>
      runEditorFunctionCallsRef.current(functionCalls, options),
    []
  );
  const latestSaveProject: SaveProject = React.useCallback(
    options => saveProjectRef.current(options),
    []
  );

  const { onMcpProjectReady } = useMcpServers({
    i18n,
    project,
    fileIdentifier,
    storageProviderName,
    projectCreationCallbacks,
    runEditorFunctionCalls: latestRunEditorFunctionCalls,
    saveProject: latestSaveProject,
    openAskAi,
  });

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
      // Run by its own effect (it can start without a project).
      if (commandName === RUN_AI_REQUEST_COMMAND_NAME) return;

      cliCommandRanRef.current = true;
      const keepOpen = !!appArguments['keep-open'];

      runCliCommand({
        project,
        i18n,
        commandName,
        commandArgs: getCommandArgs(),
        cliOptions: getCliOptions(appArguments),
        isRunInOpenedEditor: false,
        runEditorFunctionCalls: latestRunEditorFunctionCalls,
        triggerUnsavedChanges,
        onMcpProjectReady,
        eventsFunctionsExtensionsState,
        commandPaletteRef,
        preferences,
        importExtension,
        onWillInstallExtension,
        onExtensionInstalled,
        saveProject: latestSaveProject,
        ensureProjectSettingsApplied,
        ensureLoginSettled,
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
      latestSaveProject,
      ensureProjectSettingsApplied,
      ensureLoginSettled,
      latestRunEditorFunctionCalls,
      triggerUnsavedChanges,
      onMcpProjectReady,
    ]
  );

  React.useEffect(
    () => {
      if (cliCommandRanRef.current) return;
      const appArguments = Window.getArguments();
      if (appArguments['run-command'] !== RUN_AI_REQUEST_COMMAND_NAME) return;
      // When a project is given, the request is made on it: wait for it.
      const expectsProject = cliExpectsProject(appArguments);
      if (expectsProject && !project) return;

      cliCommandRanRef.current = true;
      const keepOpen = !!appArguments['keep-open'];
      const cliOptions = getCliOptions(appArguments);

      (async () => {
        let exitCode = 0;
        try {
          const commandArgs = getCommandArgs();
          if (commandArgs.length !== 1) {
            throw new Error(
              '[CLI] RUN_AI_REQUEST requires the request (a JSON file, inline JSON or - for stdin) via --cmd-args.'
            );
          }
          const input = parseCliAiRequestInput(
            JSON.parse(await readCliInput(commandArgs[0]))
          );

          if (expectsProject) {
            if (
              !(await ensureProjectExtensionsReadyForCli(
                eventsFunctionsExtensionsState
              ))
            ) {
              throw new Error('[CLI] The project extensions failed to load.');
            }
            await ensureProjectSettingsApplied();
          }

          // The request is made by the logged in user.
          await ensureLoginSettled();
          const loginStartTime = Date.now();
          while (
            !latestStateRef.current.profile &&
            Date.now() - loginStartTime < CLI_LOGIN_SETTLE_TIMEOUT_MS
          ) {
            await delay(200);
          }
          if (!latestStateRef.current.profile) {
            throw new Error(
              '[CLI] RUN_AI_REQUEST requires a user logged in GDevelop (or an account given with the GDEVELOP_CLI_EMAIL and GDEVELOP_CLI_PASSWORD environment variables).'
            );
          }

          if (!expectsProject && latestStateRef.current.project) {
            throw new Error(
              '[CLI] A project is opened while none was given: the AI request was not run on it.'
            );
          }

          if (
            input.payWithCredits &&
            !latestStateRef.current.preferences.values
              .automaticallyUseCreditsForAiRequests
          ) {
            latestStateRef.current.preferences.setAutomaticallyUseCreditsForAiRequests(
              true
            );
            await delay(200);
          }

          latestStateRef.current.openAskAi({
            aiRequestId: null,
            paneIdentifier: 'center',
          });
          const requestResult = await runAutomatedAiRequest({
            userRequest: input.userRequest,
            aiConfigurationPresetId: input.aiConfigurationPresetId,
            toolsVersion: input.toolsVersion,
            continueMessage: input.continueMessage,
            maxUserContinues: input.maxUserContinues,
            timeoutMs: input.timeoutMs,
          });
          console.info(
            `[CLI] AI request ${requestResult.aiRequestId || ''} ${
              requestResult.status
            } after ${Math.round(requestResult.durationMs / 1000)}s.`
          );

          const result: { [string]: any } = { ...requestResult };
          const finalProject = latestStateRef.current.project;
          if (finalProject) {
            result.projectName = finalProject.getName();
            result.storageProviderName =
              latestStateRef.current.storageProviderName;
            const finalFileMetadata = latestStateRef.current.fileMetadata;
            result.fileIdentifier = finalFileMetadata
              ? finalFileMetadata.fileIdentifier
              : null;

            if (input.judgeTestSource) {
              try {
                const judgeResults = await runProjectGameplayTests({
                  project: finalProject,
                  tests: [
                    {
                      scope: { type: 'project' },
                      testName: 'Judge',
                      source: input.judgeTestSource,
                    },
                  ],
                  options: { screenshots: 'on', closeFrameWhenFinished: true },
                });
                result.judgeTestStatus = judgeResults[0]
                  ? judgeResults[0].status
                  : null;
                result.judgeTestErrors = judgeResults[0]
                  ? judgeResults[0].errors
                  : [];
                if (input.outputDirectory && path) {
                  result.judgeTestResultsPath = writeCliGameplayTestResults(
                    finalProject,
                    judgeResults,
                    path.join(input.outputDirectory, 'judge-test-results.json')
                  );
                }
              } catch (error) {
                console.error('[CLI] The judge test could not be run:', error);
                result.judgeTestStatus = 'error';
                result.judgeTestErrors = [error.message || String(error)];
              }
            }

            // Done last: the project opened is then this copy.
            if (input.localCopyPath && path) {
              try {
                const localCopyPath = path.resolve(input.localCopyPath);
                const localFileMetadata = await latestStateRef.current.projectCreationCallbacks.saveProjectAsWithStorageProvider(
                  {
                    requestedStorageProvider: LocalFileStorageProvider,
                    forcedSavedAsLocation: { fileIdentifier: localCopyPath },
                  }
                );
                result.localCopyPath = localFileMetadata ? localCopyPath : null;
              } catch (error) {
                console.error(
                  '[CLI] The copy of the project could not be saved:',
                  error
                );
                result.localCopyPath = null;
              }
            }
          }

          await writeCliCommandResult(cliOptions, result);
          if (requestResult.status !== 'finished') exitCode = 1;
        } catch (error) {
          console.error('[CLI] Command "RUN_AI_REQUEST" failed:', error);
          exitCode = 1;
        }
        if (!keepOpen) exitApp(exitCode);
      })();
    },
    [
      project,
      eventsFunctionsExtensionsState,
      ensureProjectSettingsApplied,
      ensureLoginSettled,
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
          commandOptions,
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
          cliOptions: getCliOptions(commandOptions || {}),
          isRunInOpenedEditor: true,
          runEditorFunctionCalls: latestRunEditorFunctionCalls,
          triggerUnsavedChanges,
          onMcpProjectReady,
          eventsFunctionsExtensionsState,
          commandPaletteRef,
          preferences,
          importExtension,
          onWillInstallExtension,
          onExtensionInstalled,
          saveProject: latestSaveProject,
          ensureProjectSettingsApplied,
          ensureLoginSettled,
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
      latestSaveProject,
      ensureProjectSettingsApplied,
      ensureLoginSettled,
      latestRunEditorFunctionCalls,
      triggerUnsavedChanges,
      onMcpProjectReady,
    ]
  );

  React.useEffect(
    () => {
      if (!Window.isRunningCommandFromCli()) return;
      if (project) return;
      const appArguments = Window.getArguments();
      if (
        appArguments['run-command'] === RUN_AI_REQUEST_COMMAND_NAME &&
        !cliExpectsProject(appArguments)
      ) {
        // No project is opened until the AI creates one.
        return;
      }
      const timer = setTimeout(() => {
        console.error('[CLI] Project failed to load within timeout. Exiting.');
        exitApp(1);
      }, CLI_PROJECT_LOAD_TIMEOUT_MS);
      return () => clearTimeout(timer);
    },
    [project]
  );
};
