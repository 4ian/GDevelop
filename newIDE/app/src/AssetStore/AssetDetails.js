// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { Column, Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import Chip from '@material-ui/core/Chip';
import RaisedButton from '../UI/RaisedButton';
import {
  type AssetShortHeader,
  type Asset,
  type Author,
  type ObjectAsset,
  getAsset,
  isPixelArt,
} from '../Utils/GDevelopServices/Asset';
import LeftLoader from '../UI/LeftLoader';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import { type ResourceSource } from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { AssetStoreContext } from './AssetStoreContext';
import Link from '@material-ui/core/Link';
import Window from '../Utils/Window';
import Paper from '@material-ui/core/Paper';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import IconButton from '../UI/IconButton';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import ThemeContext from '../UI/Theme/ThemeContext';
import AnimationPreview from '../ObjectEditor/Editors/SpriteEditor/AnimationPreview';
import ScrollView from '../UI/ScrollView';

const FIXED_HEIGHT = 250;

const styles = {
  previewBackground: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    width: 300,
    maxHeight: FIXED_HEIGHT,
  },
  chip: {
    marginBottom: 2,
    marginRight: 2,
  },
  previewImage: {
    position: 'relative',
    maxWidth: '100%',
    maxHeight: '100%',
    verticalAlign: 'middle',
    pointerEvents: 'none',
  },
  arrowContainer: {
    padding: 6,
  },
  // The left arrow SVG icon from Material-UI is not centered.
  leftArrowSvg: {
    transform: 'translateX(5px)',
  },
};

const makeFirstLetterUppercase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  objectsContainer: gdObjectsContainer,
  resourceSources: Array<ResourceSource>,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  onTagSelection: (tag: string) => void,

  assetShortHeader: AssetShortHeader,
  onAdd: () => void,
  onClose: () => void,
  canInstall: boolean,
  isBeingInstalled: boolean,
|};

const getObjectAssetResourcesByName = (
  objectAsset: ObjectAsset
): { [string]: any /*(serialized gdResource)*/ } => {
  const resourcesByName = {};

  objectAsset.resources.forEach(resource => {
    resourcesByName[resource.name] = resource;
  });

  return resourcesByName;
};

