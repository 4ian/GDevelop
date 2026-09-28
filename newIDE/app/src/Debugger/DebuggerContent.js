// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import EditorMosaic, {
  isMosaicNodeUsable,
  type EditorMosaicInterface,
  type EditorMosaicNode,
} from '../UI/EditorMosaic';
import Background from '../UI/Background';
import RaisedButton from '../UI/RaisedButton';
import { Line } from '../UI/Grid';
import InspectorsList from './InspectorsList';
import {
  getInspectorDescriptions,
  type InspectorDescription,
  type EditFunction,
  type CallFunction,
  type ReadValuesFunction,
} from './GDJSInspectorDescriptions';
import InspectedValue from './Inspectors/InspectedValue';
import EmptyMessage from '../UI/EmptyMessage';
import AlertMessage from '../UI/AlertMessage';
import Checkbox from '../UI/Checkbox';
import Flash from '@material-ui/icons/FlashOn';
import FlashOff from '@material-ui/icons/FlashOff';
import HelpButton from '../UI/HelpButton';
import Profiler from './Profiler';
import Performance from './Performance';
import ResourcesPanel from './Resources';
import {
  getMemoryLimitBytes,
  type ResourcesDebugState,
} from './Resources/ResourcesDebugTypes';
import { DebuggerConsole, type LogsManager } from './DebuggerConsole';
import { type ResourcesDebugSnapshot } from '.';
import {
  ProfilerRecordingStore,
  type ProfilerRecording,
} from './ProfilerRecording/ProfilerRecordingStore';
import { type DebuggerId } from '../ExportAndShare/PreviewLauncher.flow';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import MiniToolbar from '../UI/MiniToolbar';
import classes from './DebuggerContent.module.css';
import { DEBUGGER_PANELS, type DebuggerPanelName } from './DebuggerPanels';
import { DEFAULT_INSPECTOR_LIST_SPLIT_PERCENTAGE } from './DebuggerConstants';

type Props = {|
  gameData: ?any,
  /** The game was too large to be sent whole: parts of it are missing. */
  isGameDataTruncated: boolean,
  onEdit: EditFunction,
  onCall: CallFunction,
  onPlay: () => void,
  onPause: () => void,
  onRefresh: () => void,
  /** Read what is at this path in the running game, for the live inspector. */
  onInspectPath: (path: Array<string>) => Promise<Object | null>,
  profilingInProgress: boolean,
  /** The recording every panel compares this one to, if one was pinned. */
  baselineRecording: ?ProfilerRecording,
  baselineResourcesDebugState: ?ResourcesDebugState,
  canRecord: boolean,
  onStartRecording: () => void,
  profilerRecordingStore: ProfilerRecordingStore,
  debuggerId: DebuggerId,
  resourcesDebugSnapshot: ?ResourcesDebugSnapshot,
  onRequestResourcesDebugState: () => Promise<void>,
  /** Call functions on what is at this path in the running game (the expressions of behaviors). */
  onReadValues: ReadValuesFunction,
  isDebuggerConnected: boolean,
  isDebuggerPaused: boolean,
  logsManager: LogsManager,
  onOpenedEditorsChanged: () => void,
|};

type State = {|
  selectedInspector: ?InspectorDescription,
  selectedInspectorFullPath: Array<string>,
  rawMode: boolean,
  /** The artificial memory limit set in the resources panel (MB). */
  memoryLimitMegabytes: ?number,
|};

const initialMosaicEditorNodes: EditorMosaicNode = {
  direction: 'column',
  first: {
    direction: 'row',
    first: 'inspector',
    second: 'overview',
    splitPercentage: 75,
  },
  second: {
    direction: 'row',
    first: 'profiler',
    second: 'console',
    splitPercentage: 50,
  },
  splitPercentage: 55,
};

/**
 * The inspector is a mosaic of its own: the list of the scene content and the
 * inspected element, resized with the same splitter as the panels, and whose
 * proportions are kept in the preferences.
 */
const initialInspectorMosaicNodes: EditorMosaicNode = {
  direction: 'row',
  first: 'inspector-list',
  second: 'inspector-details',
  splitPercentage: DEFAULT_INSPECTOR_LIST_SPLIT_PERCENTAGE,
};

/**
 * The debugger interface: show the list of inspectors for a game, along with the
 * currently selected inspector.
 */
