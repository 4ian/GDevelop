// @flow
import * as React from 'react';
import ElementWithMenu from './Menu/ElementWithMenu';
import { type MenuItemTemplate } from './Menu/Menu.flow';
import { type I18n as I18nType } from '@lingui/core';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import { Spacer } from './Grid';
import ChevronArrowBottom from './CustomSvgIcons/ChevronArrowBottom';

type Props = {|
  id?: string,
  label?: React.Node,
  primary: true, // Force making only primary raised split buttons.
  disabled?: boolean,
  icon?: React.Node,
  onClick: ?() => void,
  buildMenuTemplate: (i18n: I18nType) => Array<MenuItemTemplate>,
  style?: {|
    marginTop?: number,
    marginBottom?: number,
    marginLeft?: number,
    marginRight?: number,
    margin?: number,
    flexShrink?: 0,
  |},
|};

const shouldNeverBeCalled = () => {
  throw new Error(
    'This RaisedButtonWithSplitMenu onClick should never be called'
  );
};

const styles = {
  mainButton: { flex: 1 },
  arrowDropDownButton: {
    // Reduce the size forced by Material UI to avoid making the arrow
    // too big.
    minWidth: 30,
    paddingLeft: 0,
    paddingRight: 0,
  },
};

/**
 * A raised button based on Material-UI button, that has a menu displayed
 * when the dropdown arrow is clicked.
 */
const RaisedButtonWithSplitMenu = (props: Props) => {
  const { id, buildMenuTemplate, onClick, label, icon, disabled } = props;

  // In theory, focus ripple is only shown after a keyboard interaction
  // (see https://github.com/mui-org/material-ui/issues/12067). However, as
  // it's important to get focus right in the whole app, make the ripple
  // always visible to be sure we're getting focusing right.
  const focusRipple = true;

  return (
    <ButtonGroup
      variant={'contained'}
      disableElevation
      color={'primary'}
      disabled={disabled}
      size="small"
      style={props.style}
    >
      <Button
        id={id}
        focusRipple={focusRipple}
        onClick={onClick}
        style={styles.mainButton}
      >
        {icon}
        {!!icon && !!label && <Spacer />}
        {label}
      </Button>
      <ElementWithMenu
        passExtraProps={
          true /* ButtonGroup is passing props to Button: disabled, color, variant, size */
        }
        element={
          <Button
            onClick={shouldNeverBeCalled}
            focusRipple={focusRipple}
            style={styles.arrowDropDownButton}
          >
            <ChevronArrowBottom />
          </Button>
        }
        buildMenuTemplate={buildMenuTemplate}
      />
    </ButtonGroup>
  );
};

export default RaisedButtonWithSplitMenu;
