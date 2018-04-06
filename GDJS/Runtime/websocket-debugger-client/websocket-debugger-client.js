gdjs.WebsocketDebuggerClient = function(runtimegame) {
  this._runtimegame = runtimegame;

  if (typeof WebSocket !== 'undefined') {
    var that = this;
    var ws = (this._ws = new WebSocket('ws://127.0.0.1:3030/'));

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
          runtimegame.pause(false);
        } else if (data.command === 'pause') {
          runtimegame.pause(true);
          that.sendRuntimeGameDump();
        } else {
          console.info(
            'Unknown command "' + data.command + '" received by the debugger.'
          );
        }
      } else {
        console.info('Debugger received a message with badly formatted data.');
      }
    };
  } else {
    console.log("WebSocket is not defined, debugger won't work");
  }
};

gdjs.DebuggerClient = gdjs.WebsocketDebuggerClient; //Register the class to let the engine use it.

gdjs.WebsocketDebuggerClient.prototype.sendRuntimeGameDump = function() {
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

  // This is an alternative to JSON.stringify that ensure that circular reference
  // are replaced by a placeholder.
  function circularSafeStringify(obj, replacer, spaces, cycleReplacer) {
    return JSON.stringify(
      obj,
      depthLimitedSerializer(replacer, cycleReplacer, 18),
      spaces
    );
  }

  function depthLimitedSerializer(replacer, cycleReplacer, maxDepth) {
    var stack = [],
      keys = [];

    if (cycleReplacer == null)
      cycleReplacer = function(key, value) {
        if (stack[0] === value) return '[Circular ~]';
        return (
          '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']'
        );
      };

    return function(key, value) {
      if (stack.length > 0) {
        var thisPos = stack.indexOf(this);
        ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
        ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);

        if (thisPos > maxDepth) {
          return '[Max depth reached]';
        } else if (~stack.indexOf(value))
          value = cycleReplacer.call(this, key, value);
      } else stack.push(value);

      return replacer == null ? value : replacer.call(this, key, value);
    };
  }

  // Stringify the message, excluding some known data that are big and/or not
  // useful for the debugger.
  var excludedValues = [that._runtimegame.getGameData()];
  var excludedKeys = [
    // Exclude some RuntimeScene fields:
    '_allInstancesList',
    '_initialObjectsData',

    // Exclude circular references to parent runtimeGame or runtimeScene:
    '_runtimeGame',
    '_runtimeScene',

    // Exclude rendering related objects:
    '_renderer',
    '_imageManager',

    // Exclude PIXI textures:
    'baseTexture',
    '_baseTexture',
    '_invalidTexture',
  ];
  var stringifiedMessage = circularSafeStringify(message, function(key, value) {
    if (
      excludedValues.indexOf(value) !== -1 ||
      excludedKeys.indexOf(key) !== -1
    )
      return '[Removed from the debugger]';

    return value;
  });

  var serializationDuration = Date.now() - serializationStartTime;
  console.log('RuntimeGame serialization took ' + serializationDuration + 'ms');
  if (serializationDuration > 500) {
    console.warn(
      'Serialization took a long time: please check if there is a need to remove some objects from serialization'
    );
  }

  this._ws.send(stringifiedMessage);
};
