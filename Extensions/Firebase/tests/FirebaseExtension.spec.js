/**
 * A firebase configuaration of a project made only for those tests.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyBwPnGpfEBXDjwQrWfU0wqgp4m9qEt7YM8',
  authDomain: 'gdtest-e11a5.firebaseapp.com',
  databaseURL: 'https://gdtest-e11a5.firebaseio.com',
  projectId: 'gdtest-e11a5',
  storageBucket: 'gdtest-e11a5.appspot.com',
  messagingSenderId: '254035412678',
  appId: '1:254035412678:web:2ddd6b83019b7f259b79c7',
  measurementId: 'G-4REML26L59',
};

/**
 * Turns a callback variable into a promise.
 * @param {(callbackVariable: {setString: (result: "ok" | string) => void}) => any} executor
 * @returns
 */
const promisifyCallbackVariables = (executor) =>
  new Promise((done, err) => {
    const callbackResult = new gdjs.Variable();
    executor(
      {
        setString: (string) => {
          if (string === 'ok') done(callbackResult);
          else err(string);
        },
      },
      callbackResult
    );
  });

/** A complex variable using all variables types. */
const variable = new gdjs.Variable();
gdjs.evtTools.network._objectToVariable(
  { my: 'test', object: { with: 'all', types: 2 }, it: ['is', true] },
  variable
);

