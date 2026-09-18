// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import EditorMosaic, {
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
import Checkbox from '../UI/Checkbox';
import Flash from '@material-ui/icons/FlashOn';
import FlashOff from '@material-ui/icons/FlashOff';
import HelpButton from '../UI/HelpButton';
import Profiler from './Profiler';
import Performance from './Performance';
import ResourcesPanel from './Resources';
import { getMemoryLimitBytes } from './Resources/ResourcesDebugTypes';
import { DebuggerConsole, type LogsManager } from './DebuggerConsole';
import { type ResourcesDebugSnapshot } from '.';
import { ProfilerRecordingStore } from './ProfilerRecording/ProfilerRecordingStore';
import { type DebuggerId } from '../ExportAndShare/PreviewLauncher.flow';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import MiniToolbar from '../UI/MiniToolbar';
import classes from './DebuggerContent.module.css';

type Props = {|
  gameData: ?any,
  onEdit: EditFunction,
  onCall: CallFunction,
  onPlay: () => void,
  onPause: () => void,
  onRefresh: () => void,
  /** Read what is at this path in the running game, for the live inspector. */
  onInspectPath: (path: Array<string>) => Promise<Object | null>,
  profilingInProgress: boolean,
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
  /** The width of the list of the scene content, in the inspector. */
  inspectorListWidth: number,
|};

const MINIMUM_INSPECTOR_LIST_WIDTH = 160;
const MAXIMUM_INSPECTOR_LIST_WIDTH = 640;

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
 * The debugger interface: show the list of inspectors for a game, along with the
 * currently selected inspector.
 */
export default class DebuggerContent extends React.Component<Props, State> {
  state: State = {
    selectedInspector: null,
    selectedInspectorFullPath: [],
    rawMode: false,
    memoryLimitMegabytes: null,
    inspectorListWidth: 280,
  };

  _editors: ?EditorMosaicInterface = null;
  _inspectorResizeStart: ?{| x: number, width: number |} = null;

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

