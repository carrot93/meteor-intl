'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    clean: {
      dist: 'dist/',
      lib : 'lib/',
      tmp : 'tmp/'
    },

    copy: {
      tmp: {
        expand : true,
        flatten: true,
        src    : ['tmp/src/*.js'],
        dest   : 'lib/'
      }
    },

    concat: {
      dist_with_locales: {
        src: ['dist/meteor-intl.js', 'dist/locale-data/*.js'],
        dest: 'dist/meteor-intl-with-locales.js'
      }
    },

    extract_cldr_data: {
      options: {
        pluralRules   : true,
        relativeFields: true
      },

      src_en: {
        dest: 'src/en.js',

        options: {
          locales: ['en'],
          prelude: '// GENERATED FILE\n',

          wrapEntry: function (entry) {
            return 'export default ' + entry + ';';
          }
        }
      },

      lib_all: {
        dest: 'lib/locales.js',

        options: {
          prelude: [
            '// GENERATED FILE',
            'var MeteorIntl = require("./meteor-intl");\n\n'
          ].join('\n'),

          wrapEntry: function (entry) {
            return 'MeteorIntl.__addLocaleData(' + entry + ');';
          }
        }
      },

      dist_all: {
        dest: 'dist/locale-data/',

        options: {
          wrapEntry: function (entry) {
            return 'this.MeteorIntl.__addLocaleData(' + entry + ');';
          }
        }
      }
    },

    bundle_jsnext: {
      dest: 'dist/meteor-intl.js',

      options: {
        namespace: 'MeteorIntl'
      }
    },

    cjs_jsnext: {
      dest: 'tmp/'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-benchmark');
  grunt.loadNpmTasks('grunt-bundle-jsnext-lib');
  grunt.loadNpmTasks('grunt-extract-cldr-data');

  grunt.registerTask('cldr', ['extract_cldr_data']);

  grunt.registerTask('compile', [
    'bundle_jsnext',
    'concat:dist_with_locales',
    'cjs_jsnext',
    'copy:tmp'
  ]);

  grunt.registerTask('default', [
    'clean',
    'cldr',
    'compile'
  ]);
};