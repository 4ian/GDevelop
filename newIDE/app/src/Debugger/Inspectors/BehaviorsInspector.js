// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import InspectorTreeView, {
  makeSection,
  makeValueItem,
  makeHintItem,
  type InspectorItem,
} from './InspectorTreeView';
import {
  type GameData,
  type ReadValuesFunction,
  type InspectorCall,
} from '../GDJSInspectorDescriptions';

import TuneIcon from '../../UI/CustomSvgIcons/Tune';
import FunctionsIcon from '@material-ui/icons/Functions';

const gd: libGDevelop = global.gd;

type Props = {|
  /** The `_behaviors` array of the inspected object. */
  behaviors: ?Array<GameData>,
  /** Read, in the running game, what the expressions of the behaviors return. */
  onReadValues: ReadValuesFunction,
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

/**
 * What the serializer of the game puts in place of what it did not send:
 * a reference to another object, or something too heavy for the debugger.
 */
const isPlaceholderValue = (value: any): boolean =>
  typeof value === 'string' &&
  (value.startsWith('[Circular') || value.startsWith('[Removed from'));

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
): { [string]: number | string | boolean } => {
  const properties: { [string]: number | string | boolean } = {};
  if (!behavior) return properties;

  try {
    for (const key in behavior) {
      if (excludedKeys.includes(key)) continue;
      const value = behavior[key];
      const type = typeof value;
      if (type !== 'number' && type !== 'string' && type !== 'boolean')
        continue;
      if (isPlaceholderValue(value)) continue;

      // Private fields are shown without their underscore: `_maxSpeed` is the
      // "maxSpeed" property for the user.
      const label = key.startsWith('_') ? key.substring(1) : key;
      properties[label] = value;
    }
  } catch (error) {
    console.error('Unable to read the properties of a behavior:', error);
  }
  return properties;
};

/**
 * An expression of a behavior, as the inspector reads it: each expression is
 * a method of the behavior in the running game. Some cannot be read: those
 * needing a parameter that only the events can give.
 */
type BehaviorExpressionDescriptor = {|
  /** The name of the expression, as the user knows it. */
  label: string,
  /** What to call to read the value, when it can be read. */
  call: ?InspectorCall,
  unavailableReason: null | 'needs-parameter' | 'not-readable',
|};

const describeExpressions = (
  expressionsMetadata: gdMapStringExpressionMetadata,
  behaviorIndex: number,
  descriptors: Array<BehaviorExpressionDescriptor>
) => {
  expressionsMetadata
    .keys()
    .toJSArray()
    .forEach(expressionType => {
      const expressionMetadata = expressionsMetadata.get(expressionType);
      if (
        expressionMetadata.isPrivate() ||
        !expressionMetadata.isShown() ||
        expressionMetadata.isDeprecated()
      )
        return;

      const label = expressionMetadata.getFullName() || expressionType;
      const functionName = expressionMetadata.getFunctionName();
      const codeOnlyArguments = [];
      let unavailableReason:
        | null
        | 'needs-parameter'
        | 'not-readable' = functionName ? null : 'not-readable';
      // The first two parameters are the object and the behavior: they are
      // the inspected behavior itself.
      for (
        let index = 2;
        index < expressionMetadata.getParametersCount();
        index++
      ) {
        const parameter = expressionMetadata.getParameter(index);
        if (!parameter.isCodeOnly()) {
          unavailableReason = 'needs-parameter';
        } else if (parameter.getType() === 'currentScene') {
          codeOnlyArguments.push('currentScene');
        } else {
          unavailableReason = unavailableReason || 'not-readable';
        }
      }
      descriptors.push({
        label,
        call: unavailableReason
          ? null
          : {
              path: ['_behaviors', String(behaviorIndex)],
              functionName,
              codeOnlyArguments,
            },
        unavailableReason,
      });
    });
};

/** The icon of the behavior in the editor, if its extension has one. */
const getBehaviorIconUrl = (behaviorType: ?string): ?string => {
  if (!behaviorType) return null;
  const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
    gd.JsPlatform.get(),
    behaviorType
  );
  if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) return null;
  return behaviorMetadata.getIconFilename() || null;
};

/** The expressions of a behavior of the given type, sorted by name. */
const getExpressionDescriptors = (
  behaviorType: string,
  behaviorIndex: number
): Array<BehaviorExpressionDescriptor> => {
  const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
    gd.JsPlatform.get(),
    behaviorType
  );
  if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) return [];

  const descriptors = [];
  describeExpressions(
    behaviorMetadata.getAllExpressions(),
    behaviorIndex,
    descriptors
  );
  describeExpressions(
    behaviorMetadata.getAllStrExpressions(),
    behaviorIndex,
    descriptors
  );
  return descriptors.sort((first, second) =>
    first.label.localeCompare(second.label)
  );
};

/**
 * The values of the expressions of every behavior, read from the game each
 * time the behaviors are refreshed (a new snapshot, or the live inspector).
 * One round trip reads them all.
 */
