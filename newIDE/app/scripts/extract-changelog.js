/**
 * This is a simple script getting the commits since the last tag (which
 * corresponds to a GitHub release). Each commit is filtered to:
 * - hide trivial stuff
 * - hide those containing "Don't mention in changelog"/"Don't show in changelog".
 * - categorize as fix or improvement
 *
 * Authors nickname are fetched from GitHub.
 */

const shell = require('shelljs');
const child = require('child_process');
const axios = require('axios');

const extractCommitsFromGit = () => {
  const lastTag = child
    .execSync(`git describe --tags --abbrev=0`)
    .toString('utf-8')
    .trim();
  shell.echo(`ℹ️ Last tag is ${lastTag}`);

  const output = child
    .execSync(
      `git log ${lastTag}..HEAD --format=%B---DELIMITER---%ae---DELIMITER---%H---COMMITDELIMITER---`
    )
    .toString('utf-8');

  return (
    output
      .split('---COMMITDELIMITER---\n')
      .map(commit => {
        const [message, authorEmail, sha] = commit.split('---DELIMITER---');

        return { sha, message, authorEmail };
      })
      // Clean commits
      .filter(commit => Boolean(commit.sha))
      .map(commit => ({
        message: commit.message.trim(),
        authorEmail: commit.authorEmail.trim(),
      }))
      // Categorize commits
      .map(commit => {
        const lowerCaseMessage = commit.message.toLowerCase();
        const shouldHide =
          lowerCaseMessage.includes("don't mention in changelog") ||
          lowerCaseMessage.includes("don't mention in the changelog") ||
          lowerCaseMessage.includes("don't show in changelog") ||
          lowerCaseMessage.includes("don't show in the changelog") ||
          lowerCaseMessage === 'update translations' ||
          lowerCaseMessage === 'prettier' ||
          lowerCaseMessage === 'update jsextension.js' ||
          lowerCaseMessage.includes('run code formatting') ||
          lowerCaseMessage.includes('fix formatting') ||
          lowerCaseMessage.indexOf('run prettier') === 0 ||
          lowerCaseMessage.indexOf('regen fixtures') === 0 ||
          lowerCaseMessage.indexOf('regenerate fixtures') === 0 ||
          lowerCaseMessage.indexOf('remove arrow function') === 0 ||
          lowerCaseMessage.indexOf('update fixtures') === 0 ||
          lowerCaseMessage.indexOf('try to fix flow') === 0 ||
          lowerCaseMessage.indexOf('fix flow') === 0 ||
          lowerCaseMessage.indexOf('fix typing') === 0 ||
          lowerCaseMessage.indexOf('fix test') === 0 ||
          lowerCaseMessage.indexOf('merge branch') === 0 ||
          lowerCaseMessage.indexOf('merge pull request #') === 0 ||
          lowerCaseMessage.includes('bump newide version') ||
          lowerCaseMessage.indexOf('fix warning') === 0 ||
          lowerCaseMessage === 'fix compilation' ||
          lowerCaseMessage.indexOf('fix typo') === 0 ||
          lowerCaseMessage.includes('add files forgotten in last commit') ||
          lowerCaseMessage.indexOf('apply review') === 0 ||
          lowerCaseMessage.includes('package-lock.json') ||
          lowerCaseMessage.includes('yarn.lock');
        const isFix = lowerCaseMessage.indexOf('fix') === 0;
        const forDev = lowerCaseMessage.includes('developer changelog');

        return {
          message: commit.message.trim(),
          authorEmail: commit.authorEmail.trim(),
          authorNickname: '',
          isFix,
          forDev,
          hidden: shouldHide,
        };
      })
  );
};

