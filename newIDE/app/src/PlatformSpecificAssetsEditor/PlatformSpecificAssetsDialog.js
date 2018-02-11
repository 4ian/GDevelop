// @flow
import * as React from 'react';
import path from 'path';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from '../UI/Dialog';
import { Line } from '../UI/Grid';
import ResourcesLoader from '../ObjectsRendering/ResourcesLoader';
import ResourceSelectorWithThumbnail from '../ObjectEditor/ResourceSelectorWithThumbnail';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { resizeImage } from './ImageResizer';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { burstCache } from '../Utils/CacheBuster';
const gd = global.gd;

type Props = {|
  project: gdProject,
  open: boolean,
  onClose: Function,
  onApply: Function,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
|};

type State = {|
  androidIconResourceNames: Array<string>,
  iosIconResourceNames: Array<string>,
|};

const androidSizes = [192, 144, 96, 72, 48, 36];
const iosSizes = [
  180,
  167,
  167,
  152,
  144,
  120,
  114,
  100,
  80,
  76,
  72,
  60,
  58,
  57,
  50,
  40,
  29,
];

export default class PlatformSpecificAssetsDialog extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = this._loadFrom(props.project);
  }

  _loadFrom(project: gdProject): State {
    return {
      androidIconResourceNames: androidSizes.map(size =>
        project.getPlatformSpecificAssets().get('android', `icon-${size}`)
      ),
      iosIconResourceNames: iosSizes.map(size =>
        project.getPlatformSpecificAssets().get('ios', `icon-${size}`)
      ),
    };
  }

  componentWillReceiveProps(newProps: Props) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.project !== newProps.project)
    ) {
      this.setState(this._loadFrom(newProps.project));
    }
  }

  _generateFromFile = () => {
    const { project, resourceSources, onChooseResource } = this.props;

    const sources = resourceSources.filter(source => source.kind === 'image');
    if (!sources.length) return;

    onChooseResource(sources[0].name, false).then(resources => {
      if (!resources.length) {
        return;
      }

      const resourcesManager = project.getResourcesManager();
      const projectPath = path.dirname(project.getProjectFile());
      const fullPath = path.resolve(projectPath, resources[0].getFile());

      Promise.all([
        ...androidSizes.map(size =>
          resizeImage(
            fullPath,
            path.join(projectPath, `android-icon-${size}.png`),
            {
              width: size,
              height: size,
            }
          )
        ),
        ...iosSizes.map(size =>
          resizeImage(
            fullPath,
            path.join(projectPath, `ios-icon-${size}.png`),
            {
              width: size,
              height: size,
            }
          )
        ),
      ]).then(results => {
        if (results.indexOf(false) !== -1) {
          showErrorBox('Some icons could not be generated!');
          return;
        }

        const createOrUpdateResource = name => {
          if (!resourcesManager.hasResource(name)) {
            const imageResource = new gd.ImageResource();
            imageResource.setFile(name);
            imageResource.setName(name);

            resourcesManager.addResource(imageResource);
            imageResource.delete();
          } else {
            resourcesManager.getResource(name).setFile(name);
          }
        };

        androidSizes.forEach(size =>
          createOrUpdateResource(`android-icon-${size}.png`)
        );
        iosSizes.forEach(size =>
          createOrUpdateResource(`ios-icon-${size}.png`)
        );

        burstCache();
        setTimeout(() => {
          this.setState({
            androidIconResourceNames: androidSizes.map(
              size => `android-icon-${size}.png`
            ),
            iosIconResourceNames: iosSizes.map(size => `ios-icon-${size}.png`),
          });
        }, 200 /* Let a bit of time so that image files can be found */);
      });
    });
  };

  _onApply = () => {
    const { project } = this.props;
    const { androidIconResourceNames, iosIconResourceNames } = this.state;

    androidSizes.forEach((size, index) => {
      project
        .getPlatformSpecificAssets()
        .set('android', `icon-${size}`, androidIconResourceNames[index]);
    });
    iosSizes.forEach((size, index) => {
      project
        .getPlatformSpecificAssets()
        .set('ios', `icon-${size}`, iosIconResourceNames[index]);
    });

    this.props.onApply();
  };

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onClick={this.props.onClose}
      />,
      <FlatButton
        label="Apply"
        primary={true}
        keyboardFocused={true}
        onClick={this._onApply}
      />,
    ];
    const { project, resourceSources, onChooseResource } = this.props;
    const { androidIconResourceNames, iosIconResourceNames } = this.state;

    return (
      <Dialog
        actions={actions}
        open={this.props.open}
        onRequestClose={this.props.onClose}
        autoScrollBodyContent
      >
        <Line justifyContent="center">
          <RaisedButton
            primary
            label="Generate icons from a file"
            onClick={this._generateFromFile}
          />
        </Line>
        <p>Android icons:</p>
        {androidSizes.map((size, index) => (
          <ResourceSelectorWithThumbnail
            key={size}
            floatingLabelText={`Android icon (${size}x${size} px)`}
            project={project}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceKind="image"
            resourceName={androidIconResourceNames[index]}
            resourcesLoader={ResourcesLoader}
            onChange={resourceName => {
              const newIcons = [...androidIconResourceNames];
              newIcons[index] = resourceName;
              this.setState({
                androidIconResourceNames: newIcons,
              });
            }}
          />
        ))}
        <p>iOS (iPhone and iPad) icons:</p>
        {iosSizes.map((size, index) => (
          <ResourceSelectorWithThumbnail
            key={size}
            floatingLabelText={`iOS icon (${size}x${size} px)`}
            project={project}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceKind="image"
            resourceName={iosIconResourceNames[index]}
            resourcesLoader={ResourcesLoader}
            onChange={resourceName => {
              const newIcons = [...iosIconResourceNames];
              newIcons[index] = resourceName;
              this.setState({
                iosIconResourceNames: newIcons,
              });
            }}
          />
        ))}
      </Dialog>
    );
  }
}
