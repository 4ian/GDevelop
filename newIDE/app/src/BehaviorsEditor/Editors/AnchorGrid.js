// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
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
import LetterV from '../../UI/CustomSvgIcons/LetterV';
import LetterH from '../../UI/CustomSvgIcons/LetterH';
import Restore from '../../UI/CustomSvgIcons/Restore';
import CompactTextField from '../../UI/CompactTextField';
import CompactToggleButtons, {
  type CompactToggleButton,
} from '../../UI/CompactToggleButtons';
import {
  type BasicAnchor,
  type AnchorMapping,
  getBasicHorizontalAnchor,
  getBasicVerticalAnchor,
  horizontalAnchorMapping,
  verticalAnchorMapping,
} from './AnchorBehaviorEditor';
import styles from './AnchorGrid.module.css';

type Props = {|
  getPropertyValue: (propertyName: string) => string,
  onUpdateProperty: (propertyName: string, value: string) => void,
  initialInstance: gdInitialInstance | null,
|};

const getAnchorDisplayText = (
  basicAnchor: BasicAnchor,
  axis: 'horizontal' | 'vertical'
): string => {
  const axisLabel = axis === 'horizontal' ? 'horizontally' : 'vertically';
  switch (basicAnchor) {
    case 'MinEdge':
      return axis === 'horizontal' ? 'Left horizontally' : 'Bottom vertically';
    case 'Center':
      return `Center ${axisLabel}`;
    case 'MaxEdge':
      return axis === 'horizontal' ? 'Right horizontally' : 'Top vertically';
    case 'FixedFill':
      return `Fill ${axisLabel}`;
    case 'ProportionalFill':
      return `Proportional ${axisLabel}`;
    case 'Advanced':
      return 'Advanced';
    default:
      return '';
  }
};

const makeButtons = (
  currentBasicAnchor: BasicAnchor,
  targetAnchors: Array<BasicAnchor>,
  mapping: AnchorMapping,
  minEdgeProperty: string,
  maxEdgeProperty: string,
  onUpdateProperty: (propertyName: string, value: string) => void,
  renderIcon: (basicAnchor: BasicAnchor, className?: string) => React.Node,
  renderTooltip: (basicAnchor: BasicAnchor) => React.Node
): Array<CompactToggleButton> => {
  return targetAnchors.map(target => {
    const entry = mapping.find(m => m.basicAnchor === target);
    const noneEntry = mapping.find(m => m.basicAnchor === 'None');
    return {
      id: target,
      renderIcon: (className?: string) => renderIcon(target, className),
      tooltip: renderTooltip(target),
      isActive: currentBasicAnchor === target,
      onClick: () => {
        if (currentBasicAnchor === target) {
          // Already active: do nothing. User must use the Restore
          // button in the text field to reset to None.
          return;
        }
        if (entry) {
          onUpdateProperty(minEdgeProperty, entry.minEdge);
          onUpdateProperty(maxEdgeProperty, entry.maxEdge);
        }
      },
    };
  });
};

const clearAnchor = (
  mapping: AnchorMapping,
  minEdgeProperty: string,
  maxEdgeProperty: string,
  onUpdateProperty: (propertyName: string, value: string) => void
) => {
  const noneEntry = mapping.find(m => m.basicAnchor === 'None');
  if (noneEntry) {
    onUpdateProperty(minEdgeProperty, noneEntry.minEdge);
    onUpdateProperty(maxEdgeProperty, noneEntry.maxEdge);
  }
};

