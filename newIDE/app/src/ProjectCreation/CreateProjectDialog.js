// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Tabs, Tab } from 'material-ui/Tabs';
import Tutorials from './Tutorials';

type State = {|
  currentTab: 'starters' | 'examples' | 'tutorials',
|};

type Props = {|
  startersComponent: any,
  examplesComponent: any,
  open?: boolean,
  onClose?: () => void,
  onOpen?: (path: string) => void,
  onCreate?: (project: gdProject) => void,
|};

export default class CreateProjectDialog extends React.Component<Props, State> {
  state = {
    currentTab: 'starters',
  };

  _onChangeTab = (newTab: 'starters' | 'examples' | 'tutorials') => {
    this.setState({
      currentTab: newTab,
    });
  };

  _showExamples = () => this._onChangeTab('examples');

  _onExamplesLoaded = () => {
    // Force an update to ensure dialog is properly positioned.
    this.forceUpdate();
  };

  render() {
    const { open, onClose, onOpen, onCreate } = this.props;
    if (!open) return null;

    const ExamplesComponent = this.props.examplesComponent;
    const StartersComponent = this.props.startersComponent;

    return (
      <Dialog
        title={<Trans>Create a new game</Trans>}
        actions={[
          <FlatButton
            label={<Trans>Close</Trans>}
            primary={false}
            onClick={onClose}
          />,
        ]}
        onRequestClose={onClose}
        open={open}
        noMargin
        autoScrollBodyContent
      >
        <Tabs value={this.state.currentTab} onChange={this._onChangeTab}>
          <Tab label={<Trans>Starters</Trans>} value="starters">
            <StartersComponent
              onOpen={onOpen}
              onCreate={onCreate}
              onShowExamples={this._showExamples}
            />
          </Tab>
          <Tab label={<Trans>Examples</Trans>} value="examples">
            <ExamplesComponent
              onOpen={onOpen}
              onCreate={onCreate}
              onExamplesLoaded={this._onExamplesLoaded}
            />
          </Tab>
          <Tab label={<Trans>Tutorials</Trans>} value="tutorials">
            <Tutorials />
          </Tab>
        </Tabs>
      </Dialog>
    );
  }
}
