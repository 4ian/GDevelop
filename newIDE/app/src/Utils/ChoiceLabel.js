// @flow

/**
 * Build the label to display for a property choice, hiding the (untranslated)
 * value when the translated label already starts with it.
 */
export const getChoiceDisplayLabel = (
  value: string,
  label: ?string
): string => {
  if (!label) return value;
  if (label.startsWith(value)) return label;
  return `${value} — ${label}`;
};
