// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Window from '../Utils/Window';
import DocSearchArea from './DocSearchArea';
import debounce from 'lodash/debounce';
import {
  sendHelpFinderOpened,
  sendHelpSearch,
} from '../Utils/Analytics/EventSender';

type Props = {|
  open: boolean,
  onClose: () => void,
|};

type State = {|
  searchText: string,
|};

export default class HelpFinder extends React.PureComponent<Props, State> {
  state = {
    searchText: '',
  };

  componentWillReceiveProps(newProps: Props) {
    if (newProps.open && !this.props.open) {
      sendHelpFinderOpened();
    }
  }

  _handleSearchTextChange = (searchText: string) => {
    this.setState({
      searchText,
    });
    this._sendHelpSearch();
  };

  _sendHelpSearch = debounce(() => {
    if (this.state.searchText) sendHelpSearch(this.state.searchText.trim());
  }, 2900);

  render() {
    const { open, onClose } = this.props;

    return (
      <Dialog
        title={<Trans>Help!</Trans>}
        onRequestClose={onClose}
        actions={[
          <FlatButton
            label={<Trans>Close</Trans>}
            key="close"
            primary={false}
            onClick={onClose}
          />,
        ]}
        secondaryActions={[
          <FlatButton
            key="forum"
            primary={false}
            onClick={() => {
              Window.openExternalURL('https://forum.gdevelop-app.com');
            }}
            label={<Trans>Community forum</Trans>}
          />,
          <FlatButton
            key="wiki"
            primary={false}
            onClick={() => {
              Window.openExternalURL(
                'http://wiki.gdevelop.io/gdevelop5/start'
              );
            }}
            label={<Trans>Browse the documentation</Trans>}
          />,
        ]}
        cannotBeDismissed={false}
        open={open}
      >
        <DocSearchArea
          value={this.state.searchText}
          onChange={this._handleSearchTextChange}
        />
      </Dialog>
    );
  }
}
