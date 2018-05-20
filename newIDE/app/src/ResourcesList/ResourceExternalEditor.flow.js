// @flow
import {type ResourceKind} from './ResourceSource.flow';
import ResourcesLoader from '../ResourcesLoader';

export type ExternalEditorOpenOptions = {|
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  resourceNames: Array<string>,
  onChangesSaved: (
    Array<{ path: string, name: string, originalIndex: ?number }>
  ) => void,
  extraOptions: {
    name: string,
    isLooping: boolean,
    fps: number,
  },
|};

export type ResourceExternalEditor = {
  name: string,
  displayName: string,
  kind: ResourceKind,
  edit: (ExternalEditorOpenOptions) => void,
};