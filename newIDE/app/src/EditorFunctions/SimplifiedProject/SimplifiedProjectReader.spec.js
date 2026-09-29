// @flow
// Keep in sync with the backend reader spec (marker strings must stay
// identical: update both in the same change).
import {
  navigateSimplifiedProjectJson,
  parsePath,
} from './SimplifiedProjectReader';

const fakeProject = {
  properties: { gameResolutionWidth: 1280, gameResolutionHeight: 720 },
  scenes: [
    {
      sceneName: 'Home',
      objects: [],
    },
    {
      sceneName: 'Level1',
      objects: [
        { objectName: 'Player', objectType: 'Sprite' },
        { objectName: 'Enemy', objectType: 'Sprite' },
      ],
    },
    { sceneName: 'Level2', objects: [] },
    { sceneName: 'BossLevel', objects: [] },
    { sceneName: 'Level3', objects: [] },
  ],
};

describe('parsePath', () => {
  it('parses dot-separated keys, indices and wildcards', () => {
    expect(parsePath('scenes[0].objects[*].objectName')).toEqual([
      { type: 'key', key: 'scenes' },
      { type: 'index', index: 0 },
      { type: 'key', key: 'objects' },
      { type: 'wildcard' },
      { type: 'key', key: 'objectName' },
    ]);
  });

  it('parses string literal keys with escapes', () => {
    expect(parsePath('obj["say \\"hi\\""]')).toEqual([
      { type: 'key', key: 'obj' },
      { type: 'key', key: 'say "hi"' },
    ]);
    expect(parsePath('obj["a\\\\b"]')).toEqual([
      { type: 'key', key: 'obj' },
      { type: 'key', key: 'a\\b' },
    ]);
    expect(parsePath('["top level"].sub')).toEqual([
      { type: 'key', key: 'top level' },
      { type: 'key', key: 'sub' },
    ]);
  });
});

describe('navigateSimplifiedProjectJson', () => {
  it('reads values through dot paths, indices and wildcards', () => {
    expect(
      navigateSimplifiedProjectJson({
        project: fakeProject,
        path: 'properties.gameResolutionWidth',
        maxDepth: 5,
      })
    ).toEqual({ success: true, result: 1280 });

    expect(
      navigateSimplifiedProjectJson({
        project: fakeProject,
        path: 'scenes[1].objects[*].objectName',
        maxDepth: 5,
      })
    ).toEqual({ success: true, result: ['Player', 'Enemy'] });
  });

  it('navigates keys given as string literals with escapes', () => {
    const project = { data: { 'say "hello"': 'world' } };
    expect(
      navigateSimplifiedProjectJson({
        project,
        path: 'data["say \\"hello\\""]',
        maxDepth: 5,
      })
    ).toEqual({ success: true, result: 'world' });
  });

  it('filters with contains (case-insensitive)', () => {
    const result = navigateSimplifiedProjectJson({
      project: fakeProject,
      path: 'scenes',
      filter: { property: 'sceneName', contains: 'level' },
      maxDepth: 2,
    });
    if (!result.success) throw new Error(result.message);
    expect(result.result.map(scene => scene.sceneName)).toEqual([
      'Level1',
      'Level2',
      'BossLevel',
      'Level3',
    ]);
  });

  it('paginates with offset/limit and appends the exact continuation marker', () => {
    const result = navigateSimplifiedProjectJson({
      project: fakeProject,
      path: 'scenes',
      offset: 1,
      limit: 2,
      maxDepth: 2,
    });
    if (!result.success) throw new Error(result.message);
    expect(result.result).toHaveLength(3);
    expect(result.result[0].sceneName).toBe('Level1');
    expect(result.result[1].sceneName).toBe('Level2');
    expect(result.result[2]).toBe(
      '... and 2 more items (continue with offset=3)'
    );
  });

  it('returns the exact marker when the offset is beyond the end', () => {
    const result = navigateSimplifiedProjectJson({
      project: fakeProject,
      path: 'scenes',
      offset: 10,
      maxDepth: 2,
    });
    if (!result.success) throw new Error(result.message);
    expect(result.result).toEqual([
      '(no items: offset 10 is beyond the end - the array has 5 items)',
    ]);
  });

  it('counts arrays with countOnly, even at maxDepth 0', () => {
    const result = navigateSimplifiedProjectJson({
      project: fakeProject,
      path: 'scenes',
      countOnly: true,
      maxDepth: 0,
    });
    if (!result.success) throw new Error(result.message);
    expect(result.result).toEqual({ count: 5 });
  });

  it('rejects countOnly on a non-array result', () => {
    const result = navigateSimplifiedProjectJson({
      project: fakeProject,
      path: 'scenes[0].sceneName',
      countOnly: true,
    });
    expect(result.success).toBe(false);
  });

  it('lists the available keys for a missing key', () => {
    const result = navigateSimplifiedProjectJson({
      project: fakeProject,
      path: 'scenes[0].name',
      maxDepth: 5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBe(
        'Key "name" not found. Available keys: sceneName, objects.'
      );
    }
  });

  it('truncates to maxDepth with the exact summary markers', () => {
    const result = navigateSimplifiedProjectJson({
      project: fakeProject,
      path: 'scenes[1]',
      maxDepth: 1,
    });
    if (!result.success) throw new Error(result.message);
    expect(result.result.sceneName).toBe('Level1');
    expect(result.result.objects).toBe('[2 items]');
  });

  it('truncates long strings and reports the exact warning', () => {
    const project = { dialogue: 'A'.repeat(1000) };
    const result = navigateSimplifiedProjectJson({
      project,
      path: 'dialogue',
      maxDepth: 5,
      maxStringLength: 50,
    });
    if (!result.success) throw new Error(result.message);
    expect(result.result).toBe(
      `${'A'.repeat(50)}... [truncated — 1000 chars total]`
    );
    expect(result.truncationWarning).toBe(
      '1 string(s) were truncated to 50 chars. Specify a path and maxStringLength to read full values.'
    );
  });

  it('caps large arrays to fit the token budget with a warning', () => {
    const items = Array.from({ length: 200 }, (_, i) => ({
      name: `Object${i}`,
      type: 'Sprite',
      data: { x: i, y: i * 2 },
    }));
    const project = { scenes: [{ objects: items }] };
    const result = navigateSimplifiedProjectJson({
      project,
      path: 'scenes[0].objects',
      maxDepth: 5,
      maxTokens: 500,
    });
    if (!result.success) throw new Error(result.message);
    expect(result.result.length).toBe(21); // 20 + 1 for the "truncated" hint.
    expect(result.truncationWarning).toContain('too large');
  });
});
