if (typeof importScripts === 'function') {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js'
  );
  /* global workbox */
  if (workbox) {
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
      blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/],
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
    console.log('Workbox could not be loaded - no offline support');
  }
} else {
  console.log(
    'importScripts does not exist on this browser - no offline support'
  );
}
