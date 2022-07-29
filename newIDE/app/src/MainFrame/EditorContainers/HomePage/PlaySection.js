// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import SectionContainer, { SectionRow } from './SectionContainer';
import GDevelopThemeContext from '../../../UI/Theme/ThemeContext';
import PlaceHolderLoader from '../../../UI/PlaceholderLoader';

const styles = {
  iframe: {
    border: 0,
  },
};

const PlaySection = () => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const paletteType = gdevelopTheme.palette.type;
  const [iframeHeight, setIframeHeight] = React.useState(null);

  window.addEventListener('message', event => {
    if (
      event.origin === 'https://liluo.io' &&
      event.data.id === 'set-embedded-height'
    ) {
      setIframeHeight(event.data.height);
    }
  });

  return (
    <SectionContainer
      title={<Trans>Play!</Trans>}
      flexBody
      subtitle={<Trans>Explore games made by others</Trans>}
    >
      <SectionRow expand>
        <iframe
          src={`https://liluo.io/embedded/${paletteType}`}
          title="Liluo"
          style={{ ...styles.iframe, height: iframeHeight }}
        />
        {!iframeHeight && <PlaceHolderLoader />}
      </SectionRow>
    </SectionContainer>
  );
};

export default PlaySection;
