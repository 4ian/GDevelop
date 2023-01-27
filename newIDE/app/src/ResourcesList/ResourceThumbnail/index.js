// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import { type ResourceKind } from '../ResourceSource';
import ImageThumbnail from './ImageThumbnail';

type Props = {|
  project: gdProject,
  resourceName: string,
  resourcesLoader: typeof ResourcesLoader,
  style?: Object,
  selectable?: boolean,
  selected?: boolean,
  onSelect?: boolean => void,
  onContextMenu?: (number, number) => void,
|};

/**
 * Display the right thumbnail for any given resource of a project
 */
const ResourceThumbnail = ({
  project,
  resourceName,
  resourcesLoader,
  style,
  selectable,
  selected,
  onSelect,
  onContextMenu,
}: Props) => {
  const [resourceKind, setResourceKind] = React.useState<?ResourceKind>(null);

  React.useEffect(
    () => {
      const resourcesManager = project.getResourcesManager();
      const resourceKind = resourcesManager.hasResource(resourceName)
        ? resourcesManager.getResource(resourceName).getKind()
        : null;
      setResourceKind(resourceKind);
    },
    [project, resourceName]
  );

  switch (resourceKind) {
    case null: // If no resource loaded yet, use the image thumbnail checkered background.
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
