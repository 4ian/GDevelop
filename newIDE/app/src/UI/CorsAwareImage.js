// @flow
import * as React from 'react';

type Props = {|
  src: ?string,
  className?: string,
  style?: Object,
  /* img elements must have an alt prop, either with meaningful text, or an empty string for decorative images */
  alt: ?string,
  title?: ?string,
  onError?: (?Error) => void,
  onLoad?: (e: any) => void,
|};

const addSearchParameterToUrl = (
  url: string,
  urlEncodedParameterName: string,
  urlEncodedValue: string
) => {
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    // blob/data protocol does not support search parameters, which are useless anyway.
    return url;
  }

  const separator = url.indexOf('?') === -1 ? '?' : '&';
  return url + separator + urlEncodedParameterName + '=' + urlEncodedValue;
};

/**
 * An `img` element where the `src` URL has an extra parameter added to avoid CORS issue
 * when trying to load the image from another website (typically for game previews/exports).
 *
 * As a rule of thumb, use this **anytime you need to display an image that is a game resource/
 * user chosen image**.
 * On the contrary, if you're displaying a built-in GDevelop image, coming for example from the
 * "res/" folder (i.e: a GDevelop icon), you don't need this and can use `<img>` as usual.
 */
export const CorsAwareImage = (props: Props) => (
  <img // eslint-disable-line jsx-a11y/alt-text
    {...props}
    src={
      // To avoid strange/hard to understand CORS issues, we add a dummy parameter.
      // By doing so, we force browser to consider this URL as different than the one traditionally
      // used to render the resource in the editor (usually as an `<img>` or as a background image).
      // If we don't add this distinct parameter, it can happen that browsers fail to load the image
      // as it's already in the **browser cache** but with slightly different request parameters -
      // making the CORS checks fail (even if it's coming from the browser cache).
      //
      // It's happening sometimes (according to loading order probably) in Chrome and (more often)
      // in Safari. It might be linked to Amazon S3 + CloudFront that "doesn't support the Vary: Origin header".
      // To be safe, we entirely avoid the issue with this parameter, making the browsers consider
      // the resources for use in Pixi.js and for the rest of the editor as entirely separate.
      //
      // See:
      // - https://stackoverflow.com/questions/26140487/cross-origin-amazon-s3-not-working-using-chrome
      // - https://stackoverflow.com/questions/20253472/cors-problems-with-amazon-s3-on-the-latest-chomium-and-google-canary
      // - https://stackoverflow.com/a/20299333
      //
      // Search for "cors-cache-workaround" in the codebase for the same workarounds.
      props.src
        ? addSearchParameterToUrl(props.src, 'gdUsage', 'img')
        : undefined
    }
  />
);
