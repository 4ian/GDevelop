class MockLogsManager {
  logs = [
    {
      message: 'Only a message',
      timestamp: 120000.1234,
    },
    {
      message:
        'This is a veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy veeeeeryy long message',
      timestamp: 120000.1,
    },
    {
      message: 'A warning!',
      type: 'warning',
      timestamp: 120000,
    },
    {
      message: 'An internal error message',
      group: 'Grouped error',
      type: 'error',
      internal: true,
      timestamp: 42123.456789,
    },
    {
      message: 'A regular message',
      group: 'Regular group',
      internal: false,
      type: 'info',
      timestamp: 20000,
    },
  ];
  groups = new Set(['Grouped error', 'Regular group']);
  on() {}
  off() {}
}

export default new MockLogsManager();
