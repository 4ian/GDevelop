import React from 'react';
import Resource3DPreviewContext from './Resource3DPreviewContext';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import CheckeredBackground from '../CheckeredBackground';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import { useIsMounted } from '../../Utils/UseIsMounted';

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: 0,
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
  // For models keeping their textures in separate files, the URL of each of
  // these files, indexed by the path written inside the model.
  embeddedTextureUrls?: ?{ [filePath: string]: string },
  expand?: boolean,
  fullWidth?: boolean,
  size?: number,
|};

const Model3DPreview = ({
  modelUrl,
  embeddedTextureUrls,
  size,
  expand,
  fullWidth,
}: Props) => {
  const { getResourcePreview } = React.useContext(Resource3DPreviewContext);
  const [imageDataUrl, setImageDataUrl] = React.useState(modelUrl ? null : '');
  const isMounted = useIsMounted();

  // Load the model preview when the component mounts or when the modelUrl changes.
  React.useEffect(
    () => {
      (async () => {
        if (!modelUrl) {
          return;
        }
        const dataUrl = await getResourcePreview(modelUrl, embeddedTextureUrls);
        if (!isMounted.current) {
          return;
        }

        setImageDataUrl(dataUrl);
      })();
    },
    // The texture URLs are entirely determined by the model being displayed:
    // rendering again when their (newly built) object changes would be useless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modelUrl, getResourcePreview, isMounted]
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
        <PlaceholderLoader size={24} style={styles.loader} />
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
