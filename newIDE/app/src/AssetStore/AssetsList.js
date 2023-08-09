// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import capitalize from 'lodash/capitalize';
import { AssetStoreContext } from './AssetStoreContext';
import {
  type AssetShortHeader,
  type PublicAssetPack,
  type Author,
  type License,
  isAssetPackAudioOnly,
} from '../Utils/GDevelopServices/Asset';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import { NoResultPlaceholder } from './NoResultPlaceholder';
import GridList from '@material-ui/core/GridList';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../UI/Reponsive/ResponsiveWindowMeasurer';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { mergeArraysPerGroup } from '../Utils/Array';
import {
  AssetCardTile,
  AssetFolderTile,
  PrivateAssetPackTile,
  PublicAssetPackTile,
} from './AssetPackTiles';
import PrivateAssetPackAudioFilesDownloadButton from './PrivateAssets/PrivateAssetPackAudioFilesDownloadButton';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { Column, LargeSpacer, Line } from '../UI/Grid';
import Text from '../UI/Text';
import { LineStackLayout } from '../UI/Layout';
import {
  getUserPublicProfile,
  type UserPublicProfile,
} from '../Utils/GDevelopServices/User';
import Link from '../UI/Link';
import PublicProfileDialog from '../Profile/PublicProfileDialog';
import Window from '../Utils/Window';
import Breadcrumbs from '../UI/Breadcrumbs';
import { getFolderTagsFromAssetShortHeaders } from './TagsHelper';

const ASSETS_DISPLAY_LIMIT = 100;

const getAssetSize = (windowWidth: WidthType) => {
  switch (windowWidth) {
    case 'small':
      return 80;
    case 'medium':
      return 120;
    case 'large':
    case 'xlarge':
      return 130;
    default:
      return 120;
  }
};

const getAssetPacksColumns = (windowWidth: WidthType) => {
  switch (windowWidth) {
    case 'small':
      return 1;
    case 'medium':
      return 2;
    case 'large':
      return 3;
    case 'xlarge':
      return 5;
    default:
      return 2;
  }
};

const getAssetFoldersColumns = (windowWidth: WidthType) => {
  switch (windowWidth) {
    case 'small':
    case 'medium':
      return 1;
    case 'large':
    case 'xlarge':
      return 2;
    default:
      return 2;
  }
};

