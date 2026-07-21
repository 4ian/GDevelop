// @flow
import * as React from 'react';
import renderer from 'react-test-renderer';
import { CommitRow, parseUnifiedDiff } from './GitTool';
import { type GitCommit } from './GitToolApi';

describe('GitTool', () => {
  it('opens the selected commit diff from the commit title button', () => {
    const commit = {
      hash: '0123456789abcdef0123456789abcdef01234567',
      shortHash: '0123456',
      author: 'GDevelop Test',
      date: '2026-07-18T12:51:00+08:00',
      subject: 'Update player movement',
    };
    const onOpenDiff: GitCommit => void = jest.fn();
    const i18n: any = {
      _: message => (typeof message === 'string' ? message : message.id),
      date: () => 'Jul 18, 2026, 12:51 PM',
    };
    const component = renderer.create(
      <CommitRow
        commit={commit}
        i18n={i18n}
        disabled={false}
        onOpenDiff={onOpenDiff}
        onRevert={jest.fn()}
        onReset={jest.fn()}
      />
    );

    const commitTitleButtons = component.root.findAll(
      node => node.type === 'button' && !!node.props['aria-label']
    );
    expect(commitTitleButtons).toHaveLength(1);

    commitTitleButtons[0].props.onClick();

    expect(onOpenDiff).toHaveBeenCalledTimes(1);
    expect(onOpenDiff).toHaveBeenCalledWith(commit);
  });

  it('keeps every file and non-text change visible in a commit diff', () => {
    const rows = parseUnifiedDiff(`diff --git a/game.json b/game.json
index 9e26dfe..83f236d 100644
--- a/game.json
+++ b/game.json
@@ -1 +1 @@
-{"version":1}
+{"version":2}
diff --git a/notes.txt b/notes.txt
index d3a15ab..650a252 100644
--- a/notes.txt
+++ b/notes.txt
@@ -1 +1 @@
-before
+after
diff --git a/old-image.png b/new-image.png
similarity index 100%
rename from old-image.png
rename to new-image.png
diff --git a/added-image.png b/added-image.png
new file mode 100644
index 0000000..e69de29
Binary files /dev/null and b/added-image.png differ`);

    expect(
      rows.filter(row => row.kind === 'file').map(row => row.label)
    ).toEqual([
      'game.json',
      'notes.txt',
      'old-image.png -> new-image.png',
      'added-image.png',
    ]);
    expect(
      rows
        .filter(row => row.kind === 'changed')
        .map(row => ({
          oldText: row.oldText,
          newText: row.newText,
        }))
    ).toEqual([
      { oldText: '{"version":1}', newText: '{"version":2}' },
      { oldText: 'before', newText: 'after' },
    ]);
    expect(
      rows.filter(row => row.kind === 'note').map(row => row.label)
    ).toEqual([
      'similarity index 100%',
      'rename from old-image.png',
      'rename to new-image.png',
      'new file mode 100644',
      'Binary files /dev/null and b/added-image.png differ',
    ]);
  });
});
