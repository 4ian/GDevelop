// @flow
import * as React from 'react';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import EditorMosaic, { MosaicWindow } from '../UI/EditorMosaic';
import Paper from 'material-ui/Paper';
import get from 'lodash/get';
import RaisedButton from 'material-ui/RaisedButton';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import { Column, Line } from '../UI/Grid';
import InspectorsList from './InspectorsList';
import {
  getInspectorDescriptions,
  type InspectorDescription,
} from './GDJSInspectorDescriptions';
import EmptyMessage from '../UI/EmptyMessage';

type Props = {|
  debuggerServerError: ?any,
  debuggerServerStarted: boolean,
  debuggerConnectionOpen: boolean,
  gameData: ?any,
  onPlay: () => void,
  onPause: () => void,
|};

type State = {|
  selectedInspector: ?InspectorDescription,
  selectedInspectorFullPath: Array<string>,
|};

const styles = {
  container: { flex: 1, display: 'flex' },
  jsonContainer: { flex: 1, overflowY: 'scroll' },
};

export default class DebuggerContent extends React.Component<Props, State> {
  state = {
    selectedInspector: null,
    selectedInspectorFullPath: [],
  };

  _renderInspectors() {
    const { gameData, onPlay, onPause } = this.props;
    const { selectedInspector, selectedInspectorFullPath } = this.state;

    return (
      <EditorMosaic
        editors={{
          inspectors: (
            <MosaicWindow
              title="Inspectors"
              toolbarControls={[]}
              gameData={gameData}
            >
              <Column expand noMargin>
                <Line>
                  <RaisedButton label="Play" onClick={onPlay} primary />
                  <RaisedButton label="Pause" onClick={onPause} primary />
                </Line>
                <Line expand noMargin>
                  <InspectorsList
                    gameData={gameData}
                    getInspectorDescriptions={getInspectorDescriptions}
                    onChooseInspector={(
                      selectedInspector,
                      selectedInspectorFullPath
                    ) =>
                      this.setState({
                        selectedInspector,
                        selectedInspectorFullPath,
                      })}
                  />
                </Line>
              </Column>
            </MosaicWindow>
          ),
          'selected-inspector': selectedInspector ? (
            selectedInspector.renderInspector(
              get(gameData, selectedInspectorFullPath, null)
            ) || (
              <EmptyMessage>
                Looks like there is nothing to show :/
              </EmptyMessage>
            )
          ) : (
            <EmptyMessage>
              {!gameData
                ? 'Pause the game, with the buttons on the left, to inspect the game.'
                : 'Choose an element to inspect in the list'}
            </EmptyMessage>
          ),
        }}
        initialEditorNames={['inspectors', 'selected-inspector']}
      />
    );
  }

  render() {
    const {
      debuggerServerError,
      debuggerServerStarted,
      debuggerConnectionOpen,
    } = this.props;

    return (
      <Paper style={styles.container}>
        {!debuggerServerStarted &&
          !debuggerServerError && (
            <PlaceholderMessage>
              <PlaceholderLoader />
              <p>Debugger is starting...</p>
            </PlaceholderMessage>
          )}
        {!debuggerServerStarted &&
          debuggerServerError && (
            <PlaceholderMessage>
              <p>
                Unable to start the debugger server for the preview! Make sure
                that you are authorized to run servers on this computer.
              </p>
            </PlaceholderMessage>
          )}
        {debuggerServerStarted &&
          !debuggerConnectionOpen && (
            <PlaceholderMessage>
              <PlaceholderLoader />
              <p>Waiting for a game to start and connect to the debugger...</p>
            </PlaceholderMessage>
          )}
        {debuggerServerStarted &&
          debuggerConnectionOpen &&
          this._renderInspectors()}
      </Paper>
    );
  }
}
