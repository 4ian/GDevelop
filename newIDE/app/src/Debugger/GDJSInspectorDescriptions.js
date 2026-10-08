// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { makeInstancePathStep } from './inspectorPath';
import RuntimeObjectInspector from './Inspectors/RuntimeObjectInspector';
import VariablesContainerInspector from './Inspectors/VariablesContainerInspector';
import RuntimeSceneInspector from './Inspectors/RuntimeSceneInspector';
import ObjectDataInspector from './Inspectors/ObjectDataInspector';
import GlobalVariableIcon from '../UI/CustomSvgIcons/GlobalVariable';
import SceneVariableIcon from '../UI/CustomSvgIcons/SceneVariable';
import SceneIcon from '../UI/CustomSvgIcons/Scene';
import InstancesListIcon from '../UI/CustomSvgIcons/InstancesList';
import InstanceIcon from '../UI/CustomSvgIcons/Instance';
import Object2dIcon from '../UI/CustomSvgIcons/Object2d';
import Object3dIcon from '../UI/CustomSvgIcons/Object3d';

export type GameData = any;
export type EditFunction = (path: Array<string>, newValue: any) => boolean;
export type CallFunction = (path: Array<string>, args: Array<any>) => boolean;

/** A function the inspector asks the game to call, to read what it returns. */
export type InspectorCall = {|
  /** Relative to the inspected element: `['_behaviors', '0']` for its first behavior. */
  path: Array<string>,
  functionName: string,
  /** The arguments the generated code fills by itself (`currentScene`). */
  codeOnlyArguments: Array<string>,
|};
export type InspectorCallResult = {| value?: any, error?: string |};
/** Call functions on what is at this path in the running game. Null if the game did not answer. */
export type ReadValuesFunction = (
  path: Array<string>,
  calls: Array<InspectorCall>
) => Promise<Array<InspectorCallResult> | null>;

export type InspectorDescriptionsGetter = (
  gameData: GameData
) => Array<InspectorDescription>; //eslint-disable-line

export type InspectorDescription = {|
  /** What a row shows, when it is a name coming from the game. */
  label?: string,
  /** What a row shows, when it is a fixed wording of the editor. */
  translatableLabel?: MessageDescriptor,
  /** Shown before the label in the list, to tell at a glance what it is. */
  icon?: React.Node,
  key: string | Array<string>,
  renderInspector: (
    gameData: GameData,
    {
      onCall: CallFunction,
      onEdit: EditFunction,
      onReadValues: ReadValuesFunction,
    }
  ) => React.Node,
  getSubInspectors?: InspectorDescriptionsGetter,
  initiallyOpen?: boolean,
|};

/**
 * Returns the list of inspectors, given the data coming from a GDJS RuntimeGame.
 * @param {*} gdjsRuntimeGame
 */
export const getInspectorDescriptions = (
  gdjsRuntimeGame: GameData
): Array<InspectorDescription> => {
  return [
    {
      translatableLabel: t`Global variables`,
      icon: <GlobalVariableIcon />,
      key: '_variables',
      renderInspector: (gameData, { onCall, onEdit }) => (
        <VariablesContainerInspector
          variablesContainer={gameData}
          onCall={onCall}
          onEdit={onEdit}
        />
      ),
    },
    {
      translatableLabel: t`Scenes`,
      icon: <SceneIcon />,
      key: ['_sceneStack', '_stack'],
      renderInspector: () => null,
      initiallyOpen: true,
      getSubInspectors: gdjsStack => {
        if (!gdjsStack) return [];

        return gdjsStack.map((runtimeScene, index) => ({
          label: runtimeScene._name,
          icon: <SceneIcon />,
          key: index,
          renderInspector: (gameData, { onCall, onEdit }) => (
            <RuntimeSceneInspector
              runtimeScene={gameData}
              onCall={onCall}
              onEdit={onEdit}
            />
          ),
          initiallyOpen: true,
          // A scene paused under the current one is only named in the dump:
          // it is read entirely when selected.
          getSubInspectors: runtimeScene =>
            runtimeScene && runtimeScene._isPausedSceneSummary
              ? []
              : [
                  {
                    translatableLabel: t`Scene variables`,
                    icon: <SceneVariableIcon />,
                    key: `_variables`,
                    renderInspector: (gameData, { onCall, onEdit }) => (
                      <VariablesContainerInspector
                        variablesContainer={gameData}
                        onCall={onCall}
                        onEdit={onEdit}
                      />
                    ),
                  },
                  {
                    translatableLabel: t`Instances`,
                    icon: <InstancesListIcon />,
                    key: `_instances`,
                    renderInspector: () => null,
                    initiallyOpen: true,
                    getSubInspectors: instances => {
                      if (!instances || !instances.items) return [];

                      return Object.keys(instances.items).map(objectName => {
                        if (
                          !instances.items[objectName] ||
                          typeof instances.items[objectName].length ===
                            'undefined'
                        )
                          return null;

                        return {
                          label: `${objectName} (${
                            instances.items[objectName].length
                          })`,
                          // A 3D object carries a Z: the icon tells 2D from 3D.
                          icon: instances.items[objectName].some(
                            runtimeObject =>
                              runtimeObject &&
                              typeof runtimeObject._z !== 'undefined'
                          ) ? (
                            <Object3dIcon />
                          ) : (
                            <Object2dIcon />
                          ),
                          key: ['items', objectName],
                          // The object itself: what its instances start from.
                          renderInspector: instancesList => (
                            <ObjectDataInspector
                              objectData={
                                runtimeScene._objects &&
                                runtimeScene._objects.items
                                  ? runtimeScene._objects.items[objectName]
                                  : null
                              }
                              instances={instancesList}
                            />
                          ),
                          getSubInspectors: instancesList =>
                            instancesList
                              ? instancesList
                                  .filter(runtimeObject => !!runtimeObject)
                                  .map(runtimeObject => {
                                    return {
                                      label: `#${runtimeObject.id}`,
                                      icon: <InstanceIcon />,
                                      // By identifier, never by position: creating
                                      // or destroying an instance shifts the list,
                                      // and the selection would follow another one.
                                      key: makeInstancePathStep(
                                        runtimeObject.id
                                      ),
                                      renderInspector: (
                                        gameData,
                                        { onCall, onEdit, onReadValues }
                                      ) => (
                                        <RuntimeObjectInspector
                                          runtimeObject={gameData}
                                          onCall={onCall}
                                          onEdit={onEdit}
                                          onReadValues={onReadValues}
                                        />
                                      ),
                                    };
                                  })
                              : [],
                        };
                      });
                    },
                  },
                ],
        }));
      },
    },
  ];
};
