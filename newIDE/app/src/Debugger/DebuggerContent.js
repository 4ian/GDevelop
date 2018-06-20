// @flow
import * as React from 'react';
import EditorMosaic, { MosaicWindow } from '../UI/EditorMosaic';
import Paper from 'material-ui/Paper';
import get from 'lodash/get';
import RaisedButton from 'material-ui/RaisedButton';
import { Column, Line } from '../UI/Grid';
import InspectorsList from './InspectorsList';
import {
  getInspectorDescriptions,
  type InspectorDescription,
  type EditFunction,
  type CallFunction,
} from './GDJSInspectorDescriptions';
import RawContentInspector from './Inspectors/RawContentInspector';
import EmptyMessage from '../UI/EmptyMessage';
import Checkbox from 'material-ui/Checkbox';
import Flash from 'material-ui/svg-icons/image/flash-on';
import FlashOff from 'material-ui/svg-icons/image/flash-off';
import HelpButton from '../UI/HelpButton';
import Profiler from './Profiler';
import { type ProfilerMeasuresSection } from '.';

type Props = {|
  gameData: ?any,
  onEdit: EditFunction,
  onCall: CallFunction,
  onPlay: () => void,
  onPause: () => void,
  onRefresh: () => void,
  onStartProfiler: () => void,
  onStopProfiler: () => void,
  profilerMeasures: ?ProfilerMeasuresSection,
|};

type State = {|
  selectedInspector: ?InspectorDescription,
  selectedInspectorFullPath: Array<string>,
  rawMode: boolean,
|};

const styles = {
  container: { flex: 1, display: 'flex' },
};

/**
 * The debugger interface: show the list of inspectors for a game, along with the
 * currently selected inspector.
 */
export default class DebuggerContent extends React.Component<Props, State> {
  state = {
    selectedInspector: null,
    selectedInspectorFullPath: [],
    rawMode: false,
  };

  render() {
    const {
      gameData,
      onRefresh,
      onCall,
      onEdit,
      onStartProfiler,
      onStopProfiler,
      profilerMeasures,
    } = this.props;
    const {
      selectedInspector,
      selectedInspectorFullPath,
      rawMode,
    } = this.state;

    return (
      <EditorMosaic
        editors={{
          inspectors: (
            <MosaicWindow
              title="Inspectors"
              toolbarControls={[]}
              gameData={gameData}
            >
              <Paper style={styles.container}>
                <Column expand noMargin>
                  <Line justifyContent="center">
                    <RaisedButton label="Refresh" onClick={onRefresh} primary />
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
              </Paper>
            </MosaicWindow>
          ),
          'selected-inspector': (
            <Column expand noMargin>
              {' '}
              {selectedInspector ? (
                rawMode ? (
                  <RawContentInspector
                    gameData={get(gameData, selectedInspectorFullPath, null)}
                    onEdit={(path, newValue) =>
                      onEdit(selectedInspectorFullPath.concat(path), newValue)}
                  />
                ) : (
                  selectedInspector.renderInspector(
                    get(gameData, selectedInspectorFullPath, null),
                    {
                      onCall: (path, args) =>
                        onCall(selectedInspectorFullPath.concat(path), args),
                      onEdit: (path, newValue) =>
                        onEdit(
                          selectedInspectorFullPath.concat(path),
                          newValue
                        ),
                    }
                  ) || (
                    <EmptyMessage>
                      No inspector, choose another element in the list or toggle
                      the raw data view.
                    </EmptyMessage>
                  )
                )
              ) : (
                <EmptyMessage>
                  {gameData
                    ? 'Choose an element to inspect in the list'
                    : 'Pause the game (from the toolbar) or hit refresh (on the left) to inspect the game'}
                </EmptyMessage>
              )}
              <Column>
                <Line justifyContent="space-between" alignItems="center">
                  <HelpButton helpPagePath="/interface/debugger" />
                  <div>
                    <Checkbox
                      checkedIcon={<Flash />}
                      uncheckedIcon={<FlashOff />}
                      checked={rawMode}
                      onCheck={(e, enabled) =>
                        this.setState({
                          rawMode: enabled,
                        })}
                    />
                  </div>
                </Line>
              </Column>
            </Column>
          ),
          profiler: (
            <MosaicWindow
              title="Profiler"
              // Pass profilerMeasures to force MosaicWindow update when profilerMeasures is changed
              profilerMeasures={profilerMeasures}
            >
              <Profiler
                onStart={onStartProfiler}
                onStop={onStopProfiler}
                profilerMeasures={profilerMeasures}
              />
            </MosaicWindow>
          ),
        }}
        initialEditorNames={['inspectors', 'selected-inspector', 'profiler']}
        initialSplitPercentage={32}
      />
    );
  }
}
