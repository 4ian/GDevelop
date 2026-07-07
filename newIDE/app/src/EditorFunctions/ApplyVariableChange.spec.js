// @flow
import { serializeToJSObject } from '../Utils/Serializer';
import {
  applyVariableChange,
  applyVariableDeletion,
} from './ApplyVariableChange';

const gd: libGDevelop = global.gd;

describe('applyVariableChange', () => {
  let variablesContainer: gdVariablesContainer;

  beforeEach(() => {
    variablesContainer = new gd.VariablesContainer(
      gd.VariablesContainer.Unknown
    );
  });

  afterEach(() => {
    variablesContainer.delete();
  });

  describe('Root variable modification', () => {
    it('should create and set a new root string variable', () => {
      const result = applyVariableChange({
        variablePath: 'myVariable',
        forcedVariableType: null,
        variablesContainer,
        value: 'hello world',
      });

      expect(result.addedNewVariable).toBe(true);
      expect(variablesContainer.has('myVariable')).toBe(true);

      const variable = variablesContainer.get('myVariable');
      expect(variable.getType()).toBe(gd.Variable.String);
      expect(variable.getString()).toBe('hello world');
    });

    it('should create and set a new root number variable', () => {
      const result = applyVariableChange({
        variablePath: 'myNum',
        forcedVariableType: null,
        variablesContainer,
        value: '42.5',
      });

      expect(result.addedNewVariable).toBe(true);
      expect(variablesContainer.has('myNum')).toBe(true);

      const variable = variablesContainer.get('myNum');
      expect(variable.getType()).toBe(gd.Variable.Number);
      expect(variable.getValue()).toBe(42.5);
    });

    it('should create and set a new root boolean variable', () => {
      const result = applyVariableChange({
        variablePath: 'myBool',
        forcedVariableType: null,
        variablesContainer,
        value: 'true',
      });

      expect(result.addedNewVariable).toBe(true);
      expect(variablesContainer.has('myBool')).toBe(true);

      const variable = variablesContainer.get('myBool');
      expect(variable.getType()).toBe(gd.Variable.Boolean);
      expect(variable.getBool()).toBe(true);
    });

    it('should modify an existing root variable', () => {
      // Setup existing variable
      const existingVar = variablesContainer.insertNew('existing', 0);
      existingVar.setString('old value');

      const result = applyVariableChange({
        variablePath: 'existing',
        forcedVariableType: null,
        variablesContainer,
        value: 'new value',
      });

      expect(result.addedNewVariable).toBe(false);
      expect(variablesContainer.get('existing').getString()).toBe('new value');
    });

    it('should respect forced variable type', () => {
      const result = applyVariableChange({
        variablePath: 'forcedString',
        forcedVariableType: 'String',
        variablesContainer,
        value: '123',
      });

      expect(result.addedNewVariable).toBe(true);
      const variable = variablesContainer.get('forcedString');
      expect(variable.getType()).toBe(gd.Variable.String);
      expect(variable.getString()).toBe('123');
    });
  });

  describe('Structure child modification', () => {
    it('should create a new structure with child property', () => {
      const result = applyVariableChange({
        variablePath: 'myStruct.childProperty',
        forcedVariableType: null,
        variablesContainer,
        value: 'child value',
      });

      expect(result.addedNewVariable).toBe(true);
      expect(variablesContainer.has('myStruct')).toBe(true);

      const structVar = variablesContainer.get('myStruct');
      expect(structVar.getType()).toBe(gd.Variable.Structure);
      expect(structVar.hasChild('childProperty')).toBe(true);

      const childVar = structVar.getChild('childProperty');
      expect(childVar.getType()).toBe(gd.Variable.String);
      expect(childVar.getString()).toBe('child value');
    });

    it('should add property to existing structure', () => {
      // Setup existing structure
      const existingStruct = variablesContainer.insertNew('existingStruct', 0);
      existingStruct.castTo('structure');
      existingStruct.getChild('existingProp').setString('existing');

      const result = applyVariableChange({
        variablePath: 'existingStruct.newProperty',
        forcedVariableType: null,
        variablesContainer,
        value: 'new prop value',
      });

      expect(result.addedNewVariable).toBe(true);
      expect(existingStruct.hasChild('existingProp')).toBe(true);
      expect(existingStruct.hasChild('newProperty')).toBe(true);
      expect(existingStruct.getChild('newProperty').getString()).toBe(
        'new prop value'
      );
    });

    it('should handle nested structure properties', () => {
      const result = applyVariableChange({
        variablePath: 'level1.level2.level3',
        forcedVariableType: null,
        variablesContainer,
        value: 'deep value',
      });

      expect(result.addedNewVariable).toBe(true);

      const level1 = variablesContainer.get('level1');
      expect(level1.getType()).toBe(gd.Variable.Structure);

      const level2 = level1.getChild('level2');
      expect(level2.getType()).toBe(gd.Variable.Structure);

      const level3 = level2.getChild('level3');
      expect(level3.getString()).toBe('deep value');
    });
  });

  describe('Array item modification', () => {
    it('should create a new array and set item at index', () => {
      const result = applyVariableChange({
        variablePath: 'myArray[2]',
        forcedVariableType: null,
        variablesContainer,
        value: 'third item',
      });

      expect(result.addedNewVariable).toBe(true);
      expect(variablesContainer.has('myArray')).toBe(true);

      const arrayVar = variablesContainer.get('myArray');
      expect(arrayVar.getType()).toBe(gd.Variable.Array);
      expect(arrayVar.getChildrenCount()).toBe(3); // indices 0, 1, 2

      const itemVar = arrayVar.getAtIndex(2);
      expect(itemVar.getString()).toBe('third item');
    });

    it('should expand array when accessing higher index', () => {
      // Setup existing array with 2 items
      const existingArray = variablesContainer.insertNew('existingArray', 0);
      existingArray.castTo('array');
      existingArray.pushNew().setString('item0');
      existingArray.pushNew().setString('item1');

      const result = applyVariableChange({
        variablePath: 'existingArray[4]',
        forcedVariableType: null,
        variablesContainer,
        value: 'item4',
      });

      expect(result.addedNewVariable).toBe(true);
      expect(existingArray.getChildrenCount()).toBe(5); // indices 0-4
      expect(existingArray.getAtIndex(0).getString()).toBe('item0');
      expect(existingArray.getAtIndex(1).getString()).toBe('item1');
      expect(existingArray.getAtIndex(4).getString()).toBe('item4');
    });

    it('should handle array index with whitespace', () => {
      const result = applyVariableChange({
        variablePath: 'myArray[ 1 ]',
        forcedVariableType: null,
        variablesContainer,
        value: 'spaced index',
      });

      expect(result.addedNewVariable).toBe(true);
      const arrayVar = variablesContainer.get('myArray');
      expect(arrayVar.getAtIndex(1).getString()).toBe('spaced index');
    });

    it('should modify existing array item', () => {
      // Setup existing array
      const existingArray = variablesContainer.insertNew('existingArray', 0);
      existingArray.castTo('array');
      existingArray.pushNew().setString('original');

      applyVariableChange({
        variablePath: 'existingArray[0]',
        forcedVariableType: null,
        variablesContainer,
        value: 'modified',
      });

      expect(existingArray.getAtIndex(0).getString()).toBe('modified');
    });
  });

  describe('Mixed structure and array access', () => {
    it('should handle array item with structure property', () => {
      const result = applyVariableChange({
        variablePath: 'myArray[1].itemProperty',
        forcedVariableType: null,
        variablesContainer,
        value: 'nested value',
      });

      expect(result.addedNewVariable).toBe(true);

      const arrayVar = variablesContainer.get('myArray');
      expect(arrayVar.getType()).toBe(gd.Variable.Array);
      expect(arrayVar.getChildrenCount()).toBe(2); // indices 0, 1

      const itemVar = arrayVar.getAtIndex(1);
      expect(itemVar.getType()).toBe(gd.Variable.Structure);
      expect(itemVar.hasChild('itemProperty')).toBe(true);
      expect(itemVar.getChild('itemProperty').getString()).toBe('nested value');
    });

    it('should handle structure with array property', () => {
      const result = applyVariableChange({
        variablePath: 'myStruct.arrayProp[2]',
        forcedVariableType: null,
        variablesContainer,
        value: 'array in struct',
      });

      expect(result.addedNewVariable).toBe(true);

      const structVar = variablesContainer.get('myStruct');
      expect(structVar.getType()).toBe(gd.Variable.Structure);

      const arrayProp = structVar.getChild('arrayProp');
      expect(arrayProp.getType()).toBe(gd.Variable.Array);
      expect(arrayProp.getChildrenCount()).toBe(3);
      expect(arrayProp.getAtIndex(2).getString()).toBe('array in struct');
    });

    it('should handle complex nested paths', () => {
      const result = applyVariableChange({
        variablePath: 'players[0].inventory.items[2].name',
        forcedVariableType: null,
        variablesContainer,
        value: 'Magic Sword',
      });

      expect(result.addedNewVariable).toBe(true);

      const players = variablesContainer.get('players');
      const player0 = players.getAtIndex(0);
      const inventory = player0.getChild('inventory');
      const items = inventory.getChild('items');
      const item2 = items.getAtIndex(2);
      const name = item2.getChild('name');

      expect(name.getString()).toBe('Magic Sword');
    });
  });

  describe('Error cases', () => {
    it('should throw error for empty path', () => {
      expect(() => {
        applyVariableChange({
          variablePath: '',
          forcedVariableType: null,
          variablesContainer,
          value: 'test',
        });
      }).toThrow('Invalid variable path');
    });

    it('should throw error for path starting with array index', () => {
      expect(() => {
        applyVariableChange({
          variablePath: '[0]',
          forcedVariableType: null,
          variablesContainer,
          value: 'test',
        });
      }).toThrow('Variable path must start with a property name');
    });

    it('should handle invalid array index gracefully', () => {
      // Note: The current implementation filters out invalid indexes,
      // so this test verifies that behavior
      expect(() => {
        applyVariableChange({
          variablePath: 'myVar[wrong wrong].prop',
          forcedVariableType: null,
          variablesContainer,
          value: 'test',
        });
      }).toThrow(
        'Content of the index is invalid ("wrong wrong") - it should be a number.'
      );
    });

    it('should handle malformed brackets', () => {
      expect(() => {
        applyVariableChange({
          variablePath: 'malformedVar[1.prop',
          forcedVariableType: null,
          variablesContainer,
          value: 'test',
        });
      }).toThrow(
        'Improperly formatted array index. Please check the variable path - it should be formatted like this: `myVar[1].prop`, `myVar`, `myVar.prop`, etc...'
      );
    });
  });

  describe('Type inference', () => {
    it('should infer boolean type from "true"', () => {
      applyVariableChange({
        variablePath: 'testBool',
        forcedVariableType: null,
        variablesContainer,
        value: 'true',
      });

      const variable = variablesContainer.get('testBool');
      expect(variable.getType()).toBe(gd.Variable.Boolean);
      expect(variable.getBool()).toBe(true);
    });

    it('should infer boolean type from "false"', () => {
      applyVariableChange({
        variablePath: 'testBool',
        forcedVariableType: null,
        variablesContainer,
        value: 'FALSE',
      });

      const variable = variablesContainer.get('testBool');
      expect(variable.getType()).toBe(gd.Variable.Boolean);
      expect(variable.getBool()).toBe(false);
    });

    it('should infer number type from numeric strings', () => {
      applyVariableChange({
        variablePath: 'testNum',
        forcedVariableType: null,
        variablesContainer,
        value: '3.14159',
      });

      const variable = variablesContainer.get('testNum');
      expect(variable.getType()).toBe(gd.Variable.Number);
      expect(variable.getValue()).toBe(3.14159);
    });

    it('should default to string type for mixed content', () => {
      applyVariableChange({
        variablePath: 'testString',
        forcedVariableType: null,
        variablesContainer,
        value: '123abc',
      });

      const variable = variablesContainer.get('testString');
      expect(variable.getType()).toBe(gd.Variable.String);
      expect(variable.getString()).toBe('123abc');
    });

    it('should recognize JSON and parse it (object => structure)', () => {
      const result = applyVariableChange({
        variablePath: 'testString',
        forcedVariableType: null,
        variablesContainer,
        value:
          '{"a": 1, "b": "2", "c": [3, 4], "d": {"e": 5, "f": null, "g": true, "h": false}}',
      });
      expect(result.variableType).toBe('Structure');

      const variable = variablesContainer.get('testString');
      expect(variable.getType()).toBe(gd.Variable.Structure);
      expect(serializeToJSObject(variable)).toMatchInlineSnapshot(`
        Object {
          "children": Array [
            Object {
              "name": "a",
              "type": "number",
              "value": 1,
            },
            Object {
              "name": "b",
              "type": "string",
              "value": "2",
            },
            Object {
              "children": Array [
                Object {
                  "type": "number",
                  "value": 3,
                },
                Object {
                  "type": "number",
                  "value": 4,
                },
              ],
              "name": "c",
              "type": "array",
            },
            Object {
              "children": Array [
                Object {
                  "name": "e",
                  "type": "number",
                  "value": 5,
                },
                Object {
                  "name": "f",
                  "type": "string",
                  "value": "null",
                },
                Object {
                  "name": "g",
                  "type": "boolean",
                  "value": true,
                },
                Object {
                  "name": "h",
                  "type": "boolean",
                  "value": false,
                },
              ],
              "name": "d",
              "type": "structure",
            },
          ],
          "type": "structure",
        }
      `);
    });

    it('should recognize JSON and parse it (object => structure)', () => {
      const result = applyVariableChange({
        variablePath: 'testString',
        forcedVariableType: null,
        variablesContainer,
        value: '[1, "2", [3, 4], {"e": 5, "f": null, "g": true, "h": false}]',
      });
      expect(result.variableType).toBe('Array');

      const variable = variablesContainer.get('testString');
      expect(variable.getType()).toBe(gd.Variable.Array);
      expect(serializeToJSObject(variable)).toMatchInlineSnapshot(`
        Object {
          "children": Array [
            Object {
              "type": "number",
              "value": 1,
            },
            Object {
              "type": "string",
              "value": "2",
            },
            Object {
              "children": Array [
                Object {
                  "type": "number",
                  "value": 3,
                },
                Object {
                  "type": "number",
                  "value": 4,
                },
              ],
              "type": "array",
            },
            Object {
              "children": Array [
                Object {
                  "name": "e",
                  "type": "number",
                  "value": 5,
                },
                Object {
                  "name": "f",
                  "type": "string",
                  "value": "null",
                },
                Object {
                  "name": "g",
                  "type": "boolean",
                  "value": true,
                },
                Object {
                  "name": "h",
                  "type": "boolean",
                  "value": false,
                },
              ],
              "type": "structure",
            },
          ],
          "type": "array",
        }
      `);
    });
  });

  describe('JSON value replaces existing data', () => {
    it('replaces a whole structure (root and nested) with new JSON, dropping old fields', () => {
      // Pre-populate a structure with multiple children, including a nested one.
      const root = variablesContainer.insertNew('player', 0);
      root.castTo('structure');
      root.getChild('hp').setValue(10);
      root.getChild('name').setString('Hero');
      const stats = root.getChild('stats');
      stats.castTo('structure');
      stats.getChild('strength').setValue(5);
      stats.getChild('agility').setValue(7);

      // Replace the whole root structure: only "newContent" should remain.
      applyVariableChange({
        variablePath: 'player',
        forcedVariableType: null,
        variablesContainer,
        value: '{"newContent": 123}',
      });

      const replacedRoot = variablesContainer.get('player');
      expect(replacedRoot.getType()).toBe(gd.Variable.Structure);
      expect(replacedRoot.getAllChildrenNames().size()).toBe(1);
      expect(replacedRoot.hasChild('newContent')).toBe(true);
      expect(replacedRoot.getChild('newContent').getValue()).toBe(123);
      expect(replacedRoot.hasChild('hp')).toBe(false);
      expect(replacedRoot.hasChild('name')).toBe(false);
      expect(replacedRoot.hasChild('stats')).toBe(false);

      // Re-populate to test nested replacement: only the nested subtree
      // should be replaced, siblings at the parent level must be preserved.
      replacedRoot.getChild('hp').setValue(10);
      const newStats = replacedRoot.getChild('stats');
      newStats.castTo('structure');
      newStats.getChild('strength').setValue(5);
      newStats.getChild('agility').setValue(7);

      applyVariableChange({
        variablePath: 'player.stats',
        forcedVariableType: null,
        variablesContainer,
        value: '{"luck": 99}',
      });

      // Siblings of the replaced subtree are intact.
      expect(replacedRoot.hasChild('hp')).toBe(true);
      expect(replacedRoot.getChild('hp').getValue()).toBe(10);
      expect(replacedRoot.hasChild('newContent')).toBe(true);
      // The replaced nested structure only has the new field.
      const replacedStats = replacedRoot.getChild('stats');
      expect(replacedStats.getType()).toBe(gd.Variable.Structure);
      expect(replacedStats.getAllChildrenNames().size()).toBe(1);
      expect(replacedStats.hasChild('luck')).toBe(true);
      expect(replacedStats.getChild('luck').getValue()).toBe(99);
      expect(replacedStats.hasChild('strength')).toBe(false);
      expect(replacedStats.hasChild('agility')).toBe(false);
    });

    it('replaces a whole array (root and nested) with new JSON, dropping old elements', () => {
      // Pre-populate an array with multiple items, plus a nested array.
      const root = variablesContainer.insertNew('inventory', 0);
      root.castTo('array');
      root.pushNew().setString('Sword');
      root.pushNew().setString('Shield');
      root.pushNew().setString('Potion');
      const nested = variablesContainer.insertNew('matrix', 0);
      nested.castTo('structure');
      const row = nested.getChild('row');
      row.castTo('array');
      row.pushNew().setValue(1);
      row.pushNew().setValue(2);
      row.pushNew().setValue(3);

      // Replace the whole root array: only the new elements should remain.
      applyVariableChange({
        variablePath: 'inventory',
        forcedVariableType: null,
        variablesContainer,
        value: '["NewItem"]',
      });

      const replacedRoot = variablesContainer.get('inventory');
      expect(replacedRoot.getType()).toBe(gd.Variable.Array);
      expect(replacedRoot.getChildrenCount()).toBe(1);
      expect(replacedRoot.getAtIndex(0).getString()).toBe('NewItem');

      // Replace a nested array: parent structure's other fields are intact.
      nested.getChild('label').setString('mainMatrix');
      applyVariableChange({
        variablePath: 'matrix.row',
        forcedVariableType: null,
        variablesContainer,
        value: '[42]',
      });

      // Sibling field on the parent structure is preserved.
      expect(nested.hasChild('label')).toBe(true);
      expect(nested.getChild('label').getString()).toBe('mainMatrix');
      // The replaced nested array only has the new element.
      const replacedRow = nested.getChild('row');
      expect(replacedRow.getType()).toBe(gd.Variable.Array);
      expect(replacedRow.getChildrenCount()).toBe(1);
      expect(replacedRow.getAtIndex(0).getValue()).toBe(42);
    });
  });

  describe('Empty arrays and structures', () => {
    it('creates an empty array from "[]"', () => {
      const result = applyVariableChange({
        variablePath: 'emptyArray',
        forcedVariableType: 'Array',
        variablesContainer,
        value: '[]',
      });

      expect(result.variableType).toBe('Array');
      const variable = variablesContainer.get('emptyArray');
      expect(variable.getType()).toBe(gd.Variable.Array);
      expect(variable.getChildrenCount()).toBe(0);
    });

    it('creates an empty structure from "{}"', () => {
      const result = applyVariableChange({
        variablePath: 'emptyStructure',
        forcedVariableType: null,
        variablesContainer,
        value: '{}',
      });

      expect(result.variableType).toBe('Structure');
      const variable = variablesContainer.get('emptyStructure');
      expect(variable.getType()).toBe(gd.Variable.Structure);
      expect(variable.getChildrenCount()).toBe(0);
    });

    it('creates empty array and structure children inside a structure', () => {
      applyVariableChange({
        variablePath: 'inventory',
        forcedVariableType: null,
        variablesContainer,
        value: '{"weapons": [], "stats": {}}',
      });

      const variable = variablesContainer.get('inventory');
      expect(variable.getType()).toBe(gd.Variable.Structure);
      expect(variable.getChild('weapons').getType()).toBe(gd.Variable.Array);
      expect(variable.getChild('weapons').getChildrenCount()).toBe(0);
      expect(variable.getChild('stats').getType()).toBe(gd.Variable.Structure);
      expect(variable.getChild('stats').getChildrenCount()).toBe(0);
    });

    it('replaces an existing number child with an empty array via a path', () => {
      const root = variablesContainer.insertNew('storage', 0);
      root.getChild('herbs').setValue(0);

      applyVariableChange({
        variablePath: 'storage.herbs',
        forcedVariableType: 'Array',
        variablesContainer,
        value: '[]',
      });

      const herbs = variablesContainer.get('storage').getChild('herbs');
      expect(herbs.getType()).toBe(gd.Variable.Array);
      expect(herbs.getChildrenCount()).toBe(0);
    });
  });
});

