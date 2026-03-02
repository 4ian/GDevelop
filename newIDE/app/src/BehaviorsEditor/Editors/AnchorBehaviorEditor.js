// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { type BehaviorEditorProps } from './BehaviorEditorProps.flow';
import BehaviorPropertiesEditor from './BehaviorPropertiesEditor';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { ColumnStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import {
  getPropertyValue,
  updateProperty,
} from '../../ObjectEditor/CompactObjectPropertiesEditor/CompactBehaviorPropertiesEditor';
import AnchorGrid from './AnchorGrid';

export type BasicAnchor =
  | 'None'
  | 'ProportionalFill'
  | 'FixedFill'
  | 'MinEdge'
  | 'MaxEdge'
  | 'Center'
  | 'Advanced';

type AdvancedAnchor =
  | 'MinEdge'
  | 'MaxEdge'
  | 'Proportional'
  | 'Center'
  | 'None';

const getAnchorProperty = (
  getPropertyValue: (propertyName: string) => string,
  name: string
): AdvancedAnchor => {
  const anchor = getPropertyValue(name);
  if (anchor === 'WindowLeft' || anchor === 'WindowTop') {
    return 'MinEdge';
  }
  if (anchor === 'WindowRight' || anchor === 'WindowBottom') {
    return 'MaxEdge';
  }
  if (anchor === 'WindowCenter') {
    return 'Center';
  }
  // $FlowFixMe[incompatible-type]
  return anchor;
};

const getBasicAnchor = (
  minEdgeAnchor: AdvancedAnchor,
  maxEdgeAnchor: AdvancedAnchor
): BasicAnchor => {
  if (minEdgeAnchor === 'Proportional' && maxEdgeAnchor === 'Proportional') {
    return 'ProportionalFill';
  }
  if (minEdgeAnchor === 'MinEdge' && maxEdgeAnchor === 'MaxEdge') {
    return 'FixedFill';
  }
  const sameAnchor =
    minEdgeAnchor === maxEdgeAnchor
      ? minEdgeAnchor
      : maxEdgeAnchor === 'None'
      ? minEdgeAnchor
      : minEdgeAnchor === 'None'
      ? maxEdgeAnchor
      : null;
  if (sameAnchor === 'None') {
    return 'None';
  }
  if (sameAnchor === 'MinEdge') {
    return 'MinEdge';
  }
  if (sameAnchor === 'MaxEdge') {
    return 'MaxEdge';
  }
  if (sameAnchor === 'Center') {
    return 'Center';
  }
  return 'Advanced';
};

export const getBasicHorizontalAnchor = (
  getPropertyValue: (propertyName: string) => string
): BasicAnchor =>
  getBasicAnchor(
    getAnchorProperty(getPropertyValue, 'leftEdgeAnchor'),
    getAnchorProperty(getPropertyValue, 'rightEdgeAnchor')
  );

export const getBasicVerticalAnchor = (
  getPropertyValue: (propertyName: string) => string
): BasicAnchor =>
  getBasicAnchor(
    getAnchorProperty(getPropertyValue, 'topEdgeAnchor'),
    getAnchorProperty(getPropertyValue, 'bottomEdgeAnchor')
  );

export type AnchorMapping = Array<{|
  basicAnchor: BasicAnchor,
  minEdge: string,
  maxEdge: string,
|}>;

export const horizontalAnchorMapping: AnchorMapping = [
  { basicAnchor: 'None', minEdge: 'None', maxEdge: 'None' },
  { basicAnchor: 'MinEdge', minEdge: 'WindowLeft', maxEdge: 'WindowLeft' },
  { basicAnchor: 'Center', minEdge: 'WindowCenter', maxEdge: 'WindowCenter' },
  { basicAnchor: 'MaxEdge', minEdge: 'WindowRight', maxEdge: 'WindowRight' },
  { basicAnchor: 'FixedFill', minEdge: 'WindowLeft', maxEdge: 'WindowRight' },
  {
    basicAnchor: 'ProportionalFill',
    minEdge: 'Proportional',
    maxEdge: 'Proportional',
  },
];

export const verticalAnchorMapping: AnchorMapping = [
  { basicAnchor: 'None', minEdge: 'None', maxEdge: 'None' },
  { basicAnchor: 'MinEdge', minEdge: 'WindowTop', maxEdge: 'WindowTop' },
  { basicAnchor: 'Center', minEdge: 'WindowCenter', maxEdge: 'WindowCenter' },
  { basicAnchor: 'MaxEdge', minEdge: 'WindowBottom', maxEdge: 'WindowBottom' },
  { basicAnchor: 'FixedFill', minEdge: 'WindowTop', maxEdge: 'WindowBottom' },
  {
    basicAnchor: 'ProportionalFill',
    minEdge: 'Proportional',
    maxEdge: 'Proportional',
  },
];

type Props = BehaviorEditorProps;

const AnchorBehaviorEditor = ({
  project,
  behavior,
  object,
  onBehaviorUpdated,
  resourceManagementProps,
  projectScopedContainersAccessor,
}: Props): React.Node => {
  const forceUpdate = useForceUpdate();
  const _getPropertyValue = React.useCallback(
    (propertyName: string) => getPropertyValue(behavior, propertyName, null),
    [behavior]
  );
  const _updateProperty = React.useCallback(
    (propertyName: string, value: string) => {
      updateProperty(project, behavior, propertyName, value, null);
      forceUpdate();
      onBehaviorUpdated();
    },
    [behavior, forceUpdate, onBehaviorUpdated, project]
  );
  const _onBehaviorUpdated = React.useCallback(
    () => {
      forceUpdate();
      onBehaviorUpdated();
    },
    [forceUpdate, onBehaviorUpdated]
  );

  const isAdvanced =
    getBasicHorizontalAnchor(_getPropertyValue) === 'Advanced' ||
    getBasicVerticalAnchor(_getPropertyValue) === 'Advanced';

  return (
    <ColumnStackLayout expand>
      <Text size="sub-title">
        <Trans>Alignment</Trans>
      </Text>
      <AnchorGrid
        getPropertyValue={_getPropertyValue}
        onUpdateProperty={_updateProperty}
        initialInstance={null}
      />
      <BehaviorPropertiesEditor
        project={project}
        object={object}
        behavior={behavior}
        onBehaviorUpdated={_onBehaviorUpdated}
        resourceManagementProps={resourceManagementProps}
        projectScopedContainersAccessor={projectScopedContainersAccessor}
        isAdvancedSectionInitiallyUncollapsed={
          isAdvanced ||
          _getPropertyValue('relativeToOriginalWindowSize') === 'false'
        }
      />
    </ColumnStackLayout>
  );
};

export default AnchorBehaviorEditor;
