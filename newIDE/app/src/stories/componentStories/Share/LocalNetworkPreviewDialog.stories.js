// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import LocalNetworkPreviewDialog from '../../../ExportAndShare/LocalExporters/LocalPreviewLauncher/LocalNetworkPreviewDialog';

export default {
  title: 'Share/LocalNetworkPreviewDialog',
  component: LocalNetworkPreviewDialog,
  decorators: [paperDecorator],
};

// $FlowFixMe[signature-verification-failure]
export const Default = () => (
  <LocalNetworkPreviewDialog
    open
    url="192.168.0.1:2929"
    error={null}
    onRunPreviewLocally={action('on run preview locally')}
    onExport={action('on export')}
    onClose={action('on close')}
  />
);
// $FlowFixMe[signature-verification-failure]
export const WaitingForUrl = () => (
  <LocalNetworkPreviewDialog
    open
    url=""
    error={null}
    onRunPreviewLocally={action('on run preview locally')}
    onExport={action('on export')}
    onClose={action('on close')}
  />
);
// $FlowFixMe[signature-verification-failure]
export const Error = () => (
  <LocalNetworkPreviewDialog
    open
    url="192.168.0.1:2929"
    error={{ message: 'Oops' }}
    onRunPreviewLocally={action('on run preview locally')}
    onExport={action('on export')}
    onClose={action('on close')}
  />
);
