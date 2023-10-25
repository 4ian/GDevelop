// @flow

import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import ButtonBase from '@material-ui/core/ButtonBase';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { darken, lighten, useTheme } from '@material-ui/core/styles';

import { type AnswerData, type QuestionData } from './Questionnaire';
import { Column, Line, Spacer } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import TextField from '../../../../UI/TextField';
import Paper from '../../../../UI/Paper';
import InlineCheckbox from '../../../../UI/InlineCheckbox';
import RaisedButton from '../../../../UI/RaisedButton';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { ColumnStackLayout } from '../../../../UI/Layout';

const getColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 2;
    case 'large':
      return 3;
    case 'xlarge':
    default:
      return 4;
  }
};

const styles = {
  answerButton: {
    border: 'solid',
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
    height: '100%',
    display: 'flex',
  },
  answerButtonBackground: { width: '100%', height: '100%' },
  answerCoverImage: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    width: '100%',
  },
  answerCheckboxAnchor: { position: 'relative' },
  answerCheckboxContainer: {
    position: 'absolute',
    left: 5,
    top: 'calc(50% - 9px)',
  },
  answerTextContainer: { marginLeft: 25, marginRight: 25 },
};

type FreeAnswerProps = {|
  answerData: AnswerData,
  onSelect: string => void,
  selected: boolean,
  i18n: I18nType,
  showCheckbox: boolean,
|};

const FreeAnswer = ({
  answerData,
  i18n,
  onSelect,
  selected,
  showCheckbox,
}: FreeAnswerProps) => {
  const { text, imageSource, code } = answerData;
  const [inputValue, setInputValue] = React.useState<string>('');
  const muiTheme = useTheme();
  console.log(muiTheme);
  const borderColor = (muiTheme.palette.type === 'dark' ? darken : lighten)(
    muiTheme.palette.text.primary,
    selected ? 0 : 0.7
  );
  return (
    <ButtonBase
      style={{
        ...styles.answerButton,
        borderColor,
      }}
      onClick={() => onSelect(code)}
      disableRipple={selected}
    >
      <Paper
        square={false}
        background="medium"
        style={styles.answerButtonBackground}
      >
        <div
          style={{ display: 'flex', height: '100%', flexDirection: 'column' }}
        >
          {selected ? (
            <>
              <Line justifyContent="center">
                <Text size="sub-title">{i18n._(text)}</Text>
              </Line>
              <Line justifyContent="center" useFullHeight expand noMargin>
                <ColumnStackLayout expand>
                  <div
                    style={{
                      border: 'solid',
                      borderWidth: 1,
                      borderRadius: 4,
                      borderColor: muiTheme.palette.text.disabled,
                      flex: 1,
                      padding: 8,
                    }}
                  >
                    <TextField
                      multiline
                      fullWidth
                      rows={2}
                      rowsMax={4}
                      style={{ fontSize: 14 }}
                      underlineShow={false}
                      margin="none"
                      translatableHintText={t`Tell us more!...`}
                      type="text"
                      value={inputValue}
                      onChange={(_, newValue) => setInputValue(newValue)}
                      autoFocus="desktop"
                    />
                  </div>
                  <RaisedButton
                    primary
                    label={i18n._(t`Send`)}
                    fullWidth
                    onClick={() => console.log('send')}
                  />
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
  const { imageSource, text, code } = answerData;
  const muiTheme = useTheme();
  const borderColor = (muiTheme.palette.type === 'dark' ? darken : lighten)(
    muiTheme.palette.text.primary,
    selected ? 0 : 0.7
  );
  return (
    <ButtonBase
      style={{
        ...styles.answerButton,
        borderColor,
      }}
      onClick={() => onSelect(code)}
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
|};

const PersonalizationQuestion = ({
  questionData,
  onSelectAnswer,
  selectedAnswers,
  showNextButton,
  onClickNext,
  showQuestionText,
}: Props) => {
  const { text, answers, multi, showOther } = questionData;
  const windowWidth = useResponsiveWindowWidth();

  const answersToDisplay: AnswerData[] = [
    ...answers,
    showOther
      ? {
          code: 'otherWithInput',
          text: t`Other`,
          imageSource: 'res/questionnaire/other.svg',
        }
      : null,
  ].filter(Boolean);

  return (
    <I18n>
      {({ i18n }) => (
        <Column>
          {showQuestionText ? (
            <>
              <Text size="block-title">{i18n._(text)}</Text>
              {multi ? (
                <Text>{i18n._(t`You can select more than one.`)}</Text>
              ) : null}
            </>
          ) : null}
          <GridList
            cols={getColumnsFromWidth(windowWidth)}
            spacing={15}
            cellHeight="auto"
          >
            {answersToDisplay.map(answerData => (
              <GridListTile>
                {answerData.code === 'otherWithInput' ? (
                  <FreeAnswer
                    answerData={answerData}
                    i18n={i18n}
                    key={answerData.code}
                    onSelect={onSelectAnswer}
                    selected={selectedAnswers.includes(answerData.code)}
                    showCheckbox={!!multi}
                  />
                ) : (
                  <Answer
                    answerData={answerData}
                    i18n={i18n}
                    key={answerData.code}
                    onSelect={onSelectAnswer}
                    selected={selectedAnswers.includes(answerData.code)}
                    showCheckbox={!!multi}
                  />
                )}
              </GridListTile>
            ))}
          </GridList>
          {showNextButton && (
            <Line justifyContent="flex-end">
              <RaisedButton
                primary
                label={i18n._(t`Next`)}
                onClick={onClickNext}
                disabled={selectedAnswers.length === 0}
              />
            </Line>
          )}
        </Column>
      )}
    </I18n>
  );
};

export default PersonalizationQuestion;
