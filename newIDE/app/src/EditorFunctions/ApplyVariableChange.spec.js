// @flow
import { serializeToJSObject } from '../Utils/Serializer';
import { applyVariableChange } from './ApplyVariableChange';

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
      existingStruct.castTo('Structure');
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
      existingArray.castTo('Array');
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
      existingArray.castTo('Array');
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
});
