/* eslint-disable no-restricted-globals */

// ============================================================================
// Browser Service Worker powered Preview ("Browser SW Preview"), using IndexedDB.
// ============================================================================

console.log('[ServiceWorker] Service worker file executed');

const swURL = new URL(self.location.href);
const isDev = swURL.searchParams.has('dev');

// If updated, also update the BrowserSWIndexedDB module.
const DB_NAME = 'gdevelop-browser-sw-preview';
const STORE_NAME = 'files';
const INSTANCES_STORE_NAME = 'instances';
const DB_VERSION = 2;

/**
 * Opens the IndexedDB database for browser SW preview files.
 */
function openBrowserSWPreviewDB() {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        const error = request.error || new Error('Failed to open IndexedDB');
        console.error('[ServiceWorker] Error opening preview database:', error);
        reject(error);
      };

      request.onsuccess = () => {
        const db = request.result;
        resolve(db);
      };

      request.onupgradeneeded = () => {
        console.log('[ServiceWorker] Upgrading preview database schema...');
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
          console.log('[ServiceWorker] Created object store:', STORE_NAME);
        }
        if (!db.objectStoreNames.contains(INSTANCES_STORE_NAME)) {
          db.createObjectStore(INSTANCES_STORE_NAME);
          console.log(
            '[ServiceWorker] Created object store:',
            INSTANCES_STORE_NAME
          );
        }
      };
    } catch (error) {
      console.error(
        '[ServiceWorker] Exception while opening preview database:',
        error
      );
      reject(error);
    }
  });
}

/**
 * Retrieves a preview file from IndexedDB.
 */
async function getBrowserSWPreviewFile(path) {
  try {
    const db = await openBrowserSWPreviewDB();

    return new Promise((resolve, reject) => {
      let settled = false;
      const safeResolve = v => {
        if (!settled) {
          settled = true;
          resolve(v);
        }
      };
      const safeReject = e => {
        if (!settled) {
          settled = true;
          reject(e);
        }
      };

      try {
        // Sanity-check the store exists (avoids InvalidStateError).
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const err = new Error(`Object store "${STORE_NAME}" not found`);
          console.error(
            '[ServiceWorker] Missing object store while getting file:',
            path,
            err
          );
          return safeReject(err);
        }

        const tx = db.transaction(STORE_NAME, 'readonly');

        // If the transaction aborts (quota, deadlock, explicit abort, etc.), reject.
        tx.onabort = () => {
          const error = tx.error || new Error('Transaction aborted');
          console.error(
            '[ServiceWorker] Transaction aborted while getting file:',
            path,
            error
          );
          safeReject(error);
        };

        // `onerror` at the transaction level can fire even if request handlers didn’t.
        tx.onerror = () => {
          const error = tx.error || new Error('Transaction failed');
          console.error(
            '[ServiceWorker] Transaction error while getting file:',
            path,
            error
          );
          safeReject(error);
        };

        const store = tx.objectStore(STORE_NAME);
        const req = store.get(path);

        req.onsuccess = () => {
          const result = req.result;
          safeResolve(result || null);
        };

        req.onerror = () => {
          const error = req.error || new Error('Get operation failed');
          console.error(
            '[ServiceWorker] Error retrieving file from IndexedDB:',
            path,
            error
          );
          safeReject(error);
        };
      } catch (error) {
        console.error(
          '[ServiceWorker] Exception during get operation:',
          path,
          error
        );
        safeReject(error);
      }
    });
  } catch (error) {
    console.error(
      '[ServiceWorker] Failed to get file from IndexedDB:',
      path,
      error
    );
    throw error;
  }
}

/**
 * Handles fetch events for browser SW preview files served from IndexedDB.
 */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Check if this is a request for a browser SW preview file
  if (url.pathname.startsWith('/browser_sw_preview/')) {
    const relativePath = url.pathname.replace('/browser_sw_preview', '');

    event.respondWith(
      (async () => {
        try {
          // Try to get the file from IndexedDB
          const fileRecord = await getBrowserSWPreviewFile(relativePath);

          if (!fileRecord) {
            console.warn(
              '[ServiceWorker] File not found in IndexedDB:',
              relativePath
            );
            return new Response(
              'File not found in browser SW preview storage',
              {
                status: 404,
                headers: {
                  'Content-Type': 'text/plain',
                },
              }
            );
          }

          // Return the file with appropriate headers
          return new Response(fileRecord.bytes, {
            status: 200,
            headers: {
              'Content-Type':
                fileRecord.contentType || 'application/octet-stream',
              // Prevent caching to ensure latest version is always served
              'Cache-Control': 'no-store, no-cache, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
              // CORS headers for cross-origin requests if needed
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (error) {
          console.error(
            '[ServiceWorker] Error serving browser SW preview file:',
            relativePath,
            error
          );
          return new Response(
            'Error loading file from browser SW preview storage: ' +
              error.message,
            {
              status: 500,
              headers: {
                'Content-Type': 'text/plain',
              },
            }
          );
        }
      })()
    );

    // Return early to prevent falling through to workbox routes
    return;
  }
});

self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing new service worker...');

  // Immediately install the new service worker, so it can then be activated
  // (see below).
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating new service worker...');

  // The new service worker will immediately take control of all running
  // clients (i.e: other tabs of the web-app).
  // This means that our service worker should stay backward compatible.
  // But this is safer to avoid an old version of the service worker to stay
  // used despite having a new version of the app served.
  event.waitUntil(self.clients.claim());
});

// ============================================================================
// Standard Workbox Configuration (for "semi-offline"/caching of GDevelop static files and resources)
// ============================================================================

self.__WB_DISABLE_DEV_LOGS = true;

// eslint-disable-next-line no-undef
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js'
);

/* global workbox */
if (workbox) {
  console.log('[ServiceWorker] Workbox loaded successfully');

  // Will be replaced by make-service-worker.js to include the proper version.
  const VersionMetadata = {"version":"5.6.250","gitHash":"3fdb5168b25f5872347fb92a7d40165308525915","versionWithHash":"5.6.250-3fdb5168b25f5872347fb92a7d40165308525915"};

  // Contrary to other static assets (JS, CSS, HTML), libGD.js/wasm are not
  // versioned in their filenames. Instead, we version using a query string
  // (see src/index.js where it's loaded with the same query string).
  //
  // Don't cache them in development mode to ensure that the latest version is always served.
  if (!isDev) {
    workbox.precaching.precacheAndRoute([
      {
        url: `libGD.js?cache-buster=${VersionMetadata.versionWithHash}`,
        revision: null, // Revision is null because versioning included in the URL.
      },
      {
        url: `libGD.wasm?cache-buster=${VersionMetadata.versionWithHash}`,
        revision: null, // Revision is null because versioning included in the URL.
      },
    ]);
  }

  /* injection point for manifest files.  */
  workbox.precaching.precacheAndRoute([]);

  /* custom cache rules*/
  workbox.routing.registerNavigationRoute('/index.html', {
    blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/, /^\/browser_sw_preview\//],
  });

  // Cache resources from GDevelop cloudfront server (CORS enabled).
  workbox.routing.registerRoute(
    /https:\/\/resources\.gdevelop-app\.com\/.*$/,
    workbox.strategies.networkFirst({
      cacheName: 'gdevelop-resources-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 500,
        }),
      ],
    })
  );

  // TODO: this should be useless?
  workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg)$/,
    workbox.strategies.networkFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 150,
        }),
      ],
    })
  );
} else {
  console.log(
    '[ServiceWorker] Workbox could not be loaded - no offline support'
  );
}
