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
 * An array of callbacks to call when the app gets initialized
 */
gdjs.evtTools.firebase.onAppCreated = []

/** Callback to initialize the Firebase SDK */
gdjs.registerFirstRuntimeSceneLoadedCallback(function(runtimeScene) {
    let firebaseConfig;
    try { 
        firebaseConfig = JSON.parse(runtimeScene.getGame().getGameData().properties.firebaseConfig);
    } catch {
        console.error("The Firebase configuration is invalid!");
    }
    firebase.initializeApp(firebaseConfig);
    for (let func of gdjs.evtTools.firebase.onAppCreated) func();
})
