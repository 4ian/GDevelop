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
  getGameStatsEmail: boolean,
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
  getGameStatsEmail: boolean,
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
    | 'auth/requires-recent-login'
    | 'auth/too-many-requests',
};

export default class Authentication {
  auth: Auth;
  _onUserLogoutCallback: ?() => void | Promise<void> = null;
  _onUserUpdateCallback: ?() => void | Promise<void> = null;

  constructor() {
    const app = initializeApp(GDevelopFirebaseConfig);
    this.auth = getAuth(app);
    onAuthStateChanged(this.auth, user => {
      if (user) {
        // User has logged in or changed.
        if (this._onUserUpdateCallback) this._onUserUpdateCallback();
      } else {
        // User has logged out.
        if (this._onUserLogoutCallback) this._onUserLogoutCallback();
      }
    });
  }

  setOnUserLogoutCallback = (cb: () => void | Promise<void>) => {
    this._onUserLogoutCallback = cb;
  };

  setOnUserUpdateCallback = (cb: () => void | Promise<void>) => {
    this._onUserUpdateCallback = cb;
  };

  createFirebaseAccount = (form: RegisterForm): Promise<void> => {
    return createUserWithEmailAndPassword(this.auth, form.email, form.password)
      .then(userCredentials => {
        // The user is now stored in `this.auth`.
        sendEmailVerification(userCredentials.user);
      })
      .catch(error => {
        console.error('Error while creating firebase account:', error);
        throw error;
      });
  };

  createUser = (
    getAuthorizationHeader: () => Promise<string>,
    form: RegisterForm,
    appLanguage: string
  ): Promise<void> => {
    return getAuthorizationHeader()
      .then(authorizationHeader => {
        const { currentUser } = this.auth;
        if (!currentUser) {
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
            id: currentUser.uid,
            email: form.email,
            username: form.username,
            appLanguage: appLanguage,
          },
          {
            params: {
              userId: currentUser.uid,
            },
            headers: {
              Authorization: authorizationHeader,
            },
          }
        );
      })
      .then(() => {
        // User successfully created
      })
      .catch(error => {
        console.error('Error while creating user:', error);
        throw error;
      });
  };

  login = (form: LoginForm): Promise<void> => {
    return signInWithEmailAndPassword(this.auth, form.email, form.password)
      .then(userCredentials => {
        // The user is now stored in `this.auth`.
      })
      .catch(error => {
        console.error('Error while login:', error);
        throw error;
      });
  };

  forgotPassword = (form: LoginForm): Promise<void> => {
    return sendPasswordResetEmail(this.auth, form.email);
  };

  getFirebaseUser = async (): Promise<?FirebaseUser> => {
    const { currentUser } = this.auth;
    if (!currentUser) {
      return null;
    }

    // In order to fetch the latest firebaseUser properties (like emailVerified)
    // we have to call the reload method.
    await currentUser.reload();
    return this.auth.currentUser;
  };

  sendFirebaseEmailVerification = async (): Promise<void> => {
    {
      const { currentUser } = this.auth;
      if (!currentUser)
        throw new Error(
          'Tried to send verification email while not authenticated.'
        );

      await currentUser.reload();
    }
    const { currentUser } = this.auth;
    if (!currentUser || currentUser.emailVerified) return;

    try {
      sendEmailVerification(currentUser);
    } catch (error) {
      showErrorBox({
        message:
          'An email has been sent recently, check your inbox or please try again later.',
        rawError: error,
        errorId: 'email-verification-send-error',
      });
    }
  };

  changeEmail = async (
    getAuthorizationHeader: () => Promise<string>,
    form: ChangeEmailForm
  ) => {
    const { currentUser } = this.auth;
    if (!currentUser)
      throw new Error('Tried to change email while not authenticated.');

    return updateEmail(currentUser, form.email)
      .then(() => sendEmailVerification(currentUser))
      .then(() => {
        console.log('Email successfully changed in Firebase.');
        return getAuthorizationHeader();
      })
      .then(authorizationHeader => {
        return axios.patch(
          `${GDevelopUserApi.baseUrl}/user/${currentUser.uid}`,
          {
            email: form.email,
          },
          {
            params: {
              userId: currentUser.uid,
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

  getUserProfile = async (getAuthorizationHeader: () => Promise<string>) => {
    const { currentUser } = this.auth;
    if (!currentUser)
      throw new Error('Tried to get user profile while not authenticated.');

    return getAuthorizationHeader()
      .then(authorizationHeader => {
        return axios.get(`${GDevelopUserApi.baseUrl}/user/${currentUser.uid}`, {
          params: {
            userId: currentUser.uid,
          },
          headers: {
            Authorization: authorizationHeader,
          },
        });
      })
      .then(response => response.data)
      .catch(error => {
        console.error('Error while fetching user:', error);
        throw error;
      });
  };

  editUserProfile = async (
    getAuthorizationHeader: () => Promise<string>,
    form: EditForm,
    appLanguage: string
  ) => {
    const { currentUser } = this.auth;
    if (!currentUser)
      throw new Error('Tried to edit user profile while not authenticated.');

    return getAuthorizationHeader()
      .then(authorizationHeader => {
        const { username, description, getGameStatsEmail } = form;
        return axios.patch(
          `${GDevelopUserApi.baseUrl}/user/${currentUser.uid}`,
          {
            username,
            description,
            getGameStatsEmail,
            appLanguage,
          },
          {
            params: {
              userId: currentUser.uid,
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
        throw error;
      });
  };

  acceptGameStatsEmail = async (
    getAuthorizationHeader: () => Promise<string>
  ) => {
    const { currentUser } = this.auth;
    if (!currentUser)
      throw new Error(
        'Tried to accept game stats email while not authenticated.'
      );

    return getAuthorizationHeader()
      .then(authorizationHeader => {
        return axios.patch(
          `${GDevelopUserApi.baseUrl}/user/${currentUser.uid}`,
          { getGameStatsEmail: true },
          {
            params: { userId: currentUser.uid },
            headers: { Authorization: authorizationHeader },
          }
        );
      })
      .then(response => response.data)
      .catch(error => {
        console.error('Error while accepting game stats email:', error);
        throw error;
      });
  };

  getFirebaseUserSync = (): ?FirebaseUser => {
    return this.auth.currentUser || null;
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

  getAuthorizationHeader = async (): Promise<string> => {
    const { currentUser } = this.auth;
    if (!currentUser) throw new Error('User is not authenticated.');

    return currentUser.getIdToken().then(token => `Bearer ${token}`);
  };

  isAuthenticated = (): boolean => {
    return !!this.auth.currentUser;
  };
}
