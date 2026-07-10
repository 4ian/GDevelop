const childProcess = require('child_process');
const path = require('path');

const gitCommandTimeoutMs = 120000;
const gitCommandMaxBuffer = 10 * 1024 * 1024;
const linkedFoldersFileName = '.gdevelop-folder-links.json';

const runGit = (workingDirectory, args, options = {}) =>
  new Promise((resolve, reject) => {
    const allowedExitCodes = options.allowedExitCodes || [0];
    childProcess.execFile(
      'git',
      args,
      {
        cwd: workingDirectory,
        timeout: gitCommandTimeoutMs,
        maxBuffer: gitCommandMaxBuffer,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        if (
          error &&
          !(
            typeof error.code === 'number' &&
            allowedExitCodes.includes(error.code)
          )
        ) {
          const message = (stderr || stdout || error.message || '').trim();
          reject(new Error(message || 'Git command failed.'));
          return;
        }

        resolve({
          stdout: stdout.trimEnd(),
          stderr: stderr.trimEnd(),
        });
      }
    );
  });

const getProjectDirectory = projectFilePath => {
  if (!projectFilePath || typeof projectFilePath !== 'string') {
    throw new Error('A local project file path is required.');
  }

  return path.dirname(projectFilePath);
};

const resolveGitRepository = async projectFilePath => {
  const projectDirectory = getProjectDirectory(projectFilePath);
  const result = await runGit(projectDirectory, [
    'rev-parse',
    '--show-toplevel',
  ]);
  const repoRoot = result.stdout.split(/\r?\n/)[0];
  if (!repoRoot) throw new Error('Unable to find the Git repository root.');

  return { projectDirectory, repoRoot };
};

const parseBranchLine = branchLine => {
  const branchDetails = {
    branch: '',
    upstream: null,
    ahead: 0,
    behind: 0,
  };
  if (!branchLine || !branchLine.startsWith('## ')) return branchDetails;

  const branchInfo = branchLine.slice(3);
  if (branchInfo.startsWith('No commits yet on ')) {
    branchDetails.branch = branchInfo.replace('No commits yet on ', '');
    return branchDetails;
  }

  const bracketIndex = branchInfo.indexOf(' [');
  const branchAndUpstream =
    bracketIndex === -1 ? branchInfo : branchInfo.slice(0, bracketIndex);
  const trackingDetails =
    bracketIndex === -1 ? '' : branchInfo.slice(bracketIndex + 2, -1);
  const branchParts = branchAndUpstream.split('...');

  branchDetails.branch = branchParts[0];
  branchDetails.upstream = branchParts[1] || null;

  const aheadMatch = trackingDetails.match(/ahead (\d+)/);
  const behindMatch = trackingDetails.match(/behind (\d+)/);
  branchDetails.ahead = aheadMatch ? Number(aheadMatch[1]) : 0;
  branchDetails.behind = behindMatch ? Number(behindMatch[1]) : 0;

  return branchDetails;
};

const getStatusLabel = (indexStatus, workingTreeStatus) => {
  const status = `${indexStatus}${workingTreeStatus}`;
  if (status === '??') return 'Untracked';
  if (status.includes('U')) return 'Conflicted';
  if (status.includes('A')) return 'Added';
  if (status.includes('D')) return 'Deleted';
  if (status.includes('R')) return 'Renamed';
  if (status.includes('C')) return 'Copied';
  if (status.includes('M')) return 'Modified';

  return 'Changed';
};

