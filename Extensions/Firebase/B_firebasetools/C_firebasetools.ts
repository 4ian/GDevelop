namespace gdjs {
  export namespace evtTools {
    /**
     * Firebase Event Tools
     * @namespace
     */
    export namespace firebaseTools {
      /**
       * An array of callbacks to call when the app gets initialized.
       */
      export const onAppCreated: Array<() => void> = [];

      gdjs.registerFirstRuntimeSceneLoadedCallback((runtimeScene) => {
        let firebaseConfig;
        try {
          firebaseConfig = JSON.parse(
            //@ts-expect-error We have a try catch to catch this potential error.
            runtimeScene
              .getGame()
              .getExtensionProperty('Firebase', 'FirebaseConfig')
          );
        } catch (e) {
          console.error('The Firebase configuration is invalid! Error: ' + e);
          return;
        }
        firebase.initializeApp(firebaseConfig);
        for (let func of onAppCreated) func();
      });
    }
  }
}
