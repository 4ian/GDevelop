/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'com.gdevelop-app.ide',
  extraResources: [
    {
      from: '../app/resources/in-app-tutorials',
      to: 'in-app-tutorials',
    },
    {
      from: '../app/resources/GDJS',
      to: 'GDJS',
    },
    {
      from: '../app/resources/preview_node_modules',
      to: 'preview_node_modules',
    },
  ],
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'deb',
        arch: ['x64', 'arm64'],
      },
    ],
  },
  mac: {
    category: 'public.app-category.developer-tools',
    hardenedRuntime: true,
    entitlements: './build/entitlements.mac.inherit.plist',
    target: {
      target: 'default',
      arch: ['universal'],
    },
  },
  win: {
    executableName: 'GDevelop',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
  appx: {
    publisherDisplayName: 'GDevelop game engine',
    displayName: 'GDevelop',
    publisher: 'CN=B13CB8D3-97AA-422C-A394-0EE51B9ACAD3',
    identityName: 'GDevelopgameengine.GDevelop',
    backgroundColor: '#524F9C',
    languages: [
      'EN-US',
      'ZH-HANS',
      'DE',
      'IT',
      'JA',
      'PT-BR',
      'RU',
      'ES',
      'FR',
      'SL',
    ],
  },
  afterSign: 'scripts/electron-builder-after-sign.js',
  publish: [
    {
      provider: 'github',
    },
  ],
};

if (
  process.env.GD_SIGNTOOL_SUBJECT_NAME &&
  process.env.GD_SIGNTOOL_THUMBPRINT
) {
  config.win.certificateSubjectName = process.env.GD_SIGNTOOL_SUBJECT_NAME;
  config.win.certificateSha1 = process.env.GD_SIGNTOOL_THUMBPRINT;

  // electron-builder default signtool.exe is not sufficient for some reason.
  if (!process.env.SIGNTOOL_PATH) {
    console.error(
      "❌ SIGNTOOL_PATH is not specified - signing won't work with the builtin signtool provided by electron-builder."
    );
  } else {
    console.log(
      'ℹ️ SIGNTOOL_PATH is specified and set to:',
      process.env.SIGNTOOL_PATH
    );
  }

  // Seems required, see https://github.com/electron-userland/electron-builder/issues/6158#issuecomment-1587045539.
  config.win.signingHashAlgorithms = ['sha256'];
  console.log('ℹ️ Set Windows build signing options:', config.win);
} else {
  console.log('ℹ️ No Windows build signing options set.');
}

module.exports = config;
