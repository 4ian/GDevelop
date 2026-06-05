// @flow
import { serializeToJSObject } from '../Utils/Serializer';

const gd: libGDevelop = global.gd;

// In-memory project snapshots for a coarse transaction/rollback (#10). A build
// can snapshot before a multi-step edit and restore on failure. Session-scoped
// (lost on reload); each snapshot stores the full serialized project JSON.
const projectSnapshots: {
  [string]: { json: string, createdLabel: string },
} = {};
let nextSnapshotId = 1;

export const snapshotProject = (project: gdProject, args: Object): Object => {
  const element = new gd.SerializerElement();
  project.serializeTo(element);
  const json = gd.Serializer.toJSON(element);
  element.delete();
  const label =
    getStringWithAliases(args || {}, ['label', 'name']) ||
    `snapshot-${nextSnapshotId}`;
  const id = `snapshot-${nextSnapshotId++}`;
  projectSnapshots[id] = { json, createdLabel: label };
  return {
    success: true,
    snapshotId: id,
    label,
    bytes: json.length,
    note:
      'Project snapshotted in memory. Restore with restore_project_snapshot { snapshot_id } if a later step fails. Snapshots are session-scoped (lost on reload) and are NOT a disk save — use gdevelop_save_project_and_wait to persist.',
  };
};

export const restoreProjectSnapshot = (
  project: gdProject,
  args: Object
): Object => {
  const id = getStringWithAliases(args || {}, ['snapshot_id', 'snapshotId']);
  if (!id || !projectSnapshots[id]) {
    throw new Error(
      `Unknown snapshot_id "${id || ''}". Available: ${Object.keys(
        projectSnapshots
      ).join(', ') || '(none)'}.`
    );
  }
  const { json, createdLabel } = projectSnapshots[id];
  const element = gd.Serializer.fromJSON(json);
  project.unserializeFrom(element);
  element.delete();
  return {
    success: true,
    snapshotId: id,
    label: createdLabel,
    note:
      'Project restored in memory from the snapshot. Open scene editors may hold stale references — if the editor UI looks wrong, reopen the affected scene tab. Re-inspect with read_serialized_scene to confirm state. This did not touch disk.',
  };
};

const getStringWithAliases = (
  args: Object,
  names: Array<string>
): string | null => {
  for (const name of names) {
    const value = args && args[name];
    if (typeof value === 'string') return value;
  }
  return null;
};

const getBooleanWithAliases = (
  args: Object,
  names: Array<string>
): boolean | null => {
  for (const name of names) {
    const value = args && args[name];
    if (typeof value === 'boolean') return value;
  }
  return null;
};

