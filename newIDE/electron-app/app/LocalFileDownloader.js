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

    log.verbose(`Downloading ${url} to ${outputPath}...`);
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: gdevelopCloudCookieValue
        ? {
            Cookie: `gd_resource=${gdevelopCloudCookieValue}`,
          }
        : {},
    });

    // Create the writer only after the request is successful.
    const writer = fs.createWriteStream(outputPath);

    return new Promise((resolve, reject) => {
      const cleanUpAndReject = (err) => {
        try { writer.destroy(); } catch (e) {}
        // Best effort to remove the incomplete file
        try { fs.unlinkSync(outputPath); } catch (e) {}
        reject(err);
      }

      response.data.on('error', cleanUpAndReject);
      writer.on('error', cleanUpAndReject);
      writer.on('finish', () => resolve(true));

      response.data.pipe(writer);
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
