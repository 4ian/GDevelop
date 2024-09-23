// @flow
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { mapFor } from '../Utils/MapFor';
import Text from '../UI/Text';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { LineStackLayout } from '../UI/Layout';
import useForceUpdate from '../Utils/UseForceUpdate';

const gd: libGDevelop = global.gd;

const getVisibilityForProperty = (
  propertyName: string,
  propertiesQuickCustomizationVisibilities: gdQuickCustomizationVisibilitiesContainer
) => {
  return propertiesQuickCustomizationVisibilities.get(propertyName);
};

type Props = {|
  propertyNames: string[],
  open: boolean,
  onClose: () => void,
  propertiesQuickCustomizationVisibilities: gdQuickCustomizationVisibilitiesContainer,
|};

export default function QuickCustomizationPropertiesVisibilityDialog({
  open,
  onClose,
  propertyNames,
  propertiesQuickCustomizationVisibilities,
}: Props) {
  const forceUpdate = useForceUpdate();

  return (
    <Dialog
      title={<Trans>Quick Customization: Behavior properties</Trans>}
      secondaryActions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={false}
          onClick={onClose}
        />,
      ]}
      open
      onRequestClose={onClose}
      flexColumnBody
      fullHeight
    >
      {mapFor(0, propertyNames.length, i => {
        const propertyName = propertyNames[i];
        const value = getVisibilityForProperty(
          propertyName,
          propertiesQuickCustomizationVisibilities
        );

        return (
          <LineStackLayout
            key={propertyName}
            justifyContent="flex-start"
            alignItems="center"
          >
            <Text>{propertyName}</Text>
            <SelectField
              margin="none"
              value={value}
              onChange={(e, i, newValue: string) => {
                const newQuickCustomizationVisibility = parseInt(newValue, 10);
                if (
                  [
                    gd.QuickCustomization.Visible,
                    gd.QuickCustomization.Hidden,
                    gd.QuickCustomization.Default,
                  ].includes(newQuickCustomizationVisibility)
                ) {
                  propertiesQuickCustomizationVisibilities.set(
                    propertyName,
                    // $FlowIgnore: We checked that newQuickCustomizationVisibility is a valid visibility
                    newQuickCustomizationVisibility
                  );
                  forceUpdate();
                  return;
                }

                propertiesQuickCustomizationVisibilities.set(
                  propertyName,
                  gd.QuickCustomization.Default
                );
                forceUpdate();
              }}
            >
              <SelectOption
                value={gd.QuickCustomization.Default}
                label={t`Default`}
              />
              <SelectOption
                value={gd.QuickCustomization.Visible}
                label={t`Visible`}
              />
              <SelectOption
                value={gd.QuickCustomization.Hidden}
                label={t`Hidden`}
              />
            </SelectField>
          </LineStackLayout>
        );
      })}
    </Dialog>
  );
}
