const fs = require('fs');
const path = require('path');
const async = require('async');
const awsS3 = require('aws-sdk/clients/s3');
const { makeTimestampedId } = require('./Utils/TimestampedId');
const recursive = require('recursive-readdir');

const accessKeyId = process.env.UPLOAD_S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.UPLOAD_S3_SECRET_ACCESS_KEY;
const destinationBucket = `gd-games-in`;
const region = 'eu-west-1';
const mime = {
  '.js': 'text/javascript',
  '.html': 'text/html',
};

if (!accessKeyId || !secretAccessKey) {
  console.warn(
    "⚠️ Either UPLOAD_S3_ACCESS_KEY_ID or UPLOAD_S3_SECRET_ACCESS_KEY are not defined. Upload of builds in the web-app won't be working."
  );
  console.info(
    'ℹ️ Copy .env.dist file to .env and fill the values to fix this warning.'
  );
}

module.exports = {
  /**
   * Upload the specified directory to GDevelop
   * Amazon S3 inbound bucket.
   */
  uploadGameFolderToBucket: (localDir, onProgress, onDone) => {
    if (!accessKeyId || !secretAccessKey) {
      onDone('Missing S3 configuration');
      return;
    }

    const awsS3Client = new awsS3({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: region,
      correctClockSkew: true,
    });

    const prefix = 'game-' + makeTimestampedId();
    recursive(localDir)
      .then(allFiles => {
        const updateProgress = (fileIndex, loaded, total) => {
          onProgress(fileIndex + (total ? loaded / total : 0), allFiles.length);
        };

        async.series(
          allFiles.map((localFile, fileIndex) => callback => {
            const body = fs.createReadStream(localFile);
            // Convert backslashs in paths to forward slash as they won't
            // work in AWS urls.
            const filename = path.relative(localDir, localFile).replace(/\\/g,'/');
            const fileExtension = path.extname(filename);
            awsS3Client
              .upload({
                Body: body,
                Bucket: destinationBucket,
                Key: prefix + '/' + filename,
                ContentType: mime[fileExtension],
              })
              .on('httpUploadProgress', function(progress) {
                updateProgress(fileIndex, progress.loaded, progress.total || 0);
              })
              .send(function(err, data) {
                callback(err, prefix + '/' + filename);
              });
          }),
          (err, results) => {
            if (err) {
              onDone(err);
            }

            onDone(null, prefix);
          }
        );
      })
      .catch(err => {
        console.error('Unable to recursively read directory ' + localDir);
        onDone(err);
      });
  },

  /**
   * Upload the specified file to GDevelop
   * Amazon S3 inbound bucket.
   */
  uploadArchiveToBucket: (localFile, onProgress, onDone) => {
    if (!accessKeyId || !secretAccessKey) {
      onDone('Missing S3 configuration');
      return;
    }

    const awsS3Client = new awsS3({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: region,
      correctClockSkew: true,
    });

    const prefix = 'game-archive-' + makeTimestampedId();
    const filename = 'game-archive.zip';
    const body = fs.createReadStream(localFile);

    awsS3Client
      .upload({
        Body: body,
        Bucket: destinationBucket,
        Key: prefix + '/' + filename,
      })
      .on('httpUploadProgress', function(progress) {
        onProgress(progress.loaded, progress.total || 0);
      })
      .send(function(err, data) {
        onDone(err, prefix + '/' + filename);
      });
  },
};
