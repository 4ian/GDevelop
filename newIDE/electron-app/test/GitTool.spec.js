const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { handleGitToolRequest } = require('../app/GitTool');

const runGit = (workingDirectory, args) =>
  childProcess.execFileSync('git', args, {
    cwd: workingDirectory,
    encoding: 'utf8',
    windowsHide: true,
  });

const createGitRepository = () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-git-tool-'));
  runGit(repoRoot, ['init']);
  runGit(repoRoot, ['config', 'user.name', 'GDevelop Test']);
  runGit(repoRoot, ['config', 'user.email', 'gdevelop-test@example.invalid']);
  runGit(repoRoot, ['config', 'core.autocrlf', 'false']);

  return repoRoot;
};

const testResetRemovesUntrackedFiles = async () => {
  const repoRoot = createGitRepository();
  try {
    const projectFilePath = path.join(repoRoot, 'game.json');
    fs.writeFileSync(projectFilePath, '{"version":1}\n');
    runGit(repoRoot, ['add', 'game.json']);
    runGit(repoRoot, ['commit', '-m', 'Initial']);
    const initialCommitHash = runGit(repoRoot, ['rev-parse', 'HEAD']).trim();

    fs.writeFileSync(projectFilePath, '{"version":2}\n');
    fs.writeFileSync(path.join(repoRoot, 'tracked.txt'), 'tracked\n');
    runGit(repoRoot, ['add', '.']);
    runGit(repoRoot, ['commit', '-m', 'Second']);

    fs.writeFileSync(projectFilePath, '{"version":3}\n');
    fs.writeFileSync(path.join(repoRoot, 'untracked.txt'), 'remove\n');
    fs.mkdirSync(path.join(repoRoot, 'untracked-folder'));
    fs.writeFileSync(
      path.join(repoRoot, 'untracked-folder', 'file.txt'),
      'remove\n'
    );

    const status = await handleGitToolRequest({
      projectFilePath,
      action: 'reset',
      payload: { commitHash: initialCommitHash },
    });

    assert.strictEqual(
      runGit(repoRoot, ['rev-parse', 'HEAD']).trim(),
      initialCommitHash
    );
    assert.match(fs.readFileSync(projectFilePath, 'utf8'), /"version":1/);
    assert.strictEqual(
      fs.existsSync(path.join(repoRoot, 'tracked.txt')),
      false
    );
    assert.strictEqual(
      fs.existsSync(path.join(repoRoot, 'untracked.txt')),
      false
    );
    assert.strictEqual(
      fs.existsSync(path.join(repoRoot, 'untracked-folder')),
      false
    );
    assert.deepStrictEqual(status.changedFiles, []);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
};

const testDiffSupportsJsonFileWithSpaces = async () => {
  const repoRoot = createGitRepository();
  try {
    const projectFilePath = path.join(repoRoot, 'Puzzled Spy.json');
    fs.writeFileSync(
      projectFilePath,
      JSON.stringify({ name: 'Puzzled Spy', version: 1 }, null, 2) + '\n'
    );
    runGit(repoRoot, ['add', '.']);
    runGit(repoRoot, ['commit', '-m', 'Initial']);

    fs.writeFileSync(
      projectFilePath,
      JSON.stringify({ name: 'Puzzled Spy', version: 2 }, null, 2) + '\n'
    );

    const status = await handleGitToolRequest({
      projectFilePath,
      action: 'status',
    });
    assert.deepStrictEqual(status.changedFiles, [
      {
        path: 'Puzzled Spy.json',
        oldPath: null,
        indexStatus: '',
        workingTreeStatus: 'M',
        status: 'Modified',
      },
    ]);

    const diff = await handleGitToolRequest({
      projectFilePath,
      action: 'diff',
      payload: { file: status.changedFiles[0] },
    });
    assert.match(diff.diff, /diff --git/);
    assert.match(diff.diff, /Puzzled Spy\.json/);
    assert.match(diff.diff, /-  "version": 1/);
    assert.match(diff.diff, /[+]  "version": 2/);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
};

const run = async () => {
  await testResetRemovesUntrackedFiles();
  await testDiffSupportsJsonFileWithSpaces();
};

run().catch(error => {
  console.error(error);
  process.exit(1);
});
