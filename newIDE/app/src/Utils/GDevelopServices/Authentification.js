// @flow
import Auth0Lock from 'auth0-lock';
import { Auth0Config } from './ApiConfigs';

export type Profile = {
  sub: string, // This represents the userId
  nickname: string,
  picture: string,
  email: string,
  email_verified: boolean,
};

export default class Authentification {
  lock = new Auth0Lock(
    Auth0Config.clientId,
    Auth0Config.domain,
    Auth0Config.lockOptions
  );

  _noop = () => {};
  _onHide: Function = this._noop;
  _onAuthenticated: Function = this._noop;
  _onAuthorizationError: Function = this._noop;

  constructor() {
    // One time set up of Auth0 lock callback, as there is no
    // way to unregister a callback
    this.lock.on('authenticated', this._setSession);
    this.lock.on('authorization_error', err => {
      console.error(
        'There was an authorization error while authenticating',
        err
      );
    });
    this.lock.on('hide', () => this._onHide());
    this.lock.on('authenticated', () => this._onAuthenticated());
    this.lock.on('authorization_error', err => this._onAuthorizationError(err));
  }

  login({
    onHide,
    onAuthenticated,
    onAuthorizationError,
  }: {
    onHide: Function,
    onAuthenticated: Function,
    onAuthorizationError: Function,
  }) {
    this._onHide = onHide || this._noop;
    this._onAuthenticated = onAuthenticated || this._noop;
    this._onAuthorizationError = onAuthorizationError || this._noop;
    this.lock.show();
  }

  ensureAuthenticated = (cb: Function) => {
    if (this.isAuthenticated()) return cb(null);

    this.lock.checkSession(
      Auth0Config.lockOptions.auth,
      (error, authResult) => {
        this.login({
          onHide: () => cb({ userCancelled: true }),
          onAuthenticated: () => cb(null),
          onAuthorizationError: error => cb(error),
        });

        // This code should works and avoid having to show the login dialog again,
        // but for some reason authResult is always empty :/
        // if (error || !authResult) {
        //   this.login({
        //     onHide: () => cb({ userCancelled: true }),
        //     onAuthenticated: () => cb(null),
        //     onAuthorizationError: error => cb(error),
        //   });
        // } else {
        //   this._setSession(authResult);
        //   cb(null);
        // }
      }
    );
  };

  _setSession = (authResult: any) => {
    if (!authResult || !authResult.accessToken || !authResult.idToken) {
      console.log(
        'Missing information when trying to store user session',
        authResult
      );
      return;
    }

    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  };

  getUserProfile = (cb: (any, ?Profile) => void) => {
    if (!this.isAuthenticated()) cb({ unauthenticated: true });

    try {
      const accessToken = localStorage.getItem('access_token');
      this.lock.getUserInfo(accessToken, function(error, profile) {
        cb(error, profile);
      });
    } catch (err) {
      console.log('Unable to fetch user info', err);
      cb({ unknownError: true });
    }
  };

  logout = () => {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
  };

  getAuthorizationHeader = () => {
    try {
      return 'Bearer ' + (localStorage.getItem('id_token') || '');
    } catch (e) {
      return '';
    }
  };

  isAuthenticated = (): boolean => {
    // Check whether the current time is past the
    // access token's expiry time
    let storedContent = null;
    try {
      storedContent = localStorage.getItem('expires_at');
    } catch (e) {
      // Do nothing
    }
    if (!storedContent) return false;

    let expiresAt = JSON.parse(storedContent);
    return new Date().getTime() < expiresAt;
  };
}
