//@ts-check
/**
 * Tests for the serialization used by the debugger client to send the game state.
 */

describe('gdjs.circularSafeStringify', function () {
  it('serializes plain objects like JSON.stringify', function () {
    const object = { a: 1, b: 'text', c: { d: [1, 2, { e: true }] } };
    expect(gdjs.circularSafeStringify(object)).to.be(JSON.stringify(object));
  });

  it('replaces circular references with a placeholder', function () {
    const root = { name: 'root', child: { name: 'child' } };
    // @ts-ignore
    root.child.parent = root;
    // @ts-ignore
    root.self = root;
    // @ts-ignore
    root.child.self = root.child;

    expect(JSON.parse(gdjs.circularSafeStringify(root))).to.eql({
      name: 'root',
      child: {
        name: 'child',
        parent: '[Circular ~]',
        self: '[Circular ~.child]',
      },
      self: '[Circular ~]',
    });
  });

  it('calls the replacer for each value', function () {
    const object = { keep: 1, remove: 2, nested: { remove: 3, keep: 4 } };
    const serialized = gdjs.circularSafeStringify(object, (key, value) =>
      key === 'remove' ? '[Removed]' : value
    );

    expect(JSON.parse(serialized)).to.eql({
      keep: 1,
      remove: '[Removed]',
      nested: { remove: '[Removed]', keep: 4 },
    });
  });

  it('replaces values past the maximum depth, for all properties of an object', function () {
    const object = {
      l1: { l2: { l3: { x: 1, y: 2 }, z: 3 }, w: 4 },
    };

    expect(JSON.parse(gdjs.circularSafeStringify(object, undefined, 1))).to.eql(
      {
        l1: {
          l2: { l3: '[Max depth reached]', z: '[Max depth reached]' },
          w: 4,
        },
      }
    );
    expect(JSON.parse(gdjs.circularSafeStringify(object, undefined, 2))).to.eql(
      {
        l1: {
          l2: {
            l3: { x: '[Max depth reached]', y: '[Max depth reached]' },
            z: 3,
          },
          w: 4,
        },
      }
    );
    expect(JSON.parse(gdjs.circularSafeStringify(object, undefined, 3))).to.eql(
      object
    );
  });

  it('keeps serializing siblings after a branch reached the maximum depth', function () {
    const object = {
      first: { deep: { deeper: 1 } },
      second: 2,
      third: { ok: true },
    };

    expect(JSON.parse(gdjs.circularSafeStringify(object, undefined, 1))).to.eql(
      {
        first: { deep: { deeper: '[Max depth reached]' } },
        second: 2,
        third: { ok: true },
      }
    );
  });

  it('truncates deeply nested variables consistently', function () {
    const variablesContainer = new gdjs.VariablesContainer();
    const structure = variablesContainer.get('Root');
    let current = structure;
    for (let i = 0; i < 6; i++) {
      current = current.getChild('Child' + i);
    }
    current.setString('Deep value');

    const serialized = JSON.parse(
      gdjs.circularSafeStringify({ variablesContainer }, undefined, 6)
    );
    const root = serialized.variablesContainer._variables.items.Root;
    expect(root._type).to.be('structure');
    expect(root._children.Child0._type).to.be('structure');
    // The variable past the depth limit is entirely replaced by the placeholder,
    // not a mix of real fields and placeholders.
    expect(root._children.Child0._children.Child1).to.be('[Max depth reached]');
  });
});