const readGitQuotedPath = quotedPath => {
  if (!quotedPath || quotedPath[0] !== '"') return null;

  let path = '';
  for (let index = 1; index < quotedPath.length; index++) {
    const char = quotedPath[index];
    if (char === '"') {
      return {
        path,
        endIndex: index + 1,
      };
    }

    if (char !== '\\') {
      path += char;
      continue;
    }

    const escapedChar = quotedPath[index + 1];
    if (escapedChar === undefined) {
      path += '\\';
      continue;
    }

    if (/[0-7]/.test(escapedChar)) {
      let octal = escapedChar;
      let octalIndex = index + 2;
      while (
        octal.length < 3 &&
        octalIndex < quotedPath.length &&
        /[0-7]/.test(quotedPath[octalIndex])
      ) {
        octal += quotedPath[octalIndex];
        octalIndex++;
      }
      path += String.fromCharCode(parseInt(octal, 8));
      index = octalIndex - 1;
      continue;
    }

    switch (escapedChar) {
      case 'a':
        path += '\x07';
        break;
      case 'b':
        path += '\b';
        break;
      case 'f':
        path += '\f';
        break;
      case 'n':
        path += '\n';
        break;
      case 'r':
        path += '\r';
        break;
      case 't':
        path += '\t';
        break;
      case 'v':
        path += '\v';
        break;
      default:
        path += escapedChar;
        break;
    }
    index++;
  }

  return null;
};

const parseGitStatusPath = rawPath => {
  const path = rawPath.trim();
  const quotedPath = readGitQuotedPath(path);
  return quotedPath && quotedPath.endIndex === path.length
    ? quotedPath.path
    : path;
};

const parseGitStatusPaths = rawPath => {
  const renameSeparator = ' -> ';
  const path = rawPath.trim();
  const quotedOldPath = readGitQuotedPath(path);

  if (quotedOldPath) {
    const remainingPath = path.slice(quotedOldPath.endIndex);
    if (remainingPath.startsWith(renameSeparator)) {
      return {
        oldPath: quotedOldPath.path,
        filePath: parseGitStatusPath(
          remainingPath.slice(renameSeparator.length)
        ),
      };
    }
  }

  const renameIndex = path.indexOf(renameSeparator);
  return {
    oldPath:
      renameIndex === -1
        ? null
        : parseGitStatusPath(path.slice(0, renameIndex)),
    filePath:
      renameIndex === -1
        ? parseGitStatusPath(path)
        : parseGitStatusPath(path.slice(renameIndex + renameSeparator.length)),
  };
};

const parseStatusLine = line => {
  const indexStatus = line[0] === ' ' ? '' : line[0];
  const workingTreeStatus = line[1] === ' ' ? '' : line[1];
  const rawPath = line.slice(3);
  const { oldPath, filePath } = parseGitStatusPaths(rawPath);

  return {
    path: filePath,
    oldPath,
    indexStatus,
    workingTreeStatus,
    status: getStatusLabel(indexStatus, workingTreeStatus),
  };
};

const parseCommitLine = line => {
  const [hash, shortHash, author, date, subject] = line.split('\x1f');
  return {
    hash,
    shortHash,
    author,
    date,
    subject,
  };
};

const getRecentCommits = async repoRoot => {
  try {
    await runGit(repoRoot, ['rev-parse', '--verify', 'HEAD']);
  } catch (error) {
    return [];
  }

  const result = await runGit(repoRoot, [
    'log',
    '--date=iso-strict',
    '--pretty=format:%H%x1f%h%x1f%an%x1f%ad%x1f%s',
    '-n',
    '30',
  ]);

  if (!result.stdout) return [];

  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map(parseCommitLine);
};

const getRemotes = async repoRoot => {
  const result = await runGit(repoRoot, ['remote']);
  if (!result.stdout) return [];

  return result.stdout
    .split(/\r?\n/)
    .map(remote => remote.trim())
    .filter(Boolean);
};

