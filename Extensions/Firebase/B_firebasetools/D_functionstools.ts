namespace gdjs {
  export namespace evtTools {
    export namespace firebaseTools {
      /**
       * Firebase Functions Event Tools.
       * @namespace
       */
      export namespace functions {
        /**
         * Call an http function.
         * @param httpFunctionName - The name of the function to call
         * @param [parameters] - Parameters for the function either as a string.
         * @param {gdjs.Variable} [callbackValueVariable] - The variable where to store the result.
         * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store if the operation was successful.
         */
        export const call = (
          httpFunctionName: string,
          parameter: string,
          callbackValueVariable?: gdjs.Variable,
          callbackStateVariable?: gdjs.Variable
        ) =>
          firebase
            .functions()
            .httpsCallable(httpFunctionName)(parameter)
            .then((response) => {
              if (callbackValueVariable)
                callbackValueVariable.fromJSObject(response.data);

              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString('ok');
            })
            .catch((error) => {
              if (typeof callbackStateVariable !== 'undefined')
                callbackStateVariable.setString(error.message);
            });
      }
    }
  }
}
