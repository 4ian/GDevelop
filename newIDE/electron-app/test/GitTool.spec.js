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

const testCommitDiffIncludesAllChangesForSelectedCommit = async () => {
  const repoRoot = createGitRepository();
  try {
    const projectFilePath = path.join(repoRoot, 'game.json');
    fs.writeFileSync(projectFilePath, '{"version":1}\n');
    fs.writeFileSync(path.join(repoRoot, 'notes.txt'), 'before\n');
    runGit(repoRoot, ['add', '.']);
    runGit(repoRoot, ['commit', '-m', 'Initial']);

    fs.writeFileSync(projectFilePath, '{"version":2}\n');
    fs.writeFileSync(path.join(repoRoot, 'notes.txt'), 'after\n');
    fs.writeFileSync(path.join(repoRoot, 'added.txt'), 'added by selected\n');
    runGit(repoRoot, ['add', '.']);
    runGit(repoRoot, ['commit', '-m', 'Selected']);
    const selectedCommitHash = runGit(repoRoot, ['rev-parse', 'HEAD']).trim();

    fs.writeFileSync(projectFilePath, '{"version":3}\n');
    fs.writeFileSync(path.join(repoRoot, 'later-only.txt'), 'later commit\n');
    runGit(repoRoot, ['add', '.']);
    runGit(repoRoot, ['commit', '-m', 'Later']);

    fs.writeFileSync(path.join(repoRoot, 'notes.txt'), 'dirty worktree\n');
    fs.writeFileSync(
      path.join(repoRoot, 'untracked-only.txt'),
      'untracked worktree\n'
    );

    const result = await handleGitToolRequest({
      projectFilePath,
      action: 'commit-diff',
      payload: { commitHash: selectedCommitHash },
    });

    assert.strictEqual(result.commitHash, selectedCommitHash);
    assert.match(result.diff, /^diff --git a\/game\.json b\/game\.json$/m);
    assert.match(result.diff, /^diff --git a\/notes\.txt b\/notes\.txt$/m);
    assert.match(result.diff, /^diff --git a\/added\.txt b\/added\.txt$/m);
    assert.match(result.diff, /^-\{"version":1\}$/m);
    assert.match(result.diff, /^\+\{"version":2\}$/m);
    assert.match(result.diff, /^-before$/m);
    assert.match(result.diff, /^\+after$/m);
    assert.match(result.diff, /^\+added by selected$/m);
    assert.doesNotMatch(result.diff, /"version":3/);
    assert.doesNotMatch(result.diff, /later-only\.txt/);
    assert.doesNotMatch(result.diff, /dirty worktree/);
    assert.doesNotMatch(result.diff, /untracked-only\.txt/);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
};

const testCommitDiffSupportsRootCommit = async () => {
  const repoRoot = createGitRepository();
  try {
    const projectFilePath = path.join(repoRoot, 'game.json');
    fs.writeFileSync(projectFilePath, '{"version":1}\n');
    runGit(repoRoot, ['add', '.']);
    runGit(repoRoot, ['commit', '-m', 'Initial']);
    const rootCommitHash = runGit(repoRoot, ['rev-parse', 'HEAD']).trim();

    const result = await handleGitToolRequest({
      projectFilePath,
      action: 'commit-diff',
      payload: { commitHash: rootCommitHash },
    });

    assert.strictEqual(result.commitHash, rootCommitHash);
    assert.match(result.diff, /^diff --git a\/game\.json b\/game\.json$/m);
    assert.match(result.diff, /^new file mode /m);
    assert.match(result.diff, /^--- \/dev\/null$/m);
    assert.match(result.diff, /^\+\+\+ b\/game\.json$/m);
    assert.match(result.diff, /^@@ -0,0 \+1 @@$/m);
    assert.match(result.diff, /^\+\{"version":1\}$/m);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
};

const testCommitDiffUsesStandardUnifiedPatchForMergeCommit = async () => {
  const repoRoot = createGitRepository();
  try {
    const projectFilePath = path.join(repoRoot, 'game.json');
    fs.writeFileSync(projectFilePath, '{"version":1}\n');
    runGit(repoRoot, ['add', '.']);
    runGit(repoRoot, ['commit', '-m', 'Initial']);
    const mainBranch = runGit(repoRoot, ['branch', '--show-current']).trim();

    runGit(repoRoot, ['checkout', '--quiet', '-b', 'feature']);
    fs.writeFileSync(path.join(repoRoot, 'feature.txt'), 'from feature\n');
    runGit(repoRoot, ['add', '.']);
    runGit(repoRoot, ['commit', '-m', 'Feature']);

    runGit(repoRoot, ['checkout', '--quiet', mainBranch]);
    fs.writeFileSync(path.join(repoRoot, 'main.txt'), 'from main\n');
    runGit(repoRoot, ['add', '.']);
    runGit(repoRoot, ['commit', '-m', 'Main']);
    runGit(repoRoot, [
      'merge',
      '--quiet',
      '--no-ff',
      'feature',
      '-m',
      'Merge feature',
    ]);
    const mergeCommitHash = runGit(repoRoot, ['rev-parse', 'HEAD']).trim();

    const result = await handleGitToolRequest({
      projectFilePath,
      action: 'commit-diff',
      payload: { commitHash: mergeCommitHash },
    });

    assert.match(result.diff, /^diff --git a\/feature\.txt b\/feature\.txt$/m);
    assert.match(result.diff, /^--- \/dev\/null$/m);
    assert.match(result.diff, /^\+\+\+ b\/feature\.txt$/m);
    assert.match(result.diff, /^@@ -0,0 \+1 @@$/m);
    assert.match(result.diff, /^\+from feature$/m);
    assert.doesNotMatch(result.diff, /^diff --(?:cc|combined) /m);
    assert.doesNotMatch(result.diff, /^@@@/m);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
};

const run = async () => {
  await testResetRemovesUntrackedFiles();
  await testDiffSupportsJsonFileWithSpaces();
  await testCommitDiffIncludesAllChangesForSelectedCommit();
  await testCommitDiffSupportsRootCommit();
  await testCommitDiffUsesStandardUnifiedPatchForMergeCommit();
};

run().catch(error => {
  console.error(error);
  process.exit(1);
});
