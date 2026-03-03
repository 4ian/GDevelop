// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { type BehaviorEditorProps } from './BehaviorEditorProps.flow';
import BehaviorPropertiesEditor from './BehaviorPropertiesEditor';
import SmallCrossIcon from '../../UI/CustomSvgIcons/SmallCross';
import LeftAlignmentIcon from '../../UI/CustomSvgIcons/LeftAlignment';
import CenterAlignmentIcon from '../../UI/CustomSvgIcons/CenterAlignment';
import RightAlignmentIcon from '../../UI/CustomSvgIcons/RightAlignment';
import FillIcon from '../../UI/CustomSvgIcons/HorizontalSize';
import ProportionalFillIcon from '../../UI/CustomSvgIcons/HorizontalSizePercent';
import TopAlignmentIcon from '../../UI/CustomSvgIcons/TopAlignment';
import CenterVerticalAlignmentIcon from '../../UI/CustomSvgIcons/CenterVerticalAlignment';
import BottomAlignmentIcon from '../../UI/CustomSvgIcons/BottomAlignment';
import VerticalFillIcon from '../../UI/CustomSvgIcons/VerticalSize';
import VerticalProportionalFillIcon from '../../UI/CustomSvgIcons/VerticalSizePercent';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { ColumnStackLayout } from '../../UI/Layout';
import { Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import {
  getPropertyValue,
  updateProperty,
} from '../../ObjectEditor/CompactObjectPropertiesEditor/CompactBehaviorPropertiesEditor';
import CompactToggleButtons, {
  type CompactToggleButton,
} from '../../UI/CompactToggleButtons';

type BasicAnchor =
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

type AnchorMapping = Array<{|
  basicAnchor: BasicAnchor,
  minEdge: string,
  maxEdge: string,
|}>;

const horizontalAnchorMapping: AnchorMapping = [
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

const verticalAnchorMapping: AnchorMapping = [
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

const AnchorButtonGroup = ({
  id,
  basicAnchor,
  minEdgePropertyName,
  maxEdgePropertyName,
  anchorMapping,
  renderIcon,
  renderTooltip,
  onUpdateProperty,
  expand,
}: {|
  id: string,
  basicAnchor: BasicAnchor,
  minEdgePropertyName: string,
  maxEdgePropertyName: string,
  anchorMapping: Array<{|
    basicAnchor: BasicAnchor,
    minEdge: string,
    maxEdge: string,
  |}>,
  renderIcon: (basicAnchor: string, className?: string) => React.Node,
  renderTooltip: (basicAnchor: string) => React.Node,
  onUpdateProperty: (propertyName: string, value: string) => void,
  expand?: boolean,
|}): React.Node => {
  const buttons: Array<CompactToggleButton> = anchorMapping.map(item => ({
    id: item.basicAnchor,
    renderIcon: (className?: string) => renderIcon(item.basicAnchor, className),
    tooltip: renderTooltip(item.basicAnchor),
    isActive: basicAnchor === item.basicAnchor,
    onClick: () => {
      onUpdateProperty(minEdgePropertyName, item.minEdge);
      onUpdateProperty(maxEdgePropertyName, item.maxEdge);
    },
  }));

  return <CompactToggleButtons id={id} buttons={buttons} expand={false} />;
};

export const HorizontalAnchorButtonGroup = ({
  basicAnchor,
  onUpdateProperty,
  expand,
}: {|
  basicAnchor: BasicAnchor,
  onUpdateProperty: (propertyName: string, value: string) => void,
  expand?: boolean,
|}): React.Node => {
  return (
    <AnchorButtonGroup
      id="horizontal-anchor"
      basicAnchor={basicAnchor}
      minEdgePropertyName="leftEdgeAnchor"
      maxEdgePropertyName="rightEdgeAnchor"
      anchorMapping={horizontalAnchorMapping}
      renderIcon={(basicAnchor, className) => {
        switch (basicAnchor) {
          case 'MinEdge':
            return <LeftAlignmentIcon class={className} />;
          case 'Center':
            return <CenterAlignmentIcon class={className} />;
          case 'MaxEdge':
            return <RightAlignmentIcon class={className} />;
          case 'FixedFill':
            return <FillIcon class={className} />;
          case 'ProportionalFill':
            return <ProportionalFillIcon class={className} />;
          case 'None':
          default:
            return <SmallCrossIcon class={className} />;
        }
      }}
      renderTooltip={basicAnchor => {
        switch (basicAnchor) {
          case 'MinEdge':
            return <Trans>Left</Trans>;
          case 'Center':
            return <Trans>Center</Trans>;
          case 'MaxEdge':
            return <Trans>Right</Trans>;
          case 'FixedFill':
            return <Trans>Fill</Trans>;
          case 'ProportionalFill':
            return <Trans>Fill proportionally</Trans>;
          case 'None':
          default:
            return <Trans>None</Trans>;
        }
      }}
      onUpdateProperty={onUpdateProperty}
      expand={expand}
    />
  );
};

export const VerticalAnchorButtonGroup = ({
  basicAnchor,
  onUpdateProperty,
  expand,
}: {|
  basicAnchor: BasicAnchor,
  onUpdateProperty: (propertyName: string, value: string) => void,
  expand?: boolean,
|}): React.Node => {
  return (
    <AnchorButtonGroup
      id="vertical-anchor"
      basicAnchor={basicAnchor}
      minEdgePropertyName="topEdgeAnchor"
      maxEdgePropertyName="bottomEdgeAnchor"
      anchorMapping={verticalAnchorMapping}
      renderIcon={(basicAnchor, className) => {
        switch (basicAnchor) {
          case 'MinEdge':
            return <TopAlignmentIcon class={className} />;
          case 'Center':
            return <CenterVerticalAlignmentIcon class={className} />;
          case 'MaxEdge':
            return <BottomAlignmentIcon class={className} />;
          case 'FixedFill':
            return <VerticalFillIcon class={className} />;
          case 'ProportionalFill':
            return <VerticalProportionalFillIcon class={className} />;
          case 'None':
          default:
            return <SmallCrossIcon class={className} />;
        }
      }}
      renderTooltip={basicAnchor => {
        switch (basicAnchor) {
          case 'MinEdge':
            return <Trans>Top</Trans>;
          case 'Center':
            return <Trans>Center</Trans>;
          case 'MaxEdge':
            return <Trans>Bottom</Trans>;
          case 'FixedFill':
            return <Trans>Fill</Trans>;
          case 'ProportionalFill':
            return <Trans>Fill proportionally</Trans>;
          case 'None':
          default:
            return <Trans>None</Trans>;
        }
      }}
      onUpdateProperty={onUpdateProperty}
      expand={expand}
    />
  );
};

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

  const horizontalBasicAnchor = getBasicHorizontalAnchor(_getPropertyValue);
  const verticalBasicAnchor = getBasicVerticalAnchor(_getPropertyValue);

  return (
    <ColumnStackLayout expand>
      <Text size="sub-title">
        <Trans>Horizontal anchor</Trans>
      </Text>
      <Line noMargin>
        <HorizontalAnchorButtonGroup
          basicAnchor={horizontalBasicAnchor}
          onUpdateProperty={_updateProperty}
        />
      </Line>
      <Text size="sub-title">
        <Trans>Vertical anchor</Trans>
      </Text>
      <Line noMargin>
        <VerticalAnchorButtonGroup
          basicAnchor={verticalBasicAnchor}
          onUpdateProperty={_updateProperty}
        />
      </Line>
      <BehaviorPropertiesEditor
        project={project}
        object={object}
        behavior={behavior}
        onBehaviorUpdated={_onBehaviorUpdated}
        resourceManagementProps={resourceManagementProps}
        projectScopedContainersAccessor={projectScopedContainersAccessor}
        isAdvancedSectionInitiallyUncollapsed={
          horizontalBasicAnchor === 'Advanced' ||
          verticalBasicAnchor === 'Advanced' ||
          _getPropertyValue('relativeToOriginalWindowSize') === 'false'
        }
      />
    </ColumnStackLayout>
  );
};

export default AnchorBehaviorEditor;
