// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import InspectorTreeView, {
  buildPropertiesItems,
  makePropertiesFolderItem,
  makeSection,
  type InspectedProperty,
} from './InspectorTreeView';
import {
  type GameData,
  type EditFunction,
  type CallFunction,
} from '../GDJSInspectorDescriptions';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import RaisedButton from '../../UI/RaisedButton';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';
import Text from '../../UI/Text';
import { Column } from '../../UI/Grid';
import { buildTimersItems } from './TimersInspector';
import EditSceneIcon from '../../UI/CustomSvgIcons/EditScene';
import LayersIcon from '../../UI/CustomSvgIcons/Layers';
import TimerIcon from '@material-ui/icons/Timer';

type Props = {|
  runtimeScene: GameData,
  onCall: CallFunction,
  onEdit: EditFunction,
|};

/**
 * The camera and the state of a layer, each one changed in the game by the
 * method of the layer that the events use too.
 */
const getLayerProperties = (
  // $FlowFixMe[unclear-type]
  layer: Object,
  callOnLayer: (methodName: string, newValue: any) => void,
  i18n: I18nType
): Array<InspectedProperty> => [
  {
    name: i18n._(t`Camera X position`),
    value: layer._cameraX,
    onEdit: newValue => callOnLayer('setCameraX', newValue),
  },
  {
    name: i18n._(t`Camera Y position`),
    value: layer._cameraY,
    onEdit: newValue => callOnLayer('setCameraY', newValue),
  },
  {
    name: i18n._(t`Camera zoom`),
    value: layer._zoomFactor,
    onEdit: newValue => callOnLayer('setCameraZoom', newValue),
  },
  {
    name: i18n._(t`Camera rotation (in deg)`),
    value: layer._cameraRotation,
    onEdit: newValue => callOnLayer('setCameraRotation', newValue),
  },
  {
    name: i18n._(t`Time scale`),
    value: layer._timeScale,
    onEdit: newValue => callOnLayer('setTimeScale', newValue),
  },
  {
    name: i18n._(t`Layer is hidden`),
    value: !!layer._hidden,
    onEdit: newValue => callOnLayer('show', !newValue),
  },
];

const RuntimeSceneInspectorTree = ({
  runtimeScene,
  onCall,
  i18n,
}: {|
  ...Props,
  i18n: I18nType,
|}): React.Node => {
  const [newObjectName, setNewObjectName] = React.useState<string>('');

  const items = React.useMemo(
    () => {
      const generalProperties: Array<InspectedProperty> = [
        {
          name: i18n._(t`Time scale`),
          value: runtimeScene._timeManager
            ? runtimeScene._timeManager._timeScale
            : null,
          onEdit: newValue =>
            onCall(['_timeManager', 'setTimeScale'], [newValue]),
        },
        {
          name: i18n._(t`Actions waiting to be finished`),
          value: runtimeScene._asyncTasksManager
            ? runtimeScene._asyncTasksManager.tasksWithCallback.length
            : 0,
        },
      ];

      const layersItems =
        runtimeScene._layers && runtimeScene._layers.items
          ? Object.keys(runtimeScene._layers.items)
              .filter(layerName => !!runtimeScene._layers.items[layerName])
              .map(layerName =>
                makePropertiesFolderItem(
                  `layers/${layerName}`,
                  layerName,
                  getLayerProperties(
                    runtimeScene._layers.items[layerName],
                    (methodName, newValue) =>
                      onCall(
                        ['_layers', 'items', layerName, methodName],
                        [newValue]
                      ),
                    i18n
                  )
                )
              )
          : null;

      return [
        makeSection(
          'general',
          i18n._(t`General`),
          buildPropertiesItems('general', generalProperties),
          { isRoot: true, icon: <EditSceneIcon /> }
        ),
        makeSection('layers', i18n._(t`Layers`), layersItems, {
          isRoot: true,
          emptyHint: i18n._(t`This scene has no layer.`),
          icon: <LayersIcon />,
        }),
        makeSection(
          'timers',
          i18n._(t`Timers`),
          buildTimersItems(
            'timers',
            runtimeScene._timeManager ? runtimeScene._timeManager._timers : null
          ),
          {
            isRoot: true,
            emptyHint: i18n._(t`This scene has no timer.`),
            icon: <TimerIcon />,
          }
        ),
      ];
    },
    [runtimeScene, onCall, i18n]
  );

  return (
    <React.Fragment>
      <InspectorTreeView items={items} />
      {/* What the game could not send is replaced by a placeholder string in
          the dump: only walk through real objects. */}
      {runtimeScene._objects &&
        typeof runtimeScene._objects === 'object' &&
        runtimeScene._objects.items &&
        typeof runtimeScene._objects.items === 'object' && (
          <Column noMargin>
            <Text size="body2" color="secondary">
              <Trans>
                Create a new instance on the scene (will be at position 0;0):
              </Trans>
            </Text>
            <TextFieldWithButtonLayout
              noFloatingLabelText
              renderTextField={() => (
                <SemiControlledAutoComplete
                  hintText={t`Enter the name of the object`}
                  value={newObjectName}
                  onChange={setNewObjectName}
                  dataSource={Object.keys(runtimeScene._objects.items).map(
                    objectName => ({
                      text: objectName,
                      value: objectName,
                    })
                  )}
                  openOnFocus
                  fullWidth
                />
              )}
              renderButton={style => (
                <RaisedButton
                  style={style}
                  label={<Trans>Create</Trans>}
                  primary
                  onClick={() => onCall(['createObject'], [newObjectName])}
                />
              )}
            />
          </Column>
        )}
    </React.Fragment>
  );
};

const RuntimeSceneInspector = (props: Props): React.Node => {
  if (!props.runtimeScene) return null;
  return (
    <I18n>
      {({ i18n }) => <RuntimeSceneInspectorTree {...props} i18n={i18n} />}
    </I18n>
  );
};

export default RuntimeSceneInspector;
