namespace gdjs {
  /**
   * Firebase Tools Collection
   * @fileoverview
   * @author arthuro555
   */

  /**
   * Firebase Event Tools
   * @namespace
   */
  gdjs.evtTools.firebase = {};

  /**
   * An array of callbacks to call when the app gets initialized.
   */
  gdjs.evtTools.firebase.onAppCreated = [];
  gdjs.registerFirstRuntimeSceneLoadedCallback(function (runtimeScene) {
    let firebaseConfig;
    try {
      firebaseConfig = JSON.parse(
        runtimeScene
          .getGame()
          .getExtensionProperty('Firebase', 'FirebaseConfig')
      );
    } catch (e) {
      console.error('The Firebase configuration is invalid! Error: ' + e);
      return;
    }
    firebase.initializeApp(firebaseConfig);
    for (let func of gdjs.evtTools.firebase.onAppCreated) {
      func();
    }
  });
}
