// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import { type ResourceKind } from '../ResourceSource';
import ImagePreview from './ImagePreview';
import GenericIconPreview from './GenericIconPreview';
import Audiotrack from '@material-ui/icons/Audiotrack';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import VideoLibrary from '@material-ui/icons/VideoLibrary';
import FontDownload from '@material-ui/icons/FontDownload';

type Props = {|
  project: gdProject,
  resourceName: string,
  resourcePath?: string,
  resourcesLoader: typeof ResourcesLoader,
  onSize?: (number, number) => void,
|};

type State = {|
  resourceKind: ?ResourceKind,
|};

/**
 * Display the right preview for any given resource of a project
 */
export default class ResourcePreview extends React.PureComponent<Props, State> {
  state = this._loadFrom(this.props);

  componentWillReceiveProps(newProps: Props) {
    if (
      newProps.resourceName !== this.props.resourceName ||
      newProps.project !== this.props.project ||
      newProps.resourcePath !== this.props.resourcePath
    ) {
      this.setState(this._loadFrom(newProps));
    }
  }

  _loadFrom(props: Props): State {
    const { project, resourceName } = props;
    const resourcesManager = project.getResourcesManager();
    const resourceKind = resourcesManager.hasResource(resourceName)
      ? resourcesManager.getResource(resourceName).getKind()
      : null;

    return {
      resourceKind,
    };
  }

  render() {
    const { resourceKind } = this.state;

    switch (resourceKind) {
      case 'image':
        return (
          <ImagePreview
            project={this.props.project}
            resourceName={this.props.resourceName}
            resourcesLoader={this.props.resourcesLoader}
            onSize={this.props.onSize}
            resourcePath={this.props.resourcePath}
          />
        );
      case 'audio':
        return (
          <GenericIconPreview renderIcon={props => <Audiotrack {...props} />} />
        );
      case 'json':
        return (
          <GenericIconPreview
            renderIcon={props => <InsertDriveFile {...props} />}
          />
        );
      case 'tilemap':
        return (
          <GenericIconPreview
            renderIcon={props => <InsertDriveFile {...props} />}
          />
        );
      case 'video':
        return (
          <GenericIconPreview
            renderIcon={props => <VideoLibrary {...props} />}
          />
        );
      case 'font':
      case 'bitmapFont':
        return (
          <GenericIconPreview
            renderIcon={props => <FontDownload {...props} />}
          />
        );
      default:
        return null;
    }
  }
}
