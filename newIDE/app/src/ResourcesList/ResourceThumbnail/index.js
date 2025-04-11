// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import { type ResourceKind } from '../ResourceSource';
import ImageThumbnail from './ImageThumbnail';
import Model3DPreview from '../ResourcePreview/Model3DPreview';

type Props = {|
  project: gdProject,
  resourceName: string,
  resourcesLoader: typeof ResourcesLoader,
  resourceKind: ResourceKind,
  style?: Object,
  selectable?: boolean,
  selected?: boolean,
  onSelect?: boolean => void,
  onContextMenu?: (number, number) => void,
  size?: number,
|};

export const resourcesKindsWithThumbnail = ['image', 'model3D'];

/**
 * Display the right thumbnail for any given resource of a project
 */
const ResourceThumbnail = ({
  project,
  resourceName,
  resourcesLoader,
  resourceKind,
  style,
  selectable,
  selected,
  onSelect,
  onContextMenu,
  size,
}: Props) => {
  switch (resourceKind) {
    case 'image':
      return (
        <ImageThumbnail
          project={project}
          resourceName={resourceName}
          resourcesLoader={resourcesLoader}
          style={style}
          selectable={selectable}
          selected={selected}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
          size={size || 100}
        />
      );
    case 'model3D':
      return (
        <Model3DPreview
          modelUrl={ResourcesLoader.getResourceFullUrl(
            project,
            resourceName,
            {}
          )}
          size={size || 100}
        />
      );
    default:
      return null;
  }
};

export default ResourceThumbnail;
