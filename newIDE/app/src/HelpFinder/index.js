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

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps(newProps: Props) {
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
                'https://wiki.gdevelop.io/gdevelop5/start'
              );
            }}
            label={<Trans>Browse the documentation</Trans>}
          />,
        ]}
        onRequestClose={onClose}
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
