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
  getAsset,
} from '../Utils/GDevelopServices/Asset';
import LeftLoader from '../UI/LeftLoader';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import CustomizationFields from './CustomizationFields';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import Add from '@material-ui/icons/Add';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { CorsAwareImage } from '../UI/CorsAwareImage';

const styles = {
  previewBackground: {
    background: 'url("res/transparentback.png") repeat',
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
  inlineText: {
    display: 'inline-block',
  },
  previewImage: {
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
          // TODO: handle error
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
            onClick={onAdd}
            disabled={!canInstall || isBeingInstalled || !asset}
          />
        </LeftLoader>,
      ]}
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
                <CorsAwareImage
                  style={styles.previewImage}
                  src={assetShortHeader.previewImageUrls[0]}
                  alt={assetShortHeader.name}
                />
              </div>
            )}
          </ResponsiveWindowMeasurer>
          <Column expand>
            <div>
              <Text size="title" style={styles.inlineText}>
                {assetShortHeader.name}
              </Text>{' '}
              -{' '}
              <Text size="body" style={styles.inlineText}>
                {assetShortHeader.shortDescription}
              </Text>
            </div>
            <span>
              {assetShortHeader.tags.map(tag => (
                <Chip size="small" style={styles.chip} label={tag} key={tag} />
              ))}
            </span>
            {asset ? (
              <React.Fragment>
                <Text size="body">
                  <Trans>By {asset.authors.join(', ')}</Trans>
                </Text>
                <Text size="body">
                  <Trans>License: {asset.license}</Trans>
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
        {asset ? (
          <Column>
            <CustomizationFields
              project={project}
              layout={layout}
              objectsContainer={objectsContainer}
              resourceSources={resourceSources}
              onChooseResource={onChooseResource}
              resourceExternalEditors={resourceExternalEditors}
              asset={asset}
            />
          </Column>
        ) : null}
      </Column>
    </Dialog>
  );
};
