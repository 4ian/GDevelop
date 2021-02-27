// @ts-check

describe('gdjs.evtTools.storage', function () {
  /**
   * @param {string} filename
   */
  function writeFixturesInFile(filename) {
    gdjs.evtTools.storage.writeNumberInJSONFile(
      filename,
      'Root/NumericElement0',
      0
    );
    gdjs.evtTools.storage.writeNumberInJSONFile(
      filename,
      'Root/NumericElement40',
      40
    );
    gdjs.evtTools.storage.writeStringInJSONFile(
      filename,
      'Root/EmptyString',
      ''
    );
    gdjs.evtTools.storage.writeStringInJSONFile(
      filename,
      'Root/HelloString',
      'Hello'
    );
    gdjs.evtTools.storage.writeStringInJSONFile(
      filename,
      'Root/DeletedString',
      'Hello'
    );
    gdjs.evtTools.storage.deleteElementFromJSONFile(
      filename,
      'Root/DeletedString'
    );
  }

  /**
   * @param {string} filename
   */
  function checkFixturesInFile(filename) {
    expect(
      gdjs.evtTools.storage.elementExistsInJSONFile(
        filename,
        'Root/NumericElement0'
      )
    ).to.be(true);
    expect(
      gdjs.evtTools.storage.elementExistsInJSONFile(
        filename,
        'Root/NumericElement40'
      )
    ).to.be(true);
    expect(
      gdjs.evtTools.storage.elementExistsInJSONFile(
        filename,
        'Root/EmptyString'
      )
    ).to.be(true);
    expect(
      gdjs.evtTools.storage.elementExistsInJSONFile(
        filename,
        'Root/HelloString'
      )
    ).to.be(true);
    expect(
      gdjs.evtTools.storage.elementExistsInJSONFile(
        filename,
        'Root/I/Dont/Exist'
      )
    ).to.be(false);
    expect(
      gdjs.evtTools.storage.elementExistsInJSONFile(
        filename,
        'Root/DeletedString'
      )
    ).to.be(false);

    var variable = new gdjs.Variable();
    gdjs.evtTools.storage.readNumberFromJSONFile(
      filename,
      'Root/NumericElement0',
      null,
      variable
    );
    expect(variable.getAsNumber()).to.be(0);
    gdjs.evtTools.storage.readNumberFromJSONFile(
      filename,
      'Root/NumericElement40',
      null,
      variable
    );
    expect(variable.getAsNumber()).to.be(40);
    gdjs.evtTools.storage.readStringFromJSONFile(
      filename,
      'Root/EmptyString',
      null,
      variable
    );
    expect(variable.getAsString()).to.be('');
    gdjs.evtTools.storage.readStringFromJSONFile(
      filename,
      'Root/HelloString',
      null,
      variable
    );
    expect(variable.getAsString()).to.be('Hello');
  }

  /**
   * @param {string} filename
   */
  function testClearingFile(filename) {
    gdjs.evtTools.storage.writeStringInJSONFile(
      filename,
      'Root/HelloString',
      'Hello'
    );

    gdjs.evtTools.storage.clearJSONFile(filename);
    var variable = new gdjs.Variable();

    gdjs.evtTools.storage.readStringFromJSONFile(
      filename,
      'Root/HelloString',
      null,
      variable
    );
    expect(variable.getAsNumber()).to.be(0);
  }

  it('can store and retrieve values, in an object loaded in memory', function () {
    gdjs.evtTools.storage.loadJSONFileFromStorage('Test1');
    writeFixturesInFile('Test1');
    gdjs.evtTools.storage.unloadJSONFile('Test1');

    gdjs.evtTools.storage.loadJSONFileFromStorage('Test1');
    checkFixturesInFile('Test1');
    gdjs.evtTools.storage.unloadJSONFile('Test1');

    gdjs.evtTools.storage.loadJSONFileFromStorage('Test2');
    testClearingFile('Test2');
    gdjs.evtTools.storage.unloadJSONFile('Test2');
  });

  it('can store and retrieve values, from an object persisted but not staying in memory', function () {
    writeFixturesInFile('Test1');
    checkFixturesInFile('Test1');
    testClearingFile('Test2');
  });
});
