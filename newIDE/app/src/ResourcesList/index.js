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
import optionalRequire from '../Utils/OptionalRequire.js';
import Window from '../Utils/Window';
import {
  createOrUpdateResource,
  getLocalResourceFullPath,
  getResourceFilePathStatus,
  RESOURCE_EXTENSIONS,
} from './ResourceUtils.js';
import { type ResourceKind } from './ResourceSource.flow';
import optionalLazyRequire from '../Utils/OptionalLazyRequire';

const lazyRequireGlob = optionalLazyRequire('glob');
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const hasElectron = electron ? true : false;

const gd: libGDevelop = global.gd;

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
  onRemoveUnusedResources: ResourceKind => void,
  onRemoveAllResourcesWithInvalidPath: () => void,
|};

export default class ResourcesList extends React.Component<Props, State> {
  sortableList: any;
  state: State = {
    renamedResource: null,
    searchText: '',
    resourcesWithErrors: {},
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

  _locateResourceFile = (resource: gdResource) => {
    const resourceFolderPath = path.dirname(
      getLocalResourceFullPath(this.props.project, resource.getName())
    );
    electron.shell.openItem(resourceFolderPath);
  };

  _openResourceFile = (resource: gdResource) => {
    const resourceFilePath = getLocalResourceFullPath(
      this.props.project,
      resource.getName()
    );
    electron.shell.openItem(resourceFilePath);
  };

  _copyResourceFilePath = (resource: gdResource) => {
    const resourceFilePath = getLocalResourceFullPath(
      this.props.project,
      resource.getName()
    );
    electron.clipboard.writeText(resourceFilePath);
  };

  _scanForNewResources = (
    extensions: string,
    createResource: () => gdResource
  ) => {
    const glob = lazyRequireGlob();
    if (!glob) return;

    const project = this.props.project;
    const resourcesManager = project.getResourcesManager();
    const projectPath = path.dirname(project.getProjectFile());

    const getDirectories = (src, callback) => {
      glob(src + '/**/*.{' + extensions + '}', callback);
    };
    getDirectories(projectPath, (err, res) => {
      if (err) {
        console.error('Error loading ', err);
      } else {
        res.forEach(pathFound => {
          const fileName = path.relative(projectPath, pathFound);
          if (!resourcesManager.hasResource(fileName)) {
            createOrUpdateResource(project, createResource(), fileName);
            console.info(`${fileName} added to project.`);
          }
        });
      }
      this.forceUpdate();
    });
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

    const answer = Window.showConfirmDialog(
      'Are you sure you want to rename this resource? \nGame objects using the old name will no longer be able to find it!'
    );
    if (!answer) return;

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
  ) => {
    return [
      {
        label: i18n._(t`Rename`),
        click: () => this._editName(resource),
      },
      {
        label: i18n._(t`Remove`),
        click: () => this._deleteResource(resource),
      },
      { type: 'separator' },
      {
        label: i18n._(t`Open File`),
        click: () => this._openResourceFile(resource),
        enabled: hasElectron,
      },
      {
        label: i18n._(t`Locate File`),
        click: () => this._locateResourceFile(resource),
        enabled: hasElectron,
      },
      {
        label: i18n._(t`Copy File Path`),
        click: () => this._copyResourceFilePath(resource),
        enabled: hasElectron,
      },
      { type: 'separator' },
      {
        label: i18n._(t`Scan for Images`),
        click: () => {
          this._scanForNewResources(
            RESOURCE_EXTENSIONS.image,
            () => new gd.ImageResource()
          );
        },
        enabled: hasElectron,
      },
      {
        label: i18n._(t`Scan for Audio`),
        click: () => {
          this._scanForNewResources(
            RESOURCE_EXTENSIONS.audio,
            () => new gd.AudioResource()
          );
        },
        enabled: hasElectron,
      },
      {
        label: i18n._(t`Scan for Fonts`),
        click: () => {
          this._scanForNewResources(
            RESOURCE_EXTENSIONS.font,
            () => new gd.FontResource()
          );
          this._scanForNewResources(
            RESOURCE_EXTENSIONS.bitmapFont,
            () => new gd.BitmapFontResource()
          );
        },
        enabled: hasElectron,
      },
      {
        label: i18n._(t`Scan for Videos`),
        click: () => {
          this._scanForNewResources(
            RESOURCE_EXTENSIONS.video,
            () => new gd.VideoResource()
          );
        },
        enabled: hasElectron,
      },
      { type: 'separator' },
      {
        label: i18n._(t`Remove Unused Images`),
        click: () => {
          this.props.onRemoveUnusedResources('image');
        },
      },
      {
        label: i18n._(t`Remove Unused Audio`),
        click: () => {
          this.props.onRemoveUnusedResources('audio');
        },
      },
      {
        label: i18n._(t`Remove Unused Fonts`),
        click: () => {
          this.props.onRemoveUnusedResources('font');
          this.props.onRemoveUnusedResources('bitmapFont');
        },
      },
      {
        label: i18n._(t`Remove Resources with Invalid Path`),
        click: () => {
          this.props.onRemoveAllResourcesWithInvalidPath();
        },
        enabled: hasElectron,
      },
    ];
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

  componentDidMount() {
    this.checkMissingPaths();
  }

  render() {
    const { project, selectedResource, onSelectResource } = this.props;
    const { searchText } = this.state;

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
        <SearchBar
          value={searchText}
          onRequestSearch={() => {}}
          onChange={text =>
            this.setState({
              searchText: text,
            })
          }
        />
      </Background>
    );
  }
}
