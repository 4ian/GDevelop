// TODO: This could be rewritten as one (or more) pure Node.js script(s)
// without Grunt, and called from package.json.
module.exports = function (grunt) {
  const fs = require('fs');
  const path = require('path');
  const isWin = /^win/.test(process.platform);
  const isDev = grunt.option('dev') || false;
  const useMinGW = grunt.option('use-MinGW') || false;

  const buildOutputPath = '../Binaries/embuild/GDevelop.js/';
  const buildPath = '../Binaries/embuild';

  let cmakeBinary = 'emcmake cmake';
  let cmakeGeneratorArgs = [];
  let makeBinary = 'emmake make';
  let makeArgs = ['-j 8'];

  // Use more specific paths on Windows
  if (isWin) {
    let makeProgram = '';
    if (useMinGW) {
      // Use make from MinGW
      if (!fs.existsSync('C:\\MinGW\\bin\\mingw32-make.exe')) {
        console.error(
          "🔴 Can't find mingw32-make in C:\\MinGW. Make sure MinGW is installed."
        );
        return;
      }
      const mingwBinary = 'C:\\MinGW\\bin\\mingw32-make';
      cmakeGeneratorArgs = ['-G "MinGW Makefiles"'];
      makeProgram = mingwBinary;
    } else {
      // Use Ninja (by default)
      const ninjaBinary = path.join(__dirname, 'ninja', 'ninja.exe');
      cmakeGeneratorArgs = [
        '-G "Ninja"',
        `-DCMAKE_MAKE_PROGRAM="${ninjaBinary}"`,
      ];
      makeProgram = ninjaBinary;
    }

    makeBinary = `emmake "${makeProgram}"`;
    makeArgs = [];

    // Find CMake in usual folders or fallback to PATH.
    if (fs.existsSync('C:\\Program Files\\CMake\\bin\\cmake.exe')) {
      cmakeBinary = 'emcmake "C:\\Program Files\\CMake\\bin\\cmake"';
    } else if (
      fs.existsSync('C:\\Program Files (x86)\\CMake\\bin\\cmake.exe')
    ) {
      cmakeBinary = 'emcmake "C:\\Program Files (x86)\\CMake\\bin\\cmake"';
    } else {
      console.log(
        "⚠️ Can't find CMake in its usual Program Files folder. Make sure you have cmake in your PATH instead."
      );
    }
  }

  grunt.initConfig({
    mkdir: {
      embuild: {
        options: {
          create: [buildPath],
        },
      },
    },
    shell: {
      // Launch CMake if needed
      cmake: {
        src: [buildPath + '/CMakeCache.txt', 'CMakeLists.txt'],
        command:
          cmakeBinary +
          ' ' +
          [
            ...cmakeGeneratorArgs,
            '../..',
            // Disable link time optimizations for slightly faster build time.
            isDev
              ? '-DDISABLE_EMSCRIPTEN_LINK_OPTIMIZATIONS=TRUE'
              : '-DDISABLE_EMSCRIPTEN_LINK_OPTIMIZATIONS=FALSE',
          ].join(' '),
        options: {
          execOptions: {
            cwd: buildPath,
            env: process.env,
            maxBuffer: Infinity,
          },
        },
      },
      // Generate glue.cpp and glue.js file using Bindings.idl, and patch them
      updateGDBindings: {
        src: 'Bindings/Bindings.idl',
        command: 'node update-bindings.js',
      },
      // Compile GDevelop with emscripten
      make: {
        command: makeBinary + ' ' + makeArgs.join(' '),
        options: {
          execOptions: {
            cwd: buildPath,
            env: process.env,
          },
        },
      },
      // Copy the library to newIDE
      copyToNewIDE: {
        command: 'node scripts/copy-to-newIDE.js',
        options: {
          execOptions: {
            cwd: __dirname,
          },
        },
      },
      // Generate typings from the Bindings.idl
      generateFlowTypes: {
        command: 'node scripts/generate-types.js',
        options: {
          execOptions: {
            cwd: __dirname,
          },
        },
      },
      generateTSTypes: {
        command: 'node scripts/generate-dts.mjs',
        options: {
          execOptions: {
            cwd: __dirname,
          },
        },
      },
    },
    clean: {
      options: { force: true },
      build: {
        src: [
          buildPath,
          buildOutputPath + 'libGD.js',
          buildOutputPath + 'libGD.wasm',
        ],
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.registerTask('build:raw', [
    'mkdir:embuild',
    'shell:cmake',
    'newer:shell:updateGDBindings',
    'shell:make',
  ]);
  grunt.registerTask('build', [
    'build:raw',
    'shell:copyToNewIDE',
    'shell:generateFlowTypes',
    'shell:generateTSTypes',
  ]);
};
