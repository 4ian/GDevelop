import React from 'react';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import ResourcePreviewContext from './Resource3DPreviewContext';
import PlaceholderLoader from '../../UI/PlaceholderLoader';

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: 0,
    height: '100%',
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
  size?: number,
|};

const Model3DPreview = ({ modelUrl, size, expand }: Props) => {
  const { getResourcePreview } = React.useContext(ResourcePreviewContext);
  const [imageDataUrl, setImageDataUrl] = React.useState(null);
  const theme = React.useContext(GDevelopThemeContext);

  React.useEffect(
    () => {
      async function loadPreviewImageUrl() {
        const dataUrl = await getResourcePreview(modelUrl);
        setImageDataUrl(dataUrl);
      }
      loadPreviewImageUrl();
    },
    [modelUrl, getResourcePreview]
  );

  const loaderSize = size ? Math.max(size, 24) : undefined;

  return (
    <div
      style={{
        ...styles.container,
        flex: expand ? 1 : undefined,
      }}
    >
      <div
        style={{
          ...styles.background,
          filter: theme.imagePreview.backgroundFilter || 'none',
        }}
      />
      {imageDataUrl ? (
        <img
          src={imageDataUrl}
          alt="3D Model Preview"
          style={{
            ...styles.screenshot,
            maxWidth: size,
            maxHeight: size,
          }}
        />
      ) : (
        <PlaceholderLoader size={loaderSize} style={styles.loader} />
      )}
    </div>
  );
};

export default Model3DPreview;
