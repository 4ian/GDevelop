// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import HelpButton from '../UI/HelpButton';
import { Tabs } from '../UI/Tabs';
import Text from '../UI/Text';
import Paper from '../UI/Paper';
import AlertMessage from '../UI/AlertMessage';
import Toggle from '../UI/Toggle';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import {
  getMcpClientSetups,
  getMcpClientDisplayName,
  type McpClientId,
  type McpClientSetup,
} from './McpClientSetups';
import {
  type LiveMcpServerStatus,
  type LiveMcpAgent,
} from './LiveMcpServerContext';

export const LIVE_MCP_SERVER_HELP_PAGE_PATH = '/interface/ai/mcp';

const styles = {
  code: { padding: 8, maxHeight: 220, overflowY: 'auto' },
};

const SetupInstructions = ({ setup }: {| setup: McpClientSetup |}) => {
  switch (setup.clientId) {
    case 'claude-code':
      return (
        <Trans>
          Run this command in a terminal, then start Claude Code (or run /mcp in
          a running session).
        </Trans>
      );
    case 'cursor':
      return (
        <Trans>
          Add this server to {setup.configurationFilePath} (or to the
          .cursor/mcp.json file of a project), then enable it in the MCP
          settings of Cursor.
        </Trans>
      );
    case 'vscode':
      return (
        <Trans>
          Run the "MCP: Open User Configuration" command in VS Code, add this
          server to the file, then start it from the list of MCP servers.
        </Trans>
      );
    case 'gemini-cli':
      return (
        <Trans>Run this command in a terminal, then start Gemini CLI.</Trans>
      );
    case 'codex':
      return (
        <Trans>
          Add this server to {setup.configurationFilePath}, then start Codex.
        </Trans>
      );
    default:
      return (
        <Trans>
          Most AI agents supporting MCP servers can connect to an "HTTP" (or
          "streamable HTTP") server: add a server with this address and this
          authorization header in their settings.
        </Trans>
      );
  }
};

type Props = {|
  status: ?LiveMcpServerStatus,
  connectedAgents: Array<LiveMcpAgent>,
  setEnabled: (enabled: boolean) => Promise<void>,
  resetToken: () => Promise<void>,
  onClose: () => void,
|};

const LiveMcpServerDialog = ({
  status,
  connectedAgents,
  setEnabled,
  resetToken,
  onClose,
}: Props): React.Node => {
  const [clientId, setClientId] = React.useState<McpClientId>('claude-code');
  const [copiedText, setCopiedText] = React.useState<?string>(null);
  const { showConfirmation } = useAlertDialog();

  const url = status ? status.url : null;
  const token = status ? status.token : null;
  const setups = url && token ? getMcpClientSetups({ url, token }) : [];
  const setup = setups.find(setup => setup.clientId === clientId);

  const onResetToken = async () => {
    const answer = await showConfirmation({
      title: t`Reset the access key?`,
      message: t`The AI agents set up with the current key won't be able to connect anymore: they will have to be set up again with the new one.`,
      confirmButtonLabel: t`Reset`,
    });
    if (answer) await resetToken();
  };

  return (
    <Dialog
      title={<Trans>Connect an AI agent</Trans>}
      open
      maxWidth="md"
      onRequestClose={onClose}
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary
          onClick={onClose}
        />,
      ]}
      secondaryActions={[
        <HelpButton key="help" helpPagePath={LIVE_MCP_SERVER_HELP_PAGE_PATH} />,
      ]}
    >
      <ColumnStackLayout noMargin>
        <Text noMargin>
          <Trans>
            AI agents like Claude Code, Cursor or Codex can connect to GDevelop
            (with the "MCP" protocol) to explore and edit the project opened in
            this window, with the same tools as the GDevelop AI. Their changes
            appear live in the editor.
          </Trans>
        </Text>
        <Toggle
          labelPosition="right"
          toggled={!!status && status.enabled}
          disabled={!status}
          onToggle={(e, enabled) => {
            setEnabled(enabled);
          }}
          label={
            <Trans>
              Let AI agents connect to the editor (on this computer)
            </Trans>
          }
        />
        {status && status.enabled && status.error && (
          <AlertMessage kind="error">
            <Trans>The server could not start: {status.error}</Trans>
          </AlertMessage>
        )}
        {status && status.enabled && setup && (
          <ColumnStackLayout noMargin>
            <Tabs
              value={clientId}
              onChange={setClientId}
              options={setups.map(setup => ({
                value: setup.clientId,
                label: setup.name,
              }))}
            />
            <Text noMargin>
              <SetupInstructions setup={setup} />
            </Text>
            <Paper background="dark" variant="outlined" style={styles.code}>
              <Text
                noMargin
                allowSelection
                style={{
                  fontFamily: '"Lucida Console", Monaco, monospace',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {setup.text}
              </Text>
            </Paper>
            <LineStackLayout noMargin justifyContent="space-between">
              <FlatButton
                label={<Trans>Reset the access key</Trans>}
                onClick={onResetToken}
              />
              <FlatButton
                primary
                label={
                  copiedText === setup.text ? (
                    <Trans>Copied</Trans>
                  ) : setup.kind === 'command' ? (
                    <Trans>Copy the command</Trans>
                  ) : (
                    <Trans>Copy the configuration</Trans>
                  )
                }
                onClick={() => {
                  navigator.clipboard.writeText(setup.text);
                  setCopiedText(setup.text);
                }}
              />
            </LineStackLayout>
            <AlertMessage kind="info">
              <Trans>
                The access key in this configuration lets any program of this
                computer edit your projects: don't share it. An agent works on
                the GDevelop window focused when it connects.
              </Trans>
            </AlertMessage>
            {connectedAgents.length > 0 && (
              <Text noMargin>
                <Trans>
                  Connected to this window:{' '}
                  {connectedAgents
                    .map(
                      agent =>
                        getMcpClientDisplayName(agent.clientName) || 'AI agent'
                    )
                    .join(', ')}
                </Trans>
              </Text>
            )}
          </ColumnStackLayout>
        )}
      </ColumnStackLayout>
    </Dialog>
  );
};

export default LiveMcpServerDialog;
