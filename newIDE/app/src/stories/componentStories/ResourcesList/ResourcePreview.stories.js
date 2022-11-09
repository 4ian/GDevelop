// @flow
import * as React from 'react';
import paperDecorator from '../../PaperDecorator';
import muiDecorator from '../../ThemeDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import ResourcesLoader from '../../../ResourcesLoader';
import ResourcePreview from '../../../ResourcesList/ResourcePreview';

export default {
  title: 'ResourcesList/ResourcePreview',
  component: ResourcePreview,
  decorators: [paperDecorator, muiDecorator],
};

export const Image = () => (
  <ResourcePreview
    project={testProject.project}
    resourceName="icon128.png"
    resourcesLoader={ResourcesLoader}
  />
);

export const NotExisting = () => (
  <ResourcePreview
    project={testProject.project}
    resourceName="resource-that-does-not-exists-in-the-project"
    resourcesLoader={ResourcesLoader}
  />
);

export const Audio = () => (
  <ResourcePreview
    project={testProject.project}
    resourceName="fake-audio1.mp3"
    resourcesLoader={ResourcesLoader}
  />
);
