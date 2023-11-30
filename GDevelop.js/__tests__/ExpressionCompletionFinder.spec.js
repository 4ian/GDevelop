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

  describe('Variable completion tests', () => {
    beforeAll(() => {
      project = new gd.ProjectHelper.createNewGDJSProject();
      layout = project.insertNewLayout('Scene', 0);

      const object = layout.insertNewObject(
        project,
        'Sprite',
        'MySpriteObject',
        0
      );

      const makeChildrenTestVariables = (structure) => {
        // Make a structure...
        structure.castTo('Structure');
        // With a child structure,
        // useful to test the completion of grand children.
        const structureChild1 = structure.getChild('Child1Structure');
        structureChild1.castTo('Structure');
        structureChild1.getChild('Child1StructureChild1');
        structureChild1.getChild('Child1StructureChild2');
        structureChild1.getChild('Child1StructureChild3');
        structureChild1.getChild(
          'Child1Structure with unsafe "`/+ characters and spaces'
        );

        // With a child array, containing 2 structures and a number.
        // Useful to test completion of the array children.
        const structureChild2 = structure.getChild('Child2Array');
        structureChild2.castTo('Array');
        const structureChild2Item0 = structureChild2.pushNew();
        const structureChild2Item1 = structureChild2.pushNew();
        const structureChild2Item2 = structureChild2.pushNew();
        structureChild2Item0.castTo('structure');
        structureChild2Item0.getChild('Child2ArrayItem0Child1');
        structureChild2Item0.getChild('Child2ArrayItem0Child2');
        structureChild2Item0.getChild('Child2ArrayItem0Child3');
        structureChild2Item1.castTo('structure');
        structureChild2Item1.getChild('Child2ArrayItem0Child1');
        structureChild2Item1.getChild('Child2ArrayItem0Child2');
        structureChild2Item1.getChild('Child2ArrayItem0Child3');
        structureChild2Item2.castTo('Number');

        // And a child boolean.
        const structureChild3 = structure.getChild('Child3Boolean');
        structureChild3.castTo('Boolean');
      };

      object
        .getVariables()
        .insertNew('MyObjectVariableNumber', 0)
        .castTo('Number');
      object
        .getVariables()
        .insertNew('MyObjectVariableString', 1)
        .castTo('String');
      makeChildrenTestVariables(
        object.getVariables().insertNew('MyObjectVariableStructure', 2)
      );

      const object2 = layout.insertNewObject(
        project,
        'Sprite',
        'OtherSpriteObject',
        1
      );
      makeChildrenTestVariables(
        object2.getVariables().insertNew('MyObjectVariableStructure', 2)
      );

      const object3 = layout.insertNewObject(
        project,
        'Sprite',
        'UnrelatedSpriteObject',
        2
      );

      const objectGroup = layout
        .getObjectGroups()
        .insertNew('GroupOfSpriteObjects', 0);
      objectGroup.addObject('MySpriteObject');
      objectGroup.addObject('OtherSpriteObject');

      layout.getVariables().insertNew('MyVariable', 0);
      layout.getVariables().insertNew('MyVariable2', 1);
      layout.getVariables().insertNew('UnrelatedVariable3', 2);
      makeChildrenTestVariables(
        layout.getVariables().insertNew('MyVariableStructure', 3)
      );

      project.getVariables().insertNew('MyGlobalVariable', 0);
      project.getVariables().insertNew('MyVariable2', 1); // Will be "shadowed" by the layout variable.
      makeChildrenTestVariables(
        layout.getVariables().insertNew('MyGlobalVariableStructure', 2)
      );
    });

    afterAll(() => {
      project.delete();
    });

    describe('Object variables completion', () => {
      test('Root variables', () => {
        expect(testCompletions('number', 'MySpriteObject.|'))
          .toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, MyObjectVariableNumber, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, MyObjectVariableString, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 1, no type, 1, no prefix, no completion, MySpriteObject, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 2, number, 1, no prefix, no completion, MySpriteObject, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(testCompletions('number', 'MySpriteObject|.'))
          .toMatchInlineSnapshot(`
          [
            "{ 0, number, 1, no prefix, MySpriteObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          ]
        `);
      });

      test('Root variables (eager completion of children)', () => {
        expect(
          testCompletions('number', 'MySpriteObject.MyObjectVariableStructure|')
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure.Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, MyObjectVariableStructure.Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, MyObjectVariableStructure.Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 1, no type, 1, MyObjectVariableStructure, no completion, MySpriteObject, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 2, number, 1, MyObjectVariableStructure, no completion, MySpriteObject, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Root variables (objectvar parameter)', () => {
        expect(testCompletions('number', 'MySpriteObject.Variable(MyObject|'))
          .toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, MyObjectVariableNumber, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, MyObjectVariableString, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Root variables (objectvar parameter, eager completion of children)', () => {
        expect(
          testCompletions(
            'number',
            'MySpriteObject.Variable(MyObjectVariableStructure|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure.Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, MyObjectVariableStructure.Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, MyObjectVariableStructure.Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 1 level', () => {
        // Completions of children:
        expect(
          testCompletions(
            'number',
            'MySpriteObject.MyObjectVariableStructure.|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        // Completion of the variable, if we move the cursor back:

        expect(
          testCompletions(
            'number',
            'MySpriteObject.MyObjectVariableStructure|.'
          )
        ).toMatchInlineSnapshot(`
                  [
                    "{ 3, no type, 1, no prefix, MyObjectVariableNumber, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                    "{ 3, no type, 1, no prefix, MyObjectVariableString, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                    "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                  ]
              `);
        expect(
          testCompletions(
            'number',
            'MySpriteObject|.MyObjectVariableStructure.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 0, number, 1, no prefix, MySpriteObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          ]
        `);
      });

      test('Structure, 1 level (eager completion of children)', () => {
        expect(
          testCompletions(
            'number',
            'MySpriteObject.MyObjectVariableStructure.Child1Structure|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure["Child1Structure with unsafe \\"\`/+ characters and spaces"], no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure.Child1StructureChild1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure.Child1StructureChild2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure.Child1StructureChild3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 1 level (objectvar parameter)', () => {
        expect(
          testCompletions(
            'number',
            'MySpriteObject.Variable(MyObjectVariableStructure.|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);

        // Completion of the variable, if we move the cursor back:
        expect(
          testCompletions(
            'number',
            'MySpriteObject.Variable(MyObjectVariableStructure|.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 1 level (objectvar parameter, eager completion of children)', () => {
        expect(
          testCompletions(
            'number',
            'MySpriteObject.Variable(MyObjectVariableStructure.Child1Structure|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure["Child1Structure with unsafe \\"\`/+ characters and spaces"], no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure.Child1StructureChild1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure.Child1StructureChild2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure.Child1StructureChild3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 2 levels', () => {
        expect(
          testCompletions(
            'number',
            'MySpriteObject.MyObjectVariableStructure.Child1Structure.|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, Child1StructureChild1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        // Completion of the previous variables, if we move the cursor back:
        expect(
          testCompletions(
            'number',
            'MySpriteObject.MyObjectVariableStructure.Child1Structure|.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);

        expect(
          testCompletions(
            'number',
            'MySpriteObject.MyObjectVariableStructure|.Child1Structure.'
          )
        ).toMatchInlineSnapshot(`
                  [
                    "{ 3, no type, 1, no prefix, MyObjectVariableNumber, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                    "{ 3, no type, 1, no prefix, MyObjectVariableString, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                    "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                  ]
              `);
        expect(
          testCompletions(
            'number',
            'MySpriteObject|.MyObjectVariableStructure.Child1Structure.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 0, number, 1, no prefix, MySpriteObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          ]
        `);
      });

      test('Structure, 2 levels (bracket notation)', () => {
        // Complete with the children of the first child:
        expect(
          testCompletions(
            'number',
            'MySpriteObject.MyObjectVariableStructure["Can be anything, so will pick the first child"].|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, Child1StructureChild1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        // Completion of the previous variables, if we move the cursor back:
        expect(
          testCompletions(
            'number',
            'MySpriteObject.MyObjectVariableStructure|["Can be anything, so will pick the first child"].'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, MyObjectVariableNumber, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, MyObjectVariableString, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 2 levels (objectvar parameter)', () => {
        expect(
          testCompletions(
            'number',
            'MySpriteObject.Variable(MyObjectVariableStructure.Child1Structure.|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, Child1StructureChild1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(
          testCompletions(
            'number',
            'MySpriteObject.Variable(MyObjectVariableStructure.Child1Structure|.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(
          testCompletions(
            'number',
            'MySpriteObject.Variable(MyObjectVariableStructure|.Child1Structure.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 3 levels (array bracket notation)', () => {
        // Complete with the children of the first item of the array:
        expect(
          testCompletions(
            'number',
            'MySpriteObject.MyObjectVariableStructure.Child2Array[42].|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, Child2ArrayItem0Child1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child2ArrayItem0Child2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child2ArrayItem0Child3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        // Completion of the previous variables, if we move the cursor back:
        expect(
          testCompletions(
            'number',
            'MySpriteObject.MyObjectVariableStructure.Child2Array|[42].'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(
          testCompletions(
            'number',
            'MySpriteObject.MyObjectVariableStructure|.Child2Array[42].'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, MyObjectVariableNumber, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, MyObjectVariableString, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });
    });

    describe('Group of objects variables completion', () => {
      test('Root variables', () => {
        expect(testCompletions('number', 'GroupOfSpriteObjects.|'))
          .toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 1, no type, 1, no prefix, no completion, GroupOfSpriteObjects, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 2, number, 1, no prefix, no completion, GroupOfSpriteObjects, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(testCompletions('number', 'GroupOfSpriteObjects|.'))
          .toMatchInlineSnapshot(`
          [
            "{ 0, number, 1, no prefix, GroupOfSpriteObjects, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Root variables (objectvar parameter)', () => {
        expect(
          testCompletions('number', 'GroupOfSpriteObjects.Variable(MyObject|')
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(
          testCompletions('number', 'GroupOfSpriteObjects|.Variable(MyObject')
        ).toMatchInlineSnapshot(`
          [
            "{ 0, number, 1, no prefix, GroupOfSpriteObjects, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 1 level', () => {
        // Completions of children:
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.MyObjectVariableStructure.|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);

        // Completion of the variable, if we move the cursor back:
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.MyObjectVariableStructure|.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, MyObjectVariableNumber, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, MyObjectVariableString, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects|.MyObjectVariableStructure.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 0, number, 1, no prefix, GroupOfSpriteObjects, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 1 level (objectvar parameter)', () => {
        // Completions of children:
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.Variable(MyObjectVariableStructure.|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);

        // Completion of the variable, if we move the cursor back:
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.Variable(MyObjectVariableStructure|.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects|.Variable(MyObjectVariableStructure.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 0, number, 1, no prefix, GroupOfSpriteObjects, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 2 levels', () => {
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.MyObjectVariableStructure.Child1Structure.|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, Child1StructureChild1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        // Completion of the previous variables, if we move the cursor back:
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.MyObjectVariableStructure.Child1Structure|.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);

        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.MyObjectVariableStructure|.Child1Structure.'
          )
        ).toMatchInlineSnapshot(`
                  [
                    "{ 3, no type, 1, no prefix, MyObjectVariableNumber, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                    "{ 3, no type, 1, no prefix, MyObjectVariableString, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                    "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                  ]
              `);
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects|.MyObjectVariableStructure.Child1Structure.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 0, number, 1, no prefix, GroupOfSpriteObjects, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 2 levels (bracket notation)', () => {
        // Complete with the children of the first child:
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.MyObjectVariableStructure["Can be anything, so will pick the first child"].|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, Child1StructureChild1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        // Completion of the previous variables, if we move the cursor back:
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.MyObjectVariableStructure|["Can be anything, so will pick the first child"].'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, MyObjectVariableNumber, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, MyObjectVariableString, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 2 levels (objectvar parameter)', () => {
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.Variable(MyObjectVariableStructure.Child1Structure.|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, Child1StructureChild1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.Variable(MyObjectVariableStructure.Child1Structure|.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.Variable(MyObjectVariableStructure|.Child1Structure.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 3 levels (array bracket notation)', () => {
        // Complete with the children of the first item of the array:
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.MyObjectVariableStructure.Child2Array[42].|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, Child2ArrayItem0Child1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child2ArrayItem0Child2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child2ArrayItem0Child3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        // Completion of the previous variables, if we move the cursor back:
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.MyObjectVariableStructure.Child2Array|[42].'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(
          testCompletions(
            'number',
            'GroupOfSpriteObjects.MyObjectVariableStructure|.Child2Array[42].'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, MyObjectVariableNumber, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, MyObjectVariableString, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 3, no prefix, MyObjectVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });
    });

    describe('Scene variables completion', () => {
      test('Root variables', () => {
        expect(testCompletions('number', 'MyVariab|')).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, MyVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, MyVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 3, no prefix, MyVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 2, number, 1, MyVariab, no completion, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Root variables (eager completion of children)', () => {
        expect(testCompletions('number', 'MyVariableStructure|'))
          .toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 3, no prefix, MyVariableStructure.Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, MyVariableStructure.Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, MyVariableStructure.Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 2, number, 1, MyVariableStructure, no completion, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Root variables (scenevar parameter)', () => {
        expect(testCompletions('number', 'Variable(MyVaria|)'))
          .toMatchInlineSnapshot(`
                  [
                    "{ 3, no type, 1, no prefix, MyVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                    "{ 3, no type, 1, no prefix, MyVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                    "{ 3, no type, 3, no prefix, MyVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                  ]
              `);
      });

      test('Root variables (scenevar parameter, eager completion of children)', () => {
        expect(testCompletions('number', 'Variable(MyVariableStructure|)'))
          .toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 3, no prefix, MyVariableStructure.Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, MyVariableStructure.Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, MyVariableStructure.Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 1 level', () => {
        expect(testCompletions('number', 'MyVariableStructure.|'))
          .toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        // Completion of the previous variables, if we move the cursor back:
        expect(testCompletions('number', 'MyVariableStructure|.'))
          .toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 1 level (eager completion of children)', () => {
        expect(
          testCompletions('number', 'MyVariableStructure.Child1Structure|')
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure["Child1Structure with unsafe \\"\`/+ characters and spaces"], no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure.Child1StructureChild1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure.Child1StructureChild2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure.Child1StructureChild3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 1 level (scenevar parameter)', () => {
        expect(testCompletions('number', 'Variable(MyVariableStructure.|'))
          .toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        // Completion of the previous variables, if we move the cursor back:
        expect(testCompletions('number', 'Variable(MyVariableStructure|.'))
          .toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 1 level (scenevar parameter, eager completion of children)', () => {
        expect(
          testCompletions(
            'number',
            'Variable(MyVariableStructure.Child1Structure|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure["Child1Structure with unsafe \\"\`/+ characters and spaces"], no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure.Child1StructureChild1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure.Child1StructureChild2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1Structure.Child1StructureChild3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 2 levels', () => {
        expect(
          testCompletions('number', 'MyVariableStructure.Child1Structure.|')
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, Child1StructureChild1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        // Completion of the previous variables, if we move the cursor back:
        expect(
          testCompletions('number', 'MyVariableStructure.Child1Structure|.')
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(
          testCompletions('number', 'MyVariableStructure|.Child1Structure.')
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 2 levels (bracket notation)', () => {
        // Complete with the children of the first child:
        expect(
          testCompletions(
            'number',
            'MyVariableStructure["Can be anything, so will pick the first child"].|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, Child1StructureChild1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        // Completion of the previous variables, if we move the cursor back:
        expect(
          testCompletions(
            'number',
            'MyVariableStructure|["Can be anything, so will pick the first child"].'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 2 levels (scenevar parameter)', () => {
        expect(
          testCompletions(
            'number',
            'Variable(MyVariableStructure.Child1Structure.|'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, Child1StructureChild1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child1StructureChild3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        // Completion of the previous variables, if we move the cursor back:
        expect(
          testCompletions(
            'number',
            'Variable(MyVariableStructure.Child1Structure|.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(
          testCompletions(
            'number',
            'Variable(MyVariableStructure|.Child1Structure.'
          )
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });

      test('Structure, 3 levels (array bracket notation)', () => {
        // Complete with the children of the first item of the array:
        expect(
          testCompletions('number', 'MyVariableStructure.Child2Array[42].|')
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 1, no prefix, Child2ArrayItem0Child1, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child2ArrayItem0Child2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child2ArrayItem0Child3, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        // Completion of the previous variables, if we move the cursor back:
        expect(
          testCompletions('number', 'MyVariableStructure.Child2Array|[42].')
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, Child1Structure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 4, no prefix, Child2Array, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
            "{ 3, no type, 1, no prefix, Child3Boolean, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
        expect(
          testCompletions('number', 'MyVariableStructure|.Child2Array[42].')
        ).toMatchInlineSnapshot(`
          [
            "{ 3, no type, 3, no prefix, MyVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          ]
        `);
      });
    });

    describe('Global variables completion', () => {
      test('Root variables', () => {
        expect(testCompletions('number', 'MyGlo|')).toMatchInlineSnapshot(`
                  [
                    "{ 3, no type, 3, no prefix, MyGlobalVariableStructure, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                    "{ 3, no type, 1, no prefix, MyGlobalVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                    "{ 2, number, 1, MyGlo, no completion, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                  ]
              `);
      });

      test('Root variables (globalvar parameter)', () => {
        expect(testCompletions('number', 'GlobalVariable(My|)'))
          .toMatchInlineSnapshot(`
                  [
                    "{ 3, no type, 1, no prefix, MyGlobalVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                    "{ 3, no type, 1, no prefix, MyVariable2, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
                  ]
              `);
      });
    });

    describe('Edge cases', () => {
      test('Wrong dots', () => {
        expect(
          testCompletions('number', 'MySpriteObject..|')
        ).toMatchInlineSnapshot(`[]`);
        expect(
          testCompletions('number', 'MySpriteObject...|')
        ).toMatchInlineSnapshot(`[]`);
        expect(
          testCompletions('number', 'MySpriteObject.Variable(MyObject.|')
        ).toMatchInlineSnapshot(`[]`);
        expect(
          testCompletions('number', 'MySpriteObject.Variable(MyObject...|')
        ).toMatchInlineSnapshot(`[]`);
      });
      test('Wrong brackets', () => {
        expect(
          testCompletions('number', 'MySpriteObject[|')
        ).toMatchInlineSnapshot(`[]`);
        expect(
          testCompletions('number', 'MySpriteObject[.|')
        ).toMatchInlineSnapshot(`[]`);
      });
    });
  });

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