const cellSpacing = 8;
const styles = {
  grid: {
    margin: '0 2px', // Remove the default margin of the grid but keep the horizontal padding for focus outline.
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
  previewImage: {
    width: 200,
    // Prevent cumulative layout shift by enforcing
    // the 16:9 ratio.
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    position: 'relative',
    background: '#7147ed',
  },
};

export type AssetsListInterface = {|
  getScrollPosition: () => number,
  scrollToPosition: (y: number) => void,
|};

type Props = {|
  assetShortHeaders: ?Array<AssetShortHeader>,
  privateAssetPackListingDatas?: ?Array<PrivateAssetPackListingData>,
  publicAssetPacks?: ?Array<PublicAssetPack>,
  onOpenDetails: (assetShortHeader: AssetShortHeader) => void,
  noResultsPlaceHolder?: React.Node,
  error?: ?Error,
  onPrivateAssetPackSelection?: (
    assetPack: PrivateAssetPackListingData
  ) => void,
  onPublicAssetPackSelection?: (assetPack: PublicAssetPack) => void,
|};

const AssetsList = React.forwardRef<Props, AssetsListInterface>(
  (
    {
      assetShortHeaders,
      onOpenDetails,
      noResultsPlaceHolder,
      privateAssetPackListingDatas,
      publicAssetPacks,
      onPrivateAssetPackSelection,
      onPublicAssetPackSelection,
    }: Props,
    ref
  ) => {
    const {
      error,
      fetchAssetsAndFilters,
      clearAllFilters,
      navigationState,
      licenses,
      authors,
      privateAssetPackListingDatas: allPrivateAssetPackListingDatas,
    } = React.useContext(AssetStoreContext);
    const { receivedAssetPacks } = React.useContext(AuthenticatedUserContext);
    const [
      authorPublicProfile,
      setAuthorPublicProfile,
    ] = React.useState<?UserPublicProfile>(null);
    const [
      openAuthorPublicProfileDialog,
      setOpenAuthorPublicProfileDialog,
    ] = React.useState<boolean>(false);
    const currentPage = navigationState.getCurrentPage();
    const { openedAssetPack, filtersState } = currentPage;
    const chosenCategory = filtersState.chosenCategory;
    const windowWidth = useResponsiveWindowWidth();
    const scrollView = React.useRef<?ScrollViewInterface>(null);
    React.useImperativeHandle(ref, () => ({
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
    const [selectedFolders, setSelectedFolders] = React.useState<Array<string>>(
      []
    );

    React.useEffect(
      () => {
        if (chosenCategory) {
          setSelectedFolders([chosenCategory.node.name]);
        } else {
          setSelectedFolders([]);
        }
      },
      [chosenCategory]
    );

    const navigateInsideFolder = React.useCallback(
      folderTag => setSelectedFolders([...selectedFolders, folderTag]),
      [selectedFolders]
    );
    const goBackToFolderIndex = React.useCallback(
      folderIndex => {
        if (folderIndex >= selectedFolders.length || folderIndex < 0) {
          console.warn(
            'Trying to go back to a folder that is not in the selected folders.'
          );
          return;
        }
        setSelectedFolders(selectedFolders.slice(0, folderIndex + 1));
      },
      [selectedFolders]
    );

    const selectedPrivateAssetPackListingData = React.useMemo(
      () => {
        if (
          !allPrivateAssetPackListingDatas ||
          !openedAssetPack ||
          !openedAssetPack.id // public pack selected.
        )
          return null;

        // As the list should already been fetched, we can find the selected pack
        // if it is a private pack.
        return allPrivateAssetPackListingDatas.find(
          privateAssetPackListingData =>
            privateAssetPackListingData.id === openedAssetPack.id
        );
      },
      [allPrivateAssetPackListingDatas, openedAssetPack]
    );

    const folderTags: Array<string> = React.useMemo(
      () => {
        // When inside an asset pack, it will automatically select a folder.
        // So if the list is empty or if the assets are not loaded, we don't load the tags.
        if (!selectedFolders.length || !assetShortHeaders) return [];
        return getFolderTagsFromAssetShortHeaders({
          assetShortHeaders,
          selectedFolders,
        });
      },
      [assetShortHeaders, selectedFolders]
    );

    const folderTiles = React.useMemo(
      () =>
        // Don't show folders if we are searching.
        folderTags.length > 0
          ? folderTags.map(folderTag => (
              <AssetFolderTile
                tag={folderTag}
                key={folderTag}
                onSelect={() => {
                  navigateInsideFolder(folderTag);
                }}
              />
            ))
          : [],
      [folderTags, navigateInsideFolder]
    );

    const assetTiles = React.useMemo(
      () =>
        assetShortHeaders
          ? assetShortHeaders
              .filter(assetShortHeader => {
                if (!selectedFolders.length) return true;
                const allAssetTags = assetShortHeader.tags;
                // Check that the asset has all the selected folders tags.
                return selectedFolders.every(folderTag =>
                  allAssetTags.includes(folderTag)
                );
              })
              .map(assetShortHeader => (
                <AssetCardTile
                  assetShortHeader={assetShortHeader}
                  onOpenDetails={() => onOpenDetails(assetShortHeader)}
                  size={getAssetSize(windowWidth)}
                  key={assetShortHeader.id}
                  margin={cellSpacing / 2}
                />
              ))
              .splice(0, ASSETS_DISPLAY_LIMIT) // Limit the number of displayed assets to avoid performance issues
          : null,
      [assetShortHeaders, onOpenDetails, windowWidth, selectedFolders]
    );

    const publicPacksTiles: Array<React.Node> = React.useMemo(
      () => {
        if (!publicAssetPacks || !onPublicAssetPackSelection) return [];
        return publicAssetPacks.map((assetPack, index) => (
          <PublicAssetPackTile
            assetPack={assetPack}
            onSelect={() => onPublicAssetPackSelection(assetPack)}
            key={`${assetPack.tag}-${index}`}
          />
        ));
      },
      [publicAssetPacks, onPublicAssetPackSelection]
    );

    const { allStandAlonePackTiles, allBundlePackTiles } = React.useMemo(
      () => {
        const privateAssetPackStandAloneTiles: Array<React.Node> = [];
        const privateOwnedAssetPackStandAloneTiles: Array<React.Node> = [];
        const privateAssetPackBundleTiles: Array<React.Node> = [];
        const privateOwnedAssetPackBundleTiles: Array<React.Node> = [];

        if (!privateAssetPackListingDatas || !receivedAssetPacks) {
          return {
            allStandAlonePackTiles: [],
            allBundlePackTiles: [],
          };
        }

        !!onPrivateAssetPackSelection &&
          privateAssetPackListingDatas.forEach(assetPackListingData => {
            const isPackOwned =
              !!receivedAssetPacks &&
              !!receivedAssetPacks.find(
                pack => pack.id === assetPackListingData.id
              );
            const tile = (
              <PrivateAssetPackTile
                assetPackListingData={assetPackListingData}
                onSelect={() => {
                  onPrivateAssetPackSelection(assetPackListingData);
                }}
                owned={isPackOwned}
                key={assetPackListingData.id}
              />
            );
            if (
              assetPackListingData.includedListableProductIds &&
              !!assetPackListingData.includedListableProductIds.length
            ) {
              if (isPackOwned) {
                privateOwnedAssetPackBundleTiles.push(tile);
              } else {
                privateAssetPackBundleTiles.push(tile);
              }
            } else {
              if (isPackOwned) {
                privateOwnedAssetPackStandAloneTiles.push(tile);
              } else {
                privateAssetPackStandAloneTiles.push(tile);
              }
            }
          });

        const allBundlePackTiles = [
          ...privateOwnedAssetPackBundleTiles, // Display owned bundles first.
          ...privateAssetPackBundleTiles,
        ];

        const allStandAlonePackTiles = [
          ...privateOwnedAssetPackStandAloneTiles, // Display owned packs first.
          ...mergeArraysPerGroup(
            privateAssetPackStandAloneTiles,
            publicPacksTiles,
            2,
            1
          ),
        ];

        return { allStandAlonePackTiles, allBundlePackTiles };
      },
      [
        privateAssetPackListingDatas,
        onPrivateAssetPackSelection,
        publicPacksTiles,
        receivedAssetPacks,
      ]
    );

    const packMainImageUrl = openedAssetPack
      ? openedAssetPack.thumbnailUrl
        ? openedAssetPack.thumbnailUrl
        : openedAssetPack.previewImageUrls
        ? openedAssetPack.previewImageUrls[0]
        : null
      : null;

    React.useEffect(
      () => {
        (async () => {
          if (!selectedPrivateAssetPackListingData) {
            setAuthorPublicProfile(null);
            return;
          }
          try {
            const authorProfile = await getUserPublicProfile(
              selectedPrivateAssetPackListingData.sellerId
            );

            setAuthorPublicProfile(authorProfile);
          } catch (error) {
            console.error(error);
            // Do not block the UI if the author profile can't be fetched.
          }
        })();
      },
      [selectedPrivateAssetPackListingData]
    );

    const publicAssetPackAuthors: ?Array<Author> = React.useMemo(
      () =>
        openedAssetPack && authors && openedAssetPack.authors
          ? openedAssetPack.authors
              .map(author => {
                return authors.find(({ name }) => name === author.name);
              })
              .filter(Boolean)
          : [],
      [openedAssetPack, authors]
    );

    const publicAssetPackLicenses: ?Array<License> = React.useMemo(
      () =>
        openedAssetPack && licenses && openedAssetPack.licenses
          ? openedAssetPack.licenses
              .map(license => {
                return licenses.find(({ name }) => name === license.name);
              })
              .filter(Boolean)
          : [],
      [openedAssetPack, licenses]
    );

    return (
      <ScrollView
        ref={scrollView}
        id="asset-store-listing"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {!assetTiles && !error && <PlaceholderLoader />}
        {!assetTiles && error && (
          <PlaceholderError onRetry={fetchAssetsAndFilters}>
            <Trans>
              Can't load the results. Verify your internet connection or retry
              later.
            </Trans>
          </PlaceholderError>
        )}
        {!openedAssetPack && allBundlePackTiles.length ? (
          <Line expand>
            <Column noMargin expand>
              <GridList
                cols={getAssetPacksColumns(windowWidth)}
                style={styles.grid}
                cellHeight="auto"
                spacing={cellSpacing / 2}
              >
                {allBundlePackTiles}
              </GridList>
            </Column>
          </Line>
        ) : null}
        {!openedAssetPack && allStandAlonePackTiles.length ? (
          <Line expand>
            <Column noMargin expand>
              <GridList
                cols={getAssetPacksColumns(windowWidth)}
                style={styles.grid}
                cellHeight="auto"
                spacing={cellSpacing / 2}
              >
                {allStandAlonePackTiles}
              </GridList>
            </Column>
          </Line>
        ) : null}
        {openedAssetPack && (
          <Column>
            <LineStackLayout>
              {packMainImageUrl && (
                <>
                  <CorsAwareImage
                    key={openedAssetPack.name}
                    style={styles.previewImage}
                    src={
                      openedAssetPack.thumbnailUrl
                        ? openedAssetPack.thumbnailUrl
                        : openedAssetPack.previewImageUrls
                        ? openedAssetPack.previewImageUrls[0]
                        : ''
                    }
                    alt={`Preview image of asset pack ${openedAssetPack.name}`}
                  />
                  <LargeSpacer />
                </>
              )}
              <Column noMargin alignItems="flex-start" expand>
                <Text size="bold-title">{openedAssetPack.name}</Text>
                {!!publicAssetPackAuthors &&
                  publicAssetPackAuthors.map(author => (
                    <Text size="body" key={author.name}>
                      <Trans>by</Trans>{' '}
                      <Link
                        key={author.name}
                        href={author.website}
                        onClick={() => Window.openExternalURL(author.website)}
                      >
                        {author.name}
                      </Link>
                    </Text>
                  ))}
                {!!publicAssetPackLicenses &&
                  publicAssetPackLicenses.length > 0 && (
                    <Text size="body">
                      <Trans>
                        Type of License:{' '}
                        {
                          <Link
                            href={publicAssetPackLicenses[0].website}
                            onClick={() =>
                              Window.openExternalURL(
                                publicAssetPackLicenses[0].website
                              )
                            }
                          >
                            {publicAssetPackLicenses[0].name}
                          </Link>
                        }
                      </Trans>
                    </Text>
                  )}
                {authorPublicProfile && (
                  <Text displayInlineAsSpan size="sub-title">
                    <Trans>by</Trans>{' '}
                    <Link
                      onClick={() => setOpenAuthorPublicProfileDialog(true)}
                      href="#"
                    >
                      {authorPublicProfile.username || ''}
                    </Link>
                  </Text>
                )}
              </Column>
            </LineStackLayout>
          </Column>
        )}
        {openedAssetPack &&
        (folderTiles.length || (assetTiles && assetTiles.length)) ? (
          <Column>
            <Text size="section-title">
              <Trans>Content</Trans>
            </Text>
          </Column>
        ) : null}
        {selectedFolders.length > 1 ? (
          <Column>
            <Line>
              <Breadcrumbs
                steps={selectedFolders.map((folder, index) => {
                  if (index === selectedFolders.length - 1) {
                    return {
                      label: capitalize(folder),
                    };
                  }
                  return {
                    label: capitalize(folder),
                    onClick: () => {
                      goBackToFolderIndex(index);
                    },
                    href: '#',
                  };
                })}
              />
            </Line>
          </Column>
        ) : null}
        {openedAssetPack && folderTiles.length ? (
          <Column justifyContent="center">
            <GridList
              style={styles.grid}
              cellHeight="auto"
              cols={getAssetFoldersColumns(windowWidth)}
              spacing={cellSpacing / 2}
            >
              {folderTiles}
            </GridList>
            <LargeSpacer />
          </Column>
        ) : null}

        {assetTiles && assetTiles.length ? (
          <GridList style={styles.grid} cellHeight="auto">
            {assetTiles}
          </GridList>
        ) : openedAssetPack &&
          openedAssetPack.content &&
          isAssetPackAudioOnly(openedAssetPack) ? (
          <PrivateAssetPackAudioFilesDownloadButton
            assetPack={openedAssetPack}
          />
        ) : (
          noResultsPlaceHolder || (
            <NoResultPlaceholder onClear={() => clearAllFilters()} />
          )
        )}
        {onPrivateAssetPackSelection &&
          openAuthorPublicProfileDialog &&
          authorPublicProfile && (
            <PublicProfileDialog
              userId={authorPublicProfile.id}
              onClose={() => setOpenAuthorPublicProfileDialog(false)}
              onAssetPackOpen={assetPackListingData => {
                onPrivateAssetPackSelection(assetPackListingData);
                setOpenAuthorPublicProfileDialog(false);
                setAuthorPublicProfile(null);
              }}
            />
          )}
      </ScrollView>
    );
  }
);

export default AssetsList;
