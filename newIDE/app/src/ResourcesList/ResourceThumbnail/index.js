// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import { type ResourceKind } from '../ResourceSource';
import ImageThumbnail from './ImageThumbnail';

type Props = {|
  project: gdProject,
  resourceName: string,
  resourcesLoader: typeof ResourcesLoader,
  style?: Object,
  selectable?: boolean,
  selected?: boolean,
  onSelect?: boolean => void,
  onContextMenu?: (number, number) => void,
|};

type State = {|
  resourceKind: ?ResourceKind,
|};

/**
 * Display the right thumbnail for any given resource of a project
 */
export default class ResourceThumbnail extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = this._loadFrom(props);
  }

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
          <ImageThumbnail
            project={this.props.project}
            resourceName={this.props.resourceName}
            resourcesLoader={this.props.resourcesLoader}
            style={this.props.style}
            selectable={this.props.selectable}
            selected={this.props.selected}
            onSelect={this.props.onSelect}
            onContextMenu={this.props.onContextMenu}
          />
        );
      default:
        return null;
    }
  }
}
