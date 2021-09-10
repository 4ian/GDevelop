// @flow
import { initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { GDevelopFirebaseConfig, GDevelopUserApi } from './ApiConfigs';
import axios from 'axios';

export type Profile = {
  id: string,
  email: string,
  username: ?string,
};

export type LoginForm = {
  email: string,
  password: string,
};

export type RegisterForm = {
  email: string,
  password: string,
  username: string,
};

export type ForgotPasswordForm = {
  email: string,
};

export type AuthError = {
  code:
    | 'auth/invalid-email'
    | 'auth/user-disabled'
    | 'auth/user-not-found'
    | 'auth/wrong-password'
    | 'auth/email-already-in-use'
    | 'auth/operation-not-allowed'
    | 'auth/weak-password'
    | 'auth/username-used',
};

export default class Authentification {
  firebaseUser: ?FirebaseUser = null;
  user: ?Profile = null;
  auth: Auth;
  _onUserChangeCb: ?() => void = null;

  constructor() {
    const app = initializeApp(GDevelopFirebaseConfig);
    this.auth = getAuth(app);
    onAuthStateChanged(this.auth, user => {
      if (user) {
        this.firebaseUser = user;
      } else {
        this.firebaseUser = null;
      }
    });
  }

  onUserChange = (cb: () => void) => {
    this._onUserChangeCb = cb;
  };

  createFirebaseAccount = (form: RegisterForm): Promise<void> => {
    return createUserWithEmailAndPassword(this.auth, form.email, form.password)
      .then(userCredentials => {
        this.firebaseUser = userCredentials.user;
      })
      .catch(error => {
        console.error('Error while creating firebase account:', error);
        throw error;
      });
  };

  createUser = (
    getAuthorizationHeader: () => Promise<string>,
    form: RegisterForm
  ): Promise<void> => {
    return getAuthorizationHeader()
      .then((authorizationHeader) => {
        if (!this.firebaseUser) {
          console.error('Cannot get user if not logged in');
          throw new Error('Cannot get user if not logged in');
        }
        return axios.post(
          `${GDevelopUserApi.baseUrl}/user`,
          {
            id: this.firebaseUser.uid,
            email: form.email,
            username: form.username,
          },
          {
            params: {
              userId: this.firebaseUser.uid,
            },
            headers: {
              Authorization: authorizationHeader,
            },
          }
        );
      })
      .then(response => {
        this.user = response.data;
      })
      .catch(error => {
        console.error('Error while creating user:', error);
        throw error;
      });
  };

  login = (form: LoginForm): Promise<void> => {
    return signInWithEmailAndPassword(this.auth, form.email, form.password)
      .then(userCredentials => {
        this.firebaseUser = userCredentials.user;
      })
      .catch(error => {
        console.error('Error while login:', error);
        throw error;
      });
  };

  forgotPassword = (form: ForgotPasswordForm): Promise<void> => {
    return sendPasswordResetEmail(this.auth, form.email);
  };

  getFirebaseUser = (cb: (any, ?FirebaseUser) => void) => {
    if (!this.isAuthenticated()) return cb({ unauthenticated: true });

    cb(null, this.firebaseUser);
  };

  getUserProfile = (getAuthorizationHeader: () => Promise<string>) => {
    return getAuthorizationHeader()
      .then(authorizationHeader => {
        if (!this.firebaseUser) {
          console.error('Cannot get user if not logged in');
          throw new Error('Cannot get user if not logged in');
        }
        return axios.get(
          `${GDevelopUserApi.baseUrl}/user/${this.firebaseUser.uid}`,
          {
            params: {
              userId: this.firebaseUser.uid,
            },
            headers: {
              Authorization: authorizationHeader,
            },
          }
        );
      })
      .then(response => response.data)
      .catch(error => {
        console.error('Error while fetching user:', error);
        throw error;
      });
  };

  getFirebaseUserSync = (): ?FirebaseUser => {
    return this.firebaseUser;
  };

  logout = () => {
    signOut(this.auth)
      .then(() => {
        console.log('Logout successful');
      })
      .catch(error => {
        console.log('An error happened during logout', error);
      });
  };

  getAuthorizationHeader = (): Promise<string> => {
    if (!this.firebaseUser)
      return Promise.reject(new Error('User is not authenticated'));

    return this.firebaseUser.getIdToken().then(token => `Bearer ${token}`);
  };

  isAuthenticated = (): boolean => {
    return !!this.firebaseUser;
  };
}
