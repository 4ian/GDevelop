// @ts-check
/**
 * Tests for gdjs.HotReloader and related.
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
});

describe('gdjs.HotReloader._hotReloadVariablesContainer', () => {
  /**
   * When `current` is not set `oldInit` is used instead.
   * It's as if the hot-reload happened before any variable has been changed by events.
   * @param {{oldInit: RootVariableData[], current?: RootVariableData[], newInit: RootVariableData[]}}
   * @returns {gdjs.VariablesContainer}
   */
  const hotReloadVariablesContainer = ({ oldInit, current, newInit }) => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const hotReloader = new gdjs.HotReloader(runtimeGame);
    const variablesContainer = new gdjs.VariablesContainer([]);
    variablesContainer.initFrom(current || oldInit);
    hotReloader._hotReloadVariablesContainer(
      oldInit,
      newInit,
      variablesContainer
    );
    return variablesContainer;
  };

  it('can modify a variable at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable1',
          value: '123',
          type: 'number',
        },
        {
          name: 'MyVariable2',
          value: '456',
          type: 'number',
        },
      ],
      // The variable values have been changed by events.
      current: [
        {
          name: 'MyVariable1',
          value: '111',
          type: 'number',
        },
        {
          name: 'MyVariable2',
          value: '222',
          type: 'number',
        },
      ],
      newInit: [
        // It's the same initial value as before.
        {
          name: 'MyVariable1',
          value: '123',
          type: 'number',
        },
        // The initial value has changed.
        {
          name: 'MyVariable2',
          value: '789',
          type: 'number',
        },
      ],
    });
    // The current value is kept.
    expect(variablesContainer.has('MyVariable1')).to.be(true);
    expect(variablesContainer.get('MyVariable1').getAsNumber()).to.be(111);
    expect(variablesContainer.getFromIndex(0).getAsNumber()).to.be(111);
    // The current value is overridden.
    expect(variablesContainer.has('MyVariable2')).to.be(true);
    expect(variablesContainer.get('MyVariable2').getAsNumber()).to.be(789);
    expect(variablesContainer.getFromIndex(1).getAsNumber()).to.be(789);
  });

  // In the following cases, current === oldInit.

  it('can add a variable at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [],
      newInit: [
        {
          name: 'MyVariable',
          value: '123',
          type: 'number',
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').getAsNumber()).to.be(123);
    expect(variablesContainer.getFromIndex(0).getAsNumber()).to.be(123);
  });

  it('can add a variable before another one at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable2',
          value: 'Hello World',
          type: 'string',
        },
      ],
      newInit: [
        {
          name: 'MyVariable1',
          value: '123',
          type: 'number',
        },
        {
          name: 'MyVariable2',
          value: 'Hello World',
          type: 'string',
        },
      ],
    });
    expect(variablesContainer.has('MyVariable1')).to.be(true);
    expect(variablesContainer.get('MyVariable1').getAsNumber()).to.be(123);
    expect(variablesContainer.getFromIndex(0).getAsNumber()).to.be(123);
    expect(variablesContainer.has('MyVariable2')).to.be(true);
    expect(variablesContainer.get('MyVariable2').getAsString()).to.be(
      'Hello World'
    );
    expect(variablesContainer.getFromIndex(1).getAsString()).to.be(
      'Hello World'
    );
  });

  it('can remove a variable at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          value: '123',
          type: 'number',
        },
      ],
      newInit: [],
    });
    expect(variablesContainer.has('MyVariable')).to.be(false);
  });

  it('can change a variable from number to string at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          value: '123',
          type: 'number',
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          value: 'Hello World',
          type: 'string',
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').getAsString()).to.be(
      'Hello World'
    );
  });

  it('can change a variable from number to boolean at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          value: '123',
          type: 'number',
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          value: 'true',
          type: 'boolean',
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').getAsBoolean()).to.be(true);
  });

  it('can change a variable from number to structure at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          value: '123',
          type: 'number',
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              value: '123',
              type: 'number',
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
    });
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
  });

  it('can modify a child variable value at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              value: '123',
              type: 'number',
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              value: '124',
              type: 'number',
            },
            {
              name: 'MyChild2',
              value: 'Hello World 2',
              type: 'string',
            },
          ],
        },
      ],
    });
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
  });

  it('can remove a child variable at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              value: '123',
              type: 'number',
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
    });
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
    ).to.be('Hello World');
  });

  it('can add a child variable as a structure at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              value: '123',
              type: 'number',
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              type: 'structure',
              children: [
                {
                  name: 'MyGrandChild1',
                  value: '456',
                  type: 'number',
                },
              ],
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
    });
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
    ).to.be('Hello World');
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
  });

  it('can modify a gand child variable at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              type: 'structure',
              children: [
                {
                  name: 'MyGrandChild1',
                  value: '456',
                  type: 'number',
                },
              ],
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              type: 'structure',
              children: [
                {
                  name: 'MyGrandChild1',
                  value: '789',
                  type: 'number',
                },
              ],
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
    });
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
    ).to.be('Hello World');
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
  });

  it('can remove a grand child variable and add another at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              type: 'structure',
              children: [
                {
                  name: 'MyGrandChild1',
                  value: '456',
                  type: 'number',
                },
              ],
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              type: 'structure',
              children: [
                {
                  name: 'MyGrandChild2',
                  value: 'Hello World 3',
                  type: 'string',
                },
              ],
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
    });
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
    ).to.be('Hello World');
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
  });

  it('can change a variable from structure to array at hot-reload', () => {
    const variablesContainer = hotReloadVariablesContainer({
      oldInit: [
        {
          name: 'MyVariable',
          type: 'structure',
          children: [
            {
              name: 'MyChild1',
              value: '123',
              type: 'number',
            },
            {
              name: 'MyChild2',
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
      newInit: [
        {
          name: 'MyVariable',
          type: 'array',
          children: [
            {
              value: '123',
              type: 'number',
            },
            {
              value: 'Hello World',
              type: 'string',
            },
          ],
        },
      ],
    });
    expect(variablesContainer.has('MyVariable')).to.be(true);
    expect(variablesContainer.get('MyVariable').getType()).to.be('array');
    expect(variablesContainer.get('MyVariable').getChildrenCount()).to.be(2);
    const array = variablesContainer.get('MyVariable');
    expect(array.getChild('0').getType()).to.be('number');
    expect(array.getChild('0').getAsNumber()).to.be(123);
    expect(array.getChild('1').getType()).to.be('string');
    expect(array.getChild('1').getAsString()).to.be('Hello World');
  });
});
