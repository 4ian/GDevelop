// @flow
import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import useForceUpdate from '../Utils/UseForceUpdate';
import { delay } from '../Utils/Delay';
import { useIsMounted } from '../Utils/UseIsMounted';
import {
  type PrivateGameTemplateListingData,
  type PrivateAssetPackListingData,
} from '../Utils/GDevelopServices/Shop';

export type GdGamesMessageEventData = $ReadOnly<{
  id?: string | any,
  privateAssetPackListingData?: PrivateAssetPackListingData,
  privateGameTemplateListingData?: PrivateGameTemplateListingData,
}>;

type Props = {|
  loadErrorMessage: React.Node,
  path: string,
  onMessageReceived: (data: GdGamesMessageEventData) => void,
  supportedMessageIds: Array<string>,
|};

const styles = {
  iframe: {
    border: 0,
    flex: 1,
  },
};

const gdGamesHost = 'https://gd.games';
// const gdGamesHost = 'http://localhost:4000';

export const GdGamesFrame = ({
  loadErrorMessage,
  path,
  onMessageReceived,
  supportedMessageIds,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const paletteType = gdevelopTheme.palette.type;

  const loadState = React.useRef<'loading' | 'loaded' | 'errored'>('loading');
  const isMounted = useIsMounted();
  const forceUpdate = useForceUpdate();

  const url = new URL(path, gdGamesHost);
  url.searchParams.set('supportedMessageIds', supportedMessageIds.join(','));
  url.searchParams.set('theme', paletteType);

  React.useEffect(
    () => {
      const callback = (event: MessageEvent) => {
        if (
          event.origin === gdGamesHost &&
          event.data &&
          typeof event.data === 'object'
        ) {
          if (event.data.id === 'pageLoaded') {
            loadState.current = 'loaded';
            forceUpdate();
          } else {
            // $FlowFixMe - Trust gd.games to send the right data shapes.
            onMessageReceived(event.data);
          }
        }
      };

      window.addEventListener('message', callback);

      return () => window.removeEventListener('message', callback);
    },
    [forceUpdate, onMessageReceived]
  );

  React.useEffect(
    () => {
      (async () => {
        await delay(6000);
        if (!isMounted.current) return;

        // Consider the loading of the iframe as a failure if not completed/errored
        // after 6s.
        if (loadState.current === 'loaded') return;
        loadState.current = 'errored';
        forceUpdate();
      })();
    },
    [forceUpdate, isMounted]
  );

  return (
    <>
      {loadState.current !== 'errored' && (
        <iframe
          src={url.toString()}
          title="gdgames"
          style={{
            ...styles.iframe,
            visibility: loadState.current === 'loaded' ? 'visible' : 'hidden',
          }}
        />
      )}
      {loadState.current === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 30,
          }}
        >
          <PlaceholderLoader style={{ width: '100%', height: '100%' }} />
        </div>
      )}
      {loadState.current === 'errored' && (
        <PlaceholderError
          onRetry={() => {
            loadState.current = 'loading';
            forceUpdate();
          }}
        >
          {loadErrorMessage}
        </PlaceholderError>
      )}
    </>
  );
};
