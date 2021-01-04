const fs = require('fs');
const axios = require('axios');
const { Transform } = require('stream');

module.exports = {
  uploadLocalFile: (localFilePath, uploadOptions, onProgress) => {
    return new Promise((resolve, reject) => {
      fs.stat(localFilePath, (err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        if (!stats || !stats.size) {
          reject(
            new Error(
              'Unable to find the size - or empty size - for ' + localFilePath
            )
          );
          return;
        }

        const fileSize = stats.size;
        const fileReadStream = fs.createReadStream(localFilePath);

        // Use a transform to follow the progress of the upload
        // (though not very accurate because following the progress
        // of the read on disk..)
        let loadedBytes = 0;
        const fileWithProgressReadStream = new Transform({
          transform(chunk, encoding, callback) {
            loadedBytes += chunk.length;
            onProgress(loadedBytes, fileSize);
            callback(undefined, chunk);
          },
        });
        fileReadStream.pipe(fileWithProgressReadStream);

        resolve(
          axios({
            method: 'PUT',
            url: uploadOptions.signedUrl,
            data: fileWithProgressReadStream,
            headers: {
              'Content-Type': uploadOptions.contentType,
              'Content-Length': fileSize,
            },
            // Allow any arbitrary large file to be sent
            maxContentLength: Infinity,
            // onUploadProgress does not work on Node.js
          })
        );
      });
    }).then(() => undefined);
  },
};
