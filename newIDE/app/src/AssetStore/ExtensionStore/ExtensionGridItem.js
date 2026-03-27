// @flow
import * as React from 'react';
import { type ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import HighlightedText from '../../UI/Search/HighlightedText';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import Chip from '../../UI/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '../../UI/IconButton';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import Star from '@material-ui/icons/Star';
import StarBorder from '@material-ui/icons/StarBorder';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import ListIcon from '../../UI/ListIcon';

const styles = {
  container: {
    height: '100%',
    padding: 1,
  },
  button: {
    width: '100%',
    height: '100%',
    minHeight: 240,
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    minHeight: 240,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    transition: 'background-color 0.2s ease-in-out',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 12,
    minHeight: 80,
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    paddingTop: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  favoriteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 2,
  },
  ribbonBadge: {
    position: 'absolute',
    top: 20,
    left: -36,
    transform: 'rotate(-45deg)',
    color: '#fff',
    padding: '5px 42px',
    fontSize: '0.65rem',
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: '1.2',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

type Props = {|
  id?: string,
  project: gdProject,
  extensionShortHeader: ExtensionShortHeader,
  matches: ?Array<SearchMatch>,
  onChoose: () => void,
  onHeightComputed: number => void,
|};

export const ExtensionGridItem = ({
  id,
  project,
  extensionShortHeader,
  matches,
  onChoose,
  onHeightComputed,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const preferences = React.useContext(PreferencesContext);

  const alreadyInstalled = project.hasEventsFunctionsExtensionNamed(
    extensionShortHeader.name
  );

  // Test if the local extension comes from the Asset Store
  const fromStore = alreadyInstalled
    ? project
        .getEventsFunctionsExtension(extensionShortHeader.name)
        .getOriginName() === 'gdevelop-extension-store'
    : false;

  // Report the height of the item once it's known.
  const containerRef = React.useRef<?HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (containerRef.current)
      onHeightComputed(
        Math.ceil(containerRef.current.getBoundingClientRect().height)
      );
  });

  const renderExtensionField = (field: 'shortDescription' | 'fullName') => {
    const originalField = extensionShortHeader[field];

    if (!matches) return originalField;
    const nameMatches = matches.filter(match => match.key === field);
    if (nameMatches.length === 0) return originalField;

    return (
      <HighlightedText
        text={originalField}
        matchesCoordinates={nameMatches[0].indices}
      />
    );
  };

  const [hover, setHover] = React.useState(false);

  const isFavorite = preferences.isFavoriteExtension(extensionShortHeader.name);

  const handleFavoriteClick = (event: any) => {
    event.stopPropagation();
    if (isFavorite) {
      preferences.removeFavoriteExtension(extensionShortHeader.name);
    } else {
      preferences.addFavoriteExtension(extensionShortHeader.name);
    }
  };

  return (
    <div ref={containerRef} style={styles.container}>
      <ButtonBase style={styles.button} onClick={onChoose} focusRipple>
        <div
          style={{
            ...styles.cardContainer,
            backgroundColor: hover
              ? gdevelopTheme.list.hover.backgroundColor
              : gdevelopTheme.list.itemsBackgroundColor,
          }}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
        >
          {alreadyInstalled && (
            <div
              style={{
                ...styles.ribbonBadge,
                backgroundColor: '#6c5ce7',
                color: '#ffffff',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontWeight: 700,
              }}
            >
              {fromStore ? <Trans>INSTALLED</Trans> : <Trans>IN PROJECT</Trans>}
            </div>
          )}

          {(hover || isFavorite) && (
            <div style={styles.favoriteButton}>
              <Tooltip
                title={
                  isFavorite ? (
                    <Trans>Remove from favorites</Trans>
                  ) : (
                    <Trans>Add to favorites</Trans>
                  )
                }
              >
                <IconButton size="small" onClick={handleFavoriteClick}>
                  {isFavorite ? (
                    <Star style={{ color: '#FFD700' }} />
                  ) : (
                    <StarBorder />
                  )}
                </IconButton>
              </Tooltip>
            </div>
          )}

          <div style={styles.iconContainer}>
            <ListIcon
              src={extensionShortHeader.previewIconUrl}
              iconSize={64}
              useExactIconSize
            />
          </div>

          <div style={styles.contentContainer}>
            <div style={{ minHeight: 36 }}>
              <Text
                noMargin
                allowBrowserAutoTranslate={false}
                size="body2"
                style={{
                  fontWeight: 500,
                  textAlign: 'center',
                  lineHeight: '1.3',
                }}
              >
                {renderExtensionField('fullName')}
              </Text>
            </div>

            {extensionShortHeader.tier === 'experimental' && (
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  minHeight: 24,
                }}
              >
                <Chip
                  size="small"
                  label={<Trans>Experimental</Trans>}
                  color="primary"
                />
              </div>
            )}

            <div style={{ flex: 1, minHeight: 40 }}>
              <Text
                noMargin
                size="body2"
                allowBrowserAutoTranslate={false}
                color="secondary"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  lineHeight: '1.4',
                }}
              >
                {renderExtensionField('shortDescription')}
              </Text>
            </div>
          </div>
        </div>
      </ButtonBase>
    </div>
  );
};
