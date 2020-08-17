// @ts-check
/**
 * An client side implementation of the Debugger
 * @interface
 */
gdjs.IDebuggerClient = function () {};

/**
 * Update a value, specified by a path starting from the {@link RuntimeGame} instance.
 * @param {Array<string>} path - The path of the property to modify, starting from the RuntimeGame.
 * @param {any} newValue - The new value.
 */
gdjs.IDebuggerClient.prototype.set = function (path, newValue) {};

/**
 * Call a method, specified by a path starting from the {@link RuntimeGame} instance.
 * @param {Array<string>} path - The path to the method, starting from the RuntimeGame.
 * @param {Array<any>} args - The arguments to pass the method.
 */
gdjs.IDebuggerClient.prototype.call = function (path, args) {};

/**
 * Dump all the relevant data from the {@link RuntimeGame} instance and send it to the server.
 */
gdjs.IDebuggerClient.prototype.sendRuntimeGameDump = function () {};

/**
 * Start profiling.
 */
gdjs.IDebuggerClient.prototype.sendProfilerStarted = function () {};

/**
 * Stop profiling.
 */
gdjs.IDebuggerClient.prototype.sendProfilerStopped = function () {};

/**
 * Send profiling results.
 * @param {any} framesAverageMeasures The measures made for each frames.
 * @param {any} stats Other measures done during the profiler run.
 */
gdjs.IDebuggerClient.prototype.sendProfilerOutput = function (
  framesAverageMeasures,
  stats
) {};

/**
 * This {@link IDebuggerClient} connects to a websocket server, can dump
 * the data of the current game, and receive message to change a field or
 * call a function, specified by a path from the {@link RuntimeGame}.
 *
 * @memberof gdjs
 * @implements {gdjs.IDebuggerClient}
 * @class WebsocketDebuggerClient
 * @param {gdjs.RuntimeGame} runtimeGame -  The `gdjs.RuntimeGame` to be debugged
 */
gdjs.WebsocketDebuggerClient = function (runtimeGame) {
  this._runtimegame = runtimeGame;
  this._hotReloader = new gdjs.HotReloader(runtimeGame);

  if (typeof WebSocket === 'undefined') {
    console.log("WebSocket is not defined, debugger won't work");
    return;
  }

  var that = this;
  var ws = null;
  try {
    // Find the WebSocket server to connect to using the address that was stored
    // in the options by the editor. If not, try the default address, though it's unlikely
    // to work - which is ok, the game can run without a debugger server.
    var runtimeGameOptions = this._runtimegame.getAdditionalOptions();
    var address =
      (runtimeGameOptions && runtimeGameOptions.debuggerServerAddress) ||
      '127.0.0.1';
    var port =
      (runtimeGameOptions && runtimeGameOptions.debuggerServerPort) || '3030';
    ws = this._ws = new WebSocket('ws://' + address + ':' + port + '/');
  } catch (e) {
    console.log(
      "WebSocket could not initialize, debugger/hot-reload won't work (might be because of preview inside web browser)."
    );
    return;
  }

  ws.onopen = function open() {
    console.info('Debugger connection open');
  };

  ws.onclose = function close() {
    console.info('Debugger connection closed');
  };

  ws.onerror = function errored(error) {
    console.warn('Debugger client error:', error);
  };

  ws.onmessage = function incoming(message) {
    var data = null;
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
      console.info('Debugger received a message with badly formatted data.');
    }
  };
  return;
};

gdjs.DebuggerClient = gdjs.WebsocketDebuggerClient; //Register the class to let the engine use it.

gdjs.WebsocketDebuggerClient.prototype.set = function (path, newValue) {
  if (!path || !path.length) {
    console.warn('No path specified, set operation from debugger aborted');
    return false;
  }

  var object = this._runtimegame;
  var currentIndex = 0;
  while (currentIndex < path.length - 1) {
    var key = path[currentIndex];
    if (!object || !object[key]) {
      console.error('Incorrect path specified. No ' + key + ' in ', object);
      return false;
    }

    object = object[key];
    currentIndex++;
  }

  // Ensure the newValue is properly typed to avoid breaking anything in
  // the game engine.
  var currentValue = object[path[currentIndex]];
  if (typeof currentValue === 'number') {
    newValue = parseFloat(newValue);
  } else if (typeof currentValue === 'string') {
    newValue = '' + newValue;
  }

  console.log('Updating', path, 'to', newValue);
  object[path[currentIndex]] = newValue;
  return true;
};

