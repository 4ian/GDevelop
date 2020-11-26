/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * @memberof gdjs.evtTools
 * @namespace network
 */
gdjs.evtTools.network = gdjs.evtTools.network || {};

/**
 * Send an asynchronous request to the specified URL, with the specified (text)
 * body, method and contentType (defaults to `application/x-www-form-urlencoded`).
 * The result is stored in the specified response variable. Any error is stored in
 * the specified error variable.
 *
 * @param {string} url The URL to send the request to.
 * @param {string} body The content to be sent.
 * @param {string} method The method to use ("GET", "POST", "PUT", "HEAD", "DELETE", "PATCH", "OPTIONS")
 * @param {string} contentType The content type. Defaults to `application/x-www-form-urlencoded` if empty.
 * @param {gdjs.Variable} responseVar The variable where to store the response text.
 * @param {gdjs.Variable} errorVar The variable where to store the error message or status code (if status >= 400).
 */
gdjs.evtTools.network.sendAsyncRequest = function (
  url,
  body,
  method,
  contentType,
  responseVar,
  errorVar
) {
  const onError = (err) => {
    errorVar.setString('' + err);
  };

  try {
    const request = new XMLHttpRequest();
    request.onerror = onError;
    request.ontimeout = onError;
    request.onabort = onError;
    request.onreadystatechange = () => {
      if (request.readyState === 4 /* "DONE" */) {
        if (request.status >= 400) {
          onError('' + request.status);
        }

        responseVar.setString(request.responseText);
      }
    };

    request.open(method, url);
    request.setRequestHeader(
      'Content-Type',
      contentType === '' ? 'application/x-www-form-urlencoded' : contentType
    );
    request.send(body);
  } catch (err) {
    onError(err);
  }
};

/** @deprecated */
gdjs.evtTools.network.sendDeprecatedSynchronousRequest = function (
  host,
  uri,
  body,
  method,
  contentType,
  responseVar
) {
  try {
    var xhr;
    if (typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
    else {
      var versions = [
        'MSXML2.XmlHttp.5.0',
        'MSXML2.XmlHttp.4.0',
        'MSXML2.XmlHttp.3.0',
        'MSXML2.XmlHttp.2.0',
        'Microsoft.XmlHttp',
      ];

      for (var i = 0, len = versions.length; i < len; i++) {
        try {
          xhr = new ActiveXObject(versions[i]);
          break;
        } catch (e) {}
      } // end for
    }

    if (xhr === undefined) return;

    xhr.open(method, host + uri, false);
    xhr.setRequestHeader(
      'Content-Type',
      contentType === '' ? 'application/x-www-form-urlencoded' : contentType
    );
    xhr.send(body);
    responseVar.setString(xhr.responseText);
  } catch (e) {}
};

/**
 * @param {gdjs.RuntimeScene} runtimeScene
 * @param {boolean} enable
 */
gdjs.evtTools.network.enableMetrics = function(runtimeScene, enable) {
  runtimeScene.getGame().enableMetrics(enable);
}

/**
 * Convert a variable to JSON.
 * TODO: Move to gdjs.Variable static
 * @param {gdjs.Variable} variable The variable to convert to JSON
 * @returns {string} The JSON string representing the variable
 */
gdjs.evtTools.network.variableStructureToJSON = function (variable) {
  if (!variable.isStructure()) {
    if (variable.isNumber()) return JSON.stringify(variable.getAsNumber());
    else return JSON.stringify(variable.getAsString());
  }

  var str = '{';
  var firstChild = true;
  var children = variable.getAllChildren();
  for (var p in children) {
    if (children.hasOwnProperty(p)) {
      if (!firstChild) str += ',';
      str +=
        JSON.stringify(p) +
        ': ' +
        gdjs.evtTools.network.variableStructureToJSON(children[p]);

      firstChild = false;
    }
  }

  str += '}';
  return str;
};

gdjs.evtTools.network.objectVariableStructureToJSON = function (
  object,
  variable
) {
  return gdjs.evtTools.network.variableStructureToJSON(variable);
};

gdjs.evtTools.network._objectToVariable = function (obj, variable) {
  if (!isNaN(obj)) {
    //Number
    variable.setNumber(obj);
  } else if (typeof obj == 'string' || obj instanceof String) {
    variable.setString(obj);
  } else if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; ++i) {
      gdjs.evtTools.network._objectToVariable(
        obj[i],
        variable.getChild(i.toString())
      );
    }
  } else {
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        gdjs.evtTools.network._objectToVariable(obj[p], variable.getChild(p));
      }
    }
  }
};

/**
 * Parse the given JSON and fill the content of the variable with it
 * TODO: Move to gdjs.Variable static
 * @param {string} jsonStr The JSON string
 * @param {gdjs.Variable} variable The variable where to put the parsed JSON
 * @returns {boolean} true if JSON was properly parsed
 */
gdjs.evtTools.network.jsonToVariableStructure = function (jsonStr, variable) {
  if (jsonStr.length === 0) return false;
  try {
    var obj = JSON.parse(jsonStr);
    gdjs.evtTools.network._objectToVariable(obj, variable);
    return true;
  } catch (e) {
    // Do nothing if JSON was not properly parsed.
    return false;
  }
};

gdjs.evtTools.network.jsonToObjectVariableStructure = function (
  jsonStr,
  object,
  variable
) {
  gdjs.evtTools.network.jsonToVariableStructure(jsonStr, variable);
};
