// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import {
  geometryMonsterExampleShortHeader,
  fireBulletExtensionShortHeader,
  flashExtensionShortHeader,
} from '../../../fixtures/GDevelopServicesTestData';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';
import {
  ExtensionsAccordion,
  ExamplesAccordion,
} from '../../../Profile/ContributionsDetails';

export default {
  title: 'Profile/ContributionsDetails',
};

const Default = (): React.Node => (
  <>
    <ExtensionsAccordion
      extensions={[fireBulletExtensionShortHeader, flashExtensionShortHeader]}
      extensionError={null}
    />
    <ExamplesAccordion
      examples={[geometryMonsterExampleShortHeader]}
      exampleError={null}
    />
  </>
);

export { Default as ____________________Default };
Default.storyName = 'default';

export const NoContributions = (): React.Node => (
  <>
    <ExtensionsAccordion extensions={[]} extensionError={null} />
    <ExamplesAccordion examples={[]} exampleError={null} />
  </>
);
NoContributions.storyName = 'no contributions';

export const WithErrors = (): React.Node => (
  <>
    <ExtensionsAccordion extensions={[]} extensionError={new Error()} />
    <ExamplesAccordion examples={[]} exampleError={new Error()} />
  </>
);
WithErrors.storyName = 'with errors';
