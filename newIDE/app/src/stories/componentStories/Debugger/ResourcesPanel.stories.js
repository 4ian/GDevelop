// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import ResourcesPanel from '../../../Debugger/Resources';
import { ProfilerRecordingStore } from '../../../Debugger/ProfilerRecording/ProfilerRecordingStore';
import { makeFakeRecordingStore } from '../../../Debugger/ProfilerRecording/ProfilerRecordingFixtures';
import {
  type ResourceLoadRecord,
  type ResourceLoadStatus,
  type ResourcesDebugState,
} from '../../../Debugger/Resources/ResourcesDebugTypes';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';

export default {
  title: 'Debugger/ResourcesPanel',
  component: ResourcesPanel,
};

const makeRecord = (
  index: number,
  overrides: Partial<ResourceLoadRecord>
): ResourceLoadRecord => ({
  name: `resource${index}`,
  kind: 'image',
  file: `assets/resource${index}.png`,
  status: 'ready',
  attempts: 1,
  origin: { type: 'startup', sceneName: 'Menu' },
  requesters: [{ type: 'scene', sceneName: 'Menu', foreground: false }],
  loadStartedAtMs: 100 + index * 40,
  loadedAtMs: 100 + index * 40 + 60,
  readyAtMs: 100 + index * 40 + 90,
  unloadHistory: [],
  transferBytes: 20000 + index * 1000,
  decodedBytes: 25000 + index * 1000,
  estimatedMemoryBytes: (256 + index * 32) * (256 + index * 32) * 4,
  metrics: { width: 256 + index * 32, height: 256 + index * 32 },
  ...overrides,
});

const records: Array<ResourceLoadRecord> = [
  ...Array.from({ length: 30 }, (_, index) => makeRecord(index, {})),
  makeRecord(30, {
    name: 'music.mp3',
    kind: 'audio',
    file: 'assets/music.mp3',
    origin: { type: 'scene', sceneName: 'Game', foreground: false },
    requesters: [{ type: 'scene', sceneName: 'Game', foreground: false }],
    loadStartedAtMs: 3200,
    loadedAtMs: 3900,
    readyAtMs: 3900,
    estimatedMemoryBytes: 4500000,
    metrics: { durationInSeconds: 120 },
  }),
  makeRecord(31, {
    name: 'boss.glb',
    kind: 'model3D',
    file: 'assets/boss.glb',
    origin: { type: 'object', sceneName: 'Game', objectName: 'Boss' },
    requesters: [{ type: 'object', sceneName: 'Game', objectName: 'Boss' }],
    loadStartedAtMs: 6000,
    loadedAtMs: 6400,
    readyAtMs: 6700,
    transferBytes: null,
    decodedBytes: null,
    estimatedMemoryBytes: 12000000,
    metrics: null,
  }),
  makeRecord(32, {
    name: 'missing.png',
    status: 'error',
    errorMessage: 'HTTP 404: assets/missing.png',
    attempts: 3,
    loadedAtMs: undefined,
    readyAtMs: undefined,
    transferBytes: null,
    decodedBytes: null,
    estimatedMemoryBytes: null,
    metrics: null,
  }),
  makeRecord(33, {
    name: 'level2-tilemap.json',
    kind: 'tilemap',
    file: 'assets/level2.json',
    status: 'not-loaded',
    origin: null,
    requesters: [{ type: 'scene', sceneName: 'Level2', foreground: false }],
    loadStartedAtMs: undefined,
    loadedAtMs: undefined,
    readyAtMs: undefined,
    transferBytes: null,
    decodedBytes: null,
    estimatedMemoryBytes: null,
    metrics: null,
  }),
  makeRecord(34, {
    name: 'font.ttf',
    kind: 'font',
    file: 'assets/font.ttf',
    status: 'loading',
    loadStartedAtMs: 7500,
    loadedAtMs: undefined,
    readyAtMs: undefined,
    transferBytes: null,
    estimatedMemoryBytes: null,
    metrics: null,
  }),
];

const byStatus: { [ResourceLoadStatus]: number } = {};
const byKind: { [string]: number } = {};
for (const record of records) {
  byStatus[record.status] = (byStatus[record.status] || 0) + 1;
  byKind[record.kind] = (byKind[record.kind] || 0) + 1;
}

const resourcesDebugState: ResourcesDebugState = {
  generatedAtMs: 8000,
  currentSceneName: 'Game',
  sceneChanges: [
    { atMs: 200, sceneName: 'Menu' },
    { atMs: 3100, sceneName: 'Game' },
  ],
  device: {
    deviceMemoryBytes: 8 * 1024 * 1024 * 1024,
    jsHeapSizeLimit: 4 * 1024 * 1024 * 1024,
    usedJSHeapSize: 180 * 1024 * 1024,
  },
  totals: {
    byStatus,
    byKind,
    estimatedMemoryBytes: records.reduce(
      (total, record) => total + (record.estimatedMemoryBytes || 0),
      0
    ),
    transferBytes: records.reduce(
      (total, record) => total + (record.transferBytes || 0),
      0
    ),
  },
  resources: records,
};

const emptyStore = new ProfilerRecordingStore();
const recordingStore = makeFakeRecordingStore(3000);

const commonProps = {
  onRefresh: async () => action('refresh')(),
  debuggerId: '0',
  artificialLimitMegabytes: null,
  onChangeArtificialLimitMegabytes: action('change memory limit'),
};

export const WaitingForTheGame = (): React.Node => (
  <FixedHeightFlexContainer height={600}>
    <ResourcesPanel
      {...commonProps}
      resourcesDebugState={null}
      lastError={null}
      isPollingEnabled={true}
      recordingStore={emptyStore}
    />
  </FixedHeightFlexContainer>
);

export const WithResources = (): React.Node => (
  <FixedHeightFlexContainer height={600}>
    <ResourcesPanel
      {...commonProps}
      resourcesDebugState={resourcesDebugState}
      lastError={null}
      isPollingEnabled={false}
      recordingStore={emptyStore}
    />
  </FixedHeightFlexContainer>
);

export const WithResourcesAndAProfilerRecording = (): React.Node => (
  <FixedHeightFlexContainer height={600}>
    <ResourcesPanel
      {...commonProps}
      resourcesDebugState={resourcesDebugState}
      lastError={null}
      isPollingEnabled={false}
      recordingStore={recordingStore}
    />
  </FixedHeightFlexContainer>
);