const findAuthorNicknameInCommits = async commits => {
  let authorEmailsToNicknames = {};
  let lastGithubCall = 0;
  function delayGithubCall() {
    return new Promise(resolve => {
      setTimeout(() => {
        lastGithubCall = Date.now();
        resolve();
      }, Math.max(0, lastGithubCall + 500 - Date.now()));
    });
  }

  const findAuthorNicknameFromAuthorEmail = async authorEmail => {
    const cachedNickname = authorEmailsToNicknames[authorEmail];
    if (cachedNickname !== undefined) return cachedNickname;

    if (authorEmail.includes('@users.noreply.github.com')) {
      return authorEmail
        .replace(/@users\.noreply\.github\.com/, '')
        .replace(/^[0-9]*\+/, '');
    }

    try {
      await delayGithubCall();
      console.log(
        `ℹ️ Calling https://api.github.com/search/users?q=${authorEmail}+in:email`
      );
      const response = await axios.get(
        `https://api.github.com/search/users?q=${authorEmail}+in:email`
      );
      const data = response.data;
      const login =
        data && data.items && data.items[0] ? data.items[0].login : '';
      authorEmailsToNicknames[authorEmail] = login;
      if (login) {
        shell.echo(`ℹ️ Found nickname for email: ${authorEmail}:` + login);
      } else {
        shell.echo(`ℹ️ No nickname found for email: ${authorEmail}:` + login);
      }

      return login;
    } catch (error) {
      shell.echo(
        `⚠️ Unable to fetch a user info (email: ${authorEmail})` + error
      );
      return '';
    }
  };

  const outputCommits = [];
  for (let index in commits) {
    const commit = commits[index];
    const authorNickname = await findAuthorNicknameFromAuthorEmail(
      commit.authorEmail
    );

    outputCommits.push({
      ...commit,
      authorNickname,
    });
  }
  return outputCommits;
};

const formatCommitMessage = commit => {
  const includeAuthor = commit.authorNickname !== '4ian';
  const author = includeAuthor
    ? `(Thanks ${
        commit.authorNickname
          ? '@' + commit.authorNickname
          : 'TODO:' + commit.authorEmail
      }!)`
    : '';

  const ignoreRestRegex = /(Don't|Do not) (show|mention) (details|the rest )in (the )?changelog/i;
  const foundIgnoreRest = commit.message.match(ignoreRestRegex);
  const cleanedMessage =
    foundIgnoreRest && foundIgnoreRest.index > 0
      ? commit.message.substr(0, foundIgnoreRest.index)
      : commit.message;

  const prNumberCleanedMessage = cleanedMessage.replace(
    /(\(#[1-9][0-9]*\))/,
    ''
  );

  const indentedMessage = prNumberCleanedMessage
    .split('\n')
    .map((line, index) =>
      index === 0
        ? '* ' + line.trimRight() + ' ' + author
        : '  ' + line.trimRight()
    )
    .filter(line => line.trim() !== '')
    .join('\n');

  return indentedMessage;
};

const formatHiddenCommitMessage = commit => {
  const trimmedMessage = commit.message.replace(/\n/g, ' ').trim();
  return (
    '* ' +
    (trimmedMessage.length > 50
      ? trimmedMessage.substr(0, 50) + ' [...]'
      : trimmedMessage)
  );
};

(async () => {
  const commits = extractCommitsFromGit();
  const commitsWithAuthors = await findAuthorNicknameInCommits(commits);

  const hiddenCommits = commitsWithAuthors.filter(commit => commit.hidden);
  const displayedCommits = commitsWithAuthors.filter(commit => !commit.hidden);
  const devCommits = displayedCommits.filter(commit => commit.forDev);
  const fixCommits = displayedCommits.filter(commit => commit.isFix);
  const improvementsCommits = displayedCommits.filter(commit => !commit.isFix && !commit.forDev);
  shell.echo(
    `ℹ️ Hidden these commits: \n${hiddenCommits
      .map(formatHiddenCommitMessage)
      .join('\n')}`
  );

  shell.echo(`\n✅ The generated changelog is:\n`);

  shell.echo(`\n## 💝 Improvements\n`);
  shell.echo(improvementsCommits.map(formatCommitMessage).join('\n'));

  shell.echo(`\n## 🐛 Bug fixes\n`);
  shell.echo(fixCommits.map(formatCommitMessage).join('\n'));

  if (devCommits.length > 0) {
    shell.echo(`\n### 🛠 Internal changes (for developers)\n`);
    shell.echo(devCommits.map(formatCommitMessage).join('\n'));
  }
})();
