// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Column } from '../UI/Grid';
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
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import Add from '@material-ui/icons/Add';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { AssetStoreContext } from './AssetStoreContext';
import Link from '@material-ui/core/Link';
import Window from '../Utils/Window';
import CheckeredBackground from '../ResourcesList/CheckeredBackground';

const styles = {
  previewImagePixelated: {
    width: '100%',
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
  },
  horizontalPreviewBackground: {
    height: 170,
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
    objectFit: 'contain',
  },
};

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  objectsContainer: gdObjectsContainer,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,

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
  onChooseResource,
  resourceExternalEditors,
  assetShortHeader,
  onAdd,
  onClose,
  canInstall,
  isBeingInstalled,
}: Props) => {
  const { authors, licenses } = React.useContext(AssetStoreContext);
  const [asset, setAsset] = React.useState<?Asset>(null);
  const [error, setError] = React.useState<?Error>(null);
  const loadAsset = React.useCallback(
    () => {
      (async () => {
        try {
          const loadedAsset = await getAsset(assetShortHeader);
          setAsset(loadedAsset);
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

  const canAddAsset = canInstall && !isBeingInstalled && !!asset;
  const onAddAsset = React.useCallback(
    () => {
      if (canAddAsset) onAdd();
    },
    [onAdd, canAddAsset]
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

  return (
    <Dialog
      open
      title={<Trans>Add an object from the store</Trans>}
      onRequestClose={onClose}
      actions={[
        <FlatButton key="back" label={<Trans>Back</Trans>} onClick={onClose} />,
        <LeftLoader
          isLoading={isBeingInstalled || (!asset && !error)}
          key="install"
        >
          <RaisedButton
            primary
            icon={<Add />}
            label={<Trans>Add to the game</Trans>}
            onClick={onAddAsset}
            disabled={!canAddAsset}
            id="add-asset-button"
          />
        </LeftLoader>,
      ]}
      onApply={onAddAsset}
      id={'asset-details-dialog'}
    >
      <Column expand noMargin>
        <ResponsiveLineStackLayout noMargin>
          <ResponsiveWindowMeasurer>
            {windowWidth => (
              <div
                style={{
                  ...styles.previewBackground,
                  ...(windowWidth === 'small'
                    ? styles.horizontalPreviewBackground
                    : styles.verticalPreviewBackground),
                }}
              >
                <CheckeredBackground />
                <CorsAwareImage
                  style={{
                    ...styles.previewImage,
                    ...(isPixelArt(assetShortHeader)
                      ? styles.previewImagePixelated
                      : undefined),
                  }}
                  src={assetShortHeader.previewImageUrls[0]}
                  alt={assetShortHeader.name}
                />
              </div>
            )}
          </ResponsiveWindowMeasurer>
          <Column expand>
            <div>
              <Text size="title" displayInlineAsSpan>
                {assetShortHeader.name}
              </Text>{' '}
              {assetShortHeader.shortDescription && (
                <React.Fragment>
                  -{' '}
                  <Text size="body" displayInlineAsSpan>
                    {assetShortHeader.shortDescription}
                  </Text>
                </React.Fragment>
              )}
            </div>
            <span>
              {assetShortHeader.tags.map(tag => (
                <Chip size="small" style={styles.chip} label={tag} key={tag} />
              ))}
            </span>
            {asset ? (
              <React.Fragment>
                <Text size="body">
                  <Trans>By:</Trans>{' '}
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
                <Text size="body">
                  {!!assetLicense && (
                    <Trans>
                      License:{' '}
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
    </Dialog>
  );
};
