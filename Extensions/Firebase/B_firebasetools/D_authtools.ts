namespace gdjs {
  export namespace evtTools {
    export namespace firebaseTools {
      /**
       * Firebase Authentication Event Tools.
       * @namespace
       */
      export namespace auth {
        type ProviderClass =
          | typeof firebase.auth.GoogleAuthProvider
          | typeof firebase.auth.FacebookAuthProvider
          | typeof firebase.auth.GithubAuthProvider
          | typeof firebase.auth.TwitterAuthProvider;
        type ProviderInstance =
          | firebase.auth.GoogleAuthProvider_Instance
          | firebase.auth.FacebookAuthProvider_Instance
          | firebase.auth.GithubAuthProvider_Instance
          | firebase.auth.TwitterAuthProvider_Instance;
        type ProviderName = 'google' | 'facebook' | 'github' | 'twitter';

        /**
         * Table of available external providers.
         */
        const providersList: Record<ProviderName, ProviderClass> = {
          google: firebase.auth.GoogleAuthProvider,
          facebook: firebase.auth.FacebookAuthProvider,
          github: firebase.auth.GithubAuthProvider,
          twitter: firebase.auth.TwitterAuthProvider,
        };

        /**
         * The actual current token.
         */
        let _token = '';

        /**
         * The current auth provider for reauthenticating.
         */
        let _currentProvider: ProviderInstance | null = null;

        /**
         * The current authentication status.
         */
        export let authenticated = false;

        /**
         * The logged-in users data.
         */
        export let currentUser: firebase.User | null = null;

        /**
         * A namespace containing tools for managing the current user.
         * @namespace
         */
        export namespace userManagement {
          /**
           * Contains dangerous management functions. Requires reauthentication before usage.
           * @namespace
           */
          export namespace dangerous {
            /**
             * Changes the users email.
             * Use this when using basic auth.
             * @param oldEmail - Old email for reauthentication.
             * @param password - Old password for reauthentication.
             * @param newEmail - New email for the user.
             * @param [sendVerificationEmail] - Send a verification email to the old address before changing the email?
             * @param [callbackStateVariable] - The variable where to store the result.
             */
            export const changeEmail = (
              oldEmail: string,
              password: string,
              newEmail: string,
              sendVerificationEmail: boolean = true,
              callbackStateVariable?: gdjs.Variable
            ) => {
              if (!currentUser) return;

              const credential = firebase.auth.EmailAuthProvider.credential(
                oldEmail,
                password
              );
              const updater = sendVerificationEmail
                ? currentUser.updateEmail
                : currentUser.verifyBeforeUpdateEmail;

              currentUser
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
            };

            /**
             * Changes the users password.
             * Use this when using basic auth.
             * @param email - Old email for reauthentication.
             * @param oldPassword - Old password for reauthentication.
             * @param newPassword - New password for the user.
             * @param [callbackStateVariable] - The variable where to store the result.
             */
            export const changePassword = (
              email: string,
              oldPassword: string,
              newPassword: string,
              callbackStateVariable?: gdjs.Variable
            ) => {
              if (!currentUser) return;

              const credential = firebase.auth.EmailAuthProvider.credential(
                email,
                oldPassword
              );

              currentUser
                .reauthenticateWithCredential(credential)
                .then(() => currentUser!.updatePassword(newPassword))
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
             * Deletes the current user.
             * Use this when using basic auth.
             * @param email - Old email for reauthentication.
             * @param password - Old password for reauthentication.
             * @param [callbackStateVariable] - The variable where to store the result.
             */
            export const deleteUser = (
              email: string,
              password: string,
              callbackStateVariable?: gdjs.Variable
            ) => {
              if (!currentUser) return;

              const credential = firebase.auth.EmailAuthProvider.credential(
                email,
                password
              );

              currentUser
                .reauthenticateWithCredential(credential)
                .then(() => currentUser!.delete())
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
             * Changes the users email.
             * Use this when using an external provider.
             * @param newEmail - New email for the user.
             * @param sendVerificationEmail - Send a verification email to the old address before changing the email?
             * @param [callbackStateVariable] - The variable where to store the result.
             */
            export const changeEmailProvider = (
              newEmail: string,
              sendVerificationEmail: boolean,
              callbackStateVariable?: gdjs.Variable
            ) => {
              if (!currentUser || !_currentProvider) return;

              const updater = sendVerificationEmail
                ? currentUser.updateEmail
                : currentUser.verifyBeforeUpdateEmail;

              currentUser
                .reauthenticateWithPopup(_currentProvider)
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
            };
            /**
             * Changes the users password.
             * Use this when using an external provider.
             * @param newPassword - New password for the user.
             * @param [callbackStateVariable] - The variable where to store the result.
             */
            export const changePasswordProvider = (
              newPassword: string,
              callbackStateVariable?: gdjs.Variable
            ) => {
              if (currentUser && _currentProvider)
                currentUser
                  .reauthenticateWithPopup(_currentProvider)
                  .then(() => currentUser!.updatePassword(newPassword))
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
             * Deletes the current user.
             * Use this when using an external provider.
             * @param [callbackStateVariable] - The variable where to store the result.
             */
            export const deleteUserProvider = (
              callbackStateVariable?: gdjs.Variable
            ) => {
              if (currentUser && _currentProvider)
                currentUser
                  .reauthenticateWithPopup(_currentProvider)
                  .then(() => currentUser!.delete())
                  .then(() => {
                    if (typeof callbackStateVariable !== 'undefined')
                      callbackStateVariable.setString('ok');
                  })
                  .catch((error) => {
                    if (typeof callbackStateVariable !== 'undefined')
                      callbackStateVariable.setString(error.message);
                  });
            };
          }
          /**
           * Verifies if the current users email is verified.
           */
          export const isEmailVerified = (): boolean =>
            currentUser ? currentUser.emailVerified : false;

          /**
           * Gets the users email address.
           */
          export const getEmail = (): string =>
            currentUser ? currentUser.email || '' : '';

          /**
           * Gets the creation date of the logged in users account.
           */
          export const getCreationTime = (): string =>
            currentUser ? currentUser.metadata.creationTime || '' : '';

          /**
           * Gets the last login date of the logged in users account.
           */
          export const getLastLoginTime = (): string =>
            currentUser ? currentUser.metadata.lastSignInTime || '' : '';

          /**
           * Gets the display name of the current user.
           */
          export const getDisplayName = (): string =>
            currentUser ? currentUser.displayName || '' : '';

          /**
           * Gets the current users phone number.
           */
          export const getPhoneNumber = (): string =>
            currentUser ? currentUser.phoneNumber || '' : '';

          /**
           * Gets the current users Unique IDentifier.
           */
          export const getUID = (): string =>
            currentUser ? currentUser.uid || '' : '';

          /**
           * Gets the tenant ID.
           * For advanced usage only.
           */
          export const getTenantID = (): string =>
            currentUser ? currentUser.tenantId || '' : '';

          /**
           * Gets the refresh token.
           * For advanced usage only.
           */
          export const getRefreshToken = (): string =>
            currentUser ? currentUser.refreshToken || '' : '';

          /**
           * Gets the users profile picture URL.
           */
          export const getPhotoURL = (): string =>
            currentUser ? currentUser.photoURL || '' : '';

          /**
           * Changes the display name of an user.
           */
          export const setDisplayName = (newDisplayName: string) => {
            if (currentUser)
              return currentUser.updateProfile({
                displayName: newDisplayName,
              });
            return Promise.reject('Sign in before setting displayName');
          };

          /**
           * Changes the URL to the profile picture of the user.
           */
          export const setPhotoURL = (newPhotoURL: string) => {
            if (currentUser)
              return currentUser.updateProfile({
                photoURL: newPhotoURL,
              });
            return Promise.reject('Sign in before setting photoURL');
          };

          /**
           * Send an email to the users email address to verify it.
           * @note Even though this function is redundant, we keep it for consistency.
           * @see currentUser.sendEmailVerification
           */
          export const sendVerificationEmail = () =>
            currentUser ? currentUser.sendEmailVerification() : '';
        }

        /**
         * Get the logged-in users authentication token.
         * Tries to refresh it everytime the function is called.
         */
        export const token = (): string => {
          if (currentUser)
            currentUser.getIdToken().then((token) => (_token = token));
          return _token;
        };

        /**
         * Returns true if the user is currently authenticated.
         * @see authenticated
         */
        export const isAuthenticated = (): boolean => authenticated;

        /** @deprecated Use isAuthenticated instead. */
        export const isAuthentified = isAuthenticated;

        /**
         * Signs the user in with basic email-password authentication.
         * @param email - The users email.
         * @param password - The users password.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const signInWithEmail = (
          email: string,
          password: string,
          callbackStateVariable?: gdjs.Variable
        ) =>
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

        /**
         * Creates an account with basic email-password authentication.
         * @param email - The users email.
         * @param password - The users password.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const createAccountWithEmail = (
          email: string,
          password: string,
          callbackStateVariable?: gdjs.Variable
        ) =>
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

        /**
         * Login with a temporary account.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const anonymSignIn = (callbackStateVariable?: gdjs.Variable) =>
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

        /**
         * Signs the user in with an external provider.
         * Only works on the web, NOT on Electron/Cordova.
         * @param providerName - The external provider to use.
         * @param [callbackStateVariable] - The variable where to store the result.
         */
        export const signInWithProvider = function (
          providerName: ProviderName,
          callbackStateVariable?: gdjs.Variable
        ) {
          _currentProvider = new providersList[providerName]();

          firebase
            .auth()
            .signInWithPopup(_currentProvider)
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
        firebaseTools.onAppCreated.push(() => {
          firebase.auth().onAuthStateChanged((user) => {
            if (user) {
              authenticated = true;
              currentUser = user;
              user.getIdToken().then(
                // Prefetch the token
                (token) => (_token = token)
              );
            } else {
              authenticated = false;
              currentUser = null;
            }
          });
        });
      }
    }
  }
}
