/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace network {
      /**
       * Send an asynchronous request to the specified URL, with the specified (text)
       * body, method and contentType (defaults to `application/x-www-form-urlencoded`).
       * The result is stored in the specified response variable. Any error is stored in
       * the specified error variable.
       *
       * @param url The URL to send the request to.
       * @param body The content to be sent.
       * @param method The method to use ("GET", "POST", "PUT", "HEAD", "DELETE", "PATCH", "OPTIONS")
       * @param contentType The content type. Defaults to `application/x-www-form-urlencoded` if empty.
       * @param responseVar The variable where to store the response text.
       * @param errorVar The variable where to store the error message or status code (if status >= 400).
       */
      export const sendAsyncRequest = function (
        url: string,
        body: string,
        method: string,
        contentType: string,
        responseVar: gdjs.Variable,
        errorVar: gdjs.Variable
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
            /* "DONE" */
            if (request.readyState === 4) {
              if (request.status >= 400) {
                onError('' + request.status);
              }
              responseVar.setString(request.responseText);
            }
          };
          request.open(method, url);
          request.setRequestHeader(
            'Content-Type',
            contentType === ''
              ? 'application/x-www-form-urlencoded'
              : contentType
          );
          request.send(body);
        } catch (err) {
          onError(err);
        }
      };

      /**
       * @deprecated
       */
      export const sendDeprecatedSynchronousRequest = function (
        host,
        uri,
        body,
        method,
        contentType,
        responseVar
      ) {
        try {
          let xhr;
          if (typeof XMLHttpRequest !== 'undefined') {
            xhr = new XMLHttpRequest();
          } else {
            const versions = [
              'MSXML2.XmlHttp.5.0',
              'MSXML2.XmlHttp.4.0',
              'MSXML2.XmlHttp.3.0',
              'MSXML2.XmlHttp.2.0',
              'Microsoft.XmlHttp',
            ];
            for (let i = 0, len = versions.length; i < len; i++) {
              try {
                xhr = new ActiveXObject(versions[i]);
                break;
              } catch (e) {}
            }
          }

          // end for
          if (xhr === undefined) {
            return;
          }
          xhr.open(method, host + uri, false);
          xhr.setRequestHeader(
            'Content-Type',
            contentType === ''
              ? 'application/x-www-form-urlencoded'
              : contentType
          );
          xhr.send(body);
          responseVar.setString(xhr.responseText);
        } catch (e) {}
      };
      export const enableMetrics = function (
        runtimeScene: gdjs.RuntimeScene,
        enable: boolean
      ) {
        runtimeScene.getGame().enableMetrics(enable);
      };

      /**
       * Convert a variable to JSON.
       * @param variable The variable to convert to JSON
       * @returns The JSON string representing the variable
       */
      export const variableStructureToJSON = function (
        variable: gdjs.Variable
      ): string {
        // TODO: Move this function to gdjs.Variable
        if (!variable.isStructure()) {
          if (variable.isNumber()) {
            return JSON.stringify(variable.getAsNumber());
          } else {
            return JSON.stringify(variable.getAsString());
          }
        }
        let str = '{';
        let firstChild = true;
        const children = variable.getAllChildren();
        for (const p in children) {
          if (children.hasOwnProperty(p)) {
            if (!firstChild) {
              str += ',';
            }
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
      export const objectVariableStructureToJSON = function (object, variable) {
        return gdjs.evtTools.network.variableStructureToJSON(variable);
      };
      export const _objectToVariable = function (obj, variable) {
        if (obj === null) {
          variable.setString('null');
        } else if (
          (typeof obj === 'number' || typeof obj === 'string') &&
          // @ts-ignore
          !isNaN(obj)
        ) {
          variable.setNumber(obj);
        } else if (typeof obj === 'string' || obj instanceof String) {
          variable.setString(obj);
        } else if (typeof obj === 'undefined') {
          // Do not modify the variable, as there is no value to set it to.
        } else if (typeof obj === 'boolean') {
          // Convert boolean to string.
          variable.setString('' + obj);
        } else if (Array.isArray(obj)) {
          for (var i = 0; i < obj.length; ++i) {
            gdjs.evtTools.network._objectToVariable(
              obj[i],
              variable.getChild(i.toString())
            );
          }
        } else if (typeof obj === 'object') {
          for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
              gdjs.evtTools.network._objectToVariable(obj[p], variable.getChild(p));
            }
          }
        } else if (typeof obj === 'symbol') {
          variable.setString(obj.toString());
        } else if (typeof obj === 'number' && isNaN(obj)) {
          console.warn('Variables cannot be set to NaN, setting it to 0.');
          variable.setNumber(0);
        } else if (typeof obj === 'bigint') {
          if (obj > Number.MAX_SAFE_INTEGER)
            console.warn(
              'Integers bigger than ' +
                Number.MAX_SAFE_INTEGER +
                " aren't supported by variables, it will be reduced to that size."
            );
          // @ts-ignore
          variable.setNumber(parseInt(obj, 10));
        } else if (typeof obj === 'function') {
          console.error('Error: Impossible to set variable value to a function.');
        } else {
          console.error('Cannot identify type of object:', obj);
        }
      };

      /**
       * Parse the given JSON and fill the content of the variable with it.
       *
       * @param jsonStr The JSON string
       * @param variable The variable where to put the parsed JSON
       * @returns true if JSON was properly parsed
       */
      export const jsonToVariableStructure = function (
        jsonStr: string,
        variable: gdjs.Variable
      ): boolean {
        // TODO: Move this function to gdjs.Variable
        if (jsonStr.length === 0) {
          return false;
        }
        try {
          const obj = JSON.parse(jsonStr);
          gdjs.evtTools.network._objectToVariable(obj, variable);
          return true;
        } catch (e) {
          // Do nothing if JSON was not properly parsed.
          return false;
        }
      };
      export const jsonToObjectVariableStructure = function (
        jsonStr,
        object,
        variable
      ) {
        gdjs.evtTools.network.jsonToVariableStructure(jsonStr, variable);
      };
    }
  }
}
