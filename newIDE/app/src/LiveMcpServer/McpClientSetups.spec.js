// @flow
import { getMcpClientSetups, getMcpClientDisplayName } from './McpClientSetups';

describe('McpClientSetups', () => {
  const setups = getMcpClientSetups({
    url: 'http://127.0.0.1:52520/mcp',
    token: 'abc123',
  });
  const getSetupText = (clientId: string): string => {
    const setup = setups.find(setup => setup.clientId === clientId);
    if (!setup) throw new Error(`No setup for ${clientId}.`);
    return setup.text;
  };

  it('gives the command or configuration of each client', () => {
    expect(getSetupText('claude-code')).toBe(
      'claude mcp add --transport http gdevelop http://127.0.0.1:52520/mcp --header "Authorization: Bearer abc123"'
    );
    expect(getSetupText('gemini-cli')).toBe(
      'gemini mcp add --transport http --header "Authorization: Bearer abc123" gdevelop http://127.0.0.1:52520/mcp'
    );
    expect(JSON.parse(getSetupText('cursor'))).toEqual({
      mcpServers: {
        gdevelop: {
          url: 'http://127.0.0.1:52520/mcp',
          headers: { Authorization: 'Bearer abc123' },
        },
      },
    });
    expect(JSON.parse(getSetupText('vscode'))).toEqual({
      servers: {
        gdevelop: {
          type: 'http',
          url: 'http://127.0.0.1:52520/mcp',
          headers: { Authorization: 'Bearer abc123' },
        },
      },
    });
    expect(getSetupText('codex')).toBe(
      [
        '[mcp_servers.gdevelop]',
        'url = "http://127.0.0.1:52520/mcp"',
        'http_headers = { "Authorization" = "Bearer abc123" }',
      ].join('\n')
    );
  });

  it('gives a readable name to the known clients', () => {
    expect(getMcpClientDisplayName('claude-code')).toBe('Claude Code');
    expect(getMcpClientDisplayName('some-agent')).toBe('some-agent');
    expect(getMcpClientDisplayName(null)).toBe(null);
  });
});
