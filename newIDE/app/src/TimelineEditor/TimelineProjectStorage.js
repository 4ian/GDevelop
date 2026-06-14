// @flow

export const timelineExtensionName = 'TimelineSequencer';
export const timelinesPropertyName = 'timelines';

export type TimelinePoint = {|
  x: number,
  y: number,
  z?: number,
|};

export type TimelineCurveDefinition = any;

export type TimelineKeyframe = {|
  id: string,
  time: number,
  value: number | TimelinePoint,
  ease?: any,
  curve?: TimelineCurveDefinition,
|};

export type TimelinePropertyTrack = {|
  id: string,
  property: string,
  interpolationMode?: 'continuous' | 'step' | 'hold' | 'keyframe',
  initialValue?: number | TimelinePoint,
  initialEase?: any,
  initialCurve?: TimelineCurveDefinition,
  keyframes: Array<TimelineKeyframe>,
|};

export type TimelineTrack = {|
  id: string,
  type: 'object',
  target: {|
    mode: 'objectName' | 'sceneInstance' | 'runtimeBinding',
    objectName?: string,
    instancePersistentUuid?: string,
    selection?: 'first' | 'all',
    bindingName?: string,
  |},
  propertyTracks: Array<TimelinePropertyTrack>,
|};

export type TimelineMarker = {|
  id: string,
  name: string,
  time: number,
|};

export type TimelineData = {|
  id: string,
  name: string,
  duration: number,
  loop: boolean,
  speed: number,
  tracks: Array<TimelineTrack>,
  markers: Array<TimelineMarker>,
|};

export type TimelineProjectData = {|
  version: 1,
  timelines: Array<TimelineData>,
|};

const createId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const defaultTimelineProjectData = (): TimelineProjectData => ({
  version: 1,
  timelines: [],
});

const normalizeTimeline = (timeline: any): TimelineData => ({
  id:
    typeof timeline.id === 'string' && timeline.id
      ? timeline.id
      : createId('timeline'),
  name:
    typeof timeline.name === 'string' && timeline.name
      ? timeline.name
      : 'Timeline',
  duration:
    typeof timeline.duration === 'number' && timeline.duration > 0
      ? timeline.duration
      : 1,
  loop: !!timeline.loop,
  speed:
    typeof timeline.speed === 'number' && timeline.speed !== 0
      ? timeline.speed
      : 1,
  tracks: Array.isArray(timeline.tracks) ? timeline.tracks : [],
  markers: Array.isArray(timeline.markers) ? timeline.markers : [],
});

const normalizeProjectData = (data: any): TimelineProjectData => {
  const timelines = Array.isArray(data)
    ? data
    : data && Array.isArray(data.timelines)
    ? data.timelines
    : [];

  return {
    version: 1,
    timelines: timelines.map(normalizeTimeline),
  };
};

export const readTimelineProjectData = (
  project: gdProject
): TimelineProjectData => {
  const rawValue = project
    .getExtensionProperties()
    .getValue(timelineExtensionName, timelinesPropertyName);

  if (!rawValue) {
    return defaultTimelineProjectData();
  }

  try {
    return normalizeProjectData(JSON.parse(rawValue));
  } catch (error) {
    console.error('Unable to read TimelineSequencer project data:', error);
    return defaultTimelineProjectData();
  }
};

export const saveTimelineProjectData = (
  project: gdProject,
  data: TimelineProjectData
) => {
  project
    .getExtensionProperties()
    .setValue(
      timelineExtensionName,
      timelinesPropertyName,
      JSON.stringify(normalizeProjectData(data))
    );
};

export const getTimelines = (project: gdProject): Array<TimelineData> =>
  readTimelineProjectData(project).timelines;

export const saveTimelines = (
  project: gdProject,
  timelines: Array<TimelineData>
) => {
  saveTimelineProjectData(project, {
    version: 1,
    timelines,
  });
};

export const makeTimelineName = (
  project: gdProject,
  baseName: string = 'Timeline'
): string => {
  const usedNames = new Set(
    getTimelines(project).map(timeline => timeline.name)
  );
  if (!usedNames.has(baseName)) {
    return baseName;
  }

  let index = 2;
  while (usedNames.has(`${baseName} ${index}`)) {
    index++;
  }
  return `${baseName} ${index}`;
};

export const createDefaultTimeline = (name: string): TimelineData => {
  return {
    id: createId('timeline'),
    name,
    duration: 1,
    loop: false,
    speed: 1,
    tracks: [],
    markers: [],
  };
};

export const getTimelineByIdOrName = (
  project: gdProject,
  idOrName: string
): ?TimelineData =>
  getTimelines(project).find(
    timeline => timeline.id === idOrName || timeline.name === idOrName
  );

export const upsertTimeline = (project: gdProject, timeline: TimelineData) => {
  const timelines = getTimelines(project);
  const timelineIndexById = timelines.findIndex(
    existingTimeline => existingTimeline.id === timeline.id
  );
  const existingIndex =
    timelineIndexById !== -1
      ? timelineIndexById
      : timelines.findIndex(
          existingTimeline => existingTimeline.name === timeline.name
        );

  if (existingIndex === -1) {
    saveTimelines(project, [...timelines, timeline]);
    return;
  }

  const nextTimelines = timelines.slice();
  nextTimelines[existingIndex] = timeline;
  saveTimelines(project, nextTimelines);
};

export const renameTimeline = (
  project: gdProject,
  timelineId: string,
  newName: string
): ?TimelineData => {
  const cleanName = newName.trim();
  if (!cleanName) {
    return getTimelineByIdOrName(project, timelineId);
  }

  const timelines = getTimelines(project);
  const timelineIndex = timelines.findIndex(
    timeline => timeline.id === timelineId
  );
  if (timelineIndex === -1) {
    return null;
  }

  const isNameTaken = timelines.some(
    (timeline, index) => index !== timelineIndex && timeline.name === cleanName
  );
  if (isNameTaken) {
    return timelines[timelineIndex];
  }

  const nextTimeline = {
    ...timelines[timelineIndex],
    name: cleanName,
  };
  const nextTimelines = timelines.slice();
  nextTimelines[timelineIndex] = nextTimeline;
  saveTimelines(project, nextTimelines);
  return nextTimeline;
};

export const deleteTimeline = (project: gdProject, timelineId: string) => {
  saveTimelines(
    project,
    getTimelines(project).filter(timeline => timeline.id !== timelineId)
  );
};

export const duplicateTimeline = (
  project: gdProject,
  timelineId: string
): ?TimelineData => {
  const timeline = getTimelineByIdOrName(project, timelineId);
  if (!timeline) {
    return null;
  }

  const duplicate = {
    ...timeline,
    id: createId('timeline'),
    name: makeTimelineName(project, `${timeline.name} copy`),
  };
  saveTimelines(project, [...getTimelines(project), duplicate]);
  return duplicate;
};

export const moveTimeline = (
  project: gdProject,
  timelineId: string,
  destinationIndex: number
) => {
  const timelines = getTimelines(project);
  const originIndex = timelines.findIndex(
    timeline => timeline.id === timelineId
  );
  if (originIndex === -1 || originIndex === destinationIndex) {
    return;
  }

  const nextTimelines = timelines.slice();
  const [timeline] = nextTimelines.splice(originIndex, 1);
  nextTimelines.splice(
    Math.max(0, Math.min(destinationIndex, nextTimelines.length)),
    0,
    timeline
  );
  saveTimelines(project, nextTimelines);
};
