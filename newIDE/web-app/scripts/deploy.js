const shell = require('shelljs');
const path = require('path');
const args = require('minimist')(process.argv.slice(2));
const ghpages = require('gh-pages');
const isGitClean = require('is-git-clean');
const git = require('git-rev');

isGitClean()
  .then(clean => {
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

    return new Promise(resolve => {
      git.branch(function(branch) {
        if (branch !== 'master') {
          shell.echo('⚠️ Please run deployment only from master branch');
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
      shell.exec('npm run build:app');
    } else {
      shell.echo('⚠️ Skipping app build.');
    }
    if (!args['skip-gdjs-runtime-deploy']) {
      shell.exec('npm run deploy:gdjs-runtime');
    } else {
      shell.echo('⚠️ Skipping GDJS Runtime (and extensions) deployment.');
    }

    shell.rm('-rf', 'dist');
    shell.mkdir('-p', 'dist');
    shell.cp('-r', '../app/build/*', 'dist');

    if (!args['skip-deploy']) {
      shell.echo('🚄 Uploading the built app to gh-pages...');
      ghpages.publish('dist', {}, err => {
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
