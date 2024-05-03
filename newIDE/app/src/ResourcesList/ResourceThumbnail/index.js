// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import { type ResourceKind } from '../ResourceSource';
import ImageThumbnail from './ImageThumbnail';

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
|};

export const resourcesKindsWithThumbnail = ['image'];

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
        />
      );
    default:
      return null;
  }
};

export default ResourceThumbnail;
