// @flow
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import SortableVirtualizedItemList from '../UI/SortableVirtualizedItemList';
import Background from '../UI/Background';
import SearchBar from '../UI/SearchBar';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { filterResourcesList } from './EnumerateResources';
import { getResourceFilePathStatus } from './ResourceUtils';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import {
  type ResourceKind,
  allResourceKindsAndMetadata,
} from './ResourceSource';
import { type FileMetadata } from '../ProjectsStorage';
import ResourcesLoader from '../ResourcesLoader';
import { Column, Line } from '../UI/Grid';
import { type ResourcesActionsMenuBuilder } from '../ProjectsStorage';
import InfoBar from '../UI/Messages/InfoBar';

const styles = {
  listContainer: {
    flex: 1,
  },
};

const getResourceName = (resource: gdResource) => resource.getName();

type State = {|
  renamedResource: ?gdResource,
  searchText: string,
  resourcesWithErrors: { [string]: '' | 'error' | 'warning' },
  infoBarContent: ?{|
    message: React.Node,
    actionLabel?: React.Node,
    onActionClick?: () => void,
  |},
|};

type Props = {|
  project: gdProject,
  selectedResource: ?gdResource,
  onSelectResource: (resource: ?gdResource) => void,
  onDeleteResource: (resource: gdResource) => void,
  onRenameResource: (
    resource: gdResource,
    newName: string,
    cb: (boolean) => void
  ) => void,
  fileMetadata: ?FileMetadata,
  onRemoveUnusedResources: ResourceKind => void,
  onRemoveAllResourcesWithInvalidPath: () => void,
  getResourceActionsSpecificToStorageProvider?: ?ResourcesActionsMenuBuilder,
|};

export default class ResourcesList extends React.Component<Props, State> {
  sortableList: any;
  state: State = {
    renamedResource: null,
    searchText: '',
    resourcesWithErrors: {},
    infoBarContent: null,
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
      this.state.searchText !== nextState.searchText ||
      this.state.infoBarContent !== nextState.infoBarContent
    )
      return true;

    if (
      this.props.project !== nextProps.project ||
      this.props.selectedResource !== nextProps.selectedResource
    )
      return true;

