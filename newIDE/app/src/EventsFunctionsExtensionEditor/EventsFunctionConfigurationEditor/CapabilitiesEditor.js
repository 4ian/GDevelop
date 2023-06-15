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

type Props = {|
  resizable: boolean,
  scalable: boolean,
  flippable: boolean,
  animable: boolean,
  onResizableChange: (resizable: boolean) => void,
  onScalableChange: (scalable: boolean) => void,
  onFlippableChange: (flippable: boolean) => void,
  onAnimableChange: (animable: boolean) => void,
|};

export default function CapabilitiesEditor({
  resizable,
  scalable,
  flippable,
  animable,
  onResizableChange,
  onScalableChange,
  onFlippableChange,
  onAnimableChange,
}: Props) {
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
              checked={resizable}
              onCheck={(e, checked) => onResizableChange(checked)}
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
              checked={scalable}
              onCheck={(e, checked) => onScalableChange(checked)}
            />
            <Checkbox
              label={
                <LineStackLayout noMargin alignItems="center">
                  <ListIcon iconSize={24} src={'res/actions/flipX24.png'} />
                  <Trans>Flippable</Trans>
                </LineStackLayout>
              }
              checked={flippable}
              onCheck={(e, checked) => onFlippableChange(checked)}
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
              checked={animable}
              onCheck={(e, checked) => onAnimableChange(checked)}
            />
          </ResponsiveLineStackLayout>
        </ColumnStackLayout>
      )}
    </I18n>
  );
}
