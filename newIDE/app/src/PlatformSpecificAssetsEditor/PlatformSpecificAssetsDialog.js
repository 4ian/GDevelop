// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { Line } from '../UI/Grid';
import ResourcesLoader from '../ResourcesLoader';
import ResourceSelectorWithThumbnail from '../ResourcesList/ResourceSelectorWithThumbnail';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { resizeImage } from './ImageResizer';
import { showErrorBox } from '../UI/Messages/MessageBox';
import Text from '../UI/Text';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import AlertMessage from '../UI/AlertMessage';
import ErrorBoundary from '../UI/ErrorBoundary';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  open: boolean,
  onClose: Function,
  onApply: Function,
  resourceManagementProps: ResourceManagementProps,
|};

type State = {|
  thumbnailResourceName: string,
  desktopIconResourceNames: Array<string>,
  androidIconResourceNames: Array<string>,
  androidWindowSplashScreenAnimatedIconResourceName: string,
  iosIconResourceNames: Array<string>,
  displayGamesPlatformThumbnailWarning: boolean,
|};

const desktopSizes = [512];
const androidSizes = [192, 144, 96, 72, 48, 36];
/**
 * The recommended size for the image containing the Android SplashScreen icon.
 * It's based on the recommended 288dp for a xxdpi (=480 dpi) screen, which results in
 * 288 * 480 / 160 = "288 @ 3x" = 864px.
 */
const androidWindowSplashScreenAnimatedIconRecommendedSize = 864;
const iosSizes = [
  1024,
  180,
  167,
  152,
  144,
  120,
  114,
  100,
  87,
  80,
  76,
  72,
  60,
  58,
  57,
  50,
  40,
  29,
  20,
];

class PlatformSpecificAssetsDialog extends React.Component<Props, State> {
  inputRef: HTMLInputElement | null = null;

  constructor(props: Props) {
    super(props);
    this.state = this._loadFrom(props.project);
  }

