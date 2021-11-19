namespace gdjs {
  const logger = new gdjs.Logger('Firebase (setup)');
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

      /**
       * Sets up the Firebase SDK. Only exported for testing purposes.
       * @internal
       */
      export const _setupFirebase = async (runtimeScene: gdjs.RuntimeScene) => {
        try {
          var firebaseConfig = JSON.parse(
            //@ts-expect-error We have a try catch to catch this potential error.
            runtimeScene
              .getGame()
              .getExtensionProperty('Firebase', 'FirebaseConfig')
          );
        } catch (e) {
          logger.error('The Firebase configuration is invalid! Error: ' + e);
          return;
        }
        if (typeof firebaseConfig !== 'object') return;
        if (firebase.apps.length !== 0) await firebase.app().delete();
        firebase.initializeApp(firebaseConfig);
        for (let func of onAppCreated) func();
      };

      gdjs.registerFirstRuntimeSceneLoadedCallback(_setupFirebase);
    }
  }
}
