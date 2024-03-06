// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import EditorMosaic, { type EditorMosaicInterface } from '../UI/EditorMosaic';
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
import { DebuggerConsole, type LogsManager } from './DebuggerConsole';
import { type ProfilerOutput } from '.';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import MiniToolbar from '../UI/MiniToolbar';
import ScrollView from '../UI/ScrollView';

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
  logsManager: LogsManager,
  onOpenedEditorsChanged: () => void,
|};

type State = {|
  selectedInspector: ?InspectorDescription,
  selectedInspectorFullPath: Array<string>,
  rawMode: boolean,
|};

const initialMosaicEditorNodes = {
  direction: 'column',
  first: {
    direction: 'row',
    first: 'inspectors',
    second: 'selected-inspector',
    splitPercentage: 25,
  },
  second: {
    direction: 'row',
    first: 'profiler',
    second: 'console',
    splitPercentage: 25,
  },
  splitPercentage: 65,
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

  _editors: ?EditorMosaicInterface = null;

  isProfilerShown = () => {
    return (
      !!this._editors &&
      this._editors.getOpenedEditorNames().includes('profiler')
    );
  };

  isConsoleShown = () => {
    return (
      !!this._editors &&
      this._editors.getOpenedEditorNames().includes('console')
    );
  };

  toggleProfiler = () => {
    if (this._editors) this._editors.toggleEditor('profiler', 'end', 75, 'row');
  };

  toggleConsole = () => {
    if (this._editors) this._editors.toggleEditor('console', 'end', 75, 'row');
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
      logsManager,
      onOpenedEditorsChanged,
    } = this.props;
    const {
      selectedInspector,
      selectedInspectorFullPath,
      rawMode,
    } = this.state;

    const editors = {
      inspectors: {
        type: 'primary',
        title: t`Inspectors`,
        toolbarControls: [],
        renderEditor: () => (
          <Background>
            <Column expand noMargin useFullHeight>
              <Line justifyContent="center">
                <RaisedButton
                  label={<Trans>Refresh</Trans>}
                  onClick={onRefresh}
                  primary
                />
              </Line>
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
            </Column>
          </Background>
        ),
      },
      'selected-inspector': {
        type: 'primary',
        noTitleBar: true,
        renderEditor: () => (
          <Background>
            <ScrollView>
              <Column>
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
              </Column>
            </ScrollView>
            <MiniToolbar>
              <Line justifyContent="space-between" alignItems="center" noMargin>
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
            </MiniToolbar>
          </Background>
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
      console: {
        type: 'secondary',
        title: t`Console`,
        renderEditor: () => (
          <Background>
            <DebuggerConsole logsManager={logsManager || []} />
          </Background>
        ),
      },
    };

    return (
      <PreferencesContext.Consumer>
        {({ getDefaultEditorMosaicNode, setDefaultEditorMosaicNode }) => (
          <EditorMosaic
            ref={editors => (this._editors = editors)}
            editors={editors}
            initialNodes={
              getDefaultEditorMosaicNode('debugger') || initialMosaicEditorNodes
            }
            onPersistNodes={node =>
              setDefaultEditorMosaicNode('debugger', node)
            }
            onOpenedEditorsChanged={onOpenedEditorsChanged}
          />
        )}
      </PreferencesContext.Consumer>
    );
  }
}
