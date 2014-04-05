module.exports = function(grunt) {
    var buildDirectory = "../Binaries/Output/WebIDE/Release/";

    grunt.initConfig({
        mochacli: {
            options: {
                require: ['expect.js'],
                reporter: 'dot',
                bail: true
            },
            all: ['test/*.js']
        },
        uglify: {
          build: {
            files: [
                {src: [ 'WebIDE/**.js' ], dest:buildDirectory+'GDWebIDE.js'}
            ]
          }
        },
        clean: {
          options: { force: true },
          build: {
            src: [ buildDirectory+'GDWebIDE.js' ]
          }
        }
    });

    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('build', [ 'clean', 'uglify' ]);
    grunt.registerTask('test', ['mochacli']);
};