// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import StatusChip from '../UI/StatusChip';
import { LiveMcpServerContext } from './LiveMcpServerContext';
import { getMcpClientDisplayName } from './McpClientSetups';
import classes from './ConnectedAgentsIndicator.module.css';

/**
 * Shows the AI agents (connected to the MCP server) that can edit the project
 * opened in this window.
 */
const ConnectedAgentsIndicator = (): React.Node => {
  const { connectedAgents, openSetupDialog } = React.useContext(
    LiveMcpServerContext
  );
  if (!connectedAgents.length) return null;

  const names = Array.from(
    new Set(
      connectedAgents.map(
        agent => getMcpClientDisplayName(agent.clientName) || 'AI agent'
      )
    )
  ).join(', ');
  return (
    <Tooltip
      title={
        <Trans>
          {names} can edit the project opened in this window. Click to manage
          the connection.
        </Trans>
      }
    >
      <button
        type="button"
        className={classes.trigger}
        onClick={openSetupDialog}
      >
        <StatusChip
          size="small"
          tone="success"
          icon={<span className={classes.connectedDot} />}
          label={names}
        />
      </button>
    </Tooltip>
  );
};

export default ConnectedAgentsIndicator;
