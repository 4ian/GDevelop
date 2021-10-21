// @flow
import { type Log, LogsManager } from '../Debugger/DebuggerConsole';

class MockLogsManager extends LogsManager {
  logs: Array<Log> = [
    {
      message: 'Only a message',
      group: '',
      type: 'info',
      timestamp: 120000.1234,
    },
    {
      message:
        'This is a veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy long message',
      group: '',
      type: 'info',
      timestamp: 120000.1,
    },
    {
      message: 'A warning!',
      group: '',
      type: 'warning',
      timestamp: 120000,
    },
    {
      message: 'An internal error message',
      group: 'Grouped error',
      type: 'error',
      timestamp: 42123.456789,
      internal: true,
    },
    {
      message: 'A regular message',
      group: 'Regular group',
      type: 'info',
      timestamp: 20000,
      internal: false,
    },
  ];
  groups = new Set<string>(['Grouped error', 'Regular group']);
  on() {}
  off() {}
  addLog() {}
}

export default new MockLogsManager();
