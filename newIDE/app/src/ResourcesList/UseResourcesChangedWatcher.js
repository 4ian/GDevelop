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
  const projectPtrAsString = project.ptr.toString();
  if (callbacksPerProject.hasOwnProperty(projectPtrAsString)) {
    return callbacksPerProject[projectPtrAsString];
  }
  callbacksPerProject[projectPtrAsString] = {};
  return callbacksPerProject[projectPtrAsString];
};

type Props = {| project: gdProject, callback: () => any |};

/**
 * Hook used to synchronize different components displaying a project's resources.
 */
const useResourcesChangedWatcher = ({ project, callback }: Props) => {
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

  const triggerResourcesHaveChanged = React.useCallback(
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

  React.useEffect(
    () => {
      const resourcesChangedCallbackId = registerOnResourcesChangedCallback(
        callback
      );
      return () => {
        unregisterOnResourcesChangedCallback(resourcesChangedCallbackId);
      };
    },
    // Subscribe to any resource change at startup (with clean up).
    [
      callback,
      registerOnResourcesChangedCallback,
      unregisterOnResourcesChangedCallback,
    ]
  );

  return {
    triggerResourcesHaveChanged,
  };
};

export default useResourcesChangedWatcher;
