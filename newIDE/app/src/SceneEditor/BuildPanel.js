// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { Column, Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import Paper from '../UI/Paper';
import CommandsContext from '../CommandPalette/CommandsContext';
import { type CommandName } from '../CommandPalette/CommandsList';
import HammerIcon from '../UI/CustomSvgIcons/Hammer';
import PublishIcon from '../UI/CustomSvgIcons/Publish';
import WrenchIcon from '../UI/CustomSvgIcons/Wrench';

const styles = {
  container: {
    padding: 12,
  },
  header: {
    marginBottom: 12,
  },
  headerIcon: {
    width: 18,
    height: 18,
  },
  card: {
    padding: 12,
  },
  cardTitleRow: {
    marginBottom: 6,
  },
  cardIcon: {
    width: 16,
    height: 16,
  },
  cardActions: {
    marginTop: 8,
  },
  description: {
    opacity: 0.7,
  },
};

const BuildPanel = (): React.Node => {
  const commandManager = React.useContext(CommandsContext);

  const getCommand = React.useCallback(
    (commandName: CommandName) => {
      if (!commandManager || !commandManager.getNamedCommand) return null;
      return commandManager.getNamedCommand(commandName);
    },
    [commandManager]
  );

  const canRun = React.useCallback(
    (commandName: CommandName) => {
      const command = getCommand(commandName);
      return !!(command && command.handler);
    },
    [getCommand]
  );

  const runCommand = React.useCallback(
    (commandName: CommandName) => {
      const command = getCommand(commandName);
      if (command && command.handler) command.handler();
    },
    [getCommand]
  );

  return (
    <Column noMargin expand>
      <Paper background="medium" square style={styles.container}>
        <Line noMargin alignItems="center" style={styles.header}>
          <HammerIcon style={styles.headerIcon} />
          <Spacer />
          <Text size="block-title" noMargin>
            <Trans>Build & Publish</Trans>
          </Text>
        </Line>
        <Column noMargin expand>
          <Paper background="light" style={styles.card}>
            <Line noMargin alignItems="center" style={styles.cardTitleRow}>
              <WrenchIcon style={styles.cardIcon} />
              <Spacer />
              <Text noMargin size="body">
                <Trans>Preview</Trans>
              </Text>
            </Line>
            <Text noMargin size="body-small" style={styles.description}>
              <Trans>
                Run your game locally to validate gameplay and performance.
              </Trans>
            </Text>
            <Line noMargin style={styles.cardActions}>
              <RaisedButton
                primary
                label={<Trans>Launch preview</Trans>}
                onClick={() => runCommand('LAUNCH_NEW_PREVIEW')}
                disabled={!canRun('LAUNCH_NEW_PREVIEW')}
              />
              <Spacer />
              <FlatButton
                label={<Trans>Debug preview</Trans>}
                onClick={() => runCommand('LAUNCH_DEBUG_PREVIEW')}
                disabled={!canRun('LAUNCH_DEBUG_PREVIEW')}
              />
            </Line>
          </Paper>
          <Spacer />
          <Paper background="light" style={styles.card}>
            <Line noMargin alignItems="center" style={styles.cardTitleRow}>
              <PublishIcon style={styles.cardIcon} />
              <Spacer />
              <Text noMargin size="body">
                <Trans>Export / Publish</Trans>
              </Text>
            </Line>
            <Text noMargin size="body-small" style={styles.description}>
              <Trans>
                Export a build, publish online, or generate platform packages.
              </Trans>
            </Text>
            <Line noMargin style={styles.cardActions}>
              <RaisedButton
                primary
                label={<Trans>Open export dialog</Trans>}
                onClick={() => runCommand('EXPORT_GAME')}
                disabled={!canRun('EXPORT_GAME')}
              />
              <Spacer />
              <FlatButton
                label={<Trans>Diagnostic report</Trans>}
                onClick={() => runCommand('OPEN_DIAGNOSTIC_REPORT')}
                disabled={!canRun('OPEN_DIAGNOSTIC_REPORT')}
              />
            </Line>
          </Paper>
          <Spacer />
          <Paper background="light" style={styles.card}>
            <Line noMargin alignItems="center" style={styles.cardTitleRow}>
              <WrenchIcon style={styles.cardIcon} />
              <Spacer />
              <Text noMargin size="body">
                <Trans>Network preview</Trans>
              </Text>
            </Line>
            <Text noMargin size="body-small" style={styles.description}>
              <Trans>
                Share a preview over your local network for rapid device testing.
              </Trans>
            </Text>
            <Line noMargin style={styles.cardActions}>
              <RaisedButton
                primary
                label={<Trans>Launch network preview</Trans>}
                onClick={() => runCommand('LAUNCH_NETWORK_PREVIEW')}
                disabled={!canRun('LAUNCH_NETWORK_PREVIEW')}
              />
            </Line>
          </Paper>
        </Column>
      </Paper>
    </Column>
  );
};

export default BuildPanel;
