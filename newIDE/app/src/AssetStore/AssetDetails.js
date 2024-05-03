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
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../Utils/GDevelopServices/Shop';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import { LineStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { AssetStoreContext } from './AssetStoreContext';
import Window from '../Utils/Window';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import IconButton from '../UI/IconButton';
import AnimationPreview from '../ObjectEditor/Editors/SpriteEditor/AnimationPreview';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import AssetsList from './AssetsList';
import { SimilarAssetStoreSearchFilter } from './AssetStoreSearchFilter';
import EmptyMessage from '../UI/EmptyMessage';
import Link from '../UI/Link';
import PrivateAssetsAuthorizationContext from './PrivateAssets/PrivateAssetsAuthorizationContext';
import AuthorizedAssetImage from './PrivateAssets/AuthorizedAssetImage';
import { MarkdownText } from '../UI/MarkdownText';
import Paper from '../UI/Paper';
import {
  getUserPublicProfilesByIds,
  type UserPublicProfile,
} from '../Utils/GDevelopServices/User';
import { getPixelatedImageRendering } from '../Utils/CssHelpers';
import ArrowRight from '../UI/CustomSvgIcons/ArrowRight';
import ArrowLeft from '../UI/CustomSvgIcons/ArrowLeft';
import PublicProfileDialog from '../Profile/PublicProfileDialog';

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
    // Compromise between having a preview of the asset slightly more zoomed
    // compared to the search results and a not too zoomed image for small
    // smooth assets that could give a sense of bad quality.
    flex: 0.6,
  },
  arrowContainer: {
    padding: 6,
  },
};

const makeFirstLetterUppercase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