const AnchorGrid = ({
  getPropertyValue,
  onUpdateProperty,
  initialInstance,
}: Props): React.Node => {
  const verticalAnchor = getBasicVerticalAnchor(getPropertyValue);
  const horizontalAnchor = getBasicHorizontalAnchor(getPropertyValue);

  // Vertical axis
  const vIsNone = verticalAnchor === 'None';
  const vDisplayValue = vIsNone
    ? initialInstance
      ? String(Math.round(initialInstance.getY()))
      : ''
    : getAnchorDisplayText(verticalAnchor, 'vertical');
  const vPlaceholder = vIsNone && !initialInstance ? 'None' : undefined;

  const vPositionButtons = makeButtons(
    verticalAnchor,
    ['MinEdge', 'Center', 'MaxEdge'],
    verticalAnchorMapping,
    'topEdgeAnchor',
    'bottomEdgeAnchor',
    onUpdateProperty,
    (basicAnchor, className) => {
      switch (basicAnchor) {
        case 'MinEdge':
          return <BottomAlignmentIcon className={className} />;
        case 'Center':
          return <CenterVerticalAlignmentIcon className={className} />;
        case 'MaxEdge':
          return <TopAlignmentIcon className={className} />;
        default:
          return null;
      }
    },
    basicAnchor => {
      switch (basicAnchor) {
        case 'MinEdge':
          return <Trans>Bottom</Trans>;
        case 'Center':
          return <Trans>Center</Trans>;
        case 'MaxEdge':
          return <Trans>Top</Trans>;
        default:
          return '';
      }
    }
  );

  const vFillButtons = makeButtons(
    verticalAnchor,
    ['FixedFill', 'ProportionalFill'],
    verticalAnchorMapping,
    'topEdgeAnchor',
    'bottomEdgeAnchor',
    onUpdateProperty,
    (basicAnchor, className) => {
      switch (basicAnchor) {
        case 'FixedFill':
          return <VerticalFillIcon className={className} />;
        case 'ProportionalFill':
          return <VerticalProportionalFillIcon className={className} />;
        default:
          return null;
      }
    },
    basicAnchor => {
      switch (basicAnchor) {
        case 'FixedFill':
          return <Trans>Fill</Trans>;
        case 'ProportionalFill':
          return <Trans>Fill proportionally</Trans>;
        default:
          return '';
      }
    }
  );

  // Horizontal axis
  const hIsNone = horizontalAnchor === 'None';
  const hDisplayValue = hIsNone
    ? initialInstance
      ? String(Math.round(initialInstance.getX()))
      : ''
    : getAnchorDisplayText(horizontalAnchor, 'horizontal');
  const hPlaceholder = hIsNone && !initialInstance ? 'None' : undefined;

  const hPositionButtons = makeButtons(
    horizontalAnchor,
    ['MinEdge', 'Center', 'MaxEdge'],
    horizontalAnchorMapping,
    'leftEdgeAnchor',
    'rightEdgeAnchor',
    onUpdateProperty,
    (basicAnchor, className) => {
      switch (basicAnchor) {
        case 'MinEdge':
          return <LeftAlignmentIcon className={className} />;
        case 'Center':
          return <CenterAlignmentIcon className={className} />;
        case 'MaxEdge':
          return <RightAlignmentIcon className={className} />;
        default:
          return null;
      }
    },
    basicAnchor => {
      switch (basicAnchor) {
        case 'MinEdge':
          return <Trans>Left</Trans>;
        case 'Center':
          return <Trans>Center</Trans>;
        case 'MaxEdge':
          return <Trans>Right</Trans>;
        default:
          return '';
      }
    }
  );

  const hFillButtons = makeButtons(
    horizontalAnchor,
    ['FixedFill', 'ProportionalFill'],
    horizontalAnchorMapping,
    'leftEdgeAnchor',
    'rightEdgeAnchor',
    onUpdateProperty,
    (basicAnchor, className) => {
      switch (basicAnchor) {
        case 'FixedFill':
          return <FillIcon className={className} />;
        case 'ProportionalFill':
          return <ProportionalFillIcon className={className} />;
        default:
          return null;
      }
    },
    basicAnchor => {
      switch (basicAnchor) {
        case 'FixedFill':
          return <Trans>Fill</Trans>;
        case 'ProportionalFill':
          return <Trans>Fill proportionally</Trans>;
        default:
          return '';
      }
    }
  );

  return (
    <div className={styles.container}>
      <div className={styles.axisGroup}>
        <CompactTextField
          value={vDisplayValue}
          onChange={() => {}}
          placeholder={vPlaceholder}
          renderLeftIcon={className => <LetterV className={className} />}
          leftIconTooltip={<Trans>Vertical</Trans>}
          renderEndAdornmentOnHover={
            !vIsNone
              ? className => <Restore className={className} />
              : undefined
          }
          onClickEndAdornment={
            !vIsNone
              ? () =>
                  clearAnchor(
                    verticalAnchorMapping,
                    'topEdgeAnchor',
                    'bottomEdgeAnchor',
                    onUpdateProperty
                  )
              : undefined
          }
        />
        <div className={styles.buttonGroups}>
          <CompactToggleButtons
            id="vertical-position"
            buttons={vPositionButtons}
            noSeparator
            expand
          />
          <CompactToggleButtons
            id="vertical-fill"
            buttons={vFillButtons}
            noSeparator
            expand
          />
        </div>
      </div>
      <div className={styles.axisGroup}>
        <CompactTextField
          value={hDisplayValue}
          onChange={() => {}}
          placeholder={hPlaceholder}
          renderLeftIcon={className => <LetterH className={className} />}
          leftIconTooltip={<Trans>Horizontal</Trans>}
          renderEndAdornmentOnHover={
            !hIsNone
              ? className => <Restore className={className} />
              : undefined
          }
          onClickEndAdornment={
            !hIsNone
              ? () =>
                  clearAnchor(
                    horizontalAnchorMapping,
                    'leftEdgeAnchor',
                    'rightEdgeAnchor',
                    onUpdateProperty
                  )
              : undefined
          }
        />
        <div className={styles.buttonGroups}>
          <CompactToggleButtons
            id="horizontal-position"
            buttons={hPositionButtons}
            noSeparator
            expand
          />
          <CompactToggleButtons
            id="horizontal-fill"
            buttons={hFillButtons}
            noSeparator
            expand
          />
        </div>
      </div>
    </div>
  );
};

export default AnchorGrid;
