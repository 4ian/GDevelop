# Visual monkey tests

These tests manipulate the GDevelop editor like a user would - in a real
browser, with real clicks and real drag and drops - and check after **every
single manipulation** that nothing is broken.

They exist because the editors manipulate C++ objects (through GDevelop.js): the
vectors holding, for instance, the animations of a sprite object, their
directions and their frames are reallocated as soon as one is added or removed.
Anything the editor kept a reference to before such a change is then dangling,
and using it takes the whole editor down with a
`RuntimeError: memory access out of bounds` - or, worse, silently displays and
edits the wrong data. This kind of bug is invisible to unit tests and to a quick
manual check, but a few dozen random manipulations find it in seconds.

## The two suites

|                    | `storybook`                                             | `editor`                                            |
| ------------------ | ------------------------------------------------------- | --------------------------------------------------- |
| Runs on            | The Storybook stories of one editor, in Chrome           | A real packaged app (portable Linux build)          |
| Checks             | Everything the editor displays vs. what the object contains | The editor is there and nothing throws          |
| Used for           | Precise tests of one editor, including nasty cases       | Smoke tests: "nothing is badly broken"             |
| Tests in           | `storybook-tests/`                                       | `editor-tests/`                                    |

The `storybook` suite can check a lot more, because the stories expose the
animations of the edited object on `window.spriteEditorManipulations`: after
each manipulation, the animation names, the frames of every mounted sprites
list, the time between frames and the looping are compared with what the object
actually contains. The stories also make every manipulation possible outside of
the app (confirmation dialogs, a resource chooser that needs no dialog, fake
external editors).

The `editor` suite drives the real app, so it catches what only happens once
everything is packaged together - but it can only look at the page. Menus are
native menus on the desktop app, so anything going through a menu (moving an
animation, the frames context menu) is not tested there, and neither is
anything opening a file picker or an external editor window.

## Running them

```bash
cd newIDE/visual-tests
npm install

node run.js --list                      # all the tests of both suites
node run.js --suite=storybook           # builds Storybook if needed, then runs
node run.js --suite=editor              # downloads the latest portable build
node run.js --suite=all
```

Useful options:

| Option                          | What it does                                                        |
| ------------------------------- | ------------------------------------------------------------------- |
| `--test=<part of a name>`       | Only run the tests whose name contains this                         |
| `--headful`                     | Show the browser (very useful to see what the test does)            |
| `--verbose`                     | Log every manipulation of the random sessions                        |
| `--storybook-url=<url>`         | Use a Storybook already running (`npm run storybook`) instead of building |
| `--rebuild-storybook`           | Rebuild Storybook even if it was already built                       |
| `--gdevelop-zip=<path>`         | Use this portable build instead of downloading one                   |
| `--gdevelop-branch=<branch>`    | Download the latest portable build of this branch (default: master)  |
| `--editor-monkey-steps=<n>`     | Manipulations of the random session on the real editor (default: 30) |
| `--artifacts-dir=<path>`        | Where the screenshots and the logs are written (default: `artifacts`) |
| `--chrome-path=<path>`          | The Chrome to run the Storybook tests in                             |

While writing a test, running Storybook in another terminal and using
`--storybook-url=http://localhost:9009 --headful --test=<name>` gives the
fastest feedback.

## Writing a test

A test file exports an array of tests. In `storybook-tests/`, a test is either a
list of manipulations to do in order:

```js
{
  name: 'sprite-editor/delete-animations',
  description: 'Removing an animation frees its directions.',
  story: 'objecteditor-spriteeditormanipulations--manipulations',
  steps: [
    ['selectFrames', { row: 1, frames: [0, 1] }],
    ['deleteAnimation', { row: 0 }],
    ['serialize'],
  ],
}
```

or a random session ("monkey"), which does what the tests above did not think
of. Each seed is a different, reproducible sequence:

```js
{
  name: 'sprite-editor/monkey-with-many-frames',
  story: 'objecteditor-spriteeditormanipulations--manipulations-with-many-frames',
  monkey: { seeds: [1, 2], steps: 60 },
}
```

The manipulations available (`addAnimation`, `deleteAnimation`, `dragFrame`,
`frameContextMenuAction`...) are all in `lib/SpriteEditorActions.js`, with what
the monkey is allowed to pick and what must be true after each of them. That is
where a new manipulation is added.

In `editor-tests/`, a test opens an example game in the real app and drives it
with the same manipulations:

```js
{
  name: 'editor/sprite-editor-monkey',
  example: 'platformer', // sparse-cloned from GDevelop-examples
  run: async ({ page, pageErrors, reporter, options }) => { ... },
}
```

## What is checked after every manipulation

- The page threw nothing (an uncaught error takes the editor down).
- The editor is still displayed.
- What the editor displays is exactly what the edited object contains
  (`storybook` suite only).
- The manipulation actually changed something - so that a test cannot pass
  without having exercised anything.
- Manipulations with a precise outcome get it checked: deleting, duplicating or
  moving the selected frames must produce exactly the expected frames, an
  external editor session must give back the frames it was given plus the new
  ones and keep the settings of the direction.
- Only reordering never creates or loses a frame.
- A change of the animations leaves no frame selected (the selection designates
  frames by their index, so it would then point at other frames).

## In the CI

Two CircleCI jobs (see `.circleci/config.yml`):

- `visual-monkey-tests-storybook-linux` runs the `storybook` suite on every
  branch, in the `tests` workflow.
- `visual-monkey-tests-editor-linux` runs the `editor` suite on the portable
  build that `build-linux` just produced, and every day against the latest
  build uploaded to S3 for master.

Both store their logs and the screenshot taken at the end of each test as
artifacts.
