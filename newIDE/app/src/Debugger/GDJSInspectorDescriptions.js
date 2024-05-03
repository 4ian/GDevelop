// @flow
import * as React from 'react';
import RuntimeObjectInspector from './Inspectors/RuntimeObjectInspector';
import VariablesContainerInspector from './Inspectors/VariablesContainerInspector';
import RuntimeSceneInspector from './Inspectors/RuntimeSceneInspector';

export type GameData = any;
export type EditFunction = (path: Array<string>, newValue: any) => boolean;
export type CallFunction = (path: Array<string>, args: Array<any>) => boolean;

export type InspectorDescriptionsGetter = (
  gameData: GameData
) => Array<InspectorDescription>; //eslint-disable-line

export type InspectorDescription = {|
  label: string,
  key: string | Array<string>,
  renderInspector: (
    gameData: GameData,
    {
      onCall: CallFunction,
      onEdit: EditFunction,
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
      label: 'Global variables',
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
      label: 'Scenes',
      key: ['_sceneStack', '_stack'],
      renderInspector: () => null,
      initiallyOpen: true,
      getSubInspectors: gdjsStack => {
        if (!gdjsStack) return [];

        return gdjsStack.map((runtimeScene, index) => ({
          label: runtimeScene._name,
          key: index,
          renderInspector: (gameData, { onCall, onEdit }) => (
            <RuntimeSceneInspector
              runtimeScene={gameData}
              onCall={onCall}
              onEdit={onEdit}
            />
          ),
          initiallyOpen: true,
          getSubInspectors: runtimeScene => [
            {
              label: 'Scene variables',
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
              label: 'Instances',
              key: `_instances`,
              renderInspector: () => null,
              initiallyOpen: true,
              getSubInspectors: instances => {
                if (!instances || !instances.items) return [];

                return Object.keys(instances.items).map(objectName => {
                  if (
                    !instances.items[objectName] ||
                    typeof instances.items[objectName].length === 'undefined'
                  )
                    return null;

                  return {
                    label: `${objectName} (${
                      instances.items[objectName].length
                    })`,
                    key: ['items', objectName],
                    renderInspector: () => null,
                    getSubInspectors: instancesList =>
                      instancesList
                        ? instancesList
                            .filter(runtimeObject => !!runtimeObject)
                            .map((runtimeObject, index) => {
                              return {
                                label: `#${runtimeObject.id}`,
                                key: index,
                                renderInspector: (
                                  gameData,
                                  { onCall, onEdit }
                                ) => (
                                  <RuntimeObjectInspector
                                    runtimeObject={gameData}
                                    onCall={onCall}
                                    onEdit={onEdit}
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
