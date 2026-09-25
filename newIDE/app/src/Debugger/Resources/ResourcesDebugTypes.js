// @flow
// Mirrors `gdjs.ResourceLoadTracker` types (GDJS/Runtime/resource-load-tracker.ts).

export type ResourceLoadOrigin =
  | {| type: 'startup', sceneName: ?string |}
  | {| type: 'scene', sceneName: string, foreground: boolean |}
  | {| type: 'object', sceneName: string, objectName: string |}
  | {| type: 'editor' |};

export type ResourceLoadStatus =
  | 'not-loaded'
  | 'loading'
  | 'loaded'
  | 'processing'
  | 'ready'
  | 'error';

export const resourceLoadStatuses: Array<ResourceLoadStatus> = [
  'ready',
  'loaded',
  'processing',
  'loading',
  'error',
  'not-loaded',
];

export type ResourceDebugMetrics = {
  width?: number,
  height?: number,
  durationInSeconds?: number,
  estimatedMemoryBytes?: number,
  extra?: { [string]: string | number | boolean },
};

export type ResourceLoadRecord = {|
  name: string,
  kind: string,
  file: string,
  status: ResourceLoadStatus,
  errorMessage?: string,
  attempts: number,
  origin: ?ResourceLoadOrigin,
  requesters: Array<ResourceLoadOrigin>,
  loadStartedAtMs?: number,
  loadedAtMs?: number,
  readyAtMs?: number,
  unloadHistory: Array<{| unloadedAtMs: number, reloadedAtMs?: number |}>,
  transferBytes: ?number,
  decodedBytes: ?number,
  estimatedMemoryBytes: ?number,
  metrics: ?ResourceDebugMetrics,
|};

export type ResourcesDebugState = {|
  generatedAtMs: number,
  currentSceneName: ?string,
  sceneChanges: Array<{| atMs: number, sceneName: string |}>,
  device: {|
    deviceMemoryBytes: ?number,
    jsHeapSizeLimit: ?number,
    usedJSHeapSize: ?number,
  |},
  totals: {|
    byStatus: { [ResourceLoadStatus]: number },
    byKind: { [string]: number },
    estimatedMemoryBytes: number,
    transferBytes: number,
  |},
  resources: Array<ResourceLoadRecord>,
|};

export type ResourcesSortKey =
  | 'kind'
  | 'name'
  | 'file'
  | 'status'
  | 'transferBytes'
  | 'estimatedMemoryBytes'
  | 'loadDurationMs'
  | 'origin'
  | 'loadStartedAtMs';

export type ResourcesFilters = {|
  searchText: string,
  /** Empty: every kind. */
  kinds: Array<string>,
  /** Empty: every status. */
  statuses: Array<ResourceLoadStatus>,
|};

export const emptyResourcesFilters: ResourcesFilters = {
  searchText: '',
  kinds: [],
  statuses: [],
};

const BYTES_UNITS = ['B', 'kB', 'MB', 'GB', 'TB'];

/** Format bytes as "1.5 MB" (decimal units, one decimal above kB). */
export const formatBytes = (bytes: ?number): string => {
  if (bytes == null || !Number.isFinite(bytes)) return '-';
  if (bytes < 1000) return `${Math.round(bytes)} B`;
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1000 && unitIndex < BYTES_UNITS.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  return `${value < 10 ? value.toFixed(2) : value.toFixed(1)} ${
    BYTES_UNITS[unitIndex]
  }`;
};

/** Format a duration in milliseconds as "128 ms" or "2.3 s". */
export const formatDurationMs = (durationMs: ?number): string => {
  if (durationMs == null || !Number.isFinite(durationMs)) return '-';
  if (durationMs < 1000) return `${Math.round(durationMs)} ms`;
  return `${(durationMs / 1000).toFixed(2)} s`;
};

/** From the start of the download to the resource being usable. */
export const getLoadDurationMs = (record: ResourceLoadRecord): ?number => {
  if (record.loadStartedAtMs == null) return null;
  const endMs =
    record.readyAtMs != null
      ? record.readyAtMs
      : record.loadedAtMs != null
      ? record.loadedAtMs
      : null;
  return endMs == null ? null : endMs - record.loadStartedAtMs;
};

/**
 * How a resource compares to the same resource (by name) in the reference
 * recording. `isMissingInBaseline` tells a resource the reference never had
 * apart from one whose values could not be measured on either side.
 */
export type ResourceComparison = {|
  isMissingInBaseline: boolean,
  memoryDeltaBytes: ?number,
  loadDurationDeltaMs: ?number,
|};

