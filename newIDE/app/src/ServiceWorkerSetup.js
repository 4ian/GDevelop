// @flow
import optionalRequire from './Utils/OptionalRequire';
import { isNativeMobileApp } from './Utils/Platform';

const PUBLIC_URL: string = process.env.PUBLIC_URL || '';
const isDev = process.env.NODE_ENV !== 'production';

const electron = optionalRequire('electron');
const serviceWorker = navigator.serviceWorker;

export function isServiceWorkerSupported() {
  return !!serviceWorker;
}

export function registerServiceWorker() {
  if (isNativeMobileApp() || !!electron) {
    return;
  }

  if (!serviceWorker) {
    console.warn(
      'Service Worker not supported on this deployment (probably: not HTTPS and not localhost).'
    );
    return;
  }

  window.addEventListener('load', () => {
    // Use a cache-buster for development so that the service worker is
    // always reloaded when the app is reloaded.
    const swUrl = isDev
      ? `${PUBLIC_URL}/service-worker.js?dev=${Date.now()}`
      : `${PUBLIC_URL}/service-worker.js`;

    serviceWorker
      .register(swUrl)
      .then(registration => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              const alreadyHasAServiceWorker = !!serviceWorker.controller;
              if (alreadyHasAServiceWorker) {
                // At this point, the updated precached content has been fetched,
                // but the previous service worker will still serve the older
                // content until all client tabs are closed.
                console.log(
                  'New content is available and will be used when all tabs for this page are closed.'
                );
              } else {
                // Service worker has been installed for the first time.
                console.log('Content is cached for offline use.');
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('Error during service worker registration:', error);
      });

    if (isDev) {
      serviceWorker.ready.then(registration => {
        // Forces a check right now for a newer service worker script in development.
        // If there is one, it will be installed (see the service worker script to verify how in development
        // a new service worker script does a `self.skipWaiting()` and `self.clients.claim()`).
        registration.update();
      });
    }
  });
}
