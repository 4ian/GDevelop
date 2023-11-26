const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

describe('gd.ExpressionCompletionFinder', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  let project = null;
  let layout = null;
  let propertiesContainer = null;
  let sharedPropertiesContainer = null;

  function testCompletions(type, expressionWithCaret) {
    const caretPosition = expressionWithCaret.indexOf('|');
    if (caretPosition === -1) {
      throw new Error(
        'Caret location not found in expression: ' + expressionWithCaret
      );
    }
    const expression = expressionWithCaret.replace('|', '');
    const parameters = new gd.VectorParameterMetadata();
    const parameter1 = new gd.ParameterMetadata();
    parameter1.setType('string');
    parameter1.setName('MyParameter1');
    const parameter2 = new gd.ParameterMetadata();
    parameter2.setType('number');
    parameter2.setName('MyParameter2');
    parameters.push_back(parameter1);
    parameters.push_back(parameter2);
    parameter1.delete();
    parameter2.delete();

    const parser = new gd.ExpressionParser2();
    const expressionNode = parser.parseExpression(expression).get();
    const completionDescriptions = gd.ExpressionCompletionFinder.getCompletionDescriptionsFor(
      gd.JsPlatform.get(),
      gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
        project,
        layout
      )
        .addPropertiesContainer(sharedPropertiesContainer)
        .addPropertiesContainer(propertiesContainer)
        .addParameters(parameters),
      type,
      expressionNode,
      // We're looking for completion for the character just before the caret.
      Math.max(0, caretPosition - 1)
    );

    const completionDescriptionAsStrings = [];
    for (let i = 0; i < completionDescriptions.size(); i++) {
      const completionDescription = completionDescriptions.at(i);

      completionDescriptionAsStrings.push(completionDescription.toString());
    }

    parser.delete();
    parameters.delete();
    return completionDescriptionAsStrings;
  }

  describe('Various tests', () => {
    beforeAll(() => {
      project = new gd.ProjectHelper.createNewGDJSProject();
      layout = project.insertNewLayout('Scene', 0);

      const object = layout.insertNewObject(
        project,
        'Sprite',
        'MySpriteObject',
        0
      );
      object.getVariables().insertNew('MyObjectVariable', 0);
      object.getVariables().insertNew('MyObjectGroupVariable1', 0);
      object.getVariables().insertNew('MyObjectGroupVariable2', 0);
      object.getVariables().insertNew('MyObjectGroupVariable3', 0);

      const object2 = layout.insertNewObject(
        project,
        'Sprite',
        'MySpriteObject2',
        1
      );
      object2.getVariables().insertNew('MyObjectGroupVariable1', 0);
      object2.getVariables().insertNew('MyObjectGroupVariable2', 0);

      const objectGroup = layout
        .getObjectGroups()
        .insertNew('MyObjectGroup', 0);
      objectGroup.addObject('MySpriteObject');
      objectGroup.addObject('MySpriteObject2');

      layout.insertNewObject(project, 'Sprite', 'UnrelatedSpriteObject3', 2);
      layout.getVariables().insertNew('MyVariable', 0);
      layout.getVariables().insertNew('MyVariable2', 1);
      layout.getVariables().insertNew('UnrelatedVariable3', 2);
      project.getVariables().insertNew('MyGlobalVariable', 0);
      project.getVariables().insertNew('MyVariable2', 1); // Will be "shadowed" by the layout variable.

      // Also create some properties (a bit unusual to have these "floating" properties containers,
      // but this works well to test the completions).
      propertiesContainer = new gd.PropertiesContainer(0);
      propertiesContainer.insertNew('MyProperty1', 0);
      propertiesContainer.insertNew('UnrelatedProperty2', 1);
      sharedPropertiesContainer = new gd.PropertiesContainer(0);
      sharedPropertiesContainer.insertNew('MySharedProperty1', 0);
      sharedPropertiesContainer.insertNew('UnrelatedProperty2', 1);
    });

    afterAll(() => {
      project.delete();
      propertiesContainer.delete();
      sharedPropertiesContainer.delete();
    });

    it('completes an empty expression', function () {
      // Verify we list everything (objects, variables, properties, expressions).
      expect(testCompletions('number', '|')).toMatchInlineSnapshot(`
        [
          "{ 0, number, 1, no prefix, MySpriteObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 0, number, 1, no prefix, MySpriteObject2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 0, number, 1, no prefix, UnrelatedSpriteObject3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 0, number, 1, no prefix, MyObjectGroup, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, UnrelatedVariable3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyGlobalVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 6, string, 1, no prefix, MyParameter1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 6, number, 1, no prefix, MyParameter2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 5, no type, 1, no prefix, MyProperty1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 5, no type, 1, no prefix, UnrelatedProperty2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 5, no type, 1, no prefix, MySharedProperty1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 2, number, 1, no prefix, no completion, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
    });

    it('does not complete an expression with an operator', function () {
      const completions = testCompletions('number', '1 +| ');
      expect(completions).toHaveLength(0);
    });

    it('completes an expression with an operator and a prefix', function () {
      expect(testCompletions('number', '1 + My| ')).toMatchInlineSnapshot(`
        [
          "{ 0, number, 1, no prefix, MySpriteObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 0, number, 1, no prefix, MySpriteObject2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 0, number, 1, no prefix, MyObjectGroup, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyGlobalVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 6, string, 1, no prefix, MyParameter1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 6, number, 1, no prefix, MyParameter2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 5, no type, 1, no prefix, MyProperty1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 5, no type, 1, no prefix, MySharedProperty1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 2, number, 1, My, no completion, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
    });

    it('completes an expression with an operator and a case insensitive search string', function () {
      expect(testCompletions('number', '1 + OBJ| ')).toMatchInlineSnapshot(`
        [
          "{ 0, number, 1, no prefix, MySpriteObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 0, number, 1, no prefix, MySpriteObject2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 0, number, 1, no prefix, UnrelatedSpriteObject3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 0, number, 1, no prefix, MyObjectGroup, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 2, number, 1, OBJ, no completion, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
      expect(testCompletions('number', '1 + VARI| ')).toMatchInlineSnapshot(`
        [
          "{ 3, no type, 1, no prefix, MyVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, UnrelatedVariable3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyGlobalVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 2, number, 1, VARI, no completion, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
    });

    it('completes an expression with an object function, behavior or object variable', function () {
      // List variables, expressions and behaviors, if all of them are present:
      expect(testCompletions('number', '1 + MySpriteObject.My| '))
        .toMatchInlineSnapshot(`
        [
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyObjectVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 1, no type, 1, My, no completion, MySpriteObject, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 2, number, 1, My, no completion, MySpriteObject, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
      // Only list expressions and behaviors if no matching variables:
      expect(testCompletions('number', '1 + MySpriteObject.Func| '))
        .toMatchInlineSnapshot(`
        [
          "{ 1, no type, 1, Func, no completion, MySpriteObject, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 2, number, 1, Func, no completion, MySpriteObject, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
    });

    it('completes an expression with an object group function, behavior or variable', function () {
      // List variables, expressions and behaviors, if all of them are present:
      expect(testCompletions('number', '1 + MyObjectGroup.My| '))
        .toMatchInlineSnapshot(`
        [
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 1, no type, 1, My, no completion, MyObjectGroup, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 2, number, 1, My, no completion, MyObjectGroup, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
      // Only list expressions and behaviors if no matching variables:
      expect(testCompletions('number', '1 + MyObjectGroup.Func| '))
        .toMatchInlineSnapshot(`
        [
          "{ 1, no type, 1, Func, no completion, MyObjectGroup, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 2, number, 1, Func, no completion, MyObjectGroup, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
    });

    it('completes an expression with a partial behavior function', function () {
      expect(testCompletions('number', '1 + MySpriteObject.MyBehavior::Func| '))
        .toMatchInlineSnapshot(`
        [
          "{ 2, number, 1, Func, no completion, MySpriteObject, MyBehavior, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
    });

    it('completes an expression parameters', function () {
      expect(testCompletions('number', '1 + MySpriteObject.PointX(My| '))
        .toMatchInlineSnapshot(`
        [
          "{ 0, string, 1, no prefix, MySpriteObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 0, string, 1, no prefix, MySpriteObject2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 0, string, 1, no prefix, MyObjectGroup, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyGlobalVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 6, string, 1, no prefix, MyParameter1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 6, number, 1, no prefix, MyParameter2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 5, no type, 1, no prefix, MyProperty1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 5, no type, 1, no prefix, MySharedProperty1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 2, string, 1, My, no completion, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
    });

    it('completes legacy pre-scoped variables ("scenevar" and "globalvar")', function () {
      expect(testCompletions('number', 'Variable(M|')).toMatchInlineSnapshot(`
        [
          "{ 3, no type, 1, no prefix, MyVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
      expect(testCompletions('string', 'GlobalVariableString(M|'))
        .toMatchInlineSnapshot(`
        [
          "{ 3, no type, 1, no prefix, MyGlobalVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
    });

    it('completes an expression parameters (legacy pre-scoped variable)', function () {
      // Verify only the object variable is autocompleted:
      expect(testCompletions('number', '1 + MySpriteObject.Variable(My| '))
        .toMatchInlineSnapshot(`
        [
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyObjectVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
      expect(
        testCompletions(
          'string',
          '"Score:" + MySpriteObject.VariableString(My| '
        )
      ).toMatchInlineSnapshot(`
        [
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyObjectVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
    });

    it('completes an expression parameters (group, legacy pre-scoped variable)', function () {
      // Verify only the object group variable is autocompleted:
      expect(testCompletions('number', '1 + MyObjectGroup.Variable(My| '))
        .toMatchInlineSnapshot(`
        [
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
      expect(
        testCompletions(
          'string',
          '"Score:" + MyObjectGroup.VariableString(My| '
        )
      ).toMatchInlineSnapshot(`
        [
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          "{ 3, no type, 1, no prefix, MyObjectGroupVariable1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
        ]
      `);
    });
  });

  // More tests are done in C++ for ExpressionCompletionFinder.
});
