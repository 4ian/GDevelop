/**
 * Firebase Tools Collection
 * @author arthuro555
 */

/**
 * Firebase Authentification Tools
 * @namespace
 */
gdjs.evtTools.firebase.auth = {};

/**
 * The Current authentification status
 */
gdjs.evtTools.firebase.auth.authentified = false;

/**
 * A getter for gdjs.evtTools.firebase.auth.authentified
 */
gdjs.evtTools.firebase.auth.isAuthentified = function() {return gdjs.evtTools.firebase.auth.authentified};

/** Register callback for after firebase initialization */
gdjs.evtTools.firebase.onAppCreated.push(function() {
    /** Registers callback for Auth Status */
    firebase.auth().onAuthStateChanged(function(user) { 
        if (user) {
            gdjs.evtTools.firebase.auth.authentified = true;
            gdjs.evtTools.firebase.auth.currentUser = user;
        } else {
            gdjs.evtTools.firebase.auth.authentified = false;
        }
    });
})
