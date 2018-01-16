const fs = require('fs');
const s3 = require('s3');
const awsS3 = require('aws-sdk/clients/s3');

const destinationBucket = `gd-games-in`;
const accessKeyId = 'AKIAJPLGZ22GBISUYFJQ';
const secretAccessKey = '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';
const region = 'eu-west-1';

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

    // TODO: Switch to a more robust module for uploading files
    const s3Client = s3.createClient({
      s3Client: awsS3Client,
    });

    const timestamp = '' + Date.now();
    const prefix = 'game-' + timestamp;

    var uploader = s3Client.uploadDir({
      localDir,
      s3Params: {
        Bucket: destinationBucket,
        Prefix: prefix + '/',
      },
    });
    uploader.on('error', onDone);
    uploader.on('progress', function() {
      onProgress(uploader.progressAmount, uploader.progressTotal);
    });
    uploader.on('end', function() {
      onDone(null, prefix);
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

    const timestamp = '' + Date.now();
    const prefix = 'game-archive-' + timestamp;
    const filename = 'game-archive.zip';
    var body = fs.createReadStream(localFile);

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
