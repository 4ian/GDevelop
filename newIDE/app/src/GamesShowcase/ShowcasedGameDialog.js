// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../UI/Text';
import { type ShowcasedGame } from '../Utils/GDevelopServices/Game';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import TagChips from '../UI/TagChips';
import { MarkdownText } from '../UI/MarkdownText';
import { Column, Spacer } from '../UI/Grid';
import { CorsAwareImage } from '../UI/CorsAwareImage';

import ShowcasedGameButton from './ShowcasedGameButtons';
import ShowcasedGameTitle from './ShowcasedGameTitle';

const styles = {
  image: { width: '100%', maxHeight: '300px', objectFit: 'cover' },
};

const ShowcasedGameDialog = ({
  open,
  onClose,
  showcasedGame,
}: {|
  open: boolean,
  onClose: () => void,
  showcasedGame: ShowcasedGame,
|}): React.Node => {
  return (
    <Dialog
      maxWidth="xs"
      open={open}
      actions={[
        <FlatButton
          label={<Trans>Close</Trans>}
          key="close"
          primary={false}
          onClick={onClose}
        />,
      ]}
      onRequestClose={onClose}
    >
      <Column noMargin expand>
        <CorsAwareImage
          style={styles.image}
          src={showcasedGame.thumbnailUrl}
          alt={showcasedGame.title}
        />
        <ShowcasedGameTitle showcasedGame={showcasedGame} forceColumn />
        {showcasedGame.genres.length ? (
          <TagChips tags={showcasedGame.genres} />
        ) : null}
        <Text size="body2" displayInlineAsSpan>
          <MarkdownText source={showcasedGame.description} allowParagraphs />
        </Text>
        <Spacer />
        <ShowcasedGameButton showcasedGame={showcasedGame} forceColumn />
      </Column>
    </Dialog>
  );
};

export default ShowcasedGameDialog;
