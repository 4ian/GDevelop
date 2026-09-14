// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import mapValues from 'lodash/mapValues';
import InspectorTreeView, {
  buildValueItems,
  makeSection,
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

// $FlowFixMe[missing-local-annot]
const getLayerProperties = (layer, i18n: I18nType) => {
  if (!layer) return null;
  const properties = {};
  properties[i18n._(t`Camera X position`)] = layer._cameraX;
  properties[i18n._(t`Camera Y position`)] = layer._cameraY;
  properties[i18n._(t`Camera zoom`)] = layer._zoomFactor;
  properties[i18n._(t`Camera rotation (in deg)`)] = layer._cameraRotation;
  properties[i18n._(t`Time scale`)] = layer._timeScale;
  properties[i18n._(t`Layer is hidden`)] = !!layer._hidden;
  return properties;
};

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
      const generalProperties = {};
      generalProperties[i18n._(t`Time scale`)] = runtimeScene._timeManager
        ? runtimeScene._timeManager._timeScale
        : null;
      generalProperties[
        i18n._(t`Actions waiting to be finished`)
      ] = runtimeScene._asyncTasksManager
        ? runtimeScene._asyncTasksManager.tasksWithCallback.length
        : 0;

      const layers =
        runtimeScene._layers && runtimeScene._layers.items
          ? mapValues(runtimeScene._layers.items, layer =>
              getLayerProperties(layer, i18n)
            )
          : null;

      return [
        makeSection(
          'general',
          i18n._(t`General`),
          buildValueItems('general', generalProperties, { sorted: false }),
          { isRoot: true, icon: <EditSceneIcon /> }
        ),
        makeSection(
          'layers',
          i18n._(t`Layers`),
          buildValueItems('layers', layers, { sorted: false }),
          {
            isRoot: true,
            emptyHint: i18n._(t`This scene has no layer.`),
            icon: <LayersIcon />,
          }
        ),
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
    [runtimeScene, i18n]
  );

  return (
    <React.Fragment>
      <InspectorTreeView items={items} />
      {runtimeScene._objects && runtimeScene._objects.items && (
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
