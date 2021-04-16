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

  before(function setupFirebase() {
    gdjs.evtTools.firebaseTools._setupFirebase({
      getGame: () => ({
        getExtensionProperty: () => JSON.stringify(firebaseConfig),
      }),
    });
  });

  describe('Firebase database', () => {
    it('should write and read back a variable from the database', async () => {
      await promisifyCallbackVariables((callback) => {
        gdjs.evtTools.firebaseTools.database.writeVariable(
          'hello',
          variable,
          callback
        );
      });

      const fetchedVariable = await promisifyCallbackVariables(
        (callback, result) =>
          gdjs.evtTools.firebaseTools.database.getVariable(
            'hello',
            result,
            callback
          )
      );

      expect(fetchedVariable).to.eql(variable);
    });

    it('should write and read back a field from the database', async function () {
      await promisifyCallbackVariables((callback) => {
        gdjs.evtTools.firebaseTools.database.writeField(
          'world',
          'hello',
          1,
          callback
        );
      });

      const fetchedVariable = await promisifyCallbackVariables(
        (callback, result) =>
          gdjs.evtTools.firebaseTools.database.getField(
            'world',
            'hello',
            result,
            callback
          )
      );

      expect(fetchedVariable.getType()).to.be.string('number');
      expect(fetchedVariable.getAsNumber()).to.be.equal(1);
    });

    it('should update a field from the database', async function () {
      await firebase
        .database()
        .ref('world')
        .set({ hello: 'Hello', goodbye: 'Goodbye' });
      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.database.updateField(
          'world',
          'hello',
          'Good day',
          callback
        )
      );
      expect((await firebase.database().ref('world').get()).val()).to.eql({
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
          'world',
          updater,
          callback
        )
      );

      expect((await firebase.database().ref('world').get()).val()).to.eql({
        hello: 'Good day',
        goodbye: 'See you later',
      });
    });

    it('should delete a field from the database', async function () {
      await firebase
        .database()
        .ref('test')
        .set({ hello: 'Hello', goodbye: 'Goodbye' });

      expect(
        (
          await promisifyCallbackVariables((callback, result) =>
            gdjs.evtTools.firebaseTools.database.hasVariable(
              'test',
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
              'test',
              'hello',
              result,
              callback
            )
          )
        ).getValue()
      ).to.be.ok();

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.database.deleteField(
          'test',
          'hello',
          callback
        )
      );

      expect(
        (
          await promisifyCallbackVariables((callback, result) =>
            gdjs.evtTools.firebaseTools.database.hasField(
              'test',
              'hello',
              result,
              callback
            )
          )
        ).getValue()
      ).to.not.be.ok();

      await promisifyCallbackVariables((callback) =>
        gdjs.evtTools.firebaseTools.database.deleteVariable('test', callback)
      );

      expect(
        (
          await promisifyCallbackVariables((callback, result) =>
            gdjs.evtTools.firebaseTools.database.hasVariable(
              'test',
              result,
              callback
            )
          )
        ).getValue()
      ).to.not.be.ok();
    });
  });
});