const getNumberWithAliases = (
  args: Object,
  names: Array<string>
): number | null => {
  for (const name of names) {
    const value = args && args[name];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return null;
};

const summarizeProjectProperties = (project: gdProject): Object => ({
  name: project.getName(),
  firstLayout: project.getFirstLayout(),
  gameResolutionWidth: project.getGameResolutionWidth(),
  gameResolutionHeight: project.getGameResolutionHeight(),
  adaptGameResolutionAtRuntime: project.getAdaptGameResolutionAtRuntime(),
  minFPS: project.getMinimumFPS(),
  maxFPS: project.getMaximumFPS(),
  orientation: project.getOrientation(),
  scaleMode: project.getScaleMode(),
});

const setFirstLayoutValue = (
  project: gdProject,
  sceneName: string,
  changes: Array<Object>
) => {
  if (!project.hasLayoutNamed(sceneName)) {
    throw new Error(`Scene not found: "${sceneName}".`);
  }
  const previousValue = project.getFirstLayout();
  project.setFirstLayout(sceneName);
  changes.push({
    property: 'firstLayout',
    previousValue,
    newValue: sceneName,
  });
};

export const setFirstLayout = (project: gdProject, args: Object): Object => {
  const sceneName =
    getStringWithAliases(args || {}, ['scene_name', 'sceneName']) || '';
  if (!sceneName) {
    throw new Error('Missing scene_name.');
  }

  const changes = [];
  setFirstLayoutValue(project, sceneName, changes);

  return {
    success: true,
    changes,
    // Read back the in-memory value so the caller can confirm it stuck.
    verifiedFirstLayout: project.getFirstLayout(),
    note:
      'The startup scene is set on the in-memory project. Persist it with gdevelop_save_project_and_wait; if a later inspection shows firstLayout empty on disk, re-run this then save again.',
    project: summarizeProjectProperties(project),
  };
};

export const setProjectProperties = (
  project: gdProject,
  args: Object
): Object => {
  const changes = [];

  const projectName = getStringWithAliases(args || {}, [
    'project_name',
    'projectName',
    'name',
  ]);
  if (projectName !== null) {
    const previousValue = project.getName();
    project.setName(projectName);
    changes.push({
      property: 'name',
      previousValue,
      newValue: projectName,
    });
  }

  const firstLayout = getStringWithAliases(args || {}, [
    'first_layout',
    'firstLayout',
    'scene_name',
    'sceneName',
  ]);
  if (firstLayout !== null) {
    setFirstLayoutValue(project, firstLayout, changes);
  }

  const resolutionWidth = getNumberWithAliases(args || {}, [
    'game_resolution_width',
    'gameResolutionWidth',
    'window_width',
    'windowWidth',
  ]);
  const resolutionHeight = getNumberWithAliases(args || {}, [
    'game_resolution_height',
    'gameResolutionHeight',
    'window_height',
    'windowHeight',
  ]);
  if (resolutionWidth !== null || resolutionHeight !== null) {
    const previousWidth = project.getGameResolutionWidth();
    const previousHeight = project.getGameResolutionHeight();
    const newWidth = resolutionWidth !== null ? resolutionWidth : previousWidth;
    const newHeight =
      resolutionHeight !== null ? resolutionHeight : previousHeight;
    project.setGameResolutionSize(newWidth, newHeight);
    changes.push({
      property: 'gameResolutionSize',
      previousValue: { width: previousWidth, height: previousHeight },
      newValue: { width: newWidth, height: newHeight },
    });
  }

  const adaptGameResolutionAtRuntime = getBooleanWithAliases(args || {}, [
    'adapt_game_resolution_at_runtime',
    'adaptGameResolutionAtRuntime',
  ]);
  if (adaptGameResolutionAtRuntime !== null) {
    const previousValue = project.getAdaptGameResolutionAtRuntime();
    project.setAdaptGameResolutionAtRuntime(adaptGameResolutionAtRuntime);
    changes.push({
      property: 'adaptGameResolutionAtRuntime',
      previousValue,
      newValue: adaptGameResolutionAtRuntime,
    });
  }

  const minFPS = getNumberWithAliases(args || {}, ['min_fps', 'minFPS']);
  if (minFPS !== null) {
    const previousValue = project.getMinimumFPS();
    project.setMinimumFPS(minFPS);
    changes.push({
      property: 'minFPS',
      previousValue,
      newValue: minFPS,
    });
  }

  const maxFPS = getNumberWithAliases(args || {}, ['max_fps', 'maxFPS']);
  if (maxFPS !== null) {
    const previousValue = project.getMaximumFPS();
    project.setMaximumFPS(maxFPS);
    changes.push({
      property: 'maxFPS',
      previousValue,
      newValue: maxFPS,
    });
  }

  const orientation = getStringWithAliases(args || {}, ['orientation']);
  if (orientation !== null) {
    const previousValue = project.getOrientation();
    project.setOrientation(orientation);
    changes.push({
      property: 'orientation',
      previousValue,
      newValue: orientation,
    });
  }

  const scaleMode = getStringWithAliases(args || {}, [
    'scale_mode',
    'scaleMode',
  ]);
  if (scaleMode !== null) {
    const previousValue = project.getScaleMode();
    project.setScaleMode(scaleMode);
    changes.push({
      property: 'scaleMode',
      previousValue,
      newValue: scaleMode,
    });
  }

  if (!changes.length) {
    throw new Error('No supported project properties were provided.');
  }

  return {
    success: true,
    changes,
    project: summarizeProjectProperties(project),
    serializedProject:
      args && args.include_serialized_project
        ? serializeToJSObject(project)
        : undefined,
  };
};