export const indexResourcesByName = (
  records: Array<ResourceLoadRecord>
): Map<string, ResourceLoadRecord> => {
  const recordsByName = new Map();
  records.forEach(record => recordsByName.set(record.name, record));
  return recordsByName;
};

const subtractIfBothKnown = (value: ?number, baselineValue: ?number): ?number =>
  value == null || baselineValue == null ? null : value - baselineValue;

export const compareResource = (
  record: ResourceLoadRecord,
  baselineRecordsByName: Map<string, ResourceLoadRecord>
): ResourceComparison => {
  const baselineRecord = baselineRecordsByName.get(record.name);
  if (!baselineRecord) {
    return {
      isMissingInBaseline: true,
      memoryDeltaBytes: null,
      loadDurationDeltaMs: null,
    };
  }
  return {
    isMissingInBaseline: false,
    memoryDeltaBytes: subtractIfBothKnown(
      record.estimatedMemoryBytes,
      baselineRecord.estimatedMemoryBytes
    ),
    loadDurationDeltaMs: subtractIfBothKnown(
      getLoadDurationMs(record),
      getLoadDurationMs(baselineRecord)
    ),
  };
};

/** A difference with its sign, or a dash when it could not be measured. */
export const formatSignedDelta = (
  delta: ?number,
  format: (value: number) => string
): string => {
  if (delta == null || !Number.isFinite(delta)) return '-';
  if (delta === 0) return '=';
  return `${delta > 0 ? '+' : '-'}${format(Math.abs(delta))}`;
};

/** A short text for an origin, used for sorting and searching (not translated). */
export const describeOrigin = (origin: ?ResourceLoadOrigin): string => {
  if (!origin) return '';
  switch (origin.type) {
    case 'startup':
      return origin.sceneName
        ? `Startup (${origin.sceneName})`
        : 'Startup (global)';
    case 'scene':
      return `Scene ${origin.sceneName}${
        origin.foreground ? '' : ' (background)'
      }`;
    case 'object':
      return `Object ${origin.objectName} (${origin.sceneName})`;
    case 'editor':
      return 'Editor';
    default:
      return '';
  }
};

const statusSeverity: { [ResourceLoadStatus]: number } = {
  error: 0,
  loading: 1,
  processing: 2,
  loaded: 3,
  ready: 4,
  'not-loaded': 5,
};

const compareNullableNumbers = (a: ?number, b: ?number): number => {
  // Unknown values always go last, whatever the direction.
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
};

export const sortResources = (
  records: Array<ResourceLoadRecord>,
  sortBy: ResourcesSortKey,
  direction: 'ASC' | 'DESC'
): Array<ResourceLoadRecord> => {
  const sign = direction === 'ASC' ? 1 : -1;
  const compare = (a: ResourceLoadRecord, b: ResourceLoadRecord): number => {
    switch (sortBy) {
      case 'kind':
        return a.kind.localeCompare(b.kind);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'file':
        return a.file.localeCompare(b.file);
      case 'status':
        return statusSeverity[a.status] - statusSeverity[b.status];
      case 'origin':
        return describeOrigin(a.origin).localeCompare(describeOrigin(b.origin));
      case 'transferBytes': {
        // The size column shows the file size when known, the transfer otherwise.
        const sizeA = a.decodedBytes != null ? a.decodedBytes : a.transferBytes;
        const sizeB = b.decodedBytes != null ? b.decodedBytes : b.transferBytes;
        const result = compareNullableNumbers(sizeA, sizeB);
        return sizeA == null || sizeB == null ? result * sign : result;
      }
      case 'estimatedMemoryBytes': {
        const result = compareNullableNumbers(
          a.estimatedMemoryBytes,
          b.estimatedMemoryBytes
        );
        return a.estimatedMemoryBytes == null || b.estimatedMemoryBytes == null
          ? result * sign
          : result;
      }
      case 'loadDurationMs': {
        const durationA = getLoadDurationMs(a);
        const durationB = getLoadDurationMs(b);
        const result = compareNullableNumbers(durationA, durationB);
        return durationA == null || durationB == null ? result * sign : result;
      }
      case 'loadStartedAtMs': {
        const result = compareNullableNumbers(
          a.loadStartedAtMs,
          b.loadStartedAtMs
        );
        return a.loadStartedAtMs == null || b.loadStartedAtMs == null
          ? result * sign
          : result;
      }
      default:
        return 0;
    }
  };
  return [...records].sort(
    (a, b) => sign * compare(a, b) || a.name.localeCompare(b.name)
  );
};

