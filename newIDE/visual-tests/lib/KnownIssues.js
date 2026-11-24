// @ts-check

/**
 * Problems that these tests do find, but that are not what they are here to
 * guard: they are reported (loudly, in the log and in the summary) without
 * failing the run, so that a branch is not blocked by something it did not
 * introduce.
 *
 * Remove an entry as soon as it is fixed: the run then fails again if it comes
 * back.
 */
const knownIssues = [
  {
    name: 'react-dnd loses a drag source',
    matches: /Expected sourceIds to be registered/,
    explanation:
      'A drag can throw `Invariant Violation: Expected sourceIds to be ' +
      'registered` from react-dnd, which takes the editor down. It happens ' +
      'after tens of manipulations, entirely inside react-dnd (the drag ' +
      'source of the pressed element is not registered anymore when the drag ' +
      'begins), and it also happens with the code that was there before these ' +
      'tests - so it is not a regression of the editor itself.',
  },
];

const findKnownIssue = message =>
  knownIssues.find(issue => issue.matches.test(message)) || null;

module.exports = { knownIssues, findKnownIssue };
