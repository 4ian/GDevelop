// @ts-check

const fs = require('fs');
const https = require('https');

/**
 * Download a file, following redirects. Kept dependency free so that this
 * folder can be used with only `npm install` in it.
 */
const downloadFile = (url, destinationPath, redirectsLeft = 5) =>
  new Promise((resolve, reject) => {
    https
      .get(url, response => {
        const { statusCode, headers } = response;
        if (
          statusCode &&
          statusCode >= 300 &&
          statusCode < 400 &&
          headers.location
        ) {
          response.resume();
          if (redirectsLeft === 0) {
            reject(new Error(`Too many redirects for ${url}`));
            return;
          }
          downloadFile(
            headers.location,
            destinationPath,
            redirectsLeft - 1
          ).then(resolve, reject);
          return;
        }
        if (statusCode !== 200) {
          response.resume();
          reject(new Error(`Got status ${String(statusCode)} for ${url}`));
          return;
        }
        const file = fs.createWriteStream(destinationPath);
        response.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
        file.on('error', reject);
      })
      .on('error', reject);
  });

const formatBytes = size => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KiB`;
  return `${(size / 1024 / 1024).toFixed(1)} MiB`;
};

module.exports = { downloadFile, formatBytes };
