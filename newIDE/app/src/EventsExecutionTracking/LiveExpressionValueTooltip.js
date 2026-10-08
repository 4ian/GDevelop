// @flow
import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Text from '../UI/Text';
import { formatEvaluationValue } from './formatting';
import {
  useLiveExpressionEvaluations,
  type LiveExpression,
} from './UseLiveExpressionEvaluations';
import classes from './LiveExpressionValueTooltip.module.css';

/** The tooltip follows the mouse, but not at every pixel. */
const MOUSE_MOVE_THRESHOLD_PX = 8;
const TOOLTIP_OFFSET_PX = 14;

const EXPRESSION_ATTRIBUTE = 'data-live-expression';
const PARAMETER_TYPE_ATTRIBUTE = 'data-live-expression-type';
const OBJECT_NAME_ATTRIBUTE = 'data-live-expression-object';

/**
 * What a parameter of an instruction carries so that its value is shown when
 * it is hovered: attributes read by the tooltip of the events sheet, instead
 * of a tooltip (and its listeners) for every parameter of every instruction.
 */
export const getLiveExpressionAttributes = ({
  parameterType,
  expression,
  objectName,
}: {|
  /** The type of the parameter ("number", "string", "variable", "scenevar"...). */
  parameterType: string,
  expression: string,
  /** The object owning the variable, for object variables. */
  objectName: ?string,
|}): { [string]: string } => ({
  [EXPRESSION_ATTRIBUTE]: expression,
  [PARAMETER_TYPE_ATTRIBUTE]: parameterType,
  [OBJECT_NAME_ATTRIBUTE]: objectName || '',
});

type MousePosition = {| x: number, y: number |};

type HoveredExpression = {|
  element: Element,
  expression: string,
  parameterType: string,
  objectName: string,
|};

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

const findHoveredExpression = (target: EventTarget): ?HoveredExpression => {
  if (!(target instanceof Element)) return null;
  const element = target.closest(`[${EXPRESSION_ATTRIBUTE}]`);
  if (!element) return null;
  return {
    element,
    expression: element.getAttribute(EXPRESSION_ATTRIBUTE) || '',
    parameterType: element.getAttribute(PARAMETER_TYPE_ATTRIBUTE) || '',
    objectName: element.getAttribute(OBJECT_NAME_ATTRIBUTE) || '',
  };
};

type Props = {|
  /** The element holding the events sheet: its hovered parameters are followed. */
  containerRef: {| current: ?HTMLElement |},
  /** The scene the events belong to. Values can't be read without one. */
  layout: ?gdLayout,
  project: gdProject,
|};

/**
 * Show, while a parameter of the events sheet is hovered and a preview is
 * running, the value of its expression in the game and the values of the
 * variables it uses. There is one for a whole events sheet.
 */
const LiveExpressionValueTooltip = ({
  containerRef,
  layout,
  project,
}: Props): React.Node => {
  const [
    hoveredExpression,
    setHoveredExpression,
  ] = React.useState<HoveredExpression | null>(null);
  const [
    mousePosition,
    setMousePosition,
  ] = React.useState<MousePosition | null>(null);

  // The mouse is followed on the whole sheet with three listeners, whatever
  // the number of parameters shown.
  React.useEffect(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const onMouseOver = (event: MouseEvent) => {
        const newHoveredExpression = findHoveredExpression(event.target);
        setHoveredExpression(previousHoveredExpression =>
          previousHoveredExpression &&
          newHoveredExpression &&
          previousHoveredExpression.element === newHoveredExpression.element
            ? previousHoveredExpression
            : newHoveredExpression
        );
        if (newHoveredExpression) {
          setMousePosition({ x: event.clientX, y: event.clientY });
        }
      };
      const onMouseMove = (event: MouseEvent) => {
        setMousePosition(previousPosition =>
          previousPosition &&
          Math.abs(previousPosition.x - event.clientX) <
            MOUSE_MOVE_THRESHOLD_PX &&
          Math.abs(previousPosition.y - event.clientY) < MOUSE_MOVE_THRESHOLD_PX
            ? previousPosition
            : { x: event.clientX, y: event.clientY }
        );
      };
      const onMouseLeave = () => setHoveredExpression(null);

      container.addEventListener('mouseover', onMouseOver);
      container.addEventListener('mousemove', onMouseMove);
      container.addEventListener('mouseleave', onMouseLeave);
      return () => {
        container.removeEventListener('mouseover', onMouseOver);
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('mouseleave', onMouseLeave);
      };
    },
    [containerRef]
  );

  const expression = hoveredExpression ? hoveredExpression.expression : null;
  const parameterType = hoveredExpression
    ? hoveredExpression.parameterType
    : null;
  const objectName = hoveredExpression ? hoveredExpression.objectName : null;

  // Only the hovered parameter is followed: its code is generated once per
  // hover, as it depends on the events, not on the game state.
  // Keyed by what is evaluated: the value of the parameter hovered before
  // is never shown for the one hovered now.
  const liveExpressionKey = `${parameterType || ''}:${objectName ||
    ''}:${expression || ''}`;
  const liveExpressions: Array<LiveExpression> = React.useMemo(
    () =>
      expression !== null && parameterType !== null
        ? [
            {
              key: liveExpressionKey,
              expression,
              parameterType,
              objectName: objectName || '',
            },
          ]
        : [],
    [expression, parameterType, objectName, liveExpressionKey]
  );
  const { evaluations, previewStatus } = useLiveExpressionEvaluations({
    project,
    layout,
    liveExpressions,
  });
  // Nothing is shown once the preview stops: the value would be the one of a
  // game that does not run anymore.
  const evaluation =
    previewStatus === 'running' ? evaluations[liveExpressionKey] || null : null;

  const mouseAnchor = React.useMemo(
    () => (mousePosition ? makeMouseAnchor(mousePosition) : null),
    [mousePosition]
  );

  // An evaluation that failed only carries its error: the variables must not
  // be taken for granted here, an exception in this tooltip would take the
  // whole events sheet down with it.
  const variableExpressions =
    evaluation && evaluation.variables ? Object.keys(evaluation.variables) : [];
  // The value of a variable is already the result: don't repeat it.
  const hasDetailedVariables =
    variableExpressions.length > 0 &&
    !(
      variableExpressions.length === 1 &&
      variableExpressions[0] === (expression || '').trim()
    );

  return (
    <Tooltip
      open={!!hoveredExpression && !!evaluation && !!mouseAnchor}
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
                          (evaluation.variables || {})[variableExpression]
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
      {/* The tooltip is anchored to the mouse: this is only its placeholder. */}
      <span />
    </Tooltip>
  );
};

export default LiveExpressionValueTooltip;
