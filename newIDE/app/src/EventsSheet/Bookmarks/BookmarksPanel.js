// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import Background from '../../UI/Background';
import { Column, Line } from '../../UI/Grid';
import IconButton from '../../UI/IconButton';
import Text from '../../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';
import Star from '@material-ui/icons/Star';
import Delete from '@material-ui/icons/Delete';
import Cross from '../../UI/CustomSvgIcons/Cross';
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

const styles = {
  emptyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
};

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
      <Line noMargin>
        <Column expand>
          <LineStackLayout noMargin alignItems="center">
            <Star style={{ marginRight: 8 }} />
            <Text size="block-title">
              <Trans>Bookmarks</Trans>
            </Text>
          </LineStackLayout>
        </Column>
        <IconButton size="small" onClick={onClose}>
          <Cross />
        </IconButton>
      </Line>
      {bookmarks.length === 0 ? (
        <div style={styles.emptyContainer}>
          <EmptyMessage>
            <Trans>
              No bookmarks yet. Right-click on an event to add a bookmark.
            </Trans>
          </EmptyMessage>
        </div>
      ) : (
        <ScrollView>
          <ColumnStackLayout expand noMargin>
            {bookmarks.map(bookmark => (
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
                  <IconButton
                    size="small"
                    onClick={() => onNavigateToBookmark(bookmark)}
                    tooltip={t`Go to event`}
                  >
                    <ShareExternal />
                  </IconButton>
                  <Line expand noMargin alignItems="center">
                    <Column noMargin style={{ flex: '0 0 auto', minWidth: 100 }}>
                      <Text size="body-small" color="secondary" noMargin>
                        {getEventTypeDisplayName(bookmark.eventType)}
                      </Text>
                    </Column>
                    <Column expand noMargin>
                      <Text size="body" noMargin>
                        {bookmark.name}
                      </Text>
                    </Column>
                  </Line>
                  <IconButton
                    size="small"
                    onClick={() => onDeleteBookmark(bookmark.id)}
                    tooltip={t`Delete bookmark`}
                  >
                    <Delete />
                  </IconButton>
                </LineStackLayout>
              </Background>
            ))}
          </ColumnStackLayout>
        </ScrollView>
      )}
    </Background>
  );
};

export default BookmarksPanel;
