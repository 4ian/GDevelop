// @flow
import * as React from 'react';

export type ProjectsStorageProps = {|
  onOpenWithPicker?: () => Promise<?string>,
  onOpen: (filepath: string) => Object,
  onSaveProject: gdProject => Promise<boolean>,
  onSaveProjectAs?: gdProject => Promise<boolean>,
  onAutoSaveProject?: (project: gdProject) => void,
  shouldOpenAutosave?: (
    filePath: string,
    autoSavePath: string,
    compareLastModified: boolean
  ) => boolean,
|};

export type StorageProvider = ({
  setDialog: (() => React.Node) => void,
  closeDialog: () => void,
}) => ProjectsStorageProps;

const emptyStorageProvider: StorageProvider = () => ({
  onOpenWithPicker: () => Promise.reject('No storage provider set up'),
  onOpen: () => ({}),
  shouldOpenAutosave: () => false,
  onSaveProject: (project: gdProject) =>
    Promise.reject('No storage provider set up'),
  onSaveProjectAs: (project: gdProject) =>
    Promise.reject('No storage provider set up'),
  onAutoSaveProject: (project: gdProject) => {},
});

type Props = {|
  storageProviders: Array<StorageProvider>,
  defaultStorageProvider?: StorageProvider,
  children: (storage: ProjectsStorageProps) => React.Node,
|};

type State = {|
  currentStorageProvider: ?StorageProvider,
  renderDialog: ?() => React.Node,
|};

export default class ProjectsStorage extends React.Component<Props, State> {
  state = {
    currentStorageProvider: this.props.defaultStorageProvider,
    renderDialog: null,
  };

  _setDialog = (renderDialog: () => React.Node) => {
    this.setState({
      renderDialog,
    });
  };
  _closeDialog = () => {
    this.setState({
      renderDialog: null,
    });
  };

  render() {
    const { children } = this.props;
    const { renderDialog } = this.state;
    const currentStorageProvider =
      this.state.currentStorageProvider || emptyStorageProvider;

    return (
      <React.Fragment>
        {children(
          currentStorageProvider({
            setDialog: this._setDialog,
            closeDialog: this._closeDialog,
          })
        )}
        {renderDialog && renderDialog()}
      </React.Fragment>
    );
  }
}
