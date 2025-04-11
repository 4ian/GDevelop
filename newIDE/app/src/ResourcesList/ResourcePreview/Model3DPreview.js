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
  size?: number,
  expand?: boolean,
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
    // Only run this effect once when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
        <PlaceholderLoader size={size} style={styles.loader} />
      )}
    </div>
  );
};

export default Model3DPreview;
