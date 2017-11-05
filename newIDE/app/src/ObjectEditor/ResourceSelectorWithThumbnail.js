import React from 'react';
import ResourcesLoader from '../ObjectsRendering/ResourcesLoader';
import ResourceSelector from '../ResourcesEditor/ResourceSelector';
import ImageThumbnail from './ImageThumbnail';

export default ({
  project,
  resourceSources,
  onChooseResource,
  resourceKind,
  resourceName,
  onChange,
}) => {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ flex: 1 }}>
        <ResourceSelector
          project={project}
          resourceSources={resourceSources}
          onChooseResource={onChooseResource}
          resourceKind={resourceKind}
          fullWidth
          initialResourceName={resourceName}
          onChange={onChange}
        />
      </div>
      <ImageThumbnail
        resourceName={resourceName}
        resourcesLoader={ResourcesLoader}
        project={project}
        style={{ marginLeft: 10 }}
      />
    </div>
  );
};
