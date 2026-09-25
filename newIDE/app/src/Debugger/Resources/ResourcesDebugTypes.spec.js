// @flow
import {
  compareResource,
  computeMemorySegments,
  describeOrigin,
  filterResources,
  formatBytes,
  formatDurationMs,
  formatSignedDelta,
  getLoadDurationMs,
  getMemoryLimitBytes,
  indexResourcesByName,
  sortResources,
  type ResourceLoadRecord,
  type ResourcesDebugState,
} from './ResourcesDebugTypes';

const makeRecord = (
  overrides: Partial<ResourceLoadRecord>
): ResourceLoadRecord => ({
  name: 'resource',
  kind: 'image',
  file: 'assets/resource.png',
  status: 'ready',
  attempts: 1,
  origin: { type: 'startup', sceneName: null },
  requesters: [],
  loadStartedAtMs: 100,
  loadedAtMs: 150,
  readyAtMs: 180,
  unloadHistory: [],
  transferBytes: 2000,
  decodedBytes: 2500,
  estimatedMemoryBytes: 4000,
  metrics: null,
  ...overrides,
});

describe('ResourcesDebugTypes', () => {
  it('formats bytes and durations', () => {
    expect(formatBytes(null)).toBe('-');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1500)).toBe('1.50 kB');
    expect(formatBytes(4 * 1000 * 1000)).toBe('4.00 MB');
    expect(formatBytes(12.5 * 1000 * 1000 * 1000)).toBe('12.5 GB');
    expect(formatDurationMs(128)).toBe('128 ms');
    expect(formatDurationMs(2300)).toBe('2.30 s');
  });

  it('computes the load duration up to the resource being ready', () => {
    expect(getLoadDurationMs(makeRecord({}))).toBe(80);
    expect(getLoadDurationMs(makeRecord({ readyAtMs: undefined }))).toBe(50);
    expect(
      getLoadDurationMs(
        makeRecord({ loadStartedAtMs: undefined, readyAtMs: undefined })
      )
    ).toBeNull();
  });

  it('describes origins', () => {
    expect(describeOrigin({ type: 'startup', sceneName: null })).toBe(
      'Startup (global)'
    );
    expect(
      describeOrigin({ type: 'scene', sceneName: 'Game', foreground: false })
    ).toBe('Scene Game (background)');
    expect(
      describeOrigin({ type: 'object', sceneName: 'Game', objectName: 'Boss' })
    ).toBe('Object Boss (Game)');
  });

  describe('sortResources', () => {
    const records = [
      makeRecord({
        name: 'b',
        estimatedMemoryBytes: 10,
        transferBytes: null,
        decodedBytes: null,
      }),
      makeRecord({
        name: 'a',
        estimatedMemoryBytes: null,
        transferBytes: 5,
        decodedBytes: null,
      }),
      makeRecord({
        name: 'c',
        estimatedMemoryBytes: 30,
        transferBytes: 1,
        decodedBytes: null,
      }),
    ];

    it('sorts by name in both directions', () => {
      expect(sortResources(records, 'name', 'ASC').map(r => r.name)).toEqual([
        'a',
        'b',
        'c',
      ]);
      expect(sortResources(records, 'name', 'DESC').map(r => r.name)).toEqual([
        'c',
        'b',
        'a',
      ]);
    });

    it('keeps unknown numbers last in both directions', () => {
      expect(
        sortResources(records, 'estimatedMemoryBytes', 'DESC').map(r => r.name)
      ).toEqual(['c', 'b', 'a']);
      expect(
        sortResources(records, 'estimatedMemoryBytes', 'ASC').map(r => r.name)
      ).toEqual(['b', 'c', 'a']);
      expect(
        sortResources(records, 'transferBytes', 'ASC').map(r => r.name)
      ).toEqual(['c', 'a', 'b']);
    });

    it('sorts by status severity', () => {
      const byStatus = [
        makeRecord({ name: 'ready', status: 'ready' }),
        makeRecord({ name: 'error', status: 'error' }),
        makeRecord({ name: 'loading', status: 'loading' }),
      ];
      expect(sortResources(byStatus, 'status', 'ASC').map(r => r.name)).toEqual(
        ['error', 'loading', 'ready']
      );
    });
  });

  it('filters by kind, status and text', () => {
    const records = [
      makeRecord({ name: 'hero.png', kind: 'image' }),
      makeRecord({ name: 'jump.wav', kind: 'audio', status: 'not-loaded' }),
      makeRecord({
        name: 'boss.glb',
        kind: 'model3D',
        origin: { type: 'object', sceneName: 'Game', objectName: 'Boss' },
      }),
    ];
    expect(
      filterResources(records, {
        searchText: '',
        kinds: ['audio'],
        statuses: [],
      }).map(r => r.name)
    ).toEqual(['jump.wav']);
    expect(
      filterResources(records, {
        searchText: '',
        kinds: [],
        statuses: ['ready'],
      }).map(r => r.name)
    ).toEqual(['hero.png', 'boss.glb']);
    expect(
      filterResources(records, {
        searchText: 'boss',
        kinds: [],
        statuses: [],
      }).map(r => r.name)
    ).toEqual(['boss.glb']);
  });

  it('computes memory segments, an unknown segment and the limit overflow', () => {
    const records = [
      makeRecord({ name: 'big', estimatedMemoryBytes: 60 }),
      makeRecord({ name: 'small', estimatedMemoryBytes: 20 }),
      makeRecord({ name: 'unknown', estimatedMemoryBytes: null }),
      makeRecord({ name: 'not loaded', status: 'not-loaded' }),
    ];
    const segments = computeMemorySegments(records, 100);
    expect(segments.knownBytes).toBe(80);
    expect(segments.unknownResourcesCount).toBe(1);
    expect(segments.isOverLimit).toBe(false);
    expect(segments.segments.map(segment => segment.isUnknown)).toEqual([
      false,
      false,
      true,
    ]);
    expect(
      segments.segments[0].record && segments.segments[0].record.name
    ).toBe('big');
    expect(segments.segments[0].share).toBe(0.6);
    expect(computeMemorySegments(records, 50).isOverLimit).toBe(true);
    // Without limit, the sum of the known bytes is the scale.
    expect(computeMemorySegments(records, 0).limitBytes).toBe(80);
  });

  it('picks the memory limit', () => {
    const state: ResourcesDebugState = {
      generatedAtMs: 0,
      currentSceneName: null,
      sceneChanges: [],
      device: {
        deviceMemoryBytes: 8 * 1024 * 1024 * 1024,
        jsHeapSizeLimit: 4 * 1024 * 1024 * 1024,
        usedJSHeapSize: null,
      },
      totals: {
        byStatus: {},
        byKind: {},
        estimatedMemoryBytes: 0,
        transferBytes: 0,
      },
      resources: [],
    };
    expect(getMemoryLimitBytes(state, 64)).toBe(64 * 1024 * 1024);
    expect(getMemoryLimitBytes(state, null)).toBe(8 * 1024 * 1024 * 1024);
    expect(getMemoryLimitBytes(null, null)).toBe(0);
  });

  describe('compareResource', () => {
    it('gives the differences with the resource of the same name', () => {
      const baselineRecordsByName = indexResourcesByName([
        makeRecord({
          name: 'Player',
          estimatedMemoryBytes: 1000,
          loadStartedAtMs: 0,
          readyAtMs: 50,
        }),
      ]);
      expect(
        compareResource(
          makeRecord({
            name: 'Player',
            estimatedMemoryBytes: 4000,
            loadStartedAtMs: 100,
            readyAtMs: 120,
          }),
          baselineRecordsByName
        )
      ).toEqual({
        isMissingInBaseline: false,
        memoryDeltaBytes: 3000,
        loadDurationDeltaMs: -30,
      });
    });

    it('tells a resource the reference did not have', () => {
      expect(
        compareResource(
          makeRecord({ name: 'NewEnemy', estimatedMemoryBytes: 10 }),
          indexResourcesByName([])
        )
      ).toEqual({
        isMissingInBaseline: true,
        memoryDeltaBytes: null,
        loadDurationDeltaMs: null,
      });
    });

    it('gives no difference for a value unknown on one side', () => {
      const comparison = compareResource(
        makeRecord({ name: 'Music', estimatedMemoryBytes: 10 }),
        indexResourcesByName([
          makeRecord({
            name: 'Music',
            estimatedMemoryBytes: null,
            loadStartedAtMs: null,
          }),
        ])
      );
      expect(comparison.memoryDeltaBytes).toBe(null);
      expect(comparison.loadDurationDeltaMs).toBe(null);
    });
  });

  describe('formatSignedDelta', () => {
    it('signs the difference, and marks what did not change', () => {
      expect(formatSignedDelta(3000, formatBytes)).toBe('+3.00 kB');
      expect(formatSignedDelta(-30, formatDurationMs)).toBe('-30 ms');
      expect(formatSignedDelta(0, formatBytes)).toBe('=');
      expect(formatSignedDelta(null, formatBytes)).toBe('-');
    });
  });
});
