/* eslint-disable no-restricted-globals */
// ============================================================================
// IndexedDB Virtual File System for Local Previews
// ============================================================================

console.log('[ServiceWorker] Service worker file executed');

const swURL = new URL(self.location.href);
const isDev = swURL.searchParams.has('dev');

// If updated, also update the BrowserSWIndexedDB module.
const DB_NAME = 'gdevelop-browser-sw-preview';
const STORE_NAME = 'files';
const DB_VERSION = 1;

/**
 * Opens the IndexedDB database for browser SW preview files.
 */
function openPreviewDB() {
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
        console.log('[ServiceWorker] Preview database opened successfully');
        resolve(db);
      };

      request.onupgradeneeded = () => {
        console.log('[ServiceWorker] Upgrading preview database schema...');
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
          console.log('[ServiceWorker] Created object store:', STORE_NAME);
        }
      };
    } catch (error) {
      console.error('[ServiceWorker] Exception while opening preview database:', error);
      reject(error);
    }
  });
}

/**
 * Retrieves a file from IndexedDB.
 */
async function getPreviewFile(path) {
  try {
    const db = await openPreviewDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readonly');

        transaction.onerror = () => {
          const error = transaction.error || new Error('Transaction failed');
          console.error('[ServiceWorker] Transaction error while getting file:', path, error);
          reject(error);
        };

        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.get(path);

        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            console.log('[ServiceWorker] File retrieved from IndexedDB:', path, '(' + result.bytes.byteLength + ' bytes)');
          } else {
            console.warn('[ServiceWorker] File not found in IndexedDB:', path);
          }
          resolve(result || null);
        };

        request.onerror = () => {
          const error = request.error || new Error('Get operation failed');
          console.error('[ServiceWorker] Error retrieving file from IndexedDB:', path, error);
          reject(error);
        };
      } catch (error) {
        console.error('[ServiceWorker] Exception during get operation:', path, error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('[ServiceWorker] Failed to get file from IndexedDB:', path, error);
    throw error;
  }
}

/**
 * Handles fetch events for browser SW preview files served from IndexedDB.
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Check if this is a request for a browser SW preview file
  if (url.pathname.startsWith('/browser_sw_preview/')) {
    const relativePath = url.pathname.replace('/browser_sw_preview', '');
    console.log('[ServiceWorker] Intercepting browser SW preview request:', url.pathname);

    event.respondWith((async () => {
      try {
        // Try to get the file from IndexedDB
        const fileRecord = await getPreviewFile(relativePath);

        if (!fileRecord) {
          console.warn('[ServiceWorker] File not found in IndexedDB:', relativePath);
          return new Response('File not found in browser SW preview storage', {
            status: 404,
            headers: {
              'Content-Type': 'text/plain',
            }
          });
        }

        // Return the file with appropriate headers
        console.log('[ServiceWorker] Serving file from IndexedDB:', relativePath, 'Content-Type:', fileRecord.contentType);
        return new Response(fileRecord.bytes, {
          status: 200,
          headers: {
            'Content-Type': fileRecord.contentType || 'application/octet-stream',
            // Prevent caching to ensure latest version is always served
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            // CORS headers for cross-origin requests if needed
            'Access-Control-Allow-Origin': '*',
          }
        });
      } catch (error) {
        console.error('[ServiceWorker] Error serving browser SW preview file:', relativePath, error);
        return new Response('Error loading file from browser SW preview storage: ' + error.message, {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
          }
        });
      }
    })());

    // Return early to prevent falling through to workbox routes
    return;
  }
});

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing service worker...');
  if (isDev) {
    // In development, immediately use a new service worker.
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating service worker...');

  if (isDev) {
    event.waitUntil(self.clients.claim());
  }
});

// ============================================================================
// Standard Workbox Configuration
// ============================================================================

// TODO: remove this check
// eslint-disable-next-line no-undef
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js'
);
/* global workbox */
if (workbox) {
  console.log('[ServiceWorker] Workbox loaded successfully');

  // Will be replaced by make-service-worker.js to include the proper version.
  const VersionMetadata = {};

  // Contrary to other static assets (JS, CSS, HTML), libGD.js/wasm are not
  // versioned in their filenames. Instead, we version using a query string
  // (see src/index.js where it's loaded with the same query string).
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
  console.log('[ServiceWorker] Workbox could not be loaded - no offline support');
}
