// @flow
import * as React from 'react';
import EventsSheet from '../EventsSheet';
import EditorMosaic, { MosaicWindow } from '../UI/EditorMosaic';
import ParametersEditor from './ParametersEditor';
import Paper from 'material-ui/Paper';
const gd = global.gd;

type Props = {|
  project: gdProject,
  eventsFunction: gdEventsFunction,
|};

type State = {||};

const styles = {
  container: { flex: 1, display: 'flex' },
};

export default class EventsFunctionEditor extends React.Component<
  Props,
  State
> {
  editor: ?EventsSheet;
  _editors: ?EditorMosaic;
  _globalObjectsContainer: ?gdObjectsContainer;
  _objectsContainer: ?gdObjectsContainer;

  componentDidMount() {
    this._loadFrom(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.eventsFunction !== this.props.eventsFunction ||
      nextProps.project !== this.props.project
    ) {
      this._loadFrom(nextProps);
    }
  }

  _loadFrom(props: Props) {
    if (this._globalObjectsContainer) this._globalObjectsContainer.delete();
    this._globalObjectsContainer = new gd.ObjectsContainer();

    if (this._objectsContainer) this._objectsContainer.delete();
    this._objectsContainer = new gd.ObjectsContainer();

    this.updateFromParameters(props.project, props.eventsFunction);
  }

  componentWillUnmount() {
    if (this._globalObjectsContainer) this._globalObjectsContainer.delete();
    if (this._objectsContainer) this._objectsContainer.delete();
  }

  updateFromParameters = (
    project: gdProject,
    eventsFunction: gdEventsFunction
  ) => {
    gd.ParameterMetadataTools.parametersToObjectsContainer(
      project,
      eventsFunction.getParameters(),
      this._objectsContainer
    );
    this.forceUpdate();
  };

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  render() {
    const { project, eventsFunction } = this.props;

    if (!this._globalObjectsContainer || !this._objectsContainer) return null;

    return (
      <EditorMosaic
        ref={editors => (this._editors = editors)}
        editors={{
          parameters: (
            <MosaicWindow title="Function Parameters" toolbarControls={[]}>
              <Paper style={styles.container}>
                <ParametersEditor
                  eventsFunction={eventsFunction}
                  onParametersUpdated={() =>
                    this.updateFromParameters(project, eventsFunction)}
                />
              </Paper>
            </MosaicWindow>
          ),
          'events-sheet': (
            <EventsSheet
              ref={editor => (this.editor = editor)}
              project={project}
              layout={null}
              globalObjectsContainer={this._globalObjectsContainer}
              objectsContainer={this._objectsContainer}
              events={eventsFunction.getEvents()}
              showPreviewButton={false}
              onPreview={options => {
                /*TODO*/
              }}
              showNetworkPreviewButton={false}
              onOpenExternalEvents={() => {
                /*TODO*/
              }}
              onOpenLayout={() => {
                /*TODO*/
              }}
              resourceSources={[]}
              onChooseResource={() => {
                /*TODO*/
                return Promise.reject(new Error('Unimplemented'));
              }}
              resourceExternalEditors={[]}
              setToolbar={() => {
                /*TODO*/
              }}
              updateToolbar={() => {
                /*TODO*/
              }}
              onOpenDebugger={() => {
                /*TODO*/
              }}
              onOpenSettings={() => {}}
            />
          ),
        }}
        initialNodes={{
          direction: 'column',
          first: 'parameters',
          second: 'events-sheet',
          splitPercentage: 25,
        }}
      />
    );
  }
}
