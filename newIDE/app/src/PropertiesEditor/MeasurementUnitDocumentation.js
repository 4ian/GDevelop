// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Column } from '../UI/Grid';
import Text from '../UI/Text';

// Strings are used instead of gdMeasurementUnit
// because the C++ instances would be dead when the component is rendered.
//
// The gdMeasurementUnit instances are only living during their iteration on
// the properties when building the property editor view. As the rendering of
// MeasurementUnitDocumentation is done outside of this loop, the memory
// referenced by the gdMeasurementUnit instance has been reused and it displays
// wrong values.
type Props = {|
  label: string,
  description: string,
  elementsWithWords: string,
|};

export default function MeasurementUnitDocumentation({
  label,
  description,
  elementsWithWords,
}: Props) {
  return (
    <Column noMargin>
      <Text size="sub-title">{label}</Text>
      {description && <Text size="body">{description}</Text>}
      {elementsWithWords && (
        <Text size="body">
          <i>
            <Trans>{`in ${elementsWithWords}`}</Trans>
          </i>
        </Text>
      )}
    </Column>
  );
}
