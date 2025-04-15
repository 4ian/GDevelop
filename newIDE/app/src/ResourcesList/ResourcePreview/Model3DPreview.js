import React from 'react';
import ResourcePreviewContext from './Resource3DPreviewContext';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import CheckeredBackground from '../CheckeredBackground';
import { CorsAwareImage } from '../../UI/CorsAwareImage';

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: 0,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'url("res/transparentback.png") repeat',
  },
  screenshot: {
    position: 'relative',
    objectFit: 'contain',
    width: '100%',
    height: '100%',
  },
  loader: {
    padding: 0,
  },
};

type Props = {|
  modelUrl: string,
  expand?: boolean,
  fullWidth?: boolean,
  size?: number,
|};

const Model3DPreview = ({ modelUrl, size, expand, fullWidth }: Props) => {
  const { getResourcePreview } = React.useContext(ResourcePreviewContext);
  const [imageDataUrl, setImageDataUrl] = React.useState(modelUrl ? null : '');

  React.useEffect(
    () => {
      async function loadPreviewImageUrl() {
        if (!modelUrl) {
          return;
        }
        const dataUrl = await getResourcePreview(modelUrl);
        setImageDataUrl(dataUrl);
      }
      loadPreviewImageUrl();
    },
    [modelUrl, getResourcePreview]
  );

  return (
    <div
      style={{
        ...styles.container,
        flex: expand ? 1 : undefined,
        width: fullWidth ? '100%' : size,
        height: size || '100%',
      }}
    >
      <CheckeredBackground borderRadius={4} />
      {imageDataUrl === null ? (
        <PlaceholderLoader size={size} style={styles.loader} />
      ) : (
        imageDataUrl !== '' && (
          <CorsAwareImage
            src={imageDataUrl}
            alt="3D Model Preview"
            style={{
              ...styles.screenshot,
              maxWidth: size,
              maxHeight: size,
            }}
          />
        )
      )}
    </div>
  );
};

export default Model3DPreview;
