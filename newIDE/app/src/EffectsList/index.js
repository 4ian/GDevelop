// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { Column, Line } from '../UI/Grid';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { mapFor } from '../Utils/MapFor';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import EmptyMessage from '../UI/EmptyMessage';
import IconMenu from '../UI/Menu/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import MiniToolbar from '../UI/MiniToolbar';
import newNameGenerator from '../Utils/NewNameGenerator';
import Add from 'material-ui/svg-icons/content/add';
import {
  getAllEffectDescriptions,
  type EffectDescription,
} from './EffectDescription';
import PropertiesEditor from '../PropertiesEditor';
import BackgroundText from '../UI/BackgroundText';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';

type Props = {|
  effectsContainer: gdEffectsContainer,
  onEffectsUpdated: () => void,
|};

const getEffectDescription = (
  allEffectDescriptions: Array<EffectDescription>,
  effectName: string
): ?EffectDescription => {
  return allEffectDescriptions.find(
    effectDescription => effectDescription.name === effectName
  );
};

export default class EffectsList extends React.Component<Props, {||}> {
  _addEffect = () => {
    const { effectsContainer } = this.props;

    const newName = newNameGenerator('Effect', name =>
      effectsContainer.hasEffectNamed(name)
    );
    effectsContainer.insertNewEffect(
      newName,
      effectsContainer.getEffectsCount()
    );

    this.forceUpdate();
    this.props.onEffectsUpdated();
  };

  _removeEffect = (name: string) => {
    const { effectsContainer } = this.props;

    effectsContainer.removeEffect(name);
    this.forceUpdate();
    this.props.onEffectsUpdated();
  };

  _chooseEffectName = (
    allEffectDescriptions: Array<EffectDescription>,
    effect: gdEffect,
    newEffectName: string
  ) => {
    effect.setEffectName(newEffectName);
    const effectDescription = getEffectDescription(
      allEffectDescriptions,
      newEffectName
    );

    if (effectDescription) {
      effectDescription.parameterDefaultValues.forEach(({ name, value }) => {
        effect.setParameter(name, value);
      });
    }

    this.forceUpdate();
    this.props.onEffectsUpdated();
  };

  render() {
    const { effectsContainer } = this.props;

    return (
      <I18n>
        {({ i18n }) => {
          const allEffectDescriptions = getAllEffectDescriptions(i18n);

          const cantAddMoreEffects = effectsContainer.getEffectsCount() > 0;

          return (
            <Column noMargin expand>
              <Line>
                <Column>
                  <DismissableAlertMessage
                    identifier="effects-usage"
                    kind="info"
                  >
                    <Trans>
                      Effects can change how the layer is rendered on screen.
                      After adding an effect, set up its parameters. Launch a
                      preview to see the result. Using the events and the name
                      of the effect, you can change the parameters during the
                      game.
                    </Trans>
                  </DismissableAlertMessage>
                </Column>
              </Line>
              {mapFor(0, effectsContainer.getEffectsCount(), (i: number) => {
                const effect: gdEffect = effectsContainer.getEffectAt(i);
                const effectName = effect.getEffectName();
                const effectDescription = getEffectDescription(
                  allEffectDescriptions,
                  effectName
                );

                return (
                  <React.Fragment key={i}>
                    <MiniToolbar>
                      <Column expand noMargin>
                        <SemiControlledTextField
                          commitOnBlur
                          hintText={<Trans>Enter the effect name</Trans>}
                          value={effect.getName()}
                          onChange={newName => {
                            if (newName === effect.getName()) return;

                            effect.setName(newName);
                            this.forceUpdate();
                            this.props.onEffectsUpdated();
                          }}
                          fullWidth
                        />
                      </Column>
                      <Column expand>
                        <SelectField
                          value={effectName}
                          onChange={(e, i, newEffectName) =>
                            this._chooseEffectName(
                              allEffectDescriptions,
                              effect,
                              newEffectName
                            )
                          }
                          fullWidth
                          hintText={<Trans>Choose the effect to apply</Trans>}
                        >
                          {allEffectDescriptions.map(effectDescription => (
                            <MenuItem
                              key={effectDescription.name}
                              value={effectDescription.name}
                              primaryText={effectDescription.name}
                            />
                          ))}
                        </SelectField>
                      </Column>
                      <IconMenu
                        iconButtonElement={
                          <IconButton>
                            <MoreVertIcon />
                          </IconButton>
                        }
                        buildMenuTemplate={() => [
                          {
                            label: i18n._(t`Delete`),
                            click: () => this._removeEffect(effect.getName()),
                          },
                        ]}
                      />
                    </MiniToolbar>
                    <Line expand noMargin>
                      <Column expand>
                        {!!effectName && effectDescription ? (
                          <PropertiesEditor
                            instances={[effect]}
                            schema={effectDescription.schema}
                          />
                        ) : null}
                      </Column>
                    </Line>
                  </React.Fragment>
                );
              })}
              {effectsContainer.getEffectsCount() === 0 ? (
                <EmptyMessage>
                  <Trans>No effects applied.</Trans>
                </EmptyMessage>
              ) : null}
              <Column>
                <Line justifyContent="flex-end" alignItems="center" expand>
                  {cantAddMoreEffects && (
                    <BackgroundText style={{ marginRight: 4 }}>
                      <Trans>Only 1 effect is supported for now</Trans>
                    </BackgroundText>
                  )}
                  <RaisedButton
                    primary
                    label={<Trans>Add an effect</Trans>}
                    onClick={this._addEffect}
                    labelPosition="before"
                    icon={<Add />}
                    disabled={cantAddMoreEffects}
                  />
                </Line>
              </Column>
            </Column>
          );
        }}
      </I18n>
    );
  }
}
