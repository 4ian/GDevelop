// @flow
import * as React from 'react';
import {
  type ExtensionShortHeader,
  getExtensionAuthor,
} from '../../Utils/GDevelopServices/Extension';
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

const styles = {
  button: { width: '100%' },
  container: {
    display: 'flex',
    textAlign: 'left',
    overflow: 'hidden',
    width: '100%',
  },
};

const getAuthorNameFromHeader = (
  extensionShortHeader: ExtensionShortHeader
): ?string => {
  if (extensionShortHeader.author) return extensionShortHeader.author;

  if (
    !extensionShortHeader.authors ||
    extensionShortHeader.authors.length === 0
  )
    return null;

  const authorNames = extensionShortHeader.authors
    .map(author => author.username || author.id)
    .filter(Boolean);

  return authorNames.length > 0 ? authorNames.join(', ') : null;
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
  const [authorName, setAuthorName] = React.useState<?string>(
    getAuthorNameFromHeader(extensionShortHeader)
  );

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

  React.useEffect(
    () => {
      let isCancelled = false;
      const headerAuthorName = getAuthorNameFromHeader(extensionShortHeader);
      setAuthorName(headerAuthorName);

      if (!headerAuthorName) {
        getExtensionAuthor(extensionShortHeader).then(loadedAuthorName => {
          if (isCancelled) return;
          setAuthorName(loadedAuthorName);
        });
      }

      return () => {
        isCancelled = true;
      };
    },
    [extensionShortHeader]
  );

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
        <LineStackLayout>
          <ListIcon
            src={extensionShortHeader.previewIconUrl}
            iconSize={32}
            padding={4}
            useExactIconSize
          />
          <Column expand>
            <LineStackLayout noMargin alignItems="center">
              <Text
                noMargin
                allowBrowserAutoTranslate={false}
                displayInlineAsSpan // Important to avoid the text to use a "p" which causes crashes with automatic translation tools with the highlighted text.
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
            </LineStackLayout>
            {authorName && (
              <Text
                noMargin
                size="body2"
                allowBrowserAutoTranslate={false}
                displayInlineAsSpan
                color={'secondary'}
              >
                <Trans>By {authorName}</Trans>
              </Text>
            )}
            <Text
              noMargin
              size="body2"
              allowBrowserAutoTranslate={false}
              displayInlineAsSpan // Important to avoid the text to use a "p" which causes crashes with automatic translation tools with the highlighted text.
              color={'secondary'}
            >
              {renderExtensionField('shortDescription')}
            </Text>
          </Column>
        </LineStackLayout>
      </div>
    </ButtonBase>
  );
};
