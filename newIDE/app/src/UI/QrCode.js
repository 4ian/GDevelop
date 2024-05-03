// @flow

import * as React from 'react';
import QrCreator from 'qr-creator';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';

const styles = {
  qrCodeContainer: { imageRendering: 'pixelated' },
};

type Props = {|
  url: string,
  size?: number,
|};

const QrCode = ({ url, size = 128 }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const containerRef = React.useRef<?HTMLDivElement>(null);
  React.useEffect(
    () => {
      const containerElement = containerRef.current;

      if (!containerElement) return;

      QrCreator.render(
        {
          text: url,
          radius: 0,
          // See https://www.qrcode.com/en/about/error_correction.html.
          // The lower the level, the smaller the image. We don't need high level
          // because it won't be damaged.
          ecLevel: 'L',
          fill: gdevelopTheme.palette.secondary,
          background: null, // color or null for transparent
          size, // in pixels
        },
        containerElement
      );
      return () => {
        if (containerElement.firstChild) {
          containerElement.removeChild(containerElement.firstChild);
        }
      };
    },
    [url, size, gdevelopTheme]
  );
  return <div ref={containerRef} style={styles.qrCodeContainer} />;
};

export default QrCode;
