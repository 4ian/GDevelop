// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import muiDecorator from '../../ThemeDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import ResourceSelector from '../../../ResourcesList/ResourceSelector';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';
import ResourcesLoader from '../../../ResourcesLoader';
import ResourceSelectorWithThumbnail from '../../../ResourcesList/ResourceSelectorWithThumbnail';

export default {
  title: 'ResourcesList/ResourceSelector',
  component: ResourceSelector,
  decorators: [paperDecorator, muiDecorator],
};

export const Image = () => (
  <ResourceSelector
    resourceKind="image"
    project={testProject.project}
    resourceSources={[]}
    onChooseResource={() => Promise.reject('Unimplemented')}
    resourceExternalEditors={fakeResourceExternalEditors}
    initialResourceName="icon128.png"
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);

export const NotExisting = () => (
  <ResourceSelector
    resourceKind="image"
    project={testProject.project}
    resourceSources={[]}
    onChooseResource={action('onChooseResource')}
    resourceExternalEditors={fakeResourceExternalEditors}
    initialResourceName="resource-that-does-not-exists-in-the-project"
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);

export const ImageNoMargin = () => (
  <ResourceSelector
    margin="none"
    resourceKind="image"
    project={testProject.project}
    resourceSources={[]}
    onChooseResource={() => Promise.reject('Unimplemented')}
    resourceExternalEditors={fakeResourceExternalEditors}
    initialResourceName="icon128.png"
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);

export const ImageWithThumbnail = () => (
  <ResourceSelectorWithThumbnail
    resourceKind="image"
    project={testProject.project}
    resourceSources={[]}
    onChooseResource={() => Promise.reject('Unimplemented')}
    resourceExternalEditors={fakeResourceExternalEditors}
    resourceName="icon128.png"
    onChange={action('on change')}
  />
);

export const Audio = () => (
  <ResourceSelector
    resourceKind="audio"
    project={testProject.project}
    resourceSources={[]}
    onChooseResource={() => Promise.reject('Unimplemented')}
    resourceExternalEditors={fakeResourceExternalEditors}
    initialResourceName="fake-audio1.mp3"
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);

export const FontWithResetButton = () => (
  <ResourceSelector
    canBeReset
    resourceKind="font"
    project={testProject.project}
    resourceSources={[]}
    onChooseResource={() => Promise.reject('Unimplemented')}
    resourceExternalEditors={fakeResourceExternalEditors}
    initialResourceName="font.otf"
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);

export const FontNoMarginWithResetButton = () => (
  <ResourceSelector
    canBeReset
    margin="none"
    resourceKind="font"
    project={testProject.project}
    resourceSources={[]}
    onChooseResource={() => Promise.reject('Unimplemented')}
    resourceExternalEditors={fakeResourceExternalEditors}
    initialResourceName="font.otf"
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);
