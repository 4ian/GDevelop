// @flow
import {
  makeInstancePathStep,
  getInstanceIdFromPathStep,
  resolveInspectorPathStep,
  getAtInspectorPath,
} from './inspectorPath';

describe('inspectorPath', () => {
  const makeInstances = () => [
    { id: 7, name: 'first' },
    { id: 42, name: 'second' },
  ];

  it('addresses an instance by its identifier', () => {
    expect(makeInstancePathStep(42)).toBe('#42');
    expect(getInstanceIdFromPathStep('#42')).toBe(42);
    expect(getInstanceIdFromPathStep('_variables')).toBeNull();
    expect(getInstanceIdFromPathStep('#nothing')).toBeNull();
  });

  it('finds the instance whatever its position in the list', () => {
    const instances = makeInstances();
    expect(resolveInspectorPathStep(instances, '#42')).toBe(instances[1]);

    // An instance created before it shifts the list: the path still leads to
    // the same instance, which is the whole point of addressing it by id.
    instances.unshift({ id: 1, name: 'new' });
    expect(resolveInspectorPathStep(instances, '#42').name).toBe('second');
  });

  it('answers nothing for an instance that is gone', () => {
    expect(resolveInspectorPathStep(makeInstances(), '#404')).toBeUndefined();
  });

  it('reads plain properties as before', () => {
    const scene = { _variables: { Score: 1 }, items: { Player: [] } };
    expect(getAtInspectorPath(scene, '_variables')).toEqual({ Score: 1 });
    expect(getAtInspectorPath(scene, ['items', 'Player'])).toEqual([]);
    expect(getAtInspectorPath(scene, ['items', 'Missing'])).toBeNull();
    expect(getAtInspectorPath(null, 'anything')).toBeNull();
  });

  it('walks a whole path down to an instance', () => {
    const game = { _instances: { items: { Player: makeInstances() } } };
    const instance = getAtInspectorPath(game, [
      '_instances',
      'items',
      'Player',
      '#7',
    ]);
    expect(instance && instance.name).toBe('first');
  });
});
