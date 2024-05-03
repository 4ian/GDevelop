// @flow
import * as React from 'react';
import paperDecorator from '../../PaperDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import ResourcesLoader from '../../../ResourcesLoader';
import ResourcePreview from '../../../ResourcesList/ResourcePreview';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';

export default {
  title: 'ResourcesList/ResourcePreview',
  component: ResourcePreview,
  decorators: [paperDecorator],
};

export const Image = () => (
  <FixedHeightFlexContainer height={300}>
    <ResourcePreview
      project={testProject.project}
      resourceName="icon128.png"
      resourcesLoader={ResourcesLoader}
    />
  </FixedHeightFlexContainer>
);

export const NotExisting = () => (
  <FixedHeightFlexContainer height={300}>
    <ResourcePreview
      project={testProject.project}
      resourceName="resource-that-does-not-exists-in-the-project"
      resourcesLoader={ResourcesLoader}
    />
  </FixedHeightFlexContainer>
);

export const Audio = () => (
  <FixedHeightFlexContainer height={300}>
    <ResourcePreview
      project={testProject.project}
      resourceName="fake-audio1.mp3"
      resourcesLoader={ResourcesLoader}
    />
  </FixedHeightFlexContainer>
);
