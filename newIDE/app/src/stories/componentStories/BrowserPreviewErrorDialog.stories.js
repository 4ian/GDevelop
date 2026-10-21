// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import paperDecorator from '../PaperDecorator';
import BrowserPreviewErrorDialog from '../../ExportAndShare/BrowserExporters/BrowserPreview/BrowserPreviewErrorDialog';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'BrowserPreviewErrorDialog',
  decorators: [paperDecorator],
};

export const GenericError = (): React.Node => (
  <BrowserPreviewErrorDialog
    error={new Error('fake error')}
    onClose={action('on close')}
  />
);
GenericError.storyName = 'generic error';

export const NetworkingError = (): React.Node => (
  <BrowserPreviewErrorDialog
    error={
      // $FlowFixMe[incompatible-type] - mocking an Error with "code field"
      {
        code: 'NetworkingError',
        message: "Oops, you're offline",
      }
    }
    onClose={action('on close')}
  />
);
NetworkingError.storyName = 'networking error';
