// @flow
import * as React from 'react';
import Dialog from '../Dialog';
import ScrollView from '../ScrollView';

const styles = {
  headerContainerStyle: {
    maxHeight: 80,
    overflow: 'auto',
  },
  mainContainerStyle: {
    maxHeight: 240,
    overflow: 'auto',
  },
  footerContainerStyle: {
    maxHeight: 80,
    overflow: 'auto',
  },
};

// We support a subset of the props supported by Material-UI v0.x Dialog
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  open?: boolean,
  title?: React.Node,
  actions?: React.Node,
  secondaryActions?: React.Node,
  onRequestClose?: () => void,

  modal?: boolean, // Force the user to use one of the actions in the Dialog. Clicking outside the Dialog will not trigger the onRequestClose.

  children: React.Node, // The content of the dialog

  // Display:
  flexRowBody?: boolean, //Check if necessary
  flexBody?: boolean,

  // Size
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false,

  // Header, Footer and their styles
  header?: React.Node,
  footer?: React.Node,
  headerContainerStyle?: Object,
  footerContainerStyle?: Object,
  mainContainerStyle?: Object,

  // Style:
  noMargin?: boolean,
  noTitleMargin?: boolean,
|};

/**
 * A enhanced material-ui Dialog that can have optional secondary actions
 * and no margins if required.
 */
export default (props: Props) => {
  const {
    secondaryActions,
    actions,
    open,
    onRequestClose,
    maxWidth,
    noMargin,
    title,
    header,
    children,
    footer,
    headerContainerStyle,
    mainContainerStyle,
    footerContainerStyle,
    flexBody,
    noTitleMargin,
  } = props;

  return (
    <Dialog
      title={title}
      secondaryActions={secondaryActions}
      actions={actions}
      open={open}
      onRequestClose={onRequestClose}
      maxWidth={maxWidth}
      noMargin={noMargin}
      flexRowBody={false}
      flexBody={flexBody}
      noTitleMargin={noTitleMargin}
    >
      {header && (
        <ScrollView
          style={{ ...styles.headerContainerStyle, ...headerContainerStyle }}
        >
          {header}
        </ScrollView>
      )}
      <ScrollView
        style={{ ...styles.mainContainerStyle, ...mainContainerStyle }}
      >
        {children}
      </ScrollView>
      {footer && (
        <ScrollView
          style={{ ...styles.footerContainerStyle, ...footerContainerStyle }}
        >
          {footer}
        </ScrollView>
      )}
    </Dialog>
  );
};
