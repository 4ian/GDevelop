// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { I18n } from '@lingui/react';
import type { I18n as I18nType } from '@lingui/core';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import { tooltipEnterDelay } from '../UI/Tooltip';
import TrashIcon from '../UI/CustomSvgIcons/Trash';
import InstanceVariableIcon from '../UI/CustomSvgIcons/InstanceVariable';
import FirstInstanceVariableIcon from '../UI/CustomSvgIcons/FirstInstanceVariable';
// The same icon as the button opening the expression editor.
import ExpressionIcon from '@material-ui/icons/Functions';
import { getVariableTypeToIcon } from '../VariablesList/VariableTypeSelector';
import { getVariableSourceIcon } from '../EventsSheet/ParameterFields/VariableField';
import { formatEvaluationValue } from './formatting';
import {
  type WatchedItem,
  getValueType,
  isTree,
  summarizeTree,
} from './WatchedItems';
import { type LivePreviewStatus } from './UseLiveExpressionEvaluations';
import classes from './WatchedVariablesPanel.module.css';

const gd: libGDevelop = global.gd;

/**
 * How much the tree view indents a row, in pixels. The column of the values is
 * aligned on the panel, not on the row: it has to add back what the
 * indentation took from the left of the row.
 */
const TREE_VIEW_INDENT_PER_DEPTH = 16;

const getRowIndentStyle = (item: WatchedItem) => ({
  '--row-indent': `${item.depth * TREE_VIEW_INDENT_PER_DEPTH}px`,
});

const WatchedValue = ({
  item,
  previewStatus,
}: {|
  item: WatchedItem,
  previewStatus: LivePreviewStatus,
|}): React.Node => {
  if (item.error) {
    return (
      <Text noMargin size="body2" color="inherit">
        {item.error}
      </Text>
    );
  }
  if (!item.hasValue) {
    return (
      <Text noMargin size="body2" color="secondary">
        {previewStatus === 'running' ? (
          // The first values are about to arrive.
          <Trans>Reading…</Trans>
        ) : previewStatus === 'withoutDebugger' ? (
          <Trans>Open the debugger to watch values</Trans>
        ) : (
          <Trans>Start a preview</Trans>
        )}
      </Text>
    );
  }
  return (
    <Text noMargin size="body2" color="inherit">
      {isTree(item.value)
        ? summarizeTree(item.value)
        : // The icon of the type is right next to the value: the quotes
          // around a string would only add noise.
          formatEvaluationValue(item.value, 200, false)}
    </Text>
  );
};

type Props = {|
  item: WatchedItem,
  previewStatus: LivePreviewStatus,
  onStopWatching: (expression: string) => void,
|};

/**
 * A whole row of the watched variables panel: the name on the left, the value
 * on the right. The tree view has no "right component", so the row is built
 * here, as the name of the item.
 */
const WatchedVariableRow = ({
  item,
  previewStatus,
  onStopWatching,
}: Props): React.Node => {
  if (item.isPlaceholder) {
    return (
      <div className={classes.row} style={getRowIndentStyle(item)}>
        <span className={classes.rowIcon} />
        <Text noMargin size="body2" color="secondary">
          <Trans>Reading the instances...</Trans>
        </Text>
      </div>
    );
  }
  if (item.isMoreRow) {
    const hiddenInstancesCount = item.hiddenInstancesCount || 0;
    return (
      <div className={classes.row} style={getRowIndentStyle(item)}>
        <span className={classes.rowIcon} />
        <Text noMargin size="body2" color="secondary">
          <Trans>and {hiddenInstancesCount} more</Trans>
        </Text>
      </div>
    );
  }
  // An expression is not a variable of an unknown source: it has its own
  // icon, where the source icon would show the cross of what it could not
  // resolve.
  const VariableIcon =
    item.expression &&
    item.sourceType === gd.VariablesContainer.Unknown &&
    item.expression.includes('(')
      ? ExpressionIcon
      : getVariableSourceIcon(item.sourceType);
  const hasSeveralInstances =
    !!item.expression && (item.instancesCount || 0) > 1;
  return (
    <div
      className={classNames(classes.row, {
        [classes.missing]: item.isMissing,
      })}
      style={getRowIndentStyle(item)}
    >
      {/* The row carries the icon of what it watches: the kind of variable
          for a watched expression, the instance variable icon for each of
          the instances listed under it. */}
      {item.expression ? (
        <VariableIcon className={classes.rowIcon} />
      ) : item.isInstance ? (
        <InstanceVariableIcon className={classes.rowIcon} />
      ) : (
        <span className={classes.rowIcon} />
      )}
      <span className={classes.rowName} title={item.name}>
        <Text noMargin size="body2">
          {item.name}
        </Text>
      </span>
      <span className={classes.rowSeparator} />
      {/* The values all start at the same place, whatever the depth of the
          row: they can be compared by reading straight down. */}
      <span className={classes.rowValueColumn}>
        {hasSeveralInstances ? (
          <I18n>
            {({ i18n }: {| i18n: I18nType |}) => (
              <Tooltip
                title={i18n._(
                  t`The value of the first instance: unfold the row to see the value of each of them.`
                )}
                placement="bottom-end"
                enterDelay={tooltipEnterDelay}
              >
                {/* Next to the value, where the doubt is: this value is the
                    one of a single instance among several. */}
                <span className={classes.rowFirstInstance}>
                  <FirstInstanceVariableIcon />
                </span>
              </Tooltip>
            )}
          </I18n>
        ) : (
          <span className={classes.rowFirstInstance} />
        )}
        {item.hasValue && !item.isMissing && (
          <span className={classes.rowType}>
            {React.createElement(
              getVariableTypeToIcon()[getValueType(item.value)],
              {
                fontSize: 'small',
              }
            )}
          </span>
        )}
        <span
          className={classNames(classes.rowValue, {
            [classes.error]: !!item.error,
          })}
          title={
            item.error ||
            (item.hasValue
              ? formatEvaluationValue(item.value, 2000, false)
              : undefined)
          }
        >
          <WatchedValue item={item} previewStatus={previewStatus} />
        </span>
      </span>

      <span className={classes.rowDelete}>
        {item.expression && (
          <IconButton
            size="small"
            tooltip={t`Stop watching`}
            onClick={() => onStopWatching(item.expression || '')}
          >
            <TrashIcon />
          </IconButton>
        )}
      </span>
    </div>
  );
};

export default WatchedVariableRow;