export const filterResources = (
  records: Array<ResourceLoadRecord>,
  filters: ResourcesFilters
): Array<ResourceLoadRecord> => {
  const searchText = filters.searchText.trim().toLowerCase();
  return records.filter(record => {
    if (filters.kinds.length && !filters.kinds.includes(record.kind)) {
      return false;
    }
    if (filters.statuses.length && !filters.statuses.includes(record.status)) {
      return false;
    }
    if (
      searchText &&
      !record.name.toLowerCase().includes(searchText) &&
      !record.file.toLowerCase().includes(searchText) &&
      !describeOrigin(record.origin)
        .toLowerCase()
        .includes(searchText)
    ) {
      return false;
    }
    return true;
  });
};

export type MemorySegment = {|
  record: ?ResourceLoadRecord,
  bytes: number,
  /** Share of the limit, between 0 and 1 (the sum can exceed 1). */
  share: number,
  isUnknown: boolean,
|};

export type MemorySegments = {|
  segments: Array<MemorySegment>,
  knownBytes: number,
  unknownResourcesCount: number,
  limitBytes: number,
  isOverLimit: boolean,
|};

/**
 * The share of a memory limit taken by each loaded resource, biggest first.
 * Resources loaded without a known size are counted in one "unknown" segment
 * of a nominal size, so that they stay visible.
 */
export const computeMemorySegments = (
  records: Array<ResourceLoadRecord>,
  limitBytes: number
): MemorySegments => {
  let knownBytes = 0;
  let unknownResourcesCount = 0;
  const knownRecords = [];
  for (const record of records) {
    if (record.status === 'not-loaded' || record.status === 'error') continue;
    if (
      record.estimatedMemoryBytes != null &&
      record.estimatedMemoryBytes > 0
    ) {
      knownBytes += record.estimatedMemoryBytes;
      knownRecords.push(record);
    } else {
      unknownResourcesCount++;
    }
  }
  const effectiveLimitBytes =
    limitBytes > 0 ? limitBytes : Math.max(knownBytes, 1);
  // Grouped by kind (the biggest kinds first), then by size inside a kind, so
  // that the bar reads as a few colored blocks.
  const bytesByKind: { [string]: number } = {};
  for (const record of knownRecords) {
    bytesByKind[record.kind] =
      (bytesByKind[record.kind] || 0) + (record.estimatedMemoryBytes || 0);
  }
  const segments: Array<MemorySegment> = knownRecords
    .sort(
      (a, b) =>
        bytesByKind[b.kind] - bytesByKind[a.kind] ||
        a.kind.localeCompare(b.kind) ||
        (b.estimatedMemoryBytes || 0) - (a.estimatedMemoryBytes || 0)
    )
    .map(record => ({
      record,
      bytes: record.estimatedMemoryBytes || 0,
      share: (record.estimatedMemoryBytes || 0) / effectiveLimitBytes,
      isUnknown: false,
    }));
  if (unknownResourcesCount > 0) {
    segments.push({
      record: null,
      bytes: 0,
      share: Math.min(0.03, 0.005 * unknownResourcesCount),
      isUnknown: true,
    });
  }
  return {
    segments,
    knownBytes,
    unknownResourcesCount,
    limitBytes: effectiveLimitBytes,
    isOverLimit: knownBytes > effectiveLimitBytes,
  };
};

/** The loaded bytes of each kind, biggest first, for the legend of the bar. */
export const getMemoryBytesByKind = (
  segments: Array<MemorySegment>
): Array<{| kind: string, bytes: number, count: number |}> => {
  const byKind: {
    [string]: {| kind: string, bytes: number, count: number |},
  } = {};
  for (const segment of segments) {
    if (!segment.record) continue;
    const kind = segment.record.kind;
    const entry = byKind[kind] || { kind, bytes: 0, count: 0 };
    entry.bytes += segment.bytes;
    entry.count++;
    byKind[kind] = entry;
  }
  return Object.keys(byKind)
    .map(kind => byKind[kind])
    .sort((a, b) => b.bytes - a.bytes);
};

/** The memory limit used by the bar: the artificial one, or what the device reports. */
export const getMemoryLimitBytes = (
  state: ?ResourcesDebugState,
  artificialLimitMegabytes: ?number
): number => {
  if (artificialLimitMegabytes != null && artificialLimitMegabytes > 0) {
    return artificialLimitMegabytes * 1024 * 1024;
  }
  if (!state) return 0;
  if (state.device.deviceMemoryBytes) return state.device.deviceMemoryBytes;
  if (state.device.jsHeapSizeLimit) return state.device.jsHeapSizeLimit;
  return 0;
};
