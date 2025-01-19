// @flow
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { Line, Column, Spacer } from '../../../UI/Grid';
import Checkbox from '../../../UI/Checkbox';
import SelectField from '../../../UI/SelectField';
import SelectOption from '../../../UI/SelectOption';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import { type BehaviorEditorProps } from '../BehaviorEditorProps.flow';
import Text from '../../../UI/Text';
import DismissableAlertMessage from '../../../UI/DismissableAlertMessage';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { NumericProperty, UnitAdornment } from '../Physics2Editor';

type Props = BehaviorEditorProps;

const BitGroupEditor = (props: {|
  bits: Array<boolean>,
  onChange: (index: number, value: boolean) => void,
  firstIndex: number,
  disabled: boolean,
|}) => {
  return (
    <div style={{ overflowX: 'auto', flex: 1 }}>
      <ButtonGroup disableElevation fullWidth disabled={props.disabled}>
        {props.bits.map((bit, index) => (
          <Button
            key={props.firstIndex + index}
            variant={bit ? 'contained' : 'outlined'}
            color={bit ? 'primary' : 'default'}
            onClick={() => props.onChange(props.firstIndex + index, !bit)}
          >
            {props.firstIndex + index + 1}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
};

const isBitEnabled = (bitsValue: number, pos: number) => {
  return !!(bitsValue & (1 << pos));
};

const enableBit = (bitsValue: number, pos: number, enable: boolean) => {
  if (enable) bitsValue |= 1 << pos;
  else bitsValue &= ~(1 << pos);
  return bitsValue;
};

const Physics3DEditor = (props: Props) => {
  const { behavior, onBehaviorUpdated } = props;
  const forceUpdate = useForceUpdate();

  const updateBehaviorProperty = React.useCallback(
    (property, value) => {
      behavior.updateProperty(property, value);
      forceUpdate();
      onBehaviorUpdated();
    },
    [behavior, forceUpdate, onBehaviorUpdated]
  );

  const properties = behavior.getProperties();
  const staticBits = Array(4).fill(null);
  const dynamicBits = Array(4).fill(null);
  const shape = properties.get('shape').getValue();
  const layersValues = parseInt(properties.get('layers').getValue(), 10);
  const masksValues = parseInt(properties.get('masks').getValue(), 10);

  const isStatic = properties.get('bodyType').getValue() === 'Static';

  return (
    <Column
      expand
      // Avoid overflow on small screens
      noOverflowParent
    >
      <Line>
        <SelectField
          id="physics3d-parameter-body-type"
          key={'bodyType'}
          fullWidth
          floatingLabelText={properties.get('bodyType').getLabel()}
          value={properties.get('bodyType').getValue()}
          onChange={(e, i, newValue: string) =>
            updateBehaviorProperty('bodyType', newValue)
          }
        >
          {[
            <SelectOption
              key={'dynamic'}
              value={'Dynamic'}
              label={t`Dynamic`}
            />,
            <SelectOption key={'static'} value={'Static'} label={t`Static`} />,
            <SelectOption
              key={'kinematic'}
              value={'Kinematic'}
              label={t`Kinematic`}
            />,
          ]}
        </SelectField>
      </Line>
      <ResponsiveLineStackLayout>
        <Checkbox
          label={properties.get('bullet').getLabel()}
          checked={properties.get('bullet').getValue() === 'true'}
          onCheck={(e, checked) =>
            updateBehaviorProperty('bullet', checked ? '1' : '0')
          }
        />
        <Checkbox
          label={properties.get('fixedRotation').getLabel()}
          checked={properties.get('fixedRotation').getValue() === 'true'}
          onCheck={(e, checked) =>
            updateBehaviorProperty('fixedRotation', checked ? '1' : '0')
          }
        />
      </ResponsiveLineStackLayout>
      <Line>
        <DismissableAlertMessage
          identifier="physics2-shape-collisions"
          kind="info"
        >
          <Trans>
            The shape used in the Physics behavior is independent from the
            collision mask of the object. Be sure to use the "Collision"
            condition provided by the Physics behavior in the events. The usual
            "Collision" condition won't take into account the shape that you've
            set up here.
          </Trans>
        </DismissableAlertMessage>
      </Line>
      <ResponsiveLineStackLayout>
        <SelectField
          id="physics3d-parameter-shape"
          fullWidth
          floatingLabelText={properties.get('shape').getLabel()}
          value={properties.get('shape').getValue()}
          onChange={(e, i, newValue: string) =>
            updateBehaviorProperty('shape', newValue)
          }
        >
          <SelectOption key={'sphere'} value={'Sphere'} label={t`Sphere`} />
          <SelectOption key={'box'} value={'Box'} label={t`Box`} />
          <SelectOption key={'capsule'} value={'Capsule'} label={t`Capsule`} />
          <SelectOption
            key={'cylinder'}
            value={'Cylinder'}
            label={t`Cylinder`}
          />
        </SelectField>
        <SelectField
          id="physics3d-parameter-shape-orientation"
          fullWidth
          floatingLabelText={properties.get('shapeOrientation').getLabel()}
          value={properties.get('shapeOrientation').getValue()}
          onChange={(e, i, newValue: string) =>
            updateBehaviorProperty('shapeOrientation', newValue)
          }
          disabled={
            properties.get('shape').getValue() === 'Sphere' ||
            properties.get('shape').getValue() === 'Box'
          }
        >
          <SelectOption key={'shape-orientation-z'} value={'Z'} label={t`Z`} />
          <SelectOption key={'shape-orientation-y'} value={'Y'} label={t`Y`} />
          <SelectOption key={'shape-orientation-x'} value={'X'} label={t`X`} />
        </SelectField>
      </ResponsiveLineStackLayout>
      <ResponsiveLineStackLayout>
        <SemiControlledTextField
          fullWidth
          value={properties.get('shapeDimensionA').getValue()}
          key={'shapeDimensionA'}
          floatingLabelText={
            shape === 'Box' ? <Trans>Width</Trans> : <Trans>Radius</Trans>
          }
          min={0}
          onChange={newValue =>
            updateBehaviorProperty('shapeDimensionA', newValue)
          }
          type="number"
          endAdornment={
            <UnitAdornment property={properties.get('shapeDimensionA')} />
          }
        />
        {shape !== 'Sphere' && (
          <SemiControlledTextField
            fullWidth
            value={properties.get('shapeDimensionB').getValue()}
            key={'shapeDimensionB'}
            floatingLabelText={
              shape === 'Box' ? <Trans>Height</Trans> : <Trans>Depth</Trans>
            }
            min={0}
            onChange={newValue =>
              updateBehaviorProperty('shapeDimensionB', newValue)
            }
            type="number"
            endAdornment={
              <UnitAdornment property={properties.get('shapeDimensionB')} />
            }
          />
        )}
        {shape === 'Box' && (
          <SemiControlledTextField
            fullWidth
            value={properties.get('shapeDimensionC').getValue()}
            key={'shapeDimensionC'}
            floatingLabelText={<Trans>Depth</Trans>}
            min={0}
            onChange={newValue =>
              updateBehaviorProperty('shapeDimensionC', newValue)
            }
            type="number"
            endAdornment={
              <UnitAdornment property={properties.get('shapeDimensionC')} />
            }
          />
        )}
      </ResponsiveLineStackLayout>
      <ResponsiveLineStackLayout>
        <NumericProperty
          id="physics3d-parameter-density"
          properties={properties}
          propertyName={'density'}
          step={0.1}
          onUpdate={newValue =>
            updateBehaviorProperty(
              'density',
              parseFloat(newValue) > 0 ? newValue : '0'
            )
          }
        />
        <NumericProperty
          properties={properties}
          propertyName={'gravityScale'}
          step={0.1}
          onUpdate={newValue =>
            updateBehaviorProperty('gravityScale', newValue)
          }
        />
      </ResponsiveLineStackLayout>
      <ResponsiveLineStackLayout>
        <NumericProperty
          properties={properties}
          propertyName={'friction'}
          step={0.1}
          onUpdate={newValue =>
            updateBehaviorProperty(
              'friction',
              parseFloat(newValue) > 0 ? newValue : '0'
            )
          }
        />
        <NumericProperty
          properties={properties}
          propertyName={'restitution'}
          step={0.1}
          onUpdate={newValue =>
            updateBehaviorProperty(
              'restitution',
              parseFloat(newValue) > 0 ? newValue : '0'
            )
          }
        />
      </ResponsiveLineStackLayout>
      <ResponsiveLineStackLayout>
        <NumericProperty
          properties={properties}
          propertyName={'linearDamping'}
          step={0.05}
          onUpdate={newValue =>
            updateBehaviorProperty('linearDamping', newValue)
          }
        />
        <NumericProperty
          id="physics3d-parameter-angular-damping"
          properties={properties}
          propertyName={'angularDamping'}
          step={0.05}
          onUpdate={newValue =>
            updateBehaviorProperty('angularDamping', newValue)
          }
        />
      </ResponsiveLineStackLayout>
      <Line>
        <Text style={{ marginRight: 10 }}>
          {properties.get('layers').getLabel()}
        </Text>
        <BitGroupEditor
          key={'static-layers'}
          firstIndex={0}
          bits={staticBits.map(
            (_, index) => isBitEnabled(layersValues, index) && isStatic
          )}
          onChange={(index, value) => {
            const newValue = enableBit(layersValues, index, value);
            updateBehaviorProperty('layers', newValue.toString(10));
          }}
          disabled={!isStatic}
        />
        <Spacer />
        <BitGroupEditor
          key={'dynamic-layers'}
          firstIndex={4}
          bits={dynamicBits.map(
            (_, index) => isBitEnabled(layersValues, index + 4) && !isStatic
          )}
          onChange={(index, value) => {
            const newValue = enableBit(layersValues, index, value);
            updateBehaviorProperty('layers', newValue.toString(10));
          }}
          disabled={isStatic}
        />
      </Line>
      <Line>
        <Text style={{ marginRight: 10 }}>
          {properties.get('masks').getLabel()}
        </Text>
        <BitGroupEditor
          key={'static-mask'}
          firstIndex={0}
          bits={staticBits.map(
            (_, index) => isBitEnabled(masksValues, index) || isStatic
          )}
          onChange={(index, value) => {
            const newValue = enableBit(masksValues, index, value);
            updateBehaviorProperty('masks', newValue.toString(10));
          }}
          disabled={isStatic}
        />
        <Spacer />
        <BitGroupEditor
          key={'dynamic-mask'}
          firstIndex={4}
          bits={dynamicBits.map(
            (_, index) => isBitEnabled(masksValues, index + 4) || isStatic
          )}
          onChange={(index, value) => {
            const newValue = enableBit(masksValues, index, value);
            updateBehaviorProperty('masks', newValue.toString(10));
          }}
          disabled={isStatic}
        />
      </Line>
    </Column>
  );
};

export default Physics3DEditor;
