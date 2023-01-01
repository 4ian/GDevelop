const fs = require('fs');
const axios = require('axios');
const log = require('electron-log');
const { session } = require('electron');

const findGDevelopCloudCookieValue = async () => {
  /** @type {import("electron").Cookie[]} */
  let cookies = [];
  try {
    cookies = await session.defaultSession.cookies.get({
      domain: 'gdevelop.io',
      name: 'gd_resource',
    });
  } catch (error) {
    log.error('Error while reading cookies:', error);
  }

  const gdevelopCloudCookieValue = cookies[0] ? cookies[0].value : null;
  return gdevelopCloudCookieValue;
};

module.exports = {
  /**
   * @param {string} url
   * @param {string} outputPath
   */
  downloadLocalFile: async (url, outputPath) => {
    const gdevelopCloudCookieValue = await findGDevelopCloudCookieValue();

    const writer = fs.createWriteStream(outputPath);

    log.verbose(`Downloading ${url} to ${outputPath}...`);
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: gdevelopCloudCookieValue
        ? {
            Cookie: `gd_resource=${gdevelopCloudCookieValue}`,
          }
        : {},
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
  /**
   * @param {ArrayBuffer} arrayBuffer
   * @param {string} outputPath
   */
  saveLocalFileFromArrayBuffer: async (arrayBuffer, outputPath) => {
    await fs.promises.writeFile(outputPath, Buffer.from(arrayBuffer));
  },
};
