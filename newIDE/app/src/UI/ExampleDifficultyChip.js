// @flow
import * as React from 'react';
import Chip from './Chip';
import StairesIcon from './CustomSvgIcons/Stairs';
import { Trans } from '@lingui/macro';

const styles = {
  chip: {
    marginRight: 2,
    marginBottom: 2,
  },
};

const makeFirstLetterUppercase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

type Props = {|
  codeSizeLevel: string,
|};

export const ExampleDifficultyChip = ({ codeSizeLevel }: Props) => {
  return (
    <Chip
      icon={<StairesIcon />}
      size="small"
      style={styles.chip}
      label={
        codeSizeLevel === 'simple' ? (
          <Trans>Simple</Trans>
        ) : codeSizeLevel === 'advanced' ? (
          <Trans>Advanced</Trans>
        ) : codeSizeLevel === 'expert' ? (
          <Trans>Expert</Trans>
        ) : (
          makeFirstLetterUppercase(codeSizeLevel)
        )
      }
      key="example-size-level"
    />
  );
};
