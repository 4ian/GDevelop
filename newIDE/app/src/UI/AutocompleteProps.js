// @flow

/**
 * Provides props for material-ui AutoComplete components that specify
 * sensible defaults for size and popover size/positioning.
 */
export const defaultAutocompleteProps = {
  fullWidth: true,
  textFieldStyle: {
    minWidth: 300,
  },
  menuProps: {
    maxHeight: 250, //TODO: try put it in PopoverProps
  },
  popoverProps: {
    // Ensure that the Popover menu is always visible on screen
    canAutoPosition: true,
  },
};
