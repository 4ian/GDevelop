export default {
  toolColumnHeader: {
    textAlign: 'left',
    paddingRight: 4,
  },
  toolColumn: {
    minWidth: 48,
    flex: 0,
    justifyContent: 'flex-end',
  },
  tableChildIndentation: 18,
  indent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // The indentation is fixed and should never be smaller than the width that is set:
    flexShrink: 0,
  },
  indentIconColor: '#DDD', //TODO: Use theme color instead
  fadedButton: {
    opacity: 0.7,
  },
  noPaddingMultilineTextField: {
    // By default, Material-UI adds some padding on top and bottom of a multiline text field.
    // Avoid this to prevent extra spaces that would make single line strings
    // (for variable values) not aligned with the variable name
    padding: 0,
  },
};
