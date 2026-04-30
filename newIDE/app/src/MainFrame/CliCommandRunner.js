// @flow
import { type I18n as I18nType } from '@lingui/core';
import { exportLocalHtml5Headless } from '../ExportAndShare/Headless/exportLocalHtml5Headless';

/**
 * Runner for a Command Palette command invoked via the `--run-command` CLI
 * flag. Returns a Promise so the CLI dispatcher can await completion and
 * exit the process with a meaningful exit code.
 *
 * This is the path used for "awaitable" commands. Commands not registered
 * here will fall back to the regular fire-and-forget `launchCommand` path.
 */
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
