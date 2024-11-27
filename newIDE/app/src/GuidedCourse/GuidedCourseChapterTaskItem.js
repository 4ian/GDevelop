// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import type { GuidedCourseChapterTask } from '../Utils/GDevelopServices/Asset';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import Checkbox from '../UI/Checkbox';
import Text from '../UI/Text';
import { Line } from '../UI/Grid';
import { Accordion, AccordionBody, AccordionHeader } from '../UI/Accordion';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import Hint from '../UI/Hint';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';

const styles = {
  textContainer: { overflow: 'hidden' },
  checkboxContainer: { paddingTop: 6 },
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
          <Text noMargin size="sub-title">
            {guidedCourseChapterTask.title}
          </Text>
          {guidedCourseChapterTask.text && (
            <Text noMargin style={isOpen ? undefined : textEllipsisStyle}>
              {guidedCourseChapterTask.text}
            </Text>
          )}
          {isOpen &&
            guidedCourseChapterTask.imageUrls &&
            guidedCourseChapterTask.imageUrls.map(imageUrl => (
              <CorsAwareImage key={imageUrl} src={imageUrl} />
            ))}
          {isOpen && guidedCourseChapterTask.hint && (
            <Hint text={guidedCourseChapterTask.hint} />
          )}
          {isOpen && guidedCourseChapterTask.answer && (
            <Accordion>
              <AccordionHeader>
                <Text>
                  <Trans>Answer</Trans>
                </Text>
              </AccordionHeader>
              <AccordionBody>
                {!!guidedCourseChapterTask.answer.text && (
                  <Text>{guidedCourseChapterTask.answer.text}</Text>
                )}
                {!!guidedCourseChapterTask.answer.imageUrls &&
                  guidedCourseChapterTask.answer.imageUrls.map(imageUrl => (
                    <CorsAwareImage key={imageUrl} src={imageUrl} />
                  ))}
              </AccordionBody>
            </Accordion>
          )}
        </ColumnStackLayout>
      </Line>
    </LineStackLayout>
  );
};

export default GuidedCourseChapterTaskItem;
