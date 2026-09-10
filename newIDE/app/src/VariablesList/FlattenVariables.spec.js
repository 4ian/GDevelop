// @flow
import { flattenVariablesContainers } from './FlattenVariables';
import {
  generateListOfNodesMatchingSearchInVariablesContainer,
  inheritedPrefix,
  separator,
} from './VariableToTreeNodeHandling';

const gd: libGDevelop = global.gd;

const makeStructure = (
  children: { [string]: string },
  { isFolded }: {| isFolded: boolean |} = { isFolded: false }
) => {
  const variable = new gd.Variable();
  variable.castTo('structure');
  variable.setFolded(isFolded);
  for (const childName in children) {
    variable.getChild(childName).setString(children[childName]);
  }
  return variable;
};

const describeRows = (rows: Array<Object>) =>
  rows.map(({ nodeId, depth, isInherited }) => ({
    nodeId,
    depth,
    isInherited,
  }));

describe('flattenVariablesContainers', () => {
  let variablesContainer;
  beforeEach(() => {
    /*
    variablesContainer
    ├── Text 'Hello'
    ├── Structure
    │   ├── Child1 'first'
    │   └── Child2 'second'
    ├── FoldedStructure (folded)
    │   └── HiddenChild 'hidden'
    └── Array
        ├── 0 'zero'
        └── 1 'one'
    */
    variablesContainer = new gd.VariablesContainer(
      gd.VariablesContainer.Unknown
    );
    const text = new gd.Variable();
    text.setString('Hello');
    variablesContainer.insert('Text', text, 0);
    variablesContainer.insert(
      'Structure',
      makeStructure({ Child1: 'first', Child2: 'second' }),
      1
    );
    variablesContainer.insert(
      'FoldedStructure',
      makeStructure({ HiddenChild: 'hidden' }, { isFolded: true }),
      2
    );
    const array = new gd.Variable();
    array.castTo('array');
    array.pushNew().setString('zero');
    array.pushNew().setString('one');
    variablesContainer.insert('Array', array, 3);
  });

  test('the tree is flattened in the order it is displayed, and folded variables hide their children', () => {
    expect(
      describeRows(
        flattenVariablesContainers({
          variablesContainer,
          inheritedVariablesContainer: null,
          searchMatchingNodeIds: null,
        })
      )
    ).toEqual([
      { nodeId: 'Text', depth: 0, isInherited: false },
      { nodeId: 'Structure', depth: 0, isInherited: false },
      { nodeId: `Structure${separator}Child1`, depth: 1, isInherited: false },
      { nodeId: `Structure${separator}Child2`, depth: 1, isInherited: false },
      { nodeId: 'FoldedStructure', depth: 0, isInherited: false },
      { nodeId: 'Array', depth: 0, isInherited: false },
      { nodeId: `Array${separator}0`, depth: 1, isInherited: false },
      { nodeId: `Array${separator}1`, depth: 1, isInherited: false },
    ]);
  });

  test('a row holds what is needed to display the variable', () => {
    const rows = flattenVariablesContainers({
      variablesContainer,
      inheritedVariablesContainer: null,
      searchMatchingNodeIds: null,
    });

    expect(rows[0]).toMatchObject({
      name: 'Text',
      index: 0,
      type: gd.Variable.String,
      isCollection: false,
      isExpanded: false,
      parentVariable: null,
    });
    expect(rows[1]).toMatchObject({
      name: 'Structure',
      index: 1,
      type: gd.Variable.Structure,
      isCollection: true,
      isExpanded: true,
    });
    expect(rows[2]).toMatchObject({ name: 'Child1', index: 0 });
    expect(rows[2].parentVariable).toBe(rows[1].variable);
    expect(rows[4]).toMatchObject({
      name: 'FoldedStructure',
      isCollection: true,
      isExpanded: false,
    });
    // Array children are named by their index.
    expect(rows[6]).toMatchObject({ name: '0', index: 0 });
    expect(rows[7]).toMatchObject({ name: '1', index: 1 });
  });

  test('the inherited variables are displayed first, without the ones being overridden', () => {
    const inheritedVariablesContainer = new gd.VariablesContainer(
      gd.VariablesContainer.Unknown
    );
    const inheritedOnly = new gd.Variable();
    inheritedOnly.setString('inherited');
    inheritedVariablesContainer.insert('InheritedOnly', inheritedOnly, 0);
    // Overridden by the variable of the same name of the container itself.
    const overridden = new gd.Variable();
    overridden.setString('overridden');
    inheritedVariablesContainer.insert('Text', overridden, 1);

    expect(
      describeRows(
        flattenVariablesContainers({
          variablesContainer,
          inheritedVariablesContainer,
          searchMatchingNodeIds: null,
        })
      )
    ).toEqual([
      {
        nodeId: `${inheritedPrefix}InheritedOnly`,
        depth: 0,
        isInherited: true,
      },
      { nodeId: 'Text', depth: 0, isInherited: false },
      { nodeId: 'Structure', depth: 0, isInherited: false },
      { nodeId: `Structure${separator}Child1`, depth: 1, isInherited: false },
      { nodeId: `Structure${separator}Child2`, depth: 1, isInherited: false },
      { nodeId: 'FoldedStructure', depth: 0, isInherited: false },
      { nodeId: 'Array', depth: 0, isInherited: false },
      { nodeId: `Array${separator}0`, depth: 1, isInherited: false },
      { nodeId: `Array${separator}1`, depth: 1, isInherited: false },
    ]);
  });

  const flattenWithSearch = (searchText: string) =>
    describeRows(
      flattenVariablesContainers({
        variablesContainer,
        inheritedVariablesContainer: null,
        searchMatchingNodeIds: generateListOfNodesMatchingSearchInVariablesContainer(
          variablesContainer,
          searchText
        ),
      })
    ).map(({ nodeId }) => nodeId);

  test('a search displays the matching variables, their ancestors and their descendants', () => {
    // A matching child: it is displayed, and so is its parent.
    expect(flattenWithSearch('child2')).toEqual([
      'Structure',
      `Structure${separator}Child2`,
    ]);

    // A matching parent: its children are displayed too.
    expect(flattenWithSearch('structure')).toEqual([
      'Structure',
      `Structure${separator}Child1`,
      `Structure${separator}Child2`,
      // The children of a folded variable stay hidden.
      'FoldedStructure',
    ]);

    // A value can match too.
    expect(flattenWithSearch('zero')).toEqual(['Array', `Array${separator}0`]);

    expect(flattenWithSearch('nothing matches this')).toEqual([]);
  });
});
