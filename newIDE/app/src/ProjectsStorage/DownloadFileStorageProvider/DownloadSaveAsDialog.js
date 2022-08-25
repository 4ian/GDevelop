// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import { Column } from '../../UI/Grid';
import { ColumnStackLayout } from '../../UI/Layout';
import Window from '../../Utils/Window';
import { serializeToJSObject } from '../../Utils/Serializer';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import Text from '../../UI/Text';

type Props = {|
  project: gdProject,
  onDone: () => void,
|};

export default class DownloadSaveAsDialog extends React.Component<Props> {
  _download = () => {
    let content = '';
    try {
      content = JSON.stringify(serializeToJSObject(this.props.project));
    } catch (rawError) {
      showErrorBox({
        message: 'Unable to save your project',
        rawError,
        errorId: 'download-as-json-error',
      });
      return;
    }
    var uri = encodeURI('data:application/json;charset=utf-8,' + content);

    // TODO: Adapt to use "ResourceFetcher" to "upload resources to blobs"
    // and download an archive.

    var downloadLink = document.createElement('a');
    downloadLink.href = uri;
    downloadLink.download = 'game.json';

    const { body } = document;
    if (!body) return;

    body.appendChild(downloadLink);
    downloadLink.click();
    body.removeChild(downloadLink);
  };

  render() {
    const { onDone } = this.props;

    const actions = [
      <FlatButton
        key="download"
        label={<Trans>Download GDevelop desktop version</Trans>}
        primary={false}
        onClick={() => Window.openExternalURL('http://gdevelop.io')}
      />,
      <FlatButton
        key="close"
        label={<Trans>Close</Trans>}
        primary={false}
        onClick={onDone}
      />,
    ];

    return (
      <Dialog actions={actions} onRequestClose={onDone} open maxWidth="sm">
        <ColumnStackLayout>
          <Text>
            <Trans>
              You can download the file of your game to continue working on it
              using the full GDevelop version:
            </Trans>
          </Text>
          <Column noMargin expand>
            <RaisedButton
              label={<Trans>Download game file</Trans>}
              fullWidth
              primary
              onClick={this._download}
            />
          </Column>
        </ColumnStackLayout>
      </Dialog>
    );
  }
}
