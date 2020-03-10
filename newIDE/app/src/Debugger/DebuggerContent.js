// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import EditorMosaic from '../UI/EditorMosaic';
import Background from '../UI/Background';
import get from 'lodash/get';
import RaisedButton from '../UI/RaisedButton';
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
import Checkbox from '../UI/Checkbox';
import Flash from '@material-ui/icons/FlashOn';
import FlashOff from '@material-ui/icons/FlashOff';
import HelpButton from '../UI/HelpButton';
import Profiler from './Profiler';
import { type ProfilerOutput } from '.';

type Props = {|
  gameData: ?any,
  onEdit: EditFunction,
  onCall: CallFunction,
  onPlay: () => void,
  onPause: () => void,
  onRefresh: () => void,
  onStartProfiler: () => void,
  onStopProfiler: () => void,
  profilerOutput: ?ProfilerOutput,
  profilingInProgress: boolean,
|};

type State = {|
  selectedInspector: ?InspectorDescription,
  selectedInspectorFullPath: Array<string>,
  rawMode: boolean,
|};

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

  _editors: ?EditorMosaic = null;

  openProfiler = () => {
    if (this._editors) this._editors.openEditor('profiler', 'end', 75);
  };

  render() {
    const {
      gameData,
      onRefresh,
      onCall,
      onEdit,
      onStartProfiler,
      onStopProfiler,
      profilerOutput,
      profilingInProgress,
    } = this.props;
    const {
      selectedInspector,
      selectedInspectorFullPath,
      rawMode,
    } = this.state;

    return (
      <EditorMosaic
        ref={editors => (this._editors = editors)}
        editors={{
          inspectors: {
            type: 'primary',
            title: t`Inspectors`,
            toolbarControls: [],
            renderEditor: () => (
              <Background>
                <Column expand noMargin>
                  <Line justifyContent="center">
                    <RaisedButton
                      label={<Trans>Refresh</Trans>}
                      onClick={onRefresh}
                      primary
                    />
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
                        })
                      }
                    />
                  </Line>
                </Column>
              </Background>
            ),
          },
          'selected-inspector': {
            type: 'primary',
            noTitleBar: true,
            renderEditor: () => (
              <Column expand noMargin>
                {selectedInspector ? (
                  rawMode ? (
                    <RawContentInspector
                      gameData={get(gameData, selectedInspectorFullPath, null)}
                      onEdit={(path, newValue) =>
                        onEdit(selectedInspectorFullPath.concat(path), newValue)
                      }
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
                        <Trans>
                          No inspector, choose another element in the list or
                          toggle the raw data view.
                        </Trans>
                      </EmptyMessage>
                    )
                  )
                ) : (
                  <EmptyMessage>
                    {gameData ? (
                      <Trans>Choose an element to inspect in the list</Trans>
                    ) : (
                      <Trans>
                        Pause the game (from the toolbar) or hit refresh (on the
                        left) to inspect the game
                      </Trans>
                    )}
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
                          })
                        }
                      />
                    </div>
                  </Line>
                </Column>
              </Column>
            ),
          },
          profiler: {
            type: 'secondary',
            title: t`Profiler`,
            renderEditor: () => (
              <Profiler
                onStart={onStartProfiler}
                onStop={onStopProfiler}
                profilerOutput={profilerOutput}
                profilingInProgress={profilingInProgress}
              />
            ),
          },
        }}
        initialNodes={{
          direction: 'column',
          first: {
            direction: 'row',
            first: 'inspectors',
            second: 'selected-inspector',
            splitPercentage: 25,
          },
          second: 'profiler',
          splitPercentage: 65,
        }}
      />
    );
  }
}
