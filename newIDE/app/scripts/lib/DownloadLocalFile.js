// @ts-check
const fs = require('fs');
const {default: axios} = require('axios');

/**
 * @param {string} url
 * @param {string} outputPath
 * @returns {Promise<void>}
 */
const downloadLocalFile = async (url, outputPath) => {
  const temporaryOutputPath = outputPath + '.download';
  if (fs.existsSync(temporaryOutputPath)) {
    fs.unlinkSync(temporaryOutputPath);
  }

  const writer = fs.createWriteStream(temporaryOutputPath);
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
        fs.renameSync(temporaryOutputPath, outputPath);
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
