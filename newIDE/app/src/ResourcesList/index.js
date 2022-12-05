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
import { mapVector } from '../Utils/MapFor';
import optionalRequire from '../Utils/OptionalRequire';
import {
  applyResourceDefaults,
  getLocalResourceFullPath,
  getResourceFilePathStatus,
} from './ResourceUtils';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import {
  type ResourceKind,
  allResourceKindsAndMetadata,
} from './ResourceSource';
import optionalLazyRequire from '../Utils/OptionalLazyRequire';
import ResourcesLoader from '../ResourcesLoader';
import newNameGenerator from '../Utils/NewNameGenerator';

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
    const resourceFilePath = getLocalResourceFullPath(
      this.props.project,
      resource.getName()
    );
    electron.shell.showItemInFolder(path.resolve(resourceFilePath));
  };

  _openResourceFile = (resource: gdResource) => {
    const resourceFilePath = getLocalResourceFullPath(
      this.props.project,
      resource.getName()
    );
    electron.shell.openPath(path.resolve(resourceFilePath));
  };

  _copyResourceFilePath = (resource: gdResource) => {
    const resourceFilePath = getLocalResourceFullPath(
      this.props.project,
      resource.getName()
    );
    electron.clipboard.writeText(path.resolve(resourceFilePath));
  };

  _scanForNewResources = (
    extensions: Array<string>,
    createResource: () => gdResource
  ) => {
    const glob = lazyRequireGlob();
    if (!glob) return;

    const project = this.props.project;
    const resourcesManager = project.getResourcesManager();
    const projectPath = path.dirname(project.getProjectFile());

    const allExtensions = [
      ...extensions,
      ...extensions.map(extension => extension.toUpperCase()),
    ];
    const getAllFiles = (src, callback) => {
      glob(src + '/**/*.{' + allExtensions.join(',') + '}', callback);
    };
    getAllFiles(projectPath, (error, allFiles) => {
      if (error) {
        console.error(`Error finding files inside ${projectPath}:`, error);
        return;
      }

      const filesToCheck = new gd.VectorString();
      allFiles.forEach(filePath =>
        filesToCheck.push_back(path.relative(projectPath, filePath))
      );
      const filePathsNotInResources = project
        .getResourcesManager()
        .findFilesNotInResources(filesToCheck);
      filesToCheck.delete();

      mapVector(filePathsNotInResources, (relativeFilePath: string) => {
        const resourceName = newNameGenerator(relativeFilePath, name =>
          resourcesManager.hasResource(name)
        );

        const resource = createResource();
        resource.setFile(relativeFilePath);
        resource.setName(resourceName);
        applyResourceDefaults(project, resource);
        resourcesManager.addResource(resource);
        resource.delete();

        console.info(
          `"${relativeFilePath}" added to project as resource named "${resourceName}".`
        );
      });

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
        return 'res/actions/fichier24.png';
      case 'tilemap':
        return 'res/actions/star24.png';
      case 'video':
        return 'JsPlatform/Extensions/videoicon24.png';
      case 'font':
        return 'res/actions/font24.png';
      case 'bitmapFont':
        return 'JsPlatform/Extensions/bitmapfont32.png';
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
    return [
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
        label: i18n._(t`Scan in the project folder for...`),
        submenu: allResourceKindsAndMetadata.map(
          ({ displayName, fileExtensions, createNewResource }) => ({
            label: i18n._(displayName),
            click: () => {
              this._scanForNewResources(fileExtensions, createNewResource);
            },
            enabled: hasElectron,
          })
        ),
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
        <SearchBar
          value={searchText}
          onRequestSearch={() => {}}
          onChange={text =>
            this.setState({
              searchText: text,
            })
          }
          placeholder={t`Search resources`}
          aspect="integrated-search-bar"
        />
      </Background>
    );
  }
}