const getStatus = async projectFilePath => {
  try {
    const { projectDirectory, repoRoot } = await resolveGitRepository(
      projectFilePath
    );
    const statusResult = await runGit(repoRoot, [
      'status',
      '--porcelain=v1',
      '-b',
      '-uall',
    ]);
    const lines = statusResult.stdout.split(/\r?\n/).filter(Boolean);
    const branchDetails = parseBranchLine(lines[0]);
    const changedFiles = lines.slice(1).map(parseStatusLine);
    const commits = await getRecentCommits(repoRoot);
    const remotes = await getRemotes(repoRoot);

    return {
      isAvailable: true,
      projectDirectory,
      repoRoot,
      ...branchDetails,
      remotes,
      changedFiles,
      commits,
    };
  } catch (error) {
    return {
      isAvailable: false,
      projectDirectory: getProjectDirectory(projectFilePath),
      repoRoot: null,
      branch: '',
      upstream: null,
      ahead: 0,
      behind: 0,
      remotes: [],
      changedFiles: [],
      commits: [],
      error: error && error.message ? error.message : String(error),
    };
  }
};

const ensureGitRepository = async projectFilePath => {
  const status = await getStatus(projectFilePath);
  if (!status.isAvailable || !status.repoRoot) {
    throw new Error(status.error || 'This project is not in a Git repository.');
  }

  return status;
};

const ensureCleanWorktree = async repoRoot => {
  const result = await runGit(repoRoot, ['status', '--porcelain=v1', '-uall']);
  if (result.stdout.trim()) {
    throw new Error(
      'Commit or discard local changes before rolling back a commit.'
    );
  }
};

const ensureGitConfigValue = async (repoRoot, key, fallbackValue) => {
  try {
    const result = await runGit(repoRoot, ['config', key]);
    if (result.stdout.trim()) return;
  } catch (error) {
    // The value is not configured, so set a local fallback below.
  }

  await runGit(repoRoot, ['config', key, fallbackValue]);
};

const ensureCommitIdentity = async repoRoot => {
  await ensureGitConfigValue(repoRoot, 'user.name', 'GDevelop');
  await ensureGitConfigValue(
    repoRoot,
    'user.email',
    'gdevelop@example.invalid'
  );
};

const commitChanges = async ({ projectFilePath, message }) => {
  const commitMessage = typeof message === 'string' ? message.trim() : '';
  if (!commitMessage) throw new Error('Enter a commit message.');

  const status = await ensureGitRepository(projectFilePath);
  await runGit(status.repoRoot, ['add', '-A']);
  await ensureCommitIdentity(status.repoRoot);
  await runGit(status.repoRoot, ['commit', '-m', commitMessage]);

  return getStatus(projectFilePath);
};

const configureRemote = async ({ repoRoot, remoteUrl }) => {
  const normalizedRemoteUrl =
    typeof remoteUrl === 'string' ? remoteUrl.trim() : '';
  let remotes = await getRemotes(repoRoot);

  if (!normalizedRemoteUrl) return remotes;

  if (remotes.includes('origin')) {
    await runGit(repoRoot, [
      'remote',
      'set-url',
      'origin',
      normalizedRemoteUrl,
    ]);
  } else if (remotes.length) {
    await runGit(repoRoot, [
      'remote',
      'set-url',
      remotes[0],
      normalizedRemoteUrl,
    ]);
  } else {
    await runGit(repoRoot, ['remote', 'add', 'origin', normalizedRemoteUrl]);
  }

  remotes = await getRemotes(repoRoot);
  return remotes;
};

const pushChanges = async ({ projectFilePath, remoteUrl, force = false }) => {
  let status = await ensureGitRepository(projectFilePath);
  const remotes = await configureRemote({
    repoRoot: status.repoRoot,
    remoteUrl,
  });
  status = {
    ...status,
    remotes,
  };

  let pushArgs = ['push'];
  if (force) pushArgs.push('--force-with-lease');

  if (!status.upstream) {
    if (!status.branch || status.branch === 'HEAD') {
      throw new Error('Cannot push because the current branch is detached.');
    }

    const remote = remotes.includes('origin') ? 'origin' : remotes[0];
    if (!remote) {
      throw new Error('No Git remote is configured for this project.');
    }

    pushArgs = ['push'];
    if (force) pushArgs.push('--force-with-lease');
    pushArgs.push('-u', remote, status.branch);
  }

  await runGit(status.repoRoot, pushArgs);

  return getStatus(projectFilePath);
};

