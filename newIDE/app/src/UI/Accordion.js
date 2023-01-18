// @flow
import * as React from 'react';
import MUIAccordion from '@material-ui/core/Accordion';
import MUIAccordionSummary from '@material-ui/core/AccordionSummary';
import MUIAccordionDetails from '@material-ui/core/AccordionDetails';
import MUIAccordionActions from '@material-ui/core/AccordionActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from './IconButton';
import GDevelopThemeContext from './Theme/ThemeContext';

const styles = {
  bodyRoot: {
    // Remove body padding
    padding: 0,
  },
};

type AccordionHeadProps = {|
  children: React.Node,
  actions?: Array<React.Node>,
  expandIcon?: React.Node,
|};

/**
 * The header of an accordion section.
 * Based on Material-UI AccordionSummary.
 */
export const AccordionHeader = (props: AccordionHeadProps) => {
  return (
    <MUIAccordionSummary
      expandIcon={
        props.expandIcon || (
          <IconButton size="small">
            <ExpandMoreIcon />
          </IconButton>
        )
      }
    >
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        {props.children}
      </div>
      {props.actions && (
        <div style={{ flexGrow: 0, flexShrink: 0, alignSelf: 'center' }}>
          {props.actions}
        </div>
      )}
    </MUIAccordionSummary>
  );
};

type AccordionBodyProps = {|
  children: React.Node,
  style?: Object,

  // Removes all padding in body container
  disableGutters?: boolean,
|};

/**
 * The collapsible contents of an accordion section.
 * Based on Material-UI AccordionDetails.
 */
export const AccordionBody = (props: AccordionBodyProps) => {
  return (
    <MUIAccordionDetails
      style={{ ...(props.disableGutters && styles.bodyRoot), ...props.style }}
    >
      {props.children}
    </MUIAccordionDetails>
  );
};

type AccordionActionsProps = {|
  actions: Array<React.Node>,
  secondaryActions?: Array<React.Node>,
|};

/**
 * The footer of an accordion section, used to provide
 * actions specific to the accordion contents.
 * Based on Material-UI AccordionActions.
 */
export const AccordionActions = (props: AccordionActionsProps) => {
  const accordionActions = props.secondaryActions ? (
    <React.Fragment>
      <div key="secondary-actions">{props.secondaryActions}</div>
      <div key="actions">{props.actions}</div>
    </React.Fragment>
  ) : (
    props.actions
  );

  return <MUIAccordionActions>{accordionActions}</MUIAccordionActions>;
};

type AccordionProps = {|
  // AccordionSummary, AccordionBody and/or AccordionDetails
  children: React.Node,

  defaultExpanded?: boolean,
  disabled?: boolean,

  // If `true`, renders body only if accordion is open
  costlyBody?: boolean,

  // Use accordion in controlled mode
  expanded?: boolean,
  onChange?: (open: boolean) => void,
  id?: string,
|};

/**
 * A block of collapsible content, with an always-shown header
 * and accordion-specific actions.
 * Based on Material-UI Accordion.
 */
export const Accordion = (props: AccordionProps) => {
  const { costlyBody, ...otherProps } = props;
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <MUIAccordion
      {...otherProps}
      square
      elevation={0}
      style={{
        border: `1px solid ${gdevelopTheme.toolbar.separatorColor}`,
        backgroundColor: gdevelopTheme.paper.backgroundColor.medium,
        marginLeft: 0,
      }}
      TransitionProps={{ unmountOnExit: !!costlyBody }}
    />
  );
};
