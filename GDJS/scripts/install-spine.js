const path = require('path');
const shell = require('shelljs');

const readContent = (path, testErrorMessage) => {
    if (!shell.test('-f', path)) {
        shell.echo(`❌ ${testErrorMessage} Should exist in ${path} folder.`);
        shell.exit(1);
    }

    const readingResult = shell.cat(path);

    if (readingResult.stderr) {
        shell.echo(`❌ Error during ${path} reading: ${readingResult.stderr}`);
        shell.exit(1);
    }

    return readingResult.toString();
}

const originalSpineDir = path.resolve('node_modules/pixi-spine');
const originalSpinePackage = JSON.parse(readContent(path.join(originalSpineDir, 'package.json'), 'Cannot find pixi-spine package.json file.'));
const originalSpineContent = readContent(path.join(originalSpineDir, originalSpinePackage.extensionConfig.bundle), 'Cannot find pixi-spine bundle.');

const varSpineExport = '\nvar pixi_spine = this.PIXI.spine;\n';
const runtimeSpineDir = '../Extensions/Spine/pixi-spine';

if (!shell.test('-d', runtimeSpineDir)) {
    shell.echo(`Creating directory for pixi-spine bundle ${runtimeSpineDir}.`);
    shell.mkdir(runtimeSpineDir);
}

const runtimeSpinePath = path.join(runtimeSpineDir, 'pixi-spine.js');
new shell.ShellString(originalSpineContent + varSpineExport).to(runtimeSpinePath);

