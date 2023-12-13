#!/usr/bin/env node
/**
 * This script launch Emscripten's WebIDL binder to generate
 * the glue.cpp and glue.js file inside Bindings directory
 * using Bindings.idl
 */

var debug = false; //If true, add additional checks in bindings files.
var fs = require('fs');
var exec = require('child_process').exec;

if (!process.env.EMSDK) {
  console.error('EMSDK env. variable is not set');
  console.log(
    'Please set Emscripten environment by launching `emsdk_env` script'
  );
}
var webIdlBinderPath = process.env.EMSDK + '/upstream/emscripten/tools/webidl_binder.py';

generateGlueFromBinding(function(err) {
  if (err) return fatalError(err);

  patchGlueCppFile(function(err) {
    if (err) return fatalError(err);
  });
});

/**
 * Run Embind webidl_binder.py to generate glue.cpp and glue.js
 * from Bindings.idl
 */
function generateGlueFromBinding(cb) {
  fs.exists(webIdlBinderPath, function(exists) {
    if (!exists) {
      cb({
        message: 'Please check your Emscripten installation',
        output: "Can't find " + webIdlBinderPath,
      });
      return;
    }

    exec(
      'python "' + webIdlBinderPath + '" Bindings/Bindings.idl Bindings/glue',
      function(err, stdout, stderr) {
        if (err) {
          cb({ message: 'Error while running WebIDL binder:', output: err });
        }

        cb(null);
      }
    );
  });
}

/**
 * A few modification needs to be made to glue.cpp because of limitations
 * of the IDL language/binder.
 */
function patchGlueCppFile(cb) {
  var file = 'Bindings/glue.cpp';
  var classesToErase = [
    'ArbitraryResourceWorkerJS',
    'AbstractFileSystemJS',
    'BehaviorJsImplementation',
    'ObjectJsImplementation',
    'BehaviorSharedDataJsImplementation',
  ];
  var functionsToErase = [
    'emscripten_bind_ArbitraryResourceWorkerJS_ExposeImage_1',
    'emscripten_bind_ArbitraryResourceWorkerJS_ExposeShader_1',
    'emscripten_bind_ArbitraryResourceWorkerJS_ExposeFile_1',
  ];
  fs.readFile(file, function(err, data) {
    if (err) cb(err);

    var patchedFile = '';
    var insideReturnStringFunction = false;
    var erasingClass = false;
    var erasingFunction = false;
    data
      .toString()
      .split('\n')
      .forEach(function(line) {
        //When declaring a function returning "[Const, Ref] DOMString"
        //or "[Const, Value] DOMString"
        //in the IDL file, the return type is const char*. We are using
        //std::string in GDevelop and need to call c_str.
        if (insideReturnStringFunction) {
          //[Const, Value] DOMString
          if (line.indexOf('static char*') !== -1) {
            line = line.replace('static char*', 'static gd::String');
          } else if (line.indexOf(', &temp);') !== -1) {
            line = line.replace(', &temp);', ', temp.c_str());');
            //[Const, Ref] DOMString
          } else {
            if (debug) {
              //For debugging, use a temporary useless reference
              //to check the return type is a reference and not a value.
              //Could generate false positive.
              line = line
                .replace(';', '); return ref.c_str();')
                .replace(
                  'return &',
                  'gd::String & ref = const_cast<gd::String&>('
                );
            } else {
              line = line.replace(';', '.c_str();').replace('&', '');
            }
          }
        }

        //Make sure free functions are called properly.
        var freeCallPos = line.indexOf('self->FREE_');
        if (freeCallPos !== -1) {
          var nameEndPos = line.indexOf('(', freeCallPos);
          var name = line.substring(freeCallPos + 11, nameEndPos);
          var startOfLine = line.substring(0, freeCallPos);
          var endOfLine = line.substring(nameEndPos + 1, line.length);
          var hasOtherParameters = endOfLine[0] !== ')';

          line =
            startOfLine +
            name +
            '(*self' +
            (hasOtherParameters ? ', ' : '') +
            endOfLine;
        }

        //Fix calls to operator [] with pointers
        line = line.replace('self->MAP_set', '(*self)MAP_set');

        //Simulate copy operator with CLONE_type
        var cloneCallPos = line.indexOf('self->CLONE_');
        if (cloneCallPos !== -1) {
          line = line.replace('self->CLONE_', 'new ');
          line = line.replace('()', '(*self)');
        }

        //Custom function MAPS_keys to get the keys of a map
        var mapKeyCallPos = line.indexOf('self->MAP_keys');
        if (mapKeyCallPos !== -1) {
          line =
            'temp.clear(); for(auto it = self->begin(); it != self->end();' +
            '++it) { temp.push_back(it->first); } return &temp;';
        }

        if (line.indexOf('class') === 0) {
          for (var i = 0; i < classesToErase.length; ++i) {
            if (line.indexOf('class ' + classesToErase[i]) === 0) {
              erasingClass = true;
            }
          }
        }
        if (line.indexOf('EMSCRIPTEN_KEEPALIVE') !== -1) {
          for (var i = 0; i < functionsToErase.length; ++i) {
            if (
              line.indexOf(
                'EMSCRIPTEN_KEEPALIVE ' + functionsToErase[i] + '('
              ) !== -1
            ) {
              erasingFunction = true;
            }
          }
        }

        if (!erasingClass && !erasingFunction) patchedFile += line + '\n';

        if (line.indexOf('const char* EMSCRIPTEN_KEEPALIVE') == 0) {
          insideReturnStringFunction = true;
        } else if (line.indexOf('}') == 0) {
          insideReturnStringFunction = false;
        }

        if (erasingClass && line.indexOf('};') === 0) {
          erasingClass = false;
        }
        if (erasingFunction && line.indexOf('}') === 0) {
          erasingFunction = false;
        }
      });

    fs.writeFile(file, patchedFile, function(err) {
      cb(err);
    });
  });
}

function fatalError(error) {
  if (error.message) console.error(error.message);
  if (error.output) console.log(error.output);
  process.exit(1);
}
