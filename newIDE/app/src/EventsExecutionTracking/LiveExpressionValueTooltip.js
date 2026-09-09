// @flow
import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Text from '../UI/Text';
import EventsExecutionTrackingContext from './EventsExecutionTrackingContext';
import {
  formatEvaluationValue,
  type ExpressionEvaluation,
} from './EventsExecutionTrackingStore';
import classes from './LiveExpressionValueTooltip.module.css';

const gd: libGDevelop = global.gd;

/** How often the value is refreshed while the parameter is hovered. */
const REFRESH_INTERVAL_MS = 300;
/** The tooltip follows the mouse, but not at every pixel. */
const MOUSE_MOVE_THRESHOLD_PX = 8;
const TOOLTIP_OFFSET_PX = 14;

type MousePosition = {| x: number, y: number |};

/**
 * An anchor for the tooltip at the position of the mouse (a "virtual element",
 * as understood by Popper), so that the value shows up next to the pointer
 * rather than under the whole parameter.
 */
const makeMouseAnchor = (mousePosition: MousePosition) => ({
  clientWidth: 0,
  clientHeight: 0,
  getBoundingClientRect: () => ({
    top: mousePosition.y + TOOLTIP_OFFSET_PX,
    left: mousePosition.x,
    bottom: mousePosition.y + TOOLTIP_OFFSET_PX,
    right: mousePosition.x,
    width: 0,
    height: 0,
  }),
});

type Props = {|
  children: React.Node,
  /** The scene the events belong to. Values can't be read without one. */
  layout: ?gdLayout,
  project: gdProject,
  /** The type of the parameter ("number", "string", "variable", "scenevar"...). */
  parameterType: string,
  expression: string,
  /** The object owning the variable, for object variables. */
  objectName: string | null,
|};

/**
 * Show, while the parameter is hovered and a preview is running, the value of
 * its expression in the game and the values of the variables it uses.
 */
const LiveExpressionValueTooltip = ({
  children,
  layout,
  project,
  parameterType,
  expression,
  objectName,
}: Props): React.Node => {
  const store = React.useContext(EventsExecutionTrackingContext);
  const [isHovered, setIsHovered] = React.useState(false);
  const [
    mousePosition,
    setMousePosition,
  ] = React.useState<MousePosition | null>(null);
  const [
    evaluation,
    setEvaluation,
  ] = React.useState<ExpressionEvaluation | null>(null);

  React.useEffect(
    () => {
      if (!isHovered || !layout || !store.hasRunningPreview()) return;

      // The code is generated once per hover: it depends on the events, not
      // on the game state.
      const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
      const code = layoutCodeGenerator.generateExpressionEvaluationCode(
        layout,
        parameterType,
        expression,
        objectName || ''
      );
      layoutCodeGenerator.delete();

      let isCancelled = false;
      const refresh = async () => {
        const newEvaluation = await store.evaluateExpression(code);
        if (!isCancelled) setEvaluation(newEvaluation);
      };
      refresh();
      const intervalId = setInterval(refresh, REFRESH_INTERVAL_MS);

      return () => {
        isCancelled = true;
        clearInterval(intervalId);
        setEvaluation(null);
      };
    },
    [isHovered, layout, store, project, parameterType, expression, objectName]
  );

  const onMouseEnter = React.useCallback((event: MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
    setIsHovered(true);
  }, []);
  const onMouseLeave = React.useCallback(() => setIsHovered(false), []);
  const onMouseMove = React.useCallback((event: MouseEvent) => {
    setMousePosition(previousPosition =>
      previousPosition &&
      Math.abs(previousPosition.x - event.clientX) < MOUSE_MOVE_THRESHOLD_PX &&
      Math.abs(previousPosition.y - event.clientY) < MOUSE_MOVE_THRESHOLD_PX
        ? previousPosition
        : { x: event.clientX, y: event.clientY }
    );
  }, []);
  const mouseAnchor = React.useMemo(
    () => (mousePosition ? makeMouseAnchor(mousePosition) : null),
    [mousePosition]
  );

  const variableExpressions = evaluation
    ? Object.keys(evaluation.variables)
    : [];
  // The value of a variable is already the result: don't repeat it.
  const hasDetailedVariables =
    variableExpressions.length > 0 &&
    !(
      variableExpressions.length === 1 &&
      variableExpressions[0] === expression.trim()
    );

  return (
    <Tooltip
      open={isHovered && !!evaluation && !!mouseAnchor}
      placement="bottom-start"
      classes={{ tooltip: classes.tooltip }}
      PopperProps={mouseAnchor ? { anchorEl: mouseAnchor } : undefined}
      title={
        evaluation ? (
          <div className={classes.value}>
            {evaluation.error ? (
              <Text noMargin size="body" color="inherit">
                {evaluation.error}
              </Text>
            ) : (
              <>
                <Text noMargin size="body" color="inherit">
                  {formatEvaluationValue(evaluation.result)}
                </Text>
                {hasDetailedVariables && (
                  <div className={classes.variables}>
                    {variableExpressions.map(variableExpression => (
                      <Text
                        key={variableExpression}
                        noMargin
                        size="body2"
                        color="inherit"
                      >
                        {variableExpression}
                        {' = '}
                        {formatEvaluationValue(
                          evaluation.variables[variableExpression]
                        )}
                      </Text>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          ''
        )
      }
    >
      <span
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
      >
        {children}
      </span>
    </Tooltip>
  );
};

export default LiveExpressionValueTooltip;
