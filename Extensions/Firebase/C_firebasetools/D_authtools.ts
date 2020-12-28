// @ts-nocheck - TODO: convert this file to use TypeScript namespaces
namespace gdjs {
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
     */
    authentified: false,
    /**
     * The logged-in users data.
     */
    currentUser: null,
    /**
     * The actual current token.
     */
    _token: '',
    /**
     * The current auth provider for reauthenticating.
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
       * @param oldEmail - Old email for reauthentication.
       * @param password - Old password for reauthentication.
       * @param newEmail - New email for the user.
       * @param [sendVerificationEmail] - Send a verification email to the old address before changing the email?
       * @param [callbackStateVariable] - The variable where to store the result.
       */
      changeEmail(
        oldEmail: string,
        password: string,
        newEmail: string,
        sendVerificationEmail?: boolean,
        callbackStateVariable?: gdjs.Variable
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
            if (typeof callbackStateVariable !== 'undefined') {
              callbackStateVariable.setString('ok');
            }
          })
          .catch((error) => {
            if (typeof callbackStateVariable !== 'undefined') {
              callbackStateVariable.setString(error.message);
            }
          });
      },
      /**
       * Changes the users password.
       * Use this when using basic auth.
       * @param email - Old email for reauthentication.
       * @param oldPassword - Old password for reauthentication.
       * @param newPassword - New password for the user.
       * @param [callbackStateVariable] - The variable where to store the result.
       */
      changePassword(
        email: string,
        oldPassword: string,
        newPassword: string,
        callbackStateVariable?: gdjs.Variable
      ) {
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
            if (typeof callbackStateVariable !== 'undefined') {
              callbackStateVariable.setString('ok');
            }
          })
          .catch((error) => {
            if (typeof callbackStateVariable !== 'undefined') {
              callbackStateVariable.setString(error.message);
            }
          });
      },
      /**
       * Deletes the current user.
       * Use this when using basic auth.
       * @param email - Old email for reauthentication.
       * @param password - Old password for reauthentication.
       * @param [callbackStateVariable] - The variable where to store the result.
       */
      deleteUser(
        email: string,
        password: string,
        callbackStateVariable?: gdjs.Variable
      ) {
        let credential = firebase.auth.EmailAuthProvider.credential(
          email,
          password
        );
        gdjs.evtTools.firebase.auth.currentUser
          .reauthenticateWithCredential(credential)
          .then(() => gdjs.evtTools.firebase.auth.currentUser.delete())
          .then(() => {
            if (typeof callbackStateVariable !== 'undefined') {
              callbackStateVariable.setString('ok');
            }
          })
          .catch((error) => {
            if (typeof callbackStateVariable !== 'undefined') {
              callbackStateVariable.setString(error.message);
            }
          });
      },
      /**
       * Changes the users email.
       * Use this when using an external provider.
       * @param newEmail - New email for the user.
       * @param sendVerificationEmail - Send a verification email to the old address before changing the email?
       * @param [callbackStateVariable] - The variable where to store the result.
       */
      changeEmailProvider(
        newEmail: string,
        sendVerificationEmail: boolean,
        callbackStateVariable?: gdjs.Variable
      ) {
        let updater = sendVerificationEmail
          ? gdjs.evtTools.firebase.auth.currentUser.updateEmail
          : gdjs.evtTools.firebase.auth.currentUser.verifyBeforeUpdateEmail;
        gdjs.evtTools.firebase.auth.currentUser
          .reauthenticateWithPopup(gdjs.evtTools.firebase.auth._currentProvider)
          .then(() => updater(newEmail))
          .then(() => {
            if (typeof callbackStateVariable !== 'undefined') {
              callbackStateVariable.setString('ok');
            }
          })
          .catch((error) => {
            if (typeof callbackStateVariable !== 'undefined') {
              callbackStateVariable.setString(error.message);
            }
          });
      },
      /**
       * Changes the users password.
       * Use this when using an external provider.
       * @param newPassword - New password for the user.
       * @param [callbackStateVariable] - The variable where to store the result.
       */
      changePasswordProvider(
        newPassword: string,
        callbackStateVariable?: gdjs.Variable
      ) {
        gdjs.evtTools.firebase.auth.currentUser
          .reauthenticateWithPopup(gdjs.evtTools.firebase.auth._currentProvider)
          .then(() =>
            gdjs.evtTools.firebase.auth.currentUser.updatePassword(newPassword)
          )
          .then(() => {
            if (typeof callbackStateVariable !== 'undefined') {
              callbackStateVariable.setString('ok');
            }
          })
          .catch((error) => {
            if (typeof callbackStateVariable !== 'undefined') {
              callbackStateVariable.setString(error.message);
            }
          });
      },
      /**
       * Deletes the current user.
       * Use this when using an external provider.
       * @param [callbackStateVariable] - The variable where to store the result.
       */
      deleteUserProvider(callbackStateVariable?: gdjs.Variable) {
        gdjs.evtTools.firebase.auth.currentUser
          .reauthenticateWithPopup(gdjs.evtTools.firebase.auth._currentProvider)
          .then(() => gdjs.evtTools.firebase.auth.currentUser.delete())
          .then(() => {
            if (typeof callbackStateVariable !== 'undefined') {
              callbackStateVariable.setString('ok');
            }
          })
          .catch((error) => {
            if (typeof callbackStateVariable !== 'undefined') {
              callbackStateVariable.setString(error.message);
            }
          });
      },
    },
    /**
     * Verifies if the current users email is verified.
     */
    isEmailVerified(): boolean {
      return gdjs.evtTools.firebase.auth.currentUser.emailVerified;
    },
    /**
     * Gets the users email address.
     */
    getEmail(): string {
      return gdjs.evtTools.firebase.auth.currentUser.email || '';
    },
    /**
     * Gets the creation date of the logged in users account.
     */
    getCreationTime(): string {
      return (
        gdjs.evtTools.firebase.auth.currentUser.metadata.creationTime || ''
      );
    },
    /**
     * Gets the last login date of the logged in users account.
     */
    getLastLoginTime(): string {
      return (
        gdjs.evtTools.firebase.auth.currentUser.metadata.lastSignInTime || ''
      );
    },
    /**
     * Gets the display name of the current user.
     */
    getDisplayName(): string {
      return gdjs.evtTools.firebase.auth.currentUser.displayName || '';
    },
    /**
     * Gets the current users phone number.
     */
    getPhoneNumber(): string {
      return gdjs.evtTools.firebase.auth.currentUser.phoneNumber || '';
    },
    /**
     * Gets the current users Unique IDentifier.
     */
    getUID(): string {
      return gdjs.evtTools.firebase.auth.currentUser.uid || '';
    },
    /**
     * Gets the tenant ID.
     * For advanced usage only.
     */
    getTenantID(): string {
      return gdjs.evtTools.firebase.auth.currentUser.tenantId || '';
    },
    /**
     * Gets the refresh token.
     * For advanced usage only.
     */
    getRefreshToken(): string {
      return gdjs.evtTools.firebase.auth.currentUser.refreshToken || '';
    },
    /**
     * Gets the users profile picture URL.
     */
    getPhotoURL(): string {
      return gdjs.evtTools.firebase.auth.currentUser.photoURL || '';
    },
    /**
     * Changes the display name of an user.
     */
    setDisplayName(newDisplayName: string) {
      gdjs.evtTools.firebase.auth.currentUser.updateProfile({
        displayName: newDisplayName,
      });
    },
    /**
     * Changes the URL to the profile picture of the user.
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
   */
  gdjs.evtTools.firebase.auth.token = function (): string {
    this.currentUser
      .getIdToken()
      .then((token) => (gdjs.evtTools.firebase.auth._token = token));
    return this._token;
  };

  /**
   * Returns true if the user is currently authentified.
   * @see gdjs.evtTools.firebase.auth.authentified
   */
  gdjs.evtTools.firebase.auth.isAuthentified = function (): boolean {
    return gdjs.evtTools.firebase.auth.authentified;
  };

  /**
   * Signs the user in with basic email-password authentication.
   * @param email - The users email.
   * @param password - The users password.
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.auth.signInWithEmail = function (
    email: string,
    password: string,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
      })
      .catch((error) => {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Creates an account with basic email-password authentication.
   * @param email - The users email.
   * @param password - The users password.
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.auth.createAccountWithEmail = function (
    email: string,
    password: string,
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
      })
      .catch((error) => {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Login with a temporary account.
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.auth.anonymSignIn = function (
    callbackStateVariable?: gdjs.Variable
  ) {
    firebase
      .auth()
      .signInAnonymously()
      .then(() => {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
      })
      .catch((error) => {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  /**
   * Signs the user in with an external provider.
   * Only works on the web, NOT on Electron/Cordova.
   * @param providerName - The external provider to use.
   * @param [callbackStateVariable] - The variable where to store the result.
   */
  gdjs.evtTools.firebase.auth.signInWithProvider = function (
    providerName: 'google' | 'facebook' | 'github' | 'twitter',
    callbackStateVariable?: gdjs.Variable
  ) {
    let providerCtor = gdjs.evtTools.firebase.auth.providersList[providerName];
    gdjs.evtTools.firebase.auth._currentProvider = new providerCtor();
    firebase
      .auth()
      .signInWithPopup(gdjs.evtTools.firebase.auth._currentProvider)
      .then(() => {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString('ok');
        }
      })
      .catch((error) => {
        if (typeof callbackStateVariable !== 'undefined') {
          callbackStateVariable.setString(error.message);
        }
      });
  };

  // Listen to authentication state changes to regenerate tokens and keep the user and the authenticated state up to date
  gdjs.evtTools.firebase.onAppCreated.push(function () {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        gdjs.evtTools.firebase.auth.authentified = true;
        gdjs.evtTools.firebase.auth.currentUser = user;
        user.getIdToken().then(
          // Pregenerate the token
          (token) => (gdjs.evtTools.firebase.auth._token = token)
        );
      } else {
        gdjs.evtTools.firebase.auth.authentified = false;
        gdjs.evtTools.firebase.auth.currentUser = null;
      }
    });
  });
}
