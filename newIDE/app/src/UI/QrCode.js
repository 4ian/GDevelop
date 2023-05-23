// @flow

import * as React from 'react';
import QrCreator from 'qr-creator';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';

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
          ecLevel: 'M', // L, M, Q, H
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
  return <div ref={containerRef} />;
};

export default QrCode;
