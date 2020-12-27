namespace gdjs {
  /**
   * An client side implementation of the Debugger
   */
  export interface IDebuggerClient {
    /**
     * Update a value, specified by a path starting from the {@link RuntimeGame} instance.
     * @param newValue - The new value.
     */
    set(path, newValue: any);

    /**
     * Call a method, specified by a path starting from the {@link RuntimeGame} instance.
     * @param path - The path to the method, starting from the RuntimeGame.
     * @param args - The arguments to pass the method.
     */
    call(path: string[], args: any[]);

    /**
     * Dump all the relevant data from the {@link RuntimeGame} instance and send it to the server.
     */
    sendRuntimeGameDump();

    /**
     * Start profiling.
     */
    sendProfilerStarted();

    /**
     * Stop profiling.
     */
    sendProfilerStopped();

    /**
     * Send profiling results.
     * @param framesAverageMeasures The measures made for each frames.
     * @param stats Other measures done during the profiler run.
     */
    sendProfilerOutput(framesAverageMeasures: any, stats: any);
  }

  /**
   * A function used to replace circular references with a new value.
   * @param key - The key corresponding to the value.
   * @param value - The value.
   * @returns The new value.
   */
  type DebuggerClientCycleReplacer = (key: string, value: any) => any;

  /**
   * This {@link IDebuggerClient} connects to a websocket server, can dump
   * the data of the current game, and receive message to change a field or
   * call a function, specified by a path from the {@link RuntimeGame}.
   *
   * @memberof gdjs
   * @class WebsocketDebuggerClient
   * @param runtimeGame -  The `gdjs.RuntimeGame` to be debugged
   */
  export class WebsocketDebuggerClient implements IDebuggerClient {
    _runtimegame: gdjs.RuntimeGame;
    _hotReloader: gdjs.HotReloader;
    _ws: WebSocket | null;

    /**
     * @param path - The path of the property to modify, starting from the RuntimeGame.
     */
    constructor(runtimeGame) {
      this._runtimegame = runtimeGame;
      this._hotReloader = new gdjs.HotReloader(runtimeGame);
      this._ws = null;
      if (typeof WebSocket === 'undefined') {
        console.log("WebSocket is not defined, debugger won't work");
        return;
      }
      const that = this;
      let ws = null;
      try {
        // Find the WebSocket server to connect to using the address that was stored
        // in the options by the editor. If not, try the default address, though it's unlikely
        // to work - which is ok, the game can run without a debugger server.
        const runtimeGameOptions = this._runtimegame.getAdditionalOptions();
        const address =
          (runtimeGameOptions && runtimeGameOptions.debuggerServerAddress) ||
          '127.0.0.1';
        const port =
          (runtimeGameOptions && runtimeGameOptions.debuggerServerPort) ||
          '3030';
        this._ws = new WebSocket('ws://' + address + ':' + port + '/');
      } catch (e) {
        console.log(
          "WebSocket could not initialize, debugger/hot-reload won't work (might be because of preview inside web browser)."
        );
        return;
      }
      this._ws.onopen = function open() {
        console.info('Debugger connection open');
      };
      this._ws.onclose = function close() {
        console.info('Debugger connection closed');
      };
      this._ws.onerror = function errored(error) {
        console.warn('Debugger client error:', error);
      };
      this._ws.onmessage = function incoming(message) {
        let data: any = null;
        try {
          data = JSON.parse(message.data);
        } catch (e) {
          console.info('Debugger received a badly formatted message');
        }
        if (data && data.command) {
          if (data.command === 'play') {
            runtimeGame.pause(false);
          } else if (data.command === 'pause') {
            runtimeGame.pause(true);
            that.sendRuntimeGameDump();
          } else if (data.command === 'refresh') {
            that.sendRuntimeGameDump();
          } else if (data.command === 'set') {
            that.set(data.path, data.newValue);
          } else if (data.command === 'call') {
            that.call(data.path, data.args);
          } else if (data.command === 'profiler.start') {
            runtimeGame.startCurrentSceneProfiler(function (stoppedProfiler) {
              that.sendProfilerOutput(
                stoppedProfiler.getFramesAverageMeasures(),
                stoppedProfiler.getStats()
              );
              that.sendProfilerStopped();
            });
            that.sendProfilerStarted();
          } else if (data.command === 'profiler.stop') {
            runtimeGame.stopCurrentSceneProfiler();
          } else if (data.command === 'hotReload') {
            that._hotReloader.hotReload().then((logs) => {
              that.sendHotReloaderLogs(logs);
            });
          } else {
            console.info(
              'Unknown command "' + data.command + '" received by the debugger.'
            );
          }
        } else {
          console.info(
            'Debugger received a message with badly formatted data.'
          );
        }
      };
      return;
    }

    set(path, newValue): boolean {
      if (!path || !path.length) {
        console.warn('No path specified, set operation from debugger aborted');
        return false;
      }
      let object = this._runtimegame;
      let currentIndex = 0;
      while (currentIndex < path.length - 1) {
        const key = path[currentIndex];
        if (!object || !object[key]) {
          console.error('Incorrect path specified. No ' + key + ' in ', object);
          return false;
        }
        object = object[key];
        currentIndex++;
      }

      // Ensure the newValue is properly typed to avoid breaking anything in
      // the game engine.
      const currentValue = object[path[currentIndex]];
      if (typeof currentValue === 'number') {
        newValue = parseFloat(newValue);
      } else {
        if (typeof currentValue === 'string') {
          newValue = '' + newValue;
        }
      }
      console.log('Updating', path, 'to', newValue);
      object[path[currentIndex]] = newValue;
      return true;
    }

    call(path, args) {
      if (!path || !path.length) {
        console.warn('No path specified, call operation from debugger aborted');
        return false;
      }
      let object = this._runtimegame;
      let currentIndex = 0;
      while (currentIndex < path.length - 1) {
        const key = path[currentIndex];
        if (!object || !object[key]) {
          console.error('Incorrect path specified. No ' + key + ' in ', object);
          return false;
        }
        object = object[key];
        currentIndex++;
      }
      if (!object[path[currentIndex]]) {
        console.error('Unable to call', path);
        return false;
      }
      console.log('Calling', path, 'with', args);
      object[path[currentIndex]].apply(object, args);
      return true;
    }

    sendRuntimeGameDump() {
      if (!this._ws) {
        console.warn(
          'No connection to debugger opened to send RuntimeGame dump'
        );
        return;
      }
      const that = this;
      const message = { command: 'dump', payload: this._runtimegame };
      const serializationStartTime = Date.now();

      // Stringify the message, excluding some known data that are big and/or not
      // useful for the debugger.
      const excludedValues = [that._runtimegame.getGameData()];
      const excludedKeys = [
        // Exclude reference to the debugger
        '_debuggerClient',
        // Exclude some RuntimeScene fields:
        '_allInstancesList',
        // Exclude circular references to parent runtimeGame or runtimeScene:
        '_runtimeGame',
        '_runtimeScene',
        // Exclude some runtimeObject duplicated data:
        '_behaviorsTable',
        // Exclude some objects data:
        '_animations',
        '_animationFrame',
        // Exclude linked objects to avoid too much repetitions:
        'linkedObjectsManager',
        // Could be improved by using private fields and excluding these (_)
        // Exclude some behaviors data:
        '_platformRBush',
        // PlatformBehavior
        'HSHG',
        // Pathfinding
        '_obstaclesHSHG',
        // Pathfinding
        'owner',
        // Avoid circular reference from behavior to parent runtimeObject
        // Exclude rendering related objects:
        '_renderer',
        '_imageManager',
        // Exclude PIXI textures:
        'baseTexture',
        '_baseTexture',
        '_invalidTexture',
      ];
      const stringifiedMessage = this._circularSafeStringify(
        message,
        function (key, value) {
          if (
            excludedValues.indexOf(value) !== -1 ||
            excludedKeys.indexOf(key) !== -1
          ) {
            return '[Removed from the debugger]';
          }
          return value;
        },
        /* Limit maximum depth to prevent any crashes */
        18
      );
      const serializationDuration = Date.now() - serializationStartTime;
      console.log(
        'RuntimeGame serialization took ' + serializationDuration + 'ms'
      );
      if (serializationDuration > 500) {
        console.warn(
          'Serialization took a long time: please check if there is a need to remove some objects from serialization'
        );
      }
      this._ws.send(stringifiedMessage);
    }

    sendHotReloaderLogs(logs) {
      if (!this._ws) {
        console.warn('No connection to debugger opened');
        return;
      }
      this._ws.send(
        this._circularSafeStringify({
          command: 'hotReloader.logs',
          payload: logs,
        })
      );
    }

    sendProfilerStarted() {
      if (!this._ws) {
        console.warn('No connection to debugger opened');
        return;
      }
      this._ws.send(
        this._circularSafeStringify({
          command: 'profiler.started',
          payload: null,
        })
      );
    }

    sendProfilerStopped() {
      if (!this._ws) {
        console.warn('No connection to debugger opened');
        return;
      }
      this._ws.send(
        this._circularSafeStringify({
          command: 'profiler.stopped',
          payload: null,
        })
      );
    }

    sendProfilerOutput(framesAverageMeasures, stats) {
      if (!this._ws) {
        console.warn(
          'No connection to debugger opened to send profiler measures'
        );
        return;
      }
      this._ws.send(
        this._circularSafeStringify({
          command: 'profiler.output',
          payload: {
            framesAverageMeasures: framesAverageMeasures,
            stats: stats,
          },
        })
      );
    }

    /**
     * This is an alternative to JSON.stringify that ensure that circular references
     * are replaced by a placeholder.
     * @param obj - The object to serialize.
     * @param [replacer] - A function called for each property on the object or array being stringified, with the property key and its value, and that returns the new value. If not specified, values are not altered.
     * @param [maxDepth] - The maximum depth, after which values are replaced by a string ("[Max depth reached]"). If not specified, there is no maximum depth.
     * @param [spaces] - The number of spaces for indentation.
     * @param [cycleReplacer] - Function used to replace circular references with a new value.
     */
    _circularSafeStringify(
      obj: any,
      replacer?: Function,
      maxDepth?: number,
      spaces?: number,
      cycleReplacer?: DebuggerClientCycleReplacer
    ) {
      return JSON.stringify(
        obj,
        // @ts-ignore
        this._depthLimitedSerializer(replacer, cycleReplacer, maxDepth),
        spaces
      );
    }

    /**
     * Generates a JSON serializer that prevent circular references and stop if maxDepth is reached.
     * @param [replacer] - A function called for each property on the object or array being stringified, with the property key and its value, and that returns the new value. If not specified, values are not altered.
     * @param [cycleReplacer] - Function used to replace circular references with a new value.
     * @param [maxDepth] - The maximum depth, after which values are replaced by a string ("[Max depth reached]"). If not specified, there is no maximum depth.
     */
    _depthLimitedSerializer(
      replacer?: Function,
      cycleReplacer?: DebuggerClientCycleReplacer,
      maxDepth?: number
    ): Function {
      const stack: Array<string> = [],
        keys: Array<string> = [];
      if (cycleReplacer === undefined || cycleReplacer === null) {
        cycleReplacer = function (key, value) {
          if (stack[0] === value) {
            return '[Circular ~]';
          }
          return (
            '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']'
          );
        };
      }

      return function (key, value) {
        if (stack.length > 0) {
          const thisPos = stack.indexOf(this);
          ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
          ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
          if (maxDepth != null && thisPos > maxDepth) {
            return '[Max depth reached]';
          } else {
            if (~stack.indexOf(value)) {
              // @ts-ignore
              value = cycleReplacer.call(this, key, value);
            }
          }
        } else {
          stack.push(value);
        }
        return replacer == null ? value : replacer.call(this, key, value);
      };
    }
  }

  //Register the class to let the engine use it.
  export const DebuggerClient = WebsocketDebuggerClient;
}
