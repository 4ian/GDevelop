# Visual monkey tests

These tests manipulate the editor like a user would - in a real browser, with
real clicks and real drag and drops - and check after **every single
manipulation** that nothing is broken.

They catch the bugs that unit tests can't see, because they only appear when
everything runs together: something displayed that is not what the project
contains, a manipulation acting on the wrong thing, or an error taking the whole
editor down. A few dozen random manipulations find these in seconds.

## Two suites

| | `storybook-tests/` | `editor-tests/` |
| --- | --- | --- |
| Runs on | The Storybook stories of one editor | A real packaged app opening a real game |
| Checks | What is displayed vs. what the project contains | The editor is there and nothing throws |
| For | Precise tests of one editor | Smoke tests: "nothing is badly broken" |

The Storybook suite can check much more, because a story can expose the object
being edited. The editor suite runs the real thing, but can only look at the
page - and anything going through a menu (native menus on the desktop app), a
file picker or an external editor window is left to the Storybook suite.

## Running them

```bash
cd newIDE/visual-tests
npm install                             # also downloads the Chrome to run in

node run.js --list
node run.js --suite=storybook           # builds Storybook if needed, then runs
node run.js --suite=editor              # downloads the latest portable build
node run.js --suite=all
```

| Option | |
| --- | --- |
| `--test=<part of a name>` | Only run the tests whose name contains this |
| `--headful` | Show the browser (to see what the test does) |
| `--verbose` | Log every manipulation of the random sessions |
| `--storybook-url=<url>` | Use a Storybook already running instead of building |
| `--rebuild-storybook` | Rebuild Storybook even if already built |
| `--gdevelop-zip=<path>` | Use this portable build instead of downloading one |
| `--gdevelop-branch=<branch>` | Download the latest portable build of this branch |
| `--editor-monkey-steps=<n>` | Manipulations of a random session on the real app |
| `--artifacts-dir=<path>` | Where screenshots and logs go (default: `artifacts`) |
| `--chrome-path=<path>` | The Chrome to run in |
| `--only-changed --base-ref=<ref>` | Only run the tests related to what changed |
| `--list-names`, `--tests-file=<path>` | List / run exactly these tests (used to split them across the CI containers) |
| `--junit-path=<path>` | Write the results as JUnit |

On a branch, the CI only runs the tests related to what it changes (and builds
nothing if there are none): each helper declares the sources its tests watch, in
its `paths`, and changing the tests themselves relates every test. Everything
runs on `master` - a change anywhere else can break an editor too - and
`run-all-visual-tests` on a pipeline forces that on a branch.

Both suites work this way, with one difference: on a branch, the editor suite
runs against the latest portable build of `master` (a branch builds no app), so
it exercises the tests of the branch, but not its changes to the app itself -
those are tested by the same suite on `master`, right after `build-linux`.

A problem these tests find but are not here to guard can be listed in
`lib/KnownIssues.js`: it is then reported loudly without failing the run, so
that a branch is not blocked by something it did not introduce.

While writing a test, `--storybook-url=http://localhost:9009 --headful
--test=<name>` (with `npm run storybook` running) gives the fastest feedback.

## Writing a test

A test file exports an array of tests. A Storybook test is a list of
manipulations, or a random session ("monkey") whose seeds make it reproducible:

```js
const spriteEditor = require('../helpers/SpriteEditor');

module.exports = [
  {
    name: 'sprite-editor/delete-animations',
    helper: spriteEditor,
    story: 'objecteditor-spriteeditormanipulations--manipulations',
    steps: [
      ['selectFrames', { row: 1, frames: [0, 1] }],
      ['deleteAnimation', { row: 0 }],
    ],
  },
  {
    name: 'sprite-editor/monkey',
    helper: spriteEditor,
    story: 'objecteditor-spriteeditormanipulations--manipulations',
    monkey: { seeds: [1, 2], steps: 60 },
  },
];
```

An editor test opens an example game in the real app and drives it, using the
same manipulations:

```js
{
  name: 'editor/add-a-behavior-from-the-store',
  example: 'platformer',           // sparse-cloned from GDevelop-examples
  helpers: [spriteEditor],         // page helpers to install (optional)
  run: async ({ page, reporter, screenshot, runSteps, runMonkey }) => { ... },
}
```

## Testing another part of the app

Everything generic is in `lib/`: driving a page (`PageHelpers.js`,
`PageDriver.js`), running and checking manipulations (`Runner.js`), the two
suites and the reporting. None of it knows about any particular editor.

An editor is described by a **helper** in `helpers/`, which is the only place
knowing about it:

| | |
| --- | --- |
| `installPageHelpers` | Runs in the page: finds the controls of the editor and reads what it displays. Registers a resolver so its targets (a row, a frame...) can be used like the generic ones (`{ button: 'Apply' }`, `{ selector: '#id' }`, `{ menuItem: '...' }`, `{ tab: 'Behaviors' }`). |
| `actions` | The manipulations, with how the monkey may pick them (`pick`) and what must be true afterwards (`expect`, checked by `checkExpectation`) |
| `describe` / `check` | What the editor displays, and whether it matches the project |
| `snapshot` (optional) | What the manipulations may change, to tell a manipulation that did nothing from one that worked (`describe` is used otherwise), with `describeEffect` to log what changed |
| `stepChecks` (optional) | The invariants of the editor: each one is checked after every manipulation flagged with its name (e.g. `keepsTheFrames` in the Sprite editor) |
| `summarize` (optional) | One line describing what is displayed, logged when a story is opened |
| `paths` | The sources its tests watch: they only run when one of these changed |

`helpers/SpriteEditor.js` is the complete example. `helpers/ObjectsList.js`,
`helpers/BehaviorsEditor.js` and `helpers/PropertiesPanel.js` are smaller ones,
used by the editor tests to reach and manipulate other parts of the app.

## What is checked after every manipulation

- The page threw nothing (an uncaught error takes the editor down).
- The editor is still displayed.
- What it displays matches the project (when the helper can read it).
- The manipulation actually changed something, so a test cannot pass without
  having exercised anything.
- Manipulations with a precise outcome (`expect`) get it checked, and the
  invariants declared by the helper (`stepChecks`) hold.