describe('applyVariableDeletion', () => {
  let variablesContainer: gdVariablesContainer;

  beforeEach(() => {
    variablesContainer = new gd.VariablesContainer(
      gd.VariablesContainer.Unknown
    );
  });

  afterEach(() => {
    variablesContainer.delete();
  });

  it('should remove a top-level variable', () => {
    applyVariableChange({
      variablePath: 'myVariable',
      forcedVariableType: null,
      variablesContainer,
      value: 'hello',
    });
    expect(variablesContainer.has('myVariable')).toBe(true);

    const result = applyVariableDeletion({
      variablePath: 'myVariable',
      variablesContainer,
    });

    expect(result.removed).toBe(true);
    expect(variablesContainer.has('myVariable')).toBe(false);
  });

  it('should report not removed when the variable does not exist', () => {
    const result = applyVariableDeletion({
      variablePath: 'missing',
      variablesContainer,
    });

    expect(result.removed).toBe(false);
  });

  it('should remove a nested structure child without touching siblings', () => {
    applyVariableChange({
      variablePath: 'player',
      forcedVariableType: null,
      variablesContainer,
      value: '{"name":"Hero","score":10}',
    });

    const result = applyVariableDeletion({
      variablePath: 'player.score',
      variablesContainer,
    });

    expect(result.removed).toBe(true);
    const player = variablesContainer.get('player');
    expect(player.hasChild('score')).toBe(false);
    expect(player.hasChild('name')).toBe(true);
    expect(player.getChild('name').getString()).toBe('Hero');
  });

  it('should remove an array element by index', () => {
    applyVariableChange({
      variablePath: 'inventory',
      forcedVariableType: null,
      variablesContainer,
      value: '["Sword","Shield","Potion"]',
    });

    const result = applyVariableDeletion({
      variablePath: 'inventory[1]',
      variablesContainer,
    });

    expect(result.removed).toBe(true);
    const inventory = variablesContainer.get('inventory');
    expect(inventory.getChildrenCount()).toBe(2);
    expect(inventory.getAtIndex(0).getString()).toBe('Sword');
    expect(inventory.getAtIndex(1).getString()).toBe('Potion');
  });

  it('should report not removed for a missing nested child', () => {
    applyVariableChange({
      variablePath: 'player',
      forcedVariableType: null,
      variablesContainer,
      value: '{"name":"Hero"}',
    });

    const result = applyVariableDeletion({
      variablePath: 'player.missing',
      variablesContainer,
    });

    expect(result.removed).toBe(false);
    expect(variablesContainer.has('player')).toBe(true);
  });

  it('should report not removed for an out-of-range array index', () => {
    applyVariableChange({
      variablePath: 'inventory',
      forcedVariableType: null,
      variablesContainer,
      value: '["Sword"]',
    });

    const result = applyVariableDeletion({
      variablePath: 'inventory[5]',
      variablesContainer,
    });

    expect(result.removed).toBe(false);
    expect(variablesContainer.get('inventory').getChildrenCount()).toBe(1);
  });
});
