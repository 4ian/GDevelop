// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import React, { Component } from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { Column, Line } from '../../UI/Grid';

type Props = {|
  url: ?string,
  onClose: () => void,
|};

export default class BrowserPreviewLinkDialog extends Component<Props> {
  _makeOnOpen = (i18n: I18nType) => () => {
    const windowObjectReference = window.open(this.props.url, '_blank');
    if (!windowObjectReference) {
      showErrorBox(
        i18n._(
          t`Unable to open the preview! Be sure that popup are allowed for this website.`
        ),
        undefined
      );
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
            actions={[
              <FlatButton
                key="launch-preview"
                label={<Trans>Launch the preview</Trans>}
                primary
                onClick={this._makeOnOpen(i18n)}
              />,
            ]}
            modal
            open
          >
            <Line>
              <Column>
                <Trans>
                  Your preview is ready! Click on the button to launch the
                  preview.
                </Trans>
              </Column>
            </Line>
            <Line>
              <Column>
                <span>
                  <Trans>
                    To skip this dialog and{' '}
                    <b>directly open the preview next time</b>, please allow
                    popups to be opened for this website in your browser.
                  </Trans>
                </span>
              </Column>
            </Line>
          </Dialog>
        )}
      </I18n>
    );
  }
}