const revertCommit = async ({ projectFilePath, commitHash }) => {
  if (!commitHash) throw new Error('A commit hash is required.');

  const status = await ensureGitRepository(projectFilePath);
  await ensureCleanWorktree(status.repoRoot);
  await runGit(status.repoRoot, ['revert', '--no-edit', commitHash]);

  return getStatus(projectFilePath);
};

const resetToCommit = async ({ projectFilePath, commitHash }) => {
  if (!commitHash) throw new Error('A commit hash is required.');

  const status = await ensureGitRepository(projectFilePath);
  await runGit(status.repoRoot, ['reset', '--hard', commitHash]);
  await runGit(status.repoRoot, [
    'clean',
    '-fd',
    `--exclude=${linkedFoldersFileName}`,
  ]);

  return getStatus(projectFilePath);
};

const getChangedFileDiff = async ({ projectFilePath, file }) => {
  if (!file || !file.path) throw new Error('A changed file is required.');

  const status = await ensureGitRepository(projectFilePath);
  const diffSections = [];
  const pathArgs = file.oldPath ? [file.oldPath, file.path] : [file.path];
  const isUntracked =
    file.status === 'Untracked' ||
    (file.indexStatus === '?' && file.workingTreeStatus === '?');

  if (isUntracked) {
    const result = await runGit(
      status.repoRoot,
      [
        'diff',
        '--no-ext-diff',
        '--no-color',
        '--no-index',
        '--',
        '/dev/null',
        file.path,
      ],
      { allowedExitCodes: [0, 1] }
    );
    diffSections.push(result.stdout);
  } else {
    if (file.indexStatus) {
      const result = await runGit(status.repoRoot, [
        'diff',
        '--no-ext-diff',
        '--no-color',
        '--cached',
        '--',
        ...pathArgs,
      ]);
      if (result.stdout) {
        diffSections.push(`Staged changes\n\n${result.stdout}`);
      }
    }

    if (file.workingTreeStatus) {
      const result = await runGit(status.repoRoot, [
        'diff',
        '--no-ext-diff',
        '--no-color',
        '--',
        ...pathArgs,
      ]);
      if (result.stdout) {
        diffSections.push(`Unstaged changes\n\n${result.stdout}`);
      }
    }
  }

  return {
    path: file.path,
    oldPath: file.oldPath || null,
    status: file.status || 'Changed',
    diff: diffSections.filter(Boolean).join('\n\n'),
  };
};

const initializeRepository = async projectFilePath => {
  const projectDirectory = getProjectDirectory(projectFilePath);
  await runGit(projectDirectory, ['init']);

  return getStatus(projectFilePath);
};

const handleGitToolRequest = async request => {
  const projectFilePath = request && request.projectFilePath;
  const action = request && request.action;
  const payload = (request && request.payload) || {};

  switch (action) {
    case 'status':
      return getStatus(projectFilePath);
    case 'init':
      return initializeRepository(projectFilePath);
    case 'commit':
      return commitChanges({
        projectFilePath,
        message: payload.message,
      });
    case 'push':
      return pushChanges({
        projectFilePath,
        remoteUrl: payload.remoteUrl,
        force: !!payload.force,
      });
    case 'revert':
      return revertCommit({
        projectFilePath,
        commitHash: payload.commitHash,
      });
    case 'reset':
      return resetToCommit({
        projectFilePath,
        commitHash: payload.commitHash,
      });
    case 'diff':
      return getChangedFileDiff({
        projectFilePath,
        file: payload.file,
      });
    default:
      throw new Error(`Unknown Git tool action: ${action || 'none'}.`);
  }
};

module.exports = {
  handleGitToolRequest,
};