export default class DebuggerContent extends React.Component<Props, State> {
  state: State = {
    selectedInspector: null,
    selectedInspectorFullPath: [],
    rawMode: false,
    memoryLimitMegabytes: null,
  };

  _editors: ?EditorMosaicInterface = null;

  /**
   * The central node of the mosaic ("overview") only shows a hint when no
   * panel is opened: as soon as one is, it is hidden so that the panels take
   * the whole room.
   */
  _updateOverviewVisibility = () => {
    const editors = this._editors;
    if (!editors) return;
    const openedEditorNames = editors.getOpenedEditorNames();
    const isOverviewShown = openedEditorNames.includes('overview');
    const hasOtherPanels = openedEditorNames.some(name => name !== 'overview');
    if (hasOtherPanels && isOverviewShown) {
      editors.toggleEditor('overview', 'left');
    } else if (!hasOtherPanels && !isOverviewShown) {
      editors.toggleEditor('overview', 'left');
    }
  };

  _onOpenedEditorsChanged = () => {
    this._updateOverviewVisibility();
    this.props.onOpenedEditorsChanged();
  };

  componentDidMount() {
    this._updateOverviewVisibility();
  }

  isPanelShown = (panelName: DebuggerPanelName): boolean =>
    !!this._editors && this._editors.getOpenedEditorNames().includes(panelName);

  togglePanel = (panelName: DebuggerPanelName) => {
    const panel = DEBUGGER_PANELS.find(({ name }) => name === panelName);
    if (this._editors && panel)
      this._editors.toggleEditor(panel.name, panel.position);
  };

