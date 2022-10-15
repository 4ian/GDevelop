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

const styles = {
  button: { width: '100%' },
  container: {
    display: 'flex',
    textAlign: 'left',
    overflow: 'hidden',
    padding: 8,
    width: '100%',
  },
};

type Props = {|
  project: gdProject,
  extensionShortHeader: ExtensionShortHeader,
  matches: ?Array<SearchMatch>,
  onChoose: () => void,
  onHeightComputed: number => void,
|};

export const ExtensionListItem = ({
  project,
  extensionShortHeader,
  matches,
  onChoose,
  onHeightComputed,
}: Props) => {
  const alreadyInstalled = project.hasEventsFunctionsExtensionNamed(
    extensionShortHeader.name
  );

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
    <ButtonBase onClick={onChoose} focusRipple style={styles.button}>
      <div style={styles.container} ref={containerRef}>
        <Line>
          <IconContainer
            alt={extensionShortHeader.fullName}
            src={extensionShortHeader.previewIconUrl}
            size={64}
          />
          <Column expand>
            <LineStackLayout noMargin alignItems="baseline">
              <Text noMargin>{renderExtensionField('fullName')} </Text>
              {alreadyInstalled && (
                <Chip
                  size="small"
                  label={<Trans>Already installed</Trans>}
                  color="secondary"
                  variant="outlined"
                />
              )}
              {extensionShortHeader.tier === 'community' && (
                <Chip
                  size="small"
                  label={<Trans>Community extension</Trans>}
                  color="primary"
                />
              )}
            </LineStackLayout>
            {extensionShortHeader.authors && (
              <Line>
                {extensionShortHeader.authors.map(author => (
                  <UserPublicProfileChip user={author} key={author.id} />
                ))}
              </Line>
            )}
            <Text noMargin size="body2">
              {renderExtensionField('shortDescription')}
            </Text>
          </Column>
        </Line>
      </div>
    </ButtonBase>
  );
};
