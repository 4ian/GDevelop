// @flow

import {
  signInWithEmailAndPassword,
  type Auth,
  signInWithCustomToken,
} from 'firebase/auth';
import type { LoginProvider, FirebaseBasedLoginProvider } from '.';
import type {
  IdentityProvider,
  LoginOptions,
} from '../Utils/GDevelopServices/Authentication';
import {
  setupAuthenticationWebSocket,
  terminateWebSocket,
} from '../Utils/GDevelopServices/Authorization';
import Window from '../Utils/Window';

const isDev = Window.isDev();

const webAppUrl = isDev
  ? 'http://editor-local.gdevelop.io:3000'
  : 'https://editor.gdevelop.io';

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
    loginOptions?: ?LoginOptions,
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
    signal,
  }: {|
    provider: IdentityProvider,
    loginOptions?: ?LoginOptions,
    signal?: AbortSignal,
  |}) {
    if (signal && signal.aborted) {
      return Promise.reject(
        new Error('Login or Signup with provider already aborted.')
      );
    }
    const promise = new Promise((resolve, reject) => {
      // Listen for abort event on signal
      if (signal) {
        signal.addEventListener('abort', () => {
          reject(new Error('Login or Signup with provider aborted.'));
        });
      }
      setupAuthenticationWebSocket({
        onConnectionEstablished: connectionId => {
          const url = new URL(webAppUrl);
          url.searchParams.set('initial-dialog', 'login');
          url.searchParams.set('connection-id', connectionId);
          Window.openExternalURL(url.toString());
        },
        onTokenReceived: async token => {
          try {
            await signInWithCustomToken(this.auth, token);
            resolve();
            terminateWebSocket();
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

  async notifyLogin(options: {| connectionId: string |}): Promise<void> {
    console.warn('notifyLogin not implemented in LocalLoginProvider.');
  }
}

export default LocalLoginProvider;
