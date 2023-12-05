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
          if (
            err instanceof ProgressEvent &&
            err.currentTarget &&
            err.currentTarget instanceof XMLHttpRequest &&
            err.currentTarget.status === 0
          ) {
            errorVar.setString('REQUEST_NOT_SENT');
          } else {
            errorVar.setString('' + err);
          }
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

      export const sendAwaitableAsyncRequest = (
        url: string,
        body: string,
        method: string,
        contentType: string,
        responseVar: gdjs.Variable,
        errorVar: gdjs.Variable
      ) => {
        return new gdjs.PromiseTask(
          fetch(url, {
            body: method !== 'GET' ? body : undefined,
            method,
            headers: {
              'Content-Type':
                contentType || 'application/x-www-form-urlencoded',
            },
          }).then(
            async (response) => {
              const result = await response.text();
              if (response.status >= 400) {
                errorVar.setString('' + response.status);
              }
              responseVar.setString(result);
            },
            (error) => {
              errorVar.setString('' + error);
            }
          )
        );
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
        instanceContainer: gdjs.RuntimeInstanceContainer,
        enable: boolean
      ) {
        instanceContainer.getGame().enableMetrics(enable);
      };

      /**
       * Convert a variable to JSON.
       * @param variable The variable to convert to JSON
       * @returns The JSON string representing the variable
       *
       * @deprecated Use `JSON.stringify(variable.toJSObject())` instead.
       */
      export const variableStructureToJSON = function (
        variable: gdjs.Variable
      ): string {
        return JSON.stringify(variable.toJSObject());
      };

      /**
       * @deprecated Use `JSON.stringify(variable.toJSObject())` instead.
       */
      export const objectVariableStructureToJSON = function (
        object: gdjs.RuntimeObject | null,
        variable: gdjs.Variable
      ): string {
        return JSON.stringify(variable.toJSObject());
      };

      /**
       * @deprecated Use `variable.fromJSObject` instead.
       */
      export const _objectToVariable = function (
        obj: any,
        variable: gdjs.Variable
      ) {
        variable.fromJSObject(obj);
      };

      /**
       * Parse the given JSON and fill the content of the variable with it.
       *
       * @param jsonStr The JSON string
       * @param variable The variable where to put the parsed JSON
       * @returns true if JSON was properly parsed
       *
       * @deprecated Use `variable.fromJSON` instead.
       */
      export const jsonToVariableStructure = function (
        jsonStr: string,
        variable: gdjs.Variable
      ): void {
        variable.fromJSON(jsonStr);
      };

      /**
       * @deprecated Use `variable.fromJSON` instead.
       */
      export const jsonToObjectVariableStructure = function (
        jsonStr: string,
        object: gdjs.RuntimeObject | null,
        variable: gdjs.Variable
      ) {
        variable.fromJSON(jsonStr);
      };
    }
  }
}
