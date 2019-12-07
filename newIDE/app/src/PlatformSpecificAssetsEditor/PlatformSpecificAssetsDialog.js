// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import Dialog from '../UI/Dialog';
import { Line } from '../UI/Grid';
import ResourcesLoader from '../ResourcesLoader';
import ResourceSelectorWithThumbnail from '../ResourcesList/ResourceSelectorWithThumbnail';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { resizeImage, isResizeSupported } from './ImageResizer';
import { showErrorBox } from '../UI/Messages/MessageBox';
import optionalRequire from '../Utils/OptionalRequire';
import Text from '../UI/Text';
const path = optionalRequire('path');
const gd = global.gd;

type Props = {|
  project: gdProject,
  open: boolean,
  onClose: Function,
  onApply: Function,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
|};

type State = {|
  desktopIconResourceNames: Array<string>,
  androidIconResourceNames: Array<string>,
  iosIconResourceNames: Array<string>,
|};

const desktopSizes = [512];
const androidSizes = [192, 144, 96, 72, 48, 36];
const iosSizes = [
  180,
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
      desktopIconResourceNames: desktopSizes.map(size =>
        project.getPlatformSpecificAssets().get('desktop', `icon-${size}`)
      ),
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
      if (!resources.length || !path) {
        return;
      }

      const resourcesManager = project.getResourcesManager();
      const projectPath = path.dirname(project.getProjectFile());
      const fullPath = path.resolve(projectPath, resources[0].getFile());

      // Important, we are responsible for deleting the resources that were given to us.
      // Otherwise we have a memory leak.
      resources.forEach(resource => resource.delete());

      Promise.all([
        ...desktopSizes.map(size =>
          resizeImage(
            fullPath,
            path.join(projectPath, `desktop-icon-${size}.png`),
            {
              width: size,
              height: size,
            }
          )
        ),
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

        // Add resources to the game
        const allResourcesNames = [
          ...desktopSizes.map(size => `desktop-icon-${size}.png`),
          ...androidSizes.map(size => `android-icon-${size}.png`),
          ...iosSizes.map(size => `ios-icon-${size}.png`),
        ];
        allResourcesNames.forEach(resourceName => {
          if (!resourcesManager.hasResource(resourceName)) {
            const imageResource = new gd.ImageResource();
            imageResource.setFile(resourceName);
            imageResource.setName(resourceName);

            resourcesManager.addResource(imageResource);

            // Important, we are responsible for deleting the resources that we created
            // Otherwise we have a memory leak, as calling addResource is making a copy of the resource.
            imageResource.delete();
          } else {
            resourcesManager.getResource(resourceName).setFile(resourceName);
          }
        });

        // Make sure the resources are (re)loaded.
        ResourcesLoader.burstUrlsCacheForResources(project, allResourcesNames);
        setTimeout(() => {
          this.setState({
            desktopIconResourceNames: desktopSizes.map(
              size => `desktop-icon-${size}.png`
            ),
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
    const {
      desktopIconResourceNames,
      androidIconResourceNames,
      iosIconResourceNames,
    } = this.state;

    desktopSizes.forEach((size, index) => {
      project
        .getPlatformSpecificAssets()
        .set('desktop', `icon-${size}`, desktopIconResourceNames[index]);
    });
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
        key="cancel"
        label={<Trans>Cancel</Trans>}
        primary={false}
        onClick={this.props.onClose}
      />,
      <FlatButton
        key="apply"
        label={<Trans>Apply</Trans>}
        primary={true}
        keyboardFocused={true}
        onClick={this._onApply}
      />,
    ];
    const {
      project,
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
    } = this.props;
    const {
      desktopIconResourceNames,
      androidIconResourceNames,
      iosIconResourceNames,
    } = this.state;

    return (
      <Dialog
        title={<Trans>Project icons</Trans>}
        actions={actions}
        open={this.props.open}
        onRequestClose={this.props.onClose}
      >
        <Line justifyContent="center">
          {isResizeSupported() ? (
            <RaisedButton
              primary
              label={<Trans>Generate icons from a file</Trans>}
              onClick={this._generateFromFile}
            />
          ) : (
            <Text>
              <Trans>
                Download GDevelop desktop version to generate the Android and
                iOS icons of your game.
              </Trans>
            </Text>
          )}
        </Line>
        <Text>
          <Trans>Desktop (Windows, macOS and Linux) icon:</Trans>
        </Text>
        {desktopSizes.map((size, index) => (
          <ResourceSelectorWithThumbnail
            key={size}
            floatingLabelText={`Desktop icon (${size}x${size} px)`}
            project={project}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceExternalEditors={resourceExternalEditors}
            resourceKind="image"
            resourceName={desktopIconResourceNames[index]}
            onChange={resourceName => {
              const newIcons = [...desktopIconResourceNames];
              newIcons[index] = resourceName;
              this.setState({
                desktopIconResourceNames: newIcons,
              });
            }}
          />
        ))}
        <Text>
          <Trans>Android icons:</Trans>
        </Text>
        {androidSizes.map((size, index) => (
          <ResourceSelectorWithThumbnail
            key={size}
            floatingLabelText={`Android icon (${size}x${size} px)`}
            project={project}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceExternalEditors={resourceExternalEditors}
            resourceKind="image"
            resourceName={androidIconResourceNames[index]}
            onChange={resourceName => {
              const newIcons = [...androidIconResourceNames];
              newIcons[index] = resourceName;
              this.setState({
                androidIconResourceNames: newIcons,
              });
            }}
          />
        ))}
        <Text>
          <Trans>iOS (iPhone and iPad) icons:</Trans>
        </Text>
        {iosSizes.map((size, index) => (
          <ResourceSelectorWithThumbnail
            key={size}
            floatingLabelText={`iOS icon (${size}x${size} px)`}
            project={project}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceKind="image"
            resourceName={iosIconResourceNames[index]}
            resourceExternalEditors={resourceExternalEditors}
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
