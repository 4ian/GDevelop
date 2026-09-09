// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import ReactJsonView from 'react-json-view';
import Text from '../../UI/Text';
import EmptyMessage from '../../UI/EmptyMessage';
import { type GameData, type EditFunction } from '../GDJSInspectorDescriptions';

type Props = {|
  /** The `_behaviors` array of the inspected object. */
  behaviors: ?Array<GameData>,
  onEdit: EditFunction,
|};

/** Fields that describe the behavior itself, not one of its properties. */
const excludedKeys = [
  'name',
  'type',
  '_name',
  '_type',
  '_nameId',
  '_behaviorData',
];

/** The name of a behavior, as the user knows it in the editor. */
const getBehaviorName = (behavior: GameData, index: number): string => {
  if (!behavior) return `#${index}`;
  return behavior.name || behavior._name || behavior.type || `#${index}`;
};

/**
 * The properties of a behavior are its numbers, texts and booleans: they are
 * what the user sets up and what changes while the game runs.
 *
 * Everything else (the objects it holds, the spatial structures it builds,
 * the reference to its owner...) is left out: it is heavy, sometimes circular
 * and never meaningful when debugging a game.
 */
const getEditableProperties = (
  behavior: GameData
): {| properties: Object, keysByLabel: { [string]: string } |} => {
  const properties = {};
  const keysByLabel = {};
  if (!behavior) return { properties, keysByLabel };

  for (const key in behavior) {
    if (excludedKeys.includes(key)) continue;
    const value = behavior[key];
    const type = typeof value;
    if (type !== 'number' && type !== 'string' && type !== 'boolean') continue;

    // Private fields are shown without their underscore: `_maxSpeed` is the
    // "Max speed" property for the user.
    const label = key.startsWith('_') ? key.substring(1) : key;
    properties[label] = value;
    keysByLabel[label] = key;
  }
  return { properties, keysByLabel };
};

const BehaviorsInspector = ({ behaviors, onEdit }: Props): React.Node => {
  if (!behaviors || !behaviors.length) {
    return (
      <EmptyMessage>
        <Trans>This object has no behavior.</Trans>
      </EmptyMessage>
    );
  }

  return (
    <React.Fragment>
      {behaviors.map((behavior, index) => {
        const { properties, keysByLabel } = getEditableProperties(behavior);
        return (
          <React.Fragment key={getBehaviorName(behavior, index)}>
            <Text size="body-small">{getBehaviorName(behavior, index)}</Text>
            {Object.keys(properties).length ? (
              <ReactJsonView
                collapsed={false}
                name={false}
                src={properties}
                enableClipboard={false}
                displayDataTypes={false}
                displayObjectSize={false}
                onEdit={edit => {
                  const key = keysByLabel[edit.name];
                  if (!key) return false;
                  onEdit(['_behaviors', '' + index, key], edit.new_value);
                  return true;
                }}
                theme="monokai"
              />
            ) : (
              <EmptyMessage>
                <Trans>This behavior has no property to display.</Trans>
              </EmptyMessage>
            )}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

export default BehaviorsInspector;
