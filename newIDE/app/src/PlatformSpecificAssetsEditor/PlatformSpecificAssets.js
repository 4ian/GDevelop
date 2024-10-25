// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';

import * as React from 'react';
import ResourcesLoader from '../ResourcesLoader';
import ResourceSelectorWithThumbnail from '../ResourcesList/ResourceSelectorWithThumbnail';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { resizeImage } from './ImageResizer';
import Text from '../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import ErrorBoundary from '../UI/ErrorBoundary';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import RaisedButton from '../UI/RaisedButton';
import AlertMessage from '../UI/AlertMessage';

const gd: libGDevelop = global.gd;

export const desktopIconSizes = [512];
export const androidIconSizes = [192, 144, 96, 72, 48, 36];
/**
 * The recommended size for the image containing the Android SplashScreen icon.
 * It's based on the recommended 288dp for a xxdpi (=480 dpi) screen, which results in
 * 288 * 480 / 160 = "288 @ 3x" = 864px.
 */
export const androidWindowSplashScreenAnimatedIconRecommendedSize = 864;
export const iosIconSizes = [
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

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  desktopIconResourceNames: Array<string>,
  onDesktopIconResourceNamesChanged: (Array<string>) => void,
  androidIconResourceNames: Array<string>,
  onAndroidIconResourceNamesChanged: (Array<string>) => void,
  androidWindowSplashScreenAnimatedIconResourceName: string,
  onAndroidWindowSplashScreenAnimatedIconResourceNameChanged: string => void,
  iosIconResourceNames: Array<string>,
  onIosIconResourceNamesChanged: (Array<string>) => void,
|};

const PlatformSpecificAssets = ({
  project,
  resourceManagementProps,
  desktopIconResourceNames,
  onDesktopIconResourceNamesChanged,
  androidIconResourceNames,
  onAndroidIconResourceNamesChanged,
  androidWindowSplashScreenAnimatedIconResourceName,
  onAndroidWindowSplashScreenAnimatedIconResourceNameChanged,
  iosIconResourceNames,
  onIosIconResourceNamesChanged,
}: Props) => {
  const { showAlert } = useAlertDialog();
  const generateIconFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);

  const generateFromFile = async () => {
    if (
      !generateIconFileInputRef.current ||
      !generateIconFileInputRef.current.files ||
      !generateIconFileInputRef.current.files[0]
    ) {
      console.error("Could't find selected file. Aborting icon generation.");
      return;
    }
    const chosenFileAsBlobDataUrl = URL.createObjectURL(
      generateIconFileInputRef.current.files[0]
    );
    const resourcesManager = project.getResourcesManager();

    try {
      setIsLoading(true);
      const results = await Promise.all([
        ...desktopIconSizes.map(async size => ({
          resourceName: `desktop-icon-${size}.png`,
          blobDataUrl: await resizeImage(chosenFileAsBlobDataUrl, {
            width: size,
            height: size,
          }),
        })),
        ...androidIconSizes.map(async size => ({
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
        ...iosIconSizes.map(async size => ({
          resourceName: `ios-icon-${size}.png`,
          blobDataUrl: await resizeImage(chosenFileAsBlobDataUrl, {
            width: size,
            height: size,
          }),
        })),
      ]);

      results.forEach(({ resourceName, blobDataUrl }) => {
        const metadata = JSON.stringify({
          extension: '.png',
          // Used in local app to define the path where to save the image on
          // the file system.
          localFilePath: `./assets/${resourceName}`,
        });
        if (!resourcesManager.hasResource(resourceName)) {
          const imageResource = new gd.ImageResource();
          imageResource.setFile(blobDataUrl);
          imageResource.setName(resourceName);
          imageResource.setMetadata(metadata);

          resourcesManager.addResource(imageResource);

          // Important, we are responsible for deleting the resources that we created
          // Otherwise we have a memory leak, as calling addResource is making a copy of the resource.
          imageResource.delete();
        } else {
          resourcesManager.getResource(resourceName).setFile(blobDataUrl);
          resourcesManager.getResource(resourceName).setMetadata(metadata);
        }
      });

      await resourceManagementProps.onFetchNewlyAddedResources();

      // Make sure the resources are (re)loaded.
      ResourcesLoader.burstUrlsCacheForResources(
        project,
        results.map(({ resourceName }) => resourceName)
      );
      setTimeout(() => {
        onDesktopIconResourceNamesChanged(
          desktopIconSizes.map(size => `desktop-icon-${size}.png`)
        );
        onAndroidIconResourceNamesChanged(
          androidIconSizes.map(size => `android-icon-${size}.png`)
        );
        onAndroidWindowSplashScreenAnimatedIconResourceNameChanged(
          'android-windowSplashScreenAnimatedIcon.png'
        );
        onIosIconResourceNamesChanged(
          iosIconSizes.map(size => `ios-icon-${size}.png`)
        );
        setIsLoading(false);
      }, 200 /* Let a bit of time so that image files can be found */);
    } catch (e) {
      showAlert({
        title: t`Some icons could not be generated.`,
        message: t`An error occurred while generating some icons. Verify that the image is valid and try again.`,
      });
      setIsLoading(false);
    } finally {
      // Revoke the blob URL to free memory.
      URL.revokeObjectURL(chosenFileAsBlobDataUrl);
      // Reset input value so that if the user selects the same file again,
      // the onChange callback is called.
      if (generateIconFileInputRef.current) {
        generateIconFileInputRef.current.value = '';
      }
    }
  };

  return (
    <ColumnStackLayout noMargin>
      <AlertMessage kind="info">
        <LineStackLayout alignItems="center" noMargin>
          <Trans>Generate all your icons from 1 file</Trans>
          <RaisedButton
            primary
            label={<Trans>Choose file</Trans>}
            disabled={isLoading}
            onClick={() => {
              if (generateIconFileInputRef.current) {
                generateIconFileInputRef.current.click();
              }
            }}
          />
        </LineStackLayout>
      </AlertMessage>
      <input
        type="file"
        onChange={generateFromFile}
        ref={generateIconFileInputRef}
        style={{ display: 'none' }}
      />
      <Text size="sub-title">
        <Trans>Desktop (Windows, macOS and Linux) icon</Trans>
      </Text>
      {desktopIconSizes.map((size, index) => (
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
            onDesktopIconResourceNamesChanged(newIcons);
          }}
          disabled={isLoading}
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
              onAndroidWindowSplashScreenAnimatedIconResourceNameChanged(
                resourceName
              );
            }}
            helperMarkdownText={i18n._(
              t`The image should be at least 864x864px, and the logo must fit [within a circle of 576px](https://developer.android.com/guide/topics/ui/splash-screen#splash_screen_dimensions). Transparent borders are automatically added when generated to help ensuring `
            )}
            disabled={isLoading}
          />
        )}
      </I18n>
      {androidIconSizes.map((size, index) => (
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
            onAndroidIconResourceNamesChanged(newIcons);
          }}
          disabled={isLoading}
        />
      ))}
      <Text size="sub-title">
        <Trans>iOS (iPhone and iPad) icons</Trans>
      </Text>
      {iosIconSizes.map((size, index) => (
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
            onIosIconResourceNamesChanged(newIcons);
          }}
          disabled={isLoading}
        />
      ))}
    </ColumnStackLayout>
  );
};

const PlatformSpecificAssetsWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Project icons</Trans>}
    scope="project-icons"
    showOnTop
  >
    <PlatformSpecificAssets {...props} />
  </ErrorBoundary>
);

export default PlatformSpecificAssetsWithErrorBoundary;
