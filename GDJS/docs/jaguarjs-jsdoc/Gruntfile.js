/**
 * http://gruntjs.com/configuring-tasks
 */
module.exports = function (grunt) {
    var path = require('path');
    var DEMO_PATH = 'demo/dist';
    var DEMO_SAMPLE_PATH = 'demo/sample';
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        connect: {
            options: {
                hostname: '*'
            },
            demo: {
                options: {
                    port: 8000,
                    base: DEMO_PATH,
                    middleware: function (connect, options) {
                        return [
                            require('connect-livereload')(),
                            connect.static(path.resolve(options.base))
                        ];
                    }
                }
            }
        },

        watch: {
            options: {
                livereload: true
            },
            less: {
                files: ['less/**/*.less'],
                tasks: ['less']
            },

            lesscopy: {
                files: ['static/styles/jaguar.css'],
                tasks: ['copy:css']
            },

            jscopy: {
                files: ['static/scripts/main.js'],
                tasks: ['copy:js']
            },

            jsdoc: {
                files: ['**/*.tmpl', '*.js'],
                tasks: ['jsdoc']
            },

            demo: {
                files: ['demo/sample/**/*.js'],
                tasks: ['demo']
            }
        },

        clean: {
            demo: {
                src: DEMO_PATH
            }
        },

        jsdoc: {
            demo: {
                src: [
                    DEMO_SAMPLE_PATH + '/**/*.js',
                    
                    // You can add README.md file for index page at documentations.
                    'README.md'
                ],
                options: {
                    verbose: true,
                    destination: DEMO_PATH,
                    configure: 'conf.json',
                    template: './',
                    'private': false
                }
            }
        },

        less: {
            dist: {
                src: 'less/**/jaguar.less',
                dest: 'static/styles/jaguar.css'
            }
        },

        copy: {
            css: {
                src: 'static/styles/jaguar.css',
                dest: DEMO_PATH + '/styles/jaguar.css'
            },

            js: {
                src: 'static/scripts/main.js',
                dest: DEMO_PATH + '/scripts/main.js'
            }
        }
    });

    // Load task libraries
    [
        'grunt-contrib-connect',
        'grunt-contrib-watch',
        'grunt-contrib-copy',
        'grunt-contrib-clean',
        'grunt-contrib-less',
        'grunt-jsdoc',
    ].forEach(function (taskName) {
        grunt.loadNpmTasks(taskName);
    });

    // Definitions of tasks
    grunt.registerTask('default', 'Watch project files', [
        'demo',
        'connect:demo',
        'watch'
    ]);

    grunt.registerTask('demo', 'Create documentations for demo', [
        'less',
        'clean:demo',
        'jsdoc:demo'
    ]);
};
