// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type ResourceKind } from '../ResourcesList/ResourceSource';

// An "instance" here is the objects for which properties are shown
export type Instance = Object; // This could be improved using generics.
export type Instances = Array<Instance>;

export type FieldVisibility = 'basic' | 'advanced' | 'deprecated';

// "Value" fields are fields displayed in the properties.
export type ValueFieldCommonProperties = {|
  name: string,
  getLabel?: Instance => string,
  getDescription?: Instance => string,
  hideLabel?: boolean,
  getExtraDescription?: Instance => string,
  hasImpactOnAllOtherFields?: boolean,
  canBeUnlimitedUsingMinus1?: boolean,
  disabled?: (instances: Array<Instance>) => boolean,
  onEditButtonBuildMenuTemplate?: (i18n: I18nType) => Array<MenuItemTemplate>,
  onEditButtonClick?: () => void,
  getValueFromDisplayedValue?: string => string,
  getDisplayedValueFromValue?: string => string,
  visibility?: FieldVisibility | null,
  defaultValue?: string | number | boolean | null,
|};

// "Primitive" value fields are "simple" fields.
export type PrimitiveValueField =
  | {|
      valueType: 'number',
      getValue: Instance => number | null,
      setValue: (instance: Instance, newValue: number) => void,
      /** Only supported on non compact property editors. */
      getEndAdornment?: Instance => {|
        label: string,
        tooltipContent: React.Node,
      |},
      getEndAdornmentIcon?: Instance => ?(className: string) => React.Node,
      onClickEndAdornment?: Instance => void,
      renderLeftIcon?: (className?: string) => React.Node,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'string',
      getValue: Instance => string | null,
      setValue: (instance: Instance, newValue: string) => void,
      getChoices?: ?() => Array<{|
        value: string,
        label: string,
        labelIsUserDefined?: boolean,
      |}>,
      isHiddenWhenOnlyOneChoice?: boolean,
      isAutocompleted?: boolean,
      isAllowingAnyValue?: boolean,
      getEndAdornmentIcon?: Instance => ?(className: string) => React.Node,
      onClickEndAdornment?: Instance => void,
      renderLeftIcon?: (className?: string) => React.Node,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'boolean',
      getValue: Instance => boolean | null,
      setValue: (instance: Instance, newValue: boolean) => void,
      ...ValueFieldCommonProperties,
    |}
  | {|
      /** Only supported on compact property editors. */
      valueType: 'enumIcon',
      renderIcon: (value: any) => React.Node,
      getValue: Instance => any,
      isHighlighted: (value: any) => boolean,
      setValue: (instance: Instance, newValue: any) => void,
      getNextValue: (currentValue: any) => any,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'color',
      getValue: Instance => string,
      setValue: (instance: Instance, newValue: string) => void,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'multilinestring',
      getValue: Instance => string,
      setValue: (instance: Instance, newValue: string) => void,
      ...ValueFieldCommonProperties,
    |};

// "Resource" fields are showing a resource selector.
export type ResourceField = {|
  valueType: 'resource',
  resourceKind: ResourceKind,
  getValue: Instance => string,
  setValue: (instance: Instance, newValue: string) => void,
  renderLeftIcon?: (className?: string) => React.Node,
  ...ValueFieldCommonProperties,
|};

export type LeaderboardIdField = {|
  valueType: 'leaderboardId',
  getValue: Instance => string,
  setValue: (instance: Instance, newValue: string) => void,
  ...ValueFieldCommonProperties,
|};

export type Title = {|
  name: string,
  title: string,
  renderLeftIcon: (className?: string) => React.Node,
  getValue?: Instance => string,
  nonFieldType: 'title',
  defaultValue?: string,
|};

export type SectionTitle = {|
  name: string,
  title: string,
  nonFieldType: 'sectionTitle',
  getValue: typeof undefined,
|};

type VerticalCenterWithBar = {|
  name: string,
  nonFieldType: 'verticalCenterWithBar',
  child: PrimitiveValueField,
|};

export type ActionButton = {|
  label: string,
  disabled: 'onValuesDifferent',
  getValue: Instance => string,
  nonFieldType: 'button',
  getIcon?: ({| fontSize: string |}) => React.Node,
  showRightIcon?: boolean,
  onClick: (instance: Instance) => void,
|};

export type ToggleButtons = {|
  nonFieldType: 'toggleButtons',
  buttons: Array<{|
    name: string,
    renderIcon: (className?: string) => React.Node,
    tooltip: React.Node,
    getValue: Instance => boolean,
    setValue: (instance: Instance, newValue: boolean) => void,
  |}>,
  ...ValueFieldCommonProperties,
|};

// A value field is a primitive or a resource.
export type ValueField =
  | PrimitiveValueField
  | ResourceField
  | LeaderboardIdField;

// A field can be a primitive, a resource or a list of fields
export type Field =
  | PrimitiveValueField
  | ResourceField
  | LeaderboardIdField
  | SectionTitle
  | Title
  | ActionButton
  | ToggleButtons
  | VerticalCenterWithBar
  | {|
      name: string,
      type: 'row' | 'column',
      preventWrap?: boolean,
      removeSpacers?: boolean,
      title?: ?string,
      children: Array<Field>,
      isHidden?: (Array<Instance>) => boolean,
    |};

// The schema is the tree of all fields.
export type Schema = Array<Field>;
