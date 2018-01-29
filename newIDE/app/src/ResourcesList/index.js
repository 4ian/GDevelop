// @flow
import React, { Component } from 'react';
import { AutoSizer } from 'react-virtualized';
import SortableVirtualizedItemList from '../UI/SortableVirtualizedItemList';
import Paper from 'material-ui/Paper';
import SearchBar from 'material-ui-search-bar';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { filterResourcesList } from './EnumerateResources';
const CLIPBOARD_KIND = 'Resource';

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },
  listContainer: {
    flex: 1,
  },
};

type State = {|
  renamedResource: ?gdResource,
  searchText: string,
|};

type Props = {
  project: gdProject,
  onDeleteResource: (resource: gdResource, cb: (boolean) => void) => void,
  onRenameResource: (
    resource: gdResource,
    newName: string,
    cb: (boolean) => void
  ) => void,
};

export default class ResourcesList extends React.Component<Props, State> {
  static defaultProps = {
    onDeleteResource: (resource: gdResource, cb: boolean => void) => cb(true),
    onRenameResource: (
      resource: gdResource,
      newName: string,
      cb: boolean => void
    ) => cb(true),
  };

  sortableList: any;
  state: State = {
    renamedResource: null,
    searchText: '',
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    // The component is costly to render, so avoid any re-rendering as much
    // as possible.
    // We make the assumption that no changes to resources list is made outside
    // from the component.
    // If a change is made, the component won't notice it: you have to manually
    // call forceUpdate.

    if (
      this.state.renamedResource !== nextState.renamedResource ||
      this.state.searchText !== nextState.searchText
    )
      return true;

    if (this.props.project !== nextProps.project) return true;

    return false;
  }

  addResource = (objectType: string) => {
    // const { project, objectsContainer } = this.props;
    // const name = newNameGenerator(
    //   'NewObject',
    //   name =>
    //     objectsContainer.hasObjectNamed(name) || project.hasObjectNamed(name)
    // );
    // const object = objectsContainer.insertNewObject(
    //   project,
    //   objectType,
    //   name,
    //   objectsContainer.getObjectsCount()
    // );
    // this.setState(
    //   {
    //     newObjectDialogOpen: false,
    //   },
    //   () => {
    //     if (this.props.onEditResource) {
    //       this.props.onEditResource(object);
    //     }
    //   }
    // );
  };

  _deleteResource = (resource: gdResource) => {
    // const { object, global } = resource;
    // const { project, objectsContainer } = this.props;
    // //eslint-disable-next-line
    // const answer = confirm(
    //   "Are you sure you want to remove this object? This can't be undone."
    // );
    // if (!answer) return;
    // this.props.onDeleteResource(resource, doRemove => {
    //   if (!doRemove) return;
    //   if (global) {
    //     project.removeObject(object.getName());
    //   } else {
    //     objectsContainer.removeObject(object.getName());
    //   }
    //   this.forceUpdate();
    // });
  };

  _copyResource = (resource: gdResource) => {
    //     const { object } = resource;
    //     Clipboard.set(CLIPBOARD_KIND, {
    //       type: object.getType(),
    //       name: object.getName(),
    //       object: serializeToJSObject(object),
    //     });
  };

  _cutResource = (resource: gdResource) => {
    //     this._copyResource(resource);
    //     this._deleteResource(resource);
  };

  _pasteResource = (resource: gdResource) => {
    //     if (!Clipboard.has(CLIPBOARD_KIND)) return;
    //     const { object: pasteObject, global } = resource;
    //     const { object: copiedObject, type, name } = Clipboard.get(CLIPBOARD_KIND);
    //     const { project, objectsContainer, onObjectPasted } = this.props;
    //     const newName = newNameGenerator(
    //       'CopyOf' + name,
    //       name =>
    //         objectsContainer.hasObjectNamed(name) || project.hasObjectNamed(name)
    //     );
    //     const newObject = global
    //       ? project.insertNewObject(
    //           project,
    //           type,
    //           newName,
    //           project.getObjectPosition(pasteObject.getName())
    //         )
    //       : objectsContainer.insertNewObject(
    //           project,
    //           type,
    //           newName,
    //           objectsContainer.getObjectPosition(pasteObject.getName())
    //         );
    //     unserializeFromJSObject(
    //       newObject,
    //       copiedObject,
    //       'unserializeFrom',
    //       project
    //     );
    //     this.forceUpdate();
    //     if (onObjectPasted) onObjectPasted(newObject);
  };

