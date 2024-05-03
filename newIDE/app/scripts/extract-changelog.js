// @ts-check
/**
 * This is a script getting the commits since the last tag (which
 * corresponds to a GitHub release). Each commit is filtered to:
 * - hide trivial stuff
 * - hide those containing "Don't mention in changelog"/"Don't show in changelog".
 * - categorize as fix or improvement
 *
 * Authors nickname are fetched from GitHub.
 *
 * Commits from the extensions/assets/examples repository are also
 * used to build the complete changelog.
 */

const crypto = require('crypto');
const shell = require('shelljs');
const child = require('child_process');
const { default: axios } = require('axios');
const args = require('minimist')(process.argv.slice(2));

const gdevelopTeamEmailHashes = [
  'f653a53047057692be0951d839b7394357b398deebf9731c7b7fe106f3644e1062c08860a65a89f218d6ad3ad6b5c7876c5088a4fba92b5e801a198d5dbc7158',
  '5e17262c55afd148038ee9e4b469dbc923422adfd768e717c6326a39cf29415163e15f85960cdbda2aeb3d751d610e25d594a7783f6801aec24403421deaf815',
];

const isMemberOfGDevelopTeam = ({ email, nickname }) => {
  if (['4ian', 'AlexandreSi', 'ClementPasteau', 'D8H'].includes(nickname)) {
    return true;
  }
  if (
    gdevelopTeamEmailHashes.includes(
      crypto
        .createHash('sha512')
        .update(email)
        .digest('hex')
    )
  ) {
    return true;
  }
  return false;
};

if (!args['extensionsGitPath']) {
  shell.echo(
    '⚠️ You should pass --extensionsGitPath pointing to the git directory of GDevelop-extensions.'
  );
}
const extensionsGitPath = args['extensionsGitPath'];

if (!args['assetsGitPath']) {
  shell.echo(
    '⚠️ You should pass --assetsGitPath pointing to the git directory of GDevelop-assets.'
  );
}
const assetsGitPath = args['assetsGitPath'];

if (!args['examplesGitPath']) {
  shell.echo(
    '⚠️ You should pass --examplesGitPath pointing to the git directory of GDevelop-examples.'
  );
}
const examplesGitPath = args['examplesGitPath'];

if (!args['templatesGitPath']) {
  shell.echo(
    '⚠️ You should pass --templatesGitPath pointing to the git directory of GDevelop-game-templates.'
  );
}
const templatesGitPath = args['templatesGitPath'];

/** @typedef {{sha: string, message: string, authorEmail: string}} GitRawCommitInfo */
/** @typedef {{
  message: string,
  authorEmail: string,
  authorNickname: string,
  isFix: boolean,
  forDev: boolean,
  hidden: boolean
}} GitEnrichedCommitInfo */

/** Helpers to read information from a git repository. */
const getGitTools = repoPath => {
  /**
   * @param {string} options
   * @returns {GitRawCommitInfo[]}
   */
  const extractCommits = options => {
    const output = child
      .execSync(
        `git log ${options} --format=%B---DELIMITER---%ae---DELIMITER---%H---COMMITDELIMITER---`,
        { cwd: repoPath }
      )
      .toString('utf-8');

    return output
      .split('---COMMITDELIMITER---\n')
      .map(commit => {
        const [message, authorEmail, sha] = commit.split('---DELIMITER---');

        return { sha, message, authorEmail };
      })
      .filter(commit => Boolean(commit.sha));
  };

  return {
    getLastTag: () => {
      return child
        .execSync(`git describe --tags --abbrev=0`, { cwd: repoPath })
        .toString('utf-8')
        .trim();
    },
    getTagIsoDate: tag => {
      return child
        .execSync(`git tag -l ${tag} --format='%(creatordate:iso8601)'`, {
          cwd: repoPath,
        })
        .toString('utf-8')
        .trim();
    },
    extractCommitsSinceTag: tag => extractCommits(`${tag}..HEAD`),
    extractCommitsSinceDate: date => extractCommits(`--after="${date}"`),
  };
};

/**
 * @param {GitRawCommitInfo[]} rawCommits
 * @return {GitEnrichedCommitInfo[]}
 */
