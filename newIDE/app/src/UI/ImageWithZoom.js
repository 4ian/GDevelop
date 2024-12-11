// @flow
import * as React from 'react';
import InnerImageZoom from 'react-inner-image-zoom';
import './ImageWithZoom.css';
import classNames from 'classnames';

type Props = {|
  src: ?string,
  style?: Object,
  /* img elements must have an alt prop, either with meaningful text, or an empty string for decorative images */
  alt: ?string,
|};

/**
 * An `img` element where the `src` URL has an extra parameter added to avoid CORS issue
 * when trying to load the image from another website (typically for game previews/exports).
 *
 * As a rule of thumb, use this **anytime you need to display an image that is a game resource/
 * user chosen image**.
 * On the contrary, if you're displaying a built-in GDevelop image, coming for example from the
 * "res/" folder (i.e: a GDevelop icon), you don't need this and can use `<img>` as usual.
 */
const ImageWithZoom = ({ src, ...props }: Props) => {
  const [isZoomedIn, setIsZoomedIn] = React.useState<boolean>(false);
  return (
    <InnerImageZoom
      src={src}
      {...props}
      className={classNames({
        'with-min-height': isZoomedIn,
        'with-grab-cursor': isZoomedIn,
      })}
      afterZoomIn={() => setIsZoomedIn(true)}
      afterZoomOut={() => setIsZoomedIn(false)}
      zoomType="click"
      moveType="drag"
      hideHint
      zoomScale={0.8}
    />
  );
};

export default ImageWithZoom;
