// @flow
import optionalRequire from '../Utils/OptionalRequire';
import Window from '../Utils/Window';
import { type LoginForm } from '../Utils/GDevelopServices/Authentication';

const remote = optionalRequire('@electron/remote');

// The account a command of the CLI logs in with when nobody is logged in:
// made for the machines where nobody can log in by hand (CI).
export const CLI_LOGIN_EMAIL_ENVIRONMENT_VARIABLE = 'GDEVELOP_CLI_EMAIL';
export const CLI_LOGIN_PASSWORD_ENVIRONMENT_VARIABLE = 'GDEVELOP_CLI_PASSWORD';

export const getCliLoginForm = (environment: {
  [string]: ?string,
}): LoginForm | null => {
  const email = (
    environment[CLI_LOGIN_EMAIL_ENVIRONMENT_VARIABLE] || ''
  ).trim();
  const password = environment[CLI_LOGIN_PASSWORD_ENVIRONMENT_VARIABLE] || '';
  if (!email || !password) return null;
  return { email, password };
};

/**
 * The account to log in with, given in the environment of the editor: only
 * when it runs a command of the CLI or serves the stdio MCP server.
 */
export const readCliLoginForm = (): LoginForm | null => {
  if (!remote) return null;
  const appArguments = Window.getArguments();
  if (!appArguments['run-command'] && !appArguments['mcp']) return null;
  try {
    return getCliLoginForm(remote.process.env);
  } catch (error) {
    console.error('[CLI] Unable to read the environment variables:', error);
    return null;
  }
};
