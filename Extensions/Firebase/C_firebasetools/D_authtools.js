/**
 * Firebase Tools Collection.
 * @fileoverview
 * @author arthuro555
 */

/**
 * Firebase Authentication Event Tools.
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
    twitter: firebase.auth.TwitterAuthProvider,
  },

  /**
   * The current authentication status.
   * @type {boolean}
   */
  authentified: false,

  /**
   * The logged-in users data.
   * @type {firebase.User}
   */
  currentUser: null,

  /**
   * The actual current token.
   * @type {string}
   * @private
   */
  _token: '',

  /**
   * The current auth provider for reauthenticating.
   * @type {firebase.auth.AuthProvider}
   * @private
   */
  _currentProvider: null,
};

/**
 * A namespace containing tools for managing the current user.
 * @namespace
 */
gdjs.evtTools.firebase.auth.userManagement = {
  /**
   * Contains dangerous management functions. Requires reauthentication before usage.
   * @namespace
   */
  dangerous: {
    /**
     * Changes the users email.
     * Use this when using basic auth.
     * @param {string} oldEmail - Old email for reauthentication.
     * @param {string} password - Old password for reauthentication.
     * @param {string} newEmail - New email for the user.
     * @param {boolean} [sendVerificationEmail] - Send a verification email to the old address before changing the email?
     * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
     */
    changeEmail(
      oldEmail,
      password,
      newEmail,
      sendVerificationEmail,
      callbackStateVariable
    ) {
      sendVerificationEmail = sendVerificationEmail || true;

      let credential = firebase.auth.EmailAuthProvider.credential(
        oldEmail,
        password
      );
      let updater = sendVerificationEmail
        ? gdjs.evtTools.firebase.auth.currentUser.updateEmail
        : gdjs.evtTools.firebase.auth.currentUser.verifyBeforeUpdateEmail;

      gdjs.evtTools.firebase.auth.currentUser
        .reauthenticateWithCredential(credential)
        .then(() => updater(newEmail))
        .then(() => {
          if (typeof callbackStateVariable !== 'undefined')
            callbackStateVariable.setString('ok');
        })
        .catch((error) => {
          if (typeof callbackStateVariable !== 'undefined')
            callbackStateVariable.setString(error.message);
        });
    },

    /**
     * Changes the users password.
     * Use this when using basic auth.
     * @param {string} email - Old email for reauthentication.
     * @param {string} oldPassword - Old password for reauthentication.
     * @param {string} newPassword - New password for the user.
     * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
     */
    changePassword(email, oldPassword, newPassword, callbackStateVariable) {
      let credential = firebase.auth.EmailAuthProvider.credential(
        email,
        oldPassword
      );
      gdjs.evtTools.firebase.auth.currentUser
        .reauthenticateWithCredential(credential)
        .then(() =>
          gdjs.evtTools.firebase.auth.currentUser.updatePassword(newPassword)
        )
        .then(() => {
          if (typeof callbackStateVariable !== 'undefined')
            callbackStateVariable.setString('ok');
        })
        .catch((error) => {
          if (typeof callbackStateVariable !== 'undefined')
            callbackStateVariable.setString(error.message);
        });
    },

    /**
     * Deletes the current user.
     * Use this when using basic auth.
     * @param {string} email - Old email for reauthentication.
     * @param {string} password - Old password for reauthentication.
     * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
     */
    deleteUser(email, password, callbackStateVariable) {
      let credential = firebase.auth.EmailAuthProvider.credential(
        email,
        password
      );
      gdjs.evtTools.firebase.auth.currentUser
        .reauthenticateWithCredential(credential)
        .then(() => gdjs.evtTools.firebase.auth.currentUser.delete())
        .then(() => {
          if (typeof callbackStateVariable !== 'undefined')
            callbackStateVariable.setString('ok');
        })
        .catch((error) => {
          if (typeof callbackStateVariable !== 'undefined')
            callbackStateVariable.setString(error.message);
        });
    },

    /**
     * Changes the users email.
     * Use this when using an external provider.
     * @param {string} newEmail - New email for the user.
     * @param {boolean} sendVerificationEmail - Send a verification email to the old address before changing the email?
     * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
     */
    changeEmailProvider(
      newEmail,
      sendVerificationEmail,
      callbackStateVariable
    ) {
      let updater = sendVerificationEmail
        ? gdjs.evtTools.firebase.auth.currentUser.updateEmail
        : gdjs.evtTools.firebase.auth.currentUser.verifyBeforeUpdateEmail;

      gdjs.evtTools.firebase.auth.currentUser
        .reauthenticateWithPopup(gdjs.evtTools.firebase.auth._currentProvider)
        .then(() => updater(newEmail))
        .then(() => {
          if (typeof callbackStateVariable !== 'undefined')
            callbackStateVariable.setString('ok');
        })
        .catch((error) => {
          if (typeof callbackStateVariable !== 'undefined')
            callbackStateVariable.setString(error.message);
        });
    },

    /**
     * Changes the users password.
     * Use this when using an external provider.
     * @param {string} newPassword - New password for the user.
     * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
     */
    changePasswordProvider(newPassword, callbackStateVariable) {
      gdjs.evtTools.firebase.auth.currentUser
        .reauthenticateWithPopup(gdjs.evtTools.firebase.auth._currentProvider)
        .then(() =>
          gdjs.evtTools.firebase.auth.currentUser.updatePassword(newPassword)
        )
        .then(() => {
          if (typeof callbackStateVariable !== 'undefined')
            callbackStateVariable.setString('ok');
        })
        .catch((error) => {
          if (typeof callbackStateVariable !== 'undefined')
            callbackStateVariable.setString(error.message);
        });
    },

    /**
     * Deletes the current user.
     * Use this when using an external provider.
     * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
     */
    deleteUserProvider(callbackStateVariable) {
      gdjs.evtTools.firebase.auth.currentUser
        .reauthenticateWithPopup(gdjs.evtTools.firebase.auth._currentProvider)
        .then(() => gdjs.evtTools.firebase.auth.currentUser.delete())
        .then(() => {
          if (typeof callbackStateVariable !== 'undefined')
            callbackStateVariable.setString('ok');
        })
        .catch((error) => {
          if (typeof callbackStateVariable !== 'undefined')
            callbackStateVariable.setString(error.message);
        });
    },
  },

  /**
   * Verifies if the current users email is verified.
   * @returns {boolean}
   */
  isEmailVerified() {
    return gdjs.evtTools.firebase.auth.currentUser.emailVerified;
  },

  /**
   * Gets the users email address.
   * @returns {string}
   */
  getEmail() {
    return gdjs.evtTools.firebase.auth.currentUser.email || '';
  },

  /**
   * Gets the creation date of the logged in users account.
   * @returns {string}
   */
  getCreationTime() {
    return gdjs.evtTools.firebase.auth.currentUser.metadata.creationTime || '';
  },

  /**
   * Gets the last login date of the logged in users account.
   * @returns {string}
   */
  getLastLoginTime() {
    return (
      gdjs.evtTools.firebase.auth.currentUser.metadata.lastSignInTime || ''
    );
  },

  /**
   * Gets the display name of the current user.
   * @returns {string}
   */
  getDisplayName() {
    return gdjs.evtTools.firebase.auth.currentUser.displayName || '';
  },

  /**
   * Gets the current users phone number.
   * @returns {string}
   */
  getPhoneNumber() {
    return gdjs.evtTools.firebase.auth.currentUser.phoneNumber || '';
  },

  /**
   * Gets the current users Unique IDentifier.
   * @returns {string}
   */
  getUID() {
    return gdjs.evtTools.firebase.auth.currentUser.uid || '';
  },

  /**
   * Gets the tenant ID.
   * For advanced usage only.
   * @returns {string}
   */
  getTenantID() {
    return gdjs.evtTools.firebase.auth.currentUser.tenantId || '';
  },

  /**
   * Gets the refresh token.
   * For advanced usage only.
   * @returns {string}
   */
  getRefreshToken() {
    return gdjs.evtTools.firebase.auth.currentUser.refreshToken || '';
  },

  /**
   * Gets the users profile picture URL.
   * @returns {string}
   */
  getPhotoURL() {
    return gdjs.evtTools.firebase.auth.currentUser.photoURL || '';
  },

  /**
   * Changes the display name of an user.
   * @param {string} newDisplayName
   */
  setDisplayName(newDisplayName) {
    gdjs.evtTools.firebase.auth.currentUser.updateProfile({
      displayName: newDisplayName,
    });
  },

  /**
   * Changes the URL to the profile picture of the user.
   * @param {string} newDisplayName
   */
  setPhotoURL(newPhotoURL) {
    gdjs.evtTools.firebase.auth.currentUser.updateProfile({
      photoURL: newPhotoURL,
    });
  },

  /**
   * Send an email to the users email adress to verify it.
   * @note Even though this function is redundant, we keep it for consistency.
   * @see gdjs.evtTools.firebase.auth.currentUser.sendEmailVerification
   */
  sendVerificationEmail() {
    gdjs.evtTools.firebase.auth.currentUser.sendEmailVerification();
  },
};

