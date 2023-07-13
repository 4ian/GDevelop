// @flow
import * as React from 'react';
import { type BehaviorShortHeader } from '../../Utils/GDevelopServices/Extension';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import { Column } from '../../UI/Grid';
import { IconContainer } from '../../UI/IconContainer';
import HighlightedText from '../../UI/Search/HighlightedText';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import Chip from '../../UI/Chip';
import { LineStackLayout } from '../../UI/Layout';
import { type SearchableBehaviorMetadata } from './BehaviorStoreContext';

const styles = {
  button: { width: '100%' },
  container: {
    display: 'flex',
    textAlign: 'left',
    overflow: 'hidden',
    width: '100%',
  },
  icon: {
    paddingTop: 4,
  },
};

type Props = {|
  id?: string,
  objectType: string,
  objectBehaviorsTypes: Array<string>,
  behaviorShortHeader: BehaviorShortHeader | SearchableBehaviorMetadata,
  matches: ?Array<SearchMatch>,
  onChoose: () => void,
  onHeightComputed: number => void,
|};

export const BehaviorListItem = ({
  id,
  objectType,
  objectBehaviorsTypes,
  behaviorShortHeader,
  matches,
  onChoose,
  onHeightComputed,
}: Props) => {
  const alreadyAdded = objectBehaviorsTypes.includes(behaviorShortHeader.type);
  // An empty object type means the base object, i.e: any object.
  const isObjectIncompatible =
    behaviorShortHeader.objectType &&
    objectType !== behaviorShortHeader.objectType;

  // Report the height of the item once it's known.
  const containerRef = React.useRef<?HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (containerRef.current)
      onHeightComputed(containerRef.current.getBoundingClientRect().height);
  });

  const renderField = (field: 'description' | 'fullName') => {
    const originalField = behaviorShortHeader[field];

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
          <div style={styles.icon}>
            <IconContainer
              alt={behaviorShortHeader.fullName}
              src={behaviorShortHeader.previewIconUrl}
              size={32}
            />
          </div>
          <Column expand>
            <LineStackLayout noMargin alignItems="baseline">
              <Text
                noMargin
                allowBrowserAutoTranslate={false}
                displayInlineAsSpan // Important to avoid the text to use a "p" which causes crashes with automatic translation tools with the highlighted text.
              >
                {renderField('fullName')}
              </Text>
              {alreadyAdded && (
                <Chip
                  size="small"
                  label={<Trans>Already added</Trans>}
                  color="secondary"
                  variant="outlined"
                />
              )}
              {isObjectIncompatible && (
                <Chip
                  size="small"
                  label={<Trans>Incompatible with the object</Trans>}
                  color="secondary"
                  variant="outlined"
                />
              )}
              {behaviorShortHeader.tier === 'community' && (
                <Chip
                  size="small"
                  label={<Trans>Community-made</Trans>}
                  color="primary"
                />
              )}
              {behaviorShortHeader.isDeprecated && (
                <Chip
                  size="small"
                  label={<Trans>Deprecated</Trans>}
                  color="primary"
                />
              )}
            </LineStackLayout>
            <Text
              noMargin
              size="body2"
              allowBrowserAutoTranslate={false}
              displayInlineAsSpan // Important to avoid the text to use a "p" which causes crashes with automatic translation tools with the highlighted text.
            >
              {renderField('description')}
            </Text>
          </Column>
        </LineStackLayout>
      </div>
    </ButtonBase>
  );
};
