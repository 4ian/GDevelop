// @flow
// A port of GDevelop `Core/GDCore/Events/Parsers/GrammarTerminals.h`
// (`IsAllowedInIdentifier` and the character sets it relies on): identifiers
// (object, variable, behavior names...) can contain any unicode character
// except the ones reserved by the expressions grammar.
//
// KEEP IN SYNC - this definition exists in three places, which must all
// change together:
// - `Core/GDCore/Events/Parsers/GrammarTerminals.h` (the C++ source of
//   truth, used by the expressions parser and `gd::Project::IsNameSafe`),
// - this file (used by the EventScript source view),
// - `generation-api/src/lib/gdevelop-identifiers.js` in the
//   GDevelop-services repository (used by the EventScript parser and the
//   events validation).
// A character added or removed in one and not the others means the editor,
// the backend and the engine would disagree on what a valid name is.

const RESERVED_CHARACTERS = new Set([
  // Whitespaces:
  ' ',
  '\n',
  '\r',
  // Parameter separator:
  ',',
  // Dot:
  '.',
  // Quote:
  '"',
  // Brackets:
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  // Expression operators:
  '+',
  '-',
  '<',
  '>',
  '?',
  '^',
  '=',
  '\\',
  ':',
  '!',
  // Term operators:
  '/',
  '*',
  // Additional reserved characters:
  '~',
  "'",
  '%',
  '#',
  '@',
  '|',
  '&',
  '`',
  '$',
  ';',
]);

export const isAllowedInIdentifier = (character: string): boolean => {
  const code = character.charCodeAt(0);

  // Quick check to allow basic ASCII letters and digits.
  if (
    (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) // a-z
  ) {
    return true;
  }

  return !RESERVED_CHARACTERS.has(character);
};

/**
 * Check if the name is safe to use as an identifier (object name, behavior
 * name...) - the port of `gd::Project::IsNameSafe`. The editor can also
 * call the real C++ implementation through `gd.Project.isNameSafe`: this
 * port exists because the source view needs character-level checks (see
 * `containsNameUsedAsIdentifier`, which the C++ does not expose), and it is
 * verified against the C++ one by the conformance test of this module.
 */
export const isNameSafe = (name: string): boolean => {
  if (!name) return false;
  const firstLetter = name[0];
  if (!firstLetter) return false;

  if (!Number.isNaN(parseInt(firstLetter, 10))) return false;

  for (const character of Array.from(name)) {
    if (!isAllowedInIdentifier(character)) {
      return false;
    }
  }

  return true;
};

/**
 * Check if the text contains the name used as a whole identifier: an
 * occurrence with no identifier character just before or after (the
 * unicode-aware equivalent of a `\b` word boundary, which only understands
 * ASCII word characters).
 */
export const containsNameUsedAsIdentifier = (
  text: string,
  name: string
): boolean => {
  if (!name) return false;
  let searchStartIndex = 0;
  for (;;) {
    const index = text.indexOf(name, searchStartIndex);
    if (index === -1) return false;
    const characterBefore = text[index - 1] || '';
    const characterAfter = text[index + name.length] || '';
    if (
      (!characterBefore || !isAllowedInIdentifier(characterBefore)) &&
      (!characterAfter || !isAllowedInIdentifier(characterAfter))
    ) {
      return true;
    }
    searchStartIndex = index + 1;
  }
  // eslint-disable-next-line no-unreachable
  return false;
};
