// @flow
import * as React from 'react';
import { type ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../UI/Grid';
import { IconContainer } from '../../UI/IconContainer';
import { UserPublicProfileChip } from '../../UI/User/UserPublicProfileChip';
import HighlightedText from '../../UI/Search/HighlightedText';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import Chip from '../../UI/Chip';
import { LineStackLayout } from '../../UI/Layout';
import ListIcon from '../../UI/ListIcon';
import Tooltip from '@material-ui/core/Tooltip';
import CircledInfo from '../../UI/CustomSvgIcons/SmallCircledInfo';
import IconButton from '../../UI/IconButton';

const styles = {
  button: { width: '100%' },
  container: {
    display: 'flex',
    textAlign: 'left',
    overflow: 'hidden',
    width: '100%',
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
}: Props) => {
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
      onHeightComputed(containerRef.current.getBoundingClientRect().height);
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

  return (
    <ButtonBase id={id} onClick={onChoose} focusRipple style={styles.button}>
      <div style={styles.container} ref={containerRef}>
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
            <Text
              noMargin
              size="body2"
              allowBrowserAutoTranslate={false}
              displayInlineAsSpan // Important to avoid the text to use a "p" which causes crashes with automatic translation tools with the highlighted text.
            >
              {renderExtensionField('shortDescription')}
            </Text>
          </Column>
        </LineStackLayout>
      </div>
    </ButtonBase>
  );
};
