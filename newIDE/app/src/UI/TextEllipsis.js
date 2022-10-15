/**
 * The style to apply on a div to add ellipsis when the
 * text is overflowing.
 *
 * Please use this so that it's easy to search in the codebase
 * where text ellipsis is used (without having yet another component).
 * Please also use a `title` prop on the div to set the text tooltip.
 */
export const textEllipsisStyle = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
};
