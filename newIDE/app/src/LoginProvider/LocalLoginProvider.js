// @flow

import {
  signInWithEmailAndPassword,
  type Auth,
  signInWithCustomToken,
} from 'firebase/auth';
import type { LoginProvider, FirebaseBasedLoginProvider } from '.';
import type { IdentityProvider } from '../Utils/GDevelopServices/Authentication';
import { setupAuthenticationWebsocket } from '../Utils/GDevelopServices/Authorization';

class LocalLoginProvider
  implements LoginProvider, FirebaseBasedLoginProvider {
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
    // Set up websocket
    setupAuthenticationWebsocket({
      onConnectionEstablished: connectionId => {
        // TODO: Open online editor with connection id
        console.log(connectionId);
      },
      onTokenReceived: async token => {
        console.log(token);
        await signInWithCustomToken(this.auth, token);
      },
    });
  }
}

export default LocalLoginProvider;