type Props = {|
  onTagSelection: (tag: string) => void,
  assetShortHeader: AssetShortHeader,
  onOpenDetails: (assetShortHeader: AssetShortHeader) => void,
  onAssetLoaded?: () => void,
  onPrivateAssetPackSelection: (assetPack: PrivateAssetPackListingData) => void,
  onPrivateGameTemplateSelection: (
    assetPack: PrivateGameTemplateListingData
  ) => void,
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

export type AssetDetailsInterface = {|
  getScrollPosition: () => number,
  scrollToPosition: (y: number) => void,
|};

export const AssetDetails = React.forwardRef<Props, AssetDetailsInterface>(
  (
    {
      onTagSelection,
      assetShortHeader,
      onOpenDetails,
      onAssetLoaded,
      onPrivateAssetPackSelection,
      onPrivateGameTemplateSelection,
    }: Props,
    ref
  ) => {
    const {
      authors,
      licenses,
      environment,
      error: filterError,
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
    const [authorPublicProfiles, setAuthorPublicProfiles] = React.useState<
      UserPublicProfile[]
    >([]);
    const [
      selectedAuthorPublicProfile,
      setSelectedAuthorPublicProfile,
    ] = React.useState<?UserPublicProfile>(null);

    const scrollView = React.useRef<?ScrollViewInterface>(null);
    React.useImperativeHandle(ref, () => ({
      /**
       * Return the scroll position.
       */
      getScrollPosition: () => {
        const scrollViewElement = scrollView.current;
        if (!scrollViewElement) return 0;

        return scrollViewElement.getScrollPosition();
      },
      scrollToPosition: (y: number) => {
        const scrollViewElement = scrollView.current;
        if (!scrollViewElement) return;

        scrollViewElement.scrollToPosition(y);
      },
    }));

    const getImagePreviewStyle = (assetShortHeader: Asset) => {
      return {
        ...styles.previewImage,
        imageRendering: isPixelArt(assetShortHeader)
          ? getPixelatedImageRendering()
          : undefined,
      };
    };

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
          onAssetLoaded && onAssetLoaded();
        })();
      },
      [
        onAssetLoaded,
        isAssetPrivate,
        fetchPrivateAsset,
        assetShortHeader,
        environment,
      ]
    );

    const isImageResourceSmooth = React.useMemo(
      () => !isPixelArt(assetShortHeader),
      [assetShortHeader]
    );

    React.useEffect(
      () => {
        if (!asset) {
          loadAsset();
        }
      },
      [asset, loadAsset]
    );

    const loadAuthorPublicProfiles = React.useCallback(
      async () => {
        try {
          const authorIds: Array<string> = (asset && asset.authorIds) || [];
          if (authorIds.length === 0) return;
          const userPublicProfileByIds = await getUserPublicProfilesByIds(
            authorIds
          );
          const userPublicProfiles = Object.keys(userPublicProfileByIds).map(
            id => userPublicProfileByIds[id]
          );
          setAuthorPublicProfiles(userPublicProfiles);
        } catch (error) {
          // Catch error, but don't display it to the user.
          console.error('Error while loading author public profiles:', error);
        }
      },
      [asset]
    );

    React.useEffect(
      () => {
        loadAuthorPublicProfiles();
      },
      [loadAuthorPublicProfiles]
    );

    const assetAuthors: ?Array<Author> =
      asset && authors
        ? asset.authors
            .map(authorName => {
              return authors.find(({ name }) => name === authorName);
            })
            .filter(Boolean)
        : [];
    const areAuthorsLoading =
      !asset || // Asset not loaded.
      (asset.authors.length > 0 && !authors) || // Authors not loaded.
      (asset.authorIds && // User public profiles not loaded.
        authorPublicProfiles.length > 0 &&
        authorPublicProfiles.length === 0);

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
      <ScrollView ref={scrollView}>
        <Column expand noMargin>
          <Line justifyContent="space-between" noMargin>
            <Column>
              <LineStackLayout alignItems="baseline" noMargin>
                <Text size="block-title" displayInlineAsSpan>
                  {assetShortHeader.name}
                </Text>
                {!areAuthorsLoading && (
                  <LineStackLayout noMargin>
                    <Text size="body">
                      <Trans>by</Trans>
                    </Text>
                    {!!assetAuthors &&
                      assetAuthors.map(author => (
                        <Text size="body" key={author.name}>
                          <Link
                            key={author.name}
                            href={author.website}
                            onClick={() =>
                              Window.openExternalURL(author.website)
                            }
                          >
                            {author.name}
                          </Link>
                        </Text>
                      ))}
                    {!!authorPublicProfiles.length &&
                      authorPublicProfiles.map(userPublicProfile => {
                        const username =
                          userPublicProfile.username || 'GDevelop user';
                        return (
                          <Text size="body" key={userPublicProfile.id}>
                            <Link
                              key={userPublicProfile.id}
                              href="#"
                              onClick={() =>
                                setSelectedAuthorPublicProfile(
                                  userPublicProfile
                                )
                              }
                            >
                              {username}
                            </Link>
                          </Text>
                        );
                      })}
                  </LineStackLayout>
                )}
              </LineStackLayout>
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
                        resourceNames={animationResources.map(
                          ({ name }) => name
                        )}
                        getImageResourceSource={(resourceName: string) => {
                          const resource = assetResources[resourceName];
                          return resource ? resource.file : '';
                        }}
                        isImageResourceSmooth={() => isImageResourceSmooth}
                        timeBetweenFrames={direction.timeBetweenFrames}
                        isLooping // Always loop in the asset store.
                        hideCheckeredBackground
                        deactivateControls
                        displaySpacedView
                        fixedHeight={FIXED_HEIGHT}
                        fixedWidth={FIXED_WIDTH}
                        isAssetPrivate={isAssetPrivate}
                      />
                    )}
                  {asset.objectType !== 'sprite' && (
                    <div style={styles.previewBackground}>
                      {isAssetPrivate ? (
                        <AuthorizedAssetImage
                          style={getImagePreviewStyle(asset)}
                          url={asset.previewImageUrls[0]}
                          alt={asset.name}
                        />
                      ) : (
                        <CorsAwareImage
                          style={getImagePreviewStyle(asset)}
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
                  <Paper elevation={4} variant="outlined" background="dark">
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
                          <ArrowLeft />
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
                        {assetAnimations.map(animation => {
                          const isAnimationNameEmpty = !animation.name;
                          return (
                            <SelectOption
                              key={animation.name}
                              value={animation.name}
                              label={
                                !isAnimationNameEmpty
                                  ? makeFirstLetterUppercase(animation.name)
                                  : t`Default` // Display default for animations with no name.
                              }
                              shouldNotTranslate={!isAnimationNameEmpty}
                            />
                          );
                        })}
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
                          <ArrowRight />
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
                    <MarkdownText source={asset.description} allowParagraphs />
                  </Text>
                </React.Fragment>
              ) : error ? (
                <PlaceholderError onRetry={loadAsset}>
                  <Trans>
                    Error while loading the asset. Verify your internet
                    connection or try again later.
                  </Trans>
                </PlaceholderError>
              ) : (
                <PlaceholderLoader />
              )}
            </Column>
          </ResponsiveLineStackLayout>
          {asset && (
            <Column expand>
              <Spacer />
              <Line noMargin>
                <Text size="block-title" displayInlineAsSpan>
                  <Trans>You might like</Trans>
                </Text>
              </Line>
              <Line expand noMargin justifyContent="center">
                <AssetsList
                  assetShortHeaders={truncatedSearchResults}
                  onOpenDetails={assetShortHeader => {
                    setAsset(null);
                    onOpenDetails(assetShortHeader);
                  }}
                  noScroll
                  noResultsPlaceHolder={
                    <Line alignItems="flex-start">
                      <EmptyMessage>
                        <Trans>No similar asset was found.</Trans>
                      </EmptyMessage>
                    </Line>
                  }
                  error={filterError}
                />
              </Line>
            </Column>
          )}
          {selectedAuthorPublicProfile && (
            <PublicProfileDialog
              userId={selectedAuthorPublicProfile.id}
              onClose={() => setSelectedAuthorPublicProfile(null)}
              onAssetPackOpen={assetPack => {
                onPrivateAssetPackSelection(assetPack);
                setSelectedAuthorPublicProfile(null);
              }}
              onGameTemplateOpen={gameTemplate => {
                onPrivateGameTemplateSelection(gameTemplate);
                setSelectedAuthorPublicProfile(null);
              }}
            />
          )}
        </Column>
      </ScrollView>
    );
  }
);
