// @flow

import {
  signInWithEmailAndPassword,
  type Auth,
  signInWithCustomToken,
} from 'firebase/auth';
import type { LoginProvider, FirebaseBasedLoginProvider } from '.';
import type { IdentityProvider } from '../Utils/GDevelopServices/Authentication';
import { setupAuthenticationWebSocket } from '../Utils/GDevelopServices/Authorization';
import Window from '../Utils/Window';

const isDev = Window.isDev();

// Uncomment to use local web app.
// const webAppUrl =  'http://editor-local.gdevelop.io:3000'
const webAppUrl = 'https://editor.gdevelop.io';

class LocalLoginProvider implements LoginProvider, FirebaseBasedLoginProvider {
  auth: Auth;
  constructor(auth: Auth) {
    this.auth = auth;
  }
  async loginWithEmailAndPassword({
    email,
    password,
  }: {|
    email: string,
    password: string,
  |}) {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      // The user is now stored in `this.auth`.
    } catch (error) {
      console.error('Error while login:', error);
      throw error;
    }
  }
  async loginOrSignupWithProvider({
    provider,
  }: {|
    provider: IdentityProvider,
  |}) {
    const promise = new Promise((resolve, reject) => {
      setupAuthenticationWebSocket({
        onConnectionEstablished: connectionId => {
          const url = new URL(webAppUrl);
          url.searchParams.set('initial-dialog', 'login');
          url.searchParams.set('connection-id', connectionId);
          if (isDev) {
            url.searchParams.set('login-environment', 'dev');
          }
          Window.openExternalURL(url.toString());
        },
        onTokenReceived: async token => {
          console.log(token);
          try {
            await signInWithCustomToken(this.auth, token);
            resolve();
          } catch (error) {
            console.error(
              'An error occurred while logging in with custom token:',
              error
            );
            reject();
          }
        },
        onError: error => {
          console.error(
            'An error occurred while setting up authentication web socket:',
            error
          );
          reject();
        },
      });
    });
    return promise;
  }
}

export default LocalLoginProvider;
