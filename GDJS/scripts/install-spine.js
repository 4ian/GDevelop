const fs = require('fs');
const path = require('path');

const format = 'utf8';

const originalSpineDir = path.resolve('node_modules/pixi-spine');
const originalSpinePackage = JSON.parse(fs.readFileSync(path.join(originalSpineDir, 'package.json'), format));
const originalSpinePath = path.join(originalSpineDir, originalSpinePackage.extensionConfig.bundle);
const originalSpine = fs.readFileSync(originalSpinePath, format);

const varSpineExport = '\nvar pixi_spine = this.PIXI.spine;\n';
const runtimeSpinePath = 'Runtime/pixi-renderers/pixi-spine.js';

fs.writeFileSync(runtimeSpinePath, originalSpine + varSpineExport, format);