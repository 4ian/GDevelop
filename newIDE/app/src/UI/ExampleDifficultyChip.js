// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Chip from './Chip';
import StairsIcon from './CustomSvgIcons/Stairs';
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
  difficultyLevel: string,
|};

export const ExampleDifficultyChip = ({ difficultyLevel }: Props) => {
  const theme = React.useContext(GDevelopThemeContext);
  const color: ?string = theme.example.difficulty.color[difficultyLevel];

  return (
    <Chip
      icon={<StairsIcon style={{ color }} />}
      size="small"
      style={{
        ...styles.chip,
        border: color ? `1px solid ${color}` : undefined,
      }}
      label={
        difficultyLevel === 'simple' ? (
          <Trans>Simple</Trans>
        ) : difficultyLevel === 'advanced' ? (
          <Trans>Advanced</Trans>
        ) : difficultyLevel === 'expert' ? (
          <Trans>Expert</Trans>
        ) : (
          makeFirstLetterUppercase(difficultyLevel)
        )
      }
      key="example-size-level"
    />
  );
};
