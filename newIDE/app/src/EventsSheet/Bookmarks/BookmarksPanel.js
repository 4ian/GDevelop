// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import Background from '../../UI/Background';
import { Column, Line } from '../../UI/Grid';
import IconButton from '../../UI/IconButton';
import TextField from '../../UI/TextField';
import Text from '../../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import Cross from '../../UI/CustomSvgIcons/Cross';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import Star from '@material-ui/icons/Star';
import Delete from '@material-ui/icons/Delete';
import { type Bookmark } from './BookmarksUtils';
import EmptyMessage from '../../UI/EmptyMessage';
import ScrollView from '../../UI/ScrollView';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';

type Props = {|
  bookmarks: Array<Bookmark>,
  onNavigateToBookmark: (bookmark: Bookmark) => void,
  onDeleteBookmark: (bookmarkId: string) => void,
  onRenameBookmark: (bookmarkId: string, newName: string) => void,
  onClose: () => void,
|};

const BookmarksPanel = ({
  bookmarks,
  onNavigateToBookmark,
  onDeleteBookmark,
  onRenameBookmark,
  onClose,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const getEventTypeDisplayName = (eventType: string): string => {
    const typeMap = {
      'BuiltinCommonInstructions::Standard': 'Standard Event',
      'BuiltinCommonInstructions::Comment': 'Comment',
      'BuiltinCommonInstructions::Group': 'Group',
      'BuiltinCommonInstructions::While': 'While',
      'BuiltinCommonInstructions::Repeat': 'Repeat',
      'BuiltinCommonInstructions::ForEach': 'For Each',
      'BuiltinCommonInstructions::Link': 'Link',
    };

    return (
      typeMap[eventType] ||
      eventType
        .replace('BuiltinCommonInstructions::', '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
    );
  };

  return (
    <Background noFullHeight noExpand>
      <Column expand noMargin>
        <Line>
          <Column expand>
            <Text size="block-title">
              <Trans>Bookmarks</Trans>
            </Text>
          </Column>
          <IconButton size="small" onClick={onClose}>
            <Cross />
          </IconButton>
        </Line>
        <ScrollView>
          <ColumnStackLayout expand noMargin>
            {bookmarks.length === 0 ? (
              <EmptyMessage>
                <Trans>
                  No bookmarks yet. Right-click on an event to add a bookmark.
                </Trans>
              </EmptyMessage>
            ) : (
              bookmarks.map(bookmark => (
                <Background
                  key={bookmark.id}
                  noExpand
                  noFullHeight
                  noMargin
                  style={{
                    padding: 8,
                    borderRadius: 4,
                    border: `1px solid ${gdevelopTheme.toolbar.separatorColor}`,
                  }}
                >
                  <LineStackLayout noMargin alignItems="center">
                    <Star
                      style={{
                        width: 20,
                        height: 20,
                        color: gdevelopTheme.palette.secondary,
                        flexShrink: 0,
                      }}
                    />
                    <Column expand noMargin>
                      <TextField
                        value={bookmark.name}
                        onChange={(e, value) =>
                          onRenameBookmark(bookmark.id, value)
                        }
                        fullWidth
                        margin="none"
                        translatableHintText={t`Bookmark name`}
                      />
                      <Text size="body-small" color="secondary">
                        {getEventTypeDisplayName(bookmark.eventType)}
                      </Text>
                    </Column>
                    <IconButton
                      size="small"
                      onClick={() => onNavigateToBookmark(bookmark)}
                      tooltip={t`Go to event`}
                    >
                      <ChevronArrowRight />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDeleteBookmark(bookmark.id)}
                      tooltip={t`Delete bookmark`}
                    >
                      <Delete />
                    </IconButton>
                  </LineStackLayout>
                </Background>
              ))
            )}
          </ColumnStackLayout>
        </ScrollView>
      </Column>
    </Background>
  );
};

export default BookmarksPanel;
