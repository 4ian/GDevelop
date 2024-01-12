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
import type {
  IdentityProvider,
  LoginOptions,
} from '../Utils/GDevelopServices/Authentication';
import { generateCustomToken } from '../Utils/GDevelopServices/Authorization';

class BrowserLoginProvider
  implements LoginProvider, FirebaseBasedLoginProvider {
  auth: Auth;
  constructor(auth: Auth) {
    this.auth = auth;
  }

  async loginWithEmailAndPassword({
    email,
    password,
    loginOptions,
  }: {|
    email: string,
    password: string,
    loginOptions?: ?LoginOptions,
  |}) {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      // The user is now stored in `this.auth`.
      if (loginOptions && loginOptions.notifyConnection) {
        const { notifyConnection: connectionId } = loginOptions;
        await this.notifyLogin({ connectionId });
      }
    } catch (error) {
      console.error('Error while login:', error);
      throw error;
    }
  }

  async loginOrSignupWithProvider({
    provider,
    loginOptions,
  }: {|
    provider: IdentityProvider,
    loginOptions?: ?LoginOptions,
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
      if (loginOptions && loginOptions.notifyConnection) {
        const { notifyConnection: connectionId } = loginOptions;
        await this.notifyLogin({ connectionId });
      }
    } catch (error) {
      console.error('Error while login with provider:', error);
      throw error;
    }
  }

  async notifyLogin({
    connectionId,
  }: {|
    connectionId: string,
  |}): Promise<void> {
    const { currentUser } = this.auth;
    if (!currentUser) return;

    await generateCustomToken(
      currentUser.uid,
      () => currentUser.getIdToken().then(token => `Bearer ${token}`),
      { connectionId }
    );
  }
}

export default BrowserLoginProvider;
