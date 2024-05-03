/**
 * Turns a callback variable into a promise.
 * @param {(callbackVariable: {setString: (result: "ok" | string) => void}, result: gdjs.Variable) => any} executor
 * @returns {Promise<gdjs.Variable>}
 */
const promisifyCallbackVariables = (executor) =>
  new Promise((done, err) => {
    const callbackResult = new gdjs.Variable();
    executor(
      {
        setString: (string) => {
          if (string === 'ok') done(callbackResult);
          else err(new Error(string));
        },
      },
      callbackResult
    );
  });

/** A complex variable using all variables types. */
const variable = new gdjs.Variable().fromJSObject({
  my: 'test',
  object: { with: 'all', types: 2 },
  it: ['is', true],
});

/**
 * A firebase configuration of a project made only for those tests.
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

// The tests require an internet connection, as a real Firebase instance is used.
const describeIfOnline = navigator.onLine ? describe : describe.skip;
describeIfOnline('Firebase extension end-to-end tests', function () {
  // Increase the timeout to work on low connections as well.
  this.timeout('5s');

  const namespace = `temp-test-${Math.random()
    .toString()
    .replace('.', '-')}-${Date.now()}`;

  before(async function setupFirebase() {
    await gdjs.evtTools.firebaseTools._setupFirebase({
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

      const updater = new gdjs.Variable().fromJSObject({
        goodbye: 'See you later',
      });

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
    describe('Base read/write operations', () => {
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

        const updater = new gdjs.Variable().fromJSObject({
          goodbye: 'See you later',
        });

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

      it('should be able to use server timestamps', async () => {
        await promisifyCallbackVariables((callback) => {
          gdjs.evtTools.firebaseTools.firestore.writeField(
            namespace,
            'field',
            'timestamp',
            gdjs.evtTools.firebaseTools.firestore.getServerTimestamp(),
            callback
          );
        });

        expect(
          (
            await firebase
              .firestore()
              .doc(namespace + '/field')
              .get()
          ).get('timestamp', { serverTimestamps: 'estimate' })
        ).to.be.an(firebase.firestore.Timestamp);
      });
    });

    describe('Firestore Queries', async () => {
      it('can get a list of documents from the database', async () => {
        const subcollection = namespace + '/collection/sub';
        await firebase
          .firestore()
          .doc(subcollection + '/doc1')
          .set({ index: 2, val: 2 });
        await firebase
          .firestore()
          .doc(subcollection + '/doc2')
          .set({ index: 1, val: 2 });
        await firebase
          .firestore()
          .doc(subcollection + '/doc3')
          .set({ index: 3, val: 1 });

        const executeQuery = async (query) =>
          (
            await promisifyCallbackVariables((callback, result) =>
              gdjs.evtTools.firebaseTools.firestore.executeQuery(
                query,
                result,
                callback
              )
            )
          ).toJSObject();

        // Empty query
        gdjs.evtTools.firebaseTools.firestore.startQuery('main', subcollection);
        expect(await executeQuery('main')).to.eql({
          size: 3,
          empty: false,
          docs: [
            { id: 'doc1', data: { index: 2, val: 2 }, exists: true },
            { id: 'doc2', data: { index: 1, val: 2 }, exists: true },
            { id: 'doc3', data: { index: 3, val: 1 }, exists: true },
          ],
        });

        // Query with selector filter
        gdjs.evtTools.firebaseTools.firestore.startQueryFrom(
          'selector',
          'main'
        );
        gdjs.evtTools.firebaseTools.firestore.queryWhere(
          'selector',
          'index',
          '>',
          1
        );
        expect(await executeQuery('selector')).to.eql({
          size: 2,
          empty: false,
          docs: [
            { id: 'doc1', data: { index: 2, val: 2 }, exists: true },
            { id: 'doc3', data: { index: 3, val: 1 }, exists: true },
          ],
        });

        // Query with order filter
        gdjs.evtTools.firebaseTools.firestore.startQueryFrom('order', 'main');
        gdjs.evtTools.firebaseTools.firestore.queryOrderBy(
          'order',
          'index',
          'desc'
        );
        expect(await executeQuery('order')).to.eql({
          size: 3,
          empty: false,
          docs: [
            { id: 'doc3', data: { index: 3, val: 1 }, exists: true },
            { id: 'doc1', data: { index: 2, val: 2 }, exists: true },
            { id: 'doc2', data: { index: 1, val: 2 }, exists: true },
          ],
        });

        // Query with limit filter
        gdjs.evtTools.firebaseTools.firestore.startQueryFrom('limit', 'order');
        gdjs.evtTools.firebaseTools.firestore.queryLimit('limit', 2, true);
        expect(await executeQuery('limit')).to.eql({
          size: 2,
          empty: false,
          docs: [
            { id: 'doc1', data: { index: 2, val: 2 }, exists: true },
            { id: 'doc2', data: { index: 1, val: 2 }, exists: true },
          ],
        });

        // Query with skip some filter
        gdjs.evtTools.firebaseTools.firestore.startQueryFrom('skip', 'order');
        gdjs.evtTools.firebaseTools.firestore.querySkipSome(
          'skip',
          2,
          true,
          true
        );
        expect(await executeQuery('skip')).to.eql({
          size: 2,
          empty: false,
          docs: [
            { id: 'doc3', data: { index: 3, val: 1 }, exists: true },
            { id: 'doc1', data: { index: 2, val: 2 }, exists: true },
          ],
        });
      });
    });

    // Delete the temporary namespace to not bloat the DB
    after(async () =>
      (
        await firebase.firestore().collection(namespace).get()
      ).forEach(({ ref }) => ref.delete())
    );
  });

  describe('Firebase authentication', () => {
    // Generate basic credentials
    const email = `test${Math.random().toString(
      16
    )}${Date.now()}@test-account.com`;
    const password = `myPass${Math.random().toString(16)}${Date.now()}!`;
    const password2 = `myNewPass${Math.random().toString(16)}${Date.now()}!`;

    const expectToNotLogin = async (password) => {
      if (gdjs.evtTools.firebaseTools.auth.isAuthenticated())
        await firebase.auth().signOut();

      let errors = false;
      try {
        await promisifyCallbackVariables((callback) =>
          gdjs.evtTools.firebaseTools.auth.signInWithEmail(
            email,
            password,
            callback
          )
        );
      } catch (e) {
        errors = true;
      }

      // No error was thrown, there is an issue
      if (!errors)
        throw new Error('Expected wrong credentials to prevent login');

      expect(gdjs.evtTools.firebaseTools.auth.isAuthenticated()).to.not.be.ok();
    };

    const expectToLogin = async (password) => {
      if (gdjs.evtTools.firebaseTools.auth.isAuthenticated())
        await firebase.auth().signOut();

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.auth.signInWithEmail(
          email,
          password,
          callback
        )
      );

      expect(gdjs.evtTools.firebaseTools.auth.isAuthenticated()).to.be.ok();
    };

    before(async () => firebase.auth().signOut());

    it('let users create accounts', async () => {
      expect(gdjs.evtTools.firebaseTools.auth.isAuthenticated()).to.not.be.ok();

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.auth.createAccountWithEmail(
          email,
          password,
          callback
        )
      );

      expect(gdjs.evtTools.firebaseTools.auth.isAuthenticated()).to.be.ok();
    });

    it('let users log out', async () => {
      expect(gdjs.evtTools.firebaseTools.auth.isAuthenticated()).to.be.ok();
      await firebase.auth().signOut();
      expect(gdjs.evtTools.firebaseTools.auth.isAuthenticated()).to.not.be.ok();
    });

    it('prevents logging in with invalid credentials', async () =>
      expectToNotLogin('InvalidPassword321'));

    it('let users log in', async () => expectToLogin(password));

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

    it('let users change their password', async () => {
      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.auth.userManagement.dangerous.changePassword(
          email,
          password,
          password2,
          callback
        )
      );

      await expectToNotLogin(password);
      await expectToLogin(password2);
    });

    it('let users delete their account', async () => {
      await expectToLogin(password2);

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.auth.userManagement.dangerous.deleteUser(
          email,
          password2,
          callback
        )
      );

      return expectToNotLogin(password2);
    });
  });

  describe('Firebase storage', () => {
    const filename = `MyImage-${Math.random().toString(16)}.png`;
    it('uploads an image', async () => {
      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.storage.uploadFile(
          'myUpload',
          'data:image/jpeg;base64,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',
          filename,
          'data_url',
          callback
        )
      );
    });

    it('gets download url for an image', async () => {
      const url = await promisifyCallbackVariables((callback, result) =>
        gdjs.evtTools.firebaseTools.storage.getDownloadURL(
          filename,
          result,
          callback
        )
      );
      expect((await fetch(url.getAsString())).ok).to.be.ok();
    });

    it('deletes an image', async () => {
      const url = await firebase.storage().ref(filename).getDownloadURL();
      expect((await fetch(url)).ok).to.be.ok();

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.storage.deleteFile(filename, callback)
      );

      expect((await fetch(url)).ok).to.not.be.ok();
    });
  });
});
