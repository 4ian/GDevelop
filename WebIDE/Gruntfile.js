module.exports = function(grunt) {
    var buildDirectory = "../Binaries/Output/WebIDE/Release/";

    grunt.initConfig({
        mochacli: {
            options: {
                require: ['expect.js'],
                bail: true
            },
            all: ['test/*.js']
        },
        concat: {
          options: {
            separator: ';',
          },
          dist: {
            src: ['WebIDE/prejs.js', buildDirectory+'libGD.raw.js', 'WebIDE/postjs.js'],
            dest: buildDirectory+'libGD.js',
          },
        },
        uglify: {
          build: {
            files: [
                {src: [ buildDirectory+'libGD.js' ], dest:buildDirectory+'libGD.min.js'}
            ]
          }
        },
        clean: {
          options: { force: true },
          build: {
            src: [ buildDirectory+'libGD.js', buildDirectory+'libGD.min.js' ]
          }
        },
        compress: {
          main: {
            options: {
              mode: 'gzip'
            },
            files: [
              {expand: true, src: [buildDirectory+'/libGD.js'], dest: '.', ext: '.js.gz'}
            ]
          }
        }
    });

    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.registerTask('build', [ 'clean', 'concat', 'compress' ]);
    grunt.registerTask('test', ['mochacli']);
};