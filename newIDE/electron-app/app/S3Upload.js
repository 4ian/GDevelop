const fs = require('fs');
const path = require('path');
const async = require('async');
const awsS3 = require('aws-sdk/clients/s3');
const { makeTimestampedId } = require('./Utils/TimestampedId');
const recursive = require('recursive-readdir');

const destinationBucket = `gd-games-in`;
const accessKeyId = 'AKIAJPLGZ22GBISUYFJQ';
const secretAccessKey = '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';
const region = 'eu-west-1';
const mime = {
  '.js': 'text/javascript',
  '.html': 'text/html',
};

module.exports = {
  /**
   * Upload the specified directory to GDevelop
   * Amazon S3 inbound bucket.
   */
  uploadGameFolderToBucket: (localDir, onProgress, onDone) => {
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
            const filename = path.relative(localDir, localFile);
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
