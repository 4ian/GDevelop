// @flow
import * as React from 'react';
import { type ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../UI/Grid';
import { UserPublicProfileChip } from '../../UI/User/UserPublicProfileChip';
import HighlightedText from '../../UI/Search/HighlightedText';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import Chip from '../../UI/Chip';
import { LineStackLayout } from '../../UI/Layout';
import ListIcon from '../../UI/ListIcon';
import Tooltip from '@material-ui/core/Tooltip';
import CircledInfo from '../../UI/CustomSvgIcons/SmallCircledInfo';
import IconButton from '../../UI/IconButton';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import Star from '@material-ui/icons/Star';
import StarBorder from '@material-ui/icons/StarBorder';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';

const styles = {
  button: { width: '100%', height: '100%' },
  container: {
    display: 'flex',
    textAlign: 'left',
    overflow: 'hidden',
    width: '100%',
    height: 96,
    minHeight: 96,
    boxSizing: 'border-box',
    padding: '6px 10px',
  },
  contentColumn: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    minWidth: 0,
    flexShrink: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  description: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: '1.4',
    minHeight: '2.8em',
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

export const ExtensionListItem = ({
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
    <ButtonBase id={id} onClick={onChoose} focusRipple style={styles.button}>
      <div
        style={
          hover
            ? { ...styles.container, ...gdevelopTheme.list.hover }
            : styles.container
        }
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        ref={containerRef}
      >
        <LineStackLayout useFullHeight alignItems="center">
          <ListIcon
            src={extensionShortHeader.previewIconUrl}
            iconSize={32}
            padding={4}
            useExactIconSize
          />
          <Column expand noOverflowParent>
            <div style={styles.contentColumn}>
              <LineStackLayout noMargin alignItems="center" overflow="hidden">
                <Text
                  noMargin
                  allowBrowserAutoTranslate={false}
                  displayInlineAsSpan // Important to avoid the text to use a "p" which causes crashes with automatic translation tools with the highlighted text.
                  style={styles.title}
                >
                  {renderExtensionField('fullName')}
                </Text>
                {alreadyInstalled && (
                  <Chip
                    size="small"
                    label={
                      fromStore ? (
                        <Trans>Already installed</Trans>
                      ) : (
                        <Trans>Already in project</Trans>
                      )
                    }
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {extensionShortHeader.tier === 'experimental' && (
                  <Chip
                    size="small"
                    label={<Trans>Experimental extension</Trans>}
                    color="primary"
                  />
                )}
                {extensionShortHeader.authors && (
                  <Tooltip
                    title={
                      extensionShortHeader.authors.length > 0 ? (
                        <Line>
                          <div style={{ flexWrap: 'wrap' }}>
                            {extensionShortHeader.authors.map(author => (
                              <UserPublicProfileChip
                                user={author}
                                key={author.id}
                                variant="outlined"
                              />
                            ))}
                          </div>
                        </Line>
                      ) : (
                        ''
                      )
                    }
                  >
                    <IconButton size="small">
                      <CircledInfo />
                    </IconButton>
                  </Tooltip>
                )}
                {(hover || isFavorite) && (
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
                )}
              </LineStackLayout>
              <Text
                noMargin
                size="body2"
                allowBrowserAutoTranslate={false}
                displayInlineAsSpan // Important to avoid the text to use a "p" which causes crashes with automatic translation tools with the highlighted text.
                color={'secondary'}
                style={styles.description}
              >
                {renderExtensionField('shortDescription')}
              </Text>
            </div>
          </Column>
        </LineStackLayout>
      </div>
    </ButtonBase>
  );
};
