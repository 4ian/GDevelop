// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import ScrollView from '../UI/ScrollView';
import { Tabs, Tab } from '../UI/Tabs';
import Tutorials from './Tutorials';
import { Column } from '../UI/Grid';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';

type State = {|
  currentTab: 'starters' | 'examples' | 'tutorials' | 'video-tutorials',
  outputPath: string,
|};

export type CreateProjectDialogWithComponentsProps = {|
  open: boolean,
  onClose: () => void,
  onOpen: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => Promise<void>,
  onCreate: (
    gdProject,
    storageProvider: ?StorageProvider,
    fileMetadata: ?FileMetadata
  ) => Promise<void>,
|};

type Props = {|
  ...CreateProjectDialogWithComponentsProps,
  startersComponent: any,
  examplesComponent: any,
|};

export default class CreateProjectDialog extends React.Component<Props, State> {
  state = {
    currentTab: 'starters',
    outputPath: '',
  };

  _onChangeTab = (
    newTab: 'starters' | 'examples' | 'tutorials' | 'video-tutorials'
  ) => {
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
            key="close"
            label={<Trans>Close</Trans>}
            primary={false}
            onClick={onClose}
          />,
        ]}
        cannotBeDismissed={false}
        onRequestClose={onClose}
        open={open}
        noMargin
        flexBody
      >
        <Column expand noMargin>
          <Tabs value={this.state.currentTab} onChange={this._onChangeTab}>
            <Tab label={<Trans>Starters</Trans>} value="starters" />
            <Tab label={<Trans>Examples</Trans>} value="examples" />
            <Tab label={<Trans>Tutorials</Trans>} value="tutorials" />
          </Tabs>
          {this.state.currentTab === 'starters' && (
            <ScrollView>
              <StartersComponent
                onOpen={onOpen}
                onCreate={onCreate}
                onChangeOutputPath={outputPath => this.setState({ outputPath })}
                onShowExamples={this._showExamples}
                outputPath={this.state.outputPath}
              />
            </ScrollView>
          )}
          {this.state.currentTab === 'examples' && (
            <ScrollView>
              <ExamplesComponent
                onOpen={onOpen}
                onCreate={onCreate}
                onChangeOutputPath={outputPath => this.setState({ outputPath })}
                onExamplesLoaded={this._onExamplesLoaded}
                outputPath={this.state.outputPath}
              />
            </ScrollView>
          )}
          {this.state.currentTab === 'tutorials' && (
            <ScrollView>
              <Tutorials />
            </ScrollView>
          )}
        </Column>
      </Dialog>
    );
  }
}
