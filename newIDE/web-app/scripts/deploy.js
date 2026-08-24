const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const ghpages = require('gh-pages');
const isGitClean = require('is-git-clean');
const git = require('git-rev');

isGitClean()
  .then((clean) => {
    if (args['skip-git-check']) return;

    if (!clean) {
      shell.echo(
        '⚠️ git repository is not clean, please clean any changes before deploying'
      );
      shell.exit(1);
    }
  })
  .then(() => {
    if (args['skip-git-check']) return;

    return new Promise((resolve) => {
      git.branch(function (branch) {
        if (branch !== 'master') {
          shell.echo('⚠️ Please run deployment only from master branch');
          shell.exit(1);
        }

        resolve();
      });
    });
  })
  .then(() => {
    const appPublicPath = path.join(__dirname, '../../app/public/');
    return new Promise((resolve) => {
      fs.stat(path.join(appPublicPath, 'libGD.js'), (err, stats) => {
        if (err) {
          shell.echo(
            `❌ Unable to check libGD.js size. Have you compiled GDevelop.js? Error is: ${err}`
          );
          shell.exit(1);
        }

        // A release build is minified into a handful of very long lines, while a
        // 'dev' or 'debug' build is not minified at all (tens of thousands of lines).
        // Their sizes are too close to tell them apart, so check the line count.
        const lineCount = fs
          .readFileSync(path.join(appPublicPath, 'libGD.js'), 'utf8')
          .split('\n').length;
        if (lineCount > 1000) {
          shell.echo(
            `❌ libGD.js does not look minified (${lineCount} lines) - are you sure you're not trying to deploy the development version?`
          );
          shell.exit(1);
        }

        const sizeInMiB = stats.size / 1024 / 1024;
        if (sizeInMiB > 4) {
          shell.echo(
            `❌ libGD.js size is too big (${sizeInMiB.toFixed(
              2
            )}MiB) - are you sure it was built properly?`
          );
          shell.exit(1);
        }

        shell.echo(
          `✅ libGD.js seems correct (${sizeInMiB.toFixed(
            2
          )}MiB, ${lineCount} lines)`
        );

        if (!fs.existsSync(path.join(appPublicPath, 'libGD.wasm'))) {
          shell.echo(
            `❌ Did not find libGD.wasm - are you sure it was built properly?`
          );
          shell.exit(1);
        }
        resolve();
      });
    });
  })
  .then(() => {
    if (!args['cf-zoneid'] || !args['cf-token']) {
      shell.echo(
        '⚠️ No --cf-zoneid or --cf-token specified, will skip cache purge.'
      );
    }

    if (!args['skip-app-build']) {
      const output = shell.exec('npm run build:app');
      if (output.code !== 0) {
        shell.echo('❌ Unable to build the app.');
        shell.exit(output.code);
      }
    } else {
      shell.echo('⚠️ Skipping app build.');
    }
    if (!args['skip-gdjs-runtime-deploy']) {
      const output = shell.exec('npm run deploy:gdjs-runtime');
      if (output.code !== 0) {
        shell.echo('❌ Unable to build GDJS Runtime.');
        shell.exit(output.code);
      }
    } else {
      shell.echo('⚠️ Skipping GDJS Runtime (and extensions) deployment.');
    }

    shell.rm('-rf', 'dist');
    shell.mkdir('-p', 'dist');
    shell.cp('-r', '../app/build/*', 'dist');

    if (!args['skip-deploy']) {
      shell.echo('🚄 Uploading the built app to gh-pages...');
      ghpages.publish('dist', { history: false }, (err) => {
        if (err) {
          shell.echo('❌ Finished with error:');
          shell.echo(err);
          return;
        }

        shell.echo('✅ Upload finished to GitHub.');
        if (!args['cf-zoneid'] || !args['cf-token']) {
          shell.echo('⚠️ You should probably purge the reverse proxy cache.');
        } else {
          shell.exec(
            `npm run deploy:purge-cache -- --cf-zoneid ${args['cf-zoneid']} --cf-token ${args['cf-token']}`
          );
        }
      });
    }
  });
