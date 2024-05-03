// @flow
import * as React from 'react';
import PrivateAssetsAuthorizationContext from './PrivateAssetsAuthorizationContext';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { createProductAuthorizedUrl } from '../../Utils/GDevelopServices/Shop';

type Props = {|
  url: string,
  style?: Object,
  alt: string,
  onError?: () => void,
  onLoad?: (e: any) => void,
  hideLoader?: boolean,
|};

const AuthorizedAssetImage = ({
  url,
  style,
  alt,
  onError,
  onLoad,
  hideLoader,
}: Props) => {
  const [authorizedUrl, setAuthorizedUrl] = React.useState(null);
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const { authorizationToken, updateAuthorizationToken } = React.useContext(
    PrivateAssetsAuthorizationContext
  );
  const tries = React.useRef(0);

  React.useEffect(
    () => {
      // Avoid triggering a new request if the image is already loaded.
      // This can happen if it was loaded with a previous token, and
      // A new token is fetched for another image.
      if (isImageLoaded) return;

      if (!authorizationToken) {
        updateAuthorizationToken();
      } else {
        setAuthorizedUrl(createProductAuthorizedUrl(url, authorizationToken));
      }
    },
    [authorizationToken, updateAuthorizationToken, url, isImageLoaded]
  );

  const onFetchingError = () => {
    console.warn('Error while fetching authorized image');
    if (tries.current >= 3) {
      if (onError) onError();
      return;
    }
    setIsImageLoaded(false);
    // If the image is not authorized, fetch a new authorization token.
    console.info('Error while fetching image, fetching a new token...');
    updateAuthorizationToken();
    tries.current += 1;
  };

  const onImageLoaded = (e: any) => {
    setIsImageLoaded(true);
    if (onLoad) onLoad(e);
  };

  // Ensure the loading status is reset when the URL changes,
  // this can happen when used inside an animation preview.
  React.useEffect(
    () => {
      if (url) {
        setIsImageLoaded(false);
      }
    },
    [url]
  );

  return (
    <>
      <img
        alt={alt}
        src={authorizedUrl}
        style={{
          ...style,
          // Use display none to load the image in the background, but not
          // display it. Once loaded, display it and hide loader.
          // When used inside an animation preview, the image keep changing,
          // and the browser will sometimes reload the image even if it's already been loaded.
          // There is hidden magic in the browser to display the previously loaded image, while
          // the next call is being made, to avoid a flickering.
          // This is why, it's important to not display a loader or hide the image,
          // when used in an animation.
          display: !hideLoader && !isImageLoaded ? 'none' : 'block',
        }}
        onError={onFetchingError}
        onLoad={onImageLoaded}
      />
      {!hideLoader && !isImageLoaded && <PlaceholderLoader />}
    </>
  );
};

export default AuthorizedAssetImage;
