// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import Divider from '@material-ui/core/Divider';
import type { TextBasedCourseChapterTaskItem as TextBasedCourseChapterTaskItemType } from '../Utils/GDevelopServices/Asset';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import Checkbox from '../UI/Checkbox';
import Text from '../UI/Text';
import { Line, Spacer } from '../UI/Grid';
import { Accordion, AccordionBody, AccordionHeader } from '../UI/Accordion';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import FlatButton from '../UI/FlatButton';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import TextBasedCourseChapterItems from './TextBasedCourseChapterItems';

const styles = {
  textContainer: { overflow: 'hidden' },
  checkboxContainer: { paddingTop: 15 },
  image: {
    maxWidth: '100%',
  },
  icon: {
    fontSize: 18,
  },
  stickyTitle: {
    position: 'sticky',
    top: -1, // If 0, it somehow lets a 1px gap between the parent, letting the user see the text scroll behind.
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2,
  },
};

type Props = {|
  task: TextBasedCourseChapterTaskItemType,
  isComplete: boolean,
  onComplete: boolean => void,
|};

const TextBasedCourseChapterTaskItem = ({
  task,
  isComplete,
  onComplete,
}: Props) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const { isMobile, isLandscape } = useResponsiveWindowSize();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <ColumnStackLayout noMargin>
      <ColumnStackLayout noMargin>
        <div
          style={{
            ...styles.stickyTitle,
            backgroundColor: gdevelopTheme.paper.backgroundColor.dark,
          }}
        >
          <Divider />
          <Spacer />
          <Line alignItems="center" justifyContent="space-between" noMargin>
            <Text size="block-title">{task.title}</Text>
            <FlatButton
              primary
              label={
                isOpen ? <Trans>Close task</Trans> : <Trans>Open task</Trans>
              }
              leftIcon={
                isOpen ? (
                  <ChevronArrowBottom style={styles.icon} />
                ) : (
                  <ChevronArrowRight style={styles.icon} />
                )
              }
              onClick={() => setIsOpen(!isOpen)}
            />
          </Line>
          <Spacer />
          <Divider />
        </div>
      </ColumnStackLayout>
      {isOpen && (
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
              <TextBasedCourseChapterItems items={task.items} />
              {isOpen && task.answer && (
                <Accordion kind="answer" noMargin>
                  <AccordionHeader>
                    <Text size="sub-title">
                      <Trans>Answer</Trans>
                    </Text>
                  </AccordionHeader>
                  <AccordionBody>
                    <ColumnStackLayout>
                      <TextBasedCourseChapterItems items={task.answer.items} />
                    </ColumnStackLayout>
                  </AccordionBody>
                </Accordion>
              )}
            </ColumnStackLayout>
          </Line>
        </LineStackLayout>
      )}
    </ColumnStackLayout>
  );
};

export default TextBasedCourseChapterTaskItem;
