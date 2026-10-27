// @flow
import * as React from 'react';
import { isWebGL2Supported } from '../Utils/WebGL';

export type InGameEditorUnavailabilityReason =
  | 'webgl2-not-supported'
  | 'renderer-creation-failed';

// Reported by the in-game editor (the runtime) when it starts: the 3D
// renderer can fail to be created even if WebGL2 is supported (for example,
// with software rendering running out of resources).
let hasInGameEditorRendererCreationFailed = false;
let callbacks: Array<() => void> = [];

export const setInGameEditorRendererCreationFailed = (failed: boolean) => {
  if (hasInGameEditorRendererCreationFailed === failed) return;
  hasInGameEditorRendererCreationFailed = failed;
  callbacks.forEach(callback => callback());
};

const getUnavailabilityReason = (): InGameEditorUnavailabilityReason | null => {
  if (!isWebGL2Supported()) return 'webgl2-not-supported';
  if (hasInGameEditorRendererCreationFailed) return 'renderer-creation-failed';
  return null;
};

/**
 * Return why the 3D editor (the in-game editor) can't be used, if it can't.
 */
export const useInGameEditorUnavailabilityReason = (): InGameEditorUnavailabilityReason | null => {
  const [reason, setReason] = React.useState(getUnavailabilityReason);
  React.useEffect(() => {
    const callback = () => setReason(getUnavailabilityReason());
    callbacks.push(callback);
    callback(); // In case it changed before the effect ran.
    return () => {
      callbacks.splice(callbacks.indexOf(callback), 1);
    };
  }, []);
  return reason;
};
