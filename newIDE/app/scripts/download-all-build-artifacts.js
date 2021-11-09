// @ts-check
const shell = require('shelljs');
const path = require('path');
const { downloadLocalFile } = require('./lib/DownloadLocalFile');
const args = require('minimist')(process.argv.slice(2));

if (!args['outputPath']) {
  shell.echo(
    '❌ You must pass --outputPath with the directory where to store downloaded artifacts.'
  );
  shell.exit(1);
}
const outputPath = args['outputPath'];

// The version is read from `newIDE/electron-app/app/package.json`. It must
// always be the source of truth and the only place to update when the version
// is changed.
const electronAppPackageJson = require('../../electron-app/app/package.json');
const version = electronAppPackageJson.version;

shell.echo(
  `⚠️ This will download the latest artifacts built for master for version ${version}. Please ensure the CI finished building everything before continuing.`
);

const artifactsToDownload = {
  'Windows exe': {
    url: `https://gdevelop-releases.s3.amazonaws.com/master/latest/GDevelop 5 Setup ${version}.exe`,
    outputFilename: `GDevelop-5-Setup-${version}.exe`,
  },
  'Windows exe blockmap': {
    url: `https://gdevelop-releases.s3.amazonaws.com/master/latest/GDevelop 5 Setup ${version}.exe.blockmap`,
    outputFilename: `GDevelop-5-Setup-${version}.exe.blockmap`,
  },
  'Windows AppX': {
    url: `https://gdevelop-releases.s3.amazonaws.com/master/latest/GDevelop 5 ${version}.appx`,
    outputFilename: `GDevelop 5 ${version}.appx`,
  },
  'Windows auto-update file': {
    url: 'https://gdevelop-releases.s3.amazonaws.com/master/latest/latest.yml',
    outputFilename: 'latest.yml',
  },
  'macOS zip': {
    url: `https://gdevelop-releases.s3.amazonaws.com/master/latest/GDevelop 5-${version}-mac.zip`,
    outputFilename: `GDevelop-5-${version}-mac.zip`,
  },
  'macOS dmg': {
    url: `https://gdevelop-releases.s3.amazonaws.com/master/latest/GDevelop 5-${version}.dmg`,
    outputFilename: `GDevelop-5-${version}.dmg`,
  },
  'macOS dmg blockmap': {
    url: `https://gdevelop-releases.s3.amazonaws.com/master/latest/GDevelop 5-${version}.dmg.blockmap`,
    outputFilename: `GDevelop-5-${version}.dmg.blockmap`,
  },
  'macOS auto-update file': {
    url:
      'https://gdevelop-releases.s3.amazonaws.com/master/latest/latest-mac.yml',
    outputFilename: 'latest-mac.yml',
  },
  'Linux AppImage': {
    url: `https://gdevelop-releases.s3.amazonaws.com/master/latest/GDevelop 5-${version}.AppImage`,
    outputFilename: `GDevelop-5-${version}.AppImage`,
  },
  'Linux auto-update file': {
    url:
      'https://gdevelop-releases.s3.amazonaws.com/master/latest/latest-linux.yml',
    outputFilename: 'latest-linux.yml',
  },
};

(async () => {
  shell.mkdir('-p', outputPath);

  for (const key in artifactsToDownload) {
    const { url, outputFilename } = artifactsToDownload[key];

    shell.echo(
      `ℹ️ Downloading ${key} artifact (${url}) to ${outputFilename}...`
    );
    try {
      await downloadLocalFile(url, path.join(outputPath, outputFilename));
    } catch (error) {
      shell.echo(`❌ Error while downloading ${key} artifact. Aborting.`);
      shell.exit(2);
    }
  }
})();
