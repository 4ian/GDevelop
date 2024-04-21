// @flow

import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import ButtonBase from '@material-ui/core/ButtonBase';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import {
  createStyles,
  darken,
  lighten,
  makeStyles,
  useTheme,
} from '@material-ui/core/styles';

import { type AnswerData, type QuestionData } from './Questionnaire';
import { Column, Line, Spacer } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import TextField from '../../../../UI/TextField';
import Paper from '../../../../UI/Paper';
import InlineCheckbox from '../../../../UI/InlineCheckbox';
import RaisedButton from '../../../../UI/RaisedButton';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { ColumnStackLayout } from '../../../../UI/Layout';
import { isOnlyOneFreeAnswerPossible } from './UserSurvey';
import { type MessageDescriptor } from '../../../../Utils/i18n/MessageDescriptor.flow';

const getColumnsFromWindowSize = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 3 : 1;
    case 'medium':
      return 2;
    case 'large':
      return 3;
    case 'xlarge':
    default:
      return 4;
  }
};

const useStylesForAnswer = (isSelected?: boolean) =>
  makeStyles(theme =>
    createStyles({
      root: {
        '&:hover': {
          filter: isSelected
            ? undefined
            : theme.palette.type === 'dark'
            ? 'brightness(120%)'
            : 'brightness(85%)',
        },
      },
    })
  )();

export const TitleAndSubtitle = ({
  i18n,
  text,
  multi,
  answers,
  textAlign,
}: {
  i18n: I18nType,
  text: MessageDescriptor,
  multi: ?boolean,
  answers: AnswerData[],
  textAlign: 'center' | 'left',
}) => (
  <ColumnStackLayout noMargin>
    <Text size="block-title" align={textAlign} noMargin>
      {i18n._(text)}
    </Text>
    {multi ? (
      <Text style={styles.subTitle} align={textAlign} noMargin>
        {i18n._(t`You can select more than one.`)}
      </Text>
    ) : isOnlyOneFreeAnswerPossible(answers) ? (
      <Text style={styles.subTitle} align={textAlign} noMargin>
        {i18n._(
          t`The more descriptive you are, the better we can match the content we’ll recommend.`
        )}
      </Text>
    ) : null}
    <Spacer />
  </ColumnStackLayout>
);

const styles = {
  answerButton: {
    border: 'solid',
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
    height: '100%',
    display: 'flex',
  },
  questionContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    overflow: 'hidden',
    marginBottom: 30,
  },
  answerButtonBackground: { width: '100%', height: '100%' },
  answerCoverImage: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    width: '100%',
    aspectRatio: '292 / 103',
  },
  answerCheckboxAnchor: { position: 'relative' },
  answerCheckboxContainer: {
    position: 'absolute',
    left: 5,
    top: 'calc(50% - 9px)',
  },
  answerTextContainer: { marginLeft: 25, marginRight: 25 },
  freeAnswerContent: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },
  freeAnswerInputOutline: {
    border: 'solid',
    borderWidth: 1,
    borderRadius: 4,
    flex: 1,
    padding: 8,
  },
  subTitle: { opacity: 0.6 },
};

type FreeAnswerProps = {|
  answerData: AnswerData,
  onSelect: string => void,
  selected: boolean,
  i18n: I18nType,
  showCheckbox: boolean,
  onClickSend?: string => void,
  value: string,
  onChange: string => void,
|};

