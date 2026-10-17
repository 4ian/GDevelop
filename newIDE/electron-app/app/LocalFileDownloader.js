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

// `url` ultimately comes from a resource's "file" path, which is stored in
// (and can be set by) the project file itself - so it must be treated as
// untrusted. Only ever attach the GDevelop cloud session cookie when the
// request is actually going to a gdevelop.io host; otherwise a project
// resource pointing at an attacker-controlled URL would exfiltrate the
// visitor's cloud session cookie to that host.
const isGDevelopCloudHost = url => {
  try {
    const { hostname, protocol } = new URL(url);
    return (
      (protocol === 'https:' || protocol === 'http:') &&
      (hostname === 'gdevelop.io' || hostname.endsWith('.gdevelop.io'))
    );
  } catch (error) {
    return false;
  }
};

module.exports = {
  /**
   * @param {string} url
   * @param {string} outputPath
   */
  downloadLocalFile: async (url, outputPath) => {
    const gdevelopCloudCookieValue = isGDevelopCloudHost(url)
      ? await findGDevelopCloudCookieValue()
      : null;

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
      let isRejectedOrResolvedAlready = false;

      const cleanUpAndReject = err => {
        if (isRejectedOrResolvedAlready) return;
        isRejectedOrResolvedAlready = true;

        try {
          writer.destroy();
        } catch (e) {}
        // Best effort to remove the incomplete file
        try {
          fs.unlinkSync(outputPath);
        } catch (e) {}
        reject(err);
      };

      response.data.on('error', cleanUpAndReject);
      writer.on('error', cleanUpAndReject);
      writer.on('finish', () => {
        if (isRejectedOrResolvedAlready) return;
        isRejectedOrResolvedAlready = true;
        resolve(true);
      });

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
