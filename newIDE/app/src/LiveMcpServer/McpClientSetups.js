// @flow

export type McpClientId =
  | 'claude-code'
  | 'cursor'
  | 'vscode'
  | 'gemini-cli'
  | 'codex'
  | 'other';

export type McpClientSetup = {|
  clientId: McpClientId,
  name: string,
  // A command to run in a terminal, or a configuration to add to a file.
  kind: 'command' | 'configuration',
  // Where the configuration goes (`kind: 'configuration'`).
  configurationFilePath: string | null,
  text: string,
|};

const SERVER_NAME = 'gdevelop';

export const getMcpClientSetups = ({
  url,
  token,
}: {|
  url: string,
  token: string,
|}): Array<McpClientSetup> => {
  const authorization = `Bearer ${token}`;
  const headers = { Authorization: authorization };
  return [
    {
      clientId: 'claude-code',
      name: 'Claude Code',
      kind: 'command',
      configurationFilePath: null,
      text: `claude mcp add --scope user --transport http ${SERVER_NAME} ${url} --header "Authorization: ${authorization}"`,
    },
    {
      clientId: 'cursor',
      name: 'Cursor',
      kind: 'configuration',
      configurationFilePath: '~/.cursor/mcp.json',
      text: JSON.stringify(
        { mcpServers: { [SERVER_NAME]: { url, headers } } },
        null,
        2
      ),
    },
    {
      // A configuration rather than `code --add-mcp`, whose JSON argument
      // can't be quoted the same way in every shell.
      clientId: 'vscode',
      name: 'VS Code',
      kind: 'configuration',
      configurationFilePath: null,
      text: JSON.stringify(
        { servers: { [SERVER_NAME]: { type: 'http', url, headers } } },
        null,
        2
      ),
    },
    {
      clientId: 'gemini-cli',
      name: 'Gemini CLI',
      kind: 'command',
      configurationFilePath: null,
      text: `gemini mcp add --scope user --transport http --header "Authorization: ${authorization}" ${SERVER_NAME} ${url}`,
    },
    {
      clientId: 'codex',
      name: 'Codex',
      kind: 'configuration',
      configurationFilePath: '~/.codex/config.toml',
      text: [
        `[mcp_servers.${SERVER_NAME}]`,
        `url = "${url}"`,
        `http_headers = { "Authorization" = "${authorization}" }`,
      ].join('\n'),
    },
    {
      clientId: 'other',
      name: 'Other',
      kind: 'configuration',
      configurationFilePath: null,
      text: JSON.stringify(
        { mcpServers: { [SERVER_NAME]: { type: 'http', url, headers } } },
        null,
        2
      ),
    },
  ];
};

const knownClientNames: { [string]: string } = {
  'claude-code': 'Claude Code',
  cursor: 'Cursor',
};

/** A readable name for the `clientInfo.name` an agent gives when connecting. */
export const getMcpClientDisplayName = (clientName: ?string): ?string => {
  if (!clientName) return null;
  return knownClientNames[clientName.toLowerCase()] || clientName;
};
