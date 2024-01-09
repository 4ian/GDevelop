// @flow

import {
  signInWithEmailAndPassword,
  type Auth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import type { LoginProvider, FirebaseBasedLoginProvider } from '.';
import type { IdentityProvider } from '../Utils/GDevelopServices/Authentication';

class BrowserLoginProvider
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
    let firebaseProvider = null;
    if (provider === 'google') {
      firebaseProvider = new GoogleAuthProvider();
      firebaseProvider.addScope('profile');
      firebaseProvider.addScope('email');
    } else if (provider === 'github') {
      firebaseProvider = new GithubAuthProvider();
      // No scope needed for GitHub.
    } else if (provider === 'apple') {
      firebaseProvider = new OAuthProvider('apple.com');
      firebaseProvider.addScope('email');
      firebaseProvider.addScope('name');
    }

    if (!firebaseProvider)
      throw new Error(`Unknown provider ${provider} for login.`);

    try {
      await signInWithPopup(this.auth, firebaseProvider);
      // The user is now stored in `this.auth`.
      // TODO: Now the user is authenticated, it should be possible to communicate
      // with the server to ask to send a custom token - if requested - over a websocket
      // connection in case the desktop app is expecting a message.
    } catch (error) {
      console.error('Error while login with provider:', error);
      throw error;
    }
  }
}

export default BrowserLoginProvider;
