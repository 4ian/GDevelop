module.exports = function(grunt) {
  var fs = require('fs');
  var isWin = /^win/.test(process.platform);

  var emscriptenPath = process.env.EMSCRIPTEN;
  var emscriptenMemoryProfiler = emscriptenPath + '/src/memoryprofiler.js';
  var cmakeToolchainpath =
    emscriptenPath + '/cmake/Modules/Platform/Emscripten.cmake';
  var buildOutputPath = '../Binaries/Output/libGD.js/Release/';
  var buildPath = '../Binaries/embuild';

  var cmakeBinary = 'emconfigure cmake';
  var makeBinary = 'emmake make';

  // Find CMake and make in default paths on Windows
  if (isWin) {
    makeBinary = 'emmake "C:\\MinGW\\bin\\mingw32-make"';
    if (fs.existsSync('C:\\Program Files\\CMake\\bin\\cmake')) {
      cmakeBinary = 'emconfigure "C:\\Program Files\\CMake\\bin\\cmake"';
    } else if (fs.existsSync('C:\\Program Files (x86)\\CMake\\bin\\cmake')) {
      cmakeBinary = 'emconfigure "C:\\Program Files (x86)\\CMake\\bin\\cmake"';
    }
  }

  //Sanity checks
  if (!process.env.EMSCRIPTEN) {
    console.error('🔴 EMSCRIPTEN env. variable is not set');
    console.log(
      '⚠️ Please set Emscripten environment by launching `emsdk_env` script (`emsdk_env.bat` on Windows)'
    );
  }
  if (!fs.existsSync(emscriptenMemoryProfiler)) {
    console.error(
      '🔴 Unable to find memoryprofiler.js inside Emscripten sources'
    );
    console.log(
      "⚠️ Building with profiler (build:with-profiler task) won't work"
    );
  }

  grunt.initConfig({
    concat: {
      options: {
        separator: ';',
      },
      'without-profiler': {
        src: [
          'Bindings/prejs.js',
          buildOutputPath + 'libGD.raw.js',
          'Bindings/glue.js',
          'Bindings/postjs.js',
        ],
        dest: buildOutputPath + 'libGD.js',
      },
      'with-profiler': {
        src: [
          'Bindings/prejs.js',
          buildOutputPath + 'libGD.raw.js',
          'Bindings/glue.js',
          emscriptenMemoryProfiler,
          'Bindings/postjs.js',
        ],
        dest: buildOutputPath + 'libGD.js',
      },
    },
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
          ' ../.. -DFULL_VERSION_NUMBER=FALSE',
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
    uglify: {
      build: {
        files: [
          {
            src: [buildOutputPath + 'libGD.js'],
            dest: buildOutputPath + 'libGD.min.js',
          },
        ],
      },
    },
    clean: {
      options: { force: true },
      build: {
        src: [buildOutputPath + 'libGD.js', buildOutputPath + 'libGD.min.js'],
      },
    },
    compress: {
      main: {
        options: {
          mode: 'gzip',
        },
        files: [
          {
            expand: true,
            src: [buildOutputPath + '/libGD.js'],
            dest: '.',
            ext: '.js.gz',
          },
        ],
      },
    },
    copy: {
      newIDE: {
        files: [
          {
            expand: true,
            src: [buildOutputPath + '/libGD.js'],
            dest: '../newIDE/app/public',
            flatten: true,
          },
        ],
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.registerTask('build:raw', [
    'clean',
    'mkdir:embuild',
    'newer:shell:cmake',
    'newer:shell:updateGDBindings',
    'shell:make',
  ]);
  grunt.registerTask('build', [
    'build:raw',
    'concat:without-profiler',
    'compress',
    'copy:newIDE',
  ]);
  grunt.registerTask('build:with-profiler', [
    'build:raw',
    'concat:with-profiler',
    'compress',
    'copy:newIDE',
  ]);
};
