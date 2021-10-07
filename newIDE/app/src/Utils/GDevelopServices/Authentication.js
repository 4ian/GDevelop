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
  sendEmailVerification,
  updateEmail,
} from 'firebase/auth';
import { GDevelopFirebaseConfig, GDevelopUserApi } from './ApiConfigs';
import axios from 'axios';
import { showErrorBox } from '../../UI/Messages/MessageBox';

export type Profile = {|
  id: string,
  email: string,
  username: ?string,
  description: ?string,
|};

export type LoginForm = {|
  email: string,
  password: string,
|};

export type RegisterForm = {|
  email: string,
  password: string,
  username: string,
|};

export type EditForm = {|
  username: string,
  description: string,
|};

export type ChangeEmailForm = {|
  email: string,
|};

export type AuthError = {
  code:
    | 'auth/invalid-email'
    | 'auth/user-disabled'
    | 'auth/user-not-found'
    | 'auth/wrong-password'
    | 'auth/email-already-in-use'
    | 'auth/operation-not-allowed'
    | 'auth/weak-password'
    | 'auth/username-used'
    | 'auth/malformed-username'
    | 'auth/requires-recent-login',
};

export default class Authentication {
  firebaseUser: ?FirebaseUser = null;
  user: ?Profile = null;
  auth: Auth;
  _onUserLogoutCallback: ?() => void = null;

  constructor() {
    const app = initializeApp(GDevelopFirebaseConfig);
    this.auth = getAuth(app);
    onAuthStateChanged(this.auth, user => {
      if (user) {
        // User has been updated. No need to fetch more info,
        // this is handled directly by the corresponding actions (edit, signup, login...)
        this.firebaseUser = user;
      } else {
        // User has logged out.
        this.firebaseUser = null;
        if (this._onUserLogoutCallback) this._onUserLogoutCallback();
      }
    });
  }

  setOnUserLogoutCallback = (cb: () => void) => {
    this._onUserLogoutCallback = cb;
  };

  createFirebaseAccount = (form: RegisterForm): Promise<void> => {
    return createUserWithEmailAndPassword(this.auth, form.email, form.password)
      .then(userCredentials => {
        this.firebaseUser = userCredentials.user;
        sendEmailVerification(userCredentials.user);
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
      .then(authorizationHeader => {
        if (!this.firebaseUser) {
          console.error(
            'Cannot create the user as it is not logged in any more.'
          );
          throw new Error(
            'Cannot create the user as it is not logged in any more.'
          );
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

  forgotPassword = (form: LoginForm): Promise<void> => {
    return sendPasswordResetEmail(this.auth, form.email);
  };

  getFirebaseUser = (cb: (any, ?FirebaseUser) => void) => {
    if (!this.isAuthenticated()) return cb({ unauthenticated: true });
    // In order to fetch the latest firebaseUser properties (like emailVerified)
    // we have to call the reload method.
    this.auth.currentUser.reload().then(() => cb(null, this.firebaseUser));
  };

  sendFirebaseEmailVerification = (cb: () => void): Promise<void> => {
    return this.auth.currentUser.reload().then(() => {
      if (!this.firebaseUser || this.firebaseUser.emailVerified) return;
      sendEmailVerification(this.auth.currentUser).then(
        () => {
          cb();
        },
        (error: Error) => {
          showErrorBox({
            message: 'An email has been sent recently, please try again later.',
            rawError: error,
            errorId: 'email-verification-send-error',
          });
        }
      );
    });
  };

  changeEmail = (
    getAuthorizationHeader: () => Promise<string>,
    form: ChangeEmailForm
  ) => {
    return updateEmail(this.firebaseUser, form.email)
      .then(() => {
        console.log('Email successfully changed in Firebase.');
        return getAuthorizationHeader();
      })
      .then(authorizationHeader => {
        if (!this.firebaseUser) {
          console.error(
            'Cannot finish editing the user email as it is not logged in any more.'
          );
          throw new Error(
            'Cannot finish editing the user email as it is not logged in any more.'
          );
        }
        return axios.patch(
          `${GDevelopUserApi.baseUrl}/user/${this.firebaseUser.uid}`,
          {
            email: form.email,
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
      .then(() => {
        console.log('Email successfully changed in the GDevelop services.');
      })
      .catch(error => {
        console.error('An error happened during email change.', error);
        throw error;
      });
  };

  getUserProfile = (getAuthorizationHeader: () => Promise<string>) => {
    return getAuthorizationHeader()
      .then(authorizationHeader => {
        if (!this.firebaseUser) {
          console.error(
            'Cannot get the user profile as it is not logged in any more.'
          );
          throw new Error(
            'Cannot get the user profile as it is not logged in any more.'
          );
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

  editUserProfile = (
    getAuthorizationHeader: () => Promise<string>,
    form: EditForm
  ) => {
    return getAuthorizationHeader()
      .then(authorizationHeader => {
        if (!this.firebaseUser) {
          console.error(
            'Cannot finish editing the user as it is not logged in any more.'
          );
          throw new Error(
            'Cannot finish editing the user as it is not logged in any more.'
          );
        }
        const { username, description } = form;
        return axios.patch(
          `${GDevelopUserApi.baseUrl}/user/${this.firebaseUser.uid}`,
          {
            username,
            description,
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
      .then(response => response.data)
      .catch(error => {
        console.error('Error while editing user:', error);
        throw error.response.data;
      });
  };

  getFirebaseUserSync = (): ?FirebaseUser => {
    return this.firebaseUser;
  };

  logout = () => {
    signOut(this.auth)
      .then(() => {
        console.log('Logout successful.');
      })
      .catch(error => {
        console.error('An error happened during logout.', error);
        throw error;
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
