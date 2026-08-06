// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { CorsAwareImage } from './CorsAwareImage';
import BrokenImage from './CustomSvgIcons/BrokenImage';
import Text from './Text';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';

type Props = {|
  src: ?string,
  alt: ?string,
  style?: Object,
  loading?: 'lazy',
|};

const styles = {
  fallbackContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 8,
    border: '1px solid',
    boxSizing: 'border-box', // Take border in account for sizing to avoid cumulative layout shift.
  },
  fallbackIcon: {
    width: '25%',
    height: '25%',
    opacity: 0.5,
  },
};

/**
 * An image that displays a placeholder icon when the source fails to load
 * (broken/missing image), while keeping the same layout (size, border, ratio)
 * to avoid any layout shift.
 */
export const ImageWithFallback = ({
  src,
  alt,
  style,
  loading,
  ...props
}: Props): React.MixedElement => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [hasError, setHasError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imageRef = React.useRef<HTMLImageElement | null>(null);

  // Reset the loading/error state if the source changes (e.g. when navigating
  // through a carousel, or when a tile is reused in a list).
  React.useEffect(
    () => {
      setHasError(false);
      setIsLoaded(false);
    },
    [src]
  );

  // Check if the image is already loaded (important for cached images,
  // which don't trigger onLoad event in browsers).
  React.useEffect(
    () => {
      const image = imageRef.current;
      if (!image) return;

      // If image is already in browser cache, `complete` will be true and
      // onLoad won't fire, so we need to manually check and update state.
      if (image.complete && !hasError) {
        if (image.naturalWidth > 0) {
          setIsLoaded(true);
        } else {
          setHasError(true);
        }
      }
    },
    [src, hasError]
  );

  if (hasError || !src) {
    return (
      <div
        style={{
          ...style,
          ...styles.fallbackContainer,
          borderColor: gdevelopTheme.text.color.disabled,
        }}
      >
        <BrokenImage
          style={{
            ...styles.fallbackIcon,
            color: gdevelopTheme.text.color.disabled,
          }}
        />
        <Text color="secondary" size="body-small" noMargin>
          <Trans>Missing Content</Trans>
        </Text>
      </div>
    );
  }

  return (
    <CorsAwareImage
      {...props}
      imageRef={imageRef}
      src={src}
      alt={alt}
      // Keep the image invisible until it has successfully loaded, so the
      // browser's native "broken image" glyph is never shown for a fraction of
      // a second before the fallback appears.
      style={{
        ...style,
        opacity: isLoaded ? (style && style.opacity) || 1 : 0,
      }}
      loading={loading}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
    />
  );
};
