// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import React, { Component } from 'react';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import { showErrorBox } from '../../../UI/Messages/MessageBox';
import { Column, Line } from '../../../UI/Grid';
import Text from '../../../UI/Text';
import { openPreviewWindow } from '.';

type Props = {|
  project: gdProject,
  url: string,
  onPreviewWindowOpened: any => void,
  onClose: () => void,
|};

export default class BrowserPreviewLinkDialog extends Component<Props> {
  _makeOnOpen = (i18n: I18nType) => () => {
    const { previewWindow, targetId } = openPreviewWindow(
      this.props.project,
      this.props.url,
      null // No existing target id: always open a new window.
    );
    if (!{ previewWindow, targetId }) {
      showErrorBox({
        message: i18n._(
          t`Unable to open the preview! Be sure that popup are allowed for this website.`
        ),
        rawError: undefined,
        errorId: 'preview-popup-disallowed',
      });
    } else {
      this.props.onPreviewWindowOpened({ previewWindow, targetId });
    }
    this.props.onClose();
  };

  render() {
    const { url } = this.props;
    if (!url) return null;

    return (
      <I18n>
        {({ i18n }) => (
          <Dialog
            title={<Trans>Preview</Trans>}
            actions={[
              <DialogPrimaryButton
                key="launch-preview"
                label={<Trans>Launch the preview</Trans>}
                primary
                onClick={this._makeOnOpen(i18n)}
              />,
            ]}
            onRequestClose={this.props.onClose}
            onApply={this._makeOnOpen(i18n)}
            open
          >
            <Line>
              <Column noMargin>
                <Text>
                  <Trans>
                    Your preview is ready! Click on the button to launch the
                    preview.
                  </Trans>
                </Text>
              </Column>
            </Line>
            <Line>
              <Column noMargin>
                <Text>
                  <Trans>
                    To skip this dialog and{' '}
                    <b>directly open the preview next time</b>, please allow
                    popups to be opened for this website in your browser.
                  </Trans>
                </Text>
              </Column>
            </Line>
          </Dialog>
        )}
      </I18n>
    );
  }
}
