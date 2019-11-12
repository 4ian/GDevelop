if (typeof importScripts === 'function') {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js'
  );
  /* global workbox */
  if (workbox) {
    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute([]);

    /* custom cache rules*/
    workbox.routing.registerNavigationRoute('/index.html', {
      blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/],
    });

    // Cache resources from GDevelop cloudfront server (CORS enabled).
    workbox.routing.registerRoute(
      /https:\/\/df5lqcdudryde\.cloudfront\.net\/.*$/,
      workbox.strategies.networkFirst({
        cacheName: 'gdevelop-cloudfront-df5lqcdudryde',
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
