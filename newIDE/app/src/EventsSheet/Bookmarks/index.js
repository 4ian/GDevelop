// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import Background from '../../UI/Background';
import { Column, Line } from '../../UI/Grid';
import IconButton from '../../UI/IconButton';
import Text from '../../UI/Text';
import { LineStackLayout, ColumnStackLayout } from '../../UI/Layout';
import StarBorder from '@material-ui/icons/StarBorder';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';
import Delete from '@material-ui/icons/Delete';
import Cross from '../../UI/CustomSvgIcons/Cross';
import { type Bookmark } from './BookmarksUtils';
import EmptyMessage from '../../UI/EmptyMessage';
import ScrollView from '../../UI/ScrollView';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import './BookmarksPanel.css';

type Props = {|
  bookmarks: Array<Bookmark>,
  onNavigateToBookmark: (bookmark: Bookmark) => void,
  onDeleteBookmark: (bookmarkId: string) => void,
  onClose: () => void,
  isOpen: boolean,
|};

const BookmarksPanel = ({
  bookmarks,
  onNavigateToBookmark,
  onDeleteBookmark,
  onClose,
  isOpen,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { isMobile } = useResponsiveWindowSize();

  // Handle keyboard shortcuts
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={`bookmarksPanelContainer ${isMobile ? 'mobile' : 'desktop'} ${isOpen ? 'open' : ''}`}
    >
      <Background  noExpand>
        <Line noMargin>
          <Column expand>
            <LineStackLayout noMargin alignItems="center">
              <StarBorder className="starIcon" />
              <Text size="block-title">
                <Trans>Bookmarks</Trans>
              </Text>
            </LineStackLayout>
          </Column>
          <IconButton size="small" onClick={onClose}>
            <Cross />
          </IconButton>
        </Line>
        <Background  expand>
          {bookmarks.length === 0 ? (
            <div className="emptyContainer">
              <EmptyMessage>
                <Trans>
                  No bookmarks yet. Right-click on an event and select "Add Bookmark" to bookmark it.
                </Trans>
              </EmptyMessage>
            </div>
          ) : (
            <ScrollView>
              <ColumnStackLayout noMargin>
                {bookmarks.map(bookmark => (
                    <div
                      key={bookmark.id}
                      className="bookmarkItem"
                      style={{
                        borderBottomColor: gdevelopTheme.toolbar.separatorColor,
                        borderLeft: bookmark.borderLeftColor ? '3px solid' : 'none',
                        paddingLeft: bookmark.borderLeftColor ? '5px' : '4px',
                        ...(bookmark.borderLeftColor && {
                          borderLeftColor: bookmark.borderLeftColor,
                        }),
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => onNavigateToBookmark(bookmark)}
                        tooltip={t`Go to event`}
                      >
                        <ShareExternal />
                      </IconButton>
                      <Text noMargin className="bookmarkItemName">
                        {bookmark.name}
                      </Text>
                      <IconButton
                        size="small"
                        onClick={() => onDeleteBookmark(bookmark.id)}
                        tooltip={t`Delete bookmark`}
                      >
                        <Delete />
                      </IconButton>
                    </div>
                  )
                )}
              </ColumnStackLayout>
            </ScrollView>
          )}
        </Background>
      </Background>
    </div>
  );
};

export default BookmarksPanel;
