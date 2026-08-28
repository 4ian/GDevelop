// @flow

/**
 * Build the label to display for a choice of a property, given its value
 * (which is not translated) and its label (which is translated).
 *
 * The value is displayed along with the label, so that the user knows what
 * is stored/used in events - but not if the label already starts with the
 * value (which would be redundant).
 */
export const getChoiceDisplayLabel = (
  value: string,
  label: ?string
): string => {
  if (!label) return value;
  if (label.startsWith(value)) return label;
  return `${value} — ${label}`;
};
