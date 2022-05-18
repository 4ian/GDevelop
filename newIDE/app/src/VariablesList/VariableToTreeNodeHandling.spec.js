// @flow
import {
  getExpandedNodeIdsFromVariablesContainer,
  getVariableContextFromNodeId,
  separator,
  updateListOfNodesFollowingChangeName,
} from './VariableToTreeNodeHandling';

const gd: libGDevelop = global.gd;

describe('VariableToTreeNodeHandling', () => {
  let variablesContainer;
  let parent;
  let stringChild;
  let arrayChild;
  let firstArrayChild;
  let secondArrayChild;
  let parent2;
  let boolChild;
  let structureChild;
  let firstStructureChild;
  let secondStructureChild;
  beforeEach(() => {
    /*
    variablesContainer
    ├── parent
    │   ├── stringChild
    │   └── arrayChild (folded)
    │       ├── firstArrayChild
    │       └── secondArrayChild
    └── parent2 (folded)
        ├── boolChild
        └── structureChild
            ├── firstStructureChild
            └── secondStructureChild
     */
    parent = new gd.Variable();
    parent.castTo('structure');
    parent.setFolded(false);

    stringChild = new gd.Variable();
    stringChild.setString('stringValue');
    parent.insertChild('stringChild', stringChild);

    arrayChild = new gd.Variable();
    arrayChild.castTo('array');
    arrayChild.setFolded(true);
    firstArrayChild = arrayChild.pushNew();
    firstArrayChild.setValue(35);
    secondArrayChild = arrayChild.pushNew();
    secondArrayChild.setBool(false);

    parent.insertChild('arrayChild', arrayChild);

    parent2 = new gd.Variable();
    parent2.castTo('structure');
    parent2.setFolded(true);

    boolChild = new gd.Variable();
    boolChild.setBool(true);
    parent2.insertChild('boolChild', boolChild);

    structureChild = new gd.Variable();
    structureChild.castTo('structure');
    structureChild.setFolded(false);
    firstStructureChild = new gd.Variable();
    firstStructureChild.setString('firstStructureChild');
    structureChild.insertChild('firstStructureChild', firstStructureChild);
    secondStructureChild = new gd.Variable();
    secondStructureChild.setString('secondStructureChild');
    structureChild.insertChild('secondStructureChild', secondStructureChild);

    parent2.insertChild('structureChild', structureChild);

    variablesContainer = new gd.VariablesContainer();
    variablesContainer.insert('parent', parent, 0);
    variablesContainer.insert('parent2', parent2, 1);
  });

  describe('getVariableContextFromNodeId', () => {
    test('Variable context is correctly given for array element', () => {
      const { variable, lineage, depth, name } = getVariableContextFromNodeId(
        `parent${separator}arrayChild${separator}1`,
        variablesContainer
      );
      if (!variable || !name) throw new Error('Variable could not be found');
      expect(name).toBe('1');
      expect(depth).toBe(2);
      expect(lineage.length).toBe(2);
      expect(lineage).toEqual([
        expect.objectContaining({
          nodeId: 'parent',
          name: 'parent',
          variable: expect.any(gd.Variable),
        }),
        expect.objectContaining({
          nodeId: `parent${separator}arrayChild`,
          name: 'arrayChild',
          variable: expect.any(gd.Variable),
        }),
      ]);
      expect(variable.getBool()).toBe(secondArrayChild.getBool());
    });

    test('Variable context is correctly given for structure element', () => {
      const { variable, lineage, depth, name } = getVariableContextFromNodeId(
        `parent2${separator}structureChild${separator}firstStructureChild`,
        variablesContainer
      );
      if (!variable || !name) throw new Error('Variable could not be found');
      expect(name).toBe('firstStructureChild');
      expect(depth).toBe(2);
      expect(lineage.length).toBe(2);
      expect(lineage).toEqual([
        expect.objectContaining({
          nodeId: 'parent2',
          name: 'parent2',
          variable: expect.any(gd.Variable),
        }),
        expect.objectContaining({
          nodeId: `parent2${separator}structureChild`,
          name: 'structureChild',
          variable: expect.any(gd.Variable),
        }),
      ]);
      expect(variable.getString()).toBe(firstStructureChild.getString());
    });
  });

  describe('getExpandedNodeIdsFromVariablesContainer', () => {
    test('List of unfolded nodes are returned', () => {
      expect(
        getExpandedNodeIdsFromVariablesContainer(variablesContainer)
      ).toEqual(['parent', `parent2${separator}structureChild`]);
    });
  });

  describe('updateListOfNodesFollowingChangeName', () => {
    test('Concerned variable node id is modified in the list', () => {
      expect(
        updateListOfNodesFollowingChangeName(
          [
            'parent',
            `parent2${separator}structureChild`,
            `parent${separator}arrayChild`,
          ],
          `parent2${separator}structureChild`,
          'newStructureChildName'
        )
      ).toEqual([
        'parent',
        `parent2${separator}newStructureChildName`,
        `parent${separator}arrayChild`,
      ]);
    });

    test("Concerned variable's children node ids are modified in the list", () => {
      expect(
        updateListOfNodesFollowingChangeName(
          [
            'parent',
            `parent2${separator}structureChild${separator}firstStructureChild`,
            `parent2${separator}structureChild${separator}firstSecondChild`,
          ],
          `parent2${separator}structureChild`,
          'newStructureChildName'
        )
      ).toEqual([
        'parent',
        `parent2${separator}newStructureChildName${separator}firstStructureChild`,
        `parent2${separator}newStructureChildName${separator}firstSecondChild`,
      ]);
    });
  });

  afterEach(() => {
    variablesContainer.delete();
    parent.delete();
    stringChild.delete();
    arrayChild.delete();
    parent2.delete();
    boolChild.delete();
    structureChild.delete();
    firstStructureChild.delete();
    secondStructureChild.delete();
  });
});
