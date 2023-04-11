// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';

import ExtensionIssueReportDialog from '../../../../AssetStore/ExtensionStore/ExtensionIssueReportDialog';
import { fireBulletExtensionHeader } from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'AssetStore/ExtensionStore/ExtensionIssueReportDialog',
  component: ExtensionIssueReportDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <ExtensionIssueReportDialog
    extensionHeader={fireBulletExtensionHeader}
    isExtensionUpToDate={true}
    onClose={action('close')}
  />
);

export const OutOfDate = () => (
  <ExtensionIssueReportDialog
    extensionHeader={fireBulletExtensionHeader}
    isExtensionUpToDate={false}
    onClose={action('close')}
  />
);
