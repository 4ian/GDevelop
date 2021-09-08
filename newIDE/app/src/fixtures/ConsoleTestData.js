class MockLogsManager {
  logs = [
    {
      message: 'Only a message',
    },
    {
      message: 'A warning!',
      type: 'warning',
    },
    {
      message: 'An internal and',
      group: 'Grouped error',
      type: 'error',
      internal: true,
    },
    {
      message: 'A regular message',
      group: 'Regular group',
      internal: false,
      type: 'info',
    },
  ];
  groups = new Set(['Grouped error', 'Regular group']);
  on() {}
  off() {}
}

export default new MockLogsManager();