const FreeAnswer = ({
  answerData,
  i18n,
  onSelect,
  selected,
  showCheckbox,
  onClickSend,
  value,
  onChange,
}: FreeAnswerProps) => {
  const { text, imageSource, id } = answerData;
  const [errorText, setErrorText] = React.useState<React.Node>(null);
  const muiTheme = useTheme();
  const borderColor = (muiTheme.palette.type === 'dark' ? darken : lighten)(
    muiTheme.palette.text.primary,
    selected ? 0 : 0.7
  );
  const classes = useStylesForAnswer(selected);

  const clickSend = onClickSend
    ? () => {
        setErrorText(null);
        const cleanedInputValue = value.trim();
        if (!cleanedInputValue) {
          setErrorText(<Trans>Please explain your use of GDevelop.</Trans>);
          return;
        }
        onClickSend(cleanedInputValue);
      }
    : null;

  return (
    <ButtonBase
      style={{
        ...styles.answerButton,
        borderColor,
      }}
      classes={classes}
      onClick={e => {
        if (e.nativeEvent && e.nativeEvent.x === 0 && e.nativeEvent.y === 0) {
          // Material UI buttons are clicked when focused and space key is pressed.
          // Here, it's an issue since the input is inside the button and each key press
          // in the input is interpreted as a click.
          // Even if it's a key press, a click event is simulated, and it's hard to
          // discriminate true pointer events and click via space key press.
          // It is supposed that if the coordinates of the event are at 0;0, it's
          // because it comes from a key press.
          return;
        }
        onSelect(id);
      }}
      disableRipple={selected}
    >
      <Paper
        square={false}
        background="medium"
        style={styles.answerButtonBackground}
      >
        <div style={styles.freeAnswerContent}>
          {selected || !imageSource ? (
            <>
              <Line justifyContent="center">
                <Text size="sub-title">{i18n._(text)}</Text>
              </Line>
              <Line justifyContent="center" useFullHeight expand noMargin>
                <ColumnStackLayout expand>
                  <div
                    style={{
                      ...styles.freeAnswerInputOutline,
                      borderColor: muiTheme.palette.text.disabled,
                    }}
                  >
                    <TextField
                      multiline
                      fullWidth
                      errorText={errorText}
                      rows={5}
                      rowsMax={5}
                      maxLength={200}
                      style={{ fontSize: 14 }}
                      underlineShow={false}
                      margin="none"
                      translatableHintText={t`Tell us more!...`}
                      type="text"
                      value={value}
                      onChange={(_, newValue) => onChange(newValue)}
                      autoFocus="desktop"
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                  {clickSend && (
                    <RaisedButton
                      primary
                      label={i18n._(t`Send`)}
                      fullWidth
                      onClick={clickSend}
                      disabled={!value}
                    />
                  )}
                </ColumnStackLayout>
              </Line>
              <Spacer />
            </>
          ) : (
            <>
              <img
                src={imageSource}
                style={styles.answerCoverImage}
                alt={`Other`}
              />
              <Line justifyContent={showCheckbox ? 'flex-start' : 'center'}>
                {showCheckbox ? (
                  <div style={styles.answerCheckboxAnchor}>
                    <div style={styles.answerCheckboxContainer}>
                      <InlineCheckbox checked={selected} paddingSize="small" />
                    </div>
                  </div>
                ) : null}
                <Column justifyContent="center" alignItems="center" expand>
                  <div style={styles.answerTextContainer}>
                    <Text noMargin>{i18n._(text)}</Text>
                  </div>
                </Column>
              </Line>
            </>
          )}
        </div>
      </Paper>
    </ButtonBase>
  );
};

type AnswerProps = {|
  answerData: AnswerData,
  onSelect: string => void,
  selected: boolean,
  i18n: I18nType,
  showCheckbox: boolean,
|};

const Answer = ({
  answerData,
  i18n,
  onSelect,
  selected,
  showCheckbox,
}: AnswerProps) => {
  const { imageSource, text, id } = answerData;
  const muiTheme = useTheme();
  const borderColor = (muiTheme.palette.type === 'dark' ? darken : lighten)(
    muiTheme.palette.text.primary,
    selected ? 0 : 0.7
  );
  const classes = useStylesForAnswer();

  return (
    <ButtonBase
      style={{
        ...styles.answerButton,
        borderColor,
      }}
      classes={classes}
      onClick={() => onSelect(id)}
    >
      <Paper
        square={false}
        background="medium"
        style={styles.answerButtonBackground}
      >
        <img
          src={imageSource}
          style={styles.answerCoverImage}
          alt={`Illustration for option ${i18n._(text)}`}
        />
        <Line justifyContent={showCheckbox ? 'flex-start' : 'center'}>
          {showCheckbox ? (
            <div style={styles.answerCheckboxAnchor}>
              <div style={styles.answerCheckboxContainer}>
                <InlineCheckbox checked={selected} paddingSize="small" />
              </div>
            </div>
          ) : null}
          <Column justifyContent="center" alignItems="center" expand>
            <div style={styles.answerTextContainer}>
              <Text noMargin>{i18n._(text)}</Text>
            </div>
          </Column>
        </Line>
      </Paper>
    </ButtonBase>
  );
};

