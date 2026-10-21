// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import paperDecorator from '../PaperDecorator';
import {
  release,
  releaseWithBreakingChange,
  releaseWithoutDescription,
} from '../../fixtures/GDevelopServicesTestData';
import ChangelogRenderer from '../../MainFrame/Changelog/ChangelogRenderer';
import ChangelogDialog from '../../MainFrame/Changelog/ChangelogDialog';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'Changelog',
  decorators: [paperDecorator],
};

export const NoBreakingChangesInThisVersionButInAPrevious = (): React.Node => (
  <ChangelogRenderer
    releases={[release, releaseWithBreakingChange]}
    error={null}
    currentReleaseName="5.0.0-beta62"
  />
);
NoBreakingChangesInThisVersionButInAPrevious.storyName =
  'no breaking changes in this version (but in a previous)';

export const BreakingChangesInThisVersion = (): React.Node => (
  <ChangelogRenderer
    releases={[releaseWithBreakingChange]}
    error={null}
    currentReleaseName="5.0.0-beta60"
  />
);
BreakingChangesInThisVersion.storyName = 'breaking changes in this version';

export const ReleaseWithoutADescription = (): React.Node => (
  <ChangelogRenderer
    releases={[releaseWithoutDescription]}
    error={null}
    currentReleaseName="5.0.0-beta60"
  />
);
ReleaseWithoutADescription.storyName = 'release without a description';

export const _Loading = (): React.Node => (
  <ChangelogRenderer
    releases={null}
    error={null}
    currentReleaseName="5.0.0-beta62"
  />
);
_Loading.storyName = 'loading';

export const WithError = (): React.Node => (
  <ChangelogRenderer
    releases={null}
    error={new Error('Fake error')}
    currentReleaseName="5.0.0-beta62"
  />
);
WithError.storyName = 'with error';

export const CompleteChangelogDialog = (): React.Node => (
  <ChangelogDialog open onClose={action('close dialog')} />
);
CompleteChangelogDialog.storyName = 'complete changelog dialog';
