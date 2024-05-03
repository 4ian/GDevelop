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
const commitHash = args['commitHash'];
const pathToArtifacts = `https://gdevelop-releases.s3.amazonaws.com/master/${
  commitHash ? 'commit/' + commitHash : 'latest'
}`;

// The version is read from `newIDE/electron-app/app/package.json`. It must
// always be the source of truth and the only place to update when the version
// is changed.
const electronAppPackageJson = require('../../electron-app/app/package.json');
const version = electronAppPackageJson.version;

// ℹ️ Note: the latest.yml, latest-mac.yml and latest-linux.yml are downloaded, but could also be generated
// by computing:
// - The SHA-512 of the file:
//   - `shasum -a 512 GDevelop-5-Setup-5.0.xxx.exe | cut -f1 -d\  | xxd -r -p | base64` (tested on macOS).
//   - OR using the script at https://github.com/electron-userland/electron-builder/issues/3913#issuecomment-504698845
// - The size in bytes of the file.

shell.echo(
  `⚠️ This will download the latest artifacts built for master for version ${version}. Please ensure the CI finished building everything before continuing.`
);

const artifactsToDownload = {
  // Windows:
  'Windows exe': {
    url: `${pathToArtifacts}/GDevelop 5 Setup ${version}.exe`,
    outputFilename: `GDevelop-5-Setup-${version}.exe`,
  },
  'Windows exe blockmap': {
    url: `${pathToArtifacts}/GDevelop 5 Setup ${version}.exe.blockmap`,
    outputFilename: `GDevelop-5-Setup-${version}.exe.blockmap`,
  },
  'Windows AppX': {
    url: `${pathToArtifacts}/GDevelop 5 ${version}.appx`,
    outputFilename: `GDevelop 5 ${version}.appx`,
  },
  'Windows auto-update file': {
    url: `${pathToArtifacts}/latest.yml`,
    outputFilename: 'latest.yml',
  },
  // macOS (Universal):
  'macOS zip': {
    url: `${pathToArtifacts}/GDevelop 5-${version}-universal-mac.zip`,
    outputFilename: `GDevelop-5-${version}-universal-mac.zip`,
  },
  'macOS dmg': {
    url: `${pathToArtifacts}/GDevelop 5-${version}-universal.dmg`,
    outputFilename: `GDevelop-5-${version}-universal.dmg`,
  },
  'macOS dmg blockmap': {
    url: `${pathToArtifacts}/GDevelop 5-${version}-universal.dmg.blockmap`,
    outputFilename: `GDevelop-5-${version}-universal.dmg.blockmap`,
  },
  'macOS auto-update file': {
    url: `${pathToArtifacts}/latest-mac.yml`,
    outputFilename: 'latest-mac.yml',
  },
  // Linux (amd64 and arm64):
  'Linux AppImage (amd64)': {
    url: `${pathToArtifacts}/GDevelop 5-${version}.AppImage`,
    outputFilename: `GDevelop-5-${version}.AppImage`,
  },
  'Linux AppImage (arm64)': {
    url: `${pathToArtifacts}/GDevelop 5-${version}-arm64.AppImage`,
    outputFilename: `GDevelop-5-${version}-arm64.AppImage`,
  },
  'Linux auto-update file (amd64)': {
    url: `${pathToArtifacts}/latest-linux.yml`,
    outputFilename: 'latest-linux.yml',
  },
  'Linux auto-update file (arm64)': {
    url: `${pathToArtifacts}/latest-linux-arm64.yml`,
    outputFilename: 'latest-linux-arm64.yml',
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
