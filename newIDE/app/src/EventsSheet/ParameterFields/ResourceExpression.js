// @flow

/**
 * Whether the value of a resource parameter is an expression computing a
 * resource name, rather than the name of a resource chosen in the editor.
 *
 * Kept in sync with `gd::ParameterMetadata::IsResourceExpression`, which is
 * what the code generator, the validator and the resource collector use: the
 * editor must show the same field the game will run.
 *
 * A resource parameter stores the bare name of what it points at
 * (`Jump.mp3`), unlike every other string parameter which stores the literal
 * with its quotes. A computed name is a concatenation or a function call, so
 * it always carries a quote or a parenthesis, while an existing project holds
 * bare names only and is left as it is.
 */
export const isResourceExpression = (value: string): boolean =>
  value.includes('"') || value.includes('(');
