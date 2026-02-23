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

type Props = {|
  bookmarks: Array<Bookmark>,
  onNavigateToBookmark: (bookmark: Bookmark) => void,
  onDeleteBookmark: (bookmarkId: string) => void,
  onRenameBookmark: (bookmarkId: string, newName: string) => void,
  onFocusBookmark?: ?(bookmark: Bookmark) => void,
  onClose: () => void,
  isOpen: boolean,
|};

const DRAWER_WIDTH = 280;
const BOTTOM_PANEL_HEIGHT = 300;

const getDrawerContainerStyle = (isMobile: boolean, isOpen: boolean) => ({
  position: isMobile ? 'fixed' : 'absolute',
  ...(isMobile
    ? {
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: BOTTOM_PANEL_HEIGHT,
        transform: isOpen ? 'translateY(0)' : `translateY(${BOTTOM_PANEL_HEIGHT}px)`,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.2)',
      }
    : {
        top: 0,
        right: 0,
        height: '100%',
        width: DRAWER_WIDTH,
        transform: isOpen ? 'translateX(0%)' : 'translateX(100%)',
        boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
      }),
  zIndex: 10,
  transition: 'transform 0.3s ease-in-out',
  display: 'flex',
  flexDirection: 'column',
  pointerEvents: 'auto',
});

const styles = {
  backgroundWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  emptyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '20px',
  },
};

const BookmarksPanel = ({
  bookmarks,
  onNavigateToBookmark,
  onDeleteBookmark,
  onRenameBookmark,
  onFocusBookmark,
  onClose,
  isOpen,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { isMobile } = useResponsiveWindowSize();

  return (
    <div
      style={getDrawerContainerStyle(isMobile, isOpen)}
    >
      <Background  noExpand>
        <Line noMargin>
          <Column expand>
            <LineStackLayout noMargin alignItems="center">
              <StarBorder style={{ marginRight: 8 }} />
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
            <div style={styles.emptyContainer}>
              <EmptyMessage>
                <Trans>
                  No bookmarks yet. Right-click on an event to add it as bookmark.
                </Trans>
              </EmptyMessage>
            </div>
          ) : (
            <ScrollView>
              <ColumnStackLayout noMargin>
                {bookmarks.map(bookmark => {
                  const rgbColor = bookmark.color
                    ? `rgb(${bookmark.color.replace(/;/g, ',')})`
                    : null;

                  return (
                    <div
                      key={bookmark.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 4px',
                        borderBottom: `1px solid ${gdevelopTheme.toolbar.separatorColor}`,
                        borderLeft: rgbColor ? `3px solid ${rgbColor}` : 'none',
                        paddingLeft: rgbColor ? '5px' : '4px',
                        gap: '4px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => {
                          onNavigateToBookmark(bookmark);
                          if (onFocusBookmark) {
                            onFocusBookmark(bookmark);
                          }
                        }}
                        tooltip={t`Go to event`}
                      >
                        <ShareExternal />
                      </IconButton>
                      <Text noMargin style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                  );
                })}
              </ColumnStackLayout>
            </ScrollView>
          )}
        </Background>
      </Background>
    </div>
  );
};

export default BookmarksPanel;
