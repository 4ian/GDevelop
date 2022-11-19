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
  return (
    <LineStackLayout noMargin expand alignItems="flex-end">
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
      <ResourceThumbnail
        resourceName={resourceName}
        resourcesLoader={ResourcesLoader}
        project={project}
      />
    </LineStackLayout>
  );
};

export default ResourceSelectorWithThumbnail;
