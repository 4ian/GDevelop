const fs = require('fs');
const path = require('path');

const originalSpinePath = path.join('node_modules/pixi-spine/dist', 'pixi-spine.js');
const originalPixiSpine = fs.readFileSync(originalSpinePath);

const varSpineExport = '\nvar pixi_spine = this.PIXI.spine;\n';
const runtimeSpinePath = path.join('Runtime/pixi-renderers', 'pixi-spine.js');

fs.writeFileSync(runtimeSpinePath, originalPixiSpine + varSpineExport);