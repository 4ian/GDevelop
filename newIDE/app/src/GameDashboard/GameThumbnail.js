// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import EmptyMessage from '../UI/EmptyMessage';
import Paper from '../UI/Paper';

const styles = {
  image: {
    display: 'block',
    objectFit: 'cover',
  },
  thumbnail: {
    // 16/9 format
    width: 272,
    height: 153,
  },
};

type Props = {|
  thumbnailUrl?: string,
  gameName: string,
|};

export const GameThumbnail = ({ thumbnailUrl, gameName }: Props) =>
  thumbnailUrl ? (
    <img
      src={thumbnailUrl}
      style={{
        ...styles.image,
        ...styles.thumbnail,
      }}
      alt={gameName}
      title={gameName}
    />
  ) : (
    <Paper
      variant="outlined"
      style={{
        ...styles.thumbnail,
        whiteSpace: 'normal',
        display: 'flex',
      }}
      background="light"
    >
      <EmptyMessage>
        <Trans>No thumbnail set</Trans>
      </EmptyMessage>
    </Paper>
  );
