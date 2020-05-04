/**
 * Firebase Tools Collection.
 * @author arthuro555
 */

/**
 * Firebase Authentification Tools.
 * @namespace
 */
gdjs.evtTools.firebase.auth = {
    /**
     * Table of available external providers.
     */
    providersList: {
        google: "GoogleAuthProvider",
        facebook: "FacebookAuthProvider",
        github: "GithubAuthProvider",
        twitter: "TwitterAuthProvider"
    },

    /**
     * The Current authentification status.
     * @type {boolean}
     */
    authentified: false,

    /**
     * The logged-in user's data.
     * @type {firebase.User}
     */
    currentUser: null,

    /**
     * The logged-in user's authentification token. 
     * Tries to refresh it everytime you get it.
     * @returns {string}
     */
    get token() {
        this.currentUser.getIdToken().then(token => gdjs.evtTools.firebase.auth._token = token);
        return this._token;
    },

    /**
     * The actual current token.
     * @type {string}
     * @private
     */
    _token: ""
};

/**
 * A getter for {@link gdjs.evtTools.firebase.auth.authentified}.
 * @returns {boolean} Is the user authentified?
 * @see gdjs.evtTools.firebase.auth.authentified
 */
gdjs.evtTools.firebase.auth.isAuthentified = function() {return gdjs.evtTools.firebase.auth.authentified;};

/**
 * Signs you in with basic email-password authentification.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {gdjs.Variable} callbackStateVariable - The variable where to store the result.
 */
gdjs.evtTools.firebase.auth.signInWithEmail = function(email, password, callbackStateVariable) {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(result => callbackStateVariable.setString("ok"))
      .catch(error => callbackStateVariable.setString(error.message));
}

/**
 * Signs you in with an external provider.
 * Only works on the web, NOT on elctron and probably not on Cordova.
 * @param {"google" | "facebook" | "github" | "twitter"} providerName - The external provider to use.
 * @param {gdjs.Variable} callbackStateVariable - The variable where to store the result.
 */
gdjs.evtTools.firebase.auth.signInWithProvider = function(providerName, callbackStateVariable) {
    let provider = firebase.auth[gdjs.evtTools.firebase.auth.providersList[providerName]];
    firebase.auth().signInWithPopup(provider)
      .then(result => callbackStateVariable.setString("ok"))
      .catch(error => callbackStateVariable.setString(error.message));
}

/** Register callback for after firebase initialization. */
gdjs.evtTools.firebase.onAppCreated.push(function() {
    /** Registers callback for Auth Status. */
    firebase.auth().onAuthStateChanged(function(user) { 
        if (user) {
            gdjs.evtTools.firebase.auth.authentified = true;
            gdjs.evtTools.firebase.auth.currentUser = user;
            user.getIdToken().then(token => gdjs.evtTools.firebase.auth._token = token); // Pregenerate the token
        } else {
            gdjs.evtTools.firebase.auth.authentified = false;
        }
    });
})
