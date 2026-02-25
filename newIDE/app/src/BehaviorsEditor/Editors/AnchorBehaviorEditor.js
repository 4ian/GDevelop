// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { type BehaviorEditorProps } from './BehaviorEditorProps.flow';
import BehaviorPropertiesEditor from './BehaviorPropertiesEditor';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Cross from '../../UI/CustomSvgIcons/Cross';
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
import Text from '../../UI/Text';

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
  properties: gdMapStringPropertyDescriptor,
  name: string
): AdvancedAnchor => {
  if (!properties.has(name)) {
    return 'None';
  }
  const anchor = properties.get(name).getValue();
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
  properties: gdMapStringPropertyDescriptor
): BasicAnchor =>
  getBasicAnchor(
    getAnchorProperty(properties, 'leftEdgeAnchor'),
    getAnchorProperty(properties, 'rightEdgeAnchor')
  );

export const getBasicVerticalAnchor = (
  properties: gdMapStringPropertyDescriptor
): BasicAnchor =>
  getBasicAnchor(
    getAnchorProperty(properties, 'topEdgeAnchor'),
    getAnchorProperty(properties, 'bottomEdgeAnchor')
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
  behavior,
  basicAnchor,
  minEdgePropertyName,
  maxEdgePropertyName,
  anchorMapping,
  renderIcon,
  forceUpdate,
  size,
}: {|
  behavior: gdBehavior,
  basicAnchor: BasicAnchor,
  minEdgePropertyName: string,
  maxEdgePropertyName: string,
  anchorMapping: Array<{|
    basicAnchor: BasicAnchor,
    minEdge: string,
    maxEdge: string,
  |}>,
  renderIcon: (basicAnchor: string) => React.Node,
  forceUpdate: () => void,
  size?: 'small' | 'medium' | 'large' | void,
|}): React.Node => {
  return (
    <ButtonGroup size={size}>
      {anchorMapping.map(item => (
        <Button
          key={item.basicAnchor}
          variant={basicAnchor === item.basicAnchor ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => {
            behavior.updateProperty(minEdgePropertyName, item.minEdge);
            behavior.updateProperty(maxEdgePropertyName, item.maxEdge);
            forceUpdate();
          }}
        >
          {renderIcon(item.basicAnchor)}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export const HorizontalAnchorButtonGroup = ({
  behavior,
  basicAnchor,
  forceUpdate,
  size,
}: {|
  behavior: gdBehavior,
  basicAnchor: BasicAnchor,
  forceUpdate: () => void,
  size?: 'small' | 'medium' | 'large' | void,
|}): React.Node => {
  return (
    <AnchorButtonGroup
      behavior={behavior}
      basicAnchor={basicAnchor}
      minEdgePropertyName="leftEdgeAnchor"
      maxEdgePropertyName="rightEdgeAnchor"
      anchorMapping={horizontalAnchorMapping}
      renderIcon={basicAnchor => {
        switch (basicAnchor) {
          case 'MinEdge':
            return <LeftAlignmentIcon />;
          case 'Center':
            return <CenterAlignmentIcon />;
          case 'MaxEdge':
            return <RightAlignmentIcon />;
          case 'FixedFill':
            return <FillIcon />;
          case 'ProportionalFill':
            return <ProportionalFillIcon />;
          case 'None':
          default:
            return <Cross />;
        }
      }}
      forceUpdate={forceUpdate}
      size={size}
    />
  );
};

export const VerticalAnchorButtonGroup = ({
  behavior,
  basicAnchor,
  forceUpdate,
  size,
}: {|
  behavior: gdBehavior,
  basicAnchor: BasicAnchor,
  forceUpdate: () => void,
  size?: 'small' | 'medium' | 'large' | void,
|}): React.Node => {
  return (
    <AnchorButtonGroup
      behavior={behavior}
      basicAnchor={basicAnchor}
      minEdgePropertyName="topEdgeAnchor"
      maxEdgePropertyName="bottomEdgeAnchor"
      anchorMapping={verticalAnchorMapping}
      renderIcon={basicAnchor => {
        switch (basicAnchor) {
          case 'MinEdge':
            return <TopAlignmentIcon />;
          case 'Center':
            return <CenterVerticalAlignmentIcon />;
          case 'MaxEdge':
            return <BottomAlignmentIcon />;
          case 'FixedFill':
            return <VerticalFillIcon />;
          case 'ProportionalFill':
            return <VerticalProportionalFillIcon />;
          case 'None':
          default:
            return <Cross />;
        }
      }}
      forceUpdate={forceUpdate}
      size={size}
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

  const properties = behavior.getProperties();
  const horizontalBasicAnchor = getBasicHorizontalAnchor(properties);
  const verticalBasicAnchor = getBasicVerticalAnchor(properties);

  const _onBehaviorUpdated = React.useCallback(
    () => {
      forceUpdate();
      onBehaviorUpdated();
    },
    [forceUpdate, onBehaviorUpdated]
  );

  return (
    <ColumnStackLayout expand>
      <Text size="sub-title">
        <Trans>Horizontal anchor</Trans>
      </Text>
      <HorizontalAnchorButtonGroup
        behavior={behavior}
        basicAnchor={horizontalBasicAnchor}
        size="large"
        forceUpdate={forceUpdate}
      />
      <Text size="sub-title">
        <Trans>Vertical anchor</Trans>
      </Text>
      <VerticalAnchorButtonGroup
        behavior={behavior}
        basicAnchor={verticalBasicAnchor}
        size="large"
        forceUpdate={forceUpdate}
      />
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
          properties.get('relativeToOriginalWindowSize').getValue() === 'false'
        }
      />
    </ColumnStackLayout>
  );
};

export default AnchorBehaviorEditor;
