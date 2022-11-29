// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import { type ResourceKind } from '../ResourceSource';
import ImagePreview, { isProjectImageResourceSmooth } from './ImagePreview';
import GenericIconPreview from './GenericIconPreview';
import Audiotrack from '@material-ui/icons/Audiotrack';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import VideoLibrary from '@material-ui/icons/VideoLibrary';
import FontDownload from '@material-ui/icons/FontDownload';

type Props = {|
  project: gdProject,
  resourceName: string,
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

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (
      newProps.resourceName !== this.props.resourceName ||
      newProps.project !== this.props.project
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
            imageResourceSource={this.props.resourcesLoader.getResourceFullUrl(
              this.props.project,
              this.props.resourceName,
              {}
            )}
            isImageResourceSmooth={isProjectImageResourceSmooth(
              this.props.project,
              this.props.resourceName
            )}
            onSize={this.props.onSize}
          />
        );
      case 'audio':
        return (
          <GenericIconPreview renderIcon={props => <Audiotrack {...props} />} />
        );
      case 'json':
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