const useExpressionValues = (
  behaviors: ?Array<GameData>,
  descriptorsByBehavior: Array<Array<BehaviorExpressionDescriptor>>,
  onReadValues: ReadValuesFunction,
  i18n: I18nType
): Array<?{ [string]: any }> => {
  const [values, setValues] = React.useState<Array<?{ [string]: any }>>([]);
  // Read by the effect without re-running it: the callback changes at each
  // render of the inspector.
  const onReadValuesRef = React.useRef(onReadValues);
  onReadValuesRef.current = onReadValues;
  const isReadingRef = React.useRef(false);

  React.useEffect(
    () => {
      if (!behaviors) return;
      const calls: Array<InspectorCall> = [];
      const labels: Array<{| behaviorIndex: number, label: string |}> = [];
      descriptorsByBehavior.forEach((descriptors, behaviorIndex) =>
        descriptors.forEach(descriptor => {
          if (!descriptor.call) return;
          calls.push(descriptor.call);
          labels.push({ behaviorIndex, label: descriptor.label });
        })
      );
      if (!calls.length) return;
      // The previous read is still on its way: this refresh is skipped, the
      // next one will do.
      if (isReadingRef.current) return;

      let isCancelled = false;
      isReadingRef.current = true;
      onReadValuesRef.current([], calls).then(
        results => {
          isReadingRef.current = false;
          if (isCancelled || !results) return;
          const newValues = [];
          results.forEach((result, index) => {
            if (!labels[index]) return;
            const { behaviorIndex, label } = labels[index];
            const behaviorValues =
              newValues[behaviorIndex] || (newValues[behaviorIndex] = {});
            behaviorValues[label] = result.error
              ? i18n._(t`Error: ${result.error}`)
              : result.value === undefined
              ? null
              : result.value;
          });
          setValues(newValues);
        },
        () => {
          isReadingRef.current = false;
        }
      );
      return () => {
        isCancelled = true;
      };
    },
    [behaviors, descriptorsByBehavior, i18n]
  );

  return values;
};

/**
 * The behaviors of an object as rows of the inspector: a foldable section per
 * behavior, holding a foldable list of its properties and another of its
 * expressions.
 */
export const useBehaviorsItems = (
  parentId: string,
  behaviors: ?Array<GameData>,
  onReadValues: ReadValuesFunction,
  i18n: I18nType
): Array<InspectorItem> => {
  // The dump of the game replaces what it could not send by a placeholder
  // string, so what is given here is not always the expected array.
  const behaviorsList = React.useMemo(
    () => (Array.isArray(behaviors) ? behaviors : []),
    [behaviors]
  );
  // The expressions only depend on the types of the behaviors: they are
  // listed again only when these change, not at each refresh of the values.
  const behaviorTypesKey = behaviorsList
    .map(behavior => (behavior && behavior.type) || '')
    .join('|');
  const descriptorsByBehavior = React.useMemo(
    () =>
      behaviorsList.map((behavior, index) =>
        behavior && behavior.type
          ? getExpressionDescriptors(behavior.type, index)
          : []
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [behaviorTypesKey]
  );
  const expressionValues = useExpressionValues(
    behaviorsList,
    descriptorsByBehavior,
    onReadValues,
    i18n
  );

  return React.useMemo(
    () =>
      behaviorsList.map((behavior, index) => {
        const behaviorName = getBehaviorName(behavior, index);
        const behaviorId = `${parentId}/${behaviorName}`;
        const properties = getEditableProperties(behavior);
        const descriptors = descriptorsByBehavior[index] || [];
        const values = expressionValues[index];

        const propertiesItems = Object.keys(properties)
          .sort((first, second) => first.localeCompare(second))
          .map(label =>
            makeValueItem(
              `${behaviorId}/properties/${label}`,
              label,
              properties[label]
            )
          );
        const expressionsItems = descriptors.map(descriptor => {
          const expressionId = `${behaviorId}/expressions/${descriptor.label}`;
          if (descriptor.unavailableReason === 'needs-parameter') {
            return makeHintItem(
              expressionId,
              i18n._(t`Needs a parameter, not shown.`),
              descriptor.label
            );
          }
          if (descriptor.unavailableReason === 'not-readable') {
            return makeHintItem(
              expressionId,
              i18n._(t`Cannot be read here.`),
              descriptor.label
            );
          }
          if (!values) {
            return makeHintItem(
              expressionId,
              i18n._(t`Read while the game runs.`),
              descriptor.label
            );
          }
          return makeValueItem(
            expressionId,
            descriptor.label,
            values[descriptor.label]
          );
        });

        return makeSection(
          behaviorId,
          behaviorName,
          [
            makeSection(
              `${behaviorId}/properties`,
              i18n._(t`Properties`),
              propertiesItems,
              {
                emptyHint: i18n._(t`This behavior has no property to display.`),
                icon: <TuneIcon />,
              }
            ),
            makeSection(
              `${behaviorId}/expressions`,
              i18n._(t`Expressions`),
              expressionsItems,
              {
                openByDefault: false,
                emptyHint: i18n._(t`This behavior has no expression.`),
                icon: <FunctionsIcon />,
              }
            ),
          ],
          {
            openByDefault: true,
            iconUrl: getBehaviorIconUrl(behavior && behavior.type) || undefined,
          }
        );
      }),
    [parentId, behaviorsList, descriptorsByBehavior, expressionValues, i18n]
  );
};

const BehaviorsInspectorTree = ({
  behaviors,
  onReadValues,
  i18n,
}: {|
  ...Props,
  i18n: I18nType,
|}): React.Node => {
  const items = useBehaviorsItems('behaviors', behaviors, onReadValues, i18n);
  return (
    <InspectorTreeView
      items={
        items.length
          ? items
          : [
              makeHintItem(
                'behaviors/empty',
                i18n._(t`This instance has no behavior.`)
              ),
            ]
      }
    />
  );
};

const BehaviorsInspector = (props: Props): React.Node => (
  <I18n>{({ i18n }) => <BehaviorsInspectorTree {...props} i18n={i18n} />}</I18n>
);

export default BehaviorsInspector;
