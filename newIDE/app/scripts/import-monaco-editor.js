var shell = require('shelljs');

var source = '../node_modules/monaco-editor/min/vs';

var success = true;
success &= !shell.mkdir('-p', '../public/external/monaco-editor-min').stderr;
success &= !shell.cp(
  '-Rf',
  source,
  '../public/external/monaco-editor-min'
).stderr;
if (!success) {
  shell.echo(
    `❌ Error(s) occurred while copying Monaco Editor sources from node_modules/monaco-editor/min/vs`
  );
} else {
  shell.echo(
    '✅ Sources of Monaco Editor properly copied in public folder'
  );
}