  _loadFrom(project: gdProject): State {
    const platformSpecificAssets = project.getPlatformSpecificAssets();
    return {
      thumbnailResourceName: platformSpecificAssets.get('liluo', 'thumbnail'),
      desktopIconResourceNames: desktopSizes.map(size =>
        platformSpecificAssets.get('desktop', `icon-${size}`)
      ),
      androidIconResourceNames: androidSizes.map(size =>
        platformSpecificAssets.get('android', `icon-${size}`)
      ),
      androidWindowSplashScreenAnimatedIconResourceName: project
        .getPlatformSpecificAssets()
        .get('android', `windowSplashScreenAnimatedIcon`),
      iosIconResourceNames: iosSizes.map(size =>
        platformSpecificAssets.get('ios', `icon-${size}`)
      ),
      displayGamesPlatformThumbnailWarning: false,
    };
  }

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.project !== newProps.project)
    ) {
      this.setState(this._loadFrom(newProps.project));
    }
  }

  _generateFromFile = async e => {
    if (!this.inputRef || !this.inputRef.files || !this.inputRef.files[0]) {
      console.error("Could't find selected file. Aborting icon generation.");
      return;
    }
    const chosenFileAsBlobDataUrl = URL.createObjectURL(this.inputRef.files[0]);
    const { project, resourceManagementProps } = this.props;

    const resourcesManager = project.getResourcesManager();

    try {
      const results = await Promise.all([
        ...desktopSizes.map(async size => ({
          resourceName: `desktop-icon-${size}.png`,
          blobDataUrl: await resizeImage(chosenFileAsBlobDataUrl, {
            width: size,
            height: size,
          }),
        })),
        ...androidSizes.map(async size => ({
          resourceName: `android-icon-${size}.png`,
          blobDataUrl: await resizeImage(chosenFileAsBlobDataUrl, {
            width: size,
            height: size,
          }),
        })),
        (async () => ({
          resourceName: 'android-windowSplashScreenAnimatedIcon.png',
          blobDataUrl: await resizeImage(chosenFileAsBlobDataUrl, {
            width: androidWindowSplashScreenAnimatedIconRecommendedSize,
            height: androidWindowSplashScreenAnimatedIconRecommendedSize,
            transparentBorderSize:
              androidWindowSplashScreenAnimatedIconRecommendedSize / 6,
          }),
        }))(),
        ...iosSizes.map(async size => ({
          resourceName: `ios-icon-${size}.png`,
          blobDataUrl: await resizeImage(chosenFileAsBlobDataUrl, {
            width: size,
            height: size,
          }),
        })),
      ]);

      results.forEach(({ resourceName, blobDataUrl }) => {
        if (!resourcesManager.hasResource(resourceName)) {
          const imageResource = new gd.ImageResource();
          imageResource.setFile(blobDataUrl);
          imageResource.setName(resourceName);

          resourcesManager.addResource(imageResource);

          // Important, we are responsible for deleting the resources that we created
          // Otherwise we have a memory leak, as calling addResource is making a copy of the resource.
          imageResource.delete();
        } else {
          resourcesManager.getResource(resourceName).setFile(blobDataUrl);
        }
      });

      await resourceManagementProps.onFetchNewlyAddedResources();

      // Make sure the resources are (re)loaded.
      ResourcesLoader.burstUrlsCacheForResources(
        project,
        results.map(({ resourceName }) => resourceName)
      );
      setTimeout(() => {
        this.setState({
          desktopIconResourceNames: desktopSizes.map(
            size => `desktop-icon-${size}.png`
          ),
          androidIconResourceNames: androidSizes.map(
            size => `android-icon-${size}.png`
          ),
          androidWindowSplashScreenAnimatedIconResourceName:
            'android-windowSplashScreenAnimatedIcon.png',
          iosIconResourceNames: iosSizes.map(size => `ios-icon-${size}.png`),
        });
      }, 200 /* Let a bit of time so that image files can be found */);
    } catch (e) {
      showErrorBox({
        message: 'Some icons could not be generated.',
        rawError: undefined,
        errorId: 'icon-generation-error',
        doNotReport: true,
      });
    } finally {
      // Reset input value so that if the user selects the same file again,
      // the onChange callback is called.
      if (this.inputRef) {
        this.inputRef.value = '';
      }
    }
  };

  onApply = () => {
    const { project } = this.props;
    const {
      thumbnailResourceName,
      desktopIconResourceNames,
      androidIconResourceNames,
      androidWindowSplashScreenAnimatedIconResourceName,
      iosIconResourceNames,
    } = this.state;

    const platformSpecificAssets = project.getPlatformSpecificAssets();

    platformSpecificAssets.set('liluo', `thumbnail`, thumbnailResourceName);

    desktopSizes.forEach((size, index) => {
      platformSpecificAssets.set(
        'desktop',
        `icon-${size}`,
        desktopIconResourceNames[index]
      );
    });
    androidSizes.forEach((size, index) => {
      platformSpecificAssets.set(
        'android',
        `icon-${size}`,
        androidIconResourceNames[index]
      );
    });
    platformSpecificAssets.set(
      'android',
      `windowSplashScreenAnimatedIcon`,
      androidWindowSplashScreenAnimatedIconResourceName
    );
    iosSizes.forEach((size, index) => {
      platformSpecificAssets.set(
        'ios',
        `icon-${size}`,
        iosIconResourceNames[index]
      );
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
      <DialogPrimaryButton
        key="apply"
        label={<Trans>Apply</Trans>}
        primary={true}
        onClick={this.onApply}
      />,
    ];
    const { project, resourceManagementProps } = this.props;
    const {
      thumbnailResourceName,
      desktopIconResourceNames,
      androidIconResourceNames,
      androidWindowSplashScreenAnimatedIconResourceName,
      iosIconResourceNames,
      displayGamesPlatformThumbnailWarning,
    } = this.state;

    return (
      <Dialog
        title={<Trans>Project icons</Trans>}
        actions={actions}
        open={this.props.open}
        onRequestClose={this.props.onClose}
        onApply={this.onApply}
      >
        <ColumnStackLayout noMargin>
          <ResponsiveLineStackLayout
            alignItems="center"
            noMargin
            noColumnMargin
          >
            <Text noMargin>
              <Trans>Generate icons from a file:</Trans>
            </Text>
            <input
              type="file"
              onChange={this._generateFromFile}
              ref={_inputRef => (this.inputRef = _inputRef)}
            />
          </ResponsiveLineStackLayout>
          <Text size="sub-title">
            <Trans>gd.games thumbnail</Trans>
          </Text>
          <ResourceSelectorWithThumbnail
            floatingLabelText={`gd.games thumbnail (1920x1080 px)`}
            project={project}
            resourceManagementProps={resourceManagementProps}
            resourceKind="image"
            resourceName={thumbnailResourceName}
            defaultNewResourceName={'Thumbnail'}
            onChange={resourceName => {
              this.setState({
                thumbnailResourceName: resourceName,
                displayGamesPlatformThumbnailWarning:
                  resourceName !== this.state.thumbnailResourceName,
              });
            }}
          />
          {displayGamesPlatformThumbnailWarning ? (
            <Line>
              <AlertMessage kind="warning">
                <Trans>
                  You're about to change the thumbnail displayed on gd.games for
                  your game. Once you have applied changes here, you will then
                  need to publish a new version of your game on gd.games so that
                  this new thumbnail is used.
                </Trans>
              </AlertMessage>
            </Line>
          ) : null}
          <Text size="sub-title">
            <Trans>Desktop (Windows, macOS and Linux) icon</Trans>
          </Text>
          {desktopSizes.map((size, index) => (
            <ResourceSelectorWithThumbnail
              key={size}
              floatingLabelText={`Desktop icon (${size}x${size} px)`}
              project={project}
              resourceManagementProps={resourceManagementProps}
              resourceKind="image"
              resourceName={desktopIconResourceNames[index]}
              defaultNewResourceName={'DesktopIcon' + size}
              onChange={resourceName => {
                const newIcons = [...desktopIconResourceNames];
                newIcons[index] = resourceName;
                this.setState({
                  desktopIconResourceNames: newIcons,
                });
              }}
            />
          ))}
          <Text size="sub-title">
            <Trans>Android icons and Android 12+ splashscreen</Trans>
          </Text>
          <I18n>
            {({ i18n }) => (
              <ResourceSelectorWithThumbnail
                floatingLabelText={`Android 12+ splashscreen icon (576x576 px)`}
                project={project}
                resourceManagementProps={resourceManagementProps}
                resourceKind="image"
                resourceName={androidWindowSplashScreenAnimatedIconResourceName}
                defaultNewResourceName={'AndroidSplashscreenIcon'}
                onChange={resourceName => {
                  this.setState({
                    androidWindowSplashScreenAnimatedIconResourceName: resourceName,
                  });
                }}
                helperMarkdownText={i18n._(
                  t`The image should be at least 864x864px, and the logo must fit [within a circle of 576px](https://developer.android.com/guide/topics/ui/splash-screen#splash_screen_dimensions). Transparent borders are automatically added when generated to help ensuring this.`
                )}
              />
            )}
          </I18n>
          {androidSizes.map((size, index) => (
            <ResourceSelectorWithThumbnail
              key={size}
              floatingLabelText={`Android icon (${size}x${size} px)`}
              project={project}
              resourceManagementProps={resourceManagementProps}
              resourceKind="image"
              resourceName={androidIconResourceNames[index]}
              defaultNewResourceName={'AndroidIcon' + size}
              onChange={resourceName => {
                const newIcons = [...androidIconResourceNames];
                newIcons[index] = resourceName;
                this.setState({
                  androidIconResourceNames: newIcons,
                });
              }}
            />
          ))}
          <Text size="sub-title">
            <Trans>iOS (iPhone and iPad) icons</Trans>
          </Text>
          {iosSizes.map((size, index) => (
            <ResourceSelectorWithThumbnail
              key={size}
              floatingLabelText={`iOS icon (${size}x${size} px)`}
              project={project}
              resourceManagementProps={resourceManagementProps}
              resourceKind="image"
              resourceName={iosIconResourceNames[index]}
              defaultNewResourceName={'IosIcon' + size}
              onChange={resourceName => {
                const newIcons = [...iosIconResourceNames];
                newIcons[index] = resourceName;
                this.setState({
                  iosIconResourceNames: newIcons,
                });
              }}
            />
          ))}
        </ColumnStackLayout>
      </Dialog>
    );
  }
}

const PlatformSpecificAssetsDialogWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Project icons</Trans>}
    scope="project-icons"
    onClose={props.onClose}
    showOnTop
  >
    <PlatformSpecificAssetsDialog {...props} />
  </ErrorBoundary>
);

export default PlatformSpecificAssetsDialogWithErrorBoundary;
