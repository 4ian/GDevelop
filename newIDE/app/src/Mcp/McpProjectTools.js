// @flow
import { serializeToJSObject } from '../Utils/Serializer';

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
