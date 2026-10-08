// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import InspectorTreeView, {
  buildValueItems,
  makeSection,
  makeValueItem,
  type InspectorItem,
} from './InspectorTreeView';
import { type GameData } from '../GDJSInspectorDescriptions';
import ObjectIcon from '../../UI/CustomSvgIcons/Object';
import ObjectVariableIcon from '../../UI/CustomSvgIcons/ObjectVariable';
import BehaviorIcon from '../../UI/CustomSvgIcons/Behavior';
import TuneIcon from '../../UI/CustomSvgIcons/Tune';

const gd: libGDevelop = global.gd;

type Props = {|
  /** The definition of the object in the scene (`ObjectData`), as the game holds it. */
  objectData: ?GameData,
  /** The instances of the object living in the scene. */
  instances: ?Array<GameData>,
|};

/**
 * A variable of the project, as written in the game data, to a plain value:
 * the shape the inspector reads. Structures and arrays hold their children.
 */
const variableDataToPlainValue = (variableData: any): any => {
  if (!variableData) return null;
  const type = variableData.type || 'number';
  if (type === 'structure') {
    const structure = {};
    (variableData.children || []).forEach(child => {
      if (child && child.name) {
        structure[child.name] = variableDataToPlainValue(child);
      }
    });
    return structure;
  }
  if (type === 'array') {
    return (variableData.children || []).map(variableDataToPlainValue);
  }
  if (type === 'boolean') return !!variableData.value;
  if (type === 'string') return String(variableData.value || '');
  const number = parseFloat(variableData.value);
  return isNaN(number) ? 0 : number;
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

/** What the user sets up on a behavior: everything but its identity. */
const getBehaviorProperties = (behaviorData: any) => {
  const properties = {};
  Object.keys(behaviorData || {}).forEach(key => {
    if (key === 'name' || key === 'type') return;
    const value = behaviorData[key];
    const valueType = typeof value;
    if (
      valueType === 'number' ||
      valueType === 'string' ||
      valueType === 'boolean'
    ) {
      properties[key] = value;
    }
  });
  return properties;
};

const ObjectDataInspectorTree = ({
  objectData,
  instances,
  i18n,
}: {|
  ...Props,
  i18n: I18nType,
|}): React.Node => {
  const items: Array<InspectorItem> = React.useMemo(
    () => {
      const generalProperties = {};
      generalProperties[i18n._(t`Name`)] = objectData ? objectData.name : '';
      generalProperties[i18n._(t`Type`)] = objectData ? objectData.type : '';
      generalProperties[i18n._(t`Instances in the scene`)] = Array.isArray(
        instances
      )
        ? instances.filter(Boolean).length
        : 0;

      const variables = {};
      ((objectData && objectData.variables) || []).forEach(variableData => {
        if (variableData && variableData.name) {
          variables[variableData.name] = variableDataToPlainValue(variableData);
        }
      });

      const behaviorsItems = ((objectData && objectData.behaviors) || [])
        .filter(Boolean)
        .map(behaviorData => {
          const behaviorName = behaviorData.name || behaviorData.type || '';
          const behaviorId = `behaviors/${behaviorName}`;
          const properties = getBehaviorProperties(behaviorData);
          return makeSection(
            behaviorId,
            behaviorName,
            [
              makeSection(
                `${behaviorId}/properties`,
                i18n._(t`Properties`),
                Object.keys(properties)
                  .sort((first, second) => first.localeCompare(second))
                  .map(label =>
                    makeValueItem(
                      `${behaviorId}/properties/${label}`,
                      label,
                      properties[label]
                    )
                  ),
                {
                  emptyHint: i18n._(
                    t`This behavior has no property to display.`
                  ),
                  icon: <TuneIcon />,
                }
              ),
            ],
            {
              iconUrl: getBehaviorIconUrl(behaviorData.type) || undefined,
            }
          );
        });

      return [
        makeSection(
          'general',
          i18n._(t`General`),
          buildValueItems('general', generalProperties, { sorted: false }),
          { isRoot: true, icon: <ObjectIcon /> }
        ),
        // The values of the object itself, as set up in the editor: each
        // instance starts from them and can override them.
        makeSection(
          'variables',
          i18n._(t`Object variables (default values)`),
          buildValueItems('variables', variables),
          {
            isRoot: true,
            emptyHint: i18n._(t`This object has no variable.`),
            icon: <ObjectVariableIcon />,
          }
        ),
        makeSection('behaviors', i18n._(t`Behaviors`), behaviorsItems, {
          isRoot: true,
          emptyHint: i18n._(t`This object has no behavior.`),
          icon: <BehaviorIcon />,
        }),
      ];
    },
    [objectData, instances, i18n]
  );

  return <InspectorTreeView items={items} />;
};

/**
 * The object as defined in the scene: its default variables and behaviors,
 * which its instances inherit and can override (see `RuntimeObjectInspector`
 * for the values an instance actually holds).
 */
const ObjectDataInspector = (props: Props): React.Node => (
  <I18n>
    {({ i18n }) => <ObjectDataInspectorTree {...props} i18n={i18n} />}
  </I18n>
);

export default ObjectDataInspector;
