module.exports = function (config) {
  const testFiles = [
    './Extensions/**/tests/**.spec.js',
    './GDJS/tests/tests/**/*.js',
  ];

  const benchmarkFiles = [
    './GDJS/tests/benchmarks/init.js',
    './Extensions/**/benchmark/**.benchmark.js',
    './GDJS/tests/benchmarks/**/*.js',
  ];

  config.set({
    frameworks: ['mocha', 'sinon'],
    browserNoActivityTimeout: 400000,
    browsers: ['ChromeHeadless', 'EdgeHeadless', 'Chrome', 'Edge', 'Firefox'],
    plugins: [
      require('karma-chrome-launcher'),
      require('@chiragrupani/karma-chromium-edge-launcher'),
      require('karma-firefox-launcher'),
      require('karma-mocha'),
      require('karma-sinon'),
    ],
    client: {
      mocha: {
        reporter: 'html',
        timeout: 10000, // Give a bit more time for CIs (the default 2s can be too low sometimes, as a real browser is involved).
      },
    },
    basePath: '../..',
    proxies: {
      '/base/tests-utils/': '/base/GDJS/tests/tests-utils/',
    },
    files: [
      './GDJS/tests/node_modules/expect.js/index.js',
      {
        pattern: './GDJS/tests/tests-utils/gdjs-bootstrap.js',
        type: 'module',
        watched: true,
        included: true,
        served: true,
        nocache: false,
      },
      ...[
        //GDJS game engine files:
        './newIDE/app/resources/GDJS/Runtime/**/*.js',

        //Extensions:
        './newIDE/app/resources/GDJS/Runtime/Extensions/**/*.js',
        './newIDE/app/resources/GDJS/Runtime/Extensions/**/*.wasm',

        // Test extensions:
        './GDJS/tests/tests/Extensions/**.js',

        // Other test initialization files:
        './GDJS/tests/tests-utils/init.js',
        './GDJS/tests/tests-utils/init.pixiruntimegamewithassets.js',
        './GDJS/tests/tests-utils/init.pixiruntimegame.js',
        './GDJS/tests/tests-utils/MockedCustomObject.js',

        // Test helpers
        './Extensions/PlatformBehavior/tests/PlatformerTestHelper.js',
      ].map((pattern) => ({
        pattern,
        watched: true,
        included: false,
        served: true,
        nocache: false,
      })),

      // Source maps
      {
        pattern: './newIDE/app/resources/GDJS/Runtime/**/*.map',
        watched: false,
        included: false,
        served: true,
        nocache: true,
      },

      // Assets
      {
        pattern: './GDJS/tests/tests-utils/assets/*.jpg',
        watched: false,
        included: false,
        served: true,
        nocache: false,
      },
      {
        pattern: './GDJS/tests/tests-utils/simple-tiled-map/*.json',
        watched: false,
        included: false,
        served: true,
        nocache: false,
      },

      ...testFiles.map((pattern) => ({
        pattern,
        watched: true,
        included: false,
        served: true,
        nocache: false,
      })),
      ...(config.enableBenchmarks ? benchmarkFiles : []).map((pattern) => ({
        pattern,
        watched: true,
        included: false,
        served: true,
        nocache: false,
      })),
    ],
  });
};