type Props = {|
  questionData: QuestionData,
  onSelectAnswer: string => void,
  selectedAnswers: string[],
  showNextButton?: boolean,
  onClickNext: () => void,
  showQuestionText: boolean,
  onClickSend?: string => void,
  userInputValue?: string,
  onChangeUserInputValue?: string => void,
|};

const UserSurveyQuestion = React.forwardRef<Props, HTMLDivElement>(
  (
    {
      questionData,
      onSelectAnswer,
      selectedAnswers,
      showNextButton,
      onClickNext,
      showQuestionText,
      onClickSend,
      userInputValue,
      onChangeUserInputValue,
    },
    ref
  ) => {
    const { text, answers, multi } = questionData;
    const { windowSize, isLandscape } = useResponsiveWindowSize();
    const onlyOneFreeAnswerPossible = isOnlyOneFreeAnswerPossible(answers);
    return (
      <I18n>
        {({ i18n }) => (
          <div ref={ref} style={styles.questionContainer}>
            {showQuestionText ? (
              <TitleAndSubtitle
                i18n={i18n}
                multi={multi}
                answers={questionData.answers}
                text={text}
                textAlign="left"
              />
            ) : null}
            <GridList
              cols={
                onlyOneFreeAnswerPossible
                  ? 1
                  : getColumnsFromWindowSize(windowSize, isLandscape)
              }
              spacing={15}
              cellHeight="auto"
            >
              {// Case where only one free answer is possible.
              onlyOneFreeAnswerPossible &&
              userInputValue !== undefined &&
              onChangeUserInputValue ? (
                <GridListTile>
                  <FreeAnswer
                    answerData={answers[0]}
                    i18n={i18n}
                    key={answers[0].id}
                    // Do not leave possibility to unselect answer.
                    onSelect={() => {}}
                    selected={selectedAnswers.includes(answers[0].id)}
                    showCheckbox={false}
                    onClickSend={onClickSend}
                    value={userInputValue}
                    onChange={onChangeUserInputValue}
                  />
                </GridListTile>
              ) : (
                answers.map(answerData => (
                  <GridListTile key={answerData.id}>
                    {answerData.id === 'input' &&
                    userInputValue !== undefined &&
                    onChangeUserInputValue ? (
                      <FreeAnswer
                        answerData={answerData}
                        i18n={i18n}
                        onSelect={onSelectAnswer}
                        selected={selectedAnswers.includes(answerData.id)}
                        showCheckbox={!!multi}
                        onClickSend={onClickSend}
                        value={userInputValue}
                        onChange={onChangeUserInputValue}
                      />
                    ) : (
                      <Answer
                        answerData={answerData}
                        i18n={i18n}
                        onSelect={onSelectAnswer}
                        selected={selectedAnswers.includes(answerData.id)}
                        showCheckbox={!!multi}
                      />
                    )}
                  </GridListTile>
                ))
              )}
            </GridList>
            {showNextButton && (
              <Line justifyContent="flex-end">
                <RaisedButton
                  primary
                  label={i18n._(t`Next`)}
                  onClick={onClickNext}
                  disabled={
                    selectedAnswers.length === 0 ||
                    (selectedAnswers.length === 1 &&
                      selectedAnswers[0] === 'input' &&
                      !userInputValue)
                  }
                />
              </Line>
            )}
          </div>
        )}
      </I18n>
    );
  }
);

export default UserSurveyQuestion;
