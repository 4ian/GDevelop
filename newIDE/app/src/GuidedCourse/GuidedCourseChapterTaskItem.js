// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import type { GuidedCourseChapterTask } from '../Utils/GDevelopServices/Asset';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import Checkbox from '../UI/Checkbox';
import Text from '../UI/Text';
import { Column, Line } from '../UI/Grid';
import { Accordion, AccordionBody, AccordionHeader } from '../UI/Accordion';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { MarkdownText } from '../UI/MarkdownText';
import AlertMessage from '../UI/AlertMessage';

const styles = {
  textContainer: { overflow: 'hidden' },
  checkboxContainer: { paddingTop: 6 },
  image: {
    maxWidth: 600,
  },
};

type Props = {|
  guidedCourseChapterTask: GuidedCourseChapterTask,
  onCheck: () => void,
  isOpen: boolean,
  isComplete: boolean,
  onComplete: boolean => void,
|};

const GuidedCourseChapterTaskItem = ({
  guidedCourseChapterTask,
  onCheck,
  isOpen,
  isComplete,
  onComplete,
}: Props) => {
  const { isMobile, isLandscape } = useResponsiveWindowSize();
  return (
    <LineStackLayout alignItems="flex-start" noMargin>
      <div
        style={{
          ...styles.checkboxContainer,
          paddingLeft: isMobile && !isLandscape ? 0 : 20,
        }}
      >
        <Checkbox
          checked={isComplete}
          onCheck={() => onComplete(!isComplete)}
          style={{ margin: 0 }}
        />
      </div>
      <Line>
        <ColumnStackLayout expand noMargin noOverflowParent>
          <Column expand noMargin noOverflowParent>
            <Text noMargin size="sub-title">
              {guidedCourseChapterTask.title}
            </Text>
            {guidedCourseChapterTask.text && (
              <MarkdownText
                withTextEllipsis={!isOpen}
                source={guidedCourseChapterTask.text}
                allowParagraphs
              />
            )}
          </Column>
          {isOpen &&
            guidedCourseChapterTask.imageUrls &&
            guidedCourseChapterTask.imageUrls.map(imageUrl => (
              <CorsAwareImage
                style={styles.image}
                key={imageUrl}
                alt=""
                src={imageUrl}
              />
            ))}
          {isOpen && guidedCourseChapterTask.hint && (
            <AlertMessage kind="info" background="light">
              <MarkdownText source={guidedCourseChapterTask.hint} />
            </AlertMessage>
          )}
          {isOpen && guidedCourseChapterTask.answer && (
            <Accordion kind="answer">
              <AccordionHeader>
                <Text size="sub-title">
                  <Trans>Answer</Trans>
                </Text>
              </AccordionHeader>
              <AccordionBody>
                {!!guidedCourseChapterTask.answer.text && (
                  <MarkdownText
                    source={guidedCourseChapterTask.answer.text}
                    allowParagraphs
                  />
                )}
                {!!guidedCourseChapterTask.answer.imageUrls && (
                  <ColumnStackLayout noMargin noOverflowParent>
                    {guidedCourseChapterTask.answer.imageUrls.map(imageUrl => (
                      <CorsAwareImage
                        style={styles.image}
                        key={imageUrl}
                        alt=""
                        src={imageUrl}
                      />
                    ))}
                  </ColumnStackLayout>
                )}
              </AccordionBody>
            </Accordion>
          )}
        </ColumnStackLayout>
      </Line>
    </LineStackLayout>
  );
};

export default GuidedCourseChapterTaskItem;
