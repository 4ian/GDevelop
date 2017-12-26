// @flow
import Auth0Lock from 'auth0-lock';

const AUTH_CONFIG = {
  domain: '4ian.eu.auth0.com',
  clientId: 'vpsTe5CLJNp7K4nM1nQHzpkentyIZX5U',
};

export type Profile = {
  nickname: string,
};

export default class Auth {
  lock = new Auth0Lock(AUTH_CONFIG.clientId, AUTH_CONFIG.domain, {
    autoclose: true,
    theme: {
      logo:
        'https://raw.githubusercontent.com/4ian/GD/gh-pages/res/icon128linux.png',
      primaryColor: '#4ab0e4',
    },
    auth: {
      responseType: 'token id_token',
      audience: `https://${AUTH_CONFIG.domain}/userinfo`,
      params: {
        scope: 'openid profile email',
      },
      redirect: false,
    },
  });

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
    // Call the show method to display the widget.
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
  }

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
  }

  logout = () => {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
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
  }
}
