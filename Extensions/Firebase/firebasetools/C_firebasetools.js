/**
 * Firebase Tools
 * @author arthuro555
 */

/**
 * Firebase Event Tools
 * @namespace
 */
gdjs.evtTools.firebase = {};

/** Callback to initialize the Firebase SDK */
gdjs.registerFirstRuntimeSceneLoadedCallback(function(runtimeScene) {
    let firebaseConfig;
    try { 
        firebaseConfig = JSON.parse(runtimeScene.getGame().getGameData().properties.firebaseConfig);
    } catch {
        console.error("The Firebase configuration is invalid!");
    }
    firebase.initializeApp(firebaseConfig);
})
