// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import SectionContainer from '../SectionContainer';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import IconButton from '../../../../UI/IconButton';
import Text from '../../../../UI/Text';
import ArrowLeft from '../../../../UI/CustomSvgIcons/ArrowLeft';
import ArrowRight from '../../../../UI/CustomSvgIcons/ArrowRight';
import Planet from '../../../../UI/CustomSvgIcons/Planet';
import Refresh from '../../../../UI/CustomSvgIcons/Refresh';
import ShareExternal from '../../../../UI/CustomSvgIcons/ShareExternal';
import Window from '../../../../Utils/Window';
import optionalRequire from '../../../../Utils/OptionalRequire';

const electron = optionalRequire('electron');
const defaultBrowserUrl = 'https://wiki.gdevelop.io/gdevelop5/';

const styles = {
  sectionPaper: {
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    minHeight: 44,
    paddingLeft: 8,
    paddingRight: 8,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
    paddingRight: 6,
    minWidth: 94,
  },
  addressForm: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  addressInput: {
    flex: 1,
    minWidth: 0,
    height: 30,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: '0 10px',
    outline: 'none',
    fontSize: 14,
  },
  frameContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  webview: {
    display: 'flex',
    flex: 1,
    width: '100%',
    height: '100%',
    border: 0,
  },
  iframe: {
    flex: 1,
    width: '100%',
    height: '100%',
    border: 0,
  },
  statusBar: {
    flexShrink: 0,
    minHeight: 28,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
  },
};

type BrowserLoadError = 'invalid-url' | 'load-failed';