  render(): any {
    const {
      gameData,
      isGameDataTruncated,
      onRefresh,
      onCall,
      onEdit,
      profilingInProgress,
      baselineRecording,
      baselineResourcesDebugState,
      canRecord,
      onStartRecording,
      profilerRecordingStore,
      debuggerId,
      resourcesDebugSnapshot,
      onInspectPath,
      onReadValues,
      onRequestResourcesDebugState,
      isDebuggerConnected,
      isDebuggerPaused,
      logsManager,
    } = this.props;
    const {
      selectedInspector,
      selectedInspectorFullPath,
      rawMode,
      memoryLimitMegabytes,
    } = this.state;
    const memoryLimitBytes = getMemoryLimitBytes(
      resourcesDebugSnapshot ? resourcesDebugSnapshot.state : null,
      memoryLimitMegabytes
    );

    const inspectorEditors = {
      'inspector-list': {
        type: 'secondary',
        noTitleBar: true,
        renderEditor: () => (
          <Background>
            <Line justifyContent="center">
              <RaisedButton
                label={<Trans>Refresh</Trans>}
                onClick={onRefresh}
                disabled={!isDebuggerConnected}
                primary
              />
            </Line>
            {isGameDataTruncated && (
              <AlertMessage kind="warning">
                <Trans>
                  The game is too large to be sent whole to the debugger: the
                  elements marked with a warning are missing. Select an element
                  to read it entirely.
                </Trans>
              </AlertMessage>
            )}
            <InspectorsList
              gameData={gameData}
              getInspectorDescriptions={getInspectorDescriptions}
              selectedInspectorFullPath={selectedInspectorFullPath}
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
          </Background>
        ),
      },
      'inspector-details': {
        type: 'primary',
        noTitleBar: true,
        renderEditor: () => (
          <Background>
            <div className={classes.inspectorDetailsContent}>
              {selectedInspector ? (
                <InspectedValue
                  selectedInspector={selectedInspector}
                  selectedInspectorFullPath={selectedInspectorFullPath}
                  gameData={gameData}
                  onInspectPath={onInspectPath}
                  // Followed as long as the game is connected, recording
                  // or not: the game still runs when a recording stops.
                  isLive={isDebuggerConnected}
                  isGamePaused={isDebuggerPaused}
                  rawMode={rawMode}
                  onCall={onCall}
                  onEdit={onEdit}
                  onReadValues={onReadValues}
                />
              ) : (
                <EmptyMessage>
                  {gameData ? (
                    <Trans>
                      Choose an element to inspect in the list on the left
                    </Trans>
                  ) : (
                    <Trans>
                      Pause the game (from the toolbar) or hit refresh (on the
                      left) to inspect the game
                    </Trans>
                  )}
                </EmptyMessage>
              )}
            </div>
          </Background>
        ),
      },
    };

    const renderPanel: { [DebuggerPanelName]: () => React.Node } = {
      inspector: () => (
        <Background>
          <div className={classes.inspector}>
            <PreferencesContext.Consumer>
              {({ getDefaultEditorMosaicNode, setDefaultEditorMosaicNode }) => (
                <EditorMosaic
                  // $FlowFixMe[incompatible-type]
                  editors={inspectorEditors}
                  centralNodeId="inspector-details"
                  initialNodes={
                    isMosaicNodeUsable(
                      getDefaultEditorMosaicNode('debugger-inspector'),
                      Object.keys(inspectorEditors),
                      'inspector-details'
                    )
                      ? // $FlowFixMe[incompatible-type]
                        getDefaultEditorMosaicNode('debugger-inspector')
                      : initialInspectorMosaicNodes
                  }
                  onPersistNodes={node =>
                    setDefaultEditorMosaicNode('debugger-inspector', node)
                  }
                />
              )}
            </PreferencesContext.Consumer>
          </div>
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
      profiler: () => (
        <Profiler
          profilingInProgress={profilingInProgress}
          recordingStore={profilerRecordingStore}
          debuggerId={debuggerId}
          canRecord={canRecord}
          onStartRecording={onStartRecording}
          baselineRecording={baselineRecording}
        />
      ),
      performance: () => (
        <Performance
          recordingStore={profilerRecordingStore}
          debuggerId={debuggerId}
          profilingInProgress={profilingInProgress}
          memoryLimitBytes={memoryLimitBytes || null}
          canRecord={canRecord}
          onStartRecording={onStartRecording}
          baselineRecording={baselineRecording}
        />
      ),
      resources: () => (
        <ResourcesPanel
          resourcesDebugState={
            resourcesDebugSnapshot ? resourcesDebugSnapshot.state : null
          }
          lastError={
            resourcesDebugSnapshot ? resourcesDebugSnapshot.lastError : null
          }
          onRefresh={onRequestResourcesDebugState}
          // Followed as long as the game is connected and running,
          // recording or not: a paused game loads nothing.
          isPollingEnabled={isDebuggerConnected && !isDebuggerPaused}
          recordingStore={profilerRecordingStore}
          debuggerId={debuggerId}
          canRecord={canRecord}
          onStartRecording={onStartRecording}
          artificialLimitMegabytes={memoryLimitMegabytes}
          onChangeArtificialLimitMegabytes={megabytes =>
            this.setState({ memoryLimitMegabytes: megabytes })
          }
          baselineResourcesDebugState={baselineResourcesDebugState}
        />
      ),
      console: () => (
        <Background>
          <DebuggerConsole logsManager={logsManager || []} />
        </Background>
      ),
    };

    const editors = {
      overview: {
        type: 'primary',
        noTitleBar: true,
        renderEditor: () => (
          <Background>
            <EmptyMessage>
              <Trans>
                Use the buttons of the toolbar to open the inspector, the
                profiler, the performance and resources panels or the console.
              </Trans>
            </EmptyMessage>
          </Background>
        ),
      },
    };
    DEBUGGER_PANELS.forEach(({ name, title }) => {
      editors[name] = {
        type: 'secondary',
        title,
        renderEditor: renderPanel[name],
      };
    });

    return (
      <PreferencesContext.Consumer>
        {({ getDefaultEditorMosaicNode, setDefaultEditorMosaicNode }) => (
          <EditorMosaic
            ref={editors => (this._editors = editors)}
            // $FlowFixMe[incompatible-type]
            editors={editors}
            centralNodeId="overview"
            initialNodes={
              // A layout saved by an older debugger names panels that are
              // gone: the default one is used instead.
              isMosaicNodeUsable(
                getDefaultEditorMosaicNode('debugger'),
                Object.keys(editors),
                'overview'
              )
                ? // $FlowFixMe[incompatible-type]
                  getDefaultEditorMosaicNode('debugger')
                : initialMosaicEditorNodes
            }
            onPersistNodes={node =>
              setDefaultEditorMosaicNode('debugger', node)
            }
            onOpenedEditorsChanged={this._onOpenedEditorsChanged}
          />
        )}
      </PreferencesContext.Consumer>
    );
  }
}
