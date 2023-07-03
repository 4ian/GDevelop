// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
import ListIcon from '../../UI/ListIcon';
import Checkbox from '../../UI/Checkbox';
import useForceUpdate from '../../Utils/UseForceUpdate';

type Props = {|
  objectType: gdObjectType,
|};

export default function CapabilitiesEditor({ objectType }: Props) {
  const forceUpdate = useForceUpdate();

  const setCapability = React.useCallback(
    (capability, hasCapability) => {
      if (hasCapability) {
        objectType.addCapability(capability);
      } else {
        objectType.removeCapability(capability);
      }
      forceUpdate();
    },
    [forceUpdate, objectType]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          <ResponsiveLineStackLayout noMargin>
            <Checkbox
              label={
                <LineStackLayout noMargin alignItems="center">
                  <ListIcon
                    iconSize={24}
                    src={'res/actions/scale24_black.png'}
                  />
                  <Trans>Resizable</Trans>
                </LineStackLayout>
              }
              checked={objectType.hasCapability('resizable')}
              onCheck={(e, checked) => setCapability('resizable', checked)}
            />
            <Checkbox
              label={
                <LineStackLayout noMargin alignItems="center">
                  <ListIcon
                    iconSize={24}
                    src={'res/actions/scale24_black.png'}
                  />
                  <Trans>Scalable</Trans>
                </LineStackLayout>
              }
              checked={objectType.hasCapability('scalable')}
              onCheck={(e, checked) => setCapability('scalable', checked)}
            />
            <Checkbox
              label={
                <LineStackLayout noMargin alignItems="center">
                  <ListIcon iconSize={24} src={'res/actions/flipX24.png'} />
                  <Trans>Flippable</Trans>
                </LineStackLayout>
              }
              checked={objectType.hasCapability('flippable')}
              onCheck={(e, checked) => setCapability('flippable', checked)}
            />
            <Checkbox
              label={
                <LineStackLayout noMargin alignItems="center">
                  <ListIcon
                    iconSize={24}
                    src={'res/conditions/animation24.png'}
                  />
                  <Trans>Animable</Trans>
                </LineStackLayout>
              }
              checked={objectType.hasCapability('animable')}
              onCheck={(e, checked) => setCapability('animable', checked)}
            />
          </ResponsiveLineStackLayout>
        </ColumnStackLayout>
      )}
    </I18n>
  );
}
