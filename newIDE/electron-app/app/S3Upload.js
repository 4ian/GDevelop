const fs = require('fs');
const path = require('path');
const axios = require('axios');
const async = require('async');
const awsS3 = require('aws-sdk/clients/s3');
const { makeTimestampedId } = require('./Utils/TimestampedId');
const recursive = require('recursive-readdir');
const isDev = require('electron-is').dev();
const log = require('electron-log');

// TODO: These settings are duplicated in ApiConfigs.js
const GDevelopUsageApi = {
  baseUrl: isDev
    ? 'https://dwjjhr5k76.execute-api.us-east-1.amazonaws.com/dev'
    : 'https://api.gdevelop-app.com/usage',
};
const gdevelopBuildUploadRegion = 'eu-west-1';
const gdevelopBuildUploadBucket = 'gd-games-in';

const mime = {
  '.js': 'text/javascript',
  '.html': 'text/html',
};

// TODO: Duplicated in Usage.js for now
const getUploadOptions = () => {
  const token1 = 'ay+~-';
  const num = 1960 + 1;
  const token2 = 'AQ!eRHf';
  return axios
    .get(
      `${GDevelopUsageApi.baseUrl}/upload-options?token=${encodeURIComponent(
        token1 + num + token2
      )}`
    )
    .then(response => response.data);
};

module.exports = {
  /**
   * Upload the specified file to GDevelop
   * Amazon S3 inbound bucket.
   */
  uploadArchiveToBucket: (localFile, onProgress, onDone) => {
    getUploadOptions().then(
      uploadOptions => {
        log.info('Properly got upload options');
        const awsS3Client = new awsS3({
          accessKeyId: uploadOptions.upload.ak1 + uploadOptions.upload.ak2,
          secretAccessKey: uploadOptions.upload.sa1 + uploadOptions.upload.sa2,
          region: gdevelopBuildUploadRegion,
          correctClockSkew: true,
        });

        const prefix = 'game-archive-' + makeTimestampedId();
        const filename = 'game-archive.zip';
        const body = fs.createReadStream(localFile);

        log.info('Starting upload');
        awsS3Client
          .upload({
            Body: body,
            Bucket: gdevelopBuildUploadBucket,
            Key: prefix + '/' + filename,
          })
          .on('httpUploadProgress', function(progress) {
            onProgress(progress.loaded, progress.total || 0);
          })
          .send(function(err, data) {
            if (err) {
              log.error('Upload finished with errors:', err);
            } else {
              log.info('Upload finished without errors.');
            }
            onDone(err, prefix + '/' + filename);
          });
      },
      err => {
        log.error('Error while getting upload options:', err);
        onDone(err);
      }
    );
  },
};
