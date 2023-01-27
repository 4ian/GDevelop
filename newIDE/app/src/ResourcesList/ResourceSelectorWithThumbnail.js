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
import { LineStackLayout } from '../UI/Layout';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';

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
  const windowWidth = useResponsiveWindowWidth();
  const itemsAlignment = windowWidth === 'small' ? 'center' : 'flex-end';
  return (
    <LineStackLayout noMargin expand alignItems={itemsAlignment}>
      <ResourceThumbnail
        resourceName={resourceName}
        resourcesLoader={ResourcesLoader}
        project={project}
      />
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
    </LineStackLayout>
  );
};

export default ResourceSelectorWithThumbnail;
