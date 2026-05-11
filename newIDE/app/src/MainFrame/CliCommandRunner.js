// @flow
import { type I18n as I18nType } from '@lingui/core';
import { exportLocalHtml5Headless } from '../ExportAndShare/Headless/exportLocalHtml5Headless';

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