// The tests require an internet connection, as a real Firebase instance is used.
const describeIfOnline = navigator.onLine ? describe : describe.skip;
describeIfOnline('Firebase extension end-to-end tests', function () {
  // Increase the timeout to work on low connections as well.
  this.timeout('5s');

  const namespace = `temp-test-${Math.random()
    .toString()
    .replace('.', '-')}-${Date.now()}`;

  before(function setupFirebase() {
    gdjs.evtTools.firebaseTools._setupFirebase({
      getGame: () => ({
        getExtensionProperty: () => JSON.stringify(firebaseConfig),
      }),
    });
  });

  describe('Firebase database', () => {
    it('should write and read back a variable from the database', async () => {
      const path = namespace + '/variable';
      await promisifyCallbackVariables((callback) => {
        gdjs.evtTools.firebaseTools.database.writeVariable(
          path,
          variable,
          callback
        );
      });

      const fetchedVariable = await promisifyCallbackVariables(
        (callback, result) =>
          gdjs.evtTools.firebaseTools.database.getVariable(
            path,
            result,
            callback
          )
      );

      expect(fetchedVariable).to.eql(variable);
    });

    it('should write and read back a field from the database', async function () {
      const path = namespace + '/field';
      await promisifyCallbackVariables((callback) => {
        gdjs.evtTools.firebaseTools.database.writeField(
          path,
          'hello',
          1,
          callback
        );
      });

      const fetchedVariable = await promisifyCallbackVariables(
        (callback, result) =>
          gdjs.evtTools.firebaseTools.database.getField(
            path,
            'hello',
            result,
            callback
          )
      );

      expect(fetchedVariable.getType()).to.be.string('number');
      expect(fetchedVariable.getAsNumber()).to.be.equal(1);
    });

    it('should update a field from the database', async function () {
      const path = namespace + '/update';

      // Populate with data to update
      await firebase
        .database()
        .ref(path)
        .set({ hello: 'Hello', goodbye: 'Goodbye' });

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.database.updateField(
          path,
          'hello',
          'Good day',
          callback
        )
      );
      expect((await firebase.database().ref(path).get()).val()).to.eql({
        hello: 'Good day',
        goodbye: 'Goodbye',
      });

      const updater = new gdjs.Variable();
      gdjs.evtTools.network._objectToVariable(
        {
          goodbye: 'See you later',
        },
        updater
      );

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.database.updateVariable(
          path,
          updater,
          callback
        )
      );

      expect((await firebase.database().ref(path).get()).val()).to.eql({
        hello: 'Good day',
        goodbye: 'See you later',
      });
    });

    it('should delete and detect presence of a field from the database', async function () {
      const path = namespace + '/delete';

      // Populate with data to delete
      await firebase
        .database()
        .ref(path)
        .set({ hello: 'Hello', goodbye: 'Goodbye' });

      expect(
        (
          await promisifyCallbackVariables((callback, result) =>
            gdjs.evtTools.firebaseTools.database.hasVariable(
              path,
              result,
              callback
            )
          )
        ).getValue()
      ).to.be.ok();

      expect(
        (
          await promisifyCallbackVariables((callback, result) =>
            gdjs.evtTools.firebaseTools.database.hasField(
              path,
              'hello',
              result,
              callback
            )
          )
        ).getValue()
      ).to.be.ok();

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.database.deleteField(
          path,
          'hello',
          callback
        )
      );

      expect(
        (
          await promisifyCallbackVariables((callback, result) =>
            gdjs.evtTools.firebaseTools.database.hasField(
              path,
              'hello',
              result,
              callback
            )
          )
        ).getValue()
      ).to.not.be.ok();

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.database.deleteVariable(path, callback)
      );

      expect(
        (
          await promisifyCallbackVariables((callback, result) =>
            gdjs.evtTools.firebaseTools.database.hasVariable(
              path,
              result,
              callback
            )
          )
        ).getValue()
      ).to.not.be.ok();
    });

    // Delete the temporary namespace to not bloat the DB
    after(() => firebase.database().ref(namespace).remove());
  });

  describe('Cloud Firestore', () => {
    it('should write and read back a variable from Firestore', async () => {
      await promisifyCallbackVariables((callback) => {
        gdjs.evtTools.firebaseTools.firestore.writeDocument(
          namespace,
          'variable',
          variable,
          callback
        );
      });

      const fetchedVariable = await promisifyCallbackVariables(
        (callback, result) =>
          gdjs.evtTools.firebaseTools.firestore.getDocument(
            namespace,
            'variable',
            result,
            callback
          )
      );

      expect(fetchedVariable).to.eql(variable);
    });

    it('should write and read back a field from Firestore', async function () {
      await promisifyCallbackVariables((callback) => {
        gdjs.evtTools.firebaseTools.firestore.writeField(
          namespace,
          'field',
          'hello',
          1,
          callback
        );
      });

      const fetchedVariable = await promisifyCallbackVariables(
        (callback, result) =>
          gdjs.evtTools.firebaseTools.firestore.getField(
            namespace,
            'field',
            'hello',
            result,
            callback
          )
      );

      expect(fetchedVariable.getType()).to.be.string('number');
      expect(fetchedVariable.getAsNumber()).to.be.equal(1);
    });

    it('should update a field from Firestore', async function () {
      const doc = firebase.firestore().doc(namespace + '/update');

      // Populate with data to update
      await doc.set({ hello: 'Hello', goodbye: 'Goodbye' });

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.firestore.updateField(
          namespace,
          'update',
          'hello',
          'Good day',
          callback
        )
      );
      expect((await doc.get()).data()).to.eql({
        hello: 'Good day',
        goodbye: 'Goodbye',
      });

      const updater = new gdjs.Variable();
      gdjs.evtTools.network._objectToVariable(
        {
          goodbye: 'See you later',
        },
        updater
      );

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.firestore.updateDocument(
          namespace,
          'update',
          updater,
          callback
        )
      );
      expect((await doc.get()).data()).to.eql({
        hello: 'Good day',
        goodbye: 'See you later',
      });
    });

    it('should delete and detect presence of a field from Firestore', async function () {
      const doc = firebase.firestore().doc(namespace + '/delete');

      // Populate with data to delete
      await doc.set({ hello: 'Hello', goodbye: 'Goodbye' });

      expect(
        (
          await promisifyCallbackVariables((callback, result) =>
            gdjs.evtTools.firebaseTools.firestore.hasDocument(
              namespace,
              'delete',
              result,
              callback
            )
          )
        ).getValue()
      ).to.be.ok();

      expect(
        (
          await promisifyCallbackVariables((callback, result) =>
            gdjs.evtTools.firebaseTools.firestore.hasField(
              namespace,
              'delete',
              'hello',
              result,
              callback
            )
          )
        ).getValue()
      ).to.be.ok();

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.firestore.deleteField(
          namespace,
          'delete',
          'hello',
          callback
        )
      );

      expect(
        (
          await promisifyCallbackVariables((callback, result) =>
            gdjs.evtTools.firebaseTools.firestore.hasField(
              namespace,
              'delete',
              'hello',
              result,
              callback
            )
          )
        ).getValue()
      ).to.not.be.ok();

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.firestore.deleteDocument(
          namespace,
          'delete',
          callback
        )
      );

      expect(
        (
          await promisifyCallbackVariables((callback, result) =>
            gdjs.evtTools.firebaseTools.firestore.hasDocument(
              namespace,
              'delete',
              result,
              callback
            )
          )
        ).getValue()
      ).to.not.be.ok();
    });

    // Delete the temporary namespace to not bloat the DB
    after(async () =>
      (
        await firebase.firestore().collection(namespace).get()
      ).forEach(({ ref }) => ref.delete())
    );
  });

  describe('Firebase authentication', () => {
    before(async () => firebase.auth().signOut());

    it('Prevents logging in with invalid credentials', async () => {
      expect(gdjs.evtTools.firebaseTools.auth.isAuthentified()).to.not.be.ok();

      let errors = false;
      try {
        await promisifyCallbackVariables((callback) =>
          gdjs.evtTools.firebaseTools.auth.signInWithEmail(
            'yes@example.com',
            'InvalidPassword321',
            callback
          )
        );
      } catch (e) {
        errors = true;
      }

      // No error was throwm, there is an issue
      if (!errors)
        throw new Error('Expected wrong credentials to prevent login');

      expect(gdjs.evtTools.firebaseTools.auth.isAuthentified()).to.not.be.ok();
    });

    it('Let users log in', async () => {
      expect(gdjs.evtTools.firebaseTools.auth.isAuthentified()).to.not.be.ok();
      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.auth.signInWithEmail(
          'yes@example.com',
          'ASecurePassword123',
          callback
        )
      );
      expect(gdjs.evtTools.firebaseTools.auth.isAuthentified()).to.be.ok();
    });

    it('Let users get/set basic profile data', async () => {
      await gdjs.evtTools.firebaseTools.auth.userManagement.setDisplayName(
        'Hello'
      );
      expect(
        gdjs.evtTools.firebaseTools.auth.userManagement.getDisplayName()
      ).to.be.string('Hello');

      await gdjs.evtTools.firebaseTools.auth.userManagement.setDisplayName(
        'World'
      );
      expect(
        gdjs.evtTools.firebaseTools.auth.userManagement.getDisplayName()
      ).to.be.string('World');
    });
  });
});
