// @flow
import * as React from 'react';
import classNames from 'classnames';
import Text from '../../UI/Text';
import CircularProgress from '../../UI/CircularProgress';
import Check from '../../UI/CustomSvgIcons/Check';
import Error from '../../UI/CustomSvgIcons/Error';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import classes from './FunctionCallRowLayout.module.css';

const styles = {
  label: {
    // Anywhere because behavior/object names can be long and have no spaces.
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-wrap',
    // The height of the icon slot: the first line of the label is then centered
    // on the icon, whether the label is clamped to one line or not.
    lineHeight: '20px',
  },
};

export type FunctionCallRowStatus =
  | 'pending'
  | 'working'
  | 'finished'
  | 'errored'
  | 'aborted';

export const FunctionCallStatusIcon = ({
  status,
}: {|
  status: FunctionCallRowStatus,
|}): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  if (status === 'errored') {
    return <Error htmlColor={gdevelopTheme.message.error} fontSize="small" />;
  }
  if (status === 'aborted') {
    return (
      <Error htmlColor={gdevelopTheme.text.color.disabled} fontSize="small" />
    );
  }
  if (status === 'finished') {
    return <Check htmlColor={gdevelopTheme.message.valid} fontSize="small" />;
  }
  return (
    <CircularProgress
      size={16}
      value={100}
      variant={status === 'working' ? 'indeterminate' : 'determinate'}
    />
  );
};

type Props = {|
  /** Shown in the fixed-width leading slot (a status icon, an arrow...). */
  icon?: React.Node,
  label: React.Node,
  /** A short piece of metadata (a count, a duration...), kept on one line. */
  secondaryLabel?: React.Node,
  /** When true, the label never wraps and is ellipsized if too long. */
  labelOnOneLine?: boolean,
  isExpandable?: boolean,
  isExpanded?: boolean,
  onToggleExpanded?: () => void,
  tooltip?: string,
  /** Rendered indented under the row, only when expanded. */
  children?: React.Node,
|};

/**
 * The common layout of every row displayed in the AI chat under a message: a
 * leading icon, a label (+ optional metadata) that can be clicked to reveal the
 * row details, and the details themselves, indented under the row.
 */
export const FunctionCallRowLayout = ({
  icon,
  label,
  secondaryLabel,
  labelOnOneLine,
  isExpandable,
  isExpanded,
  onToggleExpanded,
  tooltip,
  children,
}: Props): React.Node => {
  const toggle = () => {
    if (isExpandable && onToggleExpanded) onToggleExpanded();
  };

  return (
    <div className={classes.container}>
      <div className={classes.row}>
        <span className={classes.iconContainer}>{icon}</span>
        <div
          className={classNames({
            [classes.textArea]: true,
            [classes.textAreaClickable]: !!isExpandable,
          })}
          onClick={isExpandable ? toggle : undefined}
          role={isExpandable ? 'button' : undefined}
          tabIndex={isExpandable ? 0 : undefined}
          title={tooltip}
          onKeyDown={
            isExpandable
              ? event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggle();
                  }
                }
              : undefined
          }
        >
          <div
            className={classNames({
              [classes.labelContainer]: true,
              [classes.labelContainerOnOneLine]: !!labelOnOneLine,
            })}
          >
            <Text
              noMargin
              size="body-small"
              color="secondary"
              // $FlowFixMe[incompatible-type]
              style={styles.label}
            >
              {label}
            </Text>
          </div>
          {secondaryLabel && (
            <span className={classes.secondaryLabel}>
              <Text noMargin size="body-small" color="secondary">
                {secondaryLabel}
              </Text>
            </span>
          )}
          {isExpandable && (
            <div className={classes.chevron}>
              {isExpanded ? (
                <ChevronArrowBottom fontSize="small" />
              ) : (
                <ChevronArrowRight fontSize="small" />
              )}
            </div>
          )}
        </div>
      </div>
      {isExpanded && children && (
        <div className={classes.details}>{children}</div>
      )}
    </div>
  );
};
