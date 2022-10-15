const shell = require('shelljs');
const axios = require('axios');
const args = require('minimist')(process.argv.slice(2));

if (!args['cf-zoneid'] || !args['cf-token']) {
  shell.echo(
    '❌ You must pass --cf-zoneid, --cf-token to purge the CloudFare cache.'
  );
  shell.exit(1);
}

shell.echo('ℹ️ Purging Cloudflare cache...');

const zoneId = args['cf-zoneid'];
const purgeCacheUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;

axios
  .post(
    purgeCacheUrl,
    {
      files: [
        // Update index.html:
        'https://editor.gdevelop.io/',
        'https://editor.gdevelop.io/index.html',
        // Purge service worker (otherwise old service worker will serve the old index.html):
        'https://editor.gdevelop.io/service-worker.js',
        // Purge libGD.js to avoid incompatibilities:
        'https://editor.gdevelop.io/libGD.js',
        'https://editor.gdevelop.io/libGD.mem',
        // Purge other files:
        'https://editor.gdevelop.io/manifest.json',
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${args['cf-token']}`,
        'Content-Type': 'application/json',
      },
    }
  )
  .then(response => response.data)
  .then(() => {
    shell.echo('✅ Cache purge done.');
  })
  .catch(error => {
    shell.echo('❌ Error while requesting cache purge (are your identifiers correct?)');
    shell.echo(error.message || '(unknown error)');
    shell.exit(1);
  });
