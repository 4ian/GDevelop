// @flow
import * as React from 'react';
import uniqueId from 'lodash/uniqueId';

type ProjectCallbacks = {| [callbackId: string]: () => any |};

const callbacksPerProject: {|
  [projectPtr: string]: ProjectCallbacks,
|} = {};

const getProjectCallbacks = (project: gdProject): ?ProjectCallbacks => {
  return callbacksPerProject[project.ptr.toString()];
};
const getOrCreateProjectCallbacks = (project: gdProject): ProjectCallbacks => {
  if (callbacksPerProject.hasOwnProperty(project.ptr.toString())) {
    return callbacksPerProject[project.ptr.toString()];
  }
  callbacksPerProject[project.ptr.toString()] = {};
  return callbacksPerProject[project.ptr.toString()];
};

type Props = {| project: gdProject |};

/**
 * Hook used to synchronize different components displaying a project's resources.
 */
const useResourcesChangedWatcher = ({ project }: Props) => {
  const registerOnResourcesChangedCallback = React.useCallback(
    (callback: () => any) => {
      const projectCallbacks = getOrCreateProjectCallbacks(project);
      const callbackId = uniqueId();
      projectCallbacks[callbackId] = callback;
      return callbackId;
    },
    [project]
  );

  const unregisterOnResourcesChangedCallback = React.useCallback(
    (callbackId: string) => {
      const projectCallbacks = getProjectCallbacks(project);
      if (!projectCallbacks) return;
      delete projectCallbacks[callbackId];
    },
    [project]
  );

  const onResourcesChanged = React.useCallback(
    () => {
      const projectCallbacks = getProjectCallbacks(project);
      if (!projectCallbacks) return;
      Object.keys(projectCallbacks).forEach(callbackId => {
        try {
          projectCallbacks[callbackId]();
        } catch (error) {}
      });
    },
    [project]
  );
  return {
    registerOnResourcesChangedCallback,
    unregisterOnResourcesChangedCallback,
    onResourcesChanged,
  };
};

export default useResourcesChangedWatcher;
