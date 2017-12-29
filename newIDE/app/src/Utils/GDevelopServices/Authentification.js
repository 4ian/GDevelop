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

  constructor() {
    this._handleAuthentication();
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
    const noop = () => {};
    this.lock.show();
    this.lock.on('hide', onHide || noop);
    this.lock.on('authenticated', onAuthenticated || noop);
    this.lock.on('authorization_error', onAuthorizationError || noop);
  }

  _handleAuthentication() {
    this.lock.on('authenticated', this._setSession);
    this.lock.on('authorization_error', err => {
      console.log(err);
    });
  }

  _setSession = (authResult: any) => {
    if (authResult && authResult.accessToken && authResult.idToken) {
      // Set the time that the access token will expire at
      let expiresAt = JSON.stringify(
        authResult.expiresIn * 1000 + new Date().getTime()
      );
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);
    }
  };

  getUserInfo = (cb: (any, ?Profile) => void) => {
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
      return ''
    }
  }

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
