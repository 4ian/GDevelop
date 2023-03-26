/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * <code>firebase</code> is a global namespace from which all Firebase
 * services are accessed.
 */
declare namespace firebase {
  /**
   * @hidden
   */
  type NextFn<T> = (value: T) => void;
  /**
   * @hidden
   */
  type ErrorFn<E = Error> = (error: E) => void;
  /**
   * @hidden
   */
  type CompleteFn = () => void;

  /**
   * `FirebaseError` is a subclass of the standard JavaScript `Error` object. In
   * addition to a message string and stack trace, it contains a string code.
   */
  interface FirebaseError {
    /**
     * Error codes are strings using the following format: `"service/string-code"`.
     * Some examples include `"app/no-app"` and `"auth/user-not-found"`.
     *
     * While the message for a given error can change, the code will remain the same
     * between backward-compatible versions of the Firebase SDK.
     */
    code: string;
    /**
     * An explanatory message for the error that just occurred.
     *
     * This message is designed to be helpful to you, the developer. Because
     * it generally does not convey meaningful information to end users,
     * this message should not be displayed in your application.
     */
    message: string;
    /**
     * The name of the class of errors, which is `"FirebaseError"`.
     */
    name: string;
    /**
     * A string value containing the execution backtrace when the error originally
     * occurred. This may not always be available.
     *
     * When it is available, this information can be sent to
     * {@link https://firebase.google.com/support/ Firebase Support} to help
     * explain the cause of an error.
     */
    stack?: string;
  }

  /**
   * @hidden
   */
  interface Observer<T, E = Error> {
    next: NextFn<T>;
    error: ErrorFn<E>;
    complete: CompleteFn;
  }

  /**
   * The JS SDK supports 5 log levels and also allows a user the ability to
   * silence the logs altogether.
   *
   * The order is as follows:
   * silent < debug < verbose < info < warn < error
   */
  type LogLevel = 'debug' | 'verbose' | 'info' | 'warn' | 'error' | 'silent';

  /**
   * The current SDK version.
   */
  var SDK_VERSION: string;

  /**
   * Registers a library's name and version for platform logging purposes.
   * @param library Name of 1p or 3p library (e.g. firestore, angularfire)
   * @param version Current version of that library.
   * @param variant Bundle variant, e.g., node, rn, etc.
   */
  function registerVersion(
    library: string,
    version: string,
    variant?: string
  ): void;

  /**
   * Sets log level for all Firebase packages.
   *
   * All of the log types above the current log level are captured (i.e. if
   * you set the log level to `info`, errors are logged, but `debug` and
   * `verbose` logs are not).
   */
  function setLogLevel(logLevel: LogLevel): void;

  /**
   * Sets log handler for all Firebase packages.
   * @param logCallback An optional custom log handler that executes user code whenever
   * the Firebase SDK makes a logging call.
   */
  function onLog(
    logCallback: (callbackParams: {
      /**
       * Level of event logged.
       */
      level: LogLevel;
      /**
       * Any text from logged arguments joined into one string.
       */
      message: string;
      /**
       * The raw arguments passed to the log call.
       */
      args: any[];
      /**
       * A string indicating the name of the package that made the log call,
       * such as `@firebase/firestore`.
       */
      type: string;
    }) => void,
    options?: {
      /**
       * Threshhold log level. Only logs at or above this level trigger the `logCallback`
       * passed to `onLog`.
       */
      level: LogLevel;
    }
  ): void;

  /**
   * @hidden
   */
  type Unsubscribe = () => void;

  /**
   * A user account.
   */
  interface User extends firebase.UserInfo {
    /**
     * Deletes and signs out the user.
     *
     * <b>Important:</b> this is a security-sensitive operation that requires the
     * user to have recently signed in. If this requirement isn't met, ask the user
     * to authenticate again and then call
     * {@link firebase.User.reauthenticateWithCredential}.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/requires-recent-login</dt>
     * <dd>Thrown if the user's last sign-in time does not meet the security
     *     threshold. Use {@link firebase.User.reauthenticateWithCredential} to
     *     resolve. This does not apply if the user is anonymous.</dd>
     * </dl>
     */
    delete(): Promise<void>;
    emailVerified: boolean;
    getIdTokenResult(
      forceRefresh?: boolean
    ): Promise<firebase.auth.IdTokenResult>;
    /**
     * Returns a JSON Web Token (JWT) used to identify the user to a Firebase
     * service.
     *
     * Returns the current token if it has not expired. Otherwise, this will
     * refresh the token and return a new one.
     *
     * @param forceRefresh Force refresh regardless of token
     *     expiration.
     */
    getIdToken(forceRefresh?: boolean): Promise<string>;
    isAnonymous: boolean;
    /**
     * Links the user account with the given credentials and returns any available
     * additional user information, such as user name.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/provider-already-linked</dt>
     * <dd>Thrown if the provider has already been linked to the user. This error is
     *     thrown even if this is not the same provider's account that is currently
     *     linked to the user.</dd>
     * <dt>auth/invalid-credential</dt>
     * <dd>Thrown if the provider's credential is not valid. This can happen if it
     *     has already expired when calling link, or if it used invalid token(s).
     *     See the Firebase documentation for your provider, and make sure you pass
     *     in the correct parameters to the credential method.</dd>
     * <dt>auth/credential-already-in-use</dt>
     * <dd>Thrown if the account corresponding to the credential already exists
     *     among your users, or is already linked to a Firebase User.
     *     For example, this error could be thrown if you are upgrading an anonymous
     *     user to a Google user by linking a Google credential to it and the Google
     *     credential used is already associated with an existing Firebase Google
     *     user.
     *     The fields <code>error.email</code>, <code>error.phoneNumber</code>, and
     *     <code>error.credential</code> ({@link firebase.auth.AuthCredential})
     *     may be provided, depending on the type of credential. You can recover
     *     from this error by signing in with <code>error.credential</code> directly
     *     via {@link firebase.auth.Auth.signInWithCredential}.</dd>
     * <dt>auth/email-already-in-use</dt>
     * <dd>Thrown if the email corresponding to the credential already exists
     *     among your users. When thrown while linking a credential to an existing
     *     user, an <code>error.email</code> and <code>error.credential</code>
     *     ({@link firebase.auth.AuthCredential}) fields are also provided.
     *     You have to link the credential to the existing user with that email if
     *     you wish to continue signing in with that credential. To do so, call
     *     {@link firebase.auth.Auth.fetchSignInMethodsForEmail}, sign in to
     *     <code>error.email</code> via one of the providers returned and then
     *     {@link firebase.User.linkWithCredential} the original credential to that
     *     newly signed in user.</dd>
     * <dt>auth/operation-not-allowed</dt>
     * <dd>Thrown if you have not enabled the provider in the Firebase Console. Go
     *     to the Firebase Console for your project, in the Auth section and the
     *     <strong>Sign in Method</strong> tab and configure the provider.</dd>
     * <dt>auth/invalid-email</dt>
     * <dd>Thrown if the email used in a
     *     {@link firebase.auth.EmailAuthProvider.credential} is invalid.</dd>
     * <dt>auth/wrong-password</dt>
     * <dd>Thrown if the password used in a
     *     {@link firebase.auth.EmailAuthProvider.credential} is not correct or
     *     when the user associated with the email does not have a password.</dd>
     * <dt>auth/invalid-verification-code</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential} and the verification
     *     code of the credential is not valid.</dd>
     * <dt>auth/invalid-verification-id</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential}  and the verification
     *     ID of the credential is not valid.</dd>
     * </dl>
     *
     * @deprecated  This method is deprecated. Use
     * {@link firebase.User.linkWithCredential} instead.
     *
     * @param credential The auth credential.
     */
    linkAndRetrieveDataWithCredential(
      credential: firebase.auth.AuthCredential
    ): Promise<firebase.auth.UserCredential>;
    /**
     * Links the user account with the given credentials.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/provider-already-linked</dt>
     * <dd>Thrown if the provider has already been linked to the user. This error is
     *     thrown even if this is not the same provider's account that is currently
     *     linked to the user.</dd>
     * <dt>auth/invalid-credential</dt>
     * <dd>Thrown if the provider's credential is not valid. This can happen if it
     *     has already expired when calling link, or if it used invalid token(s).
     *     See the Firebase documentation for your provider, and make sure you pass
     *     in the correct parameters to the credential method.</dd>
     * <dt>auth/credential-already-in-use</dt>
     * <dd>Thrown if the account corresponding to the credential already exists
     *     among your users, or is already linked to a Firebase User.
     *     For example, this error could be thrown if you are upgrading an anonymous
     *     user to a Google user by linking a Google credential to it and the Google
     *     credential used is already associated with an existing Firebase Google
     *     user.
     *     The fields <code>error.email</code>, <code>error.phoneNumber</code>, and
     *     <code>error.credential</code> ({@link firebase.auth.AuthCredential})
     *     may be provided, depending on the type of credential. You can recover
     *     from this error by signing in with <code>error.credential</code> directly
     *     via {@link firebase.auth.Auth.signInWithCredential}.</dd>
     * <dt>auth/email-already-in-use</dt>
     * <dd>Thrown if the email corresponding to the credential already exists
     *     among your users. When thrown while linking a credential to an existing
     *     user, an <code>error.email</code> and <code>error.credential</code>
     *     ({@link firebase.auth.AuthCredential}) fields are also provided.
     *     You have to link the credential to the existing user with that email if
     *     you wish to continue signing in with that credential. To do so, call
     *     {@link firebase.auth.Auth.fetchSignInMethodsForEmail}, sign in to
     *     <code>error.email</code> via one of the providers returned and then
     *     {@link firebase.User.linkWithCredential} the original credential to that
     *     newly signed in user.</dd>
     * <dt>auth/operation-not-allowed</dt>
     * <dd>Thrown if you have not enabled the provider in the Firebase Console. Go
     *     to the Firebase Console for your project, in the Auth section and the
     *     <strong>Sign in Method</strong> tab and configure the provider.</dd>
     * <dt>auth/invalid-email</dt>
     * <dd>Thrown if the email used in a
     *     {@link firebase.auth.EmailAuthProvider.credential} is invalid.</dd>
     * <dt>auth/wrong-password</dt>
     * <dd>Thrown if the password used in a
     *     {@link firebase.auth.EmailAuthProvider.credential} is not correct or
     *     when the user associated with the email does not have a password.</dd>
     * <dt>auth/invalid-verification-code</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential} and the verification
     *     code of the credential is not valid.</dd>
     * <dt>auth/invalid-verification-id</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential}  and the verification
     *     ID of the credential is not valid.</dd>
     * </dl>
     *
     * @param credential The auth credential.
     */
    linkWithCredential(
      credential: firebase.auth.AuthCredential
    ): Promise<firebase.auth.UserCredential>;
    /**
     * Links the user account with the given phone number.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/provider-already-linked</dt>
     * <dd>Thrown if the provider has already been linked to the user. This error is
     *     thrown even if this is not the same provider's account that is currently
     *     linked to the user.</dd>
     * <dt>auth/captcha-check-failed</dt>
     * <dd>Thrown if the reCAPTCHA response token was invalid, expired, or if
     *     this method was called from a non-whitelisted domain.</dd>
     * <dt>auth/invalid-phone-number</dt>
     * <dd>Thrown if the phone number has an invalid format.</dd>
     * <dt>auth/missing-phone-number</dt>
     * <dd>Thrown if the phone number is missing.</dd>
     * <dt>auth/quota-exceeded</dt>
     * <dd>Thrown if the SMS quota for the Firebase project has been exceeded.</dd>
     * <dt>auth/user-disabled</dt>
     * <dd>Thrown if the user corresponding to the given phone number has been
     *     disabled.</dd>
     * <dt>auth/credential-already-in-use</dt>
     * <dd>Thrown if the account corresponding to the phone number already exists
     *     among your users, or is already linked to a Firebase User.
     *     The fields <code>error.phoneNumber</code> and
     *     <code>error.credential</code> ({@link firebase.auth.AuthCredential})
     *     are provided in this case. You can recover from this error by signing in
     *     with that credential directly via
     *     {@link firebase.auth.Auth.signInWithCredential}.</dd>
     * <dt>auth/operation-not-allowed</dt>
     * <dd>Thrown if you have not enabled the phone authentication provider in the
     *     Firebase Console. Go to the Firebase Console for your project, in the
     *     Auth section and the <strong>Sign in Method</strong> tab and configure
     *     the provider.</dd>
     * </dl>
     *
     * @param phoneNumber The user's phone number in E.164 format (e.g.
     *     +16505550101).
     * @param applicationVerifier
     */
    linkWithPhoneNumber(
      phoneNumber: string,
      applicationVerifier: firebase.auth.ApplicationVerifier
    ): Promise<firebase.auth.ConfirmationResult>;
    /**
     * Links the authenticated provider to the user account using a pop-up based
     * OAuth flow.
     *
     * If the linking is successful, the returned result will contain the user
     * and the provider's credential.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/auth-domain-config-required</dt>
     * <dd>Thrown if authDomain configuration is not provided when calling
     *     firebase.initializeApp(). Check Firebase Console for instructions on
     *     determining and passing that field.</dd>
     * <dt>auth/cancelled-popup-request</dt>
     * <dd>Thrown if successive popup operations are triggered. Only one popup
     *     request is allowed at one time on a user or an auth instance. All the
     *     popups would fail with this error except for the last one.</dd>
     * <dt>auth/credential-already-in-use</dt>
     * <dd>Thrown if the account corresponding to the credential already exists
     *     among your users, or is already linked to a Firebase User.
     *     For example, this error could be thrown if you are upgrading an anonymous
     *     user to a Google user by linking a Google credential to it and the Google
     *     credential used is already associated with an existing Firebase Google
     *     user.
     *     An <code>error.email</code> and <code>error.credential</code>
     *     ({@link firebase.auth.AuthCredential}) fields are also provided. You can
     *     recover from this error by signing in with that credential directly via
     *     {@link firebase.auth.Auth.signInWithCredential}.</dd>
     * <dt>auth/email-already-in-use</dt>
     * <dd>Thrown if the email corresponding to the credential already exists
     *     among your users. When thrown while linking a credential to an existing
     *     user, an <code>error.email</code> and <code>error.credential</code>
     *     ({@link firebase.auth.AuthCredential}) fields are also provided.
     *     You have to link the credential to the existing user with that email if
     *     you wish to continue signing in with that credential. To do so, call
     *     {@link firebase.auth.Auth.fetchSignInMethodsForEmail}, sign in to
     *     <code>error.email</code> via one of the providers returned and then
     *     {@link firebase.User.linkWithCredential} the original credential to that
     *     newly signed in user.</dd>
     * <dt>auth/operation-not-allowed</dt>
     * <dd>Thrown if you have not enabled the provider in the Firebase Console. Go
     *     to the Firebase Console for your project, in the Auth section and the
     *     <strong>Sign in Method</strong> tab and configure the provider.</dd>
     * <dt>auth/popup-blocked</dt>
     * <dt>auth/operation-not-supported-in-this-environment</dt>
     * <dd>Thrown if this operation is not supported in the environment your
     *     application is running on. "location.protocol" must be http or https.
     *     </dd>
     * <dd>Thrown if the popup was blocked by the browser, typically when this
     *     operation is triggered outside of a click handler.</dd>
     * <dt>auth/popup-closed-by-user</dt>
     * <dd>Thrown if the popup window is closed by the user without completing the
     *     sign in to the provider.</dd>
     * <dt>auth/provider-already-linked</dt>
     * <dd>Thrown if the provider has already been linked to the user. This error is
     *     thrown even if this is not the same provider's account that is currently
     *     linked to the user.</dd>
     * <dt>auth/unauthorized-domain</dt>
     * <dd>Thrown if the app domain is not authorized for OAuth operations for your
     *     Firebase project. Edit the list of authorized domains from the Firebase
     *     console.</dd>
     * </dl>
     *
     * @webonly
     *
     * @example
     * ```javascript
     * // Creates the provider object.
     * var provider = new firebase.auth.FacebookAuthProvider();
     * // You can add additional scopes to the provider:
     * provider.addScope('email');
     * provider.addScope('user_friends');
     * // Link with popup:
     * user.linkWithPopup(provider).then(function(result) {
     *   // The firebase.User instance:
     *   var user = result.user;
     *   // The Facebook firebase.auth.AuthCredential containing the Facebook
     *   // access token:
     *   var credential = result.credential;
     * }, function(error) {
     *   // An error happened.
     * });
     * ```
     *
     * @param provider The provider to authenticate.
     *     The provider has to be an OAuth provider. Non-OAuth providers like {@link
     *     firebase.auth.EmailAuthProvider} will throw an error.
     */
    linkWithPopup(
      provider: firebase.auth.AuthProvider
    ): Promise<firebase.auth.UserCredential>;
    /**
     * Links the authenticated provider to the user account using a full-page
     * redirect flow.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/auth-domain-config-required</dt>
     * <dd>Thrown if authDomain configuration is not provided when calling
     *     firebase.initializeApp(). Check Firebase Console for instructions on
     *     determining and passing that field.</dd>
     * <dt>auth/operation-not-supported-in-this-environment</dt>
     * <dd>Thrown if this operation is not supported in the environment your
     *     application is running on. "location.protocol" must be http or https.
     *     </dd>
     * <dt>auth/provider-already-linked</dt>
     * <dd>Thrown if the provider has already been linked to the user. This error is
     *     thrown even if this is not the same provider's account that is currently
     *     linked to the user.</dd>
     * <dt>auth/unauthorized-domain</dt>
     * <dd>Thrown if the app domain is not authorized for OAuth operations for your
     *     Firebase project. Edit the list of authorized domains from the Firebase
     *     console.</dd>
     * </dl>
     *
     * @param provider The provider to authenticate.
     *     The provider has to be an OAuth provider. Non-OAuth providers like {@link
     *     firebase.auth.EmailAuthProvider} will throw an error.
     */
    linkWithRedirect(provider: firebase.auth.AuthProvider): Promise<void>;
    metadata: firebase.auth.UserMetadata;
    /**
     * The {@link firebase.User.MultiFactorUser} object corresponding to the current user.
     * This is used to access all multi-factor properties and operations related to the
     * current user.
     */

    multiFactor: firebase.User.MultiFactorUser;
    /**
     * The phone number normalized based on the E.164 standard (e.g. +16505550101)
     * for the current user. This is null if the user has no phone credential linked
     * to the account.
     */
    phoneNumber: string | null;
    providerData: (firebase.UserInfo | null)[];
    /**
     * Re-authenticates a user using a fresh credential, and returns any available
     * additional user information, such as user name. Use before operations
     * such as {@link firebase.User.updatePassword} that require tokens from recent
     * sign-in attempts.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/user-mismatch</dt>
     * <dd>Thrown if the credential given does not correspond to the user.</dd>
     * <dt>auth/user-not-found</dt>
     * <dd>Thrown if the credential given does not correspond to any existing user.
     *     </dd>
     * <dt>auth/invalid-credential</dt>
     * <dd>Thrown if the provider's credential is not valid. This can happen if it
     *     has already expired when calling link, or if it used invalid token(s).
     *     See the Firebase documentation for your provider, and make sure you pass
     *     in the correct parameters to the credential method.</dd>
     * <dt>auth/invalid-email</dt>
     * <dd>Thrown if the email used in a
     *     {@link firebase.auth.EmailAuthProvider.credential} is invalid.</dd>
     * <dt>auth/wrong-password</dt>
     * <dd>Thrown if the password used in a
     *     {@link firebase.auth.EmailAuthProvider.credential} is not correct or when
     *     the user associated with the email does not have a password.</dd>
     * <dt>auth/invalid-verification-code</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential} and the verification
     *     code of the credential is not valid.</dd>
     * <dt>auth/invalid-verification-id</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential}  and the verification
     *     ID of the credential is not valid.</dd>
     * </dl>
     *
     * @deprecated
     * This method is deprecated. Use
     * {@link firebase.User.reauthenticateWithCredential} instead.
     *
     * @param credential
     */
    reauthenticateAndRetrieveDataWithCredential(
      credential: firebase.auth.AuthCredential
    ): Promise<firebase.auth.UserCredential>;
    /**
     * Re-authenticates a user using a fresh credential. Use before operations
     * such as {@link firebase.User.updatePassword} that require tokens from recent
     * sign-in attempts.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/user-mismatch</dt>
     * <dd>Thrown if the credential given does not correspond to the user.</dd>
     * <dt>auth/user-not-found</dt>
     * <dd>Thrown if the credential given does not correspond to any existing user.
     *     </dd>
     * <dt>auth/invalid-credential</dt>
     * <dd>Thrown if the provider's credential is not valid. This can happen if it
     *     has already expired when calling link, or if it used invalid token(s).
     *     See the Firebase documentation for your provider, and make sure you pass
     *     in the correct parameters to the credential method.</dd>
     * <dt>auth/invalid-email</dt>
     * <dd>Thrown if the email used in a
     *     {@link firebase.auth.EmailAuthProvider.credential} is invalid.</dd>
     * <dt>auth/wrong-password</dt>
     * <dd>Thrown if the password used in a
     *     {@link firebase.auth.EmailAuthProvider.credential} is not correct or when
     *     the user associated with the email does not have a password.</dd>
     * <dt>auth/invalid-verification-code</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential} and the verification
     *     code of the credential is not valid.</dd>
     * <dt>auth/invalid-verification-id</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential}  and the verification
     *     ID of the credential is not valid.</dd>
     * </dl>
     *
     * @param credential
     */
    reauthenticateWithCredential(
      credential: firebase.auth.AuthCredential
    ): Promise<firebase.auth.UserCredential>;
    /**
     * Re-authenticates a user using a fresh credential. Use before operations
     * such as {@link firebase.User.updatePassword} that require tokens from recent
     * sign-in attempts.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/user-mismatch</dt>
     * <dd>Thrown if the credential given does not correspond to the user.</dd>
     * <dt>auth/user-not-found</dt>
     * <dd>Thrown if the credential given does not correspond to any existing user.
     *     </dd>
     * <dt>auth/captcha-check-failed</dt>
     * <dd>Thrown if the reCAPTCHA response token was invalid, expired, or if
     *     this method was called from a non-whitelisted domain.</dd>
     * <dt>auth/invalid-phone-number</dt>
     * <dd>Thrown if the phone number has an invalid format.</dd>
     * <dt>auth/missing-phone-number</dt>
     * <dd>Thrown if the phone number is missing.</dd>
     * <dt>auth/quota-exceeded</dt>
     * <dd>Thrown if the SMS quota for the Firebase project has been exceeded.</dd>
     * </dl>
     *
     * @param phoneNumber The user's phone number in E.164 format (e.g.
     *     +16505550101).
     * @param applicationVerifier
     */
    reauthenticateWithPhoneNumber(
      phoneNumber: string,
      applicationVerifier: firebase.auth.ApplicationVerifier
    ): Promise<firebase.auth.ConfirmationResult>;
    /**
     * Reauthenticates the current user with the specified provider using a pop-up
     * based OAuth flow.
     *
     * If the reauthentication is successful, the returned result will contain the
     * user and the provider's credential.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/auth-domain-config-required</dt>
     * <dd>Thrown if authDomain configuration is not provided when calling
     *     firebase.initializeApp(). Check Firebase Console for instructions on
     *     determining and passing that field.</dd>
     * <dt>auth/cancelled-popup-request</dt>
     * <dd>Thrown if successive popup operations are triggered. Only one popup
     *     request is allowed at one time on a user or an auth instance. All the
     *     popups would fail with this error except for the last one.</dd>
     * <dt>auth/user-mismatch</dt>
     * <dd>Thrown if the credential given does not correspond to the user.</dd>
     * <dt>auth/operation-not-allowed</dt>
     * <dd>Thrown if you have not enabled the provider in the Firebase Console. Go
     *     to the Firebase Console for your project, in the Auth section and the
     *     <strong>Sign in Method</strong> tab and configure the provider.</dd>
     * <dt>auth/popup-blocked</dt>
     * <dd>Thrown if the popup was blocked by the browser, typically when this
     *     operation is triggered outside of a click handler.</dd>
     * <dt>auth/operation-not-supported-in-this-environment</dt>
     * <dd>Thrown if this operation is not supported in the environment your
     *     application is running on. "location.protocol" must be http or https.
     *     </dd>
     * <dt>auth/popup-closed-by-user</dt>
     * <dd>Thrown if the popup window is closed by the user without completing the
     *     sign in to the provider.</dd>
     * <dt>auth/unauthorized-domain</dt>
     * <dd>Thrown if the app domain is not authorized for OAuth operations for your
     *     Firebase project. Edit the list of authorized domains from the Firebase
     *     console.</dd>
     * </dl>
     *
     * @webonly
     *
     * @example
     * ```javascript
     * // Creates the provider object.
     * var provider = new firebase.auth.FacebookAuthProvider();
     * // You can add additional scopes to the provider:
     * provider.addScope('email');
     * provider.addScope('user_friends');
     * // Reauthenticate with popup:
     * user.reauthenticateWithPopup(provider).then(function(result) {
     *   // The firebase.User instance:
     *   var user = result.user;
     *   // The Facebook firebase.auth.AuthCredential containing the Facebook
     *   // access token:
     *   var credential = result.credential;
     * }, function(error) {
     *   // An error happened.
     * });
     * ```
     *
     * @param provider The provider to authenticate.
     *     The provider has to be an OAuth provider. Non-OAuth providers like {@link
     *     firebase.auth.EmailAuthProvider} will throw an error.
     */
    reauthenticateWithPopup(
      provider: firebase.auth.AuthProvider
    ): Promise<firebase.auth.UserCredential>;
    /**
     * Reauthenticates the current user with the specified OAuth provider using a
     * full-page redirect flow.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/auth-domain-config-required</dt>
     * <dd>Thrown if authDomain configuration is not provided when calling
     *     firebase.initializeApp(). Check Firebase Console for instructions on
     *     determining and passing that field.</dd>
     * <dt>auth/operation-not-supported-in-this-environment</dt>
     * <dd>Thrown if this operation is not supported in the environment your
     *     application is running on. "location.protocol" must be http or https.
     *     </dd>
     * <dt>auth/user-mismatch</dt>
     * <dd>Thrown if the credential given does not correspond to the user.</dd>
     * <dt>auth/unauthorized-domain</dt>
     * <dd>Thrown if the app domain is not authorized for OAuth operations for your
     *     Firebase project. Edit the list of authorized domains from the Firebase
     *     console.</dd>
     * </dl>
     *
     * @webonly
     *
     * @param provider The provider to authenticate.
     *     The provider has to be an OAuth provider. Non-OAuth providers like {@link
     *     firebase.auth.EmailAuthProvider} will throw an error.
     */
    reauthenticateWithRedirect(
      provider: firebase.auth.AuthProvider
    ): Promise<void>;
    refreshToken: string;
    /**
     * Refreshes the current user, if signed in.
     *
     */
    reload(): Promise<void>;
    /**
     * Sends a verification email to a user.
     *
     * The verification process is completed by calling
     * {@link firebase.auth.Auth.applyActionCode}
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/missing-android-pkg-name</dt>
     * <dd>An Android package name must be provided if the Android app is required
     *     to be installed.</dd>
     * <dt>auth/missing-continue-uri</dt>
     * <dd>A continue URL must be provided in the request.</dd>
     * <dt>auth/missing-ios-bundle-id</dt>
     * <dd>An iOS bundle ID must be provided if an App Store ID is provided.</dd>
     * <dt>auth/invalid-continue-uri</dt>
     * <dd>The continue URL provided in the request is invalid.</dd>
     * <dt>auth/unauthorized-continue-uri</dt>
     * <dd>The domain of the continue URL is not whitelisted. Whitelist
     *     the domain in the Firebase console.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * var actionCodeSettings = {
     *   url: 'https://www.example.com/cart?email=user@example.com&cartId=123',
     *   iOS: {
     *     bundleId: 'com.example.ios'
     *   },
     *   android: {
     *     packageName: 'com.example.android',
     *     installApp: true,
     *     minimumVersion: '12'
     *   },
     *   handleCodeInApp: true
     * };
     * firebase.auth().currentUser.sendEmailVerification(actionCodeSettings)
     *     .then(function() {
     *       // Verification email sent.
     *     })
     *     .catch(function(error) {
     *       // Error occurred. Inspect error.code.
     *     });
     * ```
     *
     * @param actionCodeSettings The action
     *     code settings. If specified, the state/continue URL will be set as the
     *     "continueUrl" parameter in the email verification link. The default email
     *     verification landing page will use this to display a link to go back to
     *     the app if it is installed.
     *     If the actionCodeSettings is not specified, no URL is appended to the
     *     action URL.
     *     The state URL provided must belong to a domain that is whitelisted by the
     *     developer in the console. Otherwise an error will be thrown.
     *     Mobile app redirects will only be applicable if the developer configures
     *     and accepts the Firebase Dynamic Links terms of condition.
     *     The Android package name and iOS bundle ID will be respected only if they
     *     are configured in the same Firebase Auth project used.
     */
    sendEmailVerification(
      actionCodeSettings?: firebase.auth.ActionCodeSettings | null
    ): Promise<void>;
    /**
     * The current user's tenant ID. This is a read-only property, which indicates
     * the tenant ID used to sign in the current user. This is null if the user is
     * signed in from the parent project.
     *
     * @example
     * ```javascript
     * // Set the tenant ID on Auth instance.
     * firebase.auth().tenantId = ‘TENANT_PROJECT_ID’;
     *
     * // All future sign-in request now include tenant ID.
     * firebase.auth().signInWithEmailAndPassword(email, password)
     *   .then(function(result) {
     *     // result.user.tenantId should be ‘TENANT_PROJECT_ID’.
     *   }).catch(function(error) {
     *     // Handle error.
     *   });
     * ```
     */
    tenantId: string | null;
    /**
     * Returns a JSON-serializable representation of this object.
     *
     * @return A JSON-serializable representation of this object.
     */
    toJSON(): Object;
    /**
     * Unlinks a provider from a user account.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/no-such-provider</dt>
     * <dd>Thrown if the user does not have this provider linked or when the
     *     provider ID given does not exist.</dd>
     * </dt>
     *
     * @param providerId
     */
    unlink(providerId: string): Promise<firebase.User>;
    /**
     * Updates the user's email address.
     *
     * An email will be sent to the original email address (if it was set) that
     * allows to revoke the email address change, in order to protect them from
     * account hijacking.
     *
     * <b>Important:</b> this is a security sensitive operation that requires the
     * user to have recently signed in. If this requirement isn't met, ask the user
     * to authenticate again and then call
     * {@link firebase.User.reauthenticateWithCredential}.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/invalid-email</dt>
     * <dd>Thrown if the email used is invalid.</dd>
     * <dt>auth/email-already-in-use</dt>
     * <dd>Thrown if the email is already used by another user.</dd>
     * <dt>auth/requires-recent-login</dt>
     * <dd>Thrown if the user's last sign-in time does not meet the security
     *     threshold. Use {@link firebase.User.reauthenticateWithCredential} to
     *     resolve. This does not apply if the user is anonymous.</dd>
     * </dl>
     *
     * @param newEmail The new email address.
     */
    updateEmail(newEmail: string): Promise<void>;
    /**
     * Updates the user's password.
     *
     * <b>Important:</b> this is a security sensitive operation that requires the
     * user to have recently signed in. If this requirement isn't met, ask the user
     * to authenticate again and then call
     * {@link firebase.User.reauthenticateWithCredential}.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/weak-password</dt>
     * <dd>Thrown if the password is not strong enough.</dd>
     * <dt>auth/requires-recent-login</dt>
     * <dd>Thrown if the user's last sign-in time does not meet the security
     *     threshold. Use {@link firebase.User.reauthenticateWithCredential} to
     *     resolve. This does not apply if the user is anonymous.</dd>
     * </dl>
     *
     * @param newPassword
     */
    updatePassword(newPassword: string): Promise<void>;
    /**
     * Updates the user's phone number.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/invalid-verification-code</dt>
     * <dd>Thrown if the verification code of the credential is not valid.</dd>
     * <dt>auth/invalid-verification-id</dt>
     * <dd>Thrown if the verification ID of the credential is not valid.</dd>
     * </dl>
     *
     * @param phoneCredential
     */
    updatePhoneNumber(
      phoneCredential: firebase.auth.AuthCredential
    ): Promise<void>;
    /**
     * Updates a user's profile data.
     *
     * @example
     * ```javascript
     * // Updates the user attributes:
     * user.updateProfile({
     *   displayName: "Jane Q. User",
     *   photoURL: "https://example.com/jane-q-user/profile.jpg"
     * }).then(function() {
     *   // Profile updated successfully!
     *   // "Jane Q. User"
     *   var displayName = user.displayName;
     *   // "https://example.com/jane-q-user/profile.jpg"
     *   var photoURL = user.photoURL;
     * }, function(error) {
     *   // An error happened.
     * });
     *
     * // Passing a null value will delete the current attribute's value, but not
     * // passing a property won't change the current attribute's value:
     * // Let's say we're using the same user than before, after the update.
     * user.updateProfile({photoURL: null}).then(function() {
     *   // Profile updated successfully!
     *   // "Jane Q. User", hasn't changed.
     *   var displayName = user.displayName;
     *   // Now, this is null.
     *   var photoURL = user.photoURL;
     * }, function(error) {
     *   // An error happened.
     * });
     * ```
     *
     * @param profile The profile's
     *     displayName and photoURL to update.
     */
    updateProfile(profile: {
      displayName?: string | null;
      photoURL?: string | null;
    }): Promise<void>;
    /**
     * Sends a verification email to a new email address. The user's email will be
     * updated to the new one after being verified.
     *
     * If you have a custom email action handler, you can complete the verification
     * process by calling {@link firebase.auth.Auth.applyActionCode}.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/missing-android-pkg-name</dt>
     * <dd>An Android package name must be provided if the Android app is required
     *     to be installed.</dd>
     * <dt>auth/missing-continue-uri</dt>
     * <dd>A continue URL must be provided in the request.</dd>
     * <dt>auth/missing-ios-bundle-id</dt>
     * <dd>An iOS bundle ID must be provided if an App Store ID is provided.</dd>
     * <dt>auth/invalid-continue-uri</dt>
     * <dd>The continue URL provided in the request is invalid.</dd>
     * <dt>auth/unauthorized-continue-uri</dt>
     * <dd>The domain of the continue URL is not whitelisted. Whitelist
     *     the domain in the Firebase console.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * var actionCodeSettings = {
     *   url: 'https://www.example.com/cart?email=user@example.com&cartId=123',
     *   iOS: {
     *     bundleId: 'com.example.ios'
     *   },
     *   android: {
     *     packageName: 'com.example.android',
     *     installApp: true,
     *     minimumVersion: '12'
     *   },
     *   handleCodeInApp: true
     * };
     * firebase.auth().currentUser.verifyBeforeUpdateEmail(
     *   'user@example.com', actionCodeSettings)
     *   .then(function() {
     *     // Verification email sent.
     *   })
     *   .catch(function(error) {
     *     // Error occurred. Inspect error.code.
     *   });
     * ```
     *
     * @param newEmail The email address to be verified and updated to.
     * @param actionCodeSettings The action
     *     code settings. If specified, the state/continue URL will be set as the
     *     "continueUrl" parameter in the email verification link. The default email
     *     verification landing page will use this to display a link to go back to
     *     the app if it is installed.
     *     If the actionCodeSettings is not specified, no URL is appended to the
     *     action URL.
     *     The state URL provided must belong to a domain that is whitelisted by the
     *     developer in the console. Otherwise an error will be thrown.
     *     Mobile app redirects will only be applicable if the developer configures
     *     and accepts the Firebase Dynamic Links terms of condition.
     *     The Android package name and iOS bundle ID will be respected only if they
     *     are configured in the same Firebase Auth project used.
     */
    verifyBeforeUpdateEmail(
      newEmail: string,
      actionCodeSettings?: firebase.auth.ActionCodeSettings | null
    ): Promise<void>;
  }

  /**
   * User profile information, visible only to the Firebase project's
   * apps.
   *
   */
  interface UserInfo {
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    providerId: string;
    /**
     * The user's unique ID.
     */
    uid: string;
  }

  type FirebaseSignInProvider =
    | 'custom'
    | 'email'
    | 'password'
    | 'phone'
    | 'anonymous'
    | 'google.com'
    | 'facebook.com'
    | 'github.com'
    | 'twitter.com'
    | 'microsoft.com'
    | 'apple.com';

  interface FirebaseIdToken {
    /** Always set to https://securetoken.google.com/PROJECT_ID */
    iss: string;

    /** Always set to PROJECT_ID */
    aud: string;

    /** The user's unique ID */
    sub: string;

    /** The token issue time, in seconds since epoch */
    iat: number;

    /** The token expiry time, normally 'iat' + 3600 */
    exp: number;

    /** The user's unique ID. Must be equal to 'sub' */
    user_id: string;

    /** The time the user authenticated, normally 'iat' */
    auth_time: number;

    /** The sign in provider, only set when the provider is 'anonymous' */
    provider_id?: 'anonymous';

    /** The user's primary email */
    email?: string;

    /** The user's email verification status */
    email_verified?: boolean;

    /** The user's primary phone number */
    phone_number?: string;

    /** The user's display name */
    name?: string;

    /** The user's profile photo URL */
    picture?: string;

    /** Information on all identities linked to this user */
    firebase: {
      /** The primary sign-in provider */
      sign_in_provider: FirebaseSignInProvider;

      /** A map of providers to the user's list of unique identifiers from each provider */
      identities?: { [provider in FirebaseSignInProvider]?: string[] };
    };

    /** Custom claims set by the developer */
    [claim: string]: unknown;

    // NO LONGER SUPPORTED. Use "sub" instead. (Not a jsdoc comment to avoid generating docs.)
    uid?: never;
  }

  export type EmulatorMockTokenOptions = (
    | { user_id: string }
    | { sub: string }
  ) &
    Partial<FirebaseIdToken>;

  /**
   * Retrieves a Firebase {@link firebase.app.App app} instance.
   *
   * When called with no arguments, the default app is returned. When an app name
   * is provided, the app corresponding to that name is returned.
   *
   * An exception is thrown if the app being retrieved has not yet been
   * initialized.
   *
   * @example
   * ```javascript
   * // Return the default app
   * var app = firebase.app();
   * ```
   *
   * @example
   * ```javascript
   * // Return a named app
   * var otherApp = firebase.app("otherApp");
   * ```
   *
   * @param name Optional name of the app to return. If no name is
   *   provided, the default is `"[DEFAULT]"`.
   *
   * @return The app corresponding to the provided app name.
   *   If no app name is provided, the default app is returned.
   */
  function app(name?: string): firebase.app.App;

  /**
   * A (read-only) array of all initialized apps.
   */
  var apps: firebase.app.App[];

  /**
   * Gets the {@link firebase.auth.Auth `Auth`} service for the default app or a
   * given app.
   *
   * `firebase.auth()` can be called with no arguments to access the default app's
   * {@link firebase.auth.Auth `Auth`} service or as `firebase.auth(app)` to
   * access the {@link firebase.auth.Auth `Auth`} service associated with a
   * specific app.
   *
   * @example
   * ```javascript
   *
   * // Get the Auth service for the default app
   * var defaultAuth = firebase.auth();
   * ```
   * @example
   * ```javascript
   *
   * // Get the Auth service for a given app
   * var otherAuth = firebase.auth(otherApp);
   * ```
   * @param app
   */
  function auth(app?: firebase.app.App): firebase.auth.Auth;

  /**
   * Gets the {@link firebase.database.Database `Database`} service for the
   * default app or a given app.
   *
   * `firebase.database()` can be called with no arguments to access the default
   * app's {@link firebase.database.Database `Database`} service or as
   * `firebase.database(app)` to access the
   * {@link firebase.database.Database `Database`} service associated with a
   * specific app.
   *
   * `firebase.database` is also a namespace that can be used to access global
   * constants and methods associated with the `Database` service.
   *
   * @example
   * ```javascript
   * // Get the Database service for the default app
   * var defaultDatabase = firebase.database();
   * ```
   *
   * @example
   * ```javascript
   * // Get the Database service for a specific app
   * var otherDatabase = firebase.database(app);
   * ```
   *
   * @namespace
   * @param app Optional app whose Database service to
   *   return. If not provided, the default Database service will be returned.
   * @return The default Database service if no app
   *   is provided or the Database service associated with the provided app.
   */
  function database(app?: firebase.app.App): firebase.database.Database;

  /**
   * Creates and initializes a Firebase {@link firebase.app.App app} instance.
   *
   * See
   * {@link
   *   https://firebase.google.com/docs/web/setup#add_firebase_to_your_app
   *   Add Firebase to your app} and
   * {@link
   *   https://firebase.google.com/docs/web/learn-more#multiple-projects
   *   Initialize multiple projects} for detailed documentation.
   *
   * @example
   * ```javascript
   *
   * // Initialize default app
   * // Retrieve your own options values by adding a web app on
   * // https://console.firebase.google.com
   * firebase.initializeApp({
   *   apiKey: "AIza....",                             // Auth / General Use
   *   appId: "1:27992087142:web:ce....",              // General Use
   *   projectId: "my-firebase-project",               // General Use
   *   authDomain: "YOUR_APP.firebaseapp.com",         // Auth with popup/redirect
   *   databaseURL: "https://YOUR_APP.firebaseio.com", // Realtime Database
   *   storageBucket: "YOUR_APP.appspot.com",          // Storage
   *   messagingSenderId: "123456789",                 // Cloud Messaging
   *   measurementId: "G-12345"                        // Analytics
   * });
   * ```
   *
   * @example
   * ```javascript
   *
   * // Initialize another app
   * var otherApp = firebase.initializeApp({
   *   apiKey: "AIza....",
   *   appId: "1:27992087142:web:ce....",
   *   projectId: "my-firebase-project",
   *   databaseURL: "https://<OTHER_DATABASE_NAME>.firebaseio.com",
   *   storageBucket: "<OTHER_STORAGE_BUCKET>.appspot.com"
   * }, "nameOfOtherApp");
   * ```
   *
   * @param options Options to configure the app's services.
   * @param name Optional name of the app to initialize. If no name
   *   is provided, the default is `"[DEFAULT]"`.
   *
   * @return {!firebase.app.App} The initialized app.
   */
  function initializeApp(options: Object, name?: string): firebase.app.App;

  /**
   * Gets the {@link firebase.messaging.Messaging `Messaging`} service for the
   * default app or a given app.
   *
   * `firebase.messaging()` can be called with no arguments to access the default
   * app's {@link firebase.messaging.Messaging `Messaging`} service or as
   * `firebase.messaging(app)` to access the
   * {@link firebase.messaging.Messaging `Messaging`} service associated with a
   * specific app.
   *
   * Calling `firebase.messaging()` in a service worker results in Firebase
   * generating notifications if the push message payload has a `notification`
   * parameter.
   *
   * @webonly
   *
   * @example
   * ```javascript
   * // Get the Messaging service for the default app
   * var defaultMessaging = firebase.messaging();
   * ```
   *
   * @example
   * ```javascript
   * // Get the Messaging service for a given app
   * var otherMessaging = firebase.messaging(otherApp);
   * ```
   *
   * @namespace
   * @param app The app to create a Messaging service for.
   *     If not passed, uses the default app.
   */
  function messaging(app?: firebase.app.App): firebase.messaging.Messaging;

  /**
   * Gets the {@link firebase.storage.Storage `Storage`} service for the default
   * app or a given app.
   *
   * `firebase.storage()` can be called with no arguments to access the default
   * app's {@link firebase.storage.Storage `Storage`} service or as
   * `firebase.storage(app)` to access the
   * {@link firebase.storage.Storage `Storage`} service associated with a
   * specific app.
   *
   * @example
   * ```javascript
   * // Get the Storage service for the default app
   * var defaultStorage = firebase.storage();
   * ```
   *
   * @example
   * ```javascript
   * // Get the Storage service for a given app
   * var otherStorage = firebase.storage(otherApp);
   * ```
   *
   * @param app The app to create a storage service for.
   *     If not passed, uses the default app.
   */
  function storage(app?: firebase.app.App): firebase.storage.Storage;

  function firestore(app?: firebase.app.App): firebase.firestore.Firestore;

  function functions(app?: firebase.app.App): firebase.functions.Functions;

  /**
   * Gets the {@link firebase.performance.Performance `Performance`} service.
   *
   * `firebase.performance()` can be called with no arguments to access the default
   * app's {@link firebase.performance.Performance `Performance`} service.
   * The {@link firebase.performance.Performance `Performance`} service does not work with
   * any other app.
   *
   * @webonly
   *
   * @example
   * ```javascript
   * // Get the Performance service for the default app
   * const defaultPerformance = firebase.performance();
   * ```
   *
   * @param app The app to create a performance service for. Performance Monitoring only works with
   * the default app.
   * If not passed, uses the default app.
   */
  function performance(
    app?: firebase.app.App
  ): firebase.performance.Performance;

  /**
   * Gets the {@link firebase.remoteConfig.RemoteConfig `RemoteConfig`} instance.
   *
   * @webonly
   *
   * @example
   * ```javascript
   * // Get the RemoteConfig instance for the default app
   * const defaultRemoteConfig = firebase.remoteConfig();
   * ```
   *
   * @param app The app to create a Remote Config service for. If not passed, uses the default app.
   */
  function remoteConfig(
    app?: firebase.app.App
  ): firebase.remoteConfig.RemoteConfig;

  /**
   * Gets the {@link firebase.analytics.Analytics `Analytics`} service.
   *
   * `firebase.analytics()` can be called with no arguments to access the default
   * app's {@link firebase.analytics.Analytics `Analytics`} service.
   *
   * @webonly
   *
   * @example
   * ```javascript
   * // Get the Analytics service for the default app
   * const defaultAnalytics = firebase.analytics();
   * ```
   *
   * @param app The app to create an analytics service for.
   * If not passed, uses the default app.
   */
  function analytics(app?: firebase.app.App): firebase.analytics.Analytics;

  function appCheck(app?: firebase.app.App): firebase.appCheck.AppCheck;
}

declare namespace firebase.app {
  /**
   * A Firebase App holds the initialization information for a collection of
   * services.
   *
   * Do not call this constructor directly. Instead, use
   * {@link firebase.initializeApp|`firebase.initializeApp()`} to create an app.
   *
   */
  interface App {
    /**
     * Gets the {@link firebase.auth.Auth `Auth`} service for the current app.
     *
     * @example
     * ```javascript
     * var auth = app.auth();
     * // The above is shorthand for:
     * // var auth = firebase.auth(app);
     * ```
     */
    auth(): firebase.auth.Auth;
    /**
     * Gets the {@link firebase.database.Database `Database`} service for the
     * current app.
     *
     * @example
     * ```javascript
     * var database = app.database();
     * // The above is shorthand for:
     * // var database = firebase.database(app);
     * ```
     */
    database(url?: string): firebase.database.Database;
    /**
     * Renders this app unusable and frees the resources of all associated
     * services.
     *
     * @example
     * ```javascript
     * app.delete()
     *   .then(function() {
     *     console.log("App deleted successfully");
     *   })
     *   .catch(function(error) {
     *     console.log("Error deleting app:", error);
     *   });
     * ```
     */
    delete(): Promise<any>;
    /**
     * Gets the {@link firebase.installations.Installations `Installations`} service for the
     * current app.
     *
     * @webonly
     *
     * @example
     * ```javascript
     * const installations = app.installations();
     * // The above is shorthand for:
     * // const installations = firebase.installations(app);
     * ```
     */
    installations(): firebase.installations.Installations;
    /**
     * Gets the {@link firebase.messaging.Messaging `Messaging`} service for the
     * current app.
     *
     * @webonly
     *
     * @example
     * ```javascript
     * var messaging = app.messaging();
     * // The above is shorthand for:
     * // var messaging = firebase.messaging(app);
     * ```
     */
    messaging(): firebase.messaging.Messaging;
    /**
     * The (read-only) name for this app.
     *
     * The default app's name is `"[DEFAULT]"`.
     *
     * @example
     * ```javascript
     * // The default app's name is "[DEFAULT]"
     * firebase.initializeApp(defaultAppConfig);
     * console.log(firebase.app().name);  // "[DEFAULT]"
     * ```
     *
     * @example
     * ```javascript
     * // A named app's name is what you provide to initializeApp()
     * var otherApp = firebase.initializeApp(otherAppConfig, "other");
     * console.log(otherApp.name);  // "other"
     * ```
     */
    name: string;
    /**
     * The (read-only) configuration options for this app. These are the original
     * parameters given in
     * {@link firebase.initializeApp `firebase.initializeApp()`}.
     *
     * @example
     * ```javascript
     * var app = firebase.initializeApp(config);
     * console.log(app.options.databaseURL === config.databaseURL);  // true
     * ```
     */
    options: Object;
    /**
     * Gets the {@link firebase.storage.Storage `Storage`} service for the current
     * app, optionally initialized with a custom storage bucket.
     *
     * @example
     * ```javascript
     * var storage = app.storage();
     * // The above is shorthand for:
     * // var storage = firebase.storage(app);
     * ```
     *
     * @example
     * ```javascript
     * var storage = app.storage("gs://your-app.appspot.com");
     * ```
     *
     * @param url The gs:// url to your Firebase Storage Bucket.
     *     If not passed, uses the app's default Storage Bucket.
     */
    storage(url?: string): firebase.storage.Storage;
    firestore(): firebase.firestore.Firestore;
    functions(regionOrCustomDomain?: string): firebase.functions.Functions;
    /**
     * Gets the {@link firebase.performance.Performance `Performance`} service for the
     * current app. If the current app is not the default one, throws an error.
     *
     * @webonly
     *
     * @example
     * ```javascript
     * const perf = app.performance();
     * // The above is shorthand for:
     * // const perf = firebase.performance(app);
     * ```
     */
    performance(): firebase.performance.Performance;
    /**
     * Gets the {@link firebase.remoteConfig.RemoteConfig `RemoteConfig`} instance.
     *
     * @webonly
     *
     * @example
     * ```javascript
     * const rc = app.remoteConfig();
     * // The above is shorthand for:
     * // const rc = firebase.remoteConfig(app);
     * ```
     */
    remoteConfig(): firebase.remoteConfig.RemoteConfig;
    /**
     * Gets the {@link firebase.analytics.Analytics `Analytics`} service for the
     * current app. If the current app is not the default one, throws an error.
     *
     * @webonly
     *
     * @example
     * ```javascript
     * const analytics = app.analytics();
     * // The above is shorthand for:
     * // const analytics = firebase.analytics(app);
     * ```
     */
    analytics(): firebase.analytics.Analytics;
    appCheck(): firebase.appCheck.AppCheck;
  }
}

/**
 * @webonly
 */
declare namespace firebase.appCheck {
  /**
   * Result returned by
   * {@link firebase.appCheck.AppCheck.getToken `firebase.appCheck().getToken()`}.
   */
  interface AppCheckTokenResult {
    token: string;
  }
  /*
   * ReCAPTCHA v3 token provider.
   */
  class ReCaptchaV3Provider {
    /**
     * @param siteKey - ReCAPTCHA v3 site key (public key).
     */
    constructor(siteKey: string);
  }
  /*
   * Custom token provider.
   */
  class CustomProvider {
    /**
     * @param options - Options for creating the custom provider.
     */
    constructor(options: CustomProviderOptions);
  }
  /**
   * Options when creating a CustomProvider.
   */
  interface CustomProviderOptions {
    /**
     * Function to get an App Check token through a custom provider
     * service.
     */
    getToken: () => Promise<AppCheckToken>;
  }

  /**
   * The Firebase AppCheck service interface.
   *
   * Do not call this constructor directly. Instead, use
   * {@link firebase.appCheck `firebase.appCheck()`}.
   */
  export interface AppCheck {
    /**
     * Activate AppCheck
     * @param provider reCAPTCHA provider, custom token provider, or reCAPTCHA site key.
     * @param isTokenAutoRefreshEnabled If true, the SDK automatically
     * refreshes App Check tokens as needed. If undefined, defaults to the
     * value of `app.automaticDataCollectionEnabled`, which defaults to
     * false and can be set in the app config.
     */
    activate(
      provider:
        | ReCaptchaV3Provider
        | CustomProvider
        | AppCheckProvider
        | string,
      isTokenAutoRefreshEnabled?: boolean
    ): void;

    /**
     *
     * @param isTokenAutoRefreshEnabled If true, the SDK automatically
     * refreshes App Check tokens as needed. This overrides any value set
     * during `activate()`.
     */
    setTokenAutoRefreshEnabled(isTokenAutoRefreshEnabled: boolean): void;
    /**
     * Get the current App Check token. Attaches to the most recent
     * in-flight request if one is present. Returns null if no token
     * is present and no token requests are in-flight.
     *
     * @param forceRefresh - If true, will always try to fetch a fresh token.
     * If false, will use a cached token if found in storage.
     */
    getToken(
      forceRefresh?: boolean
    ): Promise<firebase.appCheck.AppCheckTokenResult>;

    /**
     * Registers a listener to changes in the token state. There can be more
     * than one listener registered at the same time for one or more
     * App Check instances. The listeners call back on the UI thread whenever
     * the current token associated with this App Check instance changes.
     *
     * @param observer An object with `next`, `error`, and `complete`
     * properties. `next` is called with an
     * {@link firebase.appCheck.AppCheckTokenResult `AppCheckTokenResult`}
     * whenever the token changes. `error` is optional and is called if an
     * error is thrown by the listener (the `next` function). `complete`
     * is unused, as the token stream is unending.
     *
     * @returns A function that unsubscribes this listener.
     */
    onTokenChanged(observer: {
      next: (tokenResult: firebase.appCheck.AppCheckTokenResult) => void;
      error?: (error: Error) => void;
      complete?: () => void;
    }): Unsubscribe;

    /**
     * Registers a listener to changes in the token state. There can be more
     * than one listener registered at the same time for one or more
     * App Check instances. The listeners call back on the UI thread whenever
     * the current token associated with this App Check instance changes.
     *
     * @param onNext When the token changes, this function is called with aa
     * {@link firebase.appCheck.AppCheckTokenResult `AppCheckTokenResult`}.
     * @param onError Optional. Called if there is an error thrown by the
     * listener (the `onNext` function).
     * @param onCompletion Currently unused, as the token stream is unending.
     * @returns A function that unsubscribes this listener.
     */
    onTokenChanged(
      onNext: (tokenResult: firebase.appCheck.AppCheckTokenResult) => void,
      onError?: (error: Error) => void,
      onCompletion?: () => void
    ): Unsubscribe;
  }

  /**
   * An App Check provider. This can be either the built-in reCAPTCHA
   * provider or a custom provider. For more on custom providers, see
   * https://firebase.google.com/docs/app-check/web-custom-provider
   */
  interface AppCheckProvider {
    /**
     * Returns an AppCheck token.
     */
    getToken(): Promise<AppCheckToken>;
  }

  /**
   * The token returned from an {@link firebase.appCheck.AppCheckProvider `AppCheckProvider`}.
   */
  interface AppCheckToken {
    /**
     * The token string in JWT format.
     */
    readonly token: string;
    /**
     * The local timestamp after which the token will expire.
     */
    readonly expireTimeMillis: number;
  }
}

/**
 * @webonly
 */
declare namespace firebase.installations {
  /**
   * The Firebase Installations service interface.
   *
   * Do not call this constructor directly. Instead, use
   * {@link firebase.installations `firebase.installations()`}.
   */
  export interface Installations {
    /**
     * Creates a Firebase Installation if there isn't one for the app and
     * returns the Installation ID.
     *
     * @return Firebase Installation ID
     */
    getId(): Promise<string>;

    /**
     * Returns an Authentication Token for the current Firebase Installation.
     *
     * @return Firebase Installation Authentication Token
     */
    getToken(forceRefresh?: boolean): Promise<string>;

    /**
     * Deletes the Firebase Installation and all associated data.
     */
    delete(): Promise<void>;

    /**
     * Sets a new callback that will get called when Installlation ID changes.
     * Returns an unsubscribe function that will remove the callback when called.
     */
    onIdChange(callback: (installationId: string) => void): () => void;
  }
}

/**
 * @webonly
 */
declare namespace firebase.performance {
  /**
   * The Firebase Performance Monitoring service interface.
   *
   * Do not call this constructor directly. Instead, use
   * {@link firebase.performance `firebase.performance()`}.
   */
  export interface Performance {
    /**
     * Creates an uninitialized instance of {@link firebase.performance.Trace `trace`} and returns
     * it.
     *
     * @param traceName The name of the trace instance.
     * @return The Trace instance.
     */
    trace(traceName: string): Trace;

    /**
     * Controls the logging of automatic traces and HTTP/S network monitoring.
     */
    instrumentationEnabled: boolean;
    /**
     * Controls the logging of custom traces.
     */
    dataCollectionEnabled: boolean;
  }

  export interface Trace {
    /**
     * Starts the timing for the {@link firebase.performance.Trace `trace`} instance.
     */
    start(): void;
    /**
     * Stops the timing of the {@link firebase.performance.Trace `trace`} instance and logs the
     * data of the instance.
     */
    stop(): void;
    /**
     * Records a {@link firebase.performance.Trace `trace`} from given parameters. This provides a
     * direct way to use {@link firebase.performance.Trace `trace`} without a need to start/stop.
     * This is useful for use cases in which the {@link firebase.performance.Trace `trace`} cannot
     * directly be used (e.g. if the duration was captured before the Performance SDK was loaded).
     *
     * @param startTime Trace start time since epoch in millisec.
     * @param duration The duraction of the trace in millisec.
     * @param options An object which can optionally hold maps of custom metrics and
     * custom attributes.
     */
    record(
      startTime: number,
      duration: number,
      options?: {
        metrics?: { [key: string]: number };
        attributes?: { [key: string]: string };
      }
    ): void;
    /**
     * Adds to the value of a custom metric. If a custom metric with the provided name does not
     * exist, it creates one with that name and the value equal to the given number.
     *
     * @param metricName The name of the custom metric.
     * @param num The number to be added to the value of the custom metric. If not provided, it
     * uses a default value of one.
     */
    incrementMetric(metricName: string, num?: number): void;
    /**
     * Sets the value of the specified custom metric to the given number regardless of whether
     * a metric with that name already exists on the {@link firebase.performance.Trace `trace`}
     * instance or not.
     *
     * @param metricName Name of the custom metric.
     * @param num Value to of the custom metric.
     */
    putMetric(metricName: string, num: number): void;
    /**
     * Returns the value of the custom metric by that name. If a custom metric with that name does
     * not exist returns zero.
     *
     * @param metricName Name of the custom metric.
     */
    getMetric(metricName: string): number;
    /**
     * Set a custom attribute of a {@link firebase.performance.Trace `trace`} to a certain value.
     *
     * @param attr Name of the custom attribute.
     * @param value Value of the custom attribute.
     */
    putAttribute(attr: string, value: string): void;
    /**
     * Retrieves the value that the custom attribute is set to.
     *
     * @param attr Name of the custom attribute.
     */
    getAttribute(attr: string): string | undefined;
    /**
     * Removes the specified custom attribute from a {@link firebase.performance.Trace `trace`}
     * instance.
     *
     * @param attr Name of the custom attribute.
     */

    removeAttribute(attr: string): void;
    /**
     * Returns a map of all custom attributes of a {@link firebase.performance.Trace `trace`}
     * instance.
     */
    getAttributes(): { [key: string]: string };
  }
}

/**
 * @webonly
 */
declare namespace firebase.remoteConfig {
  /**
   * The Firebase Remote Config service interface.
   *
   * Do not call this constructor directly. Instead, use
   * {@link firebase.remoteConfig `firebase.remoteConfig()`}.
   */
  export interface RemoteConfig {
    /**
     * Defines configuration for the Remote Config SDK.
     */
    settings: Settings;

    /**
     * Object containing default values for conigs.
     */
    defaultConfig: { [key: string]: string | number | boolean };

    /**
     * The Unix timestamp in milliseconds of the last <i>successful</i> fetch, or negative one if
     * the {@link RemoteConfig} instance either hasn't fetched or initialization
     * is incomplete.
     */
    fetchTimeMillis: number;

    /**
     * The status of the last fetch <i>attempt</i>.
     */
    lastFetchStatus: FetchStatus;

    /**
     * Makes the last fetched config available to the getters.
     * Returns a promise which resolves to true if the current call activated the fetched configs.
     * If the fetched configs were already activated, the promise will resolve to false.
     */
    activate(): Promise<boolean>;

    /**
     * Ensures the last activated config are available to the getters.
     */
    ensureInitialized(): Promise<void>;

    /**
     * Fetches and caches configuration from the Remote Config service.
     */
    fetch(): Promise<void>;

    /**
     * Performs fetch and activate operations, as a convenience.
     * Returns a promise which resolves to true if the current call activated the fetched configs.
     * If the fetched configs were already activated, the promise will resolve to false.
     */
    fetchAndActivate(): Promise<boolean>;

    /**
     * Gets all config.
     */
    getAll(): { [key: string]: Value };

    /**
     * Gets the value for the given key as a boolean.
     *
     * Convenience method for calling <code>remoteConfig.getValue(key).asBoolean()</code>.
     */
    getBoolean(key: string): boolean;

    /**
     * Gets the value for the given key as a number.
     *
     * Convenience method for calling <code>remoteConfig.getValue(key).asNumber()</code>.
     */
    getNumber(key: string): number;

    /**
     * Gets the value for the given key as a String.
     *
     * Convenience method for calling <code>remoteConfig.getValue(key).asString()</code>.
     */
    getString(key: string): string;

    /**
     * Gets the {@link Value} for the given key.
     */
    getValue(key: string): Value;

    /**
     * Defines the log level to use.
     */
    setLogLevel(logLevel: LogLevel): void;
  }

  /**
   * Indicates the source of a value.
   *
   * <ul>
   *   <li>"static" indicates the value was defined by a static constant.</li>
   *   <li>"default" indicates the value was defined by default config.</li>
   *   <li>"remote" indicates the value was defined by fetched config.</li>
   * </ul>
   */
  export type ValueSource = 'static' | 'default' | 'remote';

  /**
   * Wraps a value with metadata and type-safe getters.
   */
  export interface Value {
    /**
     * Gets the value as a boolean.
     *
     * The following values (case insensitive) are interpreted as true:
     * "1", "true", "t", "yes", "y", "on". Other values are interpreted as false.
     */
    asBoolean(): boolean;

    /**
     * Gets the value as a number. Comparable to calling <code>Number(value) || 0</code>.
     */
    asNumber(): number;

    /**
     * Gets the value as a string.
     */
    asString(): string;

    /**
     * Gets the {@link ValueSource} for the given key.
     */
    getSource(): ValueSource;
  }

  /**
   * Defines configuration options for the Remote Config SDK.
   */
  export interface Settings {
    /**
     * Defines the maximum age in milliseconds of an entry in the config cache before
     * it is considered stale. Defaults to 43200000 (Twelve hours).
     */
    minimumFetchIntervalMillis: number;

    /**
     * Defines the maximum amount of milliseconds to wait for a response when fetching
     * configuration from the Remote Config server. Defaults to 60000 (One minute).
     */
    fetchTimeoutMillis: number;
  }

  /**
   * Summarizes the outcome of the last attempt to fetch config from the Firebase Remote Config server.
   *
   * <ul>
   *   <li>"no-fetch-yet" indicates the {@link RemoteConfig} instance has not yet attempted
   *       to fetch config, or that SDK initialization is incomplete.</li>
   *   <li>"success" indicates the last attempt succeeded.</li>
   *   <li>"failure" indicates the last attempt failed.</li>
   *   <li>"throttle" indicates the last attempt was rate-limited.</li>
   * </ul>
   */
  export type FetchStatus = 'no-fetch-yet' | 'success' | 'failure' | 'throttle';

  /**
   * Defines levels of Remote Config logging.
   */
  export type LogLevel = 'debug' | 'error' | 'silent';
}

declare namespace firebase.functions {
  /**
   * An HttpsCallableResult wraps a single result from a function call.
   */
  export interface HttpsCallableResult {
    readonly data: any;
  }
  /**
   * An HttpsCallable is a reference to a "callable" http trigger in
   * Google Cloud Functions.
   */
  export interface HttpsCallable {
    (data?: any): Promise<HttpsCallableResult>;
  }
  export interface HttpsCallableOptions {
    timeout?: number;
  }
  /**
   * The Cloud Functions for Firebase service interface.
   *
   * Do not call this constructor directly. Instead, use
   * {@link firebase.functions `firebase.functions()`}.
   */
  export class Functions {
    private constructor();

    /**
     * Modify this instance to communicate with the Cloud Functions emulator.
     *
     * Note: this must be called before this instance has been used to do any operations.
     *
     * @param host The emulator host (ex: localhost)
     * @param port The emulator port (ex: 5001)
     */
    useEmulator(host: string, port: number): void;

    /**
     * Changes this instance to point to a Cloud Functions emulator running
     * locally. See https://firebase.google.com/docs/functions/local-emulator
     *
     * @deprecated Prefer the useEmulator(host, port) method.
     * @param origin The origin of the local emulator, such as
     * "http://localhost:5005".
     */
    useFunctionsEmulator(url: string): void;
    /**
     * Gets an `HttpsCallable` instance that refers to the function with the given
     * name.
     *
     * @param name The name of the https callable function.
     * @param options The options for this HttpsCallable instance.
     * @return The `HttpsCallable` instance.
     */
    httpsCallable(name: string, options?: HttpsCallableOptions): HttpsCallable;
  }
  /**
   * The set of Firebase Functions status codes. The codes are the same at the
   * ones exposed by gRPC here:
   * https://github.com/grpc/grpc/blob/master/doc/statuscodes.md
   *
   * Possible values:
   * - 'cancelled': The operation was cancelled (typically by the caller).
   * - 'unknown': Unknown error or an error from a different error domain.
   * - 'invalid-argument': Client specified an invalid argument. Note that this
   *   differs from 'failed-precondition'. 'invalid-argument' indicates
   *   arguments that are problematic regardless of the state of the system
   *   (e.g. an invalid field name).
   * - 'deadline-exceeded': Deadline expired before operation could complete.
   *   For operations that change the state of the system, this error may be
   *   returned even if the operation has completed successfully. For example,
   *   a successful response from a server could have been delayed long enough
   *   for the deadline to expire.
   * - 'not-found': Some requested document was not found.
   * - 'already-exists': Some document that we attempted to create already
   *   exists.
   * - 'permission-denied': The caller does not have permission to execute the
   *   specified operation.
   * - 'resource-exhausted': Some resource has been exhausted, perhaps a
   *   per-user quota, or perhaps the entire file system is out of space.
   * - 'failed-precondition': Operation was rejected because the system is not
   *   in a state required for the operation's execution.
   * - 'aborted': The operation was aborted, typically due to a concurrency
   *   issue like transaction aborts, etc.
   * - 'out-of-range': Operation was attempted past the valid range.
   * - 'unimplemented': Operation is not implemented or not supported/enabled.
   * - 'internal': Internal errors. Means some invariants expected by
   *   underlying system has been broken. If you see one of these errors,
   *   something is very broken.
   * - 'unavailable': The service is currently unavailable. This is most likely
   *   a transient condition and may be corrected by retrying with a backoff.
   * - 'data-loss': Unrecoverable data loss or corruption.
   * - 'unauthenticated': The request does not have valid authentication
   *   credentials for the operation.
   */
  export type FunctionsErrorCode =
    | 'ok'
    | 'cancelled'
    | 'unknown'
    | 'invalid-argument'
    | 'deadline-exceeded'
    | 'not-found'
    | 'already-exists'
    | 'permission-denied'
    | 'resource-exhausted'
    | 'failed-precondition'
    | 'aborted'
    | 'out-of-range'
    | 'unimplemented'
    | 'internal'
    | 'unavailable'
    | 'data-loss'
    | 'unauthenticated';
  export interface HttpsError extends Error {
    /**
     * A standard error code that will be returned to the client. This also
     * determines the HTTP status code of the response, as defined in code.proto.
     */
    readonly code: FunctionsErrorCode;
    /**
     * Extra data to be converted to JSON and included in the error response.
     */
    readonly details?: any;
  }
}

declare namespace firebase.auth {
  /**
   * A utility class to parse email action URLs.
   */
  class ActionCodeURL {
    private constructor();
    /**
     * The API key of the email action link.
     */
    apiKey: string;
    /**
     * The action code of the email action link.
     */
    code: string;
    /**
     * The continue URL of the email action link. Null if not provided.
     */
    continueUrl: string | null;
    /**
     * The language code of the email action link. Null if not provided.
     */
    languageCode: string | null;
    /**
     * The action performed by the email action link. It returns from one
     * of the types from {@link firebase.auth.ActionCodeInfo}.
     */
    operation: firebase.auth.ActionCodeInfo.Operation;
    /**
     * Parses the email action link string and returns an ActionCodeURL object
     * if the link is valid, otherwise returns null.
     *
     * @param link The email action link string.
     * @return The ActionCodeURL object, or null if the link is invalid.
     */
    static parseLink(link: string): firebase.auth.ActionCodeURL | null;
    /**
     * The tenant ID of the email action link. Null if the email action
     * is from the parent project.
     */
    tenantId: string | null;
  }
  /**
   * A response from {@link firebase.auth.Auth.checkActionCode}.
   */
  interface ActionCodeInfo {
    /**
     * The data associated with the action code.
     *
     * For the `PASSWORD_RESET`, `VERIFY_EMAIL`, and `RECOVER_EMAIL` actions, this object
     * contains an `email` field with the address the email was sent to.
     *
     * For the RECOVER_EMAIL action, which allows a user to undo an email address
     * change, this object also contains a `previousEmail` field with the user account's
     * current email address. After the action completes, the user's email address will
     * revert to the value in the `email` field from the value in `previousEmail` field.
     *
     * For the VERIFY_AND_CHANGE_EMAIL action, which allows a user to verify the email
     * before updating it, this object contains a `previousEmail` field with the user
     * account's email address before updating. After the action completes, the user's
     * email address will be updated to the value in the `email` field from the value
     * in `previousEmail` field.
     *
     * For the REVERT_SECOND_FACTOR_ADDITION action, which allows a user to unenroll
     * a newly added second factor, this object contains a `multiFactorInfo` field with
     * the information about the second factor. For phone second factor, the
     * `multiFactorInfo` is a {@link firebase.auth.PhoneMultiFactorInfo} object,
     * which contains the phone number.
     */
    data: {
      email?: string | null;
      /**
       * @deprecated
       * This field is deprecated in favor of previousEmail.
       */
      fromEmail?: string | null;
      multiFactorInfo?: firebase.auth.MultiFactorInfo | null;
      previousEmail?: string | null;
    };
    /**
     * The type of operation that generated the action code. This could be:
     * <ul>
     * <li>`EMAIL_SIGNIN`: email sign in code generated via
     *     {@link firebase.auth.Auth.sendSignInLinkToEmail}.</li>
     * <li>`PASSWORD_RESET`: password reset code generated via
     *     {@link firebase.auth.Auth.sendPasswordResetEmail}.</li>
     * <li>`RECOVER_EMAIL`: email change revocation code generated via
     *     {@link firebase.User.updateEmail}.</li>
     * <li>`REVERT_SECOND_FACTOR_ADDITION`: revert second factor addition
     *     code generated via
     *     {@link firebase.User.MultiFactorUser.enroll}.</li>
     * <li>`VERIFY_AND_CHANGE_EMAIL`: verify and change email code generated
     *     via {@link firebase.User.verifyBeforeUpdateEmail}.</li>
     * <li>`VERIFY_EMAIL`: email verification code generated via
     *     {@link firebase.User.sendEmailVerification}.</li>
     * </ul>
     */
    operation: string;
  }

  /**
   * This is the interface that defines the required continue/state URL with
   * optional Android and iOS bundle identifiers.
   * The action code setting fields are:
   * <ul>
   * <li><p>url: Sets the link continue/state URL, which has different meanings
   *     in different contexts:</p>
   *     <ul>
   *     <li>When the link is handled in the web action widgets, this is the deep
   *         link in the continueUrl query parameter.</li>
   *     <li>When the link is handled in the app directly, this is the continueUrl
   *         query parameter in the deep link of the Dynamic Link.</li>
   *     </ul>
   *     </li>
   * <li>iOS: Sets the iOS bundle ID. This will try to open the link in an iOS app
   *     if it is installed.</li>
   * <li>android: Sets the Android package name. This will try to open the link in
   *     an android app if it is installed. If installApp is passed, it specifies
   *     whether to install the Android app if the device supports it and the app
   *     is not already installed. If this field is provided without a
   *     packageName, an error is thrown explaining that the packageName must be
   *     provided in conjunction with this field.
   *     If minimumVersion is specified, and an older version of the app is
   *     installed, the user is taken to the Play Store to upgrade the app.</li>
   * <li>handleCodeInApp: The default is false. When set to true, the action code
   *     link will be be sent as a Universal Link or Android App Link and will be
   *     opened by the app if installed. In the false case, the code will be sent
   *     to the web widget first and then on continue will redirect to the app if
   *     installed.</li>
   * </ul>
   */
  type ActionCodeSettings = {
    android?: {
      installApp?: boolean;
      minimumVersion?: string;
      packageName: string;
    };
    handleCodeInApp?: boolean;
    iOS?: { bundleId: string };
    url: string;
    dynamicLinkDomain?: string;
  };

  /**
   * A structure containing additional user information from a federated identity
   * provider.
   */
  type AdditionalUserInfo = {
    isNewUser: boolean;
    profile: Object | null;
    providerId: string;
    username?: string | null;
  };

  /**
   * A verifier for domain verification and abuse prevention. Currently, the
   * only implementation is {@link firebase.auth.RecaptchaVerifier}.
   */
  interface ApplicationVerifier {
    /**
     * Identifies the type of application verifier (e.g. "recaptcha").
     */
    type: string;
    /**
     * Executes the verification process.
     * @return A Promise for a token that can be used to
     *     assert the validity of a request.
     */
    verify(): Promise<string>;
  }

  /**
   * Interface representing an Auth instance's settings, currently used for
   * enabling/disabling app verification for phone Auth testing.
   */
  interface AuthSettings {
    /**
     * When set, this property disables app verification for the purpose of testing
     * phone authentication. For this property to take effect, it needs to be set
     * before rendering a reCAPTCHA app verifier. When this is disabled, a
     * mock reCAPTCHA is rendered instead. This is useful for manual testing during
     * development or for automated integration tests.
     *
     * In order to use this feature, you will need to
     * {@link https://firebase.google.com/docs/auth/web/phone-auth#test-with-whitelisted-phone-numbers
     * whitelist your phone number} via the
     * Firebase Console.
     *
     * The default value is false (app verification is enabled).
     */
    appVerificationDisabledForTesting: boolean;
  }

  /**
   * The Firebase Auth service interface.
   *
   * Do not call this constructor directly. Instead, use
   * {@link firebase.auth `firebase.auth()`}.
   *
   * See
   * {@link https://firebase.google.com/docs/auth/ Firebase Authentication}
   * for a full guide on how to use the Firebase Auth service.
   *
   */
  interface Auth {
    /**
     * The {@link firebase.app.App app} associated with the `Auth` service
     * instance.
     *
     * @example
     * ```javascript
     * var app = auth.app;
     * ```
     */
    app: firebase.app.App;
    /**
     * Applies a verification code sent to the user by email or other out-of-band
     * mechanism.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/expired-action-code</dt>
     * <dd>Thrown if the action code has expired.</dd>
     * <dt>auth/invalid-action-code</dt>
     * <dd>Thrown if the action code is invalid. This can happen if the code is
     *     malformed or has already been used.</dd>
     * <dt>auth/user-disabled</dt>
     * <dd>Thrown if the user corresponding to the given action code has been
     *     disabled.</dd>
     * <dt>auth/user-not-found</dt>
     * <dd>Thrown if there is no user corresponding to the action code. This may
     *     have happened if the user was deleted between when the action code was
     *     issued and when this method was called.</dd>
     * </dl>
     *
     * @param code A verification code sent to the user.
     */
    applyActionCode(code: string): Promise<void>;
    /**
     * Checks a verification code sent to the user by email or other out-of-band
     * mechanism.
     *
     * Returns metadata about the code.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/expired-action-code</dt>
     * <dd>Thrown if the action code has expired.</dd>
     * <dt>auth/invalid-action-code</dt>
     * <dd>Thrown if the action code is invalid. This can happen if the code is
     *     malformed or has already been used.</dd>
     * <dt>auth/user-disabled</dt>
     * <dd>Thrown if the user corresponding to the given action code has been
     *     disabled.</dd>
     * <dt>auth/user-not-found</dt>
     * <dd>Thrown if there is no user corresponding to the action code. This may
     *     have happened if the user was deleted between when the action code was
     *     issued and when this method was called.</dd>
     * </dl>
     *
     * @param code A verification code sent to the user.
     */
    checkActionCode(code: string): Promise<firebase.auth.ActionCodeInfo>;
    /**
     * Completes the password reset process, given a confirmation code and new
     * password.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/expired-action-code</dt>
     * <dd>Thrown if the password reset code has expired.</dd>
     * <dt>auth/invalid-action-code</dt>
     * <dd>Thrown if the password reset code is invalid. This can happen if the
     *     code is malformed or has already been used.</dd>
     * <dt>auth/user-disabled</dt>
     * <dd>Thrown if the user corresponding to the given password reset code has
     *     been disabled.</dd>
     * <dt>auth/user-not-found</dt>
     * <dd>Thrown if there is no user corresponding to the password reset code. This
     *     may have happened if the user was deleted between when the code was
     *     issued and when this method was called.</dd>
     * <dt>auth/weak-password</dt>
     * <dd>Thrown if the new password is not strong enough.</dd>
     * </dl>
     *
     * @param code The confirmation code send via email to the user.
     * @param newPassword The new password.
     */
    confirmPasswordReset(code: string, newPassword: string): Promise<void>;

    /**
     * Creates a new user account associated with the specified email address and
     * password.
     *
     * On successful creation of the user account, this user will also be
     * signed in to your application.
     *
     * User account creation can fail if the account already exists or the password
     * is invalid.
     *
     * Note: The email address acts as a unique identifier for the user and
     * enables an email-based password reset.  This function will create
     * a new user account and set the initial user password.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/email-already-in-use</dt>
     * <dd>Thrown if there already exists an account with the given email
     *     address.</dd>
     * <dt>auth/invalid-email</dt>
     * <dd>Thrown if the email address is not valid.</dd>
     * <dt>auth/operation-not-allowed</dt>
     * <dd>Thrown if email/password accounts are not enabled. Enable email/password
     *     accounts in the Firebase Console, under the Auth tab.</dd>
     * <dt>auth/weak-password</dt>
     * <dd>Thrown if the password is not strong enough.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * firebase.auth().createUserWithEmailAndPassword(email, password)
     *     .catch(function(error) {
     *   // Handle Errors here.
     *   var errorCode = error.code;
     *   var errorMessage = error.message;
     *   if (errorCode == 'auth/weak-password') {
     *     alert('The password is too weak.');
     *   } else {
     *     alert(errorMessage);
     *   }
     *   console.log(error);
     * });
     * ```
     * @param email The user's email address.
     * @param password The user's chosen password.
     */
    createUserWithEmailAndPassword(
      email: string,
      password: string
    ): Promise<firebase.auth.UserCredential>;
    /**
     * The currently signed-in user (or null).
     */
    currentUser: firebase.User | null;

    /**
     * Gets the list of possible sign in methods for the given email address. This
     * is useful to differentiate methods of sign-in for the same provider,
     * eg. `EmailAuthProvider` which has 2 methods of sign-in, email/password and
     * email/link.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/invalid-email</dt>
     * <dd>Thrown if the email address is not valid.</dd>
     * </dl>
     */
    fetchSignInMethodsForEmail(email: string): Promise<Array<string>>;

    /**
     * Checks if an incoming link is a sign-in with email link.
     */
    isSignInWithEmailLink(emailLink: string): boolean;
    /**
     * Returns a UserCredential from the redirect-based sign-in flow.
     *
     * If sign-in succeeded, returns the signed in user. If sign-in was
     * unsuccessful, fails with an error. If no redirect operation was called,
     * returns a UserCredential with a null User.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/account-exists-with-different-credential</dt>
     * <dd>Thrown if there already exists an account with the email address
     *     asserted by the credential. Resolve this by calling
     *     {@link firebase.auth.Auth.fetchSignInMethodsForEmail} with the error.email
     *     and then asking the user to sign in using one of the returned providers.
     *     Once the user is signed in, the original credential retrieved from the
     *     error.credential can be linked to the user with
     *     {@link firebase.User.linkWithCredential} to prevent the user from signing
     *     in again to the original provider via popup or redirect. If you are using
     *     redirects for sign in, save the credential in session storage and then
     *     retrieve on redirect and repopulate the credential using for example
     *     {@link firebase.auth.GoogleAuthProvider.credential} depending on the
     *     credential provider id and complete the link.</dd>
     * <dt>auth/auth-domain-config-required</dt>
     * <dd>Thrown if authDomain configuration is not provided when calling
     *     firebase.initializeApp(). Check Firebase Console for instructions on
     *     determining and passing that field.</dd>
     * <dt>auth/credential-already-in-use</dt>
     * <dd>Thrown if the account corresponding to the credential already exists
     *     among your users, or is already linked to a Firebase User.
     *     For example, this error could be thrown if you are upgrading an anonymous
     *     user to a Google user by linking a Google credential to it and the Google
     *     credential used is already associated with an existing Firebase Google
     *     user.
     *     An <code>error.email</code> and <code>error.credential</code>
     *     ({@link firebase.auth.AuthCredential}) fields are also provided. You can
     *     recover from this error by signing in with that credential directly via
     *     {@link firebase.auth.Auth.signInWithCredential}.</dd>
     * <dt>auth/email-already-in-use</dt>
     * <dd>Thrown if the email corresponding to the credential already exists
     *     among your users. When thrown while linking a credential to an existing
     *     user, an <code>error.email</code> and <code>error.credential</code>
     *     ({@link firebase.auth.AuthCredential}) fields are also provided.
     *     You have to link the credential to the existing user with that email if
     *     you wish to continue signing in with that credential. To do so, call
     *     {@link firebase.auth.Auth.fetchSignInMethodsForEmail}, sign in to
     *     <code>error.email</code> via one of the providers returned and then
     *     {@link firebase.User.linkWithCredential} the original credential to that
     *     newly signed in user.</dd>
     * <dt>auth/operation-not-allowed</dt>
     * <dd>Thrown if the type of account corresponding to the credential
     *     is not enabled. Enable the account type in the Firebase Console, under
     *     the Auth tab.</dd>
     * <dt>auth/operation-not-supported-in-this-environment</dt>
     * <dd>Thrown if this operation is not supported in the environment your
     *     application is running on. "location.protocol" must be http or https.
     *     </dd>
     * <dt>auth/timeout</dt>
     * <dd>Thrown typically if the app domain is not authorized for OAuth operations
     *     for your Firebase project. Edit the list of authorized domains from the
     *     Firebase console.</dd>
     * </dl>
     *
     * @webonly
     *
     * @example
     * ```javascript
     * // First, we perform the signInWithRedirect.
     * // Creates the provider object.
     * var provider = new firebase.auth.FacebookAuthProvider();
     * // You can add additional scopes to the provider:
     * provider.addScope('email');
     * provider.addScope('user_friends');
     * // Sign in with redirect:
     * auth.signInWithRedirect(provider)
     * ////////////////////////////////////////////////////////////
     * // The user is redirected to the provider's sign in flow...
     * ////////////////////////////////////////////////////////////
     * // Then redirected back to the app, where we check the redirect result:
     * auth.getRedirectResult().then(function(result) {
     *   // The firebase.User instance:
     *   var user = result.user;
     *   // The Facebook firebase.auth.AuthCredential containing the Facebook
     *   // access token:
     *   var credential = result.credential;
     *   // As this API can be used for sign-in, linking and reauthentication,
     *   // check the operationType to determine what triggered this redirect
     *   // operation.
     *   var operationType = result.operationType;
     * }, function(error) {
     *   // The provider's account email, can be used in case of
     *   // auth/account-exists-with-different-credential to fetch the providers
     *   // linked to the email:
     *   var email = error.email;
     *   // The provider's credential:
     *   var credential = error.credential;
     *   // In case of auth/account-exists-with-different-credential error,
     *   // you can fetch the providers using this:
     *   if (error.code === 'auth/account-exists-with-different-credential') {
     *     auth.fetchSignInMethodsForEmail(email).then(function(providers) {
     *       // The returned 'providers' is a list of the available providers
     *       // linked to the email address. Please refer to the guide for a more
     *       // complete explanation on how to recover from this error.
     *     });
     *   }
     * });
     * ```
     */
    getRedirectResult(): Promise<firebase.auth.UserCredential>;
    /**
     * The current Auth instance's language code. This is a readable/writable
     * property. When set to null, the default Firebase Console language setting
     * is applied. The language code will propagate to email action templates
     * (password reset, email verification and email change revocation), SMS
     * templates for phone authentication, reCAPTCHA verifier and OAuth
     * popup/redirect operations provided the specified providers support
     * localization with the language code specified.
     */
    languageCode: string | null;
    /**
     * The current Auth instance's settings. This is used to edit/read configuration
     * related options like app verification mode for phone authentication.
     */
    settings: firebase.auth.AuthSettings;
    /**
     * Adds an observer for changes to the user's sign-in state.
     *
     * Prior to 4.0.0, this triggered the observer when users were signed in,
     * signed out, or when the user's ID token changed in situations such as token
     * expiry or password change. After 4.0.0, the observer is only triggered
     * on sign-in or sign-out.
     *
     * To keep the old behavior, see {@link firebase.auth.Auth.onIdTokenChanged}.
     *
     * @example
     * ```javascript
     * firebase.auth().onAuthStateChanged(function(user) {
     *   if (user) {
     *     // User is signed in.
     *   }
     * });
     * ```
     */
    onAuthStateChanged(
      nextOrObserver:
        | firebase.Observer<any>
        | ((a: firebase.User | null) => any),
      error?: (a: firebase.auth.Error) => any,
      completed?: firebase.Unsubscribe
    ): firebase.Unsubscribe;
    /**
     * Adds an observer for changes to the signed-in user's ID token, which includes
     * sign-in, sign-out, and token refresh events. This method has the same
     * behavior as {@link firebase.auth.Auth.onAuthStateChanged} had prior to 4.0.0.
     *
     * @example
     * ```javascript
     * firebase.auth().onIdTokenChanged(function(user) {
     *   if (user) {
     *     // User is signed in or token was refreshed.
     *   }
     * });
     * ```
     * @param
     *     nextOrObserver An observer object or a function triggered on change.
     * @param error Optional A function
     *     triggered on auth error.
     * @param completed Optional A function triggered when the
     *     observer is removed.
     */
    onIdTokenChanged(
      nextOrObserver:
        | firebase.Observer<any>
        | ((a: firebase.User | null) => any),
      error?: (a: firebase.auth.Error) => any,
      completed?: firebase.Unsubscribe
    ): firebase.Unsubscribe;
    /**
     * Sends a sign-in email link to the user with the specified email.
     *
     * The sign-in operation has to always be completed in the app unlike other out
     * of band email actions (password reset and email verifications). This is
     * because, at the end of the flow, the user is expected to be signed in and
     * their Auth state persisted within the app.
     *
     * To complete sign in with the email link, call
     * {@link firebase.auth.Auth.signInWithEmailLink} with the email address and
     * the email link supplied in the email sent to the user.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/argument-error</dt>
     * <dd>Thrown if handleCodeInApp is false.</dd>
     * <dt>auth/invalid-email</dt>
     * <dd>Thrown if the email address is not valid.</dd>
     * <dt>auth/missing-android-pkg-name</dt>
     * <dd>An Android package name must be provided if the Android app is required
     *     to be installed.</dd>
     * <dt>auth/missing-continue-uri</dt>
     * <dd>A continue URL must be provided in the request.</dd>
     * <dt>auth/missing-ios-bundle-id</dt>
     * <dd>An iOS Bundle ID must be provided if an App Store ID is provided.</dd>
     * <dt>auth/invalid-continue-uri</dt>
     * <dd>The continue URL provided in the request is invalid.</dd>
     * <dt>auth/unauthorized-continue-uri</dt>
     * <dd>The domain of the continue URL is not whitelisted. Whitelist
     *     the domain in the Firebase console.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * var actionCodeSettings = {
     *   // The URL to redirect to for sign-in completion. This is also the deep
     *   // link for mobile redirects. The domain (www.example.com) for this URL
     *   // must be whitelisted in the Firebase Console.
     *   url: 'https://www.example.com/finishSignUp?cartId=1234',
     *   iOS: {
     *     bundleId: 'com.example.ios'
     *   },
     *   android: {
     *     packageName: 'com.example.android',
     *     installApp: true,
     *     minimumVersion: '12'
     *   },
     *   // This must be true.
     *   handleCodeInApp: true
     * };
     * firebase.auth().sendSignInLinkToEmail('user@example.com', actionCodeSettings)
     *     .then(function() {
     *       // The link was successfully sent. Inform the user. Save the email
     *       // locally so you don't need to ask the user for it again if they open
     *       // the link on the same device.
     *     })
     *     .catch(function(error) {
     *       // Some error occurred, you can inspect the code: error.code
     *     });
     * ```
     * @param email The email account to sign in with.
     * @param actionCodeSettings The action
     *     code settings. The action code settings which provides Firebase with
     *     instructions on how to construct the email link. This includes the
     *     sign in completion URL or the deep link for mobile redirects, the mobile
     *     apps to use when the sign-in link is opened on an Android or iOS device.
     *     Mobile app redirects will only be applicable if the developer configures
     *     and accepts the Firebase Dynamic Links terms of condition.
     *     The Android package name and iOS bundle ID will be respected only if they
     *     are configured in the same Firebase Auth project used.
     */
    sendSignInLinkToEmail(
      email: string,
      actionCodeSettings: firebase.auth.ActionCodeSettings
    ): Promise<void>;

    /**
     * Sends a password reset email to the given email address.
     *
     * To complete the password reset, call
     * {@link firebase.auth.Auth.confirmPasswordReset} with the code supplied in the
     * email sent to the user, along with the new password specified by the user.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/invalid-email</dt>
     * <dd>Thrown if the email address is not valid.</dd>
     * <dt>auth/missing-android-pkg-name</dt>
     * <dd>An Android package name must be provided if the Android app is required
     *     to be installed.</dd>
     * <dt>auth/missing-continue-uri</dt>
     * <dd>A continue URL must be provided in the request.</dd>
     * <dt>auth/missing-ios-bundle-id</dt>
     * <dd>An iOS Bundle ID must be provided if an App Store ID is provided.</dd>
     * <dt>auth/invalid-continue-uri</dt>
     * <dd>The continue URL provided in the request is invalid.</dd>
     * <dt>auth/unauthorized-continue-uri</dt>
     * <dd>The domain of the continue URL is not whitelisted. Whitelist
     *     the domain in the Firebase console.</dd>
     * <dt>auth/user-not-found</dt>
     * <dd>Thrown if there is no user corresponding to the email address.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * var actionCodeSettings = {
     *   url: 'https://www.example.com/?email=user@example.com',
     *   iOS: {
     *     bundleId: 'com.example.ios'
     *   },
     *   android: {
     *     packageName: 'com.example.android',
     *     installApp: true,
     *     minimumVersion: '12'
     *   },
     *   handleCodeInApp: true
     * };
     * firebase.auth().sendPasswordResetEmail(
     *     'user@example.com', actionCodeSettings)
     *     .then(function() {
     *       // Password reset email sent.
     *     })
     *     .catch(function(error) {
     *       // Error occurred. Inspect error.code.
     *     });
     * ```
     *
     * @param email The email address with the password to be reset.
     * @param actionCodeSettings The action
     *     code settings. If specified, the state/continue URL will be set as the
     *     "continueUrl" parameter in the password reset link. The default password
     *     reset landing page will use this to display a link to go back to the app
     *     if it is installed.
     *     If the actionCodeSettings is not specified, no URL is appended to the
     *     action URL.
     *     The state URL provided must belong to a domain that is whitelisted by the
     *     developer in the console. Otherwise an error will be thrown.
     *     Mobile app redirects will only be applicable if the developer configures
     *     and accepts the Firebase Dynamic Links terms of condition.
     *     The Android package name and iOS bundle ID will be respected only if they
     *     are configured in the same Firebase Auth project used.
     */
    sendPasswordResetEmail(
      email: string,
      actionCodeSettings?: firebase.auth.ActionCodeSettings | null
    ): Promise<void>;

    /**
     * Changes the current type of persistence on the current Auth instance for the
     * currently saved Auth session and applies this type of persistence for
     * future sign-in requests, including sign-in with redirect requests. This will
     * return a promise that will resolve once the state finishes copying from one
     * type of storage to the other.
     * Calling a sign-in method after changing persistence will wait for that
     * persistence change to complete before applying it on the new Auth state.
     *
     * This makes it easy for a user signing in to specify whether their session
     * should be remembered or not. It also makes it easier to never persist the
     * Auth state for applications that are shared by other users or have sensitive
     * data.
     *
     * The default for web browser apps and React Native apps is 'local' (provided
     * the browser supports this mechanism) whereas it is 'none' for Node.js backend
     * apps.
     *
     * <h4>Error Codes (thrown synchronously)</h4>
     * <dl>
     * <dt>auth/invalid-persistence-type</dt>
     * <dd>Thrown if the specified persistence type is invalid.</dd>
     * <dt>auth/unsupported-persistence-type</dt>
     * <dd>Thrown if the current environment does not support the specified
     *     persistence type.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
     *     .then(function() {
     *   // Existing and future Auth states are now persisted in the current
     *   // session only. Closing the window would clear any existing state even if
     *   // a user forgets to sign out.
     * });
     * ```
     */
    setPersistence(persistence: firebase.auth.Auth.Persistence): Promise<void>;

    /**
     * Asynchronously signs in with the given credentials, and returns any available
     * additional user information, such as user name.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/account-exists-with-different-credential</dt>
     * <dd>Thrown if there already exists an account with the email address
     *     asserted by the credential. Resolve this by calling
     *     {@link firebase.auth.Auth.fetchSignInMethodsForEmail} and then asking the
     *     user to sign in using one of the returned providers. Once the user is
     *     signed in, the original credential can be linked to the user with
     *     {@link firebase.User.linkWithCredential}.</dd>
     * <dt>auth/invalid-credential</dt>
     * <dd>Thrown if the credential is malformed or has expired.</dd>
     * <dt>auth/operation-not-allowed</dt>
     * <dd>Thrown if the type of account corresponding to the credential
     *     is not enabled. Enable the account type in the Firebase Console, under
     *     the Auth tab.</dd>
     * <dt>auth/user-disabled</dt>
     * <dd>Thrown if the user corresponding to the given credential has been
     *     disabled.</dd>
     * <dt>auth/user-not-found</dt>
     * <dd>Thrown if signing in with a credential from
     *     {@link firebase.auth.EmailAuthProvider.credential} and there is no user
     *     corresponding to the given email. </dd>
     * <dt>auth/wrong-password</dt>
     * <dd>Thrown if signing in with a credential from
     *     {@link firebase.auth.EmailAuthProvider.credential} and the password is
     *     invalid for the given email, or if the account corresponding to the email
     *     does not have a password set.</dd>
     * <dt>auth/invalid-verification-code</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential} and the verification
     *     code of the credential is not valid.</dd>
     * <dt>auth/invalid-verification-id</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential}  and the verification
     *     ID of the credential is not valid.</dd>
     * </dl>
     *
     * @deprecated
     * This method is deprecated. Use
     * {@link firebase.auth.Auth.signInWithCredential} instead.
     *
     * @example
     * ```javascript
     * firebase.auth().signInAndRetrieveDataWithCredential(credential)
     *     .then(function(userCredential) {
     *       console.log(userCredential.additionalUserInfo.username);
     *     });
     * ```
     * @param credential The auth credential.
     */
    signInAndRetrieveDataWithCredential(
      credential: firebase.auth.AuthCredential
    ): Promise<firebase.auth.UserCredential>;
    /**
     * Asynchronously signs in as an anonymous user.
     *
     *
     * If there is already an anonymous user signed in, that user will be returned;
     * otherwise, a new anonymous user identity will be created and returned.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/operation-not-allowed</dt>
     * <dd>Thrown if anonymous accounts are not enabled. Enable anonymous accounts
     *     in the Firebase Console, under the Auth tab.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * firebase.auth().signInAnonymously().catch(function(error) {
     *   // Handle Errors here.
     *   var errorCode = error.code;
     *   var errorMessage = error.message;
     *
     *   if (errorCode === 'auth/operation-not-allowed') {
     *     alert('You must enable Anonymous auth in the Firebase Console.');
     *   } else {
     *     console.error(error);
     *   }
     * });
     * ```
     */
    signInAnonymously(): Promise<firebase.auth.UserCredential>;

    /**
     * Asynchronously signs in with the given credentials.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/account-exists-with-different-credential</dt>
     * <dd>Thrown if there already exists an account with the email address
     *     asserted by the credential. Resolve this by calling
     *     {@link firebase.auth.Auth.fetchSignInMethodsForEmail} and then asking the
     *     user to sign in using one of the returned providers. Once the user is
     *     signed in, the original credential can be linked to the user with
     *     {@link firebase.User.linkWithCredential}.</dd>
     * <dt>auth/invalid-credential</dt>
     * <dd>Thrown if the credential is malformed or has expired.</dd>
     * <dt>auth/operation-not-allowed</dt>
     * <dd>Thrown if the type of account corresponding to the credential
     *     is not enabled. Enable the account type in the Firebase Console, under
     *     the Auth tab.</dd>
     * <dt>auth/user-disabled</dt>
     * <dd>Thrown if the user corresponding to the given credential has been
     *     disabled.</dd>
     * <dt>auth/user-not-found</dt>
     * <dd>Thrown if signing in with a credential from
     *     {@link firebase.auth.EmailAuthProvider.credential} and there is no user
     *     corresponding to the given email. </dd>
     * <dt>auth/wrong-password</dt>
     * <dd>Thrown if signing in with a credential from
     *     {@link firebase.auth.EmailAuthProvider.credential} and the password is
     *     invalid for the given email, or if the account corresponding to the email
     *     does not have a password set.</dd>
     * <dt>auth/invalid-verification-code</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential} and the verification
     *     code of the credential is not valid.</dd>
     * <dt>auth/invalid-verification-id</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential}  and the verification
     *     ID of the credential is not valid.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * firebase.auth().signInWithCredential(credential).catch(function(error) {
     *   // Handle Errors here.
     *   var errorCode = error.code;
     *   var errorMessage = error.message;
     *   // The email of the user's account used.
     *   var email = error.email;
     *   // The firebase.auth.AuthCredential type that was used.
     *   var credential = error.credential;
     *   if (errorCode === 'auth/account-exists-with-different-credential') {
     *     alert('Email already associated with another account.');
     *     // Handle account linking here, if using.
     *   } else {
     *     console.error(error);
     *   }
     *  });
     * ```
     *
     * @param credential The auth credential.
     */
    signInWithCredential(
      credential: firebase.auth.AuthCredential
    ): Promise<firebase.auth.UserCredential>;
    /**
     * Asynchronously signs in using a custom token.
     *
     * Custom tokens are used to integrate Firebase Auth with existing auth systems,
     * and must be generated by the auth backend.
     *
     * Fails with an error if the token is invalid, expired, or not accepted by the
     * Firebase Auth service.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/custom-token-mismatch</dt>
     * <dd>Thrown if the custom token is for a different Firebase App.</dd>
     * <dt>auth/invalid-custom-token</dt>
     * <dd>Thrown if the custom token format is incorrect.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * firebase.auth().signInWithCustomToken(token).catch(function(error) {
     *   // Handle Errors here.
     *   var errorCode = error.code;
     *   var errorMessage = error.message;
     *   if (errorCode === 'auth/invalid-custom-token') {
     *     alert('The token you provided is not valid.');
     *   } else {
     *     console.error(error);
     *   }
     * });
     * ```
     *
     * @param token The custom token to sign in with.
     */
    signInWithCustomToken(token: string): Promise<firebase.auth.UserCredential>;
    /**
     * Asynchronously signs in using an email and password.
     *
     * Fails with an error if the email address and password do not match.
     *
     * Note: The user's password is NOT the password used to access the user's email
     * account. The email address serves as a unique identifier for the user, and
     * the password is used to access the user's account in your Firebase project.
     *
     * See also: {@link firebase.auth.Auth.createUserWithEmailAndPassword}.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/invalid-email</dt>
     * <dd>Thrown if the email address is not valid.</dd>
     * <dt>auth/user-disabled</dt>
     * <dd>Thrown if the user corresponding to the given email has been
     *     disabled.</dd>
     * <dt>auth/user-not-found</dt>
     * <dd>Thrown if there is no user corresponding to the given email.</dd>
     * <dt>auth/wrong-password</dt>
     * <dd>Thrown if the password is invalid for the given email, or the account
     *     corresponding to the email does not have a password set.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * firebase.auth().signInWithEmailAndPassword(email, password)
     *     .catch(function(error) {
     *   // Handle Errors here.
     *   var errorCode = error.code;
     *   var errorMessage = error.message;
     *   if (errorCode === 'auth/wrong-password') {
     *     alert('Wrong password.');
     *   } else {
     *     alert(errorMessage);
     *   }
     *   console.log(error);
     * });
     * ```
     *
     * @param email The users email address.
     * @param password The users password.
     */
    signInWithEmailAndPassword(
      email: string,
      password: string
    ): Promise<firebase.auth.UserCredential>;

    /**
     * Asynchronously signs in using a phone number. This method sends a code via
     * SMS to the given phone number, and returns a
     * {@link firebase.auth.ConfirmationResult}. After the user provides the code
     * sent to their phone, call {@link firebase.auth.ConfirmationResult.confirm}
     * with the code to sign the user in.
     *
     * For abuse prevention, this method also requires a
     * {@link firebase.auth.ApplicationVerifier}. The Firebase Auth SDK includes
     * a reCAPTCHA-based implementation, {@link firebase.auth.RecaptchaVerifier}.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/captcha-check-failed</dt>
     * <dd>Thrown if the reCAPTCHA response token was invalid, expired, or if
     *     this method was called from a non-whitelisted domain.</dd>
     * <dt>auth/invalid-phone-number</dt>
     * <dd>Thrown if the phone number has an invalid format.</dd>
     * <dt>auth/missing-phone-number</dt>
     * <dd>Thrown if the phone number is missing.</dd>
     * <dt>auth/quota-exceeded</dt>
     * <dd>Thrown if the SMS quota for the Firebase project has been exceeded.</dd>
     * <dt>auth/user-disabled</dt>
     * <dd>Thrown if the user corresponding to the given phone number has been
     *     disabled.</dd>
     * <dt>auth/operation-not-allowed</dt>
     * <dd>Thrown if you have not enabled the provider in the Firebase Console. Go
     *     to the Firebase Console for your project, in the Auth section and the
     *     <strong>Sign in Method</strong> tab and configure the provider.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * // 'recaptcha-container' is the ID of an element in the DOM.
     * var applicationVerifier = new firebase.auth.RecaptchaVerifier(
     *     'recaptcha-container');
     * firebase.auth().signInWithPhoneNumber(phoneNumber, applicationVerifier)
     *     .then(function(confirmationResult) {
     *       var verificationCode = window.prompt('Please enter the verification ' +
     *           'code that was sent to your mobile device.');
     *       return confirmationResult.confirm(verificationCode);
     *     })
     *     .catch(function(error) {
     *       // Handle Errors here.
     *     });
     * ```
     *
     * @param phoneNumber The user's phone number in E.164 format (e.g.
     *     +16505550101).
     * @param applicationVerifier
     */
    signInWithPhoneNumber(
      phoneNumber: string,
      applicationVerifier: firebase.auth.ApplicationVerifier
    ): Promise<firebase.auth.ConfirmationResult>;
    /**
     * Asynchronously signs in using an email and sign-in email link. If no link
     * is passed, the link is inferred from the current URL.
     *
     * Fails with an error if the email address is invalid or OTP in email link
     * expires.
     *
     * Note: Confirm the link is a sign-in email link before calling this method
     * {@link firebase.auth.Auth.isSignInWithEmailLink}.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/expired-action-code</dt>
     * <dd>Thrown if OTP in email link expires.</dd>
     * <dt>auth/invalid-email</dt>
     * <dd>Thrown if the email address is not valid.</dd>
     * <dt>auth/user-disabled</dt>
     * <dd>Thrown if the user corresponding to the given email has been
     *     disabled.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * firebase.auth().signInWithEmailLink(email, emailLink)
     *     .catch(function(error) {
     *       // Some error occurred, you can inspect the code: error.code
     *       // Common errors could be invalid email and invalid or expired OTPs.
     *     });
     * ```
     *
     * @param email The email account to sign in with.
     * @param emailLink The optional link which contains the OTP needed
     *     to complete the sign in with email link. If not specified, the current
     *     URL is used instead.
     */
    signInWithEmailLink(
      email: string,
      emailLink?: string
    ): Promise<firebase.auth.UserCredential>;
    /**
     * Authenticates a Firebase client using a popup-based OAuth authentication
     * flow.
     *
     * If succeeds, returns the signed in user along with the provider's credential.
     * If sign in was unsuccessful, returns an error object containing additional
     * information about the error.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/account-exists-with-different-credential</dt>
     * <dd>Thrown if there already exists an account with the email address
     *     asserted by the credential. Resolve this by calling
     *     {@link firebase.auth.Auth.fetchSignInMethodsForEmail} with the error.email
     *     and then asking the user to sign in using one of the returned providers.
     *     Once the user is signed in, the original credential retrieved from the
     *     error.credential can be linked to the user with
     *     {@link firebase.User.linkWithCredential} to prevent the user from signing
     *     in again to the original provider via popup or redirect. If you are using
     *     redirects for sign in, save the credential in session storage and then
     *     retrieve on redirect and repopulate the credential using for example
     *     {@link firebase.auth.GoogleAuthProvider.credential} depending on the
     *     credential provider id and complete the link.</dd>
     * <dt>auth/auth-domain-config-required</dt>
     * <dd>Thrown if authDomain configuration is not provided when calling
     *     firebase.initializeApp(). Check Firebase Console for instructions on
     *     determining and passing that field.</dd>
     * <dt>auth/cancelled-popup-request</dt>
     * <dd>Thrown if successive popup operations are triggered. Only one popup
     *     request is allowed at one time. All the popups would fail with this error
     *     except for the last one.</dd>
     * <dt>auth/operation-not-allowed</dt>
     * <dd>Thrown if the type of account corresponding to the credential
     *     is not enabled. Enable the account type in the Firebase Console, under
     *     the Auth tab.</dd>
     * <dt>auth/operation-not-supported-in-this-environment</dt>
     * <dd>Thrown if this operation is not supported in the environment your
     *     application is running on. "location.protocol" must be http or https.
     *     </dd>
     * <dt>auth/popup-blocked</dt>
     * <dd>Thrown if the popup was blocked by the browser, typically when this
     *     operation is triggered outside of a click handler.</dd>
     * <dt>auth/popup-closed-by-user</dt>
     * <dd>Thrown if the popup window is closed by the user without completing the
     *     sign in to the provider.</dd>
     * <dt>auth/unauthorized-domain</dt>
     * <dd>Thrown if the app domain is not authorized for OAuth operations for your
     *     Firebase project. Edit the list of authorized domains from the Firebase
     *     console.</dd>
     * </dl>
     *
     * @webonly
     *
     * @example
     * ```javascript
     * // Creates the provider object.
     * var provider = new firebase.auth.FacebookAuthProvider();
     * // You can add additional scopes to the provider:
     * provider.addScope('email');
     * provider.addScope('user_friends');
     * // Sign in with popup:
     * auth.signInWithPopup(provider).then(function(result) {
     *   // The firebase.User instance:
     *   var user = result.user;
     *   // The Facebook firebase.auth.AuthCredential containing the Facebook
     *   // access token:
     *   var credential = result.credential;
     * }, function(error) {
     *   // The provider's account email, can be used in case of
     *   // auth/account-exists-with-different-credential to fetch the providers
     *   // linked to the email:
     *   var email = error.email;
     *   // The provider's credential:
     *   var credential = error.credential;
     *   // In case of auth/account-exists-with-different-credential error,
     *   // you can fetch the providers using this:
     *   if (error.code === 'auth/account-exists-with-different-credential') {
     *     auth.fetchSignInMethodsForEmail(email).then(function(providers) {
     *       // The returned 'providers' is a list of the available providers
     *       // linked to the email address. Please refer to the guide for a more
     *       // complete explanation on how to recover from this error.
     *     });
     *   }
     * });
     * ```
     *
     * @param provider The provider to authenticate.
     *     The provider has to be an OAuth provider. Non-OAuth providers like {@link
     *     firebase.auth.EmailAuthProvider} will throw an error.
     */
    signInWithPopup(
      provider: firebase.auth.AuthProvider
    ): Promise<firebase.auth.UserCredential>;
    /**
     * Authenticates a Firebase client using a full-page redirect flow. To handle
     * the results and errors for this operation, refer to {@link
     * firebase.auth.Auth.getRedirectResult}.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/auth-domain-config-required</dt>
     * <dd>Thrown if authDomain configuration is not provided when calling
     *     firebase.initializeApp(). Check Firebase Console for instructions on
     *     determining and passing that field.</dd>
     * <dt>auth/operation-not-supported-in-this-environment</dt>
     * <dd>Thrown if this operation is not supported in the environment your
     *     application is running on. "location.protocol" must be http or https.
     *     </dd>
     * <dt>auth/unauthorized-domain</dt>
     * <dd>Thrown if the app domain is not authorized for OAuth operations for your
     *     Firebase project. Edit the list of authorized domains from the Firebase
     *     console.</dd>
     * </dl>
     *
     * @webonly
     *
     * @param provider The provider to authenticate.
     *     The provider has to be an OAuth provider. Non-OAuth providers like {@link
     *     firebase.auth.EmailAuthProvider} will throw an error.
     */
    signInWithRedirect(provider: firebase.auth.AuthProvider): Promise<void>;
    /**
     * Signs out the current user.
     */
    signOut(): Promise<void>;
    /**
     * The current Auth instance's tenant ID. This is a readable/writable
     * property. When you set the tenant ID of an Auth instance, all future
     * sign-in/sign-up operations will pass this tenant ID and sign in or
     * sign up users to the specified tenant project.
     * When set to null, users are signed in to the parent project. By default,
     * this is set to null.
     *
     * @example
     * ```javascript
     * // Set the tenant ID on Auth instance.
     * firebase.auth().tenantId = ‘TENANT_PROJECT_ID’;
     *
     * // All future sign-in request now include tenant ID.
     * firebase.auth().signInWithEmailAndPassword(email, password)
     *   .then(function(result) {
     *     // result.user.tenantId should be ‘TENANT_PROJECT_ID’.
     *   }).catch(function(error) {
     *     // Handle error.
     *   });
     * ```
     */
    tenantId: string | null;
    /**
     * Asynchronously sets the provided user as `currentUser` on the current Auth
     * instance. A new instance copy of the user provided will be made and set as
     * `currentUser`.
     *
     * This will trigger {@link firebase.auth.Auth.onAuthStateChanged} and
     * {@link firebase.auth.Auth.onIdTokenChanged} listeners like other sign in
     * methods.
     *
     * The operation fails with an error if the user to be updated belongs to a
     * different Firebase project.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/invalid-user-token</dt>
     * <dd>Thrown if the user to be updated belongs to a diffent Firebase
     *     project.</dd>
     * <dt>auth/user-token-expired</dt>
     * <dd>Thrown if the token of the user to be updated is expired.</dd>
     * <dt>auth/null-user</dt>
     * <dd>Thrown if the user to be updated is null.</dd>
     * <dt>auth/tenant-id-mismatch</dt>
     * <dd>Thrown if the provided user's tenant ID does not match the
     *     underlying Auth instance's configured tenant ID</dd>
     * </dl>
     */
    updateCurrentUser(user: firebase.User | null): Promise<void>;
    /**
     * Sets the current language to the default device/browser preference.
     */
    useDeviceLanguage(): void;
    /**
     * Modify this Auth instance to communicate with the Firebase Auth emulator.  This must be
     * called synchronously immediately following the first call to `firebase.auth()`.  Do not use
     * with production credentials as emulator traffic is not encrypted.
     *
     * @param url The URL at which the emulator is running (eg, 'http://localhost:9099')
     */
    useEmulator(url: string): void;
    /**
     * Checks a password reset code sent to the user by email or other out-of-band
     * mechanism.
     *
     * Returns the user's email address if valid.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/expired-action-code</dt>
     * <dd>Thrown if the password reset code has expired.</dd>
     * <dt>auth/invalid-action-code</dt>
     * <dd>Thrown if the password reset code is invalid. This can happen if the code
     *     is malformed or has already been used.</dd>
     * <dt>auth/user-disabled</dt>
     * <dd>Thrown if the user corresponding to the given password reset code has
     *     been disabled.</dd>
     * <dt>auth/user-not-found</dt>
     * <dd>Thrown if there is no user corresponding to the password reset code. This
     *     may have happened if the user was deleted between when the code was
     *     issued and when this method was called.</dd>
     * </dl>
     *
     * @param code A verification code sent to the user.
     */
    verifyPasswordResetCode(code: string): Promise<string>;
  }

  /**
   * Interface that represents the credentials returned by an auth provider.
   * Implementations specify the details about each auth provider's credential
   * requirements.
   *
   */
  abstract class AuthCredential {
    /**
     * The authentication provider ID for the credential.
     * For example, 'facebook.com', or 'google.com'.
     */
    providerId: string;
    /**
     * The authentication sign in method for the credential.
     * For example, 'password', or 'emailLink. This corresponds to the sign-in
     * method identifier as returned in
     * {@link firebase.auth.Auth.fetchSignInMethodsForEmail}.
     */
    signInMethod: string;
    /**
     * Returns a JSON-serializable representation of this object.
     */
    toJSON(): Object;
    /**
     * Static method to deserialize a JSON representation of an object into an
     * {@link firebase.auth.AuthCredential}. Input can be either Object or the
     * stringified representation of the object. When string is provided,
     * JSON.parse would be called first. If the JSON input does not represent
     * an`AuthCredential`, null is returned.
     * @param json The plain object representation of an
     *     AuthCredential.
     */
    static fromJSON(json: Object | string): AuthCredential | null;
  }

  /**
   * Interface that represents the OAuth credentials returned by an OAuth
   * provider. Implementations specify the details about each auth provider's
   * credential requirements.
   *
   */
  class OAuthCredential extends AuthCredential {
    private constructor();
    /**
     * The OAuth ID token associated with the credential if it belongs to an
     * OIDC provider, such as `google.com`.
     */
    idToken?: string;
    /**
     * The OAuth access token associated with the credential if it belongs to
     * an OAuth provider, such as `facebook.com`, `twitter.com`, etc.
     */
    accessToken?: string;
    /**
     * The OAuth access token secret associated with the credential if it
     * belongs to an OAuth 1.0 provider, such as `twitter.com`.
     */
    secret?: string;
  }

  /**
   * Interface that represents an auth provider.
   */
  interface AuthProvider {
    providerId: string;
  }

  /**
   * A result from a phone number sign-in, link, or reauthenticate call.
   */
  interface ConfirmationResult {
    /**
     * Finishes a phone number sign-in, link, or reauthentication, given the code
     * that was sent to the user's mobile device.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/invalid-verification-code</dt>
     * <dd>Thrown if the verification code is not valid.</dd>
     * <dt>auth/missing-verification-code</dt>
     * <dd>Thrown if the verification code is missing.</dd>
     * </dl>
     */
    confirm(verificationCode: string): Promise<firebase.auth.UserCredential>;
    /**
     * The phone number authentication operation's verification ID. This can be used
     * along with the verification code to initialize a phone auth credential.
     */
    verificationId: string;
  }

  /**
   * Email and password auth provider implementation.
   *
   * To authenticate: {@link firebase.auth.Auth.createUserWithEmailAndPassword}
   * and {@link firebase.auth.Auth.signInWithEmailAndPassword}.
   */
  class EmailAuthProvider extends EmailAuthProvider_Instance {
    static PROVIDER_ID: string;
    /**
     * This corresponds to the sign-in method identifier as returned in
     * {@link firebase.auth.Auth.fetchSignInMethodsForEmail}.
     */
    static EMAIL_PASSWORD_SIGN_IN_METHOD: string;
    /**
     * This corresponds to the sign-in method identifier as returned in
     * {@link firebase.auth.Auth.fetchSignInMethodsForEmail}.
     */
    static EMAIL_LINK_SIGN_IN_METHOD: string;
    /**
     * @example
     * ```javascript
     * var cred = firebase.auth.EmailAuthProvider.credential(
     *     email,
     *     password
     * );
     * ```
     *
     * @param email Email address.
     * @param password User account password.
     * @return The auth provider credential.
     */
    static credential(
      email: string,
      password: string
    ): firebase.auth.AuthCredential;
    /**
     * Initialize an `EmailAuthProvider` credential using an email and an email link
     * after a sign in with email link operation.
     *
     * @example
     * ```javascript
     * var cred = firebase.auth.EmailAuthProvider.credentialWithLink(
     *     email,
     *     emailLink
     * );
     * ```
     *
     * @param email Email address.
     * @param emailLink Sign-in email link.
     * @return The auth provider credential.
     */
    static credentialWithLink(
      email: string,
      emailLink: string
    ): firebase.auth.AuthCredential;
  }
  /**
   * @hidden
   */
  class EmailAuthProvider_Instance implements firebase.auth.AuthProvider {
    providerId: string;
  }

  /**
   * An authentication error.
   * For method-specific error codes, refer to the specific methods in the
   * documentation. For common error codes, check the reference below. Use{@link
   * firebase.auth.Error.code} to get the specific error code. For a detailed
   * message, use {@link firebase.auth.Error.message}.
   * Errors with the code <strong>auth/account-exists-with-different-credential
   * </strong> will have the additional fields <strong>email</strong> and <strong>
   * credential</strong> which are needed to provide a way to resolve these
   * specific errors. Refer to {@link firebase.auth.Auth.signInWithPopup} for more
   * information.
   *
   * <h4>Common Error Codes</h4>
   * <dl>
   * <dt>auth/app-deleted</dt>
   * <dd>Thrown if the instance of FirebaseApp has been deleted.</dd>
   * <dt>auth/app-not-authorized</dt>
   * <dd>Thrown if the app identified by the domain where it's hosted, is not
   *     authorized to use Firebase Authentication with the provided API key.
   *     Review your key configuration in the Google API console.</dd>
   * <dt>auth/argument-error</dt>
   * <dd>Thrown if a method is called with incorrect arguments.</dd>
   * <dt>auth/invalid-api-key</dt>
   * <dd>Thrown if the provided API key is invalid. Please check that you have
   *     copied it correctly from the Firebase Console.</dd>
   * <dt>auth/invalid-user-token</dt>
   * <dd>Thrown if the user's credential is no longer valid. The user must sign in
   *     again.</dd>
   * <dt>auth/invalid-tenant-id</dt>
   * <dd>Thrown if the tenant ID provided is invalid.</dd>
   * <dt>auth/network-request-failed</dt>
   * <dd>Thrown if a network error (such as timeout, interrupted connection or
   *     unreachable host) has occurred.</dd>
   * <dt>auth/operation-not-allowed</dt>
   * <dd>Thrown if you have not enabled the provider in the Firebase Console. Go
   *     to the Firebase Console for your project, in the Auth section and the
   *     <strong>Sign in Method</strong> tab and configure the provider.</dd>
   * <dt>auth/requires-recent-login</dt>
   * <dd>Thrown if the user's last sign-in time does not meet the security
   *     threshold. Use {@link firebase.User.reauthenticateWithCredential} to
   *     resolve. This does not apply if the user is anonymous.</dd>
   * <dt>auth/too-many-requests</dt>
   * <dd>Thrown if requests are blocked from a device due to unusual activity.
   *     Trying again after some delay would unblock.</dd>
   * <dt>auth/unauthorized-domain</dt>
   * <dd>Thrown if the app domain is not authorized for OAuth operations for your
   *     Firebase project. Edit the list of authorized domains from the Firebase
   *     console.</dd>
   * <dt>auth/user-disabled</dt>
   * <dd>Thrown if the user account has been disabled by an administrator.
   *     Accounts can be enabled or disabled in the Firebase Console, the Auth
   *     section and Users subsection.</dd>
   * <dt>auth/user-token-expired</dt>
   * <dd>Thrown if the user's credential has expired. This could also be thrown if
   *     a user has been deleted. Prompting the user to sign in again should
   *     resolve this for either case.</dd>
   * <dt>auth/web-storage-unsupported</dt>
   * <dd>Thrown if the browser does not support web storage or if the user
   *     disables them.</dd>
   * </dl>
   */
  interface Error {
    /**
     * Unique error code.
     */
    code: string;
    /**
     * Complete error message.
     */
    message: string;
  }

  /**
   * The account conflict error.
   * Refer to {@link firebase.auth.Auth.signInWithPopup} for more information.
   *
   * <h4>Common Error Codes</h4>
   * <dl>
   * <dt>auth/account-exists-with-different-credential</dt>
   * <dd>Thrown if there already exists an account with the email address
   *     asserted by the credential. Resolve this by calling
   *     {@link firebase.auth.Auth.fetchSignInMethodsForEmail} with the error.email
   *     and then asking the user to sign in using one of the returned providers.
   *     Once the user is signed in, the original credential retrieved from the
   *     error.credential can be linked to the user with
   *     {@link firebase.User.linkWithCredential} to prevent the user from signing
   *     in again to the original provider via popup or redirect. If you are using
   *     redirects for sign in, save the credential in session storage and then
   *     retrieve on redirect and repopulate the credential using for example
   *     {@link firebase.auth.GoogleAuthProvider.credential} depending on the
   *     credential provider id and complete the link.</dd>
   * <dt>auth/credential-already-in-use</dt>
   * <dd>Thrown if the account corresponding to the credential already exists
   *     among your users, or is already linked to a Firebase User.
   *     For example, this error could be thrown if you are upgrading an anonymous
   *     user to a Google user by linking a Google credential to it and the Google
   *     credential used is already associated with an existing Firebase Google
   *     user.
   *     The fields <code>error.email</code>, <code>error.phoneNumber</code>, and
   *     <code>error.credential</code> ({@link firebase.auth.AuthCredential})
   *     may be provided, depending on the type of credential. You can recover
   *     from this error by signing in with <code>error.credential</code> directly
   *     via {@link firebase.auth.Auth.signInWithCredential}.</dd>
   * <dt>auth/email-already-in-use</dt>
   * <dd>Thrown if the email corresponding to the credential already exists
   *     among your users. When thrown while linking a credential to an existing
   *     user, an <code>error.email</code> and <code>error.credential</code>
   *     ({@link firebase.auth.AuthCredential}) fields are also provided.
   *     You have to link the credential to the existing user with that email if
   *     you wish to continue signing in with that credential. To do so, call
   *     {@link firebase.auth.Auth.fetchSignInMethodsForEmail}, sign in to
   *     <code>error.email</code> via one of the providers returned and then
   *     {@link firebase.User.linkWithCredential} the original credential to that
   *     newly signed in user.</dd>
   * </dl>
   */
  interface AuthError extends firebase.auth.Error {
    /**
     * The {@link firebase.auth.AuthCredential} that can be used to resolve the
     * error.
     */
    credential?: firebase.auth.AuthCredential;
    /**
     * The email of the user's account used for sign-in/linking.
     */
    email?: string;
    /**
     * The phone number of the user's account used for sign-in/linking.
     */
    phoneNumber?: string;
    /**
     * The tenant ID being used for sign-in/linking. If you use
     * {@link firebase.auth.Auth.signInWithRedirect} to sign in, you have to
     * set the tenant ID on Auth instanace again as the tenant ID is not
     * persisted after redirection.
     */
    tenantId?: string;
  }

  /**
   * The error thrown when the user needs to provide a second factor to sign in
   * successfully.
   * The error code for this error is <code>auth/multi-factor-auth-required</code>.
   * This error provides a {@link firebase.auth.MultiFactorResolver} object,
   * which you can use to get the second sign-in factor from the user.
   *
   * @example
   * ```javascript
   * firebase.auth().signInWithEmailAndPassword()
   *     .then(function(result) {
   *       // User signed in. No 2nd factor challenge is needed.
   *     })
   *     .catch(function(error) {
   *       if (error.code == 'auth/multi-factor-auth-required') {
   *         var resolver = error.resolver;
   *         var multiFactorHints = resolver.hints;
   *       } else {
   *         // Handle other errors.
   *       }
   *     });
   *
   * resolver.resolveSignIn(multiFactorAssertion)
   *     .then(function(userCredential) {
   *       // User signed in.
   *     });
   * ```
   */
  interface MultiFactorError extends firebase.auth.AuthError {
    /**
     * The multi-factor resolver to complete second factor sign-in.
     */
    resolver: firebase.auth.MultiFactorResolver;
  }

  /**
   * Facebook auth provider.
   *
   * @example
   * ```javascript
   * // Sign in using a redirect.
   * firebase.auth().getRedirectResult().then(function(result) {
   *   if (result.credential) {
   *     // This gives you a Google Access Token.
   *     var token = result.credential.accessToken;
   *   }
   *   var user = result.user;
   * })
   * // Start a sign in process for an unauthenticated user.
   * var provider = new firebase.auth.FacebookAuthProvider();
   * provider.addScope('user_birthday');
   * firebase.auth().signInWithRedirect(provider);
   * ```
   *
   * @example
   * ```javascript
   * // Sign in using a popup.
   * var provider = new firebase.auth.FacebookAuthProvider();
   * provider.addScope('user_birthday');
   * firebase.auth().signInWithPopup(provider).then(function(result) {
   *   // This gives you a Facebook Access Token.
   *   var token = result.credential.accessToken;
   *   // The signed-in user info.
   *   var user = result.user;
   * });
   * ```
   *
   * @see {@link firebase.auth.Auth.onAuthStateChanged} to receive sign in state
   * changes.
   */
  class FacebookAuthProvider extends FacebookAuthProvider_Instance {
    static PROVIDER_ID: string;
    /**
     * This corresponds to the sign-in method identifier as returned in
     * {@link firebase.auth.Auth.fetchSignInMethodsForEmail}.
     */
    static FACEBOOK_SIGN_IN_METHOD: string;
    /**
     * @example
     * ```javascript
     * var cred = firebase.auth.FacebookAuthProvider.credential(
     *     // `event` from the Facebook auth.authResponseChange callback.
     *     event.authResponse.accessToken
     * );
     * ```
     *
     * @param token Facebook access token.
     */
    static credential(token: string): firebase.auth.OAuthCredential;
  }
  /**
   * @hidden
   */
  class FacebookAuthProvider_Instance implements firebase.auth.AuthProvider {
    /**
     * @param scope Facebook OAuth scope.
     * @return The provider instance itself.
     */
    addScope(scope: string): firebase.auth.AuthProvider;
    providerId: string;
    /**
     * Sets the OAuth custom parameters to pass in a Facebook OAuth request for
     * popup and redirect sign-in operations.
     * Valid parameters include 'auth_type', 'display' and 'locale'.
     * For a detailed list, check the
     * {@link https://goo.gl/pve4fo Facebook}
     * documentation.
     * Reserved required OAuth 2.0 parameters such as 'client_id', 'redirect_uri',
     * 'scope', 'response_type' and 'state' are not allowed and will be ignored.
     * @param customOAuthParameters The custom OAuth parameters to pass
     *     in the OAuth request.
     * @return The provider instance itself.
     */
    setCustomParameters(
      customOAuthParameters: Object
    ): firebase.auth.AuthProvider;
  }

  /**
   * GitHub auth provider.
   *
   * GitHub requires an OAuth 2.0 redirect, so you can either handle the redirect
   * directly, or use the signInWithPopup handler:
   *
   * @example
   * ```javascript
   * // Using a redirect.
   * firebase.auth().getRedirectResult().then(function(result) {
   *   if (result.credential) {
   *     // This gives you a GitHub Access Token.
   *     var token = result.credential.accessToken;
   *   }
   *   var user = result.user;
   * }).catch(function(error) {
   *   // Handle Errors here.
   *   var errorCode = error.code;
   *   var errorMessage = error.message;
   *   // The email of the user's account used.
   *   var email = error.email;
   *   // The firebase.auth.AuthCredential type that was used.
   *   var credential = error.credential;
   *   if (errorCode === 'auth/account-exists-with-different-credential') {
   *     alert('You have signed up with a different provider for that email.');
   *     // Handle linking here if your app allows it.
   *   } else {
   *     console.error(error);
   *   }
   * });
   *
   * // Start a sign in process for an unauthenticated user.
   * var provider = new firebase.auth.GithubAuthProvider();
   * provider.addScope('repo');
   * firebase.auth().signInWithRedirect(provider);
   * ```
   *
   * @example
   * ```javascript
   * // With popup.
   * var provider = new firebase.auth.GithubAuthProvider();
   *  provider.addScope('repo');
   *  firebase.auth().signInWithPopup(provider).then(function(result) {
   *    // This gives you a GitHub Access Token.
   *    var token = result.credential.accessToken;
   *    // The signed-in user info.
   *    var user = result.user;
   *  }).catch(function(error) {
   *    // Handle Errors here.
   *    var errorCode = error.code;
   *    var errorMessage = error.message;
   *    // The email of the user's account used.
   *    var email = error.email;
   *    // The firebase.auth.AuthCredential type that was used.
   *    var credential = error.credential;
   *    if (errorCode === 'auth/account-exists-with-different-credential') {
   *      alert('You have signed up with a different provider for that email.');
   *      // Handle linking here if your app allows it.
   *    } else {
   *      console.error(error);
   *    }
   *  });
   * ```
   *
   * @see {@link firebase.auth.Auth.onAuthStateChanged} to receive sign in state
   * changes.
   */
  class GithubAuthProvider extends GithubAuthProvider_Instance {
    static PROVIDER_ID: string;
    /**
     * This corresponds to the sign-in method identifier as returned in
     * {@link firebase.auth.Auth.fetchSignInMethodsForEmail}.
     */
    static GITHUB_SIGN_IN_METHOD: string;
    /**
     * @example
     * ```javascript
     * var cred = firebase.auth.FacebookAuthProvider.credential(
     *     // `event` from the Facebook auth.authResponseChange callback.
     *     event.authResponse.accessToken
     * );
     * ```
     *
     * @param token Github access token.
     * @return {!firebase.auth.OAuthCredential} The auth provider credential.
     */
    static credential(token: string): firebase.auth.OAuthCredential;
  }
  /**
   * @hidden
   */
  class GithubAuthProvider_Instance implements firebase.auth.AuthProvider {
    /**
     * @param scope Github OAuth scope.
     * @return The provider instance itself.
     */
    addScope(scope: string): firebase.auth.AuthProvider;
    providerId: string;
    /**
     * Sets the OAuth custom parameters to pass in a GitHub OAuth request for popup
     * and redirect sign-in operations.
     * Valid parameters include 'allow_signup'.
     * For a detailed list, check the
     * {@link https://developer.github.com/v3/oauth/ GitHub} documentation.
     * Reserved required OAuth 2.0 parameters such as 'client_id', 'redirect_uri',
     * 'scope', 'response_type' and 'state' are not allowed and will be ignored.
     * @param customOAuthParameters The custom OAuth parameters to pass
     *     in the OAuth request.
     * @return The provider instance itself.
     */
    setCustomParameters(
      customOAuthParameters: Object
    ): firebase.auth.AuthProvider;
  }

  /**
   * Google auth provider.
   *
   * @example
   * ```javascript
   * // Using a redirect.
   * firebase.auth().getRedirectResult().then(function(result) {
   *   if (result.credential) {
   *     // This gives you a Google Access Token.
   *     var token = result.credential.accessToken;
   *   }
   *   var user = result.user;
   * });
   *
   * // Start a sign in process for an unauthenticated user.
   * var provider = new firebase.auth.GoogleAuthProvider();
   * provider.addScope('profile');
   * provider.addScope('email');
   * firebase.auth().signInWithRedirect(provider);
   * ```
   *
   * @example
   * ```javascript
   * // Using a popup.
   * var provider = new firebase.auth.GoogleAuthProvider();
   * provider.addScope('profile');
   * provider.addScope('email');
   * firebase.auth().signInWithPopup(provider).then(function(result) {
   *  // This gives you a Google Access Token.
   *  var token = result.credential.accessToken;
   *  // The signed-in user info.
   *  var user = result.user;
   * });
   * ```
   *
   * @see {@link firebase.auth.Auth.onAuthStateChanged} to receive sign in state
   * changes.
   */
  class GoogleAuthProvider extends GoogleAuthProvider_Instance {
    static PROVIDER_ID: string;
    /**
     * This corresponds to the sign-in method identifier as returned in
     * {@link firebase.auth.Auth.fetchSignInMethodsForEmail}.
     */
    static GOOGLE_SIGN_IN_METHOD: string;
    /**
     * Creates a credential for Google. At least one of ID token and access token
     * is required.
     *
     * @example
     * ```javascript
     * // \`googleUser\` from the onsuccess Google Sign In callback.
     * var credential = firebase.auth.GoogleAuthProvider.credential(
                  googleUser.getAuthResponse().id_token);
     * firebase.auth().signInWithCredential(credential)
     * ```
     * @param idToken Google ID token.
     * @param accessToken Google access token.
     * @return The auth provider credential.
     */
    static credential(
      idToken?: string | null,
      accessToken?: string | null
    ): firebase.auth.OAuthCredential;
  }
  /**
   * @hidden
   */
  class GoogleAuthProvider_Instance implements firebase.auth.AuthProvider {
    /**
     * @param scope Google OAuth scope.
     * @return The provider instance itself.
     */
    addScope(scope: string): firebase.auth.AuthProvider;
    providerId: string;
    /**
     * Sets the OAuth custom parameters to pass in a Google OAuth request for popup
     * and redirect sign-in operations.
     * Valid parameters include 'hd', 'hl', 'include_granted_scopes', 'login_hint'
     * and 'prompt'.
     * For a detailed list, check the
     * {@link https://goo.gl/Xo01Jm Google}
     * documentation.
     * Reserved required OAuth 2.0 parameters such as 'client_id', 'redirect_uri',
     * 'scope', 'response_type' and 'state' are not allowed and will be ignored.
     * @param customOAuthParameters The custom OAuth parameters to pass
     *     in the OAuth request.
     * @return The provider instance itself.
     */
    setCustomParameters(
      customOAuthParameters: Object
    ): firebase.auth.AuthProvider;
  }

  /**
   * Generic OAuth provider.
   *
   * @example
   * ```javascript
   * // Using a redirect.
   * firebase.auth().getRedirectResult().then(function(result) {
   *   if (result.credential) {
   *     // This gives you the OAuth Access Token for that provider.
   *     var token = result.credential.accessToken;
   *   }
   *   var user = result.user;
   * });
   *
   * // Start a sign in process for an unauthenticated user.
   * var provider = new firebase.auth.OAuthProvider('google.com');
   * provider.addScope('profile');
   * provider.addScope('email');
   * firebase.auth().signInWithRedirect(provider);
   * ```
   * @example
   * ```javascript
   * // Using a popup.
   * var provider = new firebase.auth.OAuthProvider('google.com');
   * provider.addScope('profile');
   * provider.addScope('email');
   * firebase.auth().signInWithPopup(provider).then(function(result) {
   *  // This gives you the OAuth Access Token for that provider.
   *  var token = result.credential.accessToken;
   *  // The signed-in user info.
   *  var user = result.user;
   * });
   * ```
   *
   * @see {@link firebase.auth.Auth.onAuthStateChanged} to receive sign in state
   * changes.
   * @param providerId The associated provider ID, such as `github.com`.
   */
  class OAuthProvider implements firebase.auth.AuthProvider {
    constructor(providerId: string);
    providerId: string;
    /**
     * @param scope Provider OAuth scope to add.
     */
    addScope(scope: string): firebase.auth.AuthProvider;
    /**
     * Creates a Firebase credential from a generic OAuth provider's access token or
     * ID token. The raw nonce is required when an ID token with a nonce field is
     * provided. The SHA-256 hash of the raw nonce must match the nonce field in
     * the ID token.
     *
     * @example
     * ```javascript
     * // `googleUser` from the onsuccess Google Sign In callback.
     * // Initialize a generate OAuth provider with a `google.com` providerId.
     * var provider = new firebase.auth.OAuthProvider('google.com');
     * var credential = provider.credential({
     *   idToken: googleUser.getAuthResponse().id_token,
     * });
     * firebase.auth().signInWithCredential(credential)
     * ```
     *
     * @param optionsOrIdToken Either the options object containing
     *     the ID token, access token and raw nonce or the ID token string.
     * @param accessToken The OAuth access token.
     */
    credential(
      optionsOrIdToken: firebase.auth.OAuthCredentialOptions | string | null,
      accessToken?: string
    ): firebase.auth.OAuthCredential;
    /**
     * Sets the OAuth custom parameters to pass in an OAuth request for popup
     * and redirect sign-in operations.
     * For a detailed list, check the
     * reserved required OAuth 2.0 parameters such as `client_id`, `redirect_uri`,
     * `scope`, `response_type` and `state` are not allowed and will be ignored.
     * @param customOAuthParameters The custom OAuth parameters to pass
     *     in the OAuth request.
     */
    setCustomParameters(
      customOAuthParameters: Object
    ): firebase.auth.AuthProvider;
  }

  class SAMLAuthProvider implements firebase.auth.AuthProvider {
    constructor(providerId: string);
    providerId: string;
  }

  /**
   * Interface representing ID token result obtained from
   * {@link firebase.User.getIdTokenResult}. It contains the ID token JWT string
   * and other helper properties for getting different data associated with the
   * token as well as all the decoded payload claims.
   *
   * Note that these claims are not to be trusted as they are parsed client side.
   * Only server side verification can guarantee the integrity of the token
   * claims.
   */
  interface IdTokenResult {
    /**
     * The Firebase Auth ID token JWT string.
     */
    token: string;
    /**
     * The ID token expiration time formatted as a UTC string.
     */
    expirationTime: string;
    /**
     * The authentication time formatted as a UTC string. This is the time the
     * user authenticated (signed in) and not the time the token was refreshed.
     */
    authTime: string;
    /**
     * The ID token issued at time formatted as a UTC string.
     */
    issuedAtTime: string;
    /**
     * The sign-in provider through which the ID token was obtained (anonymous,
     * custom, phone, password, etc). Note, this does not map to provider IDs.
     */
    signInProvider: string | null;
    /**
     * The type of second factor associated with this session, provided the user
     * was multi-factor authenticated (eg. phone, etc).
     */
    signInSecondFactor: string | null;
    /**
     * The entire payload claims of the ID token including the standard reserved
     * claims as well as the custom claims.
     */
    claims: {
      [key: string]: any;
    };
  }

  /**
   * Defines the options for initializing an
   * {@link firebase.auth.OAuthCredential}. For ID tokens with nonce claim,
   * the raw nonce has to also be provided.
   */
  interface OAuthCredentialOptions {
    /**
     * The OAuth ID token used to initialize the OAuthCredential.
     */
    idToken?: string;
    /**
     * The OAuth access token used to initialize the OAuthCredential.
     */
    accessToken?: string;
    /**
     * The raw nonce associated with the ID token. It is required when an ID token
     * with a nonce field is provided. The SHA-256 hash of the raw nonce must match
     * the nonce field in the ID token.
     */
    rawNonce?: string;
  }

  /**
   * The base class for asserting ownership of a second factor. This is used to
   * facilitate enrollment of a second factor on an existing user
   * or sign-in of a user who already verified the first factor.
   *
   */
  abstract class MultiFactorAssertion {
    /**
     * The identifier of the second factor.
     */
    factorId: string;
  }

  /**
   * The class for asserting ownership of a phone second factor.
   */
  class PhoneMultiFactorAssertion extends firebase.auth.MultiFactorAssertion {
    private constructor();
  }

  /**
   * The class used to initialize {@link firebase.auth.PhoneMultiFactorAssertion}.
   */
  class PhoneMultiFactorGenerator {
    private constructor();
    /**
     * The identifier of the phone second factor: `phone`.
     */
    static FACTOR_ID: string;
    /**
     * Initializes the {@link firebase.auth.PhoneMultiFactorAssertion} to confirm ownership
     * of the phone second factor.
     */
    static assertion(
      phoneAuthCredential: firebase.auth.PhoneAuthCredential
    ): firebase.auth.PhoneMultiFactorAssertion;
  }

  /**
   * A structure containing the information of a second factor entity.
   */
  interface MultiFactorInfo {
    /**
     * The multi-factor enrollment ID.
     */
    uid: string;
    /**
     * The user friendly name of the current second factor.
     */
    displayName?: string | null;
    /**
     * The enrollment date of the second factor formatted as a UTC string.
     */
    enrollmentTime: string;
    /**
     * The identifier of the second factor.
     */
    factorId: string;
  }

  /**
   * The subclass of the MultiFactorInfo interface for phone number second factors.
   * The factorId of this second factor is
   * {@link firebase.auth.PhoneMultiFactorGenerator.FACTOR_ID}.
   */
  interface PhoneMultiFactorInfo extends firebase.auth.MultiFactorInfo {
    /**
     * The phone number associated with the current second factor.
     */
    phoneNumber: string;
  }

  /**
   * The information required to verify the ownership of a phone number. The
   * information that's required depends on whether you are doing single-factor
   * sign-in, multi-factor enrollment or multi-factor sign-in.
   */
  type PhoneInfoOptions =
    | firebase.auth.PhoneSingleFactorInfoOptions
    | firebase.auth.PhoneMultiFactorEnrollInfoOptions
    | firebase.auth.PhoneMultiFactorSignInInfoOptions;
  /**
   * The phone info options for single-factor sign-in. Only phone number is
   * required.
   */
  interface PhoneSingleFactorInfoOptions {
    phoneNumber: string;
  }

  /**
   * The phone info options for multi-factor enrollment. Phone number and
   * multi-factor session are required.
   */
  interface PhoneMultiFactorEnrollInfoOptions {
    phoneNumber: string;
    session: firebase.auth.MultiFactorSession;
  }

  /**
   * The phone info options for multi-factor sign-in. Either multi-factor hint or
   * multi-factor UID and multi-factor session are required.
   */
  interface PhoneMultiFactorSignInInfoOptions {
    multiFactorHint?: firebase.auth.MultiFactorInfo;
    multiFactorUid?: string;
    session: firebase.auth.MultiFactorSession;
  }

  /**
   * The class used to facilitate recovery from
   * {@link firebase.auth.MultiFactorError} when a user needs to provide a second
   * factor to sign in.
   *
   * @example
   * ```javascript
   * firebase.auth().signInWithEmailAndPassword()
   *     .then(function(result) {
   *       // User signed in. No 2nd factor challenge is needed.
   *     })
   *     .catch(function(error) {
   *       if (error.code == 'auth/multi-factor-auth-required') {
   *         var resolver = error.resolver;
   *         // Show UI to let user select second factor.
   *         var multiFactorHints = resolver.hints;
   *       } else {
   *         // Handle other errors.
   *       }
   *     });
   *
   * // The enrolled second factors that can be used to complete
   * // sign-in are returned in the `MultiFactorResolver.hints` list.
   * // UI needs to be presented to allow the user to select a second factor
   * // from that list.
   *
   * var selectedHint = // ; selected from multiFactorHints
   * var phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
   * var phoneInfoOptions = {
   *   multiFactorHint: selectedHint,
   *   session: resolver.session
   * };
   * phoneAuthProvider.verifyPhoneNumber(
   *   phoneInfoOptions,
   *   appVerifier
   * ).then(function(verificationId) {
   *   // store verificationID and show UI to let user enter verification code.
   * });
   *
   * // UI to enter verification code and continue.
   * // Continue button click handler
   * var phoneAuthCredential =
   *     firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
   * var multiFactorAssertion =
   *     firebase.auth.PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
   * resolver.resolveSignIn(multiFactorAssertion)
   *     .then(function(userCredential) {
   *       // User signed in.
   *     });
   * ```
   */
  class MultiFactorResolver {
    private constructor();
    /**
     * The Auth instance used to sign in with the first factor.
     */
    auth: firebase.auth.Auth;
    /**
     * The session identifier for the current sign-in flow, which can be used
     * to complete the second factor sign-in.
     */
    session: firebase.auth.MultiFactorSession;
    /**
     * The list of hints for the second factors needed to complete the sign-in
     * for the current session.
     */
    hints: firebase.auth.MultiFactorInfo[];
    /**
     * A helper function to help users complete sign in with a second factor
     * using an {@link firebase.auth.MultiFactorAssertion} confirming the user
     * successfully completed the second factor challenge.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/invalid-verification-code</dt>
     * <dd>Thrown if the verification code is not valid.</dd>
     * <dt>auth/missing-verification-code</dt>
     * <dd>Thrown if the verification code is missing.</dd>
     * <dt>auth/invalid-verification-id</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential} and the verification
     *     ID of the credential is not valid.</dd>
     * <dt>auth/missing-verification-id</dt>
     * <dd>Thrown if the verification ID is missing.</dd>
     * <dt>auth/code-expired</dt>
     * <dd>Thrown if the verification code has expired.</dd>
     * <dt>auth/invalid-multi-factor-session</dt>
     * <dd>Thrown if the request does not contain a valid proof of first factor
     *     successful sign-in.</dd>
     * <dt>auth/missing-multi-factor-session</dt>
     * <dd>Thrown if The request is missing proof of first factor successful
     *     sign-in.</dd>
     * </dl>
     *
     * @param assertion The multi-factor assertion to resolve sign-in with.
     * @return The promise that resolves with the user credential object.
     */
    resolveSignIn(
      assertion: firebase.auth.MultiFactorAssertion
    ): Promise<firebase.auth.UserCredential>;
  }

  /**
   * The multi-factor session object used for enrolling a second factor on a
   * user or helping sign in an enrolled user with a second factor.
   */
  class MultiFactorSession {
    private constructor();
  }

  /**
   * Classes that represents the Phone Auth credentials returned by a
   * {@link firebase.auth.PhoneAuthProvider}.
   *
   */
  class PhoneAuthCredential extends AuthCredential {
    private constructor();
  }

  /**
   * Phone number auth provider.
   *
   * @example
   * ```javascript
   * // 'recaptcha-container' is the ID of an element in the DOM.
   * var applicationVerifier = new firebase.auth.RecaptchaVerifier(
   *     'recaptcha-container');
   * var provider = new firebase.auth.PhoneAuthProvider();
   * provider.verifyPhoneNumber('+16505550101', applicationVerifier)
   *     .then(function(verificationId) {
   *       var verificationCode = window.prompt('Please enter the verification ' +
   *           'code that was sent to your mobile device.');
   *       return firebase.auth.PhoneAuthProvider.credential(verificationId,
   *           verificationCode);
   *     })
   *     .then(function(phoneCredential) {
   *       return firebase.auth().signInWithCredential(phoneCredential);
   *     });
   * ```
   * @param auth The Firebase Auth instance in which
   *     sign-ins should occur. Uses the default Auth instance if unspecified.
   */
  class PhoneAuthProvider extends PhoneAuthProvider_Instance {
    static PROVIDER_ID: string;
    /**
     * This corresponds to the sign-in method identifier as returned in
     * {@link firebase.auth.Auth.fetchSignInMethodsForEmail}.
     */
    static PHONE_SIGN_IN_METHOD: string;
    /**
     * Creates a phone auth credential, given the verification ID from
     * {@link firebase.auth.PhoneAuthProvider.verifyPhoneNumber} and the code
     * that was sent to the user's mobile device.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/missing-verification-code</dt>
     * <dd>Thrown if the verification code is missing.</dd>
     * <dt>auth/missing-verification-id</dt>
     * <dd>Thrown if the verification ID is missing.</dd>
     * </dl>
     *
     * @param verificationId The verification ID returned from
     *     {@link firebase.auth.PhoneAuthProvider.verifyPhoneNumber}.
     * @param verificationCode The verification code sent to the user's
     *     mobile device.
     * @return The auth provider credential.
     */
    static credential(
      verificationId: string,
      verificationCode: string
    ): firebase.auth.AuthCredential;
  }
  /**
   * @hidden
   */
  class PhoneAuthProvider_Instance implements firebase.auth.AuthProvider {
    constructor(auth?: firebase.auth.Auth | null);
    providerId: string;
    /**
     * Starts a phone number authentication flow by sending a verification code to
     * the given phone number. Returns an ID that can be passed to
     * {@link firebase.auth.PhoneAuthProvider.credential} to identify this flow.
     *
     * For abuse prevention, this method also requires a
     * {@link firebase.auth.ApplicationVerifier}. The Firebase Auth SDK includes
     * a reCAPTCHA-based implementation, {@link firebase.auth.RecaptchaVerifier}.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/captcha-check-failed</dt>
     * <dd>Thrown if the reCAPTCHA response token was invalid, expired, or if
     *     this method was called from a non-whitelisted domain.</dd>
     * <dt>auth/invalid-phone-number</dt>
     * <dd>Thrown if the phone number has an invalid format.</dd>
     * <dt>auth/missing-phone-number</dt>
     * <dd>Thrown if the phone number is missing.</dd>
     * <dt>auth/quota-exceeded</dt>
     * <dd>Thrown if the SMS quota for the Firebase project has been exceeded.</dd>
     * <dt>auth/user-disabled</dt>
     * <dd>Thrown if the user corresponding to the given phone number has been
     *     disabled.</dd>
     * <dt>auth/maximum-second-factor-count-exceeded</dt>
     * <dd>Thrown if The maximum allowed number of second factors on a user
     *     has been exceeded.</dd>
     * <dt>auth/second-factor-already-in-use</dt>
     * <dd>Thrown if the second factor is already enrolled on this account.</dd>
     * <dt>auth/unsupported-first-factor</dt>
     * <dd>Thrown if the first factor being used to sign in is not supported.</dd>
     * <dt>auth/unverified-email</dt>
     * <dd>Thrown if the email of the account is not verified.</dd>
     * </dl>
     *
     * @param phoneInfoOptions The user's {@link firebase.auth.PhoneInfoOptions}.
     *     The phone number should be in E.164 format (e.g. +16505550101).
     * @param applicationVerifier
     * @return A Promise for the verification ID.
     */
    verifyPhoneNumber(
      phoneInfoOptions: firebase.auth.PhoneInfoOptions | string,
      applicationVerifier: firebase.auth.ApplicationVerifier
    ): Promise<string>;
  }

  /**
   * An {@link https://www.google.com/recaptcha/ reCAPTCHA}-based application
   * verifier.
   *
   * @webonly
   *
   * @param container The reCAPTCHA container parameter. This
   *     has different meaning depending on whether the reCAPTCHA is hidden or
   *     visible. For a visible reCAPTCHA the container must be empty. If a string
   *     is used, it has to correspond to an element ID. The corresponding element
   *     must also must be in the DOM at the time of initialization.
   * @param parameters The optional reCAPTCHA parameters. Check the
   *     reCAPTCHA docs for a comprehensive list. All parameters are accepted
   *     except for the sitekey. Firebase Auth backend provisions a reCAPTCHA for
   *     each project and will configure this upon rendering. For an invisible
   *     reCAPTCHA, a size key must have the value 'invisible'.
   * @param app The corresponding Firebase app. If none is
   *     provided, the default Firebase App instance is used. A Firebase App
   *     instance must be initialized with an API key, otherwise an error will be
   *     thrown.
   */
  class RecaptchaVerifier extends RecaptchaVerifier_Instance {}
  /**
   * @webonly
   * @hidden
   */
  class RecaptchaVerifier_Instance
    implements firebase.auth.ApplicationVerifier {
    constructor(
      container: any | string,
      parameters?: Object | null,
      app?: firebase.app.App | null
    );
    /**
     * Clears the reCAPTCHA widget from the page and destroys the current instance.
     */
    clear(): void;
    /**
     * Renders the reCAPTCHA widget on the page.
     * @return A Promise that resolves with the
     *     reCAPTCHA widget ID.
     */
    render(): Promise<number>;
    /**
     * The application verifier type. For a reCAPTCHA verifier, this is 'recaptcha'.
     */
    type: string;
    /**
     * Waits for the user to solve the reCAPTCHA and resolves with the reCAPTCHA
     * token.
     * @return A Promise for the reCAPTCHA token.
     */
    verify(): Promise<string>;
  }

  /**
   * Twitter auth provider.
   *
   * @example
   * ```javascript
   * // Using a redirect.
   * firebase.auth().getRedirectResult().then(function(result) {
   *   if (result.credential) {
   *     // For accessing the Twitter API.
   *     var token = result.credential.accessToken;
   *     var secret = result.credential.secret;
   *   }
   *   var user = result.user;
   * });
   *
   * // Start a sign in process for an unauthenticated user.
   * var provider = new firebase.auth.TwitterAuthProvider();
   * firebase.auth().signInWithRedirect(provider);
   * ```
   * @example
   * ```javascript
   * // Using a popup.
   * var provider = new firebase.auth.TwitterAuthProvider();
   * firebase.auth().signInWithPopup(provider).then(function(result) {
   *   // For accessing the Twitter API.
   *   var token = result.credential.accessToken;
   *   var secret = result.credential.secret;
   *   // The signed-in user info.
   *   var user = result.user;
   * });
   * ```
   *
   * @see {@link firebase.auth.Auth.onAuthStateChanged} to receive sign in state
   * changes.
   */
  class TwitterAuthProvider extends TwitterAuthProvider_Instance {
    static PROVIDER_ID: string;
    /**
     * This corresponds to the sign-in method identifier as returned in
     * {@link firebase.auth.Auth.fetchSignInMethodsForEmail}.
     *
     */
    static TWITTER_SIGN_IN_METHOD: string;
    /**
     * @param token Twitter access token.
     * @param secret Twitter secret.
     * @return The auth provider credential.
     */
    static credential(
      token: string,
      secret: string
    ): firebase.auth.OAuthCredential;
  }
  /**
   * @hidden
   */
  class TwitterAuthProvider_Instance implements firebase.auth.AuthProvider {
    providerId: string;
    /**
     * Sets the OAuth custom parameters to pass in a Twitter OAuth request for popup
     * and redirect sign-in operations.
     * Valid parameters include 'lang'.
     * Reserved required OAuth 1.0 parameters such as 'oauth_consumer_key',
     * 'oauth_token', 'oauth_signature', etc are not allowed and will be ignored.
     * @param customOAuthParameters The custom OAuth parameters to pass
     *     in the OAuth request.
     * @return The provider instance itself.
     */
    setCustomParameters(
      customOAuthParameters: Object
    ): firebase.auth.AuthProvider;
  }

  /**
   * A structure containing a User, an AuthCredential, the operationType, and
   * any additional user information that was returned from the identity provider.
   * operationType could be 'signIn' for a sign-in operation, 'link' for a linking
   * operation and 'reauthenticate' for a reauthentication operation.
   */
  type UserCredential = {
    additionalUserInfo?: firebase.auth.AdditionalUserInfo | null;
    credential: firebase.auth.AuthCredential | null;
    operationType?: string | null;
    user: firebase.User | null;
  };

  /**
   * Interface representing a user's metadata.
   */
  interface UserMetadata {
    creationTime?: string;
    lastSignInTime?: string;
  }
}

/**
 * @webonly
 */
declare namespace firebase.analytics {
  /**
   * The Firebase Analytics service interface.
   *
   * Do not call this constructor directly. Instead, use
   * {@link firebase.analytics `firebase.analytics()`}.
   */
  export interface Analytics {
    /**
     * The {@link firebase.app.App app} associated with the `Analytics` service
     * instance.
     *
     * @example
     * ```javascript
     * var app = analytics.app;
     * ```
     */
    app: firebase.app.App;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'add_payment_info',
      eventParams?: {
        coupon?: EventParams['coupon'];
        currency?: EventParams['currency'];
        items?: EventParams['items'];
        payment_type?: EventParams['payment_type'];
        value?: EventParams['value'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'add_shipping_info',
      eventParams?: {
        coupon?: EventParams['coupon'];
        currency?: EventParams['currency'];
        items?: EventParams['items'];
        shipping_tier?: EventParams['shipping_tier'];
        value?: EventParams['value'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'add_to_cart' | 'add_to_wishlist' | 'remove_from_cart',
      eventParams?: {
        currency?: EventParams['currency'];
        value?: EventParams['value'];
        items?: EventParams['items'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'begin_checkout',
      eventParams?: {
        currency?: EventParams['currency'];
        coupon?: EventParams['coupon'];
        value?: EventParams['value'];
        items?: EventParams['items'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'checkout_progress',
      eventParams?: {
        currency?: EventParams['currency'];
        coupon?: EventParams['coupon'];
        value?: EventParams['value'];
        items?: EventParams['items'];
        checkout_step?: EventParams['checkout_step'];
        checkout_option?: EventParams['checkout_option'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * See
     * {@link https://developers.google.com/analytics/devguides/collection/ga4/exceptions
     * | Measure exceptions}.
     */
    logEvent(
      eventName: 'exception',
      eventParams?: {
        description?: EventParams['description'];
        fatal?: EventParams['fatal'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'generate_lead',
      eventParams?: {
        value?: EventParams['value'];
        currency?: EventParams['currency'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'login',
      eventParams?: {
        method?: EventParams['method'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * See
     * {@link https://developers.google.com/analytics/devguides/collection/ga4/page-view
     * | Page views}.
     */
    logEvent(
      eventName: 'page_view',
      eventParams?: {
        page_title?: string;
        page_location?: string;
        page_path?: string;
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'purchase' | 'refund',
      eventParams?: {
        value?: EventParams['value'];
        currency?: EventParams['currency'];
        transaction_id: EventParams['transaction_id'];
        tax?: EventParams['tax'];
        shipping?: EventParams['shipping'];
        items?: EventParams['items'];
        coupon?: EventParams['coupon'];
        affiliation?: EventParams['affiliation'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * See {@link https://firebase.google.com/docs/analytics/screenviews
     * | Track Screenviews}.
     */
    logEvent(
      eventName: 'screen_view',
      eventParams?: {
        firebase_screen: EventParams['firebase_screen'];
        firebase_screen_class: EventParams['firebase_screen_class'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'search' | 'view_search_results',
      eventParams?: {
        search_term?: EventParams['search_term'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'select_content',
      eventParams?: {
        content_type?: EventParams['content_type'];
        item_id?: EventParams['item_id'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'select_item',
      eventParams?: {
        items?: EventParams['items'];
        item_list_name?: EventParams['item_list_name'];
        item_list_id?: EventParams['item_list_id'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'select_promotion' | 'view_promotion',
      eventParams?: {
        items?: EventParams['items'];
        promotion_id?: EventParams['promotion_id'];
        promotion_name?: EventParams['promotion_name'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'set_checkout_option',
      eventParams?: {
        checkout_step?: EventParams['checkout_step'];
        checkout_option?: EventParams['checkout_option'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'share',
      eventParams?: {
        method?: EventParams['method'];
        content_type?: EventParams['content_type'];
        item_id?: EventParams['item_id'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'sign_up',
      eventParams?: {
        method?: EventParams['method'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'timing_complete',
      eventParams?: {
        name: string;
        value: number;
        event_category?: string;
        event_label?: string;
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'view_cart' | 'view_item',
      eventParams?: {
        currency?: EventParams['currency'];
        items?: EventParams['items'];
        value?: EventParams['value'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent(
      eventName: 'view_item_list',
      eventParams?: {
        items?: EventParams['items'];
        item_list_name?: EventParams['item_list_name'];
        item_list_id?: EventParams['item_list_id'];
        [key: string]: any;
      },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sends analytics event with given `eventParams`. This method
     * automatically associates this logged event with this Firebase web
     * app instance on this device.
     * List of recommended event parameters can be found in
     * {@link https://developers.google.com/gtagjs/reference/ga4-events
     * | the GA4 reference documentation}.
     */
    logEvent<T extends string>(
      eventName: CustomEventName<T>,
      eventParams?: { [key: string]: any },
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Use gtag 'config' command to set 'screen_name'.
     */
    setCurrentScreen(
      screenName: string,
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Use gtag 'config' command to set 'user_id'.
     */
    setUserId(
      id: string,
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Use gtag 'config' command to set all params specified.
     */
    setUserProperties(
      properties: firebase.analytics.CustomParams,
      options?: firebase.analytics.AnalyticsCallOptions
    ): void;

    /**
     * Sets whether analytics collection is enabled for this app on this device.
     * window['ga-disable-analyticsId'] = true;
     */
    setAnalyticsCollectionEnabled(enabled: boolean): void;
  }

  export type CustomEventName<T> = T extends EventNameString ? never : T;

  /**
   * Additional options that can be passed to Firebase Analytics method
   * calls such as `logEvent`, `setCurrentScreen`, etc.
   */
  export interface AnalyticsCallOptions {
    /**
     * If true, this config or event call applies globally to all
     * analytics properties on the page.
     */
    global: boolean;
  }

  /**
   * Specifies custom options for your Firebase Analytics instance.
   * You must set these before initializing `firebase.analytics()`.
   */
  export interface SettingsOptions {
    /** Sets custom name for `gtag` function. */
    gtagName?: string;
    /** Sets custom name for `dataLayer` array used by gtag. */
    dataLayerName?: string;
  }

  /**
   * Configures Firebase Analytics to use custom `gtag` or `dataLayer` names.
   * Intended to be used if `gtag.js` script has been installed on
   * this page independently of Firebase Analytics, and is using non-default
   * names for either the `gtag` function or for `dataLayer`.
   * Must be called before calling `firebase.analytics()` or it won't
   * have any effect.
   */
  export function settings(settings: firebase.analytics.SettingsOptions): void;

  /**
   * Standard gtag.js control parameters.
   * For more information, see
   * {@link https://developers.google.com/gtagjs/reference/parameter
   * the gtag.js documentation on parameters}.
   */
  export interface ControlParams {
    groups?: string | string[];
    send_to?: string | string[];
    event_callback?: () => void;
    event_timeout?: number;
  }

  /**
   * Standard gtag.js event parameters.
   * For more information, see
   * {@link https://developers.google.com/gtagjs/reference/parameter
   * the gtag.js documentation on parameters}.
   */
  export interface EventParams {
    checkout_option?: string;
    checkout_step?: number;
    item_id?: string;
    content_type?: string;
    coupon?: string;
    currency?: string;
    description?: string;
    fatal?: boolean;
    items?: Item[];
    method?: string;
    number?: string;
    promotions?: Promotion[];
    screen_name?: string;
    /**
     * Firebase-specific. Use to log a `screen_name` to Firebase Analytics.
     */
    firebase_screen?: string;
    /**
     * Firebase-specific. Use to log a `screen_class` to Firebase Analytics.
     */
    firebase_screen_class?: string;
    search_term?: string;
    shipping?: Currency;
    tax?: Currency;
    transaction_id?: string;
    value?: number;
    event_label?: string;
    event_category: string;
    shipping_tier?: string;
    item_list_id?: string;
    item_list_name?: string;
    promotion_id?: string;
    promotion_name?: string;
    payment_type?: string;
    affiliation?: string;
  }

  /**
   * Any custom params the user may pass to gtag.js.
   */
  export interface CustomParams {
    [key: string]: any;
  }

  /**
   * Type for standard gtag.js event names. `logEvent` also accepts any
   * custom string and interprets it as a custom event name.
   */
  export type EventNameString =
    | 'add_payment_info'
    | 'add_shipping_info'
    | 'add_to_cart'
    | 'add_to_wishlist'
    | 'begin_checkout'
    | 'checkout_progress'
    | 'exception'
    | 'generate_lead'
    | 'login'
    | 'page_view'
    | 'purchase'
    | 'refund'
    | 'remove_from_cart'
    | 'screen_view'
    | 'search'
    | 'select_content'
    | 'select_item'
    | 'select_promotion'
    | 'set_checkout_option'
    | 'share'
    | 'sign_up'
    | 'timing_complete'
    | 'view_cart'
    | 'view_item'
    | 'view_item_list'
    | 'view_promotion'
    | 'view_search_results';

  /**
   * Enum of standard gtag.js event names provided for convenient
   * developer usage. `logEvent` will also accept any custom string
   * and interpret it as a custom event name.
   */
  export enum EventName {
    ADD_PAYMENT_INFO = 'add_payment_info',
    ADD_SHIPPING_INFO = 'add_shipping_info',
    ADD_TO_CART = 'add_to_cart',
    ADD_TO_WISHLIST = 'add_to_wishlist',
    BEGIN_CHECKOUT = 'begin_checkout',
    /** @deprecated */
    CHECKOUT_PROGRESS = 'checkout_progress',
    EXCEPTION = 'exception',
    GENERATE_LEAD = 'generate_lead',
    LOGIN = 'login',
    PAGE_VIEW = 'page_view',
    PURCHASE = 'purchase',
    REFUND = 'refund',
    REMOVE_FROM_CART = 'remove_from_cart',
    SCREEN_VIEW = 'screen_view',
    SEARCH = 'search',
    SELECT_CONTENT = 'select_content',
    SELECT_ITEM = 'select_item',
    SELECT_PROMOTION = 'select_promotion',
    /** @deprecated */
    SET_CHECKOUT_OPTION = 'set_checkout_option',
    SHARE = 'share',
    SIGN_UP = 'sign_up',
    TIMING_COMPLETE = 'timing_complete',
    VIEW_CART = 'view_cart',
    VIEW_ITEM = 'view_item',
    VIEW_ITEM_LIST = 'view_item_list',
    VIEW_PROMOTION = 'view_promotion',
    VIEW_SEARCH_RESULTS = 'view_search_results',
  }

  export type Currency = string | number;

  export interface Item {
    item_id?: string;
    item_name?: string;
    item_brand?: string;
    item_category?: string;
    item_category2?: string;
    item_category3?: string;
    item_category4?: string;
    item_category5?: string;
    item_variant?: string;
    price?: Currency;
    quantity?: number;
    index?: number;
    coupon?: string;
    item_list_name?: string;
    item_list_id?: string;
    discount?: Currency;
    affiliation?: string;
    creative_name?: string;
    creative_slot?: string;
    promotion_id?: string;
    promotion_name?: string;
    location_id?: string;
    /** @deprecated Use item_brand instead. */
    brand?: string;
    /** @deprecated Use item_category instead. */
    category?: string;
    /** @deprecated Use item_id instead. */
    id?: string;
    /** @deprecated Use item_name instead. */
    name?: string;
  }

  /** @deprecated Use Item instead. */
  export interface Promotion {
    creative_name?: string;
    creative_slot?: string;
    id?: string;
    name?: string;
  }

  /**
   * An async function that returns true if current browser context supports initialization of analytics module
   * (`firebase.analytics()`).
   *
   * Returns false otherwise.
   *
   *
   */
  function isSupported(): Promise<boolean>;
}

declare namespace firebase.auth.Auth {
  type Persistence = string;
  /**
   * An enumeration of the possible persistence mechanism types.
   */
  var Persistence: {
    /**
     * Indicates that the state will be persisted even when the browser window is
     * closed or the activity is destroyed in react-native.
     */
    LOCAL: Persistence;
    /**
     * Indicates that the state will only be stored in memory and will be cleared
     * when the window or activity is refreshed.
     */
    NONE: Persistence;
    /**
     * Indicates that the state will only persist in current session/tab, relevant
     * to web only, and will be cleared when the tab is closed.
     */
    SESSION: Persistence;
  };
}

declare namespace firebase.User {
  /**
   * This is the interface that defines the multi-factor related properties and
   * operations pertaining to a {@link firebase.User}.
   */
  interface MultiFactorUser {
    /**
     * Returns a list of the user's enrolled second factors.
     */
    enrolledFactors: firebase.auth.MultiFactorInfo[];
    /**
     * Enrolls a second factor as identified by the
     * {@link firebase.auth.MultiFactorAssertion} for the current user.
     * On resolution, the user tokens are updated to reflect the change in the
     * JWT payload.
     * Accepts an additional display name parameter used to identify the second
     * factor to the end user.
     * Recent re-authentication is required for this operation to succeed.
     * On successful enrollment, existing Firebase sessions (refresh tokens) are
     * revoked. When a new factor is enrolled, an email notification is sent
     * to the user’s email.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/invalid-verification-code</dt>
     * <dd>Thrown if the verification code is not valid.</dd>
     * <dt>auth/missing-verification-code</dt>
     * <dd>Thrown if the verification code is missing.</dd>
     * <dt>auth/invalid-verification-id</dt>
     * <dd>Thrown if the credential is a
     *     {@link firebase.auth.PhoneAuthProvider.credential} and the verification
     *     ID of the credential is not valid.</dd>
     * <dt>auth/missing-verification-id</dt>
     * <dd>Thrown if the verification ID is missing.</dd>
     * <dt>auth/code-expired</dt>
     * <dd>Thrown if the verification code has expired.</dd>
     * <dt>auth/maximum-second-factor-count-exceeded</dt>
     * <dd>Thrown if The maximum allowed number of second factors on a user
     *     has been exceeded.</dd>
     * <dt>auth/second-factor-already-in-use</dt>
     * <dd>Thrown if the second factor is already enrolled on this account.</dd>
     * <dt>auth/unsupported-first-factor</dt>
     * <dd>Thrown if the first factor being used to sign in is not supported.</dd>
     * <dt>auth/unverified-email</dt>
     * <dd>Thrown if the email of the account is not verified.</dd>
     * <dt>auth/requires-recent-login</dt>
     * <dd>Thrown if the user's last sign-in time does not meet the security
     *     threshold. Use {@link firebase.User.reauthenticateWithCredential} to
     *     resolve.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * firebase.auth().currentUser.multiFactor.getSession()
     *     .then(function(multiFactorSession) {
     *       // Send verification code
     *     var phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
     *     var phoneInfoOptions = {
     *       phoneNumber: phoneNumber,
     *       session: multiFactorSession
     *     };
     *     return phoneAuthProvider.verifyPhoneNumber(
     *         phoneInfoOptions, appVerifier);
     *     }).then(function(verificationId) {
     *       // Store verificationID and show UI to let user enter verification code.
     *     });
     *
     * var phoneAuthCredential =
     *     firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
     * var multiFactorAssertion =
     *     firebase.auth.PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
     * firebase.auth().currentUser.multiFactor.enroll(multiFactorAssertion)
     *     .then(function() {
     *       // Second factor enrolled.
     *     });
     * ```
     *
     * @param assertion The multi-factor assertion to enroll with.
     * @param displayName The display name of the second factor.
     */
    enroll(
      assertion: firebase.auth.MultiFactorAssertion,
      displayName?: string | null
    ): Promise<void>;
    /**
     * Returns the session identifier for a second factor enrollment operation.
     * This is used to identify the current user trying to enroll a second factor.
     * @return The promise that resolves with the
     * {@link firebase.auth.MultiFactorSession}.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/user-token-expired</dt>
     * <dd>Thrown if the token of the user is expired.</dd>
     * </dl>
     */
    getSession(): Promise<firebase.auth.MultiFactorSession>;
    /**
     * Unenrolls the specified second factor. To specify the factor to remove, pass
     * a {@link firebase.auth.MultiFactorInfo} object
     * (retrieved from <code>enrolledFactors()</code>)
     * or the factor's UID string.
     * Sessions are not revoked when the account is downgraded. An email
     * notification is likely to be sent to the user notifying them of the change.
     * Recent re-authentication is required for this operation to succeed.
     * When an existing factor is unenrolled, an email notification is sent to the
     * user’s email.
     *
     * <h4>Error Codes</h4>
     * <dl>
     * <dt>auth/multi-factor-info-not-found</dt>
     * <dd>Thrown if the user does not have a second factor matching the
     *     identifier provided.</dd>
     * <dt>auth/requires-recent-login</dt>
     * <dd>Thrown if the user's last sign-in time does not meet the security
     *     threshold. Use {@link firebase.User.reauthenticateWithCredential} to
     *     resolve.</dd>
     * </dl>
     *
     * @example
     * ```javascript
     * var options = firebase.auth().currentUser.multiFactor.enrolledFactors;
     * // Present user the option to unenroll.
     * return firebase.auth().currentUser.multiFactor.unenroll(options[i])
     *   .then(function() {
     *     // User successfully unenrolled selected factor.
     *   }).catch(function(error) {
     *     // Handler error.
     *   });
     * ```
     *
     * @param option The multi-factor option to unenroll.
     */
    unenroll(option: firebase.auth.MultiFactorInfo | string): Promise<void>;
  }
}

declare namespace firebase.auth.ActionCodeInfo {
  type Operation = string;
  /**
   * An enumeration of the possible email action types.
   */
  var Operation: {
    /**
     * The email link sign-in action.
     */
    EMAIL_SIGNIN: Operation;
    /**
     * The password reset action.
     */
    PASSWORD_RESET: Operation;
    /**
     * The email revocation action.
     */
    RECOVER_EMAIL: Operation;
    /**
     * The revert second factor addition email action.
     */
    REVERT_SECOND_FACTOR_ADDITION: Operation;
    /**
     * The verify and update email action.
     */
    VERIFY_AND_CHANGE_EMAIL: Operation;
    /**
     * The email verification action.
     */
    VERIFY_EMAIL: Operation;
  };
}

declare namespace firebase.database {
  /**
   * A `DataSnapshot` contains data from a Database location.
   *
   * Any time you read data from the Database, you receive the data as a
   * `DataSnapshot`. A `DataSnapshot` is passed to the event callbacks you attach
   * with `on()` or `once()`. You can extract the contents of the snapshot as a
   * JavaScript object by calling the `val()` method. Alternatively, you can
   * traverse into the snapshot by calling `child()` to return child snapshots
   * (which you could then call `val()` on).
   *
   * A `DataSnapshot` is an efficiently generated, immutable copy of the data at
   * a Database location. It cannot be modified and will never change (to modify
   * data, you always call the `set()` method on a `Reference` directly).
   *
   */
  interface DataSnapshot {
    /**
     * Gets another `DataSnapshot` for the location at the specified relative path.
     *
     * Passing a relative path to the `child()` method of a DataSnapshot returns
     * another `DataSnapshot` for the location at the specified relative path. The
     * relative path can either be a simple child name (for example, "ada") or a
     * deeper, slash-separated path (for example, "ada/name/first"). If the child
     * location has no data, an empty `DataSnapshot` (that is, a `DataSnapshot`
     * whose value is `null`) is returned.
     *
     * @example
     * ```javascript
     * // Assume we have the following data in the Database:
     * {
     *   "name": {
     *     "first": "Ada",
     *     "last": "Lovelace"
     *   }
     * }
     *
     * // Test for the existence of certain keys within a DataSnapshot
     * var ref = firebase.database().ref("users/ada");
     * ref.once("value")
     *   .then(function(snapshot) {
     *     var name = snapshot.child("name").val(); // {first:"Ada",last:"Lovelace"}
     *     var firstName = snapshot.child("name/first").val(); // "Ada"
     *     var lastName = snapshot.child("name").child("last").val(); // "Lovelace"
     *     var age = snapshot.child("age").val(); // null
     *   });
     * ```
     *
     * @param path A relative path to the location of child data.
     */
    child(path: string): firebase.database.DataSnapshot;
    /**
     * Returns true if this `DataSnapshot` contains any data. It is slightly more
     * efficient than using `snapshot.val() !== null`.
     *
     * @example
     * ```javascript
     * // Assume we have the following data in the Database:
     * {
     *   "name": {
     *     "first": "Ada",
     *     "last": "Lovelace"
     *   }
     * }
     *
     * // Test for the existence of certain keys within a DataSnapshot
     * var ref = firebase.database().ref("users/ada");
     * ref.once("value")
     *   .then(function(snapshot) {
     *     var a = snapshot.exists();  // true
     *     var b = snapshot.child("name").exists(); // true
     *     var c = snapshot.child("name/first").exists(); // true
     *     var d = snapshot.child("name/middle").exists(); // false
     *   });
     * ```
     */
    exists(): boolean;
    /**
     * Exports the entire contents of the DataSnapshot as a JavaScript object.
     *
     * The `exportVal()` method is similar to `val()`, except priority information
     * is included (if available), making it suitable for backing up your data.
     *
     * @return The DataSnapshot's contents as a JavaScript value (Object,
     *   Array, string, number, boolean, or `null`).
     */
    exportVal(): any;
    /**
     * Enumerates the top-level children in the `DataSnapshot`.
     *
     * Because of the way JavaScript objects work, the ordering of data in the
     * JavaScript object returned by `val()` is not guaranteed to match the ordering
     * on the server nor the ordering of `child_added` events. That is where
     * `forEach()` comes in handy. It guarantees the children of a `DataSnapshot`
     * will be iterated in their query order.
     *
     * If no explicit `orderBy*()` method is used, results are returned
     * ordered by key (unless priorities are used, in which case, results are
     * returned by priority).
     *
     * @example
     * ```javascript
     * // Assume we have the following data in the Database:
     * {
     *   "users": {
     *     "ada": {
     *       "first": "Ada",
     *       "last": "Lovelace"
     *     },
     *     "alan": {
     *       "first": "Alan",
     *       "last": "Turing"
     *     }
     *   }
     * }
     *
     * // Loop through users in order with the forEach() method. The callback
     * // provided to forEach() will be called synchronously with a DataSnapshot
     * // for each child:
     * var query = firebase.database().ref("users").orderByKey();
     * query.once("value")
     *   .then(function(snapshot) {
     *     snapshot.forEach(function(childSnapshot) {
     *       // key will be "ada" the first time and "alan" the second time
     *       var key = childSnapshot.key;
     *       // childData will be the actual contents of the child
     *       var childData = childSnapshot.val();
     *   });
     * });
     * ```
     *
     * @example
     * ```javascript
     * // You can cancel the enumeration at any point by having your callback
     * // function return true. For example, the following code sample will only
     * // fire the callback function one time:
     * var query = firebase.database().ref("users").orderByKey();
     * query.once("value")
     *   .then(function(snapshot) {
     *     snapshot.forEach(function(childSnapshot) {
     *       var key = childSnapshot.key; // "ada"
     *
     *       // Cancel enumeration
     *       return true;
     *   });
     * });
     * ```
     *
     * @param action A function
     *   that will be called for each child DataSnapshot. The callback can return
     *   true to cancel further enumeration.
     * @return true if enumeration was canceled due to your callback
     *   returning true.
     */
    forEach(
      action: (a: firebase.database.DataSnapshot) => boolean | void
    ): boolean;
    /**
     * Gets the priority value of the data in this `DataSnapshot`.
     *
     * Applications need not use priority but can order collections by
     * ordinary properties (see
     * {@link
     *  https://firebase.google.com/docs/database/web/lists-of-data#sorting_and_filtering_data
     *  Sorting and filtering data}).
     */
    getPriority(): string | number | null;
    /**
     * Returns true if the specified child path has (non-null) data.
     *
     * @example
     * ```javascript
     * // Assume we have the following data in the Database:
     * {
     *   "name": {
     *     "first": "Ada",
     *     "last": "Lovelace"
     *   }
     * }
     *
     * // Determine which child keys in DataSnapshot have data.
     * var ref = firebase.database().ref("users/ada");
     * ref.once("value")
     *   .then(function(snapshot) {
     *     var hasName = snapshot.hasChild("name"); // true
     *     var hasAge = snapshot.hasChild("age"); // false
     *   });
     * ```
     *
     * @param path A relative path to the location of a potential child.
     * @return `true` if data exists at the specified child path; else
     *  `false`.
     */
    hasChild(path: string): boolean;
    /**
     * Returns whether or not the `DataSnapshot` has any non-`null` child
     * properties.
     *
     * You can use `hasChildren()` to determine if a `DataSnapshot` has any
     * children. If it does, you can enumerate them using `forEach()`. If it
     * doesn't, then either this snapshot contains a primitive value (which can be
     * retrieved with `val()`) or it is empty (in which case, `val()` will return
     * `null`).
     *
     * @example
     * ```javascript
     * // Assume we have the following data in the Database:
     * {
     *   "name": {
     *     "first": "Ada",
     *     "last": "Lovelace"
     *   }
     * }
     *
     * var ref = firebase.database().ref("users/ada");
     * ref.once("value")
     *   .then(function(snapshot) {
     *     var a = snapshot.hasChildren(); // true
     *     var b = snapshot.child("name").hasChildren(); // true
     *     var c = snapshot.child("name/first").hasChildren(); // false
     *   });
     * ```
     *
     * @return true if this snapshot has any children; else false.
     */
    hasChildren(): boolean;
    /**
     * The key (last part of the path) of the location of this `DataSnapshot`.
     *
     * The last token in a Database location is considered its key. For example,
     * "ada" is the key for the /users/ada/ node. Accessing the key on any
     * `DataSnapshot` will return the key for the location that generated it.
     * However, accessing the key on the root URL of a Database will return `null`.
     *
     * @example
     * ```javascript
     * // Assume we have the following data in the Database:
     * {
     *   "name": {
     *     "first": "Ada",
     *     "last": "Lovelace"
     *   }
     * }
     *
     * var ref = firebase.database().ref("users/ada");
     * ref.once("value")
     *   .then(function(snapshot) {
     *     var key = snapshot.key; // "ada"
     *     var childKey = snapshot.child("name/last").key; // "last"
     *   });
     * ```
     *
     * @example
     * ```javascript
     * var rootRef = firebase.database().ref();
     * rootRef.once("value")
     *   .then(function(snapshot) {
     *     var key = snapshot.key; // null
     *     var childKey = snapshot.child("users/ada").key; // "ada"
     *   });
     * ```
     */
    key: string | null;
    /**
     * Returns the number of child properties of this `DataSnapshot`.
     *
     * @example
     * ```javascript
     * // Assume we have the following data in the Database:
     * {
     *   "name": {
     *     "first": "Ada",
     *     "last": "Lovelace"
     *   }
     * }
     *
     * var ref = firebase.database().ref("users/ada");
     * ref.once("value")
     *   .then(function(snapshot) {
     *     var a = snapshot.numChildren(); // 1 ("name")
     *     var b = snapshot.child("name").numChildren(); // 2 ("first", "last")
     *     var c = snapshot.child("name/first").numChildren(); // 0
     *   });
     * ```
     */
    numChildren(): number;
    /**
     * Extracts a JavaScript value from a `DataSnapshot`.
     *
     * Depending on the data in a `DataSnapshot`, the `val()` method may return a
     * scalar type (string, number, or boolean), an array, or an object. It may also
     * return null, indicating that the `DataSnapshot` is empty (contains no data).
     *
     * @example
     * ```javascript
     * // Write and then read back a string from the Database.
     * ref.set("hello")
     *   .then(function() {
     *     return ref.once("value");
     *   })
     *   .then(function(snapshot) {
     *     var data = snapshot.val(); // data === "hello"
     *   });
     * ```
     *
     * @example
     * ```javascript
     * // Write and then read back a JavaScript object from the Database.
     * ref.set({ name: "Ada", age: 36 })
     *   .then(function() {
     *    return ref.once("value");
     *   })
     *   .then(function(snapshot) {
     *     var data = snapshot.val();
     *     // data is { "name": "Ada", "age": 36 }
     *     // data.name === "Ada"
     *     // data.age === 36
     *   });
     * ```
     *
     * @return The DataSnapshot's contents as a JavaScript value (Object,
     *   Array, string, number, boolean, or `null`).
     */
    val(): any;
    /**
     * The `Reference` for the location that generated this `DataSnapshot`.
     */
    ref: firebase.database.Reference;
    /**
     * Returns a JSON-serializable representation of this object.
     */
    toJSON(): Object | null;
  }

  /**
   * The Firebase Database service interface.
   *
   * Do not call this constructor directly. Instead, use
   * {@link firebase.database `firebase.database()`}.
   *
   * See
   * {@link
   *   https://firebase.google.com/docs/database/web/start/
   *   Installation &amp; Setup in JavaScript}
   * for a full guide on how to use the Firebase Database service.
   */
  interface Database {
    /**
     * The {@link firebase.app.App app} associated with the `Database` service
     * instance.
     *
     * @example
     * ```javascript
     * var app = database.app;
     * ```
     */
    app: firebase.app.App;
    /**
     * Modify this instance to communicate with the Realtime Database emulator.
     *
     * <p>Note: This method must be called before performing any other operation.
     *
     * @param host the emulator host (ex: localhost)
     * @param port the emulator port (ex: 8080)
     * @param options.mockUserToken the mock auth token to use for unit testing Security Rules
     */
    useEmulator(
      host: string,
      port: number,
      options?: {
        mockUserToken?: EmulatorMockTokenOptions | string;
      }
    ): void;
    /**
     * Disconnects from the server (all Database operations will be completed
     * offline).
     *
     * The client automatically maintains a persistent connection to the Database
     * server, which will remain active indefinitely and reconnect when
     * disconnected. However, the `goOffline()` and `goOnline()` methods may be used
     * to control the client connection in cases where a persistent connection is
     * undesirable.
     *
     * While offline, the client will no longer receive data updates from the
     * Database. However, all Database operations performed locally will continue to
     * immediately fire events, allowing your application to continue behaving
     * normally. Additionally, each operation performed locally will automatically
     * be queued and retried upon reconnection to the Database server.
     *
     * To reconnect to the Database and begin receiving remote events, see
     * `goOnline()`.
     *
     * @example
     * ```javascript
     * firebase.database().goOffline();
     * ```
     */
    goOffline(): any;
    /**
     * Reconnects to the server and synchronizes the offline Database state
     * with the server state.
     *
     * This method should be used after disabling the active connection with
     * `goOffline()`. Once reconnected, the client will transmit the proper data
     * and fire the appropriate events so that your client "catches up"
     * automatically.
     *
     * @example
     * ```javascript
     * firebase.database().goOnline();
     * ```
     */
    goOnline(): any;
    /**
     * Returns a `Reference` representing the location in the Database
     * corresponding to the provided path. If no path is provided, the `Reference`
     * will point to the root of the Database.
     *
     * @example
     * ```javascript
     * // Get a reference to the root of the Database
     * var rootRef = firebase.database().ref();
     * ```
     *
     * @example
     * ```javascript
     * // Get a reference to the /users/ada node
     * var adaRef = firebase.database().ref("users/ada");
     * // The above is shorthand for the following operations:
     * //var rootRef = firebase.database().ref();
     * //var adaRef = rootRef.child("users/ada");
     * ```
     *
     * @param path Optional path representing the location the returned
     *   `Reference` will point. If not provided, the returned `Reference` will
     *   point to the root of the Database.
     * @return If a path is provided, a `Reference`
     *   pointing to the provided path. Otherwise, a `Reference` pointing to the
     *   root of the Database.
     */
    ref(path?: string): firebase.database.Reference;
    /**
     * Returns a `Reference` representing the location in the Database
     * corresponding to the provided Firebase URL.
     *
     * An exception is thrown if the URL is not a valid Firebase Database URL or it
     * has a different domain than the current `Database` instance.
     *
     * Note that all query parameters (`orderBy`, `limitToLast`, etc.) are ignored
     * and are not applied to the returned `Reference`.
     *
     * @example
     * ```javascript
     * // Get a reference to the root of the Database
     * var rootRef = firebase.database().ref("https://<DATABASE_NAME>.firebaseio.com");
     * ```
     *
     * @example
     * ```javascript
     * // Get a reference to the /users/ada node
     * var adaRef = firebase.database().ref("https://<DATABASE_NAME>.firebaseio.com/users/ada");
     * ```
     *
     * @param url The Firebase URL at which the returned `Reference` will
     *   point.
     * @return A `Reference` pointing to the provided
     *   Firebase URL.
     */
    refFromURL(url: string): firebase.database.Reference;
  }

  /**
   * The `onDisconnect` class allows you to write or clear data when your client
   * disconnects from the Database server. These updates occur whether your
   * client disconnects cleanly or not, so you can rely on them to clean up data
   * even if a connection is dropped or a client crashes.
   *
   * The `onDisconnect` class is most commonly used to manage presence in
   * applications where it is useful to detect how many clients are connected and
   * when other clients disconnect. See
   * {@link
   *   https://firebase.google.com/docs/database/web/offline-capabilities
   *   Enabling Offline Capabilities in JavaScript} for more information.
   *
   * To avoid problems when a connection is dropped before the requests can be
   * transferred to the Database server, these functions should be called before
   * writing any data.
   *
   * Note that `onDisconnect` operations are only triggered once. If you want an
   * operation to occur each time a disconnect occurs, you'll need to re-establish
   * the `onDisconnect` operations each time you reconnect.
   */
  interface OnDisconnect {
    /**
     * Cancels all previously queued `onDisconnect()` set or update events for this
     * location and all children.
     *
     * If a write has been queued for this location via a `set()` or `update()` at a
     * parent location, the write at this location will be canceled, though writes
     * to sibling locations will still occur.
     *
     * @example
     * ```javascript
     * var ref = firebase.database().ref("onlineState");
     * ref.onDisconnect().set(false);
     * // ... sometime later
     * ref.onDisconnect().cancel();
     * ```
     *
     * @param onComplete An optional callback function that will
     *   be called when synchronization to the server has completed. The callback
     *   will be passed a single parameter: null for success, or an Error object
     *   indicating a failure.
     * @return Resolves when synchronization to the server
     *   is complete.
     */
    cancel(onComplete?: (a: Error | null) => any): Promise<any>;
    /**
     * Ensures the data at this location is deleted when the client is disconnected
     * (due to closing the browser, navigating to a new page, or network issues).
     *
     * @param onComplete An optional callback function that will
     *   be called when synchronization to the server has completed. The callback
     *   will be passed a single parameter: null for success, or an Error object
     *   indicating a failure.
     * @return Resolves when synchronization to the server
     *   is complete.
     */
    remove(onComplete?: (a: Error | null) => any): Promise<any>;
    /**
     * Ensures the data at this location is set to the specified value when the
     * client is disconnected (due to closing the browser, navigating to a new page,
     * or network issues).
     *
     * `set()` is especially useful for implementing "presence" systems, where a
     * value should be changed or cleared when a user disconnects so that they
     * appear "offline" to other users. See
     * {@link
     *   https://firebase.google.com/docs/database/web/offline-capabilities
     *   Enabling Offline Capabilities in JavaScript} for more information.
     *
     * Note that `onDisconnect` operations are only triggered once. If you want an
     * operation to occur each time a disconnect occurs, you'll need to re-establish
     * the `onDisconnect` operations each time.
     *
     * @example
     * ```javascript
     * var ref = firebase.database().ref("users/ada/status");
     * ref.onDisconnect().set("I disconnected!");
     * ```
     *
     * @param value The value to be written to this location on
     *   disconnect (can be an object, array, string, number, boolean, or null).
     * @param onComplete An optional callback function that
     *   will be called when synchronization to the Database server has completed.
     *   The callback will be passed a single parameter: null for success, or an
     *   `Error` object indicating a failure.
     * @return Resolves when synchronization to the
     *   Database is complete.
     */
    set(value: any, onComplete?: (a: Error | null) => any): Promise<any>;
    /**
     * Ensures the data at this location is set to the specified value and priority
     * when the client is disconnected (due to closing the browser, navigating to a
     * new page, or network issues).
     */
    setWithPriority(
      value: any,
      priority: number | string | null,
      onComplete?: (a: Error | null) => any
    ): Promise<any>;
    /**
     * Writes multiple values at this location when the client is disconnected (due
     * to closing the browser, navigating to a new page, or network issues).
     *
     * The `values` argument contains multiple property-value pairs that will be
     * written to the Database together. Each child property can either be a simple
     * property (for example, "name") or a relative path (for example, "name/first")
     * from the current location to the data to update.
     *
     * As opposed to the `set()` method, `update()` can be use to selectively update
     * only the referenced properties at the current location (instead of replacing
     * all the child properties at the current location).
     *
     * See more examples using the connected version of
     * {@link firebase.database.Reference.update `update()`}.
     *
     * @example
     * ```javascript
     * var ref = firebase.database().ref("users/ada");
     * ref.update({
     *    onlineState: true,
     *    status: "I'm online."
     * });
     * ref.onDisconnect().update({
     *   onlineState: false,
     *   status: "I'm offline."
     * });
     * ```
     *
     * @param values Object containing multiple values.
     * @param onComplete An optional callback function that will
     *   be called when synchronization to the server has completed. The
     *   callback will be passed a single parameter: null for success, or an Error
     *   object indicating a failure.
     * @return Resolves when synchronization to the
     *   Database is complete.
     */
    update(values: Object, onComplete?: (a: Error | null) => any): Promise<any>;
  }

  type EventType =
    | 'value'
    | 'child_added'
    | 'child_changed'
    | 'child_moved'
    | 'child_removed';

  /**
   * A `Query` sorts and filters the data at a Database location so only a subset
   * of the child data is included. This can be used to order a collection of
   * data by some attribute (for example, height of dinosaurs) as well as to
   * restrict a large list of items (for example, chat messages) down to a number
   * suitable for synchronizing to the client. Queries are created by chaining
   * together one or more of the filter methods defined here.
   *
   * Just as with a `Reference`, you can receive data from a `Query` by using the
   * `on()` method. You will only receive events and `DataSnapshot`s for the
   * subset of the data that matches your query.
   *
   * Read our documentation on
   * {@link
   *  https://firebase.google.com/docs/database/web/lists-of-data#sorting_and_filtering_data
   *  Sorting and filtering data} for more information.
   */
  interface Query {
    /**
     * Creates a `Query` with the specified ending point.
     *
     * Using `startAt()`, `startAfter()`, `endBefore()`, `endAt()` and `equalTo()`
     * allows you to choose arbitrary starting and ending points for your queries.
     *
     * The ending point is inclusive, so children with exactly the specified value
     * will be included in the query. The optional key argument can be used to
     * further limit the range of the query. If it is specified, then children that
     * have exactly the specified value must also have a key name less than or equal
     * to the specified key.
     *
     * You can read more about `endAt()` in
     * {@link
     *  https://firebase.google.com/docs/database/web/lists-of-data#filtering_data
     *  Filtering data}.
     *
     * @example
     * ```javascript
     * // Find all dinosaurs whose names come before Pterodactyl lexicographically.
     * // Include Pterodactyl in the result.
     * var ref = firebase.database().ref("dinosaurs");
     * ref.orderByKey().endAt("pterodactyl").on("child_added", function(snapshot) {
     *   console.log(snapshot.key);
     * });
     * ```
     *
     * @param value The value to end at. The argument
     *   type depends on which `orderBy*()` function was used in this query.
     *   Specify a value that matches the `orderBy*()` type. When used in
     *   combination with `orderByKey()`, the value must be a string.
     * @param key The child key to end at, among the children with the
     *   previously specified priority. This argument is only allowed if ordering by
     *   child, value, or priority.
     */
    endAt(
      value: number | string | boolean | null,
      key?: string
    ): firebase.database.Query;
    /**
     * Creates a `Query` with the specified ending point (exclusive).
     *
     * Using `startAt()`, `startAfter()`, `endBefore()`, `endAt()` and `equalTo()`
     * allows you to choose arbitrary starting and ending points for your queries.
     *
     * The ending point is exclusive. If only a value is provided, children
     * with a value less than the specified value will be included in the query.
     * If a key is specified, then children must have a value lesss than or equal
     * to the specified value and a a key name less than the specified key.
     *
     * @example
     * ```javascript
     * // Find all dinosaurs whose names come before Pterodactyl lexicographically.
     * // Do not include Pterodactyl in the result.
     * var ref = firebase.database().ref("dinosaurs");
     * ref.orderByKey().endBefore("pterodactyl").on("child_added", function(snapshot) {
     *   console.log(snapshot.key);
     * });
     *
     * @param value The value to end before. The argument
     *   type depends on which `orderBy*()` function was used in this query.
     *   Specify a value that matches the `orderBy*()` type. When used in
     *   combination with `orderByKey()`, the value must be a string.
     * @param key The child key to end before, among the children with the
     *   previously specified priority. This argument is only allowed if ordering by
     *   child, value, or priority.
     */
    endBefore(
      value: number | string | boolean | null,
      key?: string
    ): firebase.database.Query;
    /**
     * Creates a `Query` that includes children that match the specified value.
     *
     * Using `startAt()`, `startAfter()`, `endBefore()`, `endAt()` and `equalTo()`
     * allows you to choose arbitrary starting and ending points for your queries.
     *
     * The optional key argument can be used to further limit the range of the
     * query. If it is specified, then children that have exactly the specified
     * value must also have exactly the specified key as their key name. This can be
     * used to filter result sets with many matches for the same value.
     *
     * You can read more about `equalTo()` in
     * {@link
     *  https://firebase.google.com/docs/database/web/lists-of-data#filtering_data
     *  Filtering data}.
     *
     * @example
     * ```javascript
     * // Find all dinosaurs whose height is exactly 25 meters.
     * var ref = firebase.database().ref("dinosaurs");
     * ref.orderByChild("height").equalTo(25).on("child_added", function(snapshot) {
     *   console.log(snapshot.key);
     * });
     * ```
     *
     * @param value The value to match for. The
     *   argument type depends on which `orderBy*()` function was used in this
     *   query. Specify a value that matches the `orderBy*()` type. When used in
     *   combination with `orderByKey()`, the value must be a string.
     * @param key The child key to start at, among the children with the
     *   previously specified priority. This argument is only allowed if ordering by
     *   child, value, or priority.
     */
    equalTo(
      value: number | string | boolean | null,
      key?: string
    ): firebase.database.Query;
    /**
     * Returns whether or not the current and provided queries represent the same
     * location, have the same query parameters, and are from the same instance of
     * `firebase.app.App`.
     *
     * Two `Reference` objects are equivalent if they represent the same location
     * and are from the same instance of `firebase.app.App`.
     *
     * Two `Query` objects are equivalent if they represent the same location, have
     * the same query parameters, and are from the same instance of
     * `firebase.app.App`. Equivalent queries share the same sort order, limits, and
     * starting and ending points.
     *
     * @example
     * ```javascript
     * var rootRef = firebase.database.ref();
     * var usersRef = rootRef.child("users");
     *
     * usersRef.isEqual(rootRef);  // false
     * usersRef.isEqual(rootRef.child("users"));  // true
     * usersRef.parent.isEqual(rootRef);  // true
     * ```
     *
     * @example
     * ```javascript
     * var rootRef = firebase.database.ref();
     * var usersRef = rootRef.child("users");
     * var usersQuery = usersRef.limitToLast(10);
     *
     * usersQuery.isEqual(usersRef);  // false
     * usersQuery.isEqual(usersRef.limitToLast(10));  // true
     * usersQuery.isEqual(rootRef.limitToLast(10));  // false
     * usersQuery.isEqual(usersRef.orderByKey().limitToLast(10));  // false
     * ```
     *
     * @param other The query to compare against.
     * @return Whether or not the current and provided queries are
     *   equivalent.
     */
    isEqual(other: firebase.database.Query | null): boolean;
    /**
     * Generates a new `Query` limited to the first specific number of children.
     *
     * The `limitToFirst()` method is used to set a maximum number of children to be
     * synced for a given callback. If we set a limit of 100, we will initially only
     * receive up to 100 `child_added` events. If we have fewer than 100 messages
     * stored in our Database, a `child_added` event will fire for each message.
     * However, if we have over 100 messages, we will only receive a `child_added`
     * event for the first 100 ordered messages. As items change, we will receive
     * `child_removed` events for each item that drops out of the active list so
     * that the total number stays at 100.
     *
     * You can read more about `limitToFirst()` in
     * {@link
     *  https://firebase.google.com/docs/database/web/lists-of-data#filtering_data
     *  Filtering data}.
     *
     * @example
     * ```javascript
     * // Find the two shortest dinosaurs.
     * var ref = firebase.database().ref("dinosaurs");
     * ref.orderByChild("height").limitToFirst(2).on("child_added", function(snapshot) {
     *   // This will be called exactly two times (unless there are less than two
     *   // dinosaurs in the Database).
     *
     *   // It will also get fired again if one of the first two dinosaurs is
     *   // removed from the data set, as a new dinosaur will now be the second
     *   // shortest.
     *   console.log(snapshot.key);
     * });
     * ```
     *
     * @param limit The maximum number of nodes to include in this query.
     */
    limitToFirst(limit: number): firebase.database.Query;
    /**
     * Generates a new `Query` object limited to the last specific number of
     * children.
     *
     * The `limitToLast()` method is used to set a maximum number of children to be
     * synced for a given callback. If we set a limit of 100, we will initially only
     * receive up to 100 `child_added` events. If we have fewer than 100 messages
     * stored in our Database, a `child_added` event will fire for each message.
     * However, if we have over 100 messages, we will only receive a `child_added`
     * event for the last 100 ordered messages. As items change, we will receive
     * `child_removed` events for each item that drops out of the active list so
     * that the total number stays at 100.
     *
     * You can read more about `limitToLast()` in
     * {@link
     *  https://firebase.google.com/docs/database/web/lists-of-data#filtering_data
     *  Filtering data}.
     *
     * @example
     * ```javascript
     * // Find the two heaviest dinosaurs.
     * var ref = firebase.database().ref("dinosaurs");
     * ref.orderByChild("weight").limitToLast(2).on("child_added", function(snapshot) {
     *   // This callback will be triggered exactly two times, unless there are
     *   // fewer than two dinosaurs stored in the Database. It will also get fired
     *   // for every new, heavier dinosaur that gets added to the data set.
     *   console.log(snapshot.key);
     * });
     * ```
     *
     * @param limit The maximum number of nodes to include in this query.
     */
    limitToLast(limit: number): firebase.database.Query;
    /**
     * Detaches a callback previously attached with `on()`.
     *
     * Detach a callback previously attached with `on()`. Note that if `on()` was
     * called multiple times with the same eventType and callback, the callback
     * will be called multiple times for each event, and `off()` must be called
     * multiple times to remove the callback. Calling `off()` on a parent listener
     * will not automatically remove listeners registered on child nodes, `off()`
     * must also be called on any child listeners to remove the callback.
     *
     * If a callback is not specified, all callbacks for the specified eventType
     * will be removed. Similarly, if no eventType is specified, all callbacks
     * for the `Reference` will be removed.
     *
     * @example
     * ```javascript
     * var onValueChange = function(dataSnapshot) {  ... };
     * ref.on('value', onValueChange);
     * ref.child('meta-data').on('child_added', onChildAdded);
     * // Sometime later...
     * ref.off('value', onValueChange);
     *
     * // You must also call off() for any child listeners on ref
     * // to cancel those callbacks
     * ref.child('meta-data').off('child_added', onValueAdded);
     * ```
     *
     * @example
     * ```javascript
     * // Or you can save a line of code by using an inline function
     * // and on()'s return value.
     * var onValueChange = ref.on('value', function(dataSnapshot) { ... });
     * // Sometime later...
     * ref.off('value', onValueChange);
     * ```
     *
     * @param eventType One of the following strings: "value",
     *   "child_added", "child_changed", "child_removed", or "child_moved." If
     *   omitted, all callbacks for the `Reference` will be removed.
     * @param callback The callback function that was passed to `on()` or
     *   `undefined` to remove all callbacks.
     * @param context The context that was passed to `on()`.
     */
    off(
      eventType?: EventType,
      callback?: (a: firebase.database.DataSnapshot, b?: string | null) => any,
      context?: Object | null
    ): void;

    /**
     * Gets the most up-to-date result for this query.
     *
     * @return A promise which resolves to the resulting DataSnapshot if
     * a value is available, or rejects if the client is unable to return
     * a value (e.g., if the server is unreachable and there is nothing
     * cached).
     */
    get(): Promise<DataSnapshot>;

    /**
     * Listens for data changes at a particular location.
     *
     * This is the primary way to read data from a Database. Your callback
     * will be triggered for the initial data and again whenever the data changes.
     * Use `off( )` to stop receiving updates. See
     * {@link https://firebase.google.com/docs/database/web/retrieve-data
     *   Retrieve Data on the Web}
     * for more details.
     *
     * <h4>value event</h4>
     *
     * This event will trigger once with the initial data stored at this location,
     * and then trigger again each time the data changes. The `DataSnapshot` passed
     * to the callback will be for the location at which `on()` was called. It
     * won't trigger until the entire contents has been synchronized. If the
     * location has no data, it will be triggered with an empty `DataSnapshot`
     * (`val()` will return `null`).
     *
     * <h4>child_added event</h4>
     *
     * This event will be triggered once for each initial child at this location,
     * and it will be triggered again every time a new child is added. The
     * `DataSnapshot` passed into the callback will reflect the data for the
     * relevant child. For ordering purposes, it is passed a second argument which
     * is a string containing the key of the previous sibling child by sort order,
     * or `null` if it is the first child.
     *
     * <h4>child_removed event</h4>
     *
     * This event will be triggered once every time a child is removed. The
     * `DataSnapshot` passed into the callback will be the old data for the child
     * that was removed. A child will get removed when either:
     *
     * - a client explicitly calls `remove()` on that child or one of its ancestors
     * - a client calls `set(null)` on that child or one of its ancestors
     * - that child has all of its children removed
     * - there is a query in effect which now filters out the child (because it's
     *   sort order changed or the max limit was hit)
     *
     * <h4>child_changed event</h4>
     *
     * This event will be triggered when the data stored in a child (or any of its
     * descendants) changes. Note that a single `child_changed` event may represent
     * multiple changes to the child. The `DataSnapshot` passed to the callback will
     * contain the new child contents. For ordering purposes, the callback is also
     * passed a second argument which is a string containing the key of the previous
     * sibling child by sort order, or `null` if it is the first child.
     *
     * <h4>child_moved event</h4>
     *
     * This event will be triggered when a child's sort order changes such that its
     * position relative to its siblings changes. The `DataSnapshot` passed to the
     * callback will be for the data of the child that has moved. It is also passed
     * a second argument which is a string containing the key of the previous
     * sibling child by sort order, or `null` if it is the first child.
     *
     * @example **Handle a new value:**
     * ```javascript
     * ref.on('value', function(dataSnapshot) {
     *   ...
     * });
     * ```
     *
     * @example **Handle a new child:**
     * ```javascript
     * ref.on('child_added', function(childSnapshot, prevChildKey) {
     *   ...
     * });
     * ```
     *
     * @example **Handle child removal:**
     * ```javascript
     * ref.on('child_removed', function(oldChildSnapshot) {
     *   ...
     * });
     * ```
     *
     * @example **Handle child data changes:**
     * ```javascript
     * ref.on('child_changed', function(childSnapshot, prevChildKey) {
     *   ...
     * });
     * ```
     *
     * @example **Handle child ordering changes:**
     * ```javascript
     * ref.on('child_moved', function(childSnapshot, prevChildKey) {
     *   ...
     * });
     * ```
     *
     * @param eventType One of the following strings: "value",
     *   "child_added", "child_changed", "child_removed", or "child_moved."
     * @param callback A
     *   callback that fires when the specified event occurs. The callback will be
     *   passed a DataSnapshot. For ordering purposes, "child_added",
     *   "child_changed", and "child_moved" will also be passed a string containing
     *   the key of the previous child, by sort order, or `null` if it is the
     *   first child.
     * @param cancelCallbackOrContext An optional
     *   callback that will be notified if your event subscription is ever canceled
     *   because your client does not have permission to read this data (or it had
     *   permission but has now lost it). This callback will be passed an `Error`
     *   object indicating why the failure occurred.
     * @param context If provided, this object will be used as `this`
     *   when calling your callback(s).
     * @return The provided
     *   callback function is returned unmodified. This is just for convenience if
     *   you want to pass an inline function to `on()` but store the callback
     *   function for later passing to `off()`.
     */
    on(
      eventType: EventType,
      callback: (a: firebase.database.DataSnapshot, b?: string | null) => any,
      cancelCallbackOrContext?: ((a: Error) => any) | Object | null,
      context?: Object | null
    ): (a: firebase.database.DataSnapshot | null, b?: string | null) => any;

    /**
     * Listens for exactly one event of the specified event type, and then stops
     * listening.
     *
     * This is equivalent to calling {@link firebase.database.Query.on `on()`}, and
     * then calling {@link firebase.database.Query.off `off()`} inside the callback
     * function. See {@link firebase.database.Query.on `on()`} for details on the
     * event types.
     *
     * @example
     * ```javascript
     * // Basic usage of .once() to read the data located at ref.
     * ref.once('value')
     *   .then(function(dataSnapshot) {
     *     // handle read data.
     *   });
     * ```
     *
     * @param eventType One of the following strings: "value",
     *   "child_added", "child_changed", "child_removed", or "child_moved."
     * @param successCallback A
     *   callback that fires when the specified event occurs. The callback will be
     *   passed a DataSnapshot. For ordering purposes, "child_added",
     *   "child_changed", and "child_moved" will also be passed a string containing
     *   the key of the previous child by sort order, or `null` if it is the
     *   first child.
     * @param failureCallbackOrContext An optional
     *   callback that will be notified if your client does not have permission to
     *   read the data. This callback will be passed an `Error` object indicating
     *   why the failure occurred.
     * @param context If provided, this object will be used as `this`
     *   when calling your callback(s).
     */
    once(
      eventType: EventType,
      successCallback?: (
        a: firebase.database.DataSnapshot,
        b?: string | null
      ) => any,
      failureCallbackOrContext?: ((a: Error) => void) | Object | null,
      context?: Object | null
    ): Promise<firebase.database.DataSnapshot>;
    /**
     * Generates a new `Query` object ordered by the specified child key.
     *
     * Queries can only order by one key at a time. Calling `orderByChild()`
     * multiple times on the same query is an error.
     *
     * Firebase queries allow you to order your data by any child key on the fly.
     * However, if you know in advance what your indexes will be, you can define
     * them via the .indexOn rule in your Security Rules for better performance. See
     * the {@link https://firebase.google.com/docs/database/security/indexing-data
     * .indexOn} rule for more information.
     *
     * You can read more about `orderByChild()` in
     * {@link
     *  https://firebase.google.com/docs/database/web/lists-of-data#sort_data
     *  Sort data}.
     *
     * @example
     * ```javascript
     * var ref = firebase.database().ref("dinosaurs");
     * ref.orderByChild("height").on("child_added", function(snapshot) {
     *   console.log(snapshot.key + " was " + snapshot.val().height + " m tall");
     * });
     * ```
     */
    orderByChild(path: string): firebase.database.Query;
    /**
     * Generates a new `Query` object ordered by key.
     *
     * Sorts the results of a query by their (ascending) key values.
     *
     * You can read more about `orderByKey()` in
     * {@link
     *  https://firebase.google.com/docs/database/web/lists-of-data#sort_data
     *  Sort data}.
     *
     * @example
     * ```javascript
     * var ref = firebase.database().ref("dinosaurs");
     * ref.orderByKey().on("child_added", function(snapshot) {
     *   console.log(snapshot.key);
     * });
     * ```
     */
    orderByKey(): firebase.database.Query;
    /**
     * Generates a new `Query` object ordered by priority.
     *
     * Applications need not use priority but can order collections by
     * ordinary properties (see
     * {@link
     *  https://firebase.google.com/docs/database/web/lists-of-data#sort_data
     *  Sort data} for alternatives to priority.
     */
    orderByPriority(): firebase.database.Query;
    /**
     * Generates a new `Query` object ordered by value.
     *
     * If the children of a query are all scalar values (string, number, or
     * boolean), you can order the results by their (ascending) values.
     *
     * You can read more about `orderByValue()` in
     * {@link
     *  https://firebase.google.com/docs/database/web/lists-of-data#sort_data
     *  Sort data}.
     *
     * @example
     * ```javascript
     * var scoresRef = firebase.database().ref("scores");
     * scoresRef.orderByValue().limitToLast(3).on("value", function(snapshot) {
     *   snapshot.forEach(function(data) {
     *     console.log("The " + data.key + " score is " + data.val());
     *   });
     * });
     * ```
     */
    orderByValue(): firebase.database.Query;
    /**
     * Returns a `Reference` to the `Query`'s location.
     */
    ref: firebase.database.Reference;
    /**
     * Creates a `Query` with the specified starting point.
     *
     * Using `startAt()`, `startAfter()`, `endBefore()`, `endAt()` and `equalTo()`
     * allows you to choose arbitrary starting and ending points for your queries.
     *
     * The starting point is inclusive, so children with exactly the specified value
     * will be included in the query. The optional key argument can be used to
     * further limit the range of the query. If it is specified, then children that
     * have exactly the specified value must also have a key name greater than or
     * equal to the specified key.
     *
     * You can read more about `startAt()` in
     * {@link
     *  https://firebase.google.com/docs/database/web/lists-of-data#filtering_data
     *  Filtering data}.
     *
     * @example
     * ```javascript
     * // Find all dinosaurs that are at least three meters tall.
     * var ref = firebase.database().ref("dinosaurs");
     * ref.orderByChild("height").startAt(3).on("child_added", function(snapshot) {
     *   console.log(snapshot.key)
     * });
     * ```
     *
     * @param value The value to start at. The argument
     *   type depends on which `orderBy*()` function was used in this query.
     *   Specify a value that matches the `orderBy*()` type. When used in
     *   combination with `orderByKey()`, the value must be a string.
     * @param key The child key to start at. This argument is only allowed
     *   if ordering by child, value, or priority.
     */
    startAt(
      value: number | string | boolean | null,
      key?: string
    ): firebase.database.Query;
    /**
     * Creates a `Query` with the specified starting point (exclusive).
     *
     * Using `startAt()`, `startAfter()`, `endBefore()`, `endAt()` and `equalTo()`
     * allows you to choose arbitrary starting and ending points for your queries.
     *
     * The starting point is exclusive. If only a value is provided, children
     * with a value greater than the specified value will be included in the query.
     * If a key is specified, then children must have a value greater than or equal
     * to the specified value and a a key name greater than the specified key.
     *
     * @example
     * ```javascript
     * // Find all dinosaurs that are more than three meters tall.
     * var ref = firebase.database().ref("dinosaurs");
     * ref.orderByChild("height").startAfter(3).on("child_added", function(snapshot) {
     *   console.log(snapshot.key)
     * });
     * ```
     *
     * @param value The value to start after. The argument
     *   type depends on which `orderBy*()` function was used in this query.
     *   Specify a value that matches the `orderBy*()` type. When used in
     *   combination with `orderByKey()`, the value must be a string.
     * @param key The child key to start after. This argument is only allowed
     *   if ordering by child, value, or priority.
     */
    startAfter(
      value: number | string | boolean | null,
      key?: string
    ): firebase.database.Query;
    /**
     * Returns a JSON-serializable representation of this object.
     *
     * @return A JSON-serializable representation of this object.
     */
    toJSON(): Object;
    /**
     * Gets the absolute URL for this location.
     *
     * The `toString()` method returns a URL that is ready to be put into a browser,
     * curl command, or a `firebase.database().refFromURL()` call. Since all of
     * those expect the URL to be url-encoded, `toString()` returns an encoded URL.
     *
     * Append '.json' to the returned URL when typed into a browser to download
     * JSON-formatted data. If the location is secured (that is, not publicly
     * readable), you will get a permission-denied error.
     *
     * @example
     * ```javascript
     * // Calling toString() on a root Firebase reference returns the URL where its
     * // data is stored within the Database:
     * var rootRef = firebase.database().ref();
     * var rootUrl = rootRef.toString();
     * // rootUrl === "https://sample-app.firebaseio.com/".
     *
     * // Calling toString() at a deeper Firebase reference returns the URL of that
     * // deep path within the Database:
     * var adaRef = rootRef.child('users/ada');
     * var adaURL = adaRef.toString();
     * // adaURL === "https://sample-app.firebaseio.com/users/ada".
     * ```
     *
     * @return The absolute URL for this location.
     */
    toString(): string;
  }

  /**
   * A `Reference` represents a specific location in your Database and can be used
   * for reading or writing data to that Database location.
   *
   * You can reference the root or child location in your Database by calling
   * `firebase.database().ref()` or `firebase.database().ref("child/path")`.
   *
   * Writing is done with the `set()` method and reading can be done with the
   * `on()` method. See
   * {@link
   *   https://firebase.google.com/docs/database/web/read-and-write
   *   Read and Write Data on the Web}
   */
  interface Reference extends firebase.database.Query {
    /**
     * Gets a `Reference` for the location at the specified relative path.
     *
     * The relative path can either be a simple child name (for example, "ada") or
     * a deeper slash-separated path (for example, "ada/name/first").
     *
     * @example
     * ```javascript
     * var usersRef = firebase.database().ref('users');
     * var adaRef = usersRef.child('ada');
     * var adaFirstNameRef = adaRef.child('name/first');
     * var path = adaFirstNameRef.toString();
     * // path is now 'https://sample-app.firebaseio.com/users/ada/name/first'
     * ```
     *
     * @param path A relative path from this location to the desired child
     *   location.
     * @return The specified child location.
     */
    child(path: string): firebase.database.Reference;
    /**
     * The last part of the `Reference`'s path.
     *
     * For example, `"ada"` is the key for
     * `https://<DATABASE_NAME>.firebaseio.com/users/ada`.
     *
     * The key of a root `Reference` is `null`.
     *
     * @example
     * ```javascript
     * // The key of a root reference is null
     * var rootRef = firebase.database().ref();
     * var key = rootRef.key;  // key === null
     * ```
     *
     * @example
     * ```javascript
     * // The key of any non-root reference is the last token in the path
     * var adaRef = firebase.database().ref("users/ada");
     * var key = adaRef.key;  // key === "ada"
     * key = adaRef.child("name/last").key;  // key === "last"
     * ```
     */
    key: string | null;
    /**
     * Returns an `OnDisconnect` object - see
     * {@link
     *   https://firebase.google.com/docs/database/web/offline-capabilities
     *   Enabling Offline Capabilities in JavaScript} for more information on how
     * to use it.
     */
    onDisconnect(): firebase.database.OnDisconnect;
    /**
     * The parent location of a `Reference`.
     *
     * The parent of a root `Reference` is `null`.
     *
     * @example
     * ```javascript
     * // The parent of a root reference is null
     * var rootRef = firebase.database().ref();
     * parent = rootRef.parent;  // parent === null
     * ```
     *
     * @example
     * ```javascript
     * // The parent of any non-root reference is the parent location
     * var usersRef = firebase.database().ref("users");
     * var adaRef = firebase.database().ref("users/ada");
     * // usersRef and adaRef.parent represent the same location
     * ```
     */
    parent: firebase.database.Reference | null;
    /**
     * Generates a new child location using a unique key and returns its
     * `Reference`.
     *
     * This is the most common pattern for adding data to a collection of items.
     *
     * If you provide a value to `push()`, the value is written to the
     * generated location. If you don't pass a value, nothing is written to the
     * database and the child remains empty (but you can use the `Reference`
     * elsewhere).
     *
     * The unique keys generated by `push()` are ordered by the current time, so the
     * resulting list of items is chronologically sorted. The keys are also
     * designed to be unguessable (they contain 72 random bits of entropy).
     *
     *
     * See
     * {@link
     *  https://firebase.google.com/docs/database/web/lists-of-data#append_to_a_list_of_data
     *  Append to a list of data}
     * </br>See
     * {@link
     *  https://firebase.googleblog.com/2015/02/the-2120-ways-to-ensure-unique_68.html
     *  The 2^120 Ways to Ensure Unique Identifiers}
     *
     * @example
     * ```javascript
     * var messageListRef = firebase.database().ref('message_list');
     * var newMessageRef = messageListRef.push();
     * newMessageRef.set({
     *   'user_id': 'ada',
     *   'text': 'The Analytical Engine weaves algebraical patterns just as the Jacquard loom weaves flowers and leaves.'
     * });
     * // We've appended a new message to the message_list location.
     * var path = newMessageRef.toString();
     * // path will be something like
     * // 'https://sample-app.firebaseio.com/message_list/-IKo28nwJLH0Nc5XeFmj'
     * ```
     *
     * @param value Optional value to be written at the generated location.
     * @param onComplete Callback called when write to server is
     *   complete.
     * @return Combined `Promise` and `Reference`; resolves when write is complete, but can be
     *   used immediately as the `Reference` to the child location.
     */
    push(
      value?: any,
      onComplete?: (a: Error | null) => any
    ): firebase.database.ThenableReference;
    /**
     * Removes the data at this Database location.
     *
     * Any data at child locations will also be deleted.
     *
     * The effect of the remove will be visible immediately and the corresponding
     * event 'value' will be triggered. Synchronization of the remove to the
     * Firebase servers will also be started, and the returned Promise will resolve
     * when complete. If provided, the onComplete callback will be called
     * asynchronously after synchronization has finished.
     *
     * @example
     * ```javascript
     * var adaRef = firebase.database().ref('users/ada');
     * adaRef.remove()
     *   .then(function() {
     *     console.log("Remove succeeded.")
     *   })
     *   .catch(function(error) {
     *     console.log("Remove failed: " + error.message)
     *   });
     * ```
     *
     * @param onComplete Callback called when write to server is
     *   complete.
     * @return Resolves when remove on server is complete.
     */
    remove(onComplete?: (a: Error | null) => any): Promise<any>;
    /**
     * The root `Reference` of the Database.
     *
     * @example
     * ```javascript
     * // The root of a root reference is itself
     * var rootRef = firebase.database().ref();
     * // rootRef and rootRef.root represent the same location
     * ```
     *
     * @example
     * ```javascript
     * // The root of any non-root reference is the root location
     * var adaRef = firebase.database().ref("users/ada");
     * // rootRef and adaRef.root represent the same location
     * ```
     */
    root: firebase.database.Reference;
    /**
     * Writes data to this Database location.
     *
     * This will overwrite any data at this location and all child locations.
     *
     * The effect of the write will be visible immediately, and the corresponding
     * events ("value", "child_added", etc.) will be triggered. Synchronization of
     * the data to the Firebase servers will also be started, and the returned
     * Promise will resolve when complete. If provided, the `onComplete` callback
     * will be called asynchronously after synchronization has finished.
     *
     * Passing `null` for the new value is equivalent to calling `remove()`; namely,
     * all data at this location and all child locations will be deleted.
     *
     * `set()` will remove any priority stored at this location, so if priority is
     * meant to be preserved, you need to use `setWithPriority()` instead.
     *
     * Note that modifying data with `set()` will cancel any pending transactions
     * at that location, so extreme care should be taken if mixing `set()` and
     * `transaction()` to modify the same data.
     *
     * A single `set()` will generate a single "value" event at the location where
     * the `set()` was performed.
     *
     * @example
     * ```javascript
     * var adaNameRef = firebase.database().ref('users/ada/name');
     * adaNameRef.child('first').set('Ada');
     * adaNameRef.child('last').set('Lovelace');
     * // We've written 'Ada' to the Database location storing Ada's first name,
     * // and 'Lovelace' to the location storing her last name.
     * ```
     *
     * @example
     * ```javascript
     * adaNameRef.set({ first: 'Ada', last: 'Lovelace' });
     * // Exact same effect as the previous example, except we've written
     * // Ada's first and last name simultaneously.
     * ```
     *
     * @example
     * ```javascript
     * adaNameRef.set({ first: 'Ada', last: 'Lovelace' })
     *   .then(function() {
     *     console.log('Synchronization succeeded');
     *   })
     *   .catch(function(error) {
     *     console.log('Synchronization failed');
     *   });
     * // Same as the previous example, except we will also log a message
     * // when the data has finished synchronizing.
     * ```
     *
     * @param value The value to be written (string, number, boolean, object,
     *   array, or null).
     * @param onComplete Callback called when write to server is
     *   complete.
     * @return Resolves when write to server is complete.
     */
    set(value: any, onComplete?: (a: Error | null) => any): Promise<any>;
    /**
     * Sets a priority for the data at this Database location.
     *
     * Applications need not use priority but can order collections by
     * ordinary properties (see
     * {@link
     *  https://firebase.google.com/docs/database/web/lists-of-data#sorting_and_filtering_data
     *  Sorting and filtering data}).
     */
    setPriority(
      priority: string | number | null,
      onComplete: (a: Error | null) => any
    ): Promise<any>;
    /**
     * Writes data the Database location. Like `set()` but also specifies the
     * priority for that data.
     *
     * Applications need not use priority but can order collections by
     * ordinary properties (see
     * {@link
     *  https://firebase.google.com/docs/database/web/lists-of-data#sorting_and_filtering_data
     *  Sorting and filtering data}).
     */
    setWithPriority(
      newVal: any,
      newPriority: string | number | null,
      onComplete?: (a: Error | null) => any
    ): Promise<any>;
    /**
     * Atomically modifies the data at this location.
     *
     * Atomically modify the data at this location. Unlike a normal `set()`, which
     * just overwrites the data regardless of its previous value, `transaction()` is
     * used to modify the existing value to a new value, ensuring there are no
     * conflicts with other clients writing to the same location at the same time.
     *
     * To accomplish this, you pass `transaction()` an update function which is used
     * to transform the current value into a new value. If another client writes to
     * the location before your new value is successfully written, your update
     * function will be called again with the new current value, and the write will
     * be retried. This will happen repeatedly until your write succeeds without
     * conflict or you abort the transaction by not returning a value from your
     * update function.
     *
     * Note: Modifying data with `set()` will cancel any pending transactions at
     * that location, so extreme care should be taken if mixing `set()` and
     * `transaction()` to update the same data.
     *
     * Note: When using transactions with Security and Firebase Rules in place, be
     * aware that a client needs `.read` access in addition to `.write` access in
     * order to perform a transaction. This is because the client-side nature of
     * transactions requires the client to read the data in order to transactionally
     * update it.
     *
     * @example
     * ```javascript
     * // Increment Ada's rank by 1.
     * var adaRankRef = firebase.database().ref('users/ada/rank');
     * adaRankRef.transaction(function(currentRank) {
     *   // If users/ada/rank has never been set, currentRank will be `null`.
     *   return currentRank + 1;
     * });
     * ```
     *
     * @example
     * ```javascript
     * // Try to create a user for ada, but only if the user id 'ada' isn't
     * // already taken
     * var adaRef = firebase.database().ref('users/ada');
     * adaRef.transaction(function(currentData) {
     *   if (currentData === null) {
     *     return { name: { first: 'Ada', last: 'Lovelace' } };
     *   } else {
     *     console.log('User ada already exists.');
     *     return; // Abort the transaction.
     *   }
     * }, function(error, committed, snapshot) {
     *   if (error) {
     *     console.log('Transaction failed abnormally!', error);
     *   } else if (!committed) {
     *     console.log('We aborted the transaction (because ada already exists).');
     *   } else {
     *     console.log('User ada added!');
     *   }
     *   console.log("Ada's data: ", snapshot.val());
     * });
     * ```
     *
     * @param transactionUpdate A developer-supplied function which
     *   will be passed the current data stored at this location (as a JavaScript
     *   object). The function should return the new value it would like written (as
     *   a JavaScript object). If `undefined` is returned (i.e. you return with no
     *   arguments) the transaction will be aborted and the data at this location
     *   will not be modified.
     * @param onComplete A callback
     *   function that will be called when the transaction completes. The callback
     *   is passed three arguments: a possibly-null `Error`, a `boolean` indicating
     *   whether the transaction was committed, and a `DataSnapshot` indicating the
     *   final result. If the transaction failed abnormally, the first argument will
     *   be an `Error` object indicating the failure cause. If the transaction
     *   finished normally, but no data was committed because no data was returned
     *   from `transactionUpdate`, then second argument will be false. If the
     *   transaction completed and committed data to Firebase, the second argument
     *   will be true. Regardless, the third argument will be a `DataSnapshot`
     *   containing the resulting data in this location.
     * @param applyLocally By default, events are raised each time the
     *   transaction update function runs. So if it is run multiple times, you may
     *   see intermediate states. You can set this to false to suppress these
     *   intermediate states and instead wait until the transaction has completed
     *   before events are raised.
     * @return Returns a Promise that can optionally be used instead of the onComplete
     *   callback to handle success and failure.
     */
    transaction(
      transactionUpdate: (a: any) => any,
      onComplete?: (
        a: Error | null,
        b: boolean,
        c: firebase.database.DataSnapshot | null
      ) => any,
      applyLocally?: boolean
    ): Promise<any>;
    /**
     * Writes multiple values to the Database at once.
     *
     * The `values` argument contains multiple property-value pairs that will be
     * written to the Database together. Each child property can either be a simple
     * property (for example, "name") or a relative path (for example,
     * "name/first") from the current location to the data to update.
     *
     * As opposed to the `set()` method, `update()` can be use to selectively update
     * only the referenced properties at the current location (instead of replacing
     * all the child properties at the current location).
     *
     * The effect of the write will be visible immediately, and the corresponding
     * events ('value', 'child_added', etc.) will be triggered. Synchronization of
     * the data to the Firebase servers will also be started, and the returned
     * Promise will resolve when complete. If provided, the `onComplete` callback
     * will be called asynchronously after synchronization has finished.
     *
     * A single `update()` will generate a single "value" event at the location
     * where the `update()` was performed, regardless of how many children were
     * modified.
     *
     * Note that modifying data with `update()` will cancel any pending
     * transactions at that location, so extreme care should be taken if mixing
     * `update()` and `transaction()` to modify the same data.
     *
     * Passing `null` to `update()` will remove the data at this location.
     *
     * See
     * {@link
     *  https://firebase.googleblog.com/2015/09/introducing-multi-location-updates-and_86.html
     *  Introducing multi-location updates and more}.
     *
     * @example
     * ```javascript
     * var adaNameRef = firebase.database().ref('users/ada/name');
     * // Modify the 'first' and 'last' properties, but leave other data at
     * // adaNameRef unchanged.
     * adaNameRef.update({ first: 'Ada', last: 'Lovelace' });
     * ```
     *
     * @param values Object containing multiple values.
     * @param onComplete Callback called when write to server is
     *   complete.
     * @return Resolves when update on server is complete.
     */
    update(values: Object, onComplete?: (a: Error | null) => any): Promise<any>;
  }

  interface ThenableReference
    extends firebase.database.Reference,
      Pick<Promise<Reference>, 'then' | 'catch'> {}

  /**
   * Logs debugging information to the console.
   *
   * @example
   * ```javascript
   * // Enable logging
   * firebase.database.enableLogging(true);
   * ```
   *
   * @example
   * ```javascript
   * // Disable logging
   * firebase.database.enableLogging(false);
   * ```
   *
   * @example
   * ```javascript
   * // Enable logging across page refreshes
   * firebase.database.enableLogging(true, true);
   * ```
   *
   * @example
   * ```javascript
   * // Provide custom logger which prefixes log statements with "[FIREBASE]"
   * firebase.database.enableLogging(function(message) {
   *   console.log("[FIREBASE]", message);
   * });
   * ```
   *
   * @param logger Enables logging if `true`;
   *   disables logging if `false`. You can also provide a custom logger function
   *   to control how things get logged.
   * @param persistent Remembers the logging state between page
   *   refreshes if `true`.
   */
  function enableLogging(
    logger?: boolean | ((a: string) => any),
    persistent?: boolean
  ): any;

  export type EmulatorMockTokenOptions = firebase.EmulatorMockTokenOptions;
}

declare namespace firebase.database.ServerValue {
  /**
   * A placeholder value for auto-populating the current timestamp (time
   * since the Unix epoch, in milliseconds) as determined by the Firebase
   * servers.
   *
   * @example
   * ```javascript
   * var sessionsRef = firebase.database().ref("sessions");
   * sessionsRef.push({
   *   startedAt: firebase.database.ServerValue.TIMESTAMP
   * });
   * ```
   */
  var TIMESTAMP: Object;

  /**
   * Returns a placeholder value that can be used to atomically increment the
   * current database value by the provided delta.
   *
   * @param delta the amount to modify the current value atomically.
   * @return a placeholder value for modifying data atomically server-side.
   */
  function increment(delta: number): Object;
}

/**
 * @webonly
 */
declare namespace firebase.messaging {
  /**
   * The Firebase Messaging service interface.
   *
   * Do not call this constructor directly. Instead, use
   * {@link firebase.messaging `firebase.messaging()`}.
   *
   * See {@link https://firebase.google.com/docs/cloud-messaging/js/client
   * Set Up a JavaScript Firebase Cloud Messaging Client App} for a full guide on how to use the
   * Firebase Messaging service.
   *
   */
  interface Messaging {
    /**
     * Deletes the registration token associated with this messaging instance and unsubscribes the
     * messaging instance from the push subscription.
     *
     * @return The promise resolves when the token has been successfully deleted.
     */
    deleteToken(): Promise<boolean>;

    /**
     * To forcibly stop a registration token from being used, delete it by calling this method.
     *
     * @param token The token to delete.
     * @return The promise resolves when the token has been successfully deleted.
     *
     * @deprecated Use deleteToken() instead.
     */
    deleteToken(token: string): Promise<boolean>;

    /**
     * Subscribes the messaging instance to push notifications. Returns an FCM registration token
     * that can be used to send push messages to that messaging instance.
     *
     * If a notification permission isn't already granted, this method asks the user for permission.
     * The returned promise rejects if the user does not allow the app to show notifications.
     *
     * @param options.vapidKey The public server key provided to push services. It is used to
     * authenticate the push subscribers to receive push messages only from sending servers that
     * hold the corresponding private key. If it is not provided, a default VAPID key is used. Note
     * that some push services (Chrome Push Service) require a non-default VAPID key. Therefore, it
     * is recommended to generate and import a VAPID key for your project with
     * {@link https://firebase.google.com/docs/cloud-messaging/js/client#configure_web_credentials_with_fcm Configure Web Credentials with FCM}.
     * See
     * {@link https://developers.google.com/web/fundamentals/push-notifications/web-push-protocol The Web Push Protocol}
     * for details on web push services.}
     *
     * @param options.serviceWorkerRegistration The service worker registration for receiving push
     * messaging. If the registration is not provided explicitly, you need to have a
     * `firebase-messaging-sw.js` at your root location. See
     * {@link https://firebase.google.com/docs/cloud-messaging/js/client#retrieve-the-current-registration-token Retrieve the current registration token}
     * for more details.
     *
     * @return The promise resolves with an FCM registration token.
     *
     */
    getToken(options?: {
      vapidKey?: string;
      serviceWorkerRegistration?: ServiceWorkerRegistration;
    }): Promise<string>;

    /**
     * When a push message is received and the user is currently on a page for your origin, the
     * message is passed to the page and an `onMessage()` event is dispatched with the payload of
     * the push message.
     *
     * @param
     *     nextOrObserver This function, or observer object with `next` defined,
     *     is called when a message is received and the user is currently viewing your page.
     * @return To stop listening for messages execute this returned function.
     */
    onMessage(
      nextOrObserver: firebase.NextFn<any> | firebase.Observer<any>,
      error?: firebase.ErrorFn,
      completed?: firebase.CompleteFn
    ): firebase.Unsubscribe;

    /**
     * Called when a message is received while the app is in the background. An app is considered to
     * be in the background if no active window is displayed.
     *
     * @param
     *     nextOrObserver This function, or observer object with `next` defined,
     *     is called when a message is received and the app is currently in the background.
     *
     * @return To stop listening for messages execute this returned function
     */
    onBackgroundMessage(
      nextOrObserver:
        | firebase.NextFn<MessagePayload>
        | firebase.Observer<MessagePayload>,
      error?: firebase.ErrorFn,
      completed?: firebase.CompleteFn
    ): firebase.Unsubscribe;

    /**
     * You should listen for token refreshes so your web app knows when FCM has invalidated your
     * existing token and you need to call `getToken()` to get a new token.
     *
     * @param
     *     nextOrObserver This function, or observer object with `next` defined,
     *     is called when a token refresh has occurred.
     * @return To stop listening for token refresh events execute this returned function.
     *
     * @deprecated There is no need to handle token rotation.
     */
    onTokenRefresh(
      nextOrObserver: firebase.NextFn<any> | firebase.Observer<any>,
      error?: firebase.ErrorFn,
      completed?: firebase.CompleteFn
    ): firebase.Unsubscribe;

    /**
     * Notification permissions are required to send a user push messages. Calling this method
     * displays the permission dialog to the user and resolves if the permission is granted. It is
     * not necessary to call this method, as `getToken()` will do this automatically if required.
     *
     * @return The promise resolves if permission is granted. Otherwise, the promise is rejected
     * with an error.
     *
     * @deprecated Use
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Notification/requestPermission Notification.requestPermission()}
     * instead.
     */
    requestPermission(): Promise<void>;

    /**
     * FCM directs push messages to your web page's `onMessage()` callback if the user currently has
     * it open. Otherwise, it calls your callback passed into `setBackgroundMessageHandler()`.
     *
     * Your callback should return a promise that, once resolved, has shown a notification.
     *
     * @param callback The function to handle the push message.
     *
     * @deprecated Use onBackgroundMessage(nextOrObserver: firebase.NextFn<MessagePayload> |
     * firebase.Observer<MessagePayload>, error?: firebase.ErrorFn, completed?: firebase.CompleteFn):
     * firebase.Unsubscribe.
     */
    setBackgroundMessageHandler(
      callback: (payload: any) => Promise<any> | void
    ): void;

    /**
     * To use your own service worker for receiving push messages, you can pass in your service
     * worker registration in this method.
     *
     * @param registration The service worker registration you wish to use for push messaging.
     *
     * @deprecated Use getToken(options?: {vapidKey?: string; serviceWorkerRegistration?:
     * ServiceWorkerRegistration;}: Promise<string>;.
     */

    useServiceWorker(registration: ServiceWorkerRegistration): void;

    /**
     * @deprecated Use getToken(options?: {vapidKey?: string; serviceWorkerRegistration?:
     * ServiceWorkerRegistration;}): Promise<string>;.
     */
    usePublicVapidKey(b64PublicKey: string): void;
  }

  /**
   * Message payload that contains the notification payload that is represented with
   * {@link firebase.messaging.NotificationPayload} and the data payload that contains an arbitrary
   * number of key-value pairs sent by developers through the
   * {@link https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages#notification Send API}
   */
  export interface MessagePayload {
    /**
     * See {@link firebase.messaging.NotificationPayload}.
     */
    notification?: NotificationPayload;

    /**
     * Arbitrary key/value pairs.
     */
    data?: { [key: string]: string };

    /**
     * See {@link firebase.messaging.FcmOptions}.
     */
    fcmOptions?: FcmOptions;

    /**
     * The sender of this message.
     */
    from: string;

    /**
     * The collapse key of this message. See
     * {@link https://firebase.google.com/docs/cloud-messaging/concept-options#collapsible_and_non-collapsible_messages
     * Collapsible and non-collapsible messages}.
     */
    collapseKey: string;
  }

  /**
   * Options for features provided by the FCM SDK for Web. See
   * {@link https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages#webpushfcmoptions
   * WebpushFcmOptions}.
   */
  export interface FcmOptions {
    /**
     * The link to open when the user clicks on the notification. For all URL values, HTTPS is
     * required. For example, by setting this value to your app's URL, a notification click event
     * will put your app in focus for the user.
     */
    link?: string;

    /**
     * Label associated with the message's analytics data. See
     * {@link https://firebase.google.com/docs/cloud-messaging/understand-delivery#adding-analytics-labels-to-messages
     * Adding analytics labels}.
     */
    analyticsLabel?: string;
  }

  /**
   * Parameters that define how a push notification is displayed to users.
   */
  export interface NotificationPayload {
    /**
     * The title of a notification.
     */
    title?: string;

    /**
     * The body of a notification.
     */
    body?: string;

    /**
     * The URL of the image that is shown with the notification. See
     * {@link https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages#notification
     * `notification.image`} for supported image format.
     */
    image?: string;
  }

  function isSupported(): boolean;
}

declare namespace firebase.storage {
  /**
   * The full set of object metadata, including read-only properties.
   */
  interface FullMetadata extends firebase.storage.UploadMetadata {
    /**
     * The bucket this object is contained in.
     */
    bucket: string;
    /**
     * @deprecated
     * Use Reference.getDownloadURL instead. This property will be removed in a
     * future release.
     */
    downloadURLs: string[];
    /**
     * The full path of this object.
     */
    fullPath: string;
    /**
     * The object's generation.
     * @see {@link https://cloud.google.com/storage/docs/generations-preconditions}
     */
    generation: string;
    /**
     * The object's metageneration.
     * @see {@link https://cloud.google.com/storage/docs/generations-preconditions}
     */
    metageneration: string;
    /**
     * The short name of this object, which is the last component of the full path.
     * For example, if fullPath is 'full/path/image.png', name is 'image.png'.
     */
    name: string;
    /**
     * The size of this object, in bytes.
     */
    size: number;
    /**
     * A date string representing when this object was created.
     */
    timeCreated: string;
    /**
     * A date string representing when this object was last updated.
     */
    updated: string;
  }

  /**
   * Represents a reference to a Google Cloud Storage object. Developers can
   * upload, download, and delete objects, as well as get/set object metadata.
   */
  interface Reference {
    /**
     * The name of the bucket containing this reference's object.
     */
    bucket: string;
    /**
     * Returns a reference to a relative path from this reference.
     * @param path The relative path from this reference.
     *     Leading, trailing, and consecutive slashes are removed.
     * @return The reference to the given path.
     */
    child(path: string): firebase.storage.Reference;
    /**
     * Deletes the object at this reference's location.
     * @return A Promise that resolves if the deletion
     *     succeeded and rejects if it failed, including if the object didn't exist.
     */
    delete(): Promise<any>;
    /**
     * The full path of this object.
     */
    fullPath: string;
    /**
     * Fetches a long lived download URL for this object.
     * @return A Promise that resolves with the download
     *     URL or rejects if the fetch failed, including if the object did not
     *     exist.
     */
    getDownloadURL(): Promise<any>;
    /**
     * Fetches metadata for the object at this location, if one exists.
     * @return A Promise that
     *     resolves with the metadata, or rejects if the fetch failed, including if
     *     the object did not exist.
     */
    getMetadata(): Promise<any>;
    /**
     * The short name of this object, which is the last component of the full path.
     * For example, if fullPath is 'full/path/image.png', name is 'image.png'.
     */
    name: string;
    /**
     * A reference pointing to the parent location of this reference, or null if
     * this reference is the root.
     */
    parent: firebase.storage.Reference | null;
    /**
     * Uploads data to this reference's location.
     * @param data The data to upload.
     * @param metadata Metadata for the newly
     *     uploaded object.
     * @return An object that can be used to monitor
     *     and manage the upload.
     */
    put(
      data: Blob | Uint8Array | ArrayBuffer,
      metadata?: firebase.storage.UploadMetadata
    ): firebase.storage.UploadTask;
    /**
     * Uploads string data to this reference's location.
     * @param data The string to upload.
     * @param format The format of the string to
     *     upload.
     * @param metadata Metadata for the newly
     *     uploaded object.
     * @throws If the format is not an allowed format, or if the given string
     *     doesn't conform to the specified format.
     */
    putString(
      data: string,
      format?: firebase.storage.StringFormat,
      metadata?: firebase.storage.UploadMetadata
    ): firebase.storage.UploadTask;
    /**
     * A reference to the root of this reference's bucket.
     */
    root: firebase.storage.Reference;
    /**
     * The storage service associated with this reference.
     */
    storage: firebase.storage.Storage;
    /**
     * Returns a gs:// URL for this object in the form
     *   `gs://<bucket>/<path>/<to>/<object>`
     * @return The gs:// URL.
     */
    toString(): string;
    /**
     * Updates the metadata for the object at this location, if one exists.
     * @param metadata The new metadata.
     *     Setting a property to 'null' removes it on the server, while leaving
     *     a property as 'undefined' has no effect.
     * @return A Promise that
     *     resolves with the full updated metadata or rejects if the updated failed,
     *     including if the object did not exist.
     */
    updateMetadata(metadata: firebase.storage.SettableMetadata): Promise<any>;
    /**
     * List all items (files) and prefixes (folders) under this storage reference.
     *
     * This is a helper method for calling `list()` repeatedly until there are
     * no more results. The default pagination size is 1000.
     *
     * Note: The results may not be consistent if objects are changed while this
     * operation is running.
     *
     * Warning: `listAll` may potentially consume too many resources if there are
     * too many results.
     *
     * @return A Promise that resolves with all the items and prefixes under
     *      the current storage reference. `prefixes` contains references to
     *      sub-directories and `items` contains references to objects in this
     *      folder. `nextPageToken` is never returned.
     */
    listAll(): Promise<ListResult>;
    /**
     * List items (files) and prefixes (folders) under this storage reference.
     *
     * List API is only available for Firebase Rules Version 2.
     *
     * GCS is a key-blob store. Firebase Storage imposes the semantic of '/'
     * delimited folder structure.
     * Refer to GCS's List API if you want to learn more.
     *
     * To adhere to Firebase Rules's Semantics, Firebase Storage does not
     * support objects whose paths end with "/" or contain two consecutive
     * "/"s. Firebase Storage List API will filter these unsupported objects.
     * `list()` may fail if there are too many unsupported objects in the bucket.
     *
     * @param options See `ListOptions` for details.
     * @return A Promise that resolves with the items and prefixes.
     *      `prefixes` contains references to sub-folders and `items`
     *      contains references to objects in this folder. `nextPageToken`
     *      can be used to get the rest of the results.
     */
    list(options?: ListOptions): Promise<ListResult>;
  }

  /**
   * Result returned by list().
   */
  interface ListResult {
    /**
     * References to prefixes (sub-folders). You can call list() on them to
     * get its contents.
     *
     * Folders are implicit based on '/' in the object paths.
     * For example, if a bucket has two objects '/a/b/1' and '/a/b/2', list('/a')
     * will return '/a/b' as a prefix.
     */
    prefixes: Reference[];
    /**
     * Objects in this directory.
     * You can call getMetadata() and getDownloadUrl() on them.
     */
    items: Reference[];
    /**
     * If set, there might be more results for this list. Use this token to resume the list.
     */
    nextPageToken: string | null;
  }

  /**
   * The options `list()` accepts.
   */
  interface ListOptions {
    /**
     * If set, limits the total number of `prefixes` and `items` to return.
     * The default and maximum maxResults is 1000.
     */
    maxResults?: number | null;
    /**
     * The `nextPageToken` from a previous call to `list()`. If provided,
     * listing is resumed from the previous position.
     */
    pageToken?: string | null;
  }

  /**
   * Object metadata that can be set at any time.
   */
  interface SettableMetadata {
    /**
     * Served as the 'Cache-Control' header on object download.
     */
    cacheControl?: string | null;
    contentDisposition?: string | null;
    /**
     * Served as the 'Content-Encoding' header on object download.
     */
    contentEncoding?: string | null;
    /**
     * Served as the 'Content-Language' header on object download.
     */
    contentLanguage?: string | null;
    /**
     * Served as the 'Content-Type' header on object download.
     */
    contentType?: string | null;
    /**
     * Additional user-defined custom metadata.
     */
    customMetadata?: {
      [/* warning: coerced from ? */ key: string]: string;
    } | null;
  }

  /**
   * The Firebase Storage service interface.
   *
   * Do not call this constructor directly. Instead, use
   * {@link firebase.storage `firebase.storage()`}.
   *
   * See
   * {@link
   *   https://firebase.google.com/docs/storage/web/start/
   *   Get Started on Web}
   * for a full guide on how to use the Firebase Storage service.
   */
  interface Storage {
    /**
     * The {@link firebase.app.App app} associated with the `Storage` service
     * instance.
     *
     * @example
     * ```javascript
     * var app = storage.app;
     * ```
     */
    app: firebase.app.App;
    /**
     * The maximum time to retry operations other than uploads or downloads in
     * milliseconds.
     */
    maxOperationRetryTime: number;
    /**
     * The maximum time to retry uploads in milliseconds.
     */
    maxUploadRetryTime: number;
    /**
     * Returns a reference for the given path in the default bucket.
     * @param path A relative path to initialize the reference with,
     *     for example `path/to/image.jpg`. If not passed, the returned reference
     *     points to the bucket root.
     * @return A reference for the given path.
     */
    ref(path?: string): firebase.storage.Reference;
    /**
     * Returns a reference for the given absolute URL.
     * @param url A URL in the form: <br />
     *     1) a gs:// URL, for example `gs://bucket/files/image.png` <br />
     *     2) a download URL taken from object metadata. <br />
     *     @see {@link firebase.storage.FullMetadata.downloadURLs}
     * @return A reference for the given URL.
     */
    refFromURL(url: string): firebase.storage.Reference;
    /**
     * @param time The new maximum operation retry time in milliseconds.
     * @see {@link firebase.storage.Storage.maxOperationRetryTime}
     */
    setMaxOperationRetryTime(time: number): any;
    /**
     * @param time The new maximum upload retry time in milliseconds.
     * @see {@link firebase.storage.Storage.maxUploadRetryTime}
     */
    setMaxUploadRetryTime(time: number): any;
    /**
     * Modify this `Storage` instance to communicate with the Cloud Storage emulator.
     *
     * @param host - The emulator host (ex: localhost)
     * @param port - The emulator port (ex: 5001)
     * @param options.mockUserToken the mock auth token to use for unit testing Security Rules
     */
    useEmulator(
      host: string,
      port: number,
      options?: {
        mockUserToken?: EmulatorMockTokenOptions | string;
      }
    ): void;
  }

  /**
   * @enum {string}
   * An enumeration of the possible string formats for upload.
   */
  type StringFormat = string;
  var StringFormat: {
    /**
     * Indicates the string should be interpreted as base64-encoded data.
     * Padding characters (trailing '='s) are optional.
     * Example: The string 'rWmO++E6t7/rlw==' becomes the byte sequence
     * ad 69 8e fb e1 3a b7 bf eb 97
     */
    BASE64: StringFormat;
    /**
     * Indicates the string should be interpreted as base64url-encoded data.
     * Padding characters (trailing '='s) are optional.
     * Example: The string 'rWmO--E6t7_rlw==' becomes the byte sequence
     * ad 69 8e fb e1 3a b7 bf eb 97
     */
    BASE64URL: StringFormat;
    /**
     * Indicates the string is a data URL, such as one obtained from
     * canvas.toDataURL().
     * Example: the string 'data:application/octet-stream;base64,aaaa'
     * becomes the byte sequence
     * 69 a6 9a
     * (the content-type "application/octet-stream" is also applied, but can
     * be overridden in the metadata object).
     */
    DATA_URL: StringFormat;
    /**
     * Indicates the string should be interpreted "raw", that is, as normal text.
     * The string will be interpreted as UTF-16, then uploaded as a UTF-8 byte
     * sequence.
     * Example: The string 'Hello! \ud83d\ude0a' becomes the byte sequence
     * 48 65 6c 6c 6f 21 20 f0 9f 98 8a
     */
    RAW: StringFormat;
  };

  /**
   * An event that is triggered on a task.
   * @enum {string}
   * @see {@link firebase.storage.UploadTask.on}
   */
  type TaskEvent = string;
  var TaskEvent: {
    /**
     * For this event,
     * <ul>
     *   <li>The `next` function is triggered on progress updates and when the
     *       task is paused/resumed with a
     *       {@link firebase.storage.UploadTaskSnapshot} as the first
     *       argument.</li>
     *   <li>The `error` function is triggered if the upload is canceled or fails
     *       for another reason.</li>
     *   <li>The `complete` function is triggered if the upload completes
     *       successfully.</li>
     * </ul>
     */
    STATE_CHANGED: TaskEvent;
  };

  /**
   * Represents the current state of a running upload.
   * @enum {string}
   */
  type TaskState = string;
  var TaskState: {
    CANCELED: TaskState;
    ERROR: TaskState;
    PAUSED: TaskState;
    RUNNING: TaskState;
    SUCCESS: TaskState;
  };

  /**
   * Object metadata that can be set at upload.
   */
  interface UploadMetadata extends firebase.storage.SettableMetadata {
    /**
     * A Base64-encoded MD5 hash of the object being uploaded.
     */
    md5Hash?: string | null;
  }

  /**
   * An error returned by the Firebase Storage SDK.
   */
  interface FirebaseStorageError extends FirebaseError {
    serverResponse: string | null;
  }

  interface StorageObserver<T> {
    next?: NextFn<T> | null;
    error?: (error: FirebaseStorageError) => void | null;
    complete?: CompleteFn | null;
  }

  /**
   * Represents the process of uploading an object. Allows you to monitor and
   * manage the upload.
   */
  interface UploadTask {
    /**
     * Cancels a running task. Has no effect on a complete or failed task.
     * @return True if the cancel had an effect.
     */
    cancel(): boolean;
    /**
     * Equivalent to calling `then(null, onRejected)`.
     */
    catch(onRejected: (error: FirebaseStorageError) => any): Promise<any>;
    /**
     * Listens for events on this task.
     *
     * Events have three callback functions (referred to as `next`, `error`, and
     * `complete`).
     *
     * If only the event is passed, a function that can be used to register the
     * callbacks is returned. Otherwise, the callbacks are passed after the event.
     *
     * Callbacks can be passed either as three separate arguments <em>or</em> as the
     * `next`, `error`, and `complete` properties of an object. Any of the three
     * callbacks is optional, as long as at least one is specified. In addition,
     * when you add your callbacks, you get a function back. You can call this
     * function to unregister the associated callbacks.
     *
     * @example **Pass callbacks separately or in an object.**
     * ```javascript
     * var next = function(snapshot) {};
     * var error = function(error) {};
     * var complete = function() {};
     *
     * // The first example.
     * uploadTask.on(
     *     firebase.storage.TaskEvent.STATE_CHANGED,
     *     next,
     *     error,
     *     complete);
     *
     * // This is equivalent to the first example.
     * uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, {
     *   'next': next,
     *   'error': error,
     *   'complete': complete
     * });
     *
     * // This is equivalent to the first example.
     * var subscribe = uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED);
     * subscribe(next, error, complete);
     *
     * // This is equivalent to the first example.
     * var subscribe = uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED);
     * subscribe({
     *   'next': next,
     *   'error': error,
     *   'complete': complete
     * });
     * ```
     *
     * @example **Any callback is optional.**
     * ```javascript
     * // Just listening for completion, this is legal.
     * uploadTask.on(
     *     firebase.storage.TaskEvent.STATE_CHANGED,
     *     null,
     *     null,
     *     function() {
     *       console.log('upload complete!');
     *     });
     *
     * // Just listening for progress/state changes, this is legal.
     * uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function(snapshot) {
     *   var percent = snapshot.bytesTransferred / snapshot.totalBytes * 100;
     *   console.log(percent + "% done");
     * });
     *
     * // This is also legal.
     * uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, {
     *   'complete': function() {
     *     console.log('upload complete!');
     *   }
     * });
     * ```
     *
     * @example **Use the returned function to remove callbacks.**
     * ```javascript
     * var unsubscribe = uploadTask.on(
     *     firebase.storage.TaskEvent.STATE_CHANGED,
     *     function(snapshot) {
     *       var percent = snapshot.bytesTransferred / snapshot.totalBytes * 100;
     *       console.log(percent + "% done");
     *       // Stop after receiving one update.
     *       unsubscribe();
     *     });
     *
     * // This code is equivalent to the above.
     * var handle = uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED);
     * unsubscribe = handle(function(snapshot) {
     *   var percent = snapshot.bytesTransferred / snapshot.totalBytes * 100;
     *   console.log(percent + "% done");
     *   // Stop after receiving one update.
     *   unsubscribe();
     * });
     * ```
     *
     * @param event The event to listen for.
     * @param nextOrObserver
     *     The `next` function, which gets called for each item in
     *     the event stream, or an observer object with some or all of these three
     *     properties (`next`, `error`, `complete`).
     * @param error A function that gets called with a `FirebaseStorageError`
     *     if the event stream ends due to an error.
     * @param complete A function that gets called if the
     *     event stream ends normally.
     * @return
     *     If only the event argument is passed, returns a function you can use to
     *     add callbacks (see the examples above). If more than just the event
     *     argument is passed, returns a function you can call to unregister the
     *     callbacks.
     */
    on(
      event: firebase.storage.TaskEvent,
      nextOrObserver?:
        | StorageObserver<UploadTaskSnapshot>
        | null
        | ((snapshot: UploadTaskSnapshot) => any),
      error?: ((error: FirebaseStorageError) => any) | null,
      complete?: firebase.Unsubscribe | null
    ): Function;
    /**
     * Pauses a running task. Has no effect on a paused or failed task.
     * @return True if the pause had an effect.
     */
    pause(): boolean;
    /**
     * Resumes a paused task. Has no effect on a running or failed task.
     * @return True if the resume had an effect.
     */
    resume(): boolean;
    /**
     * A snapshot of the current task state.
     */
    snapshot: firebase.storage.UploadTaskSnapshot;
    /**
     * This object behaves like a Promise, and resolves with its snapshot data when
     * the upload completes.
     * @param onFulfilled
     *     The fulfillment callback. Promise chaining works as normal.
     * @param onRejected The rejection callback.
     */
    then(
      onFulfilled?:
        | ((snapshot: firebase.storage.UploadTaskSnapshot) => any)
        | null,
      onRejected?: ((error: FirebaseStorageError) => any) | null
    ): Promise<any>;
  }

  /**
   * Holds data about the current state of the upload task.
   */
  interface UploadTaskSnapshot {
    /**
     * The number of bytes that have been successfully uploaded so far.
     */
    bytesTransferred: number;
    /**
     * @deprecated
     * Use Reference.getDownloadURL instead. This property will be removed in a
     * future release.
     */
    downloadURL: string | null;
    /**
     * Before the upload completes, contains the metadata sent to the server.
     * After the upload completes, contains the metadata sent back from the server.
     */
    metadata: firebase.storage.FullMetadata;
    /**
     * The reference that spawned this snapshot's upload task.
     */
    ref: firebase.storage.Reference;
    /**
     * The current state of the task.
     */
    state: firebase.storage.TaskState;
    /**
     * The task of which this is a snapshot.
     */
    task: firebase.storage.UploadTask;
    /**
     * The total number of bytes to be uploaded.
     */
    totalBytes: number;
  }
}

declare namespace firebase.firestore {
  /**
   * Document data (for use with `DocumentReference.set()`) consists of fields
   * mapped to values.
   */
  export type DocumentData = { [field: string]: any };

  /**
   * Update data (for use with `DocumentReference.update()`) consists of field
   * paths (e.g. 'foo' or 'foo.baz') mapped to values. Fields that contain dots
   * reference nested fields within the document.
   */
  export type UpdateData = { [fieldPath: string]: any };

  /**
   * Constant used to indicate the LRU garbage collection should be disabled.
   * Set this value as the `cacheSizeBytes` on the settings passed to the
   * `Firestore` instance.
   */
  export const CACHE_SIZE_UNLIMITED: number;

  /**
   * Specifies custom configurations for your Cloud Firestore instance.
   * You must set these before invoking any other methods.
   */
  export interface Settings {
    /** The hostname to connect to. */
    host?: string;
    /** Whether to use SSL when connecting. */
    ssl?: boolean;

    /**
     * An approximate cache size threshold for the on-disk data. If the cache grows beyond this
     * size, Firestore will start removing data that hasn't been recently used. The size is not a
     * guarantee that the cache will stay below that size, only that if the cache exceeds the given
     * size, cleanup will be attempted.
     *
     * The default value is 40 MB. The threshold must be set to at least 1 MB, and can be set to
     * CACHE_SIZE_UNLIMITED to disable garbage collection.
     */
    cacheSizeBytes?: number;

    /**
     * Forces the SDK’s underlying network transport (WebChannel) to use
     * long-polling. Each response from the backend will be closed immediately
     * after the backend sends data (by default responses are kept open in
     * case the backend has more data to send). This avoids incompatibility
     * issues with certain proxies, antivirus software, etc. that incorrectly
     * buffer traffic indefinitely. Use of this option will cause some
     * performance degradation though.
     *
     * This setting cannot be used with `experimentalAutoDetectLongPolling` and
     * may be removed in a future release. If you find yourself using it to
     * work around a specific network reliability issue, please tell us about
     * it in https://github.com/firebase/firebase-js-sdk/issues/1674.
     *
     * @webonly
     */
    experimentalForceLongPolling?: boolean;

    /**
     * Configures the SDK's underlying transport (WebChannel) to automatically detect if
     * long-polling should be used. This is very similar to `experimentalForceLongPolling`,
     * but only uses long-polling if required.
     *
     * This setting will likely be enabled by default in future releases and cannot be
     * combined with `experimentalForceLongPolling`.
     *
     * @webonly
     */
    experimentalAutoDetectLongPolling?: boolean;

    /**
     * Whether to skip nested properties that are set to `undefined` during
     * object serialization. If set to `true`, these properties are skipped
     * and not written to Firestore. If set to `false` or omitted, the SDK
     * throws an exception when it encounters properties of type `undefined`.
     */
    ignoreUndefinedProperties?: boolean;

    /**
     * Whether to merge the provided settings with the existing settings. If
     * set to `true`, the settings are merged with existing settings. If
     * set to `false` or left unset, the settings replace the existing
     * settings.
     */
    merge?: boolean;
  }

  /**
   * Settings that can be passed to Firestore.enablePersistence() to configure
   * Firestore persistence.
   */
  export interface PersistenceSettings {
    /**
     * Whether to synchronize the in-memory state of multiple tabs. Setting this
     * to `true` in all open tabs enables shared access to local persistence,
     * shared execution of queries and latency-compensated local document updates
     * across all connected instances.
     *
     * To enable this mode, `synchronizeTabs:true` needs to be set globally in all
     * active tabs. If omitted or set to 'false', `enablePersistence()` will fail
     * in all but the first tab.
     */
    synchronizeTabs?: boolean;

    /**
     * Whether to force enable persistence for the client. This cannot be used
     * with `synchronizeTabs:true` and is primarily intended for use with Web
     * Workers. Setting this to `true` will enable persistence, but cause other
     * tabs using persistence to fail.
     *
     * This setting may be removed in a future release. If you find yourself
     * using it for a specific use case or run into any issues, please tell us
     * about it in
     * https://github.com/firebase/firebase-js-sdk/issues/983.
     */
    experimentalForceOwningTab?: boolean;
  }

  export type LogLevel = 'debug' | 'error' | 'silent';

  /**
   * Sets the verbosity of Cloud Firestore logs (debug, error, or silent).
   *
   * @param logLevel
   *   The verbosity you set for activity and error logging. Can be any of
   *   the following values:
   *
   *   <ul>
   *     <li><code>debug</code> for the most verbose logging level, primarily for
   *     debugging.</li>
   *     <li><code>error</code> to log errors only.</li>
   *     <li><code>silent</code> to turn off logging.</li>
   *   </ul>
   */
  export function setLogLevel(logLevel: LogLevel): void;

  /**
   * Converter used by `withConverter()` to transform user objects of type T
   * into Firestore data.
   *
   * Using the converter allows you to specify generic type arguments when
   * storing and retrieving objects from Firestore.
   *
   * @example
   * ```typescript
   * class Post {
   *   constructor(readonly title: string, readonly author: string) {}
   *
   *   toString(): string {
   *     return this.title + ', by ' + this.author;
   *   }
   * }
   *
   * const postConverter = {
   *   toFirestore(post: Post): firebase.firestore.DocumentData {
   *     return {title: post.title, author: post.author};
   *   },
   *   fromFirestore(
   *     snapshot: firebase.firestore.QueryDocumentSnapshot,
   *     options: firebase.firestore.SnapshotOptions
   *   ): Post {
   *     const data = snapshot.data(options)!;
   *     return new Post(data.title, data.author);
   *   }
   * };
   *
   * const postSnap = await firebase.firestore()
   *   .collection('posts')
   *   .withConverter(postConverter)
   *   .doc().get();
   * const post = postSnap.data();
   * if (post !== undefined) {
   *   post.title; // string
   *   post.toString(); // Should be defined
   *   post.someNonExistentProperty; // TS error
   * }
   * ```
   */
  export interface FirestoreDataConverter<T> {
    /**
     * Called by the Firestore SDK to convert a custom model object of type T
     * into a plain Javascript object (suitable for writing directly to the
     * Firestore database). To use `set()` with `merge` and `mergeFields`,
     * `toFirestore()` must be defined with `Partial<T>`.
     */
    toFirestore(modelObject: T): DocumentData;
    toFirestore(modelObject: Partial<T>, options: SetOptions): DocumentData;

    /**
     * Called by the Firestore SDK to convert Firestore data into an object of
     * type T. You can access your data by calling: `snapshot.data(options)`.
     *
     * @param snapshot A QueryDocumentSnapshot containing your data and metadata.
     * @param options The SnapshotOptions from the initial call to `data()`.
     */
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T;
  }

  /**
   * The Cloud Firestore service interface.
   *
   * Do not call this constructor directly. Instead, use
   * {@link firebase.firestore `firebase.firestore()`}.
   */
  export class Firestore {
    private constructor();
    /**
     * Specifies custom settings to be used to configure the `Firestore`
     * instance. Must be set before invoking any other methods.
     *
     * @param settings The settings to use.
     */
    settings(settings: Settings): void;

    /**
     * Modify this instance to communicate with the Cloud Firestore emulator.
     *
     * <p>Note: this must be called before this instance has been used to do any operations.
     *
     * @param host the emulator host (ex: localhost).
     * @param port the emulator port (ex: 9000).
     * @param options.mockUserToken - the mock auth token to use for unit
     * testing Security Rules.
     */
    useEmulator(
      host: string,
      port: number,
      options?: {
        mockUserToken?: EmulatorMockTokenOptions | string;
      }
    ): void;

    /**
     * Attempts to enable persistent storage, if possible.
     *
     * Must be called before any other methods (other than settings() and
     * clearPersistence()).
     *
     * If this fails, enablePersistence() will reject the promise it returns.
     * Note that even after this failure, the firestore instance will remain
     * usable, however offline persistence will be disabled.
     *
     * There are several reasons why this can fail, which can be identified by
     * the `code` on the error.
     *
     *   * failed-precondition: The app is already open in another browser tab.
     *   * unimplemented: The browser is incompatible with the offline
     *     persistence implementation.
     *
     * @param settings Optional settings object to configure persistence.
     * @return A promise that represents successfully enabling persistent
     * storage.
     */
    enablePersistence(settings?: PersistenceSettings): Promise<void>;

    /**
     * Gets a `CollectionReference` instance that refers to the collection at
     * the specified path.
     *
     * @param collectionPath A slash-separated path to a collection.
     * @return The `CollectionReference` instance.
     */
    collection(collectionPath: string): CollectionReference<DocumentData>;

    /**
     * Gets a `DocumentReference` instance that refers to the document at the
     * specified path.
     *
     * @param documentPath A slash-separated path to a document.
     * @return The `DocumentReference` instance.
     */
    doc(documentPath: string): DocumentReference<DocumentData>;

    /**
     * Creates and returns a new Query that includes all documents in the
     * database that are contained in a collection or subcollection with the
     * given collectionId.
     *
     * @param collectionId Identifies the collections to query over. Every
     * collection or subcollection with this ID as the last segment of its path
     * will be included. Cannot contain a slash.
     * @return The created Query.
     */
    collectionGroup(collectionId: string): Query<DocumentData>;

    /**
     * Executes the given `updateFunction` and then attempts to commit the changes
     * applied within the transaction. If any document read within the transaction
     * has changed, Cloud Firestore retries the `updateFunction`. If it fails to
     * commit after 5 attempts, the transaction fails.
     *
     * The maximum number of writes allowed in a single transaction is 500, but
     * note that each usage of `FieldValue.serverTimestamp()`,
     * `FieldValue.arrayUnion()`, `FieldValue.arrayRemove()`, or
     * `FieldValue.increment()` inside a transaction counts as an additional write.
     *
     * @param updateFunction
     *   The function to execute within the transaction context.
     *
     * @return
     *   If the transaction completed successfully or was explicitly aborted
     *   (the `updateFunction` returned a failed promise),
     *   the promise returned by the updateFunction is returned here. Else, if the
     *   transaction failed, a rejected promise with the corresponding failure
     *   error will be returned.
     */
    runTransaction<T>(
      updateFunction: (transaction: Transaction) => Promise<T>
    ): Promise<T>;

    /**
     * Creates a write batch, used for performing multiple writes as a single
     * atomic operation. The maximum number of writes allowed in a single WriteBatch
     * is 500, but note that each usage of `FieldValue.serverTimestamp()`,
     * `FieldValue.arrayUnion()`, `FieldValue.arrayRemove()`, or
     * `FieldValue.increment()` inside a WriteBatch counts as an additional write.
     *
     * @return
     *   A `WriteBatch` that can be used to atomically execute multiple writes.
     */
    batch(): WriteBatch;

    /**
     * The {@link firebase.app.App app} associated with this `Firestore` service
     * instance.
     */
    app: firebase.app.App;

    /**
     * Clears the persistent storage. This includes pending writes and cached
     * documents.
     *
     * Must be called while the firestore instance is not started (after the app
     * is shutdown or when the app is first initialized). On startup, this
     * method must be called before other methods (other than settings()). If
     * the firestore instance is still running, the promise will be rejected
     * with the error code of `failed-precondition`.
     *
     * Note: clearPersistence() is primarily intended to help write reliable
     * tests that use Cloud Firestore. It uses an efficient mechanism for
     * dropping existing data but does not attempt to securely overwrite or
     * otherwise make cached data unrecoverable. For applications that are
     * sensitive to the disclosure of cached data in between user sessions, we
     * strongly recommend not enabling persistence at all.
     *
     * @return A promise that is resolved when the persistent storage is
     * cleared. Otherwise, the promise is rejected with an error.
     */
    clearPersistence(): Promise<void>;

    /**
     * Re-enables use of the network for this Firestore instance after a prior
     * call to {@link firebase.firestore.Firestore.disableNetwork
     * `disableNetwork()`}.
     *
     * @return A promise that is resolved once the network has been
     *   enabled.
     */
    enableNetwork(): Promise<void>;

    /**
     * Disables network usage for this instance. It can be re-enabled via
     * {@link firebase.firestore.Firestore.enableNetwork `enableNetwork()`}. While
     * the network is disabled, any snapshot listeners or get() calls will return
     * results from cache, and any write operations will be queued until the network
     * is restored.
     *
     * @return A promise that is resolved once the network has been
     *   disabled.
     */
    disableNetwork(): Promise<void>;

    /**
     * Waits until all currently pending writes for the active user have been acknowledged by the
     * backend.
     *
     * The returned Promise resolves immediately if there are no outstanding writes. Otherwise, the
     * Promise waits for all previously issued writes (including those written in a previous app
     * session), but it does not wait for writes that were added after the method is called. If you
     * want to wait for additional writes, call `waitForPendingWrites()` again.
     *
     * Any outstanding `waitForPendingWrites()` Promises are rejected during user changes.
     *
     * @return A Promise which resolves when all currently pending writes have been
     * acknowledged by the backend.
     */
    waitForPendingWrites(): Promise<void>;

    /**
     * Attaches a listener for a snapshots-in-sync event. The snapshots-in-sync
     * event indicates that all listeners affected by a given change have fired,
     * even if a single server-generated change affects multiple listeners.
     *
     * NOTE: The snapshots-in-sync event only indicates that listeners are in sync
     * with each other, but does not relate to whether those snapshots are in sync
     * with the server. Use SnapshotMetadata in the individual listeners to
     * determine if a snapshot is from the cache or the server.
     *
     * @param observer A single object containing `next` and `error` callbacks.
     * @return An unsubscribe function that can be called to cancel the snapshot
     * listener.
     */
    onSnapshotsInSync(observer: {
      next?: (value: void) => void;
      error?: (error: FirestoreError) => void;
      complete?: () => void;
    }): () => void;

    /**
     * Attaches a listener for a snapshots-in-sync event. The snapshots-in-sync
     * event indicates that all listeners affected by a given change have fired,
     * even if a single server-generated change affects multiple listeners.
     *
     * NOTE: The snapshots-in-sync event only indicates that listeners are in sync
     * with each other, but does not relate to whether those snapshots are in sync
     * with the server. Use SnapshotMetadata in the individual listeners to
     * determine if a snapshot is from the cache or the server.
     *
     * @param onSync A callback to be called every time all snapshot listeners are
     * in sync with each other.
     * @return An unsubscribe function that can be called to cancel the snapshot
     * listener.
     */
    onSnapshotsInSync(onSync: () => void): () => void;

    /**
     * Terminates this Firestore instance.
     *
     * After calling `terminate()` only the `clearPersistence()` method may be used. Any other method
     * will throw a `FirestoreError`.
     *
     * To restart after termination, create a new instance of FirebaseFirestore with
     * `firebase.firestore()`.
     *
     * Termination does not cancel any pending writes, and any promises that are awaiting a response
     * from the server will not be resolved. If you have persistence enabled, the next time you
     * start this instance, it will resume sending these writes to the server.
     *
     * Note: Under normal circumstances, calling `terminate()` is not required. This
     * method is useful only when you want to force this instance to release all of its resources or
     * in combination with `clearPersistence()` to ensure that all local state is destroyed
     * between test runs.
     *
     * @return A promise that is resolved when the instance has been successfully terminated.
     */
    terminate(): Promise<void>;

    /**
     * Loads a Firestore bundle into the local cache.
     *
     * @param bundleData
     *   An object representing the bundle to be loaded. Valid objects are `ArrayBuffer`,
     *   `ReadableStream<Uint8Array>` or `string`.
     *
     * @return
     *   A `LoadBundleTask` object, which notifies callers with progress updates, and completion
     *   or error events. It can be used as a `Promise<LoadBundleTaskProgress>`.
     */
    loadBundle(
      bundleData: ArrayBuffer | ReadableStream<Uint8Array> | string
    ): LoadBundleTask;

    /**
     * Reads a Firestore `Query` from local cache, identified by the given name.
     *
     * The named queries are packaged  into bundles on the server side (along
     * with resulting documents), and loaded to local cache using `loadBundle`. Once in local
     * cache, use this method to extract a `Query` by name.
     */
    namedQuery(name: string): Promise<Query<DocumentData> | null>;

    /**
     * @hidden
     */
    INTERNAL: { delete: () => Promise<void> };
  }

  /**
   * Represents the task of loading a Firestore bundle. It provides progress of bundle
   * loading, as well as task completion and error events.
   *
   * The API is compatible with `Promise<LoadBundleTaskProgress>`.
   */
  export interface LoadBundleTask extends PromiseLike<LoadBundleTaskProgress> {
    /**
     * Registers functions to listen to bundle loading progress events.
     * @param next
     *   Called when there is a progress update from bundle loading. Typically `next` calls occur
     *   each time a Firestore document is loaded from the bundle.
     * @param error
     *   Called when an error occurs during bundle loading. The task aborts after reporting the
     *   error, and there should be no more updates after this.
     * @param complete
     *   Called when the loading task is complete.
     */
    onProgress(
      next?: (progress: LoadBundleTaskProgress) => any,
      error?: (error: Error) => any,
      complete?: () => void
    ): void;

    /**
     * Implements the `Promise<LoadBundleTaskProgress>.then` interface.
     *
     * @param onFulfilled
     *   Called on the completion of the loading task with a final `LoadBundleTaskProgress` update.
     *   The update will always have its `taskState` set to `"Success"`.
     * @param onRejected
     *   Called when an error occurs during bundle loading.
     */
    then<T, R>(
      onFulfilled?: (a: LoadBundleTaskProgress) => T | PromiseLike<T>,
      onRejected?: (a: Error) => R | PromiseLike<R>
    ): Promise<T | R>;

    /**
     * Implements the `Promise<LoadBundleTaskProgress>.catch` interface.
     *
     * @param onRejected
     *   Called when an error occurs during bundle loading.
     */
    catch<R>(
      onRejected: (a: Error) => R | PromiseLike<R>
    ): Promise<R | LoadBundleTaskProgress>;
  }

  /**
   * Represents a progress update or a final state from loading bundles.
   */
  export interface LoadBundleTaskProgress {
    /** How many documents have been loaded. */
    documentsLoaded: number;
    /** How many documents are in the bundle being loaded. */
    totalDocuments: number;
    /** How many bytes have been loaded. */
    bytesLoaded: number;
    /** How many bytes are in the bundle being loaded. */
    totalBytes: number;
    /** Current task state. */
    taskState: TaskState;
  }

  /**
   * Represents the state of bundle loading tasks.
   *
   * Both 'Error' and 'Success' are sinking state: task will abort or complete and there will
   * be no more updates after they are reported.
   */
  export type TaskState = 'Error' | 'Running' | 'Success';

  /**
   * An immutable object representing a geo point in Firestore. The geo point
   * is represented as latitude/longitude pair.
   *
   * Latitude values are in the range of [-90, 90].
   * Longitude values are in the range of [-180, 180].
   */
  export class GeoPoint {
    /**
     * Creates a new immutable GeoPoint object with the provided latitude and
     * longitude values.
     * @param latitude The latitude as number between -90 and 90.
     * @param longitude The longitude as number between -180 and 180.
     */
    constructor(latitude: number, longitude: number);

    /**
     * The latitude of this GeoPoint instance.
     */
    readonly latitude: number;
    /**
     * The longitude of this GeoPoint instance.
     */
    readonly longitude: number;

    /**
     * Returns true if this `GeoPoint` is equal to the provided one.
     *
     * @param other The `GeoPoint` to compare against.
     * @return true if this `GeoPoint` is equal to the provided one.
     */
    isEqual(other: GeoPoint): boolean;
  }

  /**
   * A Timestamp represents a point in time independent of any time zone or
   * calendar, represented as seconds and fractions of seconds at nanosecond
   * resolution in UTC Epoch time.
   *
   * It is encoded using the Proleptic Gregorian
   * Calendar which extends the Gregorian calendar backwards to year one. It is
   * encoded assuming all minutes are 60 seconds long, i.e. leap seconds are
   * "smeared" so that no leap second table is needed for interpretation. Range is
   * from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59.999999999Z.
   *
   * @see https://github.com/google/protobuf/blob/master/src/google/protobuf/timestamp.proto
   */
  export class Timestamp {
    /**
     * Creates a new timestamp.
     *
     * @param seconds The number of seconds of UTC time since Unix epoch
     *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
     *     9999-12-31T23:59:59Z inclusive.
     * @param nanoseconds The non-negative fractions of a second at nanosecond
     *     resolution. Negative second values with fractions must still have
     *     non-negative nanoseconds values that count forward in time. Must be
     *     from 0 to 999,999,999 inclusive.
     */
    constructor(seconds: number, nanoseconds: number);

    /**
     * Creates a new timestamp with the current date, with millisecond precision.
     *
     * @return a new timestamp representing the current date.
     */
    static now(): Timestamp;

    /**
     * Creates a new timestamp from the given date.
     *
     * @param date The date to initialize the `Timestamp` from.
     * @return A new `Timestamp` representing the same point in time as the given
     *     date.
     */
    static fromDate(date: Date): Timestamp;

    /**
     * Creates a new timestamp from the given number of milliseconds.
     *
     * @param milliseconds Number of milliseconds since Unix epoch
     *     1970-01-01T00:00:00Z.
     * @return A new `Timestamp` representing the same point in time as the given
     *     number of milliseconds.
     */
    static fromMillis(milliseconds: number): Timestamp;

    readonly seconds: number;
    readonly nanoseconds: number;

    /**
     * Convert a Timestamp to a JavaScript `Date` object. This conversion causes
     * a loss of precision since `Date` objects only support millisecond precision.
     *
     * @return JavaScript `Date` object representing the same point in time as
     *     this `Timestamp`, with millisecond precision.
     */
    toDate(): Date;

    /**
     * Convert a timestamp to a numeric timestamp (in milliseconds since epoch).
     * This operation causes a loss of precision.
     *
     * @return The point in time corresponding to this timestamp, represented as
     *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
     */
    toMillis(): number;

    /**
     * Returns true if this `Timestamp` is equal to the provided one.
     *
     * @param other The `Timestamp` to compare against.
     * @return true if this `Timestamp` is equal to the provided one.
     */
    isEqual(other: Timestamp): boolean;

    /**
     * Converts this object to a primitive string, which allows Timestamp objects to be compared
     * using the `>`, `<=`, `>=` and `>` operators.
     */
    valueOf(): string;
  }

  /**
   * An immutable object representing an array of bytes.
   */
  export class Blob {
    private constructor();

    /**
     * Creates a new Blob from the given Base64 string, converting it to
     * bytes.
     *
     * @param base64
     *   The Base64 string used to create the Blob object.
     */
    static fromBase64String(base64: string): Blob;

    /**
     * Creates a new Blob from the given Uint8Array.
     *
     * @param array
     *   The Uint8Array used to create the Blob object.
     */
    static fromUint8Array(array: Uint8Array): Blob;

    /**
     * Returns the bytes of a Blob as a Base64-encoded string.
     *
     * @return
     *   The Base64-encoded string created from the Blob object.
     */
    public toBase64(): string;

    /**
     * Returns the bytes of a Blob in a new Uint8Array.
     *
     * @return
     *   The Uint8Array created from the Blob object.
     */
    public toUint8Array(): Uint8Array;

    /**
     * Returns true if this `Blob` is equal to the provided one.
     *
     * @param other The `Blob` to compare against.
     * @return true if this `Blob` is equal to the provided one.
     */
    isEqual(other: Blob): boolean;
  }

  /**
   * A reference to a transaction.
   * The `Transaction` object passed to a transaction's updateFunction provides
   * the methods to read and write data within the transaction context. See
   * `Firestore.runTransaction()`.
   */
  export class Transaction {
    private constructor();

    /**
     * Reads the document referenced by the provided `DocumentReference.`
     *
     * @param documentRef A reference to the document to be read.
     * @return A DocumentSnapshot for the read data.
     */
    get<T>(documentRef: DocumentReference<T>): Promise<DocumentSnapshot<T>>;

    /**
     * Writes to the document referred to by the provided `DocumentReference`.
     * If the document does not exist yet, it will be created. If you pass
     * `SetOptions`, the provided data can be merged into the existing document.
     *
     * @param documentRef A reference to the document to be set.
     * @param data An object of the fields and values for the document.
     * @param options An object to configure the set behavior.
     * @return This `Transaction` instance. Used for chaining method calls.
     */
    set<T>(
      documentRef: DocumentReference<T>,
      data: Partial<T>,
      options: SetOptions
    ): Transaction;

    /**
     * Writes to the document referred to by the provided `DocumentReference`.
     * If the document does not exist yet, it will be created. If you pass
     * `SetOptions`, the provided data can be merged into the existing document.
     *
     * @param documentRef A reference to the document to be set.
     * @param data An object of the fields and values for the document.
     * @return This `Transaction` instance. Used for chaining method calls.
     */
    set<T>(documentRef: DocumentReference<T>, data: T): Transaction;

    /**
     * Updates fields in the document referred to by the provided
     * `DocumentReference`. The update will fail if applied to a document that
     * does not exist.
     *
     * @param documentRef A reference to the document to be updated.
     * @param data An object containing the fields and values with which to
     * update the document. Fields can contain dots to reference nested fields
     * within the document.
     * @return This `Transaction` instance. Used for chaining method calls.
     */
    update(documentRef: DocumentReference<any>, data: UpdateData): Transaction;

    /**
     * Updates fields in the document referred to by the provided
     * `DocumentReference`. The update will fail if applied to a document that
     * does not exist.
     *
     * Nested fields can be updated by providing dot-separated field path
     * strings or by providing FieldPath objects.
     *
     * @param documentRef A reference to the document to be updated.
     * @param field The first field to update.
     * @param value The first value.
     * @param moreFieldsAndValues Additional key/value pairs.
     * @return A Promise resolved once the data has been successfully written
     * to the backend (Note that it won't resolve while you're offline).
     */
    update(
      documentRef: DocumentReference<any>,
      field: string | FieldPath,
      value: any,
      ...moreFieldsAndValues: any[]
    ): Transaction;

    /**
     * Deletes the document referred to by the provided `DocumentReference`.
     *
     * @param documentRef A reference to the document to be deleted.
     * @return This `Transaction` instance. Used for chaining method calls.
     */
    delete(documentRef: DocumentReference<any>): Transaction;
  }

  /**
   * A write batch, used to perform multiple writes as a single atomic unit.
   *
   * A `WriteBatch` object can be acquired by calling `Firestore.batch()`. It
   * provides methods for adding writes to the write batch. None of the
   * writes will be committed (or visible locally) until `WriteBatch.commit()`
   * is called.
   *
   * Unlike transactions, write batches are persisted offline and therefore are
   * preferable when you don't need to condition your writes on read data.
   */
  export class WriteBatch {
    private constructor();

    /**
     * Writes to the document referred to by the provided `DocumentReference`.
     * If the document does not exist yet, it will be created. If you pass
     * `SetOptions`, the provided data can be merged into the existing document.
     *
     * @param documentRef A reference to the document to be set.
     * @param data An object of the fields and values for the document.
     * @param options An object to configure the set behavior.
     * @return This `WriteBatch` instance. Used for chaining method calls.
     */
    set<T>(
      documentRef: DocumentReference<T>,
      data: Partial<T>,
      options: SetOptions
    ): WriteBatch;

    /**
     * Writes to the document referred to by the provided `DocumentReference`.
     * If the document does not exist yet, it will be created. If you pass
     * `SetOptions`, the provided data can be merged into the existing document.
     *
     * @param documentRef A reference to the document to be set.
     * @param data An object of the fields and values for the document.
     * @return This `WriteBatch` instance. Used for chaining method calls.
     */
    set<T>(documentRef: DocumentReference<T>, data: T): WriteBatch;

    /**
     * Updates fields in the document referred to by the provided
     * `DocumentReference`. The update will fail if applied to a document that
     * does not exist.
     *
     * @param documentRef A reference to the document to be updated.
     * @param data An object containing the fields and values with which to
     * update the document. Fields can contain dots to reference nested fields
     * within the document.
     * @return This `WriteBatch` instance. Used for chaining method calls.
     */
    update(documentRef: DocumentReference<any>, data: UpdateData): WriteBatch;

    /**
     * Updates fields in the document referred to by this `DocumentReference`.
     * The update will fail if applied to a document that does not exist.
     *
     * Nested fields can be update by providing dot-separated field path strings
     * or by providing FieldPath objects.
     *
     * @param documentRef A reference to the document to be updated.
     * @param field The first field to update.
     * @param value The first value.
     * @param moreFieldsAndValues Additional key value pairs.
     * @return A Promise resolved once the data has been successfully written
     * to the backend (Note that it won't resolve while you're offline).
     */
    update(
      documentRef: DocumentReference<any>,
      field: string | FieldPath,
      value: any,
      ...moreFieldsAndValues: any[]
    ): WriteBatch;

    /**
     * Deletes the document referred to by the provided `DocumentReference`.
     *
     * @param documentRef A reference to the document to be deleted.
     * @return This `WriteBatch` instance. Used for chaining method calls.
     */
    delete(documentRef: DocumentReference<any>): WriteBatch;

    /**
     * Commits all of the writes in this write batch as a single atomic unit.
     *
     * @return A Promise resolved once all of the writes in the batch have been
     * successfully written to the backend as an atomic unit. Note that it won't
     * resolve while you're offline.
     */
    commit(): Promise<void>;
  }

  /**
   * An options object that can be passed to `DocumentReference.onSnapshot()`,
   * `Query.onSnapshot()` and `QuerySnapshot.docChanges()` to control which
   * types of changes to include in the result set.
   */
  export interface SnapshotListenOptions {
    /**
     * Include a change even if only the metadata of the query or of a document
     * changed. Default is false.
     */
    readonly includeMetadataChanges?: boolean;
  }

  /**
   * An options object that configures the behavior of `set()` calls in
   * {@link firebase.firestore.DocumentReference.set DocumentReference}, {@link
   * firebase.firestore.WriteBatch.set WriteBatch} and {@link
   * firebase.firestore.Transaction.set Transaction}. These calls can be
   * configured to perform granular merges instead of overwriting the target
   * documents in their entirety by providing a `SetOptions` with `merge: true`.
   */
  export interface SetOptions {
    /**
     * Changes the behavior of a set() call to only replace the values specified
     * in its data argument. Fields omitted from the set() call remain
     * untouched.
     */
    readonly merge?: boolean;

    /**
     * Changes the behavior of set() calls to only replace the specified field
     * paths. Any field path that is not specified is ignored and remains
     * untouched.
     */
    readonly mergeFields?: (string | FieldPath)[];
  }

  /**
   * An options object that configures the behavior of `get()` calls on
   * `DocumentReference` and `Query`. By providing a `GetOptions` object, these
   * methods can be configured to fetch results only from the server, only from
   * the local cache or attempt to fetch results from the server and fall back to
   * the cache (which is the default).
   */
  export interface GetOptions {
    /**
     * Describes whether we should get from server or cache.
     *
     * Setting to `default` (or not setting at all), causes Firestore to try to
     * retrieve an up-to-date (server-retrieved) snapshot, but fall back to
     * returning cached data if the server can't be reached.
     *
     * Setting to `server` causes Firestore to avoid the cache, generating an
     * error if the server cannot be reached. Note that the cache will still be
     * updated if the server request succeeds. Also note that latency-compensation
     * still takes effect, so any pending write operations will be visible in the
     * returned data (merged into the server-provided data).
     *
     * Setting to `cache` causes Firestore to immediately return a value from the
     * cache, ignoring the server completely (implying that the returned value
     * may be stale with respect to the value on the server.) If there is no data
     * in the cache to satisfy the `get()` call, `DocumentReference.get()` will
     * return an error and `QuerySnapshot.get()` will return an empty
     * `QuerySnapshot` with no documents.
     */
    readonly source?: 'default' | 'server' | 'cache';
  }

  /**
   * A `DocumentReference` refers to a document location in a Firestore database
   * and can be used to write, read, or listen to the location. The document at
   * the referenced location may or may not exist. A `DocumentReference` can
   * also be used to create a `CollectionReference` to a subcollection.
   */
  export class DocumentReference<T = DocumentData> {
    private constructor();

    /**
     * The document's identifier within its collection.
     */
    readonly id: string;

    /**
     * The {@link firebase.firestore.Firestore} the document is in.
     * This is useful for performing transactions, for example.
     */
    readonly firestore: Firestore;

    /**
     * The Collection this `DocumentReference` belongs to.
     */
    readonly parent: CollectionReference<T>;

    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     */
    readonly path: string;

    /**
     * Gets a `CollectionReference` instance that refers to the collection at
     * the specified path.
     *
     * @param collectionPath A slash-separated path to a collection.
     * @return The `CollectionReference` instance.
     */
    collection(collectionPath: string): CollectionReference<DocumentData>;

    /**
     * Returns true if this `DocumentReference` is equal to the provided one.
     *
     * @param other The `DocumentReference` to compare against.
     * @return true if this `DocumentReference` is equal to the provided one.
     */
    isEqual(other: DocumentReference<T>): boolean;

    /**
     * Writes to the document referred to by this `DocumentReference`. If the
     * document does not yet exist, it will be created. If you pass
     * `SetOptions`, the provided data can be merged into an existing document.
     *
     * @param data A map of the fields and values for the document.
     * @param options An object to configure the set behavior.
     * @return A Promise resolved once the data has been successfully written
     * to the backend (Note that it won't resolve while you're offline).
     */
    set(data: Partial<T>, options: SetOptions): Promise<void>;

    /**
     * Writes to the document referred to by this `DocumentReference`. If the
     * document does not yet exist, it will be created. If you pass
     * `SetOptions`, the provided data can be merged into an existing document.
     *
     * @param data A map of the fields and values for the document.
     * @return A Promise resolved once the data has been successfully written
     * to the backend (Note that it won't resolve while you're offline).
     */
    set(data: T): Promise<void>;

    /**
     * Updates fields in the document referred to by this `DocumentReference`.
     * The update will fail if applied to a document that does not exist.
     *
     * @param data An object containing the fields and values with which to
     * update the document. Fields can contain dots to reference nested fields
     * within the document.
     * @return A Promise resolved once the data has been successfully written
     * to the backend (Note that it won't resolve while you're offline).
     */
    update(data: UpdateData): Promise<void>;

    /**
     * Updates fields in the document referred to by this `DocumentReference`.
     * The update will fail if applied to a document that does not exist.
     *
     * Nested fields can be updated by providing dot-separated field path
     * strings or by providing FieldPath objects.
     *
     * @param field The first field to update.
     * @param value The first value.
     * @param moreFieldsAndValues Additional key value pairs.
     * @return A Promise resolved once the data has been successfully written
     * to the backend (Note that it won't resolve while you're offline).
     */
    update(
      field: string | FieldPath,
      value: any,
      ...moreFieldsAndValues: any[]
    ): Promise<void>;

    /**
     * Deletes the document referred to by this `DocumentReference`.
     *
     * @return A Promise resolved once the document has been successfully
     * deleted from the backend (Note that it won't resolve while you're
     * offline).
     */
    delete(): Promise<void>;

    /**
     * Reads the document referred to by this `DocumentReference`.
     *
     * Note: By default, get() attempts to provide up-to-date data when possible
     * by waiting for data from the server, but it may return cached data or fail
     * if you are offline and the server cannot be reached. This behavior can be
     * altered via the `GetOptions` parameter.
     *
     * @param options An object to configure the get behavior.
     * @return A Promise resolved with a DocumentSnapshot containing the
     * current document contents.
     */
    get(options?: GetOptions): Promise<DocumentSnapshot<T>>;

    /**
     * Attaches a listener for DocumentSnapshot events. You may either pass
     * individual `onNext` and `onError` callbacks or pass a single observer
     * object with `next` and `error` callbacks.
     *
     * NOTE: Although an `onCompletion` callback can be provided, it will
     * never be called because the snapshot stream is never-ending.
     *
     * @param observer A single object containing `next` and `error` callbacks.
     * @return An unsubscribe function that can be called to cancel
     * the snapshot listener.
     */
    onSnapshot(observer: {
      next?: (snapshot: DocumentSnapshot<T>) => void;
      error?: (error: FirestoreError) => void;
      complete?: () => void;
    }): () => void;
    /**
     * Attaches a listener for DocumentSnapshot events. You may either pass
     * individual `onNext` and `onError` callbacks or pass a single observer
     * object with `next` and `error` callbacks.
     *
     * NOTE: Although an `onCompletion` callback can be provided, it will
     * never be called because the snapshot stream is never-ending.
     *
     * @param options Options controlling the listen behavior.
     * @param observer A single object containing `next` and `error` callbacks.
     * @return An unsubscribe function that can be called to cancel
     * the snapshot listener.
     */
    onSnapshot(
      options: SnapshotListenOptions,
      observer: {
        next?: (snapshot: DocumentSnapshot<T>) => void;
        error?: (error: FirestoreError) => void;
        complete?: () => void;
      }
    ): () => void;
    /**
     * Attaches a listener for DocumentSnapshot events. You may either pass
     * individual `onNext` and `onError` callbacks or pass a single observer
     * object with `next` and `error` callbacks.
     *
     * NOTE: Although an `onCompletion` callback can be provided, it will
     * never be called because the snapshot stream is never-ending.
     *
     * @param onNext A callback to be called every time a new `DocumentSnapshot`
     * is available.
     * @param onError A callback to be called if the listen fails or is
     * cancelled. No further callbacks will occur.
     * @return An unsubscribe function that can be called to cancel
     * the snapshot listener.
     */
    onSnapshot(
      onNext: (snapshot: DocumentSnapshot<T>) => void,
      onError?: (error: FirestoreError) => void,
      onCompletion?: () => void
    ): () => void;
    /**
     * Attaches a listener for DocumentSnapshot events. You may either pass
     * individual `onNext` and `onError` callbacks or pass a single observer
     * object with `next` and `error` callbacks.
     *
     * NOTE: Although an `onCompletion` callback can be provided, it will
     * never be called because the snapshot stream is never-ending.
     *
     * @param options Options controlling the listen behavior.
     * @param onNext A callback to be called every time a new `DocumentSnapshot`
     * is available.
     * @param onError A callback to be called if the listen fails or is
     * cancelled. No further callbacks will occur.
     * @return An unsubscribe function that can be called to cancel
     * the snapshot listener.
     */
    onSnapshot(
      options: SnapshotListenOptions,
      onNext: (snapshot: DocumentSnapshot<T>) => void,
      onError?: (error: FirestoreError) => void,
      onCompletion?: () => void
    ): () => void;

    /**
     * Applies a custom data converter to this DocumentReference, allowing you
     * to use your own custom model objects with Firestore. When you call
     * set(), get(), etc. on the returned DocumentReference instance, the
     * provided converter will convert between Firestore data and your custom
     * type U.
     *
     * Passing in `null` as the converter parameter removes the current
     * converter.
     *
     * @param converter Converts objects to and from Firestore. Passing in
     * `null` removes the current converter.
     * @return A DocumentReference<U> that uses the provided converter.
     */
    withConverter(converter: null): DocumentReference<DocumentData>;
    /**
     * Applies a custom data converter to this DocumentReference, allowing you
     * to use your own custom model objects with Firestore. When you call
     * set(), get(), etc. on the returned DocumentReference instance, the
     * provided converter will convert between Firestore data and your custom
     * type U.
     *
     * Passing in `null` as the converter parameter removes the current
     * converter.
     *
     * @param converter Converts objects to and from Firestore. Passing in
     * `null` removes the current converter.
     * @return A DocumentReference<U> that uses the provided converter.
     */
    withConverter<U>(
      converter: FirestoreDataConverter<U>
    ): DocumentReference<U>;
  }

  /**
   * Options that configure how data is retrieved from a `DocumentSnapshot`
   * (e.g. the desired behavior for server timestamps that have not yet been set
   * to their final value).
   */
  export interface SnapshotOptions {
    /**
     * If set, controls the return value for server timestamps that have not yet
     * been set to their final value.
     *
     * By specifying 'estimate', pending server timestamps return an estimate
     * based on the local clock. This estimate will differ from the final value
     * and cause these values to change once the server result becomes available.
     *
     * By specifying 'previous', pending timestamps will be ignored and return
     * their previous value instead.
     *
     * If omitted or set to 'none', `null` will be returned by default until the
     * server value becomes available.
     */
    readonly serverTimestamps?: 'estimate' | 'previous' | 'none';
  }

  /**
   * Metadata about a snapshot, describing the state of the snapshot.
   */
  export interface SnapshotMetadata {
    /**
     * True if the snapshot contains the result of local writes (e.g. set() or
     * update() calls) that have not yet been committed to the backend.
     * If your listener has opted into metadata updates (via
     * `SnapshotListenOptions`) you will receive another
     * snapshot with `hasPendingWrites` equal to false once the writes have been
     * committed to the backend.
     */
    readonly hasPendingWrites: boolean;

    /**
     * True if the snapshot was created from cached data rather than guaranteed
     * up-to-date server data. If your listener has opted into metadata updates
     * (via `SnapshotListenOptions`)
     * you will receive another snapshot with `fromCache` set to false once
     * the client has received up-to-date data from the backend.
     */
    readonly fromCache: boolean;

    /**
     * Returns true if this `SnapshotMetadata` is equal to the provided one.
     *
     * @param other The `SnapshotMetadata` to compare against.
     * @return true if this `SnapshotMetadata` is equal to the provided one.
     */
    isEqual(other: SnapshotMetadata): boolean;
  }

  /**
   * A `DocumentSnapshot` contains data read from a document in your Firestore
   * database. The data can be extracted with `.data()` or `.get(<field>)` to
   * get a specific field.
   *
   * For a `DocumentSnapshot` that points to a non-existing document, any data
   * access will return 'undefined'. You can use the `exists` property to
   * explicitly verify a document's existence.
   */
  export class DocumentSnapshot<T = DocumentData> {
    protected constructor();

    /**
     * Property of the `DocumentSnapshot` that signals whether or not the data
     * exists. True if the document exists.
     */
    readonly exists: boolean;
    /**
     * The `DocumentReference` for the document included in the `DocumentSnapshot`.
     */
    readonly ref: DocumentReference<T>;
    /**
     * Property of the `DocumentSnapshot` that provides the document's ID.
     */
    readonly id: string;
    /**
     *  Metadata about the `DocumentSnapshot`, including information about its
     *  source and local modifications.
     */
    readonly metadata: SnapshotMetadata;

    /**
     * Retrieves all fields in the document as an Object. Returns 'undefined' if
     * the document doesn't exist.
     *
     * By default, `FieldValue.serverTimestamp()` values that have not yet been
     * set to their final value will be returned as `null`. You can override
     * this by passing an options object.
     *
     * @param options An options object to configure how data is retrieved from
     * the snapshot (e.g. the desired behavior for server timestamps that have
     * not yet been set to their final value).
     * @return An Object containing all fields in the document or 'undefined' if
     * the document doesn't exist.
     */
    data(options?: SnapshotOptions): T | undefined;

    /**
     * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
     * document or field doesn't exist.
     *
     * By default, a `FieldValue.serverTimestamp()` that has not yet been set to
     * its final value will be returned as `null`. You can override this by
     * passing an options object.
     *
     * @param fieldPath The path (e.g. 'foo' or 'foo.bar') to a specific field.
     * @param options An options object to configure how the field is retrieved
     * from the snapshot (e.g. the desired behavior for server timestamps that have
     * not yet been set to their final value).
     * @return The data at the specified field location or undefined if no such
     * field exists in the document.
     */
    get(fieldPath: string | FieldPath, options?: SnapshotOptions): any;

    /**
     * Returns true if this `DocumentSnapshot` is equal to the provided one.
     *
     * @param other The `DocumentSnapshot` to compare against.
     * @return true if this `DocumentSnapshot` is equal to the provided one.
     */
    isEqual(other: DocumentSnapshot<T>): boolean;
  }

  /**
   * A `QueryDocumentSnapshot` contains data read from a document in your
   * Firestore database as part of a query. The document is guaranteed to exist
   * and its data can be extracted with `.data()` or `.get(<field>)` to get a
   * specific field.
   *
   * A `QueryDocumentSnapshot` offers the same API surface as a
   * `DocumentSnapshot`. Since query results contain only existing documents, the
   * `exists` property will always be true and `data()` will never return
   * 'undefined'.
   */
  export class QueryDocumentSnapshot<T = DocumentData> extends DocumentSnapshot<
    T
  > {
    private constructor();

    /**
     * Retrieves all fields in the document as an Object.
     *
     * By default, `FieldValue.serverTimestamp()` values that have not yet been
     * set to their final value will be returned as `null`. You can override
     * this by passing an options object.
     *
     * @override
     * @param options An options object to configure how data is retrieved from
     * the snapshot (e.g. the desired behavior for server timestamps that have
     * not yet been set to their final value).
     * @return An Object containing all fields in the document.
     */
    data(options?: SnapshotOptions): T;
  }

  /**
   * The direction of a `Query.orderBy()` clause is specified as 'desc' or 'asc'
   * (descending or ascending).
   */
  export type OrderByDirection = 'desc' | 'asc';

  /**
   * Filter conditions in a `Query.where()` clause are specified using the
   * strings '<', '<=', '==', '!=', '>=', '>', 'array-contains', 'in',
   * 'array-contains-any', and 'not-in'.
   */
  export type WhereFilterOp =
    | '<'
    | '<='
    | '=='
    | '!='
    | '>='
    | '>'
    | 'array-contains'
    | 'in'
    | 'array-contains-any'
    | 'not-in';

  /**
   * A `Query` refers to a Query which you can read or listen to. You can also
   * construct refined `Query` objects by adding filters and ordering.
   */
  export class Query<T = DocumentData> {
    protected constructor();

    /**
     * The `Firestore` for the Firestore database (useful for performing
     * transactions, etc.).
     */
    readonly firestore: Firestore;

    /**
     * Creates and returns a new Query with the additional filter that documents
     * must contain the specified field and the value should satisfy the
     * relation constraint provided.
     *
     * @param fieldPath The path to compare
     * @param opStr The operation string (e.g "<", "<=", "==", ">", ">=").
     * @param value The value for comparison
     * @return The created Query.
     */
    where(
      fieldPath: string | FieldPath,
      opStr: WhereFilterOp,
      value: any
    ): Query<T>;

    /**
     * Creates and returns a new Query that's additionally sorted by the
     * specified field, optionally in descending order instead of ascending.
     *
     * @param fieldPath The field to sort by.
     * @param directionStr Optional direction to sort by (`asc` or `desc`). If
     * not specified, order will be ascending.
     * @return The created Query.
     */
    orderBy(
      fieldPath: string | FieldPath,
      directionStr?: OrderByDirection
    ): Query<T>;

    /**
     * Creates and returns a new Query that only returns the first matching
     * documents.
     *
     * @param limit The maximum number of items to return.
     * @return The created Query.
     */
    limit(limit: number): Query<T>;

    /**
     * Creates and returns a new Query that only returns the last matching
     * documents.
     *
     * You must specify at least one `orderBy` clause for `limitToLast` queries,
     * otherwise an exception will be thrown during execution.
     *
     * @param limit The maximum number of items to return.
     * @return The created Query.
     */
    limitToLast(limit: number): Query<T>;

    /**
     * Creates and returns a new Query that starts at the provided document
     * (inclusive). The starting position is relative to the order of the query.
     * The document must contain all of the fields provided in the `orderBy` of
     * this query.
     *
     * @param snapshot The snapshot of the document to start at.
     * @return The created Query.
     */
    startAt(snapshot: DocumentSnapshot<any>): Query<T>;

    /**
     * Creates and returns a new Query that starts at the provided fields
     * relative to the order of the query. The order of the field values
     * must match the order of the order by clauses of the query.
     *
     * @param fieldValues The field values to start this query at, in order
     * of the query's order by.
     * @return The created Query.
     */
    startAt(...fieldValues: any[]): Query<T>;

    /**
     * Creates and returns a new Query that starts after the provided document
     * (exclusive). The starting position is relative to the order of the query.
     * The document must contain all of the fields provided in the orderBy of
     * this query.
     *
     * @param snapshot The snapshot of the document to start after.
     * @return The created Query.
     */
    startAfter(snapshot: DocumentSnapshot<any>): Query<T>;

    /**
     * Creates and returns a new Query that starts after the provided fields
     * relative to the order of the query. The order of the field values
     * must match the order of the order by clauses of the query.
     *
     * @param fieldValues The field values to start this query after, in order
     * of the query's order by.
     * @return The created Query.
     */
    startAfter(...fieldValues: any[]): Query<T>;

    /**
     * Creates and returns a new Query that ends before the provided document
     * (exclusive). The end position is relative to the order of the query. The
     * document must contain all of the fields provided in the orderBy of this
     * query.
     *
     * @param snapshot The snapshot of the document to end before.
     * @return The created Query.
     */
    endBefore(snapshot: DocumentSnapshot<any>): Query<T>;

    /**
     * Creates and returns a new Query that ends before the provided fields
     * relative to the order of the query. The order of the field values
     * must match the order of the order by clauses of the query.
     *
     * @param fieldValues The field values to end this query before, in order
     * of the query's order by.
     * @return The created Query.
     */
    endBefore(...fieldValues: any[]): Query<T>;

    /**
     * Creates and returns a new Query that ends at the provided document
     * (inclusive). The end position is relative to the order of the query. The
     * document must contain all of the fields provided in the orderBy of this
     * query.
     *
     * @param snapshot The snapshot of the document to end at.
     * @return The created Query.
     */
    endAt(snapshot: DocumentSnapshot<any>): Query<T>;

    /**
     * Creates and returns a new Query that ends at the provided fields
     * relative to the order of the query. The order of the field values
     * must match the order of the order by clauses of the query.
     *
     * @param fieldValues The field values to end this query at, in order
     * of the query's order by.
     * @return The created Query.
     */
    endAt(...fieldValues: any[]): Query<T>;

    /**
     * Returns true if this `Query` is equal to the provided one.
     *
     * @param other The `Query` to compare against.
     * @return true if this `Query` is equal to the provided one.
     */
    isEqual(other: Query<T>): boolean;

    /**
     * Executes the query and returns the results as a `QuerySnapshot`.
     *
     * Note: By default, get() attempts to provide up-to-date data when possible
     * by waiting for data from the server, but it may return cached data or fail
     * if you are offline and the server cannot be reached. This behavior can be
     * altered via the `GetOptions` parameter.
     *
     * @param options An object to configure the get behavior.
     * @return A Promise that will be resolved with the results of the Query.
     */
    get(options?: GetOptions): Promise<QuerySnapshot<T>>;

    /**
     * Attaches a listener for QuerySnapshot events. You may either pass
     * individual `onNext` and `onError` callbacks or pass a single observer
     * object with `next` and `error` callbacks. The listener can be cancelled by
     * calling the function that is returned when `onSnapshot` is called.
     *
     * NOTE: Although an `onCompletion` callback can be provided, it will
     * never be called because the snapshot stream is never-ending.
     *
     * @param observer A single object containing `next` and `error` callbacks.
     * @return An unsubscribe function that can be called to cancel
     * the snapshot listener.
     */
    onSnapshot(observer: {
      next?: (snapshot: QuerySnapshot<T>) => void;
      error?: (error: FirestoreError) => void;
      complete?: () => void;
    }): () => void;
    /**
     * Attaches a listener for QuerySnapshot events. You may either pass
     * individual `onNext` and `onError` callbacks or pass a single observer
     * object with `next` and `error` callbacks. The listener can be cancelled by
     * calling the function that is returned when `onSnapshot` is called.
     *
     * NOTE: Although an `onCompletion` callback can be provided, it will
     * never be called because the snapshot stream is never-ending.
     *
     * @param options Options controlling the listen behavior.
     * @param observer A single object containing `next` and `error` callbacks.
     * @return An unsubscribe function that can be called to cancel
     * the snapshot listener.
     */
    onSnapshot(
      options: SnapshotListenOptions,
      observer: {
        next?: (snapshot: QuerySnapshot<T>) => void;
        error?: (error: FirestoreError) => void;
        complete?: () => void;
      }
    ): () => void;
    /**
     * Attaches a listener for QuerySnapshot events. You may either pass
     * individual `onNext` and `onError` callbacks or pass a single observer
     * object with `next` and `error` callbacks. The listener can be cancelled by
     * calling the function that is returned when `onSnapshot` is called.
     *
     * NOTE: Although an `onCompletion` callback can be provided, it will
     * never be called because the snapshot stream is never-ending.
     *
     * @param onNext A callback to be called every time a new `QuerySnapshot`
     * is available.
     * @param onError A callback to be called if the listen fails or is
     * cancelled. No further callbacks will occur.
     * @return An unsubscribe function that can be called to cancel
     * the snapshot listener.
     */
    onSnapshot(
      onNext: (snapshot: QuerySnapshot<T>) => void,
      onError?: (error: FirestoreError) => void,
      onCompletion?: () => void
    ): () => void;
    /**
     * Attaches a listener for QuerySnapshot events. You may either pass
     * individual `onNext` and `onError` callbacks or pass a single observer
     * object with `next` and `error` callbacks. The listener can be cancelled by
     * calling the function that is returned when `onSnapshot` is called.
     *
     * NOTE: Although an `onCompletion` callback can be provided, it will
     * never be called because the snapshot stream is never-ending.
     *
     * @param options Options controlling the listen behavior.
     * @param onNext A callback to be called every time a new `QuerySnapshot`
     * is available.
     * @param onError A callback to be called if the listen fails or is
     * cancelled. No further callbacks will occur.
     * @return An unsubscribe function that can be called to cancel
     * the snapshot listener.
     */
    onSnapshot(
      options: SnapshotListenOptions,
      onNext: (snapshot: QuerySnapshot<T>) => void,
      onError?: (error: FirestoreError) => void,
      onCompletion?: () => void
    ): () => void;

    /**
     * Applies a custom data converter to this Query, allowing you to use your
     * own custom model objects with Firestore. When you call get() on the
     * returned Query, the provided converter will convert between Firestore
     * data and your custom type U.
     *
     * Passing in `null` as the converter parameter removes the current
     * converter.
     *
     * @param converter Converts objects to and from Firestore. Passing in
     * `null` removes the current converter.
     * @return A Query<U> that uses the provided converter.
     */
    withConverter(converter: null): Query<DocumentData>;
    /**
     * Applies a custom data converter to this Query, allowing you to use your
     * own custom model objects with Firestore. When you call get() on the
     * returned Query, the provided converter will convert between Firestore
     * data and your custom type U.
     *
     * Passing in `null` as the converter parameter removes the current
     * converter.
     *
     * @param converter Converts objects to and from Firestore. Passing in
     * `null` removes the current converter.
     * @return A Query<U> that uses the provided converter.
     */
    withConverter<U>(converter: FirestoreDataConverter<U>): Query<U>;
  }

  /**
   * A `QuerySnapshot` contains zero or more `DocumentSnapshot` objects
   * representing the results of a query. The documents can be accessed as an
   * array via the `docs` property or enumerated using the `forEach` method. The
   * number of documents can be determined via the `empty` and `size`
   * properties.
   */
  export class QuerySnapshot<T = DocumentData> {
    private constructor();

    /**
     * The query on which you called `get` or `onSnapshot` in order to get this
     * `QuerySnapshot`.
     */
    readonly query: Query<T>;
    /**
     * Metadata about this snapshot, concerning its source and if it has local
     * modifications.
     */
    readonly metadata: SnapshotMetadata;

    /** An array of all the documents in the `QuerySnapshot`. */
    readonly docs: Array<QueryDocumentSnapshot<T>>;

    /** The number of documents in the `QuerySnapshot`. */
    readonly size: number;

    /** True if there are no documents in the `QuerySnapshot`. */
    readonly empty: boolean;

    /**
     * Returns an array of the documents changes since the last snapshot. If this
     * is the first snapshot, all documents will be in the list as added changes.
     *
     * @param options `SnapshotListenOptions` that control whether metadata-only
     * changes (i.e. only `DocumentSnapshot.metadata` changed) should trigger
     * snapshot events.
     */
    docChanges(options?: SnapshotListenOptions): Array<DocumentChange<T>>;

    /**
     * Enumerates all of the documents in the `QuerySnapshot`.
     *
     * @param callback A callback to be called with a `QueryDocumentSnapshot` for
     * each document in the snapshot.
     * @param thisArg The `this` binding for the callback.
     */
    forEach(
      callback: (result: QueryDocumentSnapshot<T>) => void,
      thisArg?: any
    ): void;

    /**
     * Returns true if this `QuerySnapshot` is equal to the provided one.
     *
     * @param other The `QuerySnapshot` to compare against.
     * @return true if this `QuerySnapshot` is equal to the provided one.
     */
    isEqual(other: QuerySnapshot<T>): boolean;
  }

  /**
   * The type of a `DocumentChange` may be 'added', 'removed', or 'modified'.
   */
  export type DocumentChangeType = 'added' | 'removed' | 'modified';

  /**
   * A `DocumentChange` represents a change to the documents matching a query.
   * It contains the document affected and the type of change that occurred.
   */
  export interface DocumentChange<T = DocumentData> {
    /** The type of change ('added', 'modified', or 'removed'). */
    readonly type: DocumentChangeType;

    /** The document affected by this change. */
    readonly doc: QueryDocumentSnapshot<T>;

    /**
     * The index of the changed document in the result set immediately prior to
     * this `DocumentChange` (i.e. supposing that all prior `DocumentChange` objects
     * have been applied). Is -1 for 'added' events.
     */
    readonly oldIndex: number;

    /**
     * The index of the changed document in the result set immediately after
     * this `DocumentChange` (i.e. supposing that all prior `DocumentChange`
     * objects and the current `DocumentChange` object have been applied).
     * Is -1 for 'removed' events.
     */
    readonly newIndex: number;
  }

  /**
   * A `CollectionReference` object can be used for adding documents, getting
   * document references, and querying for documents (using the methods
   * inherited from `Query`).
   */
  export class CollectionReference<T = DocumentData> extends Query<T> {
    private constructor();

    /** The collection's identifier. */
    readonly id: string;

    /**
     * A reference to the containing `DocumentReference` if this is a subcollection.
     * If this isn't a subcollection, the reference is null.
     */
    readonly parent: DocumentReference<DocumentData> | null;

    /**
     * A string representing the path of the referenced collection (relative
     * to the root of the database).
     */
    readonly path: string;

    /**
     * Get a `DocumentReference` for the document within the collection at the
     * specified path. If no path is specified, an automatically-generated
     * unique ID will be used for the returned DocumentReference.
     *
     * @param documentPath A slash-separated path to a document.
     * @return The `DocumentReference` instance.
     */
    doc(documentPath?: string): DocumentReference<T>;

    /**
     * Add a new document to this collection with the specified data, assigning
     * it a document ID automatically.
     *
     * @param data An Object containing the data for the new document.
     * @return A Promise resolved with a `DocumentReference` pointing to the
     * newly created document after it has been written to the backend.
     */
    add(data: T): Promise<DocumentReference<T>>;

    /**
     * Returns true if this `CollectionReference` is equal to the provided one.
     *
     * @param other The `CollectionReference` to compare against.
     * @return true if this `CollectionReference` is equal to the provided one.
     */
    isEqual(other: CollectionReference<T>): boolean;

    /**
     * Applies a custom data converter to this CollectionReference, allowing you
     * to use your own custom model objects with Firestore. When you call add()
     * on the returned CollectionReference instance, the provided converter will
     * convert between Firestore data and your custom type U.
     *
     * Passing in `null` as the converter parameter removes the current
     * converter.
     *
     * @param converter Converts objects to and from Firestore. Passing in
     * `null` removes the current converter.
     * @return A CollectionReference<U> that uses the provided converter.
     */
    withConverter(converter: null): CollectionReference<DocumentData>;
    /**
     * Applies a custom data converter to this CollectionReference, allowing you
     * to use your own custom model objects with Firestore. When you call add()
     * on the returned CollectionReference instance, the provided converter will
     * convert between Firestore data and your custom type U.
     *
     * Passing in `null` as the converter parameter removes the current
     * converter.
     *
     * @param converter Converts objects to and from Firestore. Passing in
     * `null` removes the current converter.
     * @return A CollectionReference<U> that uses the provided converter.
     */
    withConverter<U>(
      converter: FirestoreDataConverter<U>
    ): CollectionReference<U>;
  }

  /**
   * Sentinel values that can be used when writing document fields with `set()`
   * or `update()`.
   */
  export class FieldValue {
    private constructor();

    /**
     * Returns a sentinel used with `set()` or `update()` to include a
     * server-generated timestamp in the written data.
     */
    static serverTimestamp(): FieldValue;

    /**
     * Returns a sentinel for use with `update()` to mark a field for deletion.
     */
    static delete(): FieldValue;

    /**
     * Returns a special value that can be used with `set()` or `update()` that tells
     * the server to union the given elements with any array value that already
     * exists on the server. Each specified element that doesn't already exist in
     * the array will be added to the end. If the field being modified is not
     * already an array it will be overwritten with an array containing exactly
     * the specified elements.
     *
     * @param elements The elements to union into the array.
     * @return The FieldValue sentinel for use in a call to `set()` or `update()`.
     */
    static arrayUnion(...elements: any[]): FieldValue;

    /**
     * Returns a special value that can be used with `set()` or `update()` that tells
     * the server to remove the given elements from any array value that already
     * exists on the server. All instances of each element specified will be
     * removed from the array. If the field being modified is not already an
     * array it will be overwritten with an empty array.
     *
     * @param elements The elements to remove from the array.
     * @return The FieldValue sentinel for use in a call to `set()` or `update()`.
     */
    static arrayRemove(...elements: any[]): FieldValue;

    /**
     * Returns a special value that can be used with `set()` or `update()` that tells
     * the server to increment the field's current value by the given value.
     *
     * If either the operand or the current field value uses floating point precision,
     * all arithmetic follows IEEE 754 semantics. If both values are integers,
     * values outside of JavaScript's safe number range (`Number.MIN_SAFE_INTEGER` to
     * `Number.MAX_SAFE_INTEGER`) are also subject to precision loss. Furthermore,
     * once processed by the Firestore backend, all integer operations are capped
     * between -2^63 and 2^63-1.
     *
     * If the current field value is not of type `number`, or if the field does not
     * yet exist, the transformation sets the field to the given value.
     *
     * @param n The value to increment by.
     * @return The FieldValue sentinel for use in a call to `set()` or `update()`.
     */
    static increment(n: number): FieldValue;

    /**
     * Returns true if this `FieldValue` is equal to the provided one.
     *
     * @param other The `FieldValue` to compare against.
     * @return true if this `FieldValue` is equal to the provided one.
     */
    isEqual(other: FieldValue): boolean;
  }

  /**
   * A FieldPath refers to a field in a document. The path may consist of a
   * single field name (referring to a top-level field in the document), or a
   * list of field names (referring to a nested field in the document).
   *
   * Create a FieldPath by providing field names. If more than one field
   * name is provided, the path will point to a nested field in a document.
   *
   */
  export class FieldPath {
    /**
     * Creates a FieldPath from the provided field names. If more than one field
     * name is provided, the path will point to a nested field in a document.
     *
     * @param fieldNames A list of field names.
     */
    constructor(...fieldNames: string[]);

    /**
     * Returns a special sentinel `FieldPath` to refer to the ID of a document.
     * It can be used in queries to sort or filter by the document ID.
     */
    static documentId(): FieldPath;

    /**
     * Returns true if this `FieldPath` is equal to the provided one.
     *
     * @param other The `FieldPath` to compare against.
     * @return true if this `FieldPath` is equal to the provided one.
     */
    isEqual(other: FieldPath): boolean;
  }

  /**
   * The set of Firestore status codes. The codes are the same at the ones
   * exposed by gRPC here:
   * https://github.com/grpc/grpc/blob/master/doc/statuscodes.md
   *
   * Possible values:
   * - 'cancelled': The operation was cancelled (typically by the caller).
   * - 'unknown': Unknown error or an error from a different error domain.
   * - 'invalid-argument': Client specified an invalid argument. Note that this
   *   differs from 'failed-precondition'. 'invalid-argument' indicates
   *   arguments that are problematic regardless of the state of the system
   *   (e.g. an invalid field name).
   * - 'deadline-exceeded': Deadline expired before operation could complete.
   *   For operations that change the state of the system, this error may be
   *   returned even if the operation has completed successfully. For example,
   *   a successful response from a server could have been delayed long enough
   *   for the deadline to expire.
   * - 'not-found': Some requested document was not found.
   * - 'already-exists': Some document that we attempted to create already
   *   exists.
   * - 'permission-denied': The caller does not have permission to execute the
   *   specified operation.
   * - 'resource-exhausted': Some resource has been exhausted, perhaps a
   *   per-user quota, or perhaps the entire file system is out of space.
   * - 'failed-precondition': Operation was rejected because the system is not
   *   in a state required for the operation's execution.
   * - 'aborted': The operation was aborted, typically due to a concurrency
   *   issue like transaction aborts, etc.
   * - 'out-of-range': Operation was attempted past the valid range.
   * - 'unimplemented': Operation is not implemented or not supported/enabled.
   * - 'internal': Internal errors. Means some invariants expected by
   *   underlying system has been broken. If you see one of these errors,
   *   something is very broken.
   * - 'unavailable': The service is currently unavailable. This is most likely
   *   a transient condition and may be corrected by retrying with a backoff.
   * - 'data-loss': Unrecoverable data loss or corruption.
   * - 'unauthenticated': The request does not have valid authentication
   *   credentials for the operation.
   */
  export type FirestoreErrorCode =
    | 'cancelled'
    | 'unknown'
    | 'invalid-argument'
    | 'deadline-exceeded'
    | 'not-found'
    | 'already-exists'
    | 'permission-denied'
    | 'resource-exhausted'
    | 'failed-precondition'
    | 'aborted'
    | 'out-of-range'
    | 'unimplemented'
    | 'internal'
    | 'unavailable'
    | 'data-loss'
    | 'unauthenticated';

  /** An error returned by a Firestore operation. */
  // TODO(b/63008957): FirestoreError should extend firebase.FirebaseError
  export interface FirestoreError {
    code: FirestoreErrorCode;
    message: string;
    name: string;
    stack?: string;
  }

  export type EmulatorMockTokenOptions = firebase.EmulatorMockTokenOptions;
}
