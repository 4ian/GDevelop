// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Column } from '../UI/Grid';
import Text from '../UI/Text';

// Strings are used instead of gdMeasurementUnit
// because the C++ instance would be dead when the component is rendered.
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