  _startInspectorResize = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    this._inspectorResizeStart = {
      x: event.clientX,
      width: this.state.inspectorListWidth,
    };
    window.addEventListener('mousemove', this._onInspectorResize);
    window.addEventListener('mouseup', this._stopInspectorResize);
  };

  _onInspectorResize = (event: MouseEvent) => {
    const resizeStart = this._inspectorResizeStart;
    if (!resizeStart) return;
    const inspectorListWidth = Math.max(
      MINIMUM_INSPECTOR_LIST_WIDTH,
      Math.min(
        MAXIMUM_INSPECTOR_LIST_WIDTH,
        resizeStart.width + event.clientX - resizeStart.x
      )
    );
    this.setState({ inspectorListWidth });
  };

  _stopInspectorResize = () => {
    this._inspectorResizeStart = null;
    window.removeEventListener('mousemove', this._onInspectorResize);
    window.removeEventListener('mouseup', this._stopInspectorResize);
  };

  componentWillUnmount() {
    this._stopInspectorResize();
  }

  isProfilerShown = (): any => {
    return (
      !!this._editors &&
      this._editors.getOpenedEditorNames().includes('profiler')
    );
  };

  isConsoleShown = (): any => {
    return (
      !!this._editors &&
      this._editors.getOpenedEditorNames().includes('console')
    );
  };

  isInspectorShown = (): any => {
    return (
      !!this._editors &&
      this._editors.getOpenedEditorNames().includes('inspector')
    );
  };

  isPerformanceShown = (): any => {
    return (
      !!this._editors &&
      this._editors.getOpenedEditorNames().includes('performance')
    );
  };

  isResourcesShown = (): any => {
    return (
      !!this._editors &&
      this._editors.getOpenedEditorNames().includes('resources')
    );
  };

  toggleInspector = () => {
    if (this._editors) this._editors.toggleEditor('inspector', 'left');
  };

  toggleProfiler = () => {
    if (this._editors) this._editors.toggleEditor('profiler', 'bottom');
  };

  toggleConsole = () => {
    if (this._editors) this._editors.toggleEditor('console', 'bottom');
  };

  togglePerformance = () => {
    if (this._editors) this._editors.toggleEditor('performance', 'bottom');
  };

  toggleResources = () => {
    if (this._editors) this._editors.toggleEditor('resources', 'bottom');
  };

  render(): any {
    const {
      gameData,
      onRefresh,
      onCall,
      onEdit,
      profilingInProgress,
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
      inspectorListWidth,
    } = this.state;
    const memoryLimitBytes = getMemoryLimitBytes(
      resourcesDebugSnapshot ? resourcesDebugSnapshot.state : null,
      memoryLimitMegabytes
    );

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
      inspector: {
        type: 'secondary',
        title: t`Inspector`,
        renderEditor: () => (
          <Background>
            <div className={classes.inspector}>
              <div
                className={classes.sceneContentList}
                style={{ width: inspectorListWidth }}
              >
                <Line justifyContent="center">
                  <RaisedButton
                    label={<Trans>Refresh</Trans>}
                    onClick={onRefresh}
                    disabled={!isDebuggerConnected}
                    primary
                  />
                </Line>
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
              </div>
              <div
                className={classes.resizeHandle}
                onMouseDown={this._startInspectorResize}
              />
              <div className={classes.inspectorDetails}>
                <div className={classes.inspectorDetailsContent}>
                  {selectedInspector ? (
                    <InspectedValue
                      selectedInspector={selectedInspector}
                      selectedInspectorFullPath={selectedInspectorFullPath}
                      gameData={gameData}
                      onInspectPath={onInspectPath}
                      // The values are only followed while recording, like
                      // every other statistic of the debugger.
                      isLive={isDebuggerConnected && profilingInProgress}
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
                          Pause the game (from the toolbar) or hit refresh (on
                          the left) to inspect the game
                        </Trans>
                      )}
                    </EmptyMessage>
                  )}
                </div>
              </div>
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
      },
      profiler: {
        type: 'secondary',
        title: t`Profiler`,
        renderEditor: () => (
          <Profiler
            profilingInProgress={profilingInProgress}
            recordingStore={profilerRecordingStore}
            debuggerId={debuggerId}
            canRecord={canRecord}
            onStartRecording={onStartRecording}
          />
        ),
      },
      performance: {
        type: 'secondary',
        title: t`Performance`,
        renderEditor: () => (
          <Performance
            recordingStore={profilerRecordingStore}
            debuggerId={debuggerId}
            profilingInProgress={profilingInProgress}
            memoryLimitBytes={memoryLimitBytes || null}
            canRecord={canRecord}
            onStartRecording={onStartRecording}
          />
        ),
      },
      resources: {
        type: 'secondary',
        title: t`Resources`,
        renderEditor: () => (
          <ResourcesPanel
            resourcesDebugState={
              resourcesDebugSnapshot ? resourcesDebugSnapshot.state : null
            }
            lastError={
              resourcesDebugSnapshot ? resourcesDebugSnapshot.lastError : null
            }
            onRefresh={onRequestResourcesDebugState}
            // The resources are watched while recording, like the other
            // statistics of the debugger: pausing the game freezes the
            // panel too, and clearing empties it for good.
            isPollingEnabled={
              isDebuggerConnected && !isDebuggerPaused && profilingInProgress
            }
            recordingStore={profilerRecordingStore}
            debuggerId={debuggerId}
            artificialLimitMegabytes={memoryLimitMegabytes}
            onChangeArtificialLimitMegabytes={megabytes =>
              this.setState({ memoryLimitMegabytes: megabytes })
            }
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
            // $FlowFixMe[incompatible-type]
            editors={editors}
            centralNodeId="overview"
            initialNodes={
              // $FlowFixMe[incompatible-type]
              getDefaultEditorMosaicNode('debugger-v3') ||
              initialMosaicEditorNodes
            }
            onPersistNodes={node =>
              setDefaultEditorMosaicNode('debugger-v3', node)
            }
            onOpenedEditorsChanged={this._onOpenedEditorsChanged}
          />
        )}
      </PreferencesContext.Consumer>
    );
  }
}
