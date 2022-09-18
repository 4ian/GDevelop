// @flow
import * as React from 'react';
import ResourcesLoader from '../ResourcesLoader';
import ResourceSelector from './ResourceSelector';
import {
  type ResourceManagementProps,
  type ResourceKind,
} from './ResourceSource';
import ResourceThumbnail from './ResourceThumbnail';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  resourceKind: ResourceKind,
  resourceName: string,
  onChange: string => void,
  floatingLabelText?: React.Node,
  hintText?: MessageDescriptor,
  helperMarkdownText?: ?string,
|};

const styles = {
  container: { flex: 1, display: 'flex', alignItems: 'flex-end' },
  selectorContainer: { flex: 1 },
  resourceThumbnail: { marginLeft: 10, marginBottom: 4 },
};

const ResourceSelectorWithThumbnail = ({
  project,
  resourceManagementProps,
  resourceKind,
  resourceName,
  onChange,
  floatingLabelText,
  hintText,
  helperMarkdownText,
}: Props) => {
  return (
    <div style={styles.container}>
      <div style={styles.selectorContainer}>
        <ResourceSelector
          project={project}
          resourceManagementProps={resourceManagementProps}
          resourcesLoader={ResourcesLoader}
          resourceKind={resourceKind}
          fullWidth
          initialResourceName={resourceName}
          onChange={onChange}
          floatingLabelText={floatingLabelText}
          hintText={hintText}
          helperMarkdownText={helperMarkdownText}
        />
      </div>
      <ResourceThumbnail
        resourceName={resourceName}
        resourcesLoader={ResourcesLoader}
        project={project}
        style={styles.resourceThumbnail}
      />
    </div>
  );
};

export default ResourceSelectorWithThumbnail;
