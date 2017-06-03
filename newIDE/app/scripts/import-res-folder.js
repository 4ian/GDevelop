var shell = require('shelljs');

var source = '../../../Binaries/Output/Release_Windows';

var success = true;
success &= shell.mkdir('-p', '../public/CppPlatform/Extensions');
success &= shell.mkdir('-p', '../public/JsPlatform/Extensions');
success &= shell.mkdir('-p', '../public/res/');

success &= shell.cp(
  '-Rf',
  source + '/CppPlatform/*.png',
  '../public/CppPlatform/'
);
success &= shell.cp(
  '-Rf',
  source + '/CppPlatform/Extensions/*.png',
  '../public/CppPlatform/Extensions/'
);
success &= shell.cp(
  '-Rf',
  source + '/JsPlatform/Extensions/*.png',
  '../public/JsPlatform/Extensions/'
);
success &= shell.cp('-Rfu', source + '/res/*', '../public/res/');

if (success) {
  shell.echo(
    `❌ Error(s) occurred while copying images from res, CppPlatform or JsPlatform from Binaries/Output/Release_Windows`
  );
} else {
  shell.echo(
    '✅ Images from res, CppPlatform and JsPlatform properly copied in public folder'
  );
}
