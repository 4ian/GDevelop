// TODO: This could be rewritten as one (or more) pure Node.js script(s)
// without Grunt, and called from package.json.
module.exports = function(grunt) {
  const fs = require('fs');
  const isWin = /^win/.test(process.platform);
  const isDev = grunt.option('dev') || false;

  const buildOutputPath = '../Binaries/embuild/GDevelop.js/';
  const buildPath = '../Binaries/embuild';

  let cmakeBinary = 'emconfigure cmake';
  let makeBinary = 'emmake make';
  let cmakeGeneratorArg = '';

  // Use more specific paths on Windows
  if (isWin) {
    // Use make from MinGW
    if (!fs.existsSync('C:\\MinGW\\bin\\mingw32-make.exe')) {
      console.error(
        "🔴 Can't find mingw32-make in C:\\MinGW. Make sure MinGW is installed."
      );
      return;
    }
    makeBinary = 'emmake "C:\\MinGW\\bin\\mingw32-make"';

    // Find CMake in usual folders or fallback to PATH.
    if (fs.existsSync('C:\\Program Files\\CMake\\bin\\cmake.exe')) {
      cmakeBinary = 'emconfigure "C:\\Program Files\\CMake\\bin\\cmake"';
    } else if (
      fs.existsSync('C:\\Program Files (x86)\\CMake\\bin\\cmake.exe')
    ) {
      cmakeBinary = 'emconfigure "C:\\Program Files (x86)\\CMake\\bin\\cmake"';
    } else {
      console.log(
        "⚠️ Can't find CMake in its usual Program Files folder. Make sure you have cmake in your PATH instead."
      );
    }

    cmakeGeneratorArg = '-G "MinGW Makefiles"';
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
      //Launch CMake if needed
      cmake: {
        src: [buildPath + '/CMakeCache.txt', 'CMakeLists.txt'],
        command:
          cmakeBinary +
          ' ' +
          [
            cmakeGeneratorArg,
            '../..',
            '-DFULL_VERSION_NUMBER=FALSE',
            // Disable optimizations at linking time for much faster builds.
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
      //Generate glue.cpp and glue.js file using Bindings.idl, and patch them
      updateGDBindings: {
        src: 'Bindings/Bindings.idl',
        command: 'node update-bindings.js',
      },
      //Compile GDevelop with emscripten
      make: {
        command: makeBinary + ' -j 4',
        options: {
          execOptions: {
            cwd: buildPath,
            env: process.env,
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
          buildOutputPath + 'libGD.js.mem',
        ],
      },
    },
    copy: {
      newIDE: {
        files: [
          {
            expand: true,
            src: [buildOutputPath + '/libGD.*'],
            dest: '../newIDE/app/public',
            flatten: true,
          },
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
  grunt.registerTask('build', ['build:raw', 'copy:newIDE']);
};