    return false;
  }

  _deleteResource = (resource: gdResource) => {
    this.props.onDeleteResource(resource);
  };

  _editName = (resource: ?gdResource) => {
    this.setState(
      {
        renamedResource: resource,
      },
      () => {
        if (this.sortableList) this.sortableList.forceUpdateGrid();
      }
    );
  };

  _getResourceThumbnail = (resource: gdResource) => {
    switch (resource.getKind()) {
      case 'image':
        return ResourcesLoader.getResourceFullUrl(
          this.props.project,
          resource.getName(),
          {}
        );
      case 'audio':
        return 'res/actions/music24.png';
      case 'json':
      case 'tilemap':
      case 'tileset':
      case 'spine':
        return 'res/actions/fichier24.png';
      case 'video':
        return 'JsPlatform/Extensions/videoicon24.png';
      case 'font':
        return 'res/actions/font24.png';
      case 'bitmapFont':
        return 'JsPlatform/Extensions/bitmapfont32.png';
      case 'model3D':
        return 'JsPlatform/Extensions/3d_model.svg';
      default:
        return 'res/unknown32.png';
    }
  };

  _rename = (resource: gdResource, newName: string) => {
    const { project } = this.props;
    this.setState({
      renamedResource: null,
    });

    if (resource.getName() === newName) return;

    if (project.getResourcesManager().hasResource(newName)) {
      showWarningBox('Another resource with this name already exists', {
        delayToNextTick: true,
      });
      return;
    }

    this.props.onRenameResource(resource, newName, doRename => {
      if (!doRename) return;
      resource.setName(newName);
      this.forceUpdate();
    });
  };

  _moveSelectionTo = (destinationResource: gdResource) => {
    const { project, selectedResource } = this.props;
    if (!selectedResource) return;

    const resourcesManager = project.getResourcesManager();
    resourcesManager.moveResource(
      resourcesManager.getResourcePosition(selectedResource.getName()),
      resourcesManager.getResourcePosition(destinationResource.getName())
    );
    this.forceUpdateList();
  };

  forceUpdateList = () => {
    this.forceUpdate();
    if (this.sortableList) this.sortableList.forceUpdateGrid();
  };

  _renderResourceMenuTemplate = (i18n: I18nType) => (
    resource: gdResource,
    _index: number
  ): Array<MenuItemTemplate> => {
    const {
      getResourceActionsSpecificToStorageProvider,
      fileMetadata,
    } = this.props;
    let menu = [
      {
        label: i18n._(t`Rename`),
        click: () => this._editName(resource),
      },
      {
        label: i18n._(t`Delete`),
        click: () => this._deleteResource(resource),
      },
      { type: 'separator' },
      {
        label: i18n._(t`Remove unused...`),
        submenu: allResourceKindsAndMetadata
          .map(({ displayName, kind }) => ({
            label: i18n._(displayName),
            click: () => {
              this.props.onRemoveUnusedResources(kind);
            },
          }))
          .concat([
            {
              label: i18n._(t`Resources (any kind)`),
              click: () => {
                allResourceKindsAndMetadata.forEach(resourceKindAndMetadata => {
                  this.props.onRemoveUnusedResources(
                    resourceKindAndMetadata.kind
                  );
                });
              },
            },
          ]),
      },
    ];
    if (getResourceActionsSpecificToStorageProvider && fileMetadata) {
      menu.push({ type: 'separator' });
      menu = menu.concat(
        getResourceActionsSpecificToStorageProvider({
          project: this.props.project,
          fileMetadata,
          resource,
          i18n,
          informUser: this.openInfoBar,
          updateInterface: () => this.forceUpdateList(),
          cleanUserSelectionOfResources: () =>
            this.props.onSelectResource(null),
        })
      );
    }
    return menu;
  };

  checkMissingPaths = () => {
    const { project } = this.props;
    const resourcesManager = project.getResourcesManager();
    const resourceNames = resourcesManager.getAllResourceNames().toJSArray();
    const resourcesWithErrors = {};
    resourceNames.forEach(resourceName => {
      resourcesWithErrors[resourceName] = getResourceFilePathStatus(
        project,
        resourceName
      );
    });
    this.setState({ resourcesWithErrors });
    this.forceUpdateList();
  };

  openInfoBar = (
    infoBarContent: ?{|
      message: React.Node,
      actionLabel?: React.Node,
      onActionClick?: () => void,
    |}
  ) => {
    this.setState({ infoBarContent });
  };

  componentDidMount() {
    this.checkMissingPaths();
  }

  render() {
    const { project, selectedResource, onSelectResource } = this.props;
    const { searchText, infoBarContent } = this.state;

    const resourcesManager = project.getResourcesManager();
    const allResourcesList = resourcesManager
      .getAllResourceNames()
      .toJSArray()
      .map(resourceName => resourcesManager.getResource(resourceName));
    const filteredList = filterResourcesList(allResourcesList, searchText);

    // Force List component to be mounted again if project
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr;

    return (
      <Background>
        <Line>
          <Column expand>
            <SearchBar
              value={searchText}
              onRequestSearch={() => {}}
              onChange={text =>
                this.setState({
                  searchText: text,
                })
              }
              placeholder={t`Search resources`}
            />
          </Column>
        </Line>
        <div style={styles.listContainer}>
          <AutoSizer>
            {({ height, width }) => (
              <I18n>
                {({ i18n }) => (
                  <SortableVirtualizedItemList
                    key={listKey}
                    ref={sortableList => (this.sortableList = sortableList)}
                    fullList={filteredList}
                    width={width}
                    height={height}
                    getItemName={getResourceName}
                    getItemThumbnail={this._getResourceThumbnail}
                    selectedItems={selectedResource ? [selectedResource] : []}
                    onItemSelected={onSelectResource}
                    renamedItem={this.state.renamedResource}
                    onRename={this._rename}
                    onMoveSelectionToItem={this._moveSelectionTo}
                    buildMenuTemplate={this._renderResourceMenuTemplate(i18n)}
                    erroredItems={this.state.resourcesWithErrors}
                    reactDndType="GD_RESOURCE"
                  />
                )}
              </I18n>
            )}
          </AutoSizer>
        </div>
        {!!infoBarContent && (
          <InfoBar
            duration={7000}
            visible
            hide={() => this.setState({ infoBarContent: null })}
            {...infoBarContent}
          />
        )}
      </Background>
    );
  }
}
