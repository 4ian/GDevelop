// @flow
import * as React from 'react';
import { type EnumeratedEffectMetadata } from './EnumerateEffects';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';

import CompactPropertiesEditor from '../CompactPropertiesEditor';

export const CompactEffectPropertiesEditor = ({
  project,
  effect,
  effectMetadata,
  resourceManagementProps,
}: {|
  project: gdProject,
  effect: gdEffect,
  effectMetadata: ?EnumeratedEffectMetadata,
  resourceManagementProps: ResourceManagementProps,
|}) => {
  if (!effectMetadata) return null;

  return (
    <CompactPropertiesEditor
      project={project}
      schema={effectMetadata.parametersSchema}
      instances={[effect]}
      resourceManagementProps={resourceManagementProps}
    />
  );
};
