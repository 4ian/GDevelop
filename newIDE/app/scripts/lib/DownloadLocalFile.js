// @ts-check
const fs = require('fs');
const {default: axios} = require('axios');

/**
 * @param {string} url
 * @param {string} outputPath
 * @returns {Promise<void>}
 */
const downloadLocalFile = async (url, outputPath) => {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, {
    responseType: 'stream',
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    let error = null;
    writer.on('error', err => {
      error = err;
      writer.close();
      reject(err);
    });
    writer.on('close', () => {
      if (!error) {
        resolve();
      }

      // No need to call `reject` here, as it will have been called in the
      // 'error' callback.
    });
  });
};

module.exports = {
  downloadLocalFile,
};
