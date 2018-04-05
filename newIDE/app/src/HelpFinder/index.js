// @flow
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Window from '../Utils/Window';
import DocSearchArea from './DocSearchArea';

type Props = {|
  open: boolean,
  onClose: () => void,
|};

type State = {|
  searchText: string,
|};

export default class HelpFinder extends React.Component<Props, State> {
  state = {
    searchText: '',
  };

  render() {
    const { open, onClose } = this.props;

    return (
      <Dialog
        title="Help!"
        onRequestClose={onClose}
        actions={[
          <FlatButton
            label="Close"
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
              Window.openExternalURL('http://forum.compilgames.net')
            }}
            label="Community forum"
          />,
          <FlatButton
            key="wiki"
            primary={false}
            onClick={() => {
              Window.openExternalURL(
                'http://wiki.compilgames.net/doku.php/gdevelop5/start'
              )
            }}
            label="Wiki"
          />,
        ]}
        open={open}
      >
        <DocSearchArea
          value={this.state.searchText}
          onChange={searchText =>
            this.setState({
              searchText,
            })}
        />
      </Dialog>
    );
  }
}