export const normalizeBrowserUrl = (rawUrl: string): ?string => {
  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) return null;

  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmedUrl);
  const isLocalUrl = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::|\/|$)/.test(
    trimmedUrl
  );
  const urlWithScheme = hasScheme
    ? trimmedUrl
    : `${isLocalUrl ? 'http' : 'https'}://${trimmedUrl}`;

  try {
    const url = new URL(urlWithScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch (error) {
    return null;
  }
};

const BrowserSection = (): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [addressText, setAddressText] = React.useState(defaultBrowserUrl);
  const [currentUrl, setCurrentUrl] = React.useState(defaultBrowserUrl);
  const [canGoBack, setCanGoBack] = React.useState(false);
  const [canGoForward, setCanGoForward] = React.useState(false);
  const [loadError, setLoadError] = React.useState<?BrowserLoadError>(null);
  const [iframeReloadKey, setIframeReloadKey] = React.useState(0);
  const webviewRef = React.useRef<any>(null);
  const isWebviewReady = React.useRef(false);
  const pendingWebviewUrl = React.useRef<?string>(null);
  const isWebviewAvailable = !!electron;

  const inputStyle = {
    ...styles.addressInput,
    color: gdevelopTheme.searchBar.textColor.default,
    backgroundColor: gdevelopTheme.searchBar.backgroundColor.default,
    borderColor: gdevelopTheme.home.separator.color,
  };

  const updateNavigationState = React.useCallback(() => {
    const webview = webviewRef.current;
    if (!webview || !isWebviewReady.current) {
      setCanGoBack(false);
      setCanGoForward(false);
      return;
    }

    try {
      setCanGoBack(!!(webview.canGoBack && webview.canGoBack()));
      setCanGoForward(!!(webview.canGoForward && webview.canGoForward()));
    } catch (error) {
      setCanGoBack(false);
      setCanGoForward(false);
    }
  }, []);

  const loadUrl = React.useCallback(
    (rawUrl: string) => {
      const normalizedUrl = normalizeBrowserUrl(rawUrl);
      if (!normalizedUrl) {
        setLoadError('invalid-url');
        return;
      }

      setLoadError(null);
      setCurrentUrl(normalizedUrl);
      setAddressText(normalizedUrl);

      const webview = webviewRef.current;
      if (
        isWebviewAvailable &&
        webview &&
        isWebviewReady.current &&
        webview.loadURL
      ) {
        try {
          webview.loadURL(normalizedUrl);
          pendingWebviewUrl.current = null;
        } catch (error) {
          pendingWebviewUrl.current = normalizedUrl;
        }
      } else if (isWebviewAvailable) {
        pendingWebviewUrl.current = normalizedUrl;
      }
    },
    [isWebviewAvailable]
  );

  const goBack = React.useCallback(() => {
    const webview = webviewRef.current;
    if (!webview || !isWebviewReady.current) return;

    try {
      if (webview.canGoBack && webview.canGoBack()) {
        webview.goBack();
      }
    } catch (error) {
      updateNavigationState();
    }
  }, [updateNavigationState]);

  const goForward = React.useCallback(() => {
    const webview = webviewRef.current;
    if (!webview || !isWebviewReady.current) return;

    try {
      if (webview.canGoForward && webview.canGoForward()) {
        webview.goForward();
      }
    } catch (error) {
      updateNavigationState();
    }
  }, [updateNavigationState]);

  const reload = React.useCallback(() => {
    const webview = webviewRef.current;
    if (
      isWebviewAvailable &&
      webview &&
      isWebviewReady.current &&
      webview.reload
    ) {
      try {
        webview.reload();
      } catch (error) {}
      return;
    }

    setIframeReloadKey(key => key + 1);
  }, [isWebviewAvailable]);

  const openExternally = React.useCallback(() => {
    const normalizedUrl = normalizeBrowserUrl(addressText || currentUrl);
    if (normalizedUrl) Window.openExternalURL(normalizedUrl);
  }, [addressText, currentUrl]);

  const onSubmit = React.useCallback(
    event => {
      event.preventDefault();
      loadUrl(addressText);
    },
    [addressText, loadUrl]
  );

  React.useEffect(
    () => {
      const webview = webviewRef.current;
      if (!webview || !isWebviewAvailable) return;

      const onDomReady = () => {
        isWebviewReady.current = true;
        if (pendingWebviewUrl.current && webview.loadURL) {
          try {
            webview.loadURL(pendingWebviewUrl.current);
            pendingWebviewUrl.current = null;
          } catch (error) {}
        }
        updateNavigationState();
      };
      const onDidStartLoading = () => {
        setLoadError(null);
      };
      const onDidStopLoading = () => {
        updateNavigationState();
      };
      const onDidNavigate = event => {
        if (!event.url) return;
        setCurrentUrl(event.url);
        setAddressText(event.url);
        updateNavigationState();
      };
      const onDidFailLoad = event => {
        if (event.errorCode === -3) return;
        if (event.isMainFrame) {
          setLoadError('load-failed');
        }
      };
      const onNewWindow = event => {
        if (event.preventDefault) event.preventDefault();
        if (event.url) loadUrl(event.url);
      };

      webview.addEventListener('dom-ready', onDomReady);
      webview.addEventListener('did-start-loading', onDidStartLoading);
      webview.addEventListener('did-stop-loading', onDidStopLoading);
      webview.addEventListener('did-navigate', onDidNavigate);
      webview.addEventListener('did-navigate-in-page', onDidNavigate);
      webview.addEventListener('did-fail-load', onDidFailLoad);
      webview.addEventListener('new-window', onNewWindow);
      updateNavigationState();

      return () => {
        isWebviewReady.current = false;
        webview.removeEventListener('dom-ready', onDomReady);
        webview.removeEventListener('did-start-loading', onDidStartLoading);
        webview.removeEventListener('did-stop-loading', onDidStopLoading);
        webview.removeEventListener('did-navigate', onDidNavigate);
        webview.removeEventListener('did-navigate-in-page', onDidNavigate);
        webview.removeEventListener('did-fail-load', onDidFailLoad);
        webview.removeEventListener('new-window', onNewWindow);
      };
    },
    [isWebviewAvailable, loadUrl, updateNavigationState]
  );

  return (
    <SectionContainer
      flexBody
      noScroll
      customPaperStyle={styles.sectionPaper}
    >
      <div style={styles.root}>
        <div
          style={{
            ...styles.toolbar,
            backgroundColor: gdevelopTheme.toolbar.backgroundColor,
            borderBottomColor: gdevelopTheme.toolbar.separatorColor,
          }}
        >
          <div style={styles.title}>
            <Planet fontSize="small" />
            <Text noMargin noShrink>
              <Trans>Browser</Trans>
            </Text>
          </div>
          <IconButton
            size="small"
            onClick={goBack}
            disabled={!canGoBack}
            tooltip={t`Back`}
          >
            <ArrowLeft />
          </IconButton>
          <IconButton
            size="small"
            onClick={goForward}
            disabled={!canGoForward}
            tooltip={t`Forward`}
          >
            <ArrowRight />
          </IconButton>
          <IconButton size="small" onClick={reload} tooltip={t`Reload`}>
            <Refresh />
          </IconButton>
          <form style={styles.addressForm} onSubmit={onSubmit}>
            <input
              value={addressText}
              onChange={event => setAddressText(event.currentTarget.value)}
              spellCheck="false"
              autoCapitalize="off"
              style={inputStyle}
              aria-label="URL"
            />
          </form>
          <IconButton
            size="small"
            onClick={() => loadUrl(addressText)}
            tooltip={t`Go`}
          >
            <ArrowRight />
          </IconButton>
          <IconButton
            size="small"
            onClick={openExternally}
            tooltip={t`Open externally`}
          >
            <ShareExternal />
          </IconButton>
        </div>
        <div
          style={{
            ...styles.frameContainer,
            backgroundColor: gdevelopTheme.paper.backgroundColor.dark,
          }}
        >
          {isWebviewAvailable ? (
            React.createElement('webview', {
              ref: webviewRef,
              // Keep this value stable. The webview can update its own URL
              // hash while scrolling documentation pages; mirroring that hash
              // into the src prop makes Electron reload and flicker.
              src: defaultBrowserUrl,
              partition: 'persist:gdevelop-home-browser',
              style: styles.webview,
              allowpopups: 'true',
            })
          ) : (
            <iframe
              key={iframeReloadKey}
              title="Browser"
              src={currentUrl}
              style={styles.iframe}
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-scripts allow-same-origin allow-popups-to-escape-sandbox allow-downloads"
            />
          )}
          {(loadError || !isWebviewAvailable) && (
            <div
              style={{
                ...styles.statusBar,
                backgroundColor: gdevelopTheme.toolbar.backgroundColor,
                borderTopColor: gdevelopTheme.toolbar.separatorColor,
              }}
            >
              <Text
                noMargin
                color={loadError ? 'error' : 'secondary'}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                {loadError === 'invalid-url' ? (
                  <Trans>Enter an HTTP or HTTPS URL.</Trans>
                ) : loadError === 'load-failed' ? (
                  <Trans>Unable to load this page.</Trans>
                ) : (
                  <Trans>
                    Some websites may block embedded loading outside the
                    desktop app.
                  </Trans>
                )}
              </Text>
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  );
};

const BrowserSectionWithErrorBoundary = (): React.Node => (
  <ErrorBoundary
    componentTitle={<Trans>Browser section</Trans>}
    scope="start-page-browser"
  >
    <BrowserSection />
  </ErrorBoundary>
);

export default BrowserSectionWithErrorBoundary;
