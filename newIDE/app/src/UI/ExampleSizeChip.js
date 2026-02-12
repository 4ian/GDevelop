// @flow
import * as React from 'react';
import Chip from './Chip';
import SizeIcon from '@material-ui/icons/PhotoSizeSelectSmall';
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

export const ExampleSizeChip = ({ codeSizeLevel }: Props) => {
  return (
    <Chip
      icon={<SizeIcon />}
      size="small"
      style={styles.chip}
      label={
        codeSizeLevel === 'tiny' ? (
          <Trans>Tiny</Trans>
        ) : codeSizeLevel === 'small' ? (
          <Trans>Short</Trans>
        ) : codeSizeLevel === 'medium' ? (
          <Trans>Medium</Trans>
        ) : codeSizeLevel === 'big' ? (
          <Trans>Long</Trans>
        ) : codeSizeLevel === 'huge' ? (
          <Trans>Huge</Trans>
        ) : (
          makeFirstLetterUppercase(codeSizeLevel)
        )
      }
      key="example-size-level"
    />
  );
};