export const AssetDetails = ({
  project,
  layout,
  objectsContainer,
  resourceSources,
  resourceExternalEditors,
  onTagSelection,
  assetShortHeader,
  onAdd,
  onClose,
  canInstall,
  isBeingInstalled,
}: Props) => {
  const gdevelopTheme = React.useContext(ThemeContext);
  const { authors, licenses } = React.useContext(AssetStoreContext);
  const [asset, setAsset] = React.useState<?Asset>(null);
  const [isAssetAdded, setIsAssetAdded] = React.useState<boolean>(false);
  const [
    selectedAnimationName,
    setSelectedAnimationName,
  ] = React.useState<?string>(null);
  const [error, setError] = React.useState<?Error>(null);
  const loadAsset = React.useCallback(
    () => {
      (async () => {
        try {
          const loadedAsset = await getAsset(assetShortHeader);
          setAsset(loadedAsset);
          if (loadedAsset.objectType === 'sprite') {
            // Only sprites have animations and we select the first one.
            const firstAnimationName =
              loadedAsset.objectAssets[0].object.animations[0].name;
            setSelectedAnimationName(firstAnimationName);
          }
        } catch (error) {
          console.error('Error while loading asset:', error);
          setError(error);
        }
      })();
    },
    [assetShortHeader]
  );

  const isImageResourceSmooth = React.useMemo(
    () => !isPixelArt(assetShortHeader),
    [assetShortHeader]
  );

  React.useEffect(
    () => {
      loadAsset();
    },
    [loadAsset]
  );

  const canAddAsset =
    canInstall && !isBeingInstalled && !!asset && !isAssetAdded;
  const onAddAsset = React.useCallback(
    () => {
      if (canAddAsset) onAdd();
      setIsAssetAdded(true);
    },
    [onAdd, canAddAsset, setIsAssetAdded]
  );

  const assetAuthors: ?Array<Author> =
    asset && authors
      ? asset.authors
          .map(authorName => {
            return authors.find(({ name }) => name === authorName);
          })
          .filter(Boolean)
      : [];
  const assetLicense =
    asset && licenses
      ? licenses.find(({ name }) => name === asset.license)
      : null;

  // For sprite animations.
  const assetResources =
    asset && asset.objectAssets[0]
      ? getObjectAssetResourcesByName(asset.objectAssets[0])
      : {};
  const assetAnimations = asset
    ? asset.objectAssets[0].object.animations
    : null;
  const animation = assetAnimations
    ? assetAnimations.find(({ name }) => name === selectedAnimationName)
    : null;
  const direction = animation ? animation.directions[0] : null;
  const animationResources =
    asset && direction
      ? direction.sprites.map(sprite => assetResources[sprite.image])
      : null;

  return (
    <ScrollView>
      <Column expand noMargin>
        <Line justifyContent="space-between" noMargin>
          <Column>
            <Line alignItems="center" noMargin>
              <Text size="title" displayInlineAsSpan>
                {assetShortHeader.name}
              </Text>
              <Spacer />
              {asset && (
                <Text size="body">
                  <Trans>by</Trans>{' '}
                  {!!assetAuthors &&
                    assetAuthors.map(author => {
                      return (
                        <Link
                          key={author.name}
                          component="button"
                          onClick={() => {
                            Window.openExternalURL(author.website);
                          }}
                        >
                          {author.name}
                        </Link>
                      );
                    })}
                </Text>
              )}
            </Line>
            <Line alignItems="center">
              <div style={{ flexWrap: 'wrap' }}>
                {assetShortHeader.tags.slice(0, 5).map((tag, index) => (
                  <React.Fragment key={tag}>
                    {index !== 0 && <Spacer />}
                    <Chip
                      size="small"
                      style={styles.chip}
                      label={makeFirstLetterUppercase(tag)}
                      onClick={() => {
                        onTagSelection(tag);
                      }}
                    />
                  </React.Fragment>
                ))}
                {assetShortHeader.tags.length > 5 && (
                  <>
                    <Spacer />
                    <Chip
                      size="small"
                      style={styles.chip}
                      label={
                        <Trans>
                          + {assetShortHeader.tags.length - 5} tag(s)
                        </Trans>
                      }
                    />
                  </>
                )}
              </div>
            </Line>
          </Column>
          <Column alignItems="center" justifyContent="center">
            <LeftLoader
              isLoading={isBeingInstalled || (!asset && !error)}
              key="install"
            >
              <RaisedButton
                primary
                label={
                  isBeingInstalled ? (
                    <Trans>Adding to my project...</Trans>
                  ) : isAssetAdded ? (
                    <Trans>Object added to my project</Trans>
                  ) : (
                    <Trans>Add object to my project</Trans>
                  )
                }
                onClick={onAddAsset}
                disabled={!canAddAsset}
                id="add-asset-button"
              />
            </LeftLoader>
          </Column>
        </Line>
        <ResponsiveLineStackLayout noMargin>
          <Column>
            <div style={styles.previewBackground}>
              {asset ? (
                <>
                  {asset.objectType === 'sprite' &&
                    animationResources &&
                    direction && (
                      <AnimationPreview
                        resourceNames={animationResources.map(
                          ({ name }) => name
                        )}
                        getImageResourceSource={(resourceName: string) => {
                          const resource = assetResources[resourceName];
                          return resource ? resource.file : '';
                        }}
                        isImageResourceSmooth={() => isImageResourceSmooth}
                        project={project}
                        timeBetweenFrames={direction.timeBetweenFrames}
                        isLooping // Always loop in the asset store.
                        hideCheckeredBackground
                        hideControls
                        initialZoom={140 / Math.max(asset.width, asset.height)}
                        fixedHeight={FIXED_HEIGHT}
                      />
                    )}
                  {(asset.objectType === 'tiled' ||
                    asset.objectType === '9patch') && (
                    <CorsAwareImage
                      style={styles.previewImage}
                      src={asset.previewImageUrls[0]}
                      alt={asset.name}
                    />
                  )}
                </>
              ) : (
                <PlaceholderLoader />
              )}
            </div>
            {assetAnimations &&
              assetAnimations.length > 1 &&
              typeof selectedAnimationName === 'string' && (
                <Paper
                  elevation={4}
                  variant="outlined"
                  style={{
                    backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
                  }}
                >
                  <Line justifyContent="center" alignItems="center" noMargin>
                    <div style={styles.arrowContainer}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const previousAnimationIndex = assetAnimations.findIndex(
                            ({ name }) => name === selectedAnimationName
                          );
                          const newAnimationIndex =
                            previousAnimationIndex === 0
                              ? assetAnimations.length - 1
                              : previousAnimationIndex - 1;
                          setSelectedAnimationName(
                            assetAnimations[newAnimationIndex].name
                          );
                        }}
                      >
                        <ArrowBackIos style={styles.leftArrowSvg} />
                      </IconButton>
                    </div>

                    <SelectField
                      value={selectedAnimationName}
                      onChange={(e, i, newAnimationName: string) => {
                        setSelectedAnimationName(newAnimationName);
                      }}
                      fullWidth
                      textAlign="center"
                      disableUnderline
                    >
                      {assetAnimations.map(animation => (
                        <SelectOption
                          key={animation.name}
                          value={animation.name}
                          primaryText={
                            makeFirstLetterUppercase(animation.name) ||
                            t`Default` // Display default for animations with no name.
                          }
                        />
                      ))}
                    </SelectField>
                    <div style={styles.arrowContainer}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const previousAnimationIndex = assetAnimations.findIndex(
                            ({ name }) => name === selectedAnimationName
                          );
                          const newAnimationIndex =
                            previousAnimationIndex ===
                            assetAnimations.length - 1
                              ? 0
                              : previousAnimationIndex + 1;
                          setSelectedAnimationName(
                            assetAnimations[newAnimationIndex].name
                          );
                        }}
                      >
                        <ArrowForwardIos />
                      </IconButton>
                    </div>
                  </Line>
                </Paper>
              )}
          </Column>
          <Column expand>
            {asset ? (
              <React.Fragment>
                <Text size="body">
                  {!!assetLicense && (
                    <Trans>
                      Type of License:{' '}
                      {
                        <Link
                          component="button"
                          onClick={() => {
                            Window.openExternalURL(assetLicense.website);
                          }}
                        >
                          {assetLicense.name}
                        </Link>
                      }
                    </Trans>
                  )}
                </Text>
                <Text size="body">{asset.description}</Text>
              </React.Fragment>
            ) : error ? (
              <PlaceholderError onRetry={loadAsset}>
                <Trans>
                  Error while loading the asset. Verify your internet connection
                  or try again later.
                </Trans>
              </PlaceholderError>
            ) : (
              <PlaceholderLoader />
            )}
          </Column>
        </ResponsiveLineStackLayout>
      </Column>
    </ScrollView>
  );
};
