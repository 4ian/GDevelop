namespace gdjs {
  const _console = {
    info: console.log,
    warning: console.warn,
    error: console.error,
  };

  /**
   * Internal method for logging messages to the JS console or the Debugger if available.
   * Should be used in engine code or extensions, console.log is fine for JS events.
   */
  export let log = (
    group: string,
    message: string,
    type: 'info' | 'warning' | 'error' = 'info',
    internal = true
  ): void => {
    const logger = _console[type] || _console.info;
    logger(`[${group}] ${message}`);
  };

  function objectsToString(objects: any[]): string {
    return objects.reduce(
      (accumulator, value) => accumulator + value.toString(),
      ''
    );
  }

  /**
   * A Console API like class for logging using GDevelop's logger.
   */
  export class Logger {
    private readonly group: string;
    constructor(group: string) {
      this.group = group;
    }

    log(...messages: any[]): void {
      this.info(...messages);
    }

    info(...messages: any[]): void {
      log(this.group, objectsToString(messages), 'info');
    }

    warn(...messages: any[]): void {
      log(this.group, objectsToString(messages), 'warning');
    }

    error(...messages: any[]): void {
      log(this.group, objectsToString(messages), 'error');
    }
  }
}
