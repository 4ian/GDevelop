// @flow
import * as React from 'react';
import paperDecorator from '../../PaperDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import ImageThumbnail from '../../../ResourcesList/ResourceThumbnail/ImageThumbnail';
import ResourcesLoader from '../../../ResourcesLoader';

export default {
  title: 'ResourcesList/ImageThumbnail',
  component: ImageThumbnail,
  decorators: [paperDecorator],
};

export const Default = () => (
  <ImageThumbnail
    project={testProject.project}
    resourceName="res/icon128.png"
    resourcesLoader={ResourcesLoader}
    size={100}
  />
);

export const Small = () => (
  <ImageThumbnail
    project={testProject.project}
    resourceName="res/icon128.png"
    resourcesLoader={ResourcesLoader}
    size={24}
  />
);

export const Selectable = () => (
  <ImageThumbnail
    selectable
    project={testProject.project}
    resourceName="res/icon128.png"
    resourcesLoader={ResourcesLoader}
    size={100}
  />
);
