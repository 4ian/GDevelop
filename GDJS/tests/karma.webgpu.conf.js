const baseConfiguration = require('./karma.conf');

module.exports = function (config) {
  let options = null;
  baseConfiguration({
    enableBenchmarks: false,
    set(baseOptions) {
      options = baseOptions;
    },
  });
  options.files.push('./GDJS/tests/webgpu/ClothSimulationWebGpuSmoke.spec.js');
  options.browsers = ['ChromeHeadlessWebGPU'];
  options.customLaunchers.ChromeHeadlessWebGPU = {
    base: 'ChromeHeadless',
    flags: ['--enable-unsafe-webgpu', '--enable-features=Vulkan'],
  };
  options.client.mocha.grep =
    'Cloth WebGPU compute and WebGL render coexistence';
  config.set(options);
};
