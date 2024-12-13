// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import type { CourseChapterTask } from '../Utils/GDevelopServices/Asset';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import Checkbox from '../UI/Checkbox';
import Text from '../UI/Text';
import { Column, Line } from '../UI/Grid';
import { Accordion, AccordionBody, AccordionHeader } from '../UI/Accordion';
import ImageWithZoom from '../UI/ImageWithZoom';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { MarkdownText } from '../UI/MarkdownText';
import AlertMessage from '../UI/AlertMessage';

const styles = {
  textContainer: { overflow: 'hidden' },
  checkboxContainer: { paddingTop: 6 },
  image: {
    maxWidth: '100%',
  },
};

type Props = {|
  courseChapterTask: CourseChapterTask,
  isOpen: boolean,
  isComplete: boolean,
  onComplete: boolean => void,
|};

const CourseChapterTaskItem = ({
  courseChapterTask,
  isOpen,
  isComplete,
  onComplete,
}: Props) => {
  const [isOpenIndividually, setIsOpenIndividually] = React.useState<boolean>(
    isOpen
  );
  const { isMobile, isLandscape } = useResponsiveWindowSize();

  React.useEffect(
    () => {
      if (!isOpen) {
        // If the parent closes the task, the child state should follow.
        setIsOpenIndividually(false);
      }
    },
    [isOpen]
  );

  const displayContent = isOpen || isOpenIndividually;
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
          <div
            onClick={() => {
              setIsOpenIndividually(true);
            }}
            style={{ pointerEvents: displayContent ? 'none' : 'all' }}
          >
            <Column expand noMargin noOverflowParent>
              <Text noMargin size="sub-title">
                {courseChapterTask.title}
              </Text>
              {courseChapterTask.text && (
                <MarkdownText
                  withTextEllipsis={!displayContent}
                  source={courseChapterTask.text}
                  allowParagraphs
                />
              )}
            </Column>
          </div>
          {displayContent &&
            courseChapterTask.imageUrls &&
            courseChapterTask.imageUrls.map(imageUrl => (
              <ImageWithZoom
                style={styles.image}
                key={imageUrl}
                alt=""
                src={imageUrl}
              />
            ))}
          {displayContent && courseChapterTask.hint && (
            <AlertMessage kind="info" background="light">
              <MarkdownText source={courseChapterTask.hint} />
            </AlertMessage>
          )}
          {displayContent &&
            courseChapterTask.answer &&
            (courseChapterTask.answer.text ||
              courseChapterTask.answer.imageUrls) && (
              <Accordion kind="answer" noMargin>
                <AccordionHeader>
                  <Text size="sub-title">
                    <Trans>Answer</Trans>
                  </Text>
                </AccordionHeader>
                <AccordionBody>
                  {!!courseChapterTask.answer.text && (
                    <MarkdownText
                      source={courseChapterTask.answer.text}
                      allowParagraphs
                    />
                  )}
                  {!!courseChapterTask.answer.imageUrls && (
                    <ColumnStackLayout noMargin noOverflowParent>
                      {courseChapterTask.answer.imageUrls.map(imageUrl => (
                        <ImageWithZoom
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

export default CourseChapterTaskItem;
