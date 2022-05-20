// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Column, Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import Chip from '@material-ui/core/Chip';
import RaisedButton from '../UI/RaisedButton';
import {
  type AssetShortHeader,
  type Asset,
  type Author,
  getAsset,
  isPixelArt,
} from '../Utils/GDevelopServices/Asset';
import { getPixelatedImageRendering } from '../Utils/CssHelpers';
import LeftLoader from '../UI/LeftLoader';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import { type ResourceSource } from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { AssetStoreContext } from './AssetStoreContext';
import Link from '@material-ui/core/Link';
import Window from '../Utils/Window';
import { makeStyles, Paper } from '@material-ui/core';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import ThemeContext from '../UI/Theme/ThemeContext';

const styles = {
  previewImagePixelated: {
    width: '50%',
    imageRendering: getPixelatedImageRendering(),
    padding: 15,
  },
  previewBackground: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  verticalPreviewBackground: {
    width: 250,
    height: 220,
  },
  horizontalPreviewBackground: {
    width: 150,
    height: 120,
  },
  chip: {
    marginBottom: 2,
    marginRight: 2,
    cursor: 'pointer',
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
    cursor: 'pointer',
  },
};

const useChipStyles = makeStyles({
  label: {
    cursor: 'pointer',
  },
});

const useStylesForLeftArrow = makeStyles({
  root: {
    cursor: 'pointer',
    '& > path': {
      transform: 'translate(5px, 0px)', // Translate path inside SVG since MUI icon is not centered
      cursor: 'pointer',
    },
  },
});

const useStylesForRightArrow = makeStyles({
  root: {
    cursor: 'pointer',
    '& > path': { cursor: 'pointer' },
  },
});

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
  const chipStyles = useChipStyles();
  const leftArrowStyles = useStylesForLeftArrow();
  const rightArrowStyles = useStylesForRightArrow();
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
          setSelectedAnimationName(
            loadedAsset.objectAssets[0].object.animations[0].name
          );
        } catch (error) {
          console.log('Error while loading asset:', error);
          setError(error);
        }
      })();
    },
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

  const assetAnimations = asset
    ? asset.objectAssets[0].object.animations
    : null;

  const getPreviewImageToDisplay = () => {
    if (!asset || !assetAnimations || !selectedAnimationName) {
      return assetShortHeader.previewImageUrls[0];
    }

    const animation = assetAnimations.find(
      ({ name }) => name === selectedAnimationName
    );
    const animationResources = animation.directions[0].sprites.map(sprite =>
      asset.objectAssets[0].resources.find(({ name }) => name === sprite.image)
    );

    return animationResources[0].file;
  };

  return (
    <Column expand noMargin>
      <ResponsiveLineStackLayout justifyContent="space-between" noMargin>
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
                    classes={chipStyles}
                    label={tag}
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
                      <Trans>+ {assetShortHeader.tags.length - 5} tag(s)</Trans>
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
      </ResponsiveLineStackLayout>
      <Line noMargin>
        <ResponsiveWindowMeasurer>
          {windowWidth => (
            <Column>
              <div
                style={{
                  ...styles.previewBackground,
                  ...(windowWidth === 'small'
                    ? styles.horizontalPreviewBackground
                    : styles.verticalPreviewBackground),
                }}
              >
                <CorsAwareImage
                  style={{
                    ...styles.previewImage,
                    ...(isPixelArt(assetShortHeader)
                      ? styles.previewImagePixelated
                      : undefined),
                  }}
                  src={getPreviewImageToDisplay()}
                  alt={assetShortHeader.name}
                />
              </div>
              {assetAnimations &&
                assetAnimations.length > 1 &&
                typeof selectedAnimationName === 'string' && (
                  <Paper elevation={4} variant="outlined">
                    <Line justifyContent="center" alignItems="center" noMargin>
                      <div
                        style={{
                          ...styles.arrowContainer,
                          backgroundColor:
                            gdevelopTheme.list.itemsBackgroundColor,
                        }}
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
                        <ArrowBackIos classes={leftArrowStyles} />
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
                            primaryText={animation.name}
                          />
                        ))}
                      </SelectField>
                      <div
                        style={{
                          ...styles.arrowContainer,
                          backgroundColor:
                            gdevelopTheme.list.itemsBackgroundColor,
                        }}
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
                        <ArrowForwardIos classes={rightArrowStyles} />
                      </div>
                    </Line>
                  </Paper>
                )}
            </Column>
          )}
        </ResponsiveWindowMeasurer>
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
      </Line>
    </Column>
  );
};
