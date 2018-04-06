// @flow
import * as React from 'react';
import RawContentInspector from './RawContentInspector';

export type GameData = any;

export type InspectorDescriptionsGetter = (
  gameData: GameData
) => Array<InspectorDescription>; //eslint-disable-line

export type InspectorDescription = {|
  label: string,
  key: string | Array<string>,
  renderInspector: (gameData: GameData) => React.Node,
  getSubInspectors?: InspectorDescriptionsGetter,
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
      renderInspector: gameData => <RawContentInspector gameData={gameData} />,
    },
    {
      label: 'Scenes',
      key: ['_sceneStack', '_stack'],
      renderInspector: gameData => null,
      getSubInspectors: gdjsStack => {
        if (!gdjsStack) return [];

        return gdjsStack.map((runtimeScene, index) => ({
          label: runtimeScene._name,
          key: index,
          renderInspector: gameData => (
            <RawContentInspector gameData={gameData} />
          ),
          getSubInspectors: runtimeScene => [
            {
              label: 'Layers',
              key: `_layers`,
              renderInspector: gameData => (
                <RawContentInspector gameData={gameData} />
              ),
            },
            {
              label: 'Scene variables',
              key: `_variables`,
              renderInspector: gameData => (
                <RawContentInspector gameData={gameData} />
              ),
            },
            {
              label: 'Instances',
              key: `_instances`,
              renderInspector: gameData => (
                <RawContentInspector gameData={gameData} />
              ),
              getSubInspectors: instances => {
                if (!instances || !instances.items) return [];

                return Object.keys(instances.items).map(objectName => ({
                  label: objectName,
                  key: ['items', objectName],
                  renderInspector: gameData => (
                    <RawContentInspector gameData={gameData} />
                  ),
                  getSubInspectors: instancesList =>
                    instancesList
                      ? instancesList
                          .filter(runtimeObject => !!runtimeObject)
                          .map((runtimeObject, index) => {
                            return {
                              label: `#${runtimeObject.id}`,
                              key: index,
                              renderInspector: gameData => (
                                <RawContentInspector gameData={gameData} />
                              ),
                            };
                          })
                      : [],
                }));
              },
            },
          ],
        }));
      },
    },
  ];
};
