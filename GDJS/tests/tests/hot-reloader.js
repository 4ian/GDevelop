// @ts-check
/**
 * Tests for gdjs.InputManager and related.
 */

describe('gdjs.HotReloader.deepEqual', () => {
  it('compares object, arrays, and primitives', () => {
    expect(gdjs.HotReloader.deepEqual('a', 'a')).to.be(true);
    expect(gdjs.HotReloader.deepEqual('a', 'b')).to.be(false);

    expect(gdjs.HotReloader.deepEqual(1, 1)).to.be(true);
    expect(gdjs.HotReloader.deepEqual(1, 2)).to.be(false);

    expect(gdjs.HotReloader.deepEqual(true, true)).to.be(true);
    expect(gdjs.HotReloader.deepEqual(true, false)).to.be(false);

    expect(gdjs.HotReloader.deepEqual({ a: 1 }, { a: 1 })).to.be(true);
    expect(gdjs.HotReloader.deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).to.be(
      true
    );
    expect(gdjs.HotReloader.deepEqual({ a: 1 }, { a: 2 })).to.be(false);
    expect(gdjs.HotReloader.deepEqual({ a: 1 }, { b: 2 })).to.be(false);
    expect(gdjs.HotReloader.deepEqual({ a: 1 }, { a: 1, b: 2 })).to.be(false);
    expect(gdjs.HotReloader.deepEqual({ a: 1, b: 2 }, { a: 1 })).to.be(false);

    expect(gdjs.HotReloader.deepEqual([1], [1])).to.be(true);
    expect(gdjs.HotReloader.deepEqual([1, 2], [1, 2])).to.be(true);
    expect(gdjs.HotReloader.deepEqual([1, { a: 1 }], [1, { a: 1 }])).to.be(
      true
    );
    expect(gdjs.HotReloader.deepEqual([1], [2])).to.be(false);
    expect(gdjs.HotReloader.deepEqual([1, 2], [2])).to.be(false);
    expect(gdjs.HotReloader.deepEqual([1, { a: 1 }], [1, { a: 2 }])).to.be(
      false
    );
  });

  it('hot-reloads variables', () => {
    const runtimeGame = new gdjs.RuntimeGame({
      variables: [],
      resources: { resources: [] },
      // @ts-expect-error ts-migrate(2740) FIXME: Type '{ windowWidth: number; windowHeight: number;... Remove this comment to see the full error message
      properties: { windowWidth: 800, windowHeight: 600 },
    });
    const hotReloader = new gdjs.HotReloader(runtimeGame);
    const variablesContainer = new gdjs.VariablesContainer([]);

    // Add a new variable
    /** @type {Required<VariableData>[]} */
    const dataWithMyVariable = [
      {
        name: 'MyVariable',
        value: '123',
        type: 'number',
        children: [],
      },
    ];
    hotReloader._hotReloadVariablesContainer(
      [],
      dataWithMyVariable,
      variablesContainer
    );
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').getAsNumber()).to.be(123);

    // Remove a new variable
    hotReloader._hotReloadVariablesContainer(
      dataWithMyVariable,
      [],
      variablesContainer
    );
    expect(variablesContainer.has('MyVariable')).to.be(false);

    // Change a variable
    /** @type {Required<VariableData>[]} */
    const dataWithMyVariableAsString = [
      {
        name: 'MyVariable',
        value: 'Hello World',
        type: 'string',
        children: [],
      },
    ];
    hotReloader._hotReloadVariablesContainer(
      dataWithMyVariable,
      dataWithMyVariableAsString,
      variablesContainer
    );
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').getAsString()).to.be(
      'Hello World'
    );

    // Change a variable to a boolean
    /** @type {Required<VariableData>[]} */
    const dataWithMyVariableAsBool = [
      {
        name: 'MyVariable',
        value: 'true',
        type: 'boolean',
        children: [],
      },
    ];
    hotReloader._hotReloadVariablesContainer(
      dataWithMyVariableAsString,
      dataWithMyVariableAsBool,
      variablesContainer
    );
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').getAsBoolean()).to.be(true);

    // Add a new structure
    /** @type {Required<VariableData>[]} */
    const dataWithMyVariableAsStructure = [
      {
        name: 'MyVariable',
        type: 'structure',
        value: '',
        children: [
          {
            name: 'MyChild1',
            value: '123',
            type: 'number',
            children: [],
          },
          {
            name: 'MyChild2',
            value: 'Hello World',
            type: 'string',
            children: [],
          },
        ],
      },
    ];
    hotReloader._hotReloadVariablesContainer(
      [],
      dataWithMyVariableAsStructure,
      variablesContainer
    );
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').isStructure()).to.be(true);
    expect(variablesContainer.get('MyVariable').hasChild('MyChild1')).to.be(
      true
    );
    expect(variablesContainer.get('MyVariable').hasChild('MyChild2')).to.be(
      true
    );
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild1').getAsNumber()
    ).to.be(123);
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild2').getAsString()
    ).to.be('Hello World');

    // Change a variable in a structure
    /** @type {Required<VariableData>[]} */
    const dataWithMyVariableAsStructure2 = [
      {
        name: 'MyVariable',
        type: 'structure',
        value: '',
        children: [
          {
            name: 'MyChild1',
            value: '124',
            type: 'number',
            children: [],
          },
          {
            name: 'MyChild2',
            value: 'Hello World 2',
            type: 'string',
            children: [],
          },
        ],
      },
    ];
    hotReloader._hotReloadVariablesContainer(
      dataWithMyVariableAsStructure,
      dataWithMyVariableAsStructure2,
      variablesContainer
    );
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').isStructure()).to.be(true);
    expect(variablesContainer.get('MyVariable').hasChild('MyChild1')).to.be(
      true
    );
    expect(variablesContainer.get('MyVariable').hasChild('MyChild2')).to.be(
      true
    );
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild1').getAsNumber()
    ).to.be(124);
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild2').getAsString()
    ).to.be('Hello World 2');

    // Remove a child variable
    /** @type {Required<VariableData>[]} */
    const dataWithMyVariableAsStructureWithoutChild1 = [
      {
        name: 'MyVariable',
        type: 'structure',
        value: '',
        children: [
          {
            name: 'MyChild2',
            value: 'Hello World 2',
            type: 'string',
            children: [],
          },
        ],
      },
    ];
    hotReloader._hotReloadVariablesContainer(
      dataWithMyVariableAsStructure2,
      dataWithMyVariableAsStructureWithoutChild1,
      variablesContainer
    );
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').isStructure()).to.be(true);
    expect(variablesContainer.get('MyVariable').hasChild('MyChild1')).to.be(
      false
    );
    expect(variablesContainer.get('MyVariable').hasChild('MyChild2')).to.be(
      true
    );
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild2').getAsString()
    ).to.be('Hello World 2');

    // Add a child variable as a structure
    /** @type {Required<VariableData>[]} */
    const dataWithMyVariableAsStructureWithChild1AsStructure = [
      {
        name: 'MyVariable',
        type: 'structure',
        value: '',
        children: [
          {
            name: 'MyChild1',
            type: 'structure',
            value: '',
            children: [
              {
                name: 'MyGrandChild1',
                value: '456',
                type: 'number',
                children: [],
              },
            ],
          },
          {
            name: 'MyChild2',
            value: 'Hello World 2',
            type: 'string',
            children: [],
          },
        ],
      },
    ];
    hotReloader._hotReloadVariablesContainer(
      dataWithMyVariableAsStructureWithoutChild1,
      dataWithMyVariableAsStructureWithChild1AsStructure,
      variablesContainer
    );
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').isStructure()).to.be(true);
    expect(variablesContainer.get('MyVariable').hasChild('MyChild1')).to.be(
      true
    );
    expect(variablesContainer.get('MyVariable').hasChild('MyChild2')).to.be(
      true
    );
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild2').getAsString()
    ).to.be('Hello World 2');
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild1').isStructure()
    ).to.be(true);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .hasChild('MyGrandChild1')
    ).to.be(true);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .getChild('MyGrandChild1')
        .getAsNumber()
    ).to.be(456);

    // Modify a grand child variable
    /** @type {Required<VariableData>[]} */
    const dataWithMyVariableAsStructureWithChild1AsStructure2 = [
      {
        name: 'MyVariable',
        type: 'structure',
        value: '',
        children: [
          {
            name: 'MyChild1',
            type: 'structure',
            value: '',
            children: [
              {
                name: 'MyGrandChild1',
                value: '789',
                type: 'number',
                children: [],
              },
            ],
          },
          {
            name: 'MyChild2',
            value: 'Hello World 2',
            type: 'string',
            children: [],
          },
        ],
      },
    ];
    hotReloader._hotReloadVariablesContainer(
      dataWithMyVariableAsStructureWithChild1AsStructure,
      dataWithMyVariableAsStructureWithChild1AsStructure2,
      variablesContainer
    );
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').isStructure()).to.be(true);
    expect(variablesContainer.get('MyVariable').hasChild('MyChild1')).to.be(
      true
    );
    expect(variablesContainer.get('MyVariable').hasChild('MyChild2')).to.be(
      true
    );
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild2').getAsString()
    ).to.be('Hello World 2');
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild1').isStructure()
    ).to.be(true);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .hasChild('MyGrandChild1')
    ).to.be(true);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .getChild('MyGrandChild1')
        .getAsNumber()
    ).to.be(789);

    // Remove a grand child variable and add another
    /** @type {Required<VariableData>[]} */
    const dataWithMyVariableAsStructureWithChild1AsStructure3 = [
      {
        name: 'MyVariable',
        type: 'structure',
        value: '',
        children: [
          {
            name: 'MyChild1',
            type: 'structure',
            value: '',
            children: [
              {
                name: 'MyGrandChild2',
                value: 'Hello World 3',
                type: 'string',
                children: [],
              },
            ],
          },
          {
            name: 'MyChild2',
            value: 'Hello World 2',
            type: 'string',
            children: [],
          },
        ],
      },
    ];
    hotReloader._hotReloadVariablesContainer(
      dataWithMyVariableAsStructureWithChild1AsStructure2,
      dataWithMyVariableAsStructureWithChild1AsStructure3,
      variablesContainer
    );
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').isStructure()).to.be(true);
    expect(variablesContainer.get('MyVariable').hasChild('MyChild1')).to.be(
      true
    );
    expect(variablesContainer.get('MyVariable').hasChild('MyChild2')).to.be(
      true
    );
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild2').getAsString()
    ).to.be('Hello World 2');
    expect(
      variablesContainer.get('MyVariable').getChild('MyChild1').isStructure()
    ).to.be(true);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .hasChild('MyGrandChild1')
    ).to.be(false);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .hasChild('MyGrandChild2')
    ).to.be(true);
    expect(
      variablesContainer
        .get('MyVariable')
        .getChild('MyChild1')
        .getChild('MyGrandChild2')
        .getAsString()
    ).to.be('Hello World 3');

    // Make the variable an array
    /** @type {Required<VariableData>[]} */
    const dataWithMyVariableAsArray = [
      {
        name: 'MyVariable',
        type: 'array',
        value: '',
        children: [
          {
            name: '',
            type: 'structure',
            value: '',
            children: [
              {
                name: 'MyGrandChild2',
                value: 'Hello World 3',
                type: 'string',
              },
            ],
          },
          {
            name: '',
            value: 'Hello World 2',
            type: 'string',
            children: [],
          },
        ],
      },
    ];
    hotReloader._hotReloadVariablesContainer(
      dataWithMyVariableAsStructureWithChild1AsStructure3,
      dataWithMyVariableAsArray,
      variablesContainer
    );
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').getType()).to.be('array');
    expect(variablesContainer.get('MyVariable').getChildrenCount()).to.be(2);
    const array = variablesContainer.get('MyVariable');
    expect(array.getChild(0).getType()).to.be('structure');
    expect(array.getChild(0).getChild('MyGrandChild2').getAsString()).to.be(
      'Hello World 3'
    );
    expect(array.getChild(1).getType()).to.be('string');
    expect(array.getChild(1).getAsString()).to.be('Hello World 2');
  });
});
