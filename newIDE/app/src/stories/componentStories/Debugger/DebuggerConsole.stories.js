// @flow
import * as React from 'react';

import {
  DebuggerConsole,
  LogsManager,
} from '../../../Debugger/DebuggerConsole';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import paperDecorator from '../../PaperDecorator';

export default {
  title: 'Debugger/DebuggerConsole',
  component: DebuggerConsole,
  decorators: [paperDecorator],
};

const makeLogsManager = (): LogsManager => {
  const manager = new LogsManager();
  manager.addLog({
    message: 'Game started',
    type: 'info',
    group: 'Game',
    timestamp: Date.now() - 5000,
  });
  manager.addLog({
    message: 'Player spawned at position (100, 200)',
    type: 'info',
    group: 'Player',
    timestamp: Date.now() - 4500,
  });
  manager.addLog({
    message: 'Loading resources...',
    type: 'info',
    group: 'Resources',
    timestamp: Date.now() - 4000,
  });
  manager.addLog({
    message: 'Texture "missing.png" not found, using fallback',
    type: 'warning',
    group: 'Resources',
    timestamp: Date.now() - 3500,
  });
  manager.addLog({
    message: 'All resources loaded',
    type: 'info',
    group: 'Resources',
    timestamp: Date.now() - 3000,
  });
  manager.addLog({
    message: 'Enemy AI initialized',
    type: 'info',
    group: 'AI',
    timestamp: Date.now() - 2500,
  });
  manager.addLog({
    message: 'Failed to connect to leaderboard server',
    type: 'error',
    group: 'Network',
    timestamp: Date.now() - 2000,
  });
  manager.addLog({
    message: 'Score saved locally',
    type: 'info',
    group: 'Game',
    timestamp: Date.now() - 1500,
  });
  manager.addLog({
    message: 'Physics simulation running at 60 FPS',
    type: 'info',
    group: 'Physics',
    timestamp: Date.now() - 1000,
  });
  manager.addLog({
    message: 'Memory usage above threshold',
    type: 'warning',
    group: 'Performance',
    timestamp: Date.now() - 500,
  });
  return manager;
};

export const WithLogs = () => {
  const logsManager = React.useMemo(() => makeLogsManager(), []);
  return (
    <FixedHeightFlexContainer height={400}>
      <DebuggerConsole logsManager={logsManager} />
    </FixedHeightFlexContainer>
  );
};

export const Empty = () => {
  const logsManager = React.useMemo(() => new LogsManager(), []);
  return (
    <FixedHeightFlexContainer height={200}>
      <DebuggerConsole logsManager={logsManager} />
    </FixedHeightFlexContainer>
  );
};

export const ManyLogs = () => {
  const logsManager = React.useMemo(() => {
    const manager = new LogsManager();
    for (let i = 0; i < 100; i++) {
      const types = ['info', 'warning', 'error'];
      const groups = ['Game', 'Player', 'AI', 'Network', 'Physics'];
      manager.addLog({
        message: `Log message number ${i + 1} with some details`,
        type: types[i % 3],
        group: groups[i % 5],
        timestamp: Date.now() - (100 - i) * 100,
      });
    }
    return manager;
  }, []);
  return (
    <FixedHeightFlexContainer height={500}>
      <DebuggerConsole logsManager={logsManager} />
    </FixedHeightFlexContainer>
  );
};
