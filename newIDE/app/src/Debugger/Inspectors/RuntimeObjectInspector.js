// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import InspectorTreeView, {
  buildPropertiesItems,
  makeSection,
  type InspectedProperty,
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

/**
 * Where the object is, in the order the user expects (not sorted), each one
 * changed in the game by the method of the object that the events use too.
 */
const getGeneralProperties = (
  runtimeObject: GameData,
  onCall: CallFunction,
  i18n: I18nType
): ?Array<InspectedProperty> => {
  if (!runtimeObject) return null;
  const callWith = (methodName: string) => (newValue: any) =>
    onCall([methodName], [newValue]);
  // TODO: Improve check to have more robust type checking
  const is3D = typeof runtimeObject._z !== 'undefined';
  return [
    {
      name: i18n._(t`X position`),
      value: runtimeObject.x,
      onEdit: callWith('setX'),
    },
    {
      name: i18n._(t`Y position`),
      value: runtimeObject.y,
      onEdit: callWith('setY'),
    },
    ...(is3D
      ? [
          {
            name: i18n._(t`Z position`),
            value: runtimeObject._z,
            onEdit: callWith('setZ'),
          },
          {
            name: i18n._(t`Rotation around X axis`),
            value: runtimeObject._rotationX,
            onEdit: callWith('setRotationX'),
          },
          {
            name: i18n._(t`Rotation around Y axis`),
            value: runtimeObject._rotationY,
            onEdit: callWith('setRotationY'),
          },
          {
            name: i18n._(t`Rotation around Z axis (Angle)`),
            value: runtimeObject.angle,
            onEdit: callWith('setAngle'),
          },
        ]
      : [
          {
            name: i18n._(t`Angle`),
            value: runtimeObject.angle,
            onEdit: callWith('setAngle'),
          },
        ]),
    {
      name: i18n._(t`Layer`),
      value: runtimeObject.layer,
      onEdit: callWith('setLayer'),
    },
    {
      name: i18n._(t`Z order`),
      value: runtimeObject.zOrder,
      onEdit: callWith('setZOrder'),
    },
    {
      name: i18n._(t`Is hidden?`),
      value: runtimeObject.hidden,
      onEdit: callWith('hide'),
    },
  ];
};

const RuntimeObjectInspectorTree = ({
  runtimeObject,
  onCall,
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
        buildPropertiesItems(
          'general',
          getGeneralProperties(runtimeObject, onCall, i18n)
        ),
        { isRoot: true, icon: <ObjectIcon /> }
      ),
      makeSection(
        'variables',
        i18n._(t`Instance variables`),
        buildVariablesItems(
          'variables',
          runtimeObject ? runtimeObject._variables : null,
          onCall,
          ['_variables']
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
    [runtimeObject, behaviorsItems, onCall, i18n]
  );

  return <InspectorTreeView items={items} />;
};

const RuntimeObjectInspector = (props: Props): React.Node => (
  <I18n>
    {({ i18n }) => <RuntimeObjectInspectorTree {...props} i18n={i18n} />}
  </I18n>
);

export default RuntimeObjectInspector;