/**
 * Get the logged-in users authentication token.
 * Tries to refresh it everytime the function is called.
 * @returns {string}
 */
gdjs.evtTools.firebase.auth.token = function () {
  this.currentUser
    .getIdToken()
    .then((token) => (gdjs.evtTools.firebase.auth._token = token));
  return this._token;
};

/**
 * Returns true if the user is currently authentified.
 * @returns {boolean}
 * @see gdjs.evtTools.firebase.auth.authentified
 */
gdjs.evtTools.firebase.auth.isAuthentified = function () {
  return gdjs.evtTools.firebase.auth.authentified;
};

/**
 * Signs the user in with basic email-password authentication.
 * @param {string} email - The users email.
 * @param {string} password - The users password.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.auth.signInWithEmail = function (
  email,
  password,
  callbackStateVariable
) {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      if (typeof callbackStateVariable !== 'undefined')
        callbackStateVariable.setString('ok');
    })
    .catch((error) => {
      if (typeof callbackStateVariable !== 'undefined')
        callbackStateVariable.setString(error.message);
    });
};

/**
 * Creates an account with basic email-password authentication.
 * @param {string} email - The users email.
 * @param {string} password - The users password.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.auth.createAccountWithEmail = function (
  email,
  password,
  callbackStateVariable
) {
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(() => {
      if (typeof callbackStateVariable !== 'undefined')
        callbackStateVariable.setString('ok');
    })
    .catch((error) => {
      if (typeof callbackStateVariable !== 'undefined')
        callbackStateVariable.setString(error.message);
    });
};

/**
 * Login with a temporary account.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.auth.anonymSignIn = function (callbackStateVariable) {
  firebase
    .auth()
    .signInAnonymously()
    .then(() => {
      if (typeof callbackStateVariable !== 'undefined')
        callbackStateVariable.setString('ok');
    })
    .catch((error) => {
      if (typeof callbackStateVariable !== 'undefined')
        callbackStateVariable.setString(error.message);
    });
};

/**
 * Signs the user in with an external provider.
 * Only works on the web, NOT on Electron/Cordova.
 * @param {"google" | "facebook" | "github" | "twitter"} providerName - The external provider to use.
 * @param {gdjs.Variable} [callbackStateVariable] - The variable where to store the result.
 */
gdjs.evtTools.firebase.auth.signInWithProvider = function (
  providerName,
  callbackStateVariable
) {
  let providerCtor = gdjs.evtTools.firebase.auth.providersList[providerName];
  gdjs.evtTools.firebase.auth._currentProvider = new providerCtor();

  firebase
    .auth()
    .signInWithPopup(gdjs.evtTools.firebase.auth._currentProvider)
    .then(() => {
      if (typeof callbackStateVariable !== 'undefined')
        callbackStateVariable.setString('ok');
    })
    .catch((error) => {
      if (typeof callbackStateVariable !== 'undefined')
        callbackStateVariable.setString(error.message);
    });
};

// Listen to authentication state changes to regenerate tokens and keep the user and the authenticated state up to date
gdjs.evtTools.firebase.onAppCreated.push(function () {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      gdjs.evtTools.firebase.auth.authentified = true;
      gdjs.evtTools.firebase.auth.currentUser = user;
      user
        .getIdToken()
        .then((token) => (gdjs.evtTools.firebase.auth._token = token)); // Pregenerate the token
    } else {
      gdjs.evtTools.firebase.auth.authentified = false;
      gdjs.evtTools.firebase.auth.currentUser = null;
    }
  });
});
