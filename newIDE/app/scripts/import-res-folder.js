var shell = require('shelljs');

var source = '../../../Binaries/Output/Release_Windows';

shell.mkdir('-p', '../public/CppPlatform/Extensions');
shell.mkdir('-p', '../public/JsPlatform/Extensions');
shell.mkdir('-p', '../public/res/');

shell.cp('-Rf', source + '/CppPlatform/*.png', '../public/CppPlatform/');
shell.cp('-Rf', source + '/CppPlatform/Extensions/*.png', '../public/CppPlatform/Extensions/');
shell.cp('-Rf', source + '/JsPlatform/Extensions/*.png', '../public/JsPlatform/Extensions/');
shell.cp('-Rfu', source + '/res/*', '../public/res/');
