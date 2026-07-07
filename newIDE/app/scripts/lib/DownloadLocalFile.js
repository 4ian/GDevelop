// @ts-check
const fs = require('fs');
const {default: axios} = require('axios');

let temporaryFileCounter = 0;

/**
 * Download a file to `outputPath`. The download is done to a temporary file
 * which is renamed at the end, so that `outputPath` is never left with a
 * partially downloaded (i.e: corrupted) file - even if the download fails
 * or if multiple downloads to the same `outputPath` are attempted.
 *
 * @param {string} url
 * @param {string} outputPath
 * @returns {Promise<void>}
 */
const downloadLocalFile = async (url, outputPath) => {
  const temporaryPath = `${outputPath}.${process.pid}-${temporaryFileCounter++}.tmp`;
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
    });

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(temporaryPath);
      let error = null;
      const onError = err => {
        error = err;
        writer.close();
        reject(err);
      };
      // Watch for errors on the response stream too: they are not forwarded
      // to the writer by `pipe`, and would otherwise leave the promise
      // pending forever.
      response.data.on('error', onError);
      writer.on('error', onError);
      writer.on('close', () => {
        if (!error) {
          resolve(undefined);
        }

        // No need to call `reject` here, as it will have been called in the
        // 'error' callback.
      });
      response.data.pipe(writer);
    });

    await fs.promises.rename(temporaryPath, outputPath);
  } catch (error) {
    await fs.promises.unlink(temporaryPath).catch(() => {});
    throw error;
  }
};

module.exports = {
  downloadLocalFile,
};