gdjs.WebsocketDebuggerClient.prototype.call = function (path, args) {
  if (!path || !path.length) {
    console.warn('No path specified, call operation from debugger aborted');
    return false;
  }

  var object = this._runtimegame;
  var currentIndex = 0;
  while (currentIndex < path.length - 1) {
    var key = path[currentIndex];
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
};

gdjs.WebsocketDebuggerClient.prototype.sendRuntimeGameDump = function () {
  if (!this._ws) {
    console.warn('No connection to debugger opened to send RuntimeGame dump');
    return;
  }

  var that = this;
  var message = {
    command: 'dump',
    payload: this._runtimegame,
  };

  var serializationStartTime = Date.now();

  // Stringify the message, excluding some known data that are big and/or not
  // useful for the debugger.
  var excludedValues = [that._runtimegame.getGameData()];
  var excludedKeys = [
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
    'linkedObjectsManager', // Could be improved by using private fields and excluding these (_)

    // Exclude some behaviors data:
    '_platformRBush', // PlatformBehavior
    'HSHG', // Pathfinding
    '_obstaclesHSHG', // Pathfinding
    'owner', // Avoid circular reference from behavior to parent runtimeObject

    // Exclude rendering related objects:
    '_renderer',
    '_imageManager',

    // Exclude PIXI textures:
    'baseTexture',
    '_baseTexture',
    '_invalidTexture',
  ];
  var stringifiedMessage = this._circularSafeStringify(
    message,
    function (key, value) {
      if (
        excludedValues.indexOf(value) !== -1 ||
        excludedKeys.indexOf(key) !== -1
      )
        return '[Removed from the debugger]';

      return value;
    },
    18 /* Limit maximum depth to prevent any crashes */
  );

  var serializationDuration = Date.now() - serializationStartTime;
  console.log('RuntimeGame serialization took ' + serializationDuration + 'ms');
  if (serializationDuration > 500) {
    console.warn(
      'Serialization took a long time: please check if there is a need to remove some objects from serialization'
    );
  }

  this._ws.send(stringifiedMessage);
};

gdjs.WebsocketDebuggerClient.prototype.sendHotReloaderLogs = function (logs) {
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
};

gdjs.WebsocketDebuggerClient.prototype.sendProfilerStarted = function () {
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
};

gdjs.WebsocketDebuggerClient.prototype.sendProfilerStopped = function () {
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
};

gdjs.WebsocketDebuggerClient.prototype.sendProfilerOutput = function (
  framesAverageMeasures,
  stats
) {
  if (!this._ws) {
    console.warn('No connection to debugger opened to send profiler measures');
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
};

/**
 * A function used to replace circular references with a new value.
 * @callback DebuggerClientCycleReplacer
 * @param {string | number} key - The key corresponding to the value.
 * @param {any} value - The value.
 * @returns {any} The new value.
 */

/**
 * This is an alternative to JSON.stringify that ensure that circular references
 * are replaced by a placeholder.
 * @param {any} obj - The object to serialize.
 * @param {Function} [replacer] - A function called for each property on the object or array being stringified, with the property key and its value, and that returns the new value. If not specified, values are not altered.
 * @param {number} [maxDepth] - The maximum depth, after which values are replaced by a string ("[Max depth reached]"). If not specified, there is no maximum depth.
 * @param {number} [spaces] - The number of spaces for indentation.
 * @param {DebuggerClientCycleReplacer} [cycleReplacer] - Function used to replace circular references with a new value.
 */
gdjs.WebsocketDebuggerClient.prototype._circularSafeStringify = function (
  obj,
  replacer,
  maxDepth,
  spaces,
  cycleReplacer
) {
  return JSON.stringify(
    obj,
    // @ts-ignore
    this._depthLimitedSerializer(replacer, cycleReplacer, maxDepth),
    spaces
  );
};

/**
 * Generates a JSON serializer that prevent circular references and stop if maxDepth is reached.
 * @param {Function} [replacer] - A function called for each property on the object or array being stringified, with the property key and its value, and that returns the new value. If not specified, values are not altered.
 * @param {DebuggerClientCycleReplacer} [cycleReplacer] - Function used to replace circular references with a new value.
 * @param {number} [maxDepth] - The maximum depth, after which values are replaced by a string ("[Max depth reached]"). If not specified, there is no maximum depth.
 * @returns {Function}
 */
gdjs.WebsocketDebuggerClient.prototype._depthLimitedSerializer = function (
  replacer,
  cycleReplacer,
  maxDepth
) {
  var stack = [],
    keys = [];

  if (cycleReplacer === undefined || cycleReplacer === null)
    cycleReplacer = function (key, value) {
      if (stack[0] === value) return '[Circular ~]';
      return (
        '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']'
      );
    };

  return function (key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this);
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);

      if (maxDepth != null && thisPos > maxDepth) {
        return '[Max depth reached]';
      } else if (~stack.indexOf(value))
        // @ts-ignore
        value = cycleReplacer.call(this, key, value);
    } else stack.push(value);

    return replacer == null ? value : replacer.call(this, key, value);
  };
};
