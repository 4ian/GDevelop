// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Chip from './Chip';
import HeadphonesIcon from './CustomSvgIcons/Headphones';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';

const styles = {
  chip: {
    marginRight: 2,
    marginBottom: 2,
    background: 'none',
  },
};

const makeFirstLetterUppercase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

type Props = {|
  codeSizeLevel: string,
|};

export const ExampleDifficultyChip = ({ codeSizeLevel }: Props) => {
  const theme = React.useContext(GDevelopThemeContext);
  const color: ?string = theme.example.difficulty.color[codeSizeLevel];

  return (
    <Chip
      icon={<HeadphonesIcon style={{ color }} />}
      size="small"
      style={{
        ...styles.chip,
        border: color ? `1px solid ${color}` : undefined,
      }}
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
