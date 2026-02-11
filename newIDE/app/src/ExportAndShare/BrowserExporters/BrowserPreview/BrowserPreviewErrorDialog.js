// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import React, { Component } from 'react';
import Dialog from '../../../UI/Dialog';
import FlatButton from '../../../UI/FlatButton';
import { Column, Line } from '../../../UI/Grid';
import Text from '../../../UI/Text';

type Props = {|
  error: Error,
  onClose: () => void,
|};

export default class BrowserPreviewErrorDialog extends Component<Props> {
  render(): any {
    const { error, onClose } = this.props;

    return (
      <I18n>
        {({ i18n }) => (
          <Dialog
            title={<Trans>Could not launch the preview</Trans>}
            actions={[
              <FlatButton
                key="close"
                label={<Trans>Close</Trans>}
                onClick={onClose}
              />,
            ]}
            onRequestClose={onClose}
            open
          >
            <Line>
              <Column noMargin>
                <Text>
                  {// $FlowFixMe[incompatible-type] - AWS returned errors can have extra fields
                  // $FlowFixMe[prop-missing]
                  error.code === 'NetworkingError' ? (
                    <Trans>
                      The preview could not be launched because you're offline.
                    </Trans>
                  ) : (
                    <Trans>
                      The preview could not be launched because an error
                      happened: {error.message}.
                    </Trans>
                  )}
                </Text>
              </Column>
            </Line>
            <Line>
              <Column noMargin>
                <Text>
                  <Trans>
                    Make sure you're online, have a proper internet connection
                    and try again. If you download and use GDevelop desktop
                    application, you can also run previews without any internet
                    connection.
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
