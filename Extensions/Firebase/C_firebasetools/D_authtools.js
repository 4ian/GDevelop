/**
 * Firebase Tools Collection.
 * @fileoverview
 * @author arthuro555
 */

/**
 * Firebase Authentification Event Tools.
 * @namespace
 */
gdjs.evtTools.firebase.auth = {
    /**
     * Table of available external providers.
     */
    providersList: {
        google: firebase.auth.GoogleAuthProvider,
        facebook: firebase.auth.FacebookAuthProvider,
        github: firebase.auth.GithubAuthProvider,
        twitter: firebase.auth.TwitterAuthProvider
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
     * The actual current token.
     * @type {string}
     * @private
     */
    _token: "",

    /**
     * The current auth provider for reauthenticating.
     * @type {firebase.auth.AuthProvider}
     * @private
     */
    _currentProvider: null
};

/**
 * A namespace containing tools for managing the current user.
 * @namespace
 */
gdjs.evtTools.firebase.auth.userManagement = {
    /**
     * Contains dangerous management functions. Requires reauthentification before usage.
     * @namespace
     */
    dangerous: {
        /**
         * Changes the user's email.
         * Use this when using basic auth.
         * @param {string} oldEmail - Old Email for reauthentification.
         * @param {string} password - Old password for reauthentification.
         * @param {string} newEmail - New Email for the user.
         * @param {boolean} [sendVerificationEmail] - Send a verification email to the old address before changing the email?
         * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
         */
        changeEmail(oldEmail, password, newEmail, sendVerificationEmail, callbackStateVariable) {
            sendVerificationEmail = sendVerificationEmail || true;

            let credential = firebase.auth.EmailAuthProvider.credential(oldEmail, password);
            let updater = sendVerificationEmail ? gdjs.evtTools.firebase.auth.currentUser.updateEmail : gdjs.evtTools.firebase.auth.currentUser.verifyBeforeUpdateEmail;

            gdjs.evtTools.firebase.auth.currentUser.reauthenticateWithCredential(credential)
              .then(() => updater(newEmail))
              .then(() => {
                if (callbackStateVariable)
                callbackStateVariable.setString("ok");
              })
              .catch(error => {
                if (callbackStateVariable)
                callbackStateVariable.setString(error.message);
              });
        },

        /**
         * Changes the user's password.
         * Use this when using basic auth.
         * @param {string} email - Old Email for reauthentification.
         * @param {string} oldPassword - Old password for reauthentification.
         * @param {string} newPassword - New Password for the user.
         * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
         */
        changePassword(email, oldPassword, newPassword, callbackStateVariable) {
            let credential = firebase.auth.EmailAuthProvider.credential(email, oldPassword);
            gdjs.evtTools.firebase.auth.currentUser.reauthenticateWithCredential(credential)
              .then(() => gdjs.evtTools.firebase.auth.currentUser.updatePassword(newPassword))
              .then(() => {
                if (callbackStateVariable)
                  callbackStateVariable.setString("ok");
              })
              .catch(error => {
                if (callbackStateVariable)
                  callbackStateVariable.setString(error.message);
              });
        },

        /**
         * Deletes the Current User.
         * Use this when using basic auth.
         * @param {string} email - Old Email for reauthentification.
         * @param {string} password - Old password for reauthentification.
         * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
         */
        deleteUser(email, password, callbackStateVariable) {
            let credential = firebase.auth.EmailAuthProvider.credential(email, password);
            gdjs.evtTools.firebase.auth.currentUser.reauthenticateWithCredential(credential)
              .then(() => gdjs.evtTools.firebase.auth.currentUser.delete())
              .then(() => {
                if (callbackStateVariable)
                  callbackStateVariable.setString("ok");
              })
              .catch(error => {
                if (callbackStateVariable)
                  callbackStateVariable.setString(error.message);
              });
        },

        /**
         * Changes the user's email.
         * Use this when using an external provider.
         * @param {string} newEmail - New Email for the user.
         * @param {boolean} sendVerificationEmail - Send a verification email to the old address before changing the email?
         * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
         */
        changeEmailProvider(newEmail, sendVerificationEmail, callbackStateVariable) {
            let updater = sendVerificationEmail ? gdjs.evtTools.firebase.auth.currentUser.updateEmail : gdjs.evtTools.firebase.auth.currentUser.verifyBeforeUpdateEmail;

            gdjs.evtTools.firebase.auth.currentUser.reauthenticateWithPopup(gdjs.evtTools.firebase.auth._currentProvider)
              .then(() => updater(newEmail))
              .then(() => {
                if (callbackStateVariable)
                  callbackStateVariable.setString("ok");
              })
              .catch(error => {
                if (callbackStateVariable)
                  callbackStateVariable.setString(error.message);
              });
        },

        /**
         * Changes the user's password.
         * Use this when using an external provider.
         * @param {string} newPassword - New Password for the user.
         * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
         */
        changePasswordProvider(newPassword, callbackStateVariable) {
            gdjs.evtTools.firebase.auth.currentUser.reauthenticateWithPopup(gdjs.evtTools.firebase.auth._currentProvider)
              .then(() => gdjs.evtTools.firebase.auth.currentUser.updatePassword(newPassword))
              .then(() => {
                if (callbackStateVariable)
                  callbackStateVariable.setString("ok");
              })
              .catch(error => {
                if (callbackStateVariable)
                  callbackStateVariable.setString(error.message);
              });
        },

        /**
         * Deletes the Current User.
         * Use this when using an external provider.
         * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
         */
        deleteUserProvider(callbackStateVariable) {
            gdjs.evtTools.firebase.auth.currentUser.reauthenticateWithPopup(gdjs.evtTools.firebase.auth._currentProvider)
              .then(() => gdjs.evtTools.firebase.auth.currentUser.delete())
              .then(() => {
                if (callbackStateVariable)
                  callbackStateVariable.setString("ok");
              })
              .catch(error => {
                if (callbackStateVariable)
                  callbackStateVariable.setString(error.message);
              });
        }
    },

    /**
     * Verifies if the current user's email is verified.
     * @returns {boolean} - Is the email verified?
     */
    isEmailVerified() {
        return gdjs.evtTools.firebase.auth.currentUser.emailVerified;
    },

    /**
     * Gets the users Email address.
     * @returns {string} - The users Email address.
     */
    getEmail() {
        return gdjs.evtTools.firebase.auth.currentUser.email || "none";
    },

    /**
     * Gets the creation date of the logged in user's account.
     * @returns {string} - The account creation date.
     */
    getCreationTime() {
        return gdjs.evtTools.firebase.auth.currentUser.metadata.creationTime;
    },

    /**
     * Gets the last login date of the logged in user's account.
     * @returns {string} - The account's last login date.
     */
    getLastLoginTime() {
        return gdjs.evtTools.firebase.auth.currentUser.metadata.lastSignInTime;
    },

    /**
     * Gets the display name of the current user.
     * @returns {string} - The current user's username.
     */
    getDisplayName() {
        return gdjs.evtTools.firebase.auth.currentUser.displayName || "none";
    },

    /**
     * Gets the current user's phone number.
     * @returns {string}
     */
    getPhoneNumber() {
        return gdjs.evtTools.firebase.auth.currentUser.phoneNumber || "none";
    },

    /**
     * Gets the current user's Unique Identifier.
     * @returns {string}
     */
    getUID() {
        return gdjs.evtTools.firebase.auth.currentUser.uid;
    },

    /**
     * Gets the tenant ID. 
     * Only use it if you know what you are doing.
     * @returns {string}
     */
    getTenantID() {
        return gdjs.evtTools.firebase.auth.currentUser.tenantId;
    },

    /**
     * Gets the refresh Token. 
     * Only use it if you know what you are doing.
     * @returns {string}
     */
    getRefreshToken() {
        return gdjs.evtTools.firebase.auth.currentUser.refreshToken;
    },

    /**
     * Gets the user's profile picture URL.
     * @returns {string}
     */
    getPhotoURL() {
        return gdjs.evtTools.firebase.auth.currentUser.photoURL || "none"
    },

    /**
     * Changes the display name of an user.
     * @param {string} newDisplayName - The new Name to display for the user
     */
    setDisplayName(newDisplayName) {
        gdjs.evtTools.firebase.auth.currentUser.updateProfile({displayName: newDisplayName});
    },

    /**
     * Changes the URL to the profile picture of the user
     * @param {string} newDisplayName - The URL to the new profile picture.
     */
    setPhotoURL(newPhotoURL) {
        gdjs.evtTools.firebase.auth.currentUser.updateProfile({photoURL: newPhotoURL});
    },

    /**
     * Send an email to the user's email adress to verify it.
     * @note Even though this function is redundant, we keep it for consistency.
     */
    sendVerificationEmail() {
        gdjs.evtTools.firebase.auth.currentUser.sendEmailVerification();
    }
}

/**
 * Get the logged-in user's authentification token. 
 * Tries to refresh it everytime you get it.
 * @returns {string}
 */
gdjs.evtTools.firebase.auth.token = function() {
    this.currentUser.getIdToken().then(token => gdjs.evtTools.firebase.auth._token = token);
    return this._token;
}

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
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.auth.signInWithEmail = function(email, password, callbackStateVariable) {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
      })
      .catch(error => {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
      });
}

/**
 * Creates an account with basic email-password authentification.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.auth.createAccountWithEmail = function(email, password, callbackStateVariable) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
      })
      .catch(error => {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
      });
}

/**
 * Creates an account with basic email-password authentification.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.auth.anonymSignIn = function(callbackStateVariable) {
    firebase.auth().signInAnonymously()
      .then(() => {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
      })
      .catch(error => {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
      });
}

/**
 * Signs you in with an external provider.
 * Only works on the web, NOT on elctron and probably not on Cordova.
 * @param {"google" | "facebook" | "github" | "twitter"} providerName - The external provider to use.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.auth.signInWithProvider = function(providerName, callbackStateVariable) {
    let providerCtor = gdjs.evtTools.firebase.auth.providersList[providerName];
    gdjs.evtTools.firebase.auth._currentProvider = new providerCtor();

    firebase.auth().signInWithPopup(gdjs.evtTools.firebase.auth._currentProvider)
      .then(() => {
        if (callbackStateVariable)
          callbackStateVariable.setString("ok");
      })
      .catch(error => {
        if (callbackStateVariable)
          callbackStateVariable.setString(error.message);
      });
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
});
