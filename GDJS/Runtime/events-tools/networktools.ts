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
       * @private
       * @deprecated
       * @alias gdjs.evtTools.variable.variableStructureToJSON
       */
      export const variableStructureToJSON = gdjs.evtTools.variable.variableStructureToJSON
      /**
       * @private
       * @deprecated
       * @alias gdjs.evtTools.variable.objectVariableStructureToJSON
       */
      export const objectVariableStructureToJSON = gdjs.evtTools.variable.objectVariableStructureToJSON;
      /**
       * @private
       * @deprecated
       * @alias gdjs.evtTools.variable.objectToVariable
       */
      export const _objectToVariable = gdjs.evtTools.variable.objectToVariable;
      /**
       * @private
       * @deprecated
       * @alias gdjs.evtTools.variable.jsonToVariableStructure
       */
      export const jsonToVariableStructure = gdjs.evtTools.variable.jsonToVariableStructure;
      /**
       * @private
       * @deprecated
       * @alias gdjs.evtTools.variable.jsonToObjectVariableStructure
       */
      export const jsonToObjectVariableStructure = gdjs.evtTools.variable.jsonToObjectVariableStructure;
    }
  }
}
