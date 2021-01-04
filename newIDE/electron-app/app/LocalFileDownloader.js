const fs = require('fs');
const axios = require('axios');
const log = require('electron-log');

module.exports = {
  downloadLocalFile: async (url, outputPath) => {
    const writer = fs.createWriteStream(outputPath);

    log.verbose(`Downloading ${url} to ${outputPath}...`);
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
          resolve(true);
        }
        // No need to call `reject` here, as it will have been called in the
        // 'error' callback.
      });
    });
  },
};