  _editName = (resource: ?gdResource) => {
    this.setState(
      {
        renamedResource: resource,
      },
      () => this.sortableList.getWrappedInstance().forceUpdateGrid()
    );
  };

  _rename = (resource: gdResource, newName: string) => {
    const { project } = this.props;
    this.setState({
      renamedResource: null,
    });

    if (resource.getName() === newName) return;

    if (project.getResourcesManager().hasResource(newName)) {
      showWarningBox('Another resource with this name already exists');
      return;
    }

    this.props.onRenameResource(resource, newName, doRename => {
      if (!doRename) return;
      resource.setName(newName);
      this.forceUpdate();
    });
  };

  _move = (oldIndex: number, newIndex: number) => {
    // const { project, objectsContainer } = this.props;

    // const isInContainerResourcesList =
    //   oldIndex < this.containerResourcesList.length;
    // if (isInContainerResourcesList) {
    //   objectsContainer.moveObject(
    //     oldIndex,
    //     Math.min(newIndex, this.containerResourcesList.length - 1)
    //   );
    // } else {
    //   const projectOldIndex = oldIndex - this.containerResourcesList.length;
    //   const projectNewIndex = newIndex - this.containerResourcesList.length;

    //   project.moveObject(
    //     projectOldIndex,
    //     Math.min(projectNewIndex, this.projectResourcesList.length - 1)
    //   );
    // }

    this.forceUpdateList();
  };

  forceUpdateList = () => {
    this.forceUpdate();
    this.sortableList.getWrappedInstance().forceUpdateGrid();
  };

  _renderResourceMenuTemplate = (resource: gdResource) => {
    return [
      {
        label: 'Edit resource',
        enabled: false,
        click: () => {
          /*TODO*/
        },
      },
      { type: 'separator' },
      {
        label: 'Rename',
        click: () => this._editName(resource),
      },
      {
        label: 'Delete',
        click: () => this._deleteResource(resource),
      },
      { type: 'separator' },
      {
        label: 'Add a new resource...',
        enabled: false,
        click: () => {
          /*TODO*/
        },
      },
      { type: 'separator' },
      {
        label: 'Copy',
        enabled: false,
        click: () => this._copyResource(resource),
      },
      {
        label: 'Cut',
        enabled: false,
        click: () => this._cutResource(resource),
      },
      {
        label: 'Paste',
        enabled: Clipboard.has(CLIPBOARD_KIND),
        click: () => this._pasteResource(resource),
      },
    ];
  };

  render() {
    const { project } = this.props;
    const { searchText } = this.state;

    const resourcesManager = project.getResourcesManager();
    const allResourcesList = resourcesManager
      .getAllResourcesList() // TODO: This should be renamed to getAllResourcesNames
      .toJSArray()
      .map(resourceName => resourcesManager.getResource(resourceName));
    const filteredList = filterResourcesList(allResourcesList, searchText);
    const fullList = filteredList.concat({
      key: 'add-item-row',
    });

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr;

    return (
      <Paper style={styles.container}>
        <div style={styles.listContainer}>
          <AutoSizer>
            {({ height, width }) => (
              <SortableVirtualizedItemList
                key={listKey}
                ref={sortableList => (this.sortableList = sortableList)}
                fullList={fullList}
                width={width}
                height={height}
                renamedItem={this.state.renamedResource}
                onAddNewItem={() => {}}
                onRename={this._rename}
                onSortEnd={({ oldIndex, newIndex }) =>
                  this._move(oldIndex, newIndex)}
                helperClass="sortable-helper"
                distance={30}
                buildMenuTemplate={this._renderResourceMenuTemplate}
              />
            )}
          </AutoSizer>
        </div>
        <SearchBar
          value={searchText}
          onRequestSearch={() => {}}
          onChange={text =>
            this.setState({
              searchText: text,
            })}
        />
      </Paper>
    );
  }
}