const enrichCommits = rawCommits => {
  return (
    rawCommits
      // Clean commits
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
          lowerCaseMessage.includes('do not mention in changelog') ||
          lowerCaseMessage.includes('do not mention in the changelog') ||
          lowerCaseMessage.includes("don't show in changelog") ||
          lowerCaseMessage.includes("don't show in the changelog") ||
          lowerCaseMessage.includes('do not show in changelog') ||
          lowerCaseMessage.includes('do not show in the changelog') ||
          lowerCaseMessage.startsWith('update translations') ||
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
          lowerCaseMessage.indexOf('compress images') === 0 ||
          lowerCaseMessage.indexOf('update extensions-registry.json') === 0 ||
          lowerCaseMessage.includes('package-lock.json') ||
          lowerCaseMessage.includes('yarn.lock');
        const isFix = lowerCaseMessage.indexOf('fix') === 0;
        const forDev = lowerCaseMessage.includes(
          'only show in developer changelog'
        );

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

let authorEmailsToNicknames = {};

/**
 * @param {GitEnrichedCommitInfo[]} commits
 * @return {Promise<GitEnrichedCommitInfo[]>}
 */
const findAuthorNicknameInCommits = async commits => {
  let lastGithubCall = 0;

  /** @returns {Promise<void>} */
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
        `\nℹ️ Calling https://api.github.com/search/users?q=${authorEmail}+in:email`
      );
      const response = await axios.get(
        `https://api.github.com/search/users?q=${authorEmail}+in:email`
      );
      const data = response.data;
      const login =
        data && data.items && data.items[0] ? data.items[0].login : '';
      authorEmailsToNicknames[authorEmail] = login;
      if (login) {
        shell.echo(`✅ Found nickname for email: ${authorEmail}:` + login);
      } else {
        shell.echo(`⚠️ No nickname found for email: ${authorEmail}`);
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

/**
 * @param {{commit: GitEnrichedCommitInfo, includeAuthor: boolean}} options
 * @returns {string}
 */
const formatCommitMessage = ({ commit, includeAuthor }) => {
  const author =
    includeAuthor &&
    !isMemberOfGDevelopTeam({
      email: commit.authorEmail,
      nickname: commit.authorNickname,
    })
      ? `(Thanks ${
          commit.authorNickname
            ? '@' + commit.authorNickname
            : 'TODO:' + commit.authorEmail
        }!)`
      : '';

  const ignoreRestRegex = /(Don't|Do not) (show|mention) (details|the rest )in (the )?changelog/i;
  const foundIgnoreRest = commit.message.match(ignoreRestRegex);
  const cleanedMessage =
    // @ts-ignore - check for nullability is properly done?
    foundIgnoreRest && foundIgnoreRest.index > 0
      ? commit.message.substr(0, foundIgnoreRest.index)
      : commit.message;

  const prNumberCleanedMessage = cleanedMessage
    .replace(/(\(#[1-9][0-9]*\))/, '')
    .replace(/fix #[1-9][0-9]*,*/gi, '')
    .replace(/closes #[1-9][0-9]*,*/gi, '');

  const devCleanedMessage = prNumberCleanedMessage.replace(
    /only show in developer changelog/i,
    ''
  );

  const indentedMessage = devCleanedMessage
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

/**
 * @param {{
 *   hiddenCommits: GitEnrichedCommitInfo[],
 *   improvementsCommits: GitEnrichedCommitInfo[],
 *   fixCommits: GitEnrichedCommitInfo[],
 *   devCommits: GitEnrichedCommitInfo[],
 *   extensionsCommits: GitEnrichedCommitInfo[] | null,
 *   assetsCommits: GitEnrichedCommitInfo[] | null,
 *   examplesCommits: GitEnrichedCommitInfo[] | null,
 *   templatesCommits: GitEnrichedCommitInfo[] | null
 * }} commits
 */
const outputChangelog = ({
  hiddenCommits,
  improvementsCommits,
  fixCommits,
  devCommits,
  extensionsCommits,
  assetsCommits,
  examplesCommits,
  templatesCommits,
}) => {
  shell.echo(
    `ℹ️ Hidden these commits: \n${hiddenCommits
      .map(formatHiddenCommitMessage)
      .join('\n')}`
  );

  shell.echo(`\n✅ The generated changelog is:\n`);

  shell.echo(`\n## 💝 Improvements\n`);
  shell.echo(
    improvementsCommits
      .map(commit => formatCommitMessage({ commit, includeAuthor: true }))
      .join('\n')
  );

  shell.echo(`\n## 🐛 Bug fixes\n`);
  shell.echo(
    fixCommits
      .map(commit => formatCommitMessage({ commit, includeAuthor: true }))
      .join('\n')
  );

  shell.echo('\n## ⚙️ Extensions\n');
  shell.echo(
    extensionsCommits
      ? extensionsCommits
          .map(commit => formatCommitMessage({ commit, includeAuthor: false }))
          .join('\n')
      : 'TODO: Add extensions commits here.'
  );
  shell.echo('\n## 🎨 Assets\n');
  shell.echo(
    assetsCommits
      ? assetsCommits
          .map(commit => formatCommitMessage({ commit, includeAuthor: false }))
          .join('\n')
      : 'TODO: Add assets commits here.'
  );
  shell.echo('\n## 🕹 Examples\n');
  shell.echo(
    examplesCommits
      ? examplesCommits
          .map(commit => formatCommitMessage({ commit, includeAuthor: false }))
          .join('\n')
      : 'TODO: Add examples commits here.'
  );
  shell.echo('\n## 🕹 Premium Game Templates\n');
  shell.echo(
    templatesCommits
      ? templatesCommits
          .map(commit => formatCommitMessage({ commit, includeAuthor: false }))
          .join('\n')
      : 'TODO: Add game templates commits here.'
  );

  if (devCommits.length > 0) {
    shell.echo(`\n### 🛠 Internal changes (for developers)\n`);
    shell.echo(
      devCommits
        .map(commit => formatCommitMessage({ commit, includeAuthor: true }))
        .join('\n')
    );
  }
};

(async () => {
  const gdevelopRepoGitTools = getGitTools('.');
  const lastTag = gdevelopRepoGitTools.getLastTag();
  // Uncomment if you want to test the result of the script with an older release:
  // const lastTag = 'v5.0.0-beta115';
  shell.echo(`ℹ️ Last tag is ${lastTag}`);

  const lastTagDate = gdevelopRepoGitTools.getTagIsoDate(lastTag);
  shell.echo(`ℹ️ Date of tag is ${lastTagDate}`);

  const rawCommits = gdevelopRepoGitTools.extractCommitsSinceTag(lastTag);
  const commits = enrichCommits(rawCommits);
  const commitsWithAuthors = await findAuthorNicknameInCommits(commits);
  const hiddenCommits = commitsWithAuthors.filter(commit => commit.hidden);
  const displayedCommits = commitsWithAuthors.filter(commit => !commit.hidden);
  const devCommits = displayedCommits.filter(commit => commit.forDev);
  const fixCommits = displayedCommits.filter(commit => commit.isFix);
  const improvementsCommits = displayedCommits.filter(
    commit => !commit.isFix && !commit.forDev
  );

  /** @type {GitEnrichedCommitInfo[] | null} */
  let assetsCommits = null;
  if (assetsGitPath) {
    const assetsRepoGitTools = getGitTools(assetsGitPath);
    const assetsRawCommits = assetsRepoGitTools.extractCommitsSinceDate(
      lastTagDate
    );
    assetsCommits = enrichCommits(assetsRawCommits).filter(
      commit => !commit.hidden
    );
  }

  /** @type {GitEnrichedCommitInfo[] | null} */
  let extensionsCommits = null;
  if (extensionsGitPath) {
    const extensionsRepoGitTools = getGitTools(extensionsGitPath);
    const extensionsRawCommits = extensionsRepoGitTools.extractCommitsSinceDate(
      lastTagDate
    );
    extensionsCommits = enrichCommits(extensionsRawCommits).filter(
      commit => !commit.hidden
    );
  }

  /** @type {GitEnrichedCommitInfo[] | null} */
  let examplesCommits = null;
  if (examplesGitPath) {
    const examplesRepoGitTools = getGitTools(examplesGitPath);
    const examplesRawCommits = examplesRepoGitTools.extractCommitsSinceDate(
      lastTagDate
    );
    examplesCommits = enrichCommits(examplesRawCommits).filter(
      commit => !commit.hidden
    );
  }

  let templatesCommits = null;
  if (templatesGitPath) {
    const templatesRepoGitTools = getGitTools(templatesGitPath);
    const templatesRawCommits = templatesRepoGitTools.extractCommitsSinceDate(
      lastTagDate
    );
    templatesCommits = enrichCommits(templatesRawCommits).filter(
      commit => !commit.hidden
    );
  }

  outputChangelog({
    hiddenCommits,
    improvementsCommits,
    fixCommits,
    devCommits,
    extensionsCommits,
    assetsCommits,
    examplesCommits,
    templatesCommits,
  });
})();
