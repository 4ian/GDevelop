const path = require('path');
const shell = require('shelljs');

const readContent = (path, testErrorMessage) => {
    if (!shell.test('-f', path)) throw new Error(`${testErrorMessage} Should exist by ${path}.`);

    const readingResult = shell.cat(path);

    if (readingResult.stderr) throw new Error(readingResult.stderr);

    return readingResult.toString();
};

try {
    shell.echo(`Start pixi-spine.js copying...`);
    
    const originalSpineDir = path.resolve('node_modules/pixi-spine');
    const originalSpinePackage = JSON.parse(readContent(path.join(originalSpineDir, 'package.json'), 'Cannot find pixi-spine package.json file.'));
    const originalSpineContent = readContent(path.join(originalSpineDir, originalSpinePackage.extensionConfig.bundle), 'Cannot find pixi-spine.js.');
    
    const varSpineExport = '\nvar pixi_spine = this.PIXI.spine;\n';
    const runtimeSpineDir = '../Extensions/Spine/pixi-spine';
    
    if (!shell.test('-d', runtimeSpineDir)) {
        shell.echo(`Creating directory for pixi-spine.js ${runtimeSpineDir}.`);
        shell.mkdir(runtimeSpineDir);
    }
    
    const runtimeSpinePath = path.join(runtimeSpineDir, 'pixi-spine.js');
    new shell.ShellString(originalSpineContent + varSpineExport).to(runtimeSpinePath);

    shell.echo(`✅ Properly copied pixi-spine.js from node_modules to ${runtimeSpinePath}.`);
} catch(error) {
  shell.echo(`❌ Unable to copy pixi-spine.js from node_modules. Error is: ${error}`)
  shell.exit(1);
}
