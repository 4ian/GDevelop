// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import classNames from 'classnames';
import { selectedArea, selectableArea, disabledText, icon } from './ClassNames';
import { type ScreenType } from '../../UI/Responsive/ScreenTypeMeasurer';
import { type WindowSizeType } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import {
  shouldActivate,
  shouldValidate,
} from '../../UI/KeyboardShortcuts/InteractionKeys';
import LocalVariableIcon from '../../UI/CustomSvgIcons/LocalVariable';
import { getVariableTypeIcon } from '../ParameterFields/VariableField';

const gd: libGDevelop = global.gd;

const styles = {
  container: {
    whiteSpace: 'normal',
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices (or for long expressions).
    cursor: 'pointer',
    marginBottom: 1,
  },
};

export const reactDndInstructionType = 'GD_DRAGGED_VARIABLE_DECLARATION';

type Props = {|
  variableName: string,
  variable: gdVariable,
  onClick: Function,
  onDoubleClick: () => void,
  selected: boolean,
  disabled: boolean,

  screenType: ScreenType,
  windowSize: WindowSizeType,

  id: string,
|};

const getVariableTypeLabel = (variable: gdVariable, i18n: I18nType) => {
  const type = variable.getType();
  return type === gd.Variable.String
    ? i18n._('Text')
    : type === gd.Variable.Number
    ? i18n._('Number')
    : type === gd.Variable.Boolean
    ? i18n._('Boolean')
    : type === gd.Variable.Structure
    ? i18n._('Structure')
    : type === gd.Variable.Array
    ? i18n._('Array')
    : 'unknown';
};

const getVariableValueAsString = (variable: gdVariable, i18n: I18nType) => {
  const type = variable.getType();
  return type === gd.Variable.Structure || type === gd.Variable.Array
    ? i18n._(
        variable.getChildrenCount() === 0
          ? t`No children`
          : variable.getChildrenCount() === 1
          ? t`1 child`
          : t`${variable.getChildrenCount()} children`
      )
    : type === gd.Variable.String
    ? variable.getString()
    : type === gd.Variable.Number
    ? variable.getValue().toString()
    : type === gd.Variable.Boolean
    ? variable.getBool()
      ? i18n._(t`True`)
      : i18n._(t`False`)
    : null;
};

export const VariableDeclaration = (props: Props) => {
  const { variableName, variable, id } = props;
  /**
   * Render the different parts of the text of the instruction.
   * Parameter can have formatting, be hovered and clicked. The rest
   * has not particular styling.
   */
  const renderInstructionText = (i18n: I18nType) => {
    const { disabled } = props;

    const VariableTypeIcon = getVariableTypeIcon(variable.getType());

    return (
      <span
        className={classNames({
          [disabledText]: disabled,
        })}
      >
        <Trans>
          Declare{' '}
          <span>
            <LocalVariableIcon
              className={classNames({
                [icon]: true,
              })}
            />
            {variableName}
          </span>{' '}
          as{' '}
          <span>
            <VariableTypeIcon
              className={classNames({
                [icon]: true,
              })}
            />
            {getVariableTypeLabel(variable, i18n)}
          </span>{' '}
          with <span>{getVariableValueAsString(variable, i18n)}</span>
        </Trans>
      </span>
    );
  };

  return (
    <I18n>
      {({ i18n }) => (
        <div
          style={styles.container}
          className={classNames({
            [selectableArea]: true,
            [selectedArea]: props.selected,
          })}
          onClick={e => {
            e.stopPropagation();

            if (props.screenType === 'touch' && props.selected) {
              // On touch screens, tapping again a selected instruction should edit it.
              props.onDoubleClick();
            } else {
              props.onClick();
            }
          }}
          onDoubleClick={e => {
            e.stopPropagation();
            props.onDoubleClick();
          }}
          onKeyPress={event => {
            if (shouldValidate(event)) {
              props.onDoubleClick();
              event.stopPropagation();
              event.preventDefault();
            } else if (shouldActivate(event)) {
              props.onClick();
              event.stopPropagation();
              event.preventDefault();
            }
          }}
          tabIndex={0}
          id={id}
        >
          {renderInstructionText(i18n)}
        </div>
      )}
    </I18n>
  );
};
