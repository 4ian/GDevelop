// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type CommandPaletteInterface } from '../CommandPalette/CommandPalette';
import { exportLocalHtml5Headless } from '../ExportAndShare/Headless/ExportLocalHtml5Headless';
import Window from '../Utils/Window';
import optionalRequire from '../Utils/OptionalRequire';

const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

// Commands registered here are awaited by the CLI dispatcher so the process
// exits with a meaningful code. Unregistered commands fall back to
// fire-and-forget via launchCommand.
export type CliCommandRunner = (
  project: gdProject,
  i18n: I18nType
) => Promise<void>;

const runners: { [commandName: string]: CliCommandRunner } = {
  EXPORT_HTML5_EXTERNAL: async (project, i18n) => {
    await exportLocalHtml5Headless({ project, i18n });
  },
};

export const getAwaitableCliRunner = (commandName: string): ?CliCommandRunner =>
  runners[commandName] || null;

const CLI_PROJECT_LOAD_TIMEOUT_MS = 120_000;
const FIRE_AND_FORGET_GRACE_MS = 1500;

const exitApp = (exitCode: number) => {
  if (ipcRenderer) ipcRenderer.send('app-exit', exitCode);
};

type Props = {|
  project: ?gdProject,
  i18n: I18nType,
  commandPaletteRef: {| current: ?CommandPaletteInterface |},
|};

export const useCliCommandRunner = ({
  project,
  i18n,
  commandPaletteRef,
}: Props) => {
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

      const run = async () => {
        try {
          const awaitableRunner = getAwaitableCliRunner(commandName);
          if (awaitableRunner) {
            await awaitableRunner(project, i18n);
            console.info(
              `[CLI] Command "${commandName}" finished successfully.`
            );
            if (!keepOpen) exitApp(0);
            return;
          }

          if (
            commandPaletteRef.current &&
            commandPaletteRef.current.launchCommand
          ) {
            commandPaletteRef.current.launchCommand((commandName: any));
            console.info(
              `[CLI] Command "${commandName}" dispatched (fire-and-forget).`
            );
            if (!keepOpen)
              setTimeout(() => exitApp(0), FIRE_AND_FORGET_GRACE_MS);
            return;
          }

          console.error(
            `[CLI] Command "${commandName}" could not be dispatched: command palette not ready.`
          );
          if (!keepOpen) exitApp(1);
        } catch (error) {
          console.error(`[CLI] Command "${commandName}" failed:`, error);
          if (!keepOpen) exitApp(1);
        }
      };

      run();
    },
    [project, i18n, commandPaletteRef]
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
