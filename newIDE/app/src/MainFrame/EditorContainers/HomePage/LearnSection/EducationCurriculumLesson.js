// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import capitalize from 'lodash/capitalize';
import { type Limits } from '../../../../Utils/GDevelopServices/Usage';
import {
  type Tutorial,
  canAccessTutorial,
} from '../../../../Utils/GDevelopServices/Tutorial';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import { CorsAwareImage } from '../../../../UI/CorsAwareImage';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';
import Lock from '../../../../UI/CustomSvgIcons/Lock';
import Text from '../../../../UI/Text';
import RaisedButton from '../../../../UI/RaisedButton';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import Chip from '../../../../UI/Chip';

const rankLabel = {
  '1': <Trans>1st</Trans>,
  '2': <Trans>2nd</Trans>,
  '3': <Trans>3rd</Trans>,
  '4': <Trans>4th</Trans>,
  '5': <Trans>5th</Trans>,
  '6': <Trans>6th</Trans>,
  '7': <Trans>7th</Trans>,
  '8': <Trans>8th</Trans>,
  '9': <Trans>9th</Trans>,
  '10': <Trans>10th</Trans>,
};

const styles = {
  container: { maxWidth: 900 },
  thumbnail: {
    display: 'block', // Display as a block to prevent cumulative layout shift.
    objectFit: 'cover',
    verticalAlign: 'middle',
    borderRadius: 8,
    width: '100%',
    border: '1px solid lightgrey',
    boxSizing: 'border-box', // Take border in account for sizing to avoid cumulative layout shift.
    // Prevent cumulative layout shift by enforcing
    // the 16:9 ratio.
    aspectRatio: '16 / 9',
    transition: 'opacity 0.3s ease-in-out',
  },
  lockerImage: { height: 80, width: 80 },
  lockedOverlay: {
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.6)',
    inset: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  desktopImageContainer: {
    maxWidth: 250,
    minWidth: 200,
  },
  mobileImageContainer: {
    width: '100%',
  },
  tagsContainer: {
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 2,
    marginBottom: 2,
  },
};

const LockedOverlay = () => (
  <div style={styles.lockedOverlay}>
    <Lock style={styles.lockerImage} />
  </div>
);

type Props = {|
  i18n: I18nType,
  limits: ?Limits,
  tutorial: Tutorial,
  onSelectTutorial: (tutorial: Tutorial) => void,
|};

const EducationCurriculumLesson = ({
  i18n,
  tutorial,
  limits,
  onSelectTutorial,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const [isImageLoaded, setIsImageLoaded] = React.useState<boolean>(false);
  const isLocked = limits
    ? !canAccessTutorial(tutorial, limits.capabilities)
    : false;

  const title = (
    <LineStackLayout noMargin alignItems="center">
      <Chip
        size="small"
        color="secondary"
        label={rankLabel[Math.floor(Math.random() * 9 + 1).toString()]}
      />
      <Text size="block-title" noMargin>
        {selectMessageByLocale(i18n, tutorial.titleByLocale)}
      </Text>
    </LineStackLayout>
  );
  return (
    <div style={styles.container}>
      <ResponsiveLineStackLayout
        alignItems="stretch"
        noColumnMargin
        noMargin
        expand
      >
        {isMobile && title}
        <div
          style={{
            ...styles.imageContainer,
            ...(isMobile
              ? styles.mobileImageContainer
              : styles.desktopImageContainer),
          }}
        >
          <CorsAwareImage
            style={{
              // Once ready, animate the image display.
              opacity: isImageLoaded ? 1 : 0,
              ...styles.thumbnail,
            }}
            src={selectMessageByLocale(i18n, tutorial.thumbnailUrlByLocale)}
            alt={`Lesson thumbnail`}
            onLoad={() => setIsImageLoaded(true)}
          />
          {isLocked && <LockedOverlay />}
        </div>
        <ColumnStackLayout justifyContent="space-between" noMargin expand>
          <ColumnStackLayout noMargin expand>
            {!isMobile && title}
            <div style={styles.tagsContainer}>
              {['Multiplayer', 'Tag', 'Other tag'].map(tag => (
                <Chip
                  size="small"
                  style={styles.chip}
                  label={capitalize(tag)}
                  key={tag}
                  textColor="secondary"
                />
              ))}
            </div>
            <Text noMargin>
              {selectMessageByLocale(i18n, tutorial.descriptionByLocale)}
            </Text>
          </ColumnStackLayout>
          <LineStackLayout
            noMargin
            alignItems="center"
            justifyContent="flex-end"
          >
            <RaisedButton
              primary
              disabled={isLocked}
              label={<Trans>Open lesson</Trans>}
              onClick={() => onSelectTutorial(tutorial)}
            />
          </LineStackLayout>
        </ColumnStackLayout>
      </ResponsiveLineStackLayout>
    </div>
  );
};

export default EducationCurriculumLesson;
