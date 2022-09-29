// @flow
import * as React from 'react';
import PrivateAssetsAuthorizationContext from './PrivateAssetsAuthorizationContext';
import PlaceholderLoader from '../../UI/PlaceholderLoader';

type Props = {|
  url: string,
  style?: Object,
  alt: string,
|};

const AuthorizedAssetImage = (props: Props) => {
  const [authorizedUrl, setAuthorizedUrl] = React.useState(null);
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const { authorizationToken, fetchAuthorizationToken } = React.useContext(
    PrivateAssetsAuthorizationContext
  );
  const [tries, setTries] = React.useState(0);

  React.useEffect(
    () => {
      // Avoid trigerring a new request if the image is already loaded.
      // This can happen if it was loaded with a previous token, and
      // A new token is fetched for another image.
      if (isImageLoaded) return;

      if (!authorizationToken) {
        fetchAuthorizationToken();
      } else {
        setAuthorizedUrl(
          props.url + '?token=' + encodeURIComponent(authorizationToken)
        );
      }
    },
    [authorizationToken, fetchAuthorizationToken, props.url, isImageLoaded]
  );

  const onFetchingError = () => {
    setIsImageLoaded(false);
    // If the image is not authorized, fetch a new authorization token.
    if (tries < 3) {
      console.info('Error while fetching image, fetching a new token...');
      fetchAuthorizationToken();
      setTries(tries + 1);
    }
  };

  return (
    <>
      <img
        alt={props.alt}
        src={authorizedUrl}
        style={{
          ...props.style,
          // Use display none to load the image in the background, but not
          // display it. Once loaded, display it and hide loader.
          display: isImageLoaded ? 'block' : 'none',
        }}
        onError={onFetchingError}
        onLoad={() => setIsImageLoaded(true)}
      />
      {!isImageLoaded && <PlaceholderLoader />}
    </>
  );
};

export default AuthorizedAssetImage;
