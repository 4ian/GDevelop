// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import InspectorTreeView, {
  buildValueItems,
  makeSection,
} from './InspectorTreeView';
import {
  type GameData,
  type EditFunction,
  type CallFunction,
  type ReadValuesFunction,
} from '../GDJSInspectorDescriptions';
import { buildVariablesItems } from './VariablesContainerInspector';
import { useBehaviorsItems } from './BehaviorsInspector';
import { buildTimersItems } from './TimersInspector';
import ObjectIcon from '../../UI/CustomSvgIcons/Object';
import ObjectVariableIcon from '../../UI/CustomSvgIcons/ObjectVariable';
import BehaviorIcon from '../../UI/CustomSvgIcons/Behavior';
import TimerIcon from '@material-ui/icons/Timer';

type Props = {|
  runtimeObject: GameData,
  onCall: CallFunction,
  onEdit: EditFunction,
  onReadValues: ReadValuesFunction,
|};

/** Where the object is, in the order the user expects (not sorted). */
const getGeneralProperties = (runtimeObject: GameData, i18n: I18nType) => {
  if (!runtimeObject) return null;
  const properties = {};
  properties[i18n._(t`X position`)] = runtimeObject.x;
  properties[i18n._(t`Y position`)] = runtimeObject.y;
  // TODO: Improve check to have more robust type checking
  const is3D = typeof runtimeObject._z !== 'undefined';
  if (is3D) {
    properties[i18n._(t`Z position`)] = runtimeObject._z;
    properties[i18n._(t`Rotation around X axis`)] = runtimeObject._rotationX;
    properties[i18n._(t`Rotation around Y axis`)] = runtimeObject._rotationY;
    properties[i18n._(t`Rotation around Z axis (Angle)`)] = runtimeObject.angle;
  } else {
    properties[i18n._(t`Angle`)] = runtimeObject.angle;
  }
  properties[i18n._(t`Layer`)] = runtimeObject.layer;
  properties[i18n._(t`Z order`)] = runtimeObject.zOrder;
  properties[i18n._(t`Is hidden?`)] = runtimeObject.hidden;
  return properties;
};

const RuntimeObjectInspectorTree = ({
  runtimeObject,
  onReadValues,
  i18n,
}: {|
  ...Props,
  i18n: I18nType,
|}): React.Node => {
  const behaviorsItems = useBehaviorsItems(
    'behaviors',
    runtimeObject ? runtimeObject._behaviors : null,
    onReadValues,
    i18n
  );

  const items = React.useMemo(
    () => [
      makeSection(
        'general',
        i18n._(t`General`),
        buildValueItems('general', getGeneralProperties(runtimeObject, i18n), {
          sorted: false,
        }),
        { isRoot: true, icon: <ObjectIcon /> }
      ),
      makeSection(
        'variables',
        i18n._(t`Instance variables`),
        buildVariablesItems(
          'variables',
          runtimeObject ? runtimeObject._variables : null
        ),
        {
          isRoot: true,
          emptyHint: i18n._(t`This instance has no variable.`),
          icon: <ObjectVariableIcon />,
        }
      ),
      makeSection('behaviors', i18n._(t`Behaviors`), behaviorsItems, {
        isRoot: true,
        emptyHint: i18n._(t`This instance has no behavior.`),
        icon: <BehaviorIcon />,
      }),
      makeSection(
        'timers',
        i18n._(t`Timers`),
        buildTimersItems(
          'timers',
          runtimeObject ? runtimeObject._timers : null
        ),
        {
          isRoot: true,
          emptyHint: i18n._(t`This instance has no timer.`),
          icon: <TimerIcon />,
        }
      ),
    ],
    [runtimeObject, behaviorsItems, i18n]
  );

  return <InspectorTreeView items={items} />;
};

const RuntimeObjectInspector = (props: Props): React.Node => (
  <I18n>
    {({ i18n }) => <RuntimeObjectInspectorTree {...props} i18n={i18n} />}
  </I18n>
);

export default RuntimeObjectInspector;
