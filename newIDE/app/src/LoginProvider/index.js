// @flow
import type { Auth } from 'firebase/auth';
import type {
  IdentityProvider,
  LoginOptions,
} from '../Utils/GDevelopServices/Authentication';

export interface LoginProvider {
  loginWithEmailAndPassword({|
    email: string,
    password: string,
    loginOptions?: ?LoginOptions,
  |}): Promise<void>;
  loginOrSignupWithProvider({|
    provider: IdentityProvider,
    loginOptions?: ?LoginOptions,
    signal?: AbortSignal,
  |}): Promise<void>;
  notifyLogin({|
    connectionId: string,
  |}): Promise<void>;
}

export interface FirebaseBasedLoginProvider {
  auth: Auth;
}
