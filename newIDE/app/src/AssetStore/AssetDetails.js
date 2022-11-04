// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { Column, Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import Chip from '../UI/Chip';
import {
  type AssetShortHeader,
  type Asset,
  type Author,
  type ObjectAsset,
  getPublicAsset,
  isPixelArt,
  isPrivateAsset,
} from '../Utils/GDevelopServices/Asset';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { AssetStoreContext } from './AssetStoreContext';
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
import { AssetCard } from './AssetCard';
import { SimilarAssetStoreSearchFilter } from './AssetStoreSearchFilter';
import EmptyMessage from '../UI/EmptyMessage';
import { BoxSearchResults } from '../UI/Search/BoxSearchResults';
import Link from '../UI/Link';
import PrivateAssetsAuthorizationContext from './PrivateAssets/PrivateAssetsAuthorizationContext';
import AuthorizedAssetImage from './PrivateAssets/AuthorizedAssetImage';
import { MarkdownText } from '../UI/MarkdownText';

const FIXED_HEIGHT = 250;
const FIXED_WIDTH = 300;

const styles = {
  previewBackground: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    width: FIXED_WIDTH,
    height: FIXED_HEIGHT,
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
  scrollView: {
    // This is needed to make the scroll view take the full height of the container,
    // allowing the Autosizer of the BoxSearchResults to be visible.
    display: 'flex',
  },
};

const makeFirstLetterUppercase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

type Props = {|
  project: gdProject,
  onTagSelection: (tag: string) => void,
  assetShortHeader: AssetShortHeader,
  onOpenDetails: (assetShortHeader: AssetShortHeader) => void,
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
  onTagSelection,
  assetShortHeader,
  onOpenDetails,
}: Props) => {
  const gdevelopTheme = React.useContext(ThemeContext);
  const {
    authors,
    licenses,
    environment,
    error: filterError,
    fetchAssetsAndFilters,
    useSearchItem,
  } = React.useContext(AssetStoreContext);
  const [asset, setAsset] = React.useState<?Asset>(null);
  const [
    selectedAnimationName,
    setSelectedAnimationName,
  ] = React.useState<?string>(null);
  const [error, setError] = React.useState<?Error>(null);
  const isAssetPrivate = isPrivateAsset(assetShortHeader);
  const { fetchPrivateAsset } = React.useContext(
    PrivateAssetsAuthorizationContext
  );
  const loadAsset = React.useCallback(
    () => {
      (async () => {
        try {
          // Reinitialise asset to trigger a loader and recalculate all parameters. (for instance zoom)
          setAsset(null);
          const loadedAsset = isAssetPrivate
            ? await fetchPrivateAsset(assetShortHeader, {
                environment,
              })
            : await getPublicAsset(assetShortHeader, {
                environment,
              });
          if (!loadedAsset) {
            console.error('Cannot load private asset');
            throw new Error('Cannot load private asset');
          }
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
    [assetShortHeader, environment, isAssetPrivate, fetchPrivateAsset]
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

  const similarAssetFilters = React.useMemo(
    () => [new SimilarAssetStoreSearchFilter(assetShortHeader)],
    [assetShortHeader]
  );
  const searchResults = useSearchItem('', null, null, similarAssetFilters);
  const truncatedSearchResults = searchResults && searchResults.slice(0, 60);

  return (
    <ScrollView style={styles.scrollView}>
      <Column expand noMargin>
        <Line justifyContent="space-between" noMargin>
          <Column>
            <Line alignItems="baseline" noMargin>
              <Text size="block-title" displayInlineAsSpan>
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
                          href={author.website}
                          onClick={() => Window.openExternalURL(author.website)}
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
        </Line>
        <ResponsiveLineStackLayout noMargin>
          <Column>
            {asset ? (
              <>
                {asset.objectType === 'sprite' &&
                animationResources &&
                typeof selectedAnimationName === 'string' && // Animation name can be empty string.
                  direction && (
                    <AnimationPreview
                      animationName={selectedAnimationName}
                      resourceNames={animationResources.map(({ name }) => name)}
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
                      fixedWidth={FIXED_WIDTH}
                      isAssetPrivate={isAssetPrivate}
                    />
                  )}
                {asset.objectType !== 'sprite' && (
                  <div style={styles.previewBackground}>
                    {isAssetPrivate ? (
                      <AuthorizedAssetImage
                        style={styles.previewImage}
                        url={asset.previewImageUrls[0]}
                        alt={asset.name}
                      />
                    ) : (
                      <CorsAwareImage
                        style={styles.previewImage}
                        src={asset.previewImageUrls[0]}
                        alt={asset.name}
                      />
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={styles.previewBackground}>
                <PlaceholderLoader />
              </div>
            )}
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
                          href={assetLicense.website}
                          onClick={() =>
                            Window.openExternalURL(assetLicense.website)
                          }
                        >
                          {assetLicense.name}
                        </Link>
                      }
                    </Trans>
                  )}
                </Text>
                <Text size="body" displayInlineAsSpan>
                  <MarkdownText source={asset.description} />
                </Text>
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
        {asset && (
          <Column expand>
            <Line noMargin>
              <Text size="block-title" displayInlineAsSpan>
                <Trans>You might like</Trans>
              </Text>
            </Line>
            <Line expand noMargin justifyContent="center">
              <BoxSearchResults
                baseSize={128}
                onRetry={fetchAssetsAndFilters}
                error={filterError}
                searchItems={truncatedSearchResults}
                renderSearchItem={(assetShortHeader, size) => (
                  <AssetCard
                    size={size}
                    onOpenDetails={() => {
                      setAsset(null);
                      onOpenDetails(assetShortHeader);
                    }}
                    assetShortHeader={assetShortHeader}
                  />
                )}
                noResultPlaceholder={
                  <Line alignItems="flex-start">
                    <EmptyMessage>
                      <Trans>No similar asset was found.</Trans>
                    </EmptyMessage>
                  </Line>
                }
                noScroll
              />
            </Line>
          </Column>
        )}
      </Column>
    </ScrollView>
  );
};
