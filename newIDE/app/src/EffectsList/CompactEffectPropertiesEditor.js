// @flow
import * as React from 'react';
import { type EnumeratedEffectMetadata } from './EnumerateEffects';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';

import CompactPropertiesEditor from '../CompactPropertiesEditor';

const noRefreshOfAllFields = () => {
  console.warn(
    "An effect tried to refresh all fields, but the editor doesn't support it."
  );
};

export const CompactEffectPropertiesEditor = ({
  project,
  effect,
  effectMetadata,
  resourceManagementProps,
  onPropertyModified,
}: {|
  project: gdProject,
  effect: gdEffect,
  effectMetadata: ?EnumeratedEffectMetadata,
  resourceManagementProps: ResourceManagementProps,
  onPropertyModified: () => void,
|}) => {
  if (!effectMetadata) return null;

  return (
    <CompactPropertiesEditor
      project={project}
      schema={effectMetadata.parametersSchema}
      instances={[effect]}
      resourceManagementProps={resourceManagementProps}
      onRefreshAllFields={noRefreshOfAllFields}
      onInstancesModified={onPropertyModified}
    />
  );
};
