// flow-typed signature: 0a7c5018a7783bafd1ecdfe3a87e17c7
// flow-typed version: 0dcf7d868b/firebase_v5.x.x/flow_>=v0.34.x

/* @flow */
/** ** firebase ****/

declare interface $npm$firebase$Config {
  apiKey: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

declare interface $npm$firebase$auth$Error {
  code:
    | 'auth/app-deleted'
    | 'auth/app-not-authorized'
    | 'auth/argument-error'
    | 'auth/invalid-api-key'
    | 'auth/invalid-user-token'
    | 'auth/network-request-failed'
    | 'auth/operation-not-allowed'
    | 'auth/requires-recent-login'
    | 'auth/too-many-requests'
    | 'auth/unauthorized-domain'
    | 'auth/user-disabled'
    | 'auth/user-token-expired'
    | 'auth/web-storage-unsupported'
    | 'auth/invalid-email'
    | 'auth/account-exists-with-different-credential'
    | 'auth/invalid-credential'
    | 'auth/user-not-found'
    | 'auth/wrong-password'
    | 'auth/invalid-verification-code'
    | 'auth/invalid-verification-id'
    | 'auth/expired-action-code'
    | 'auth/invalid-action-code'
    | 'auth/invalid-verification-code'
    | 'auth/missing-verification-code'
    | 'auth/captcha-check-failed'
    | 'auth/invalid-phone-number'
    | 'auth/missing-phone-number'
    | 'auth/quota-exceeded'
    | 'auth/credential-already-in-use'
    | 'auth/email-already-in-use'
    | 'auth/provider-already-linked'
    | 'auth/auth-domain-config-required'
    | 'auth/cancelled-popup-request'
    | 'auth/popup-blocked'
    | 'auth/operation-not-supported-in-this-environment'
    | 'auth/popup-closed-by-user'
    | 'auth/unauthorized-domain'
    | 'auth/no-such-provider';
  message: string;
}

declare interface $npm$firebase$Error {
  code: $PropertyType<$npm$firebase$auth$Error, 'code'> | 'app/no-app';
  message: string;
  name: string;
  stack: ?string;
}

/** *** app *****/
declare class $npm$firebase$App {
  name: string;
  +options: $npm$firebase$Config;
  auth(): $npm$firebase$auth$Auth;
  database(): $npm$firebase$database$Database;
  storage(): $npm$firebase$storage$Storage;
  firestore(): $npm$firebase$firestore$Firestore;
  delete(): Promise<void>;
}

/** **** auth *******/
declare interface $npm$firebase$auth$ActionCodeInfo {
  data: { email: string };
}

declare interface $npm$firebase$auth$ApplicationVerifier {
  type: string;
  verify(): Promise<string>;
}

declare type $npm$firebase$auth$Auth$Persistence = {
  +LOCAL: 'local',
  +SESSION: 'session',
  +NONE: 'none',
};

declare type $npm$firebase$auth$Auth$Persistence$Enum = $Values<$npm$firebase$auth$Auth$Persistence>;

declare class $npm$firebase$auth$Auth {
  static Persistence: $npm$firebase$auth$Auth$Persistence;
  app: $npm$firebase$App;
  currentUser: $npm$firebase$auth$User | null;
  applyActionCode(code: string): Promise<void>;
  checkActionCode(code: string): Promise<$npm$firebase$auth$ActionCodeInfo>;
  confirmPasswordReset(code: string, newPassword: string): Promise<void>;
  createCustomToken(uid: string, developerClaims?: {}): string;
  createUserWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<$npm$firebase$auth$UserCredential>;
  fetchProvidersForEmail(email: string): Promise<Array<string>>;
  onAuthStateChanged(
    nextOrObserver: (?$npm$firebase$auth$User) => void | Promise<void>,
    error?: (error: $npm$firebase$auth$Error) => void,
    completed?: () => void
  ): () => void;
  onIdTokenChanged(
    nextOrObserver: Object | ((user?: $npm$firebase$auth$User) => void | Promise<void>),
    error?: (error: $npm$firebase$auth$Error) => void,
    completed?: () => void
  ): () => void;
  sendPasswordResetEmail(email: string): Promise<void>;
  setPersistence(persistence: $npm$firebase$auth$Auth$Persistence$Enum): Promise<void>;
  signInAndRetrieveDataWithCredential(
    credential: $npm$firebase$auth$AuthCredential
  ): Promise<$npm$firebase$auth$UserCredential>;
  signInAnonymously(): Promise<$npm$firebase$auth$User>;
  signInWithCredential(
    credential: $npm$firebase$auth$AuthCredential
  ): Promise<$npm$firebase$auth$User>;
  signInWithCustomToken(token: string): Promise<$npm$firebase$auth$User>;
  signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<$npm$firebase$auth$UserCredential>;
  signInWithPhoneNumber(
    phoneNumber: string,
    applicationVerifier: $npm$firebase$auth$ApplicationVerifier
  ): Promise<$npm$firebase$auth$ConfirmationResult>;
  signInWithPopup(
    provider: $npm$firebase$auth$AuthProvider
  ): Promise<$npm$firebase$auth$UserCredential>;
  signOut(): Promise<void>;
  verifyIdToken(idToken: string): Promise<Object>;
  verifyPasswordResetCode(code: string): Promise<string>;
}

declare interface $npm$firebase$auth$AuthCredential {
  providerId: string;
}

declare class $npm$firebase$auth$AuthProvider {
  providerId: string;
}

declare interface $npm$firebase$auth$ConfirmationResult {
  verificationId: string;
  confirm(verificationCode: string): Promise<$npm$firebase$auth$UserCredential>;
}

declare type $npm$firebase$auth$UserProfile = {
  displayName?: string,
  photoURL?: string
};

declare interface $npm$firebase$auth$AdditionalUserInfo {
  providerId: string;
  profile?: $npm$firebase$auth$UserProfile;
  username?: string;
}

declare interface $npm$firebase$auth$UserCredential {
  user: $npm$firebase$auth$User;
  credential?: $npm$firebase$auth$AuthCredential;
  operationType?: string;
  additionalUserInfo?: $npm$firebase$auth$AdditionalUserInfo;
}

declare class $npm$firebase$auth$UserInfo {
  displayName: ?string;
  email: ?string;
  photoURL: ?string;
  providerId: string;
  uid: string;
}

declare type $npm$firebase$actionCode$settings = {
  url: string,
  iOS?: { bundleId: string },
  android?: {
    packageName: string,
    installApp?: boolean,
    minimumVersion?: string,
  },
  handleCodeInApp?: boolean,
}

declare class $npm$firebase$auth$User extends $npm$firebase$auth$UserInfo {
  displayName: ?string;
  email: ?string;
  emailVerified: boolean;
  isAnonymous: boolean;
  phoneNumber: ?string;
  photoUrl: ?string;
  providerData: Array<$npm$firebase$auth$UserInfo>;
  providerId: string;
  refreshToken: string;
  uid: string;
  delete(): Promise<void>;
  getIdToken(forceRefresh?: boolean): Promise<string>;
  getToken(forceRefresh?: boolean): Promise<string>;
  linkAndRetrieveDataWithCredential(
    credential: $npm$firebase$auth$AuthCredential
  ): Promise<$npm$firebase$auth$UserCredential>;
  linkWithCredential(
    credential: $npm$firebase$auth$AuthCredential
  ): Promise<$npm$firebase$auth$User>;
  linkWithPhoneNumber(
    phoneNumber: string,
    applicationVerifier: $npm$firebase$auth$ApplicationVerifier
  ): Promise<$npm$firebase$auth$ConfirmationResult>;
  linkWithPopup(
    provider: $npm$firebase$auth$OAuthProvider
  ): Promise<$npm$firebase$auth$UserCredential>;
  reauthenticateAndRetrieveDataWithCredential(
    credential: $npm$firebase$auth$AuthCredential
  ): Promise<void>;
  reauthenticateWithCredential(
    credential: $npm$firebase$auth$AuthCredential
  ): Promise<void>;
  reauthenticateWithPhoneNumber(
    phoneNumber: string,
    applicationVerifier: $npm$firebase$auth$ApplicationVerifier
  ): Promise<$npm$firebase$auth$ConfirmationResult>;
  reload(): Promise<void>;
  sendEmailVerification(actionCodeSettings?: $npm$firebase$actionCode$settings): Promise<void>;
  toJSON(): Object;
  unlink(providerId: string): Promise<$npm$firebase$auth$User>;
  updateEmail(newEmail: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  updatePhoneNumber(
    phoneCredential: $npm$firebase$auth$AuthCredential
  ): Promise<void>;
  updateProfile(profile: $npm$firebase$auth$UserProfile): Promise<void>;
}

declare class $npm$firebase$auth$EmailAuthProvider extends $npm$firebase$auth$AuthProvider {
  static EMAIL_LINK_SIGN_IN_METHOD: string;
  static EMAIL_PASSWORD_SIGN_IN_METHOD: string;
  static PROVIDER_ID: string;
  static credential(
    email: string,
    password: string
  ): $npm$firebase$auth$AuthCredential;
  static credentialWithLink(
    email: string,
    emailLink: string
  ): $npm$firebase$auth$AuthCredential;
  providerId: string;
}

declare class $npm$firebase$auth$FacebookAuthProvider extends $npm$firebase$auth$AuthProvider {
  static FACEBOOK_SIGN_IN_METHOD: string;
  static PROVIDER_ID: string;
  static credential(token: string): $npm$firebase$auth$AuthCredential;
  addScope(scope: string): $npm$firebase$auth$FacebookAuthProvider;
  setCustomParameters(
    customOAuthParameters: Object
  ): $npm$firebase$auth$FacebookAuthProvider;
  providerId: string
}

declare class $npm$firebase$auth$GithubAuthProvider extends $npm$firebase$auth$AuthProvider {
  static GITHUB_SIGN_IN_METHOD: string;
  static PROVIDER_ID: string;
  static credential(token: string): $npm$firebase$auth$AuthCredential;
  addScope(scope: string): $npm$firebase$auth$GithubAuthProvider;
  setCustomParameters(
    customOAuthParameters: Object
  ): $npm$firebase$auth$GithubAuthProvider;
  providerId: string;
}

declare class $npm$firebase$auth$GoogleAuthProvider extends $npm$firebase$auth$AuthProvider {
  static GOOGLE_SIGN_IN_METHOD: string;
  static PROVIDER_ID: string;
  static credential(
    idToken?: string,
    accessToken?: string
  ): $npm$firebase$auth$AuthCredential;
  addScope(scope: string): $npm$firebase$auth$GoogleAuthProvider;
  setCustomParameters(
    customOAuthParameters: Object
  ): $npm$firebase$auth$GoogleAuthProvider;
}

declare class $npm$firebase$auth$PhoneAuthProvider extends $npm$firebase$auth$AuthProvider {
  static PHONE_SIGN_IN_METHOD: string;
  static PROVIDER_ID: string;
  static credential(
    verificationId: string,
    verificationCode: string
  ): $npm$firebase$auth$AuthCredential;
  constructor(
    auth?: $npm$firebase$auth$Auth
  ): $npm$firebase$auth$PhoneAuthProvider;
  verifyPhoneNumber(
    phoneNumber: string,
    applicationVerifier: $npm$firebase$auth$ApplicationVerifier
  ): Promise<string>;
  providerId: string;
}

declare class $npm$firebase$auth$TwitterAuthProvider extends $npm$firebase$auth$AuthProvider {
  static PROVIDER_ID: string;
  credential(token: string, secret: string): $npm$firebase$auth$AuthCredential;
  setCustomParameters(customOAuthParameters: Object): this;
}

declare type $npm$firebase$auth$OAuthProvider =
  | $npm$firebase$auth$FacebookAuthProvider
  | $npm$firebase$auth$GithubAuthProvider
  | $npm$firebase$auth$GoogleAuthProvider
  | $npm$firebase$auth$TwitterAuthProvider;

/** **** database ******/
declare type $npm$firebase$database$Value = any;
declare type $npm$firebase$database$OnCompleteCallback = (
  error: ?Object
) => void;
declare type $npm$firebase$database$QueryEventType =
  | 'value'
  | 'child_added'
  | 'child_changed'
  | 'child_removed'
  | 'child_moved';
declare type $npm$firebase$database$Priority = string | number | null;

declare class $npm$firebase$database$Database {
  app: $npm$firebase$App;
  goOffline(): void;
  goOnline(): void;
  ref(path?: string): $npm$firebase$database$Reference;
  refFromURL(url: string): $npm$firebase$database$Reference;
}

declare class $npm$firebase$database$DataSnapshot {
  key: ?string;
  ref: $npm$firebase$database$Reference;
  child(path?: string): $npm$firebase$database$DataSnapshot;
  exists(): boolean;
  exportVal(): $npm$firebase$database$Value;
  forEach(action: ($npm$firebase$database$DataSnapshot) => ?boolean): boolean;
  getPriority(): $npm$firebase$database$Priority;
  hasChild(path: string): boolean;
  hasChildren(): boolean;
  numChildren(): number;
  toJSON(): Object;
  val(): $npm$firebase$database$Value;
}

declare class $npm$firebase$database$OnDisconnect {
  cancel(onComplete?: $npm$firebase$database$OnCompleteCallback): Promise<void>;
  remove(onComplete?: $npm$firebase$database$OnCompleteCallback): Promise<void>;
  set(
    value: $npm$firebase$database$Value,
    onComplete?: $npm$firebase$database$OnCompleteCallback
  ): Promise<void>;
  setWithPriority(
    value: $npm$firebase$database$Value,
    priority: number | string | null,
    onComplete?: $npm$firebase$database$OnCompleteCallback
  ): Promise<void>;
  update(
    values: { +[path: string]: $npm$firebase$database$Value },
    onComplete?: $npm$firebase$database$OnCompleteCallback
  ): Promise<void>;
}

declare type $npm$firebase$database$Callback = (
  $npm$firebase$database$DataSnapshot,
  ?string
) => void | Promise<void>;

declare class $npm$firebase$database$Query {
  ref: $npm$firebase$database$Reference;
  endAt(
    value: number | string | boolean | null,
    key?: string
  ): $npm$firebase$database$Query;
  equalTo(
    value: number | string | boolean | null,
    key?: string
  ): $npm$firebase$database$Query;
  isEqual(other: $npm$firebase$database$Query): boolean;
  limitToFirst(limit: number): $npm$firebase$database$Query;
  limitToLast(limit: number): $npm$firebase$database$Query;
  off(
    eventType?: $npm$firebase$database$QueryEventType,
    callback?: $npm$firebase$database$Callback,
    context?: Object
  ): void;
  on(
    eventType: $npm$firebase$database$QueryEventType,
    callback: $npm$firebase$database$Callback,
    cancelCallbackOrContext?: (error: Object) => void | Object,
    context?: $npm$firebase$database$Callback
  ): $npm$firebase$database$Callback;
  once(
    eventType: $npm$firebase$database$QueryEventType,
    successCallback?: $npm$firebase$database$Callback,
    failureCallbackOrContext?: (error: Object) => void | Object,
    context?: Object
  ): Promise<$npm$firebase$database$DataSnapshot>;
  orderByChild(path: string): $npm$firebase$database$Query;
  orderByKey(): $npm$firebase$database$Query;
  orderByPriority(): $npm$firebase$database$Query;
  orderByValue(): $npm$firebase$database$Query;
  startAt(
    value: number | string | boolean | null,
    key?: string
  ): $npm$firebase$database$Query;
  toJSON(): Object;
  toString(): string;
}

declare class $npm$firebase$database$Reference extends $npm$firebase$database$Query {
  key: ?string;
  parent?: $npm$firebase$database$Reference;
  root: $npm$firebase$database$Reference;
  child(path: string): $npm$firebase$database$Reference;
  onDisconnect(): $npm$firebase$database$OnDisconnect;
  push(
    value?: $npm$firebase$database$Value,
    onComplete?: $npm$firebase$database$OnCompleteCallback
  ): $npm$firebase$database$ThenableReference & Promise<void>;
  remove(onComplete?: $npm$firebase$database$OnCompleteCallback): Promise<void>;
  set(
    value: $npm$firebase$database$Value,
    onComplete?: $npm$firebase$database$OnCompleteCallback
  ): Promise<void>;
  setPriority(
    priority: $npm$firebase$database$Priority,
    onComplete?: $npm$firebase$database$OnCompleteCallback
  ): Promise<void>;
  setWithPriority(
    newVal: $npm$firebase$database$Value,
    newPriority: $npm$firebase$database$Priority,
    onComplete?: $npm$firebase$database$OnCompleteCallback
  ): Promise<void>;
  transaction(
    transactionUpdate: (
      data: $npm$firebase$database$Value
    ) => $npm$firebase$database$Value,
    onComplete?: (
      error: null | Object,
      committed: boolean,
      snapshot: $npm$firebase$database$DataSnapshot
    ) => void,
    applyLocally?: boolean
  ): Promise<{
    committed: boolean,
    snapshot: $npm$firebase$database$DataSnapshot | null
  }>;
  update(
    values: { [path: string]: $npm$firebase$database$Value },
    onComplete?: $npm$firebase$database$OnCompleteCallback
  ): Promise<void>;
}

declare class $npm$firebase$database$ServerValue {
  static TIMESTAMP: {};
}

declare class $npm$firebase$database$ThenableReference extends $npm$firebase$database$Reference {}

/** **** firestore ******/
declare class $npm$firebase$firestore$Firestore {
  app: $npm$firebase$App;
  batch(): $npm$firebase$firestore$WriteBatch;
  collection(collectionPath: string): $npm$firebase$firestore$CollectionReference;
  doc(documentPath: string): $npm$firebase$firestore$DocumentReference;
  enableNetwork(): Promise<void>;
  disableNetwork(): Promise<void>;
  enablePersistence(settings?: $npm$firebase$firestore$PersistenceSettings): Promise<void>;
  runTransaction(updateFunction: (transaction: $npm$firebase$firestore$Transaction) => Promise<any>): Promise<any>;
  setLogLevel(logLevel: 'debug' | 'error' | 'silent'): void;
  settings(settings: $npm$firebase$firestore$Settings): void;
  getAll(
    ...docs: Array<$npm$firebase$firestore$DocumentReference>
  ): Promise<Array<$npm$firebase$firestore$DocumentSnapshot>>;
}

declare interface $npm$firebase$firestore$Blob {
  fromBase64String(base64: string): $npm$firebase$firestore$Blob;
  fromUint8Array(array: Uint8Array): $npm$firebase$firestore$Blob;
  toBase64(): string;
  toUintArray(): Uint8Array;
}

declare interface $npm$firebase$firestore$QueryListenOptions {
  includeMetadataChanges: boolean;
  includeQueryMetadataChanges: boolean;
}

declare type $npm$firebase$firestore$documentObserver = (snapshot: $npm$firebase$firestore$DocumentSnapshot) => void | Promise<void>;
declare type $npm$firebase$firestore$queryObserver = (snapshot: $npm$firebase$firestore$QuerySnapshot) => void | Promise<void>;
declare type $npm$firebase$firestore$observerError = (error: $npm$firebase$Error) => void | Promise<void>;
declare type $npm$firebase$firestore$GetOptions = {
  source?: 'default' | 'cache' | 'server'
}

declare class $npm$firebase$firestore$Query {
  firestore: $npm$firebase$firestore$Firestore;
  endAt(snapshotOrVarArgs: $npm$firebase$firestore$DocumentSnapshot | {}): $npm$firebase$firestore$Query;
  endBefore(snapshotOrVarArgs: $npm$firebase$firestore$DocumentSnapshot | {}): $npm$firebase$firestore$Query;
  get(getOptions?: $npm$firebase$firestore$GetOptions): Promise<$npm$firebase$firestore$QuerySnapshot>;
  isEqual(other: $npm$firebase$firestore$Query): boolean;
  limit(limit: number): $npm$firebase$firestore$Query;
  onSnapshot(
    optionsOrObserverOrOnNext: $npm$firebase$firestore$QueryListenOptions | $npm$firebase$firestore$queryObserver,
    observerOrOnNextOrOnError?: | $npm$firebase$firestore$QueryListenOptions
    | $npm$firebase$firestore$queryObserver
    | $npm$firebase$firestore$observerError,
    onError?: $npm$firebase$firestore$observerError
  ): () => void;
  orderBy(
    fieldPath: $npm$firebase$firestore$FieldPath | string,
    directionStr: 'asc' | 'desc'
  ): $npm$firebase$firestore$Query;
  startAfter(snapshotOrVarArgs: $npm$firebase$firestore$DocumentSnapshot | {}): $npm$firebase$firestore$Query;
  startAt(snapshotOrVarArgs: $npm$firebase$firestore$DocumentSnapshot | {}): $npm$firebase$firestore$Query;
  where(fieldPath: string, opStr: '<' | '<=' | '==' | 'array-contains' | '>' | '>=', value: any): $npm$firebase$firestore$Query;
}

declare class $npm$firebase$firestore$CollectionReference extends $npm$firebase$firestore$Query {
  constructor(): $npm$firebase$firestore$CollectionReference;
  id: string;
  parent: $npm$firebase$firestore$DocumentReference | null;
  add(data: { +[string]: mixed }): Promise<$npm$firebase$firestore$DocumentReference>;
  doc(documentPath?: string): $npm$firebase$firestore$DocumentReference;
}

declare interface $npm$firebase$firestore$DocumentChange {
  type: 'added' | 'removed' | 'modified';
  doc: $npm$firebase$firestore$DocumentSnapshot;
  oldIndex: number;
  newIndex: number;
}

declare class $npm$firebase$firestore$DocumentReference {
  firestore: $npm$firebase$firestore$Firestore;
  id: string;
  path: string;
  parent: typeof $npm$firebase$firestore$CollectionReference;
  collection(collectionPath: string): $npm$firebase$firestore$CollectionReference;
  delete(): Promise<void>;
  get(): Promise<$npm$firebase$firestore$DocumentSnapshot>;
  isEqual(other: $npm$firebase$firestore$DocumentReference): boolean;
  onSnapshot(
    optionsOrObserverOrOnNext: $npm$firebase$firestore$QueryListenOptions
    | $npm$firebase$firestore$documentObserver,
    observerOrOnNextOrOnError?: | $npm$firebase$firestore$QueryListenOptions
    | $npm$firebase$firestore$documentObserver
    | $npm$firebase$firestore$observerError,
    onError?: $npm$firebase$firestore$observerError
  ): () => void;
  set(data: { +[string]: mixed }, options?: {| merge?: boolean, mergeFields?: string[] |} | null): Promise<void>;
  update(...args: Array<any>): Promise<void>;
}

declare class $npm$firebase$firestore$DocumentSnapshot {
  data(): {| +[string]: any |};
  get(fieldpath: typeof $npm$firebase$firestore$FieldPath): any;
  isEqual(other: $npm$firebase$firestore$DocumentSnapshot): boolean;
  exists: boolean;
  id: string;
  metadata: $npm$firebase$firestore$SnapshotMetadata;
  ref: $npm$firebase$firestore$DocumentReference;
}

declare class $npm$firebase$firestore$FieldPath {
  constructor(...args: Array<any>): $npm$firebase$firestore$FieldPath;
  static documentId(): typeof $npm$firebase$firestore$FieldPath;
  isEqual(other: $npm$firebase$firestore$FieldPath): boolean;
}

declare class $npm$firebase$firestore$FieldValue {
  static delete(): $npm$firebase$firestore$FieldValue;
  static serverTimestamp(): $npm$firebase$firestore$FieldValue;
  static arrayUnion(...elements: any[]): $npm$firebase$firestore$FieldValue;
  static arrayRemove(...elements: any[]): $npm$firebase$firestore$FieldValue;
  isEqual(other: $npm$firebase$firestore$FieldPath): boolean;
}

declare type $npm$firebase$firestore$FirestoreError =
  | 'cancelled'
  | 'unknown'
  | 'invalid-argument'
  | 'deadline-exceeded'
  | 'not-found'
  | 'already-exists'
  | 'permission-denied'
  | 'resource-exhausted'
  | 'failed-precondition'
  | 'aborted'
  | 'out-of-range'
  | 'unimplemented'
  | 'internal'
  | 'unavailable'
  | 'data-loss'
  | 'unauthenticated';

declare class $npm$firebase$firestore$GeoPoint {
  constructor(latitude: number, longitude: number): $npm$firebase$firestore$GeoPoint;
  latitude: number;
  longitude: number;
  isEqual(other: $npm$firebase$firestore$GeoPoint): boolean;
}

declare class $npm$firebase$firestore$QuerySnapshot {
  docChanges(): Array<$npm$firebase$firestore$DocumentChange>;
  docs: Array<$npm$firebase$firestore$DocumentSnapshot>;
  empty: boolean;
  metadata: $npm$firebase$firestore$SnapshotMetadata;
  query: $npm$firebase$firestore$Query;
  size: number;
  forEach((snapshot: $npm$firebase$firestore$DocumentSnapshot, thisArg?: any) => void): void;
  isEqual(other: $npm$firebase$firestore$QuerySnapshot): boolean;
}

declare type $npm$firebase$firestore$Settings = {|
  +host?: string;
  +ssl?: boolean;
  +timestampsInSnapshots?: boolean;
  +cacheSizeBytes?: number;
|};

declare type $npm$firebase$firestore$PersistenceSettings = {|
  +experimentalTabSynchronization?: boolean;
|};

declare interface $npm$firebase$firestore$SnapshotMetadata {
  fromCache: boolean;
  hasPendingWrites: boolean;
}

declare interface $npm$firebase$firestore$Transaction {
  delete(documentRef: $npm$firebase$firestore$DocumentReference): $npm$firebase$firestore$Transaction;
  get(documentRef: $npm$firebase$firestore$DocumentReference): Promise<$npm$firebase$firestore$DocumentSnapshot>;
  set(
    documentRef: $npm$firebase$firestore$DocumentReference,
    data: { +[string]: mixed },
    options?: { merge: boolean }
  ): $npm$firebase$firestore$Transaction;
  update(documentRef: $npm$firebase$firestore$DocumentReference, ...args: Array<any>): $npm$firebase$firestore$Transaction;
}

declare interface $npm$firebase$firestore$WriteBatch {
  commit(): Promise<void>;
  delete(documentRef: $npm$firebase$firestore$DocumentReference): $npm$firebase$firestore$WriteBatch;
  set(
    documentRef: $npm$firebase$firestore$DocumentReference,
    data: { +[string]: mixed },
    options?: { merge: boolean }
  ): $npm$firebase$firestore$WriteBatch;
  update(documentRef: $npm$firebase$firestore$DocumentReference, ...args: Array<any>): $npm$firebase$firestore$WriteBatch;
}

/** **** messaging ******/
declare class $npm$firebase$messaging$Messaging {
  deleteToken(token: string): Promise<any>;
  getToken(): Promise<?string>;
  onMessage(nextOrObserver: ({}) => void | {}): () => void;
  onTokenRefresh(nextOrObserver: ({}) => void | {}): () => void;
  requestPermission(): Promise<any>;
  setBackgroundMessageHandler(callback: (value: {}) => void): void;
  useServiceWorker(registration: any): void;
}

/** **** storage ******/
declare type $npm$firebase$storage$StringFormat =
  | 'raw'
  | 'base64'
  | 'base64url'
  | 'data_url';
declare type $npm$firebase$storage$TaskEvent = 'state_changed';
declare type $npm$firebase$storage$TaskState =
  | 'running'
  | 'paused'
  | 'success'
  | 'canceled'
  | 'error';

declare class $npm$firebase$storage$Storage {
  app: $npm$firebase$App;
  maxOperationRetryTime: number;
  maxUploadRetryTime: number;
  ref(path?: string): $npm$firebase$storage$Reference;
  refFromURL(url: string): $npm$firebase$storage$Reference;
  setMaxOperationRetryTime(time: number): void;
  setMaxUploadRetryTime(time: number): void;
}

declare class $npm$firebase$storage$FullMetadata extends $npm$firebase$storage$UploadMetadata {
  bucket: string;
  downloadURLs: Array<string>;
  fullPath: string;
  generation: string;
  metageneration: string;
  name: string;
  size: number;
  timeCreated: string;
  updated: string;
}

declare class $npm$firebase$storage$Reference {
  bucket: string;
  fullPath: string;
  name: string;
  parent?: $npm$firebase$storage$Reference;
  root: $npm$firebase$storage$Reference;
  storage: $npm$firebase$storage$Storage;
  child(path: string): $npm$firebase$storage$Reference;
  delete(): Promise<void>;
  getDownloadURL(): Promise<string>;
  getMetadata(): Promise<$npm$firebase$storage$FullMetadata>;
  put(
    data: Blob | Uint8Array | ArrayBuffer,
    metadata?: $npm$firebase$storage$UploadMetadata
  ): $npm$firebase$storage$UploadTask;
  putString(
    data: string,
    format: $npm$firebase$storage$StringFormat,
    metadata?: $npm$firebase$storage$UploadMetadata
  ): $npm$firebase$storage$UploadTask;
  toString(): string;
  updateMetadata(
    metadata: $npm$firebase$storage$SettableMetadata
  ): Promise<$npm$firebase$storage$FullMetadata>;
}

declare class $npm$firebase$storage$SettableMetadata {
  cacheControl?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  contentLanguage?: string;
  contentType?: string;
  customMetadata?: { [key: string]: string | void };
}

declare class $npm$firebase$storage$UploadMetadata extends $npm$firebase$storage$SettableMetadata {
  md5Hash?: string;
}

declare interface $npm$firebase$storage$Observer {
  next: (snapshot: $npm$firebase$storage$UploadTaskSnapshot) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

declare type $npm$firebase$storage$Unsubscribe = () => void;

declare type $npm$firebase$storage$Subscribe = (
  observerOrNext: | $npm$firebase$storage$Observer
  | ((snapshot: $npm$firebase$storage$UploadTaskSnapshot) => void),
  onError?: (error: Error) => void,
  onComplete?: () => void
) => $npm$firebase$storage$Unsubscribe;

declare class $npm$firebase$storage$UploadTask extends Promise<
  $npm$firebase$storage$UploadTaskSnapshot
> {
  snapshot: $npm$firebase$storage$UploadTaskSnapshot;
  cancel(): boolean;
  on(
    event: $npm$firebase$storage$TaskEvent,
    ...rest: Array<void>
  ): $npm$firebase$storage$Subscribe;
  on(
    event: $npm$firebase$storage$TaskEvent,
    observerOrNext: | $npm$firebase$storage$Observer
    | ((snapshot: $npm$firebase$storage$UploadTaskSnapshot) => void),
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): $npm$firebase$storage$Unsubscribe;
  pause(): boolean;
  resume(): boolean;
}

declare class $npm$firebase$storage$UploadTaskSnapshot {
  bytesTransferred: number;
  downloadURL?: string;
  metadata: $npm$firebase$storage$FullMetadata;
  ref: $npm$firebase$storage$Reference;
  state: $npm$firebase$storage$TaskState;
  task: $npm$firebase$storage$UploadTask;
  totalBytes: number;
}

declare type $npm$firebase$app$exports = {
  +apps: Array<$npm$firebase$App>,
  initializeApp(
    options: $npm$firebase$Config,
    name?: string
  ): $npm$firebase$App,
  SDK_VERSION: string,
  FirebaseError: $npm$firebase$Error,
  FirebaseConfig: $npm$firebase$Config,
  FirebaseUser: typeof $npm$firebase$auth$User,
  FirebaseUserInfo: typeof $npm$firebase$auth$UserInfo,
  app: $Exports<'@firebase/app'>,
  auth: $Exports<'@firebase/auth'>,
  database: $Exports<'@firebase/database'>,
  firestore: $Exports<'@firebase/firestore'>,
  messaging: $Exports<'@firebase/messaging'>,
  storage: $Exports<'@firebase/storage'>
};

// Exporting the types
declare module 'firebase' {
  declare module.exports: $npm$firebase$app$exports;
}

declare module 'firebase/app' {
  declare module.exports: $npm$firebase$app$exports;
}

declare module 'firebase/auth' {
  declare module.exports: $Exports<'@firebase/auth'>
}

declare module 'firebase/database' {
  declare module.exports: $Exports<'@firebase/database'>;
}

declare module 'firebase/firestore' {
  declare module.exports: $Exports<'@firebase/firestore'>;
}

declare module 'firebase/messaging' {
  declare module.exports: $Exports<'@firebase/messaging'>;
}

declare module '@firebase/app' {
  declare module.exports: {
    (name?: string): $npm$firebase$App,
    App: typeof $npm$firebase$App
  };
}

declare module '@firebase/auth' {
  declare module.exports: {
    (app?: $npm$firebase$App): $npm$firebase$auth$Auth,
    FirebaseAdditionalUserInfo: $npm$firebase$auth$AdditionalUserInfo,
    FirebaseUserCredential: $npm$firebase$auth$UserCredential,
    ActionCodeInfo: $npm$firebase$auth$ActionCodeInfo,
    ApplicationVerifier: $npm$firebase$auth$ApplicationVerifier,
    Auth: typeof $npm$firebase$auth$Auth,
    AuthCredential: $npm$firebase$auth$AuthCredential,
    AuthProvider: $npm$firebase$auth$AuthProvider,
    ConfirmationResult: $npm$firebase$auth$ConfirmationResult,
    EmailAuthProvider: typeof $npm$firebase$auth$EmailAuthProvider,
    Error: $npm$firebase$auth$Error,
    FacebookAuthProvider: typeof $npm$firebase$auth$FacebookAuthProvider,
    GithubAuthProvider: typeof $npm$firebase$auth$GithubAuthProvider,
    GoogleAuthProvider: typeof $npm$firebase$auth$GoogleAuthProvider,
    PhoneAuthProvider: typeof $npm$firebase$auth$PhoneAuthProvider,
    TwitterAuthProvider: typeof $npm$firebase$auth$TwitterAuthProvider
  };
}

declare module 'firebase/storage' {
  declare module.exports: $Exports<'firebase/storage'>;
}

declare module '@firebase/database' {
  declare module.exports: {
    (app?: $npm$firebase$App): $npm$firebase$database$Database,
    enableLogging(
      logger?: boolean | ((msg: string) => void),
      persistent?: boolean
    ): void,
    DataSnapshot: typeof $npm$firebase$database$DataSnapshot,
    Database: typeof $npm$firebase$database$Database,
    OnDisconnect: typeof $npm$firebase$database$OnDisconnect,
    Query: typeof $npm$firebase$database$Query,
    Reference: typeof $npm$firebase$database$Reference,
    ServerValue: typeof $npm$firebase$database$ServerValue,
    ThenableReference: typeof $npm$firebase$database$ThenableReference
  };
}

declare module '@firebase/firestore' {
  declare module.exports: {
    (app?: $npm$firebase$App): $npm$firebase$firestore$Firestore,
    Blob: $npm$firebase$firestore$Blob,
    CollectionReference: typeof $npm$firebase$firestore$CollectionReference,
    DocumentChange: $npm$firebase$firestore$DocumentChange,
    DocumentReference: typeof $npm$firebase$firestore$DocumentReference,
    DocumentSnapshot: typeof $npm$firebase$firestore$DocumentSnapshot,
    FieldPath: typeof $npm$firebase$firestore$FieldPath,
    FieldValue: typeof $npm$firebase$firestore$FieldValue,
    Firestore: typeof $npm$firebase$firestore$Firestore,
    FirestoreError: $npm$firebase$firestore$FirestoreError,
    GeoPoint: typeof $npm$firebase$firestore$GeoPoint,
    Query: typeof $npm$firebase$firestore$Query,
    QueryListenOptions: $npm$firebase$firestore$QueryListenOptions,
    QuerySnapshot: typeof $npm$firebase$firestore$QuerySnapshot,
    Settings: $npm$firebase$firestore$Settings,
    SnapshotMetadata: $npm$firebase$firestore$SnapshotMetadata,
    Transaction: $npm$firebase$firestore$Transaction,
    WriteBatch: $npm$firebase$firestore$WriteBatch
  };
}

declare module '@firebase/messaging' {
  declare module.exports: {
    (app?: $npm$firebase$App): $npm$firebase$messaging$Messaging,
    Messaging: $npm$firebase$messaging$Messaging
  };
}

declare module '@firebase/storage' {
  declare module.exports: {
    (app?: $npm$firebase$App): $npm$firebase$storage$Storage,
    Storage: typeof $npm$firebase$storage$Storage,
    FullMetadata: typeof $npm$firebase$storage$FullMetadata,
    Reference: typeof $npm$firebase$storage$Reference,
    SettableMetadata: typeof $npm$firebase$storage$SettableMetadata,
    UploadMetadata: typeof $npm$firebase$storage$UploadMetadata,
    UploadTask: typeof $npm$firebase$storage$UploadTask,
    UploadTaskSnapshot: typeof $npm$firebase$storage$UploadTaskSnapshot
  };
}
