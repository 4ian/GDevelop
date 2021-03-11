const shell = require('shelljs');
const path = require('path');
const os = require('os').platform();

const appID = '718194112775454720';

let branch = require('minimist')(process.argv.slice(2)).branch;
if (branch === 'master' || branch === undefined) branch = '718194112775454720';
if (branch === 'nightly') branch = '819562742863757372';

if (os !== 'darwin' && os !== 'win32' && os !== 'linux') {
  console.log('Unsupported OS');
  shell.exit(0);
}

const dispatchPath = path.join('.', 'scripts', 'dispatch');
const dispatchBin = path.join(
  dispatchPath,
  os === 'win32'
    ? 'dispatch.exe'
    : os === 'darwin'
    ? 'dispatch_mac'
    : 'dispatch_linux'
);

(function publish() {
  console.log(`Publishing GDevelop on discord branch ${branch}`);
  const execOut = shell.exec(
    `${dispatchBin} build push ${branch} ${dispatchPath}/discord_build_config.json .`
  );
  const output = execOut.stdout + execOut.stderr;

  if (output.includes('No credentials found')) {
    shell.exec(`${dispatchBin} login`);
    return publish();
  }

  const notExistingMatch = output.match(
    /(win|linux|mac)(-unpacked)?\"\) does not exist/gm
  );
  if (notExistingMatch) {
    console.error('Please build GDevelop for ' + notExistingMatch[1]);
    shell.exit(0);
  }

  const buildMatch = output.matchAll(/Build ID: (.*)$/gm).next().value;
  if (!buildMatch) {
    console.error('Cannot find build ID! Did the build finish sucessfully?');
    shell.exit(0);
  }

  // Publish the build on selected branch
  shell.exec(
    `${dispatchBin} build publish ${appID} ${branch} ${buildMatch[1]}`
  );
})();
