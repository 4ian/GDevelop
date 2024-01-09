// @flow
import type { Auth } from 'firebase/auth';
import type { IdentityProvider } from '../Utils/GDevelopServices/Authentication';

export interface LoginProvider {
  loginWithEmailAndPassword({|
    email: string,
    password: string,
  |}): Promise<void>;
  loginOrSignupWithProvider({|
    provider: IdentityProvider,
  |}): Promise<void>;
}

export interface FirebaseBasedLoginProvider {
  auth: Auth;
}
