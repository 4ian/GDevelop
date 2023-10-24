// @flow

import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';

import questionnaire, {
  firstQuestion,
  type QuestionData,
  type AnswerData,
} from './Questionnaire';
import PersonalizationQuestion from './PersonalizationQuestion';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import SectionContainer, {
  type SectionContainerInterface,
} from '../SectionContainer';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { Column, Line } from '../../../../UI/Grid';
import ScrollView from '../../../../UI/ScrollView';
import Text from '../../../../UI/Text';
import FlatButton from '../../../../UI/FlatButton';
import RaisedButton from '../../../../UI/RaisedButton';

const STEP_MAX_COUNT = 7;

const styles = {
  navigationDot: {
    height: 8,
    width: 8,
    borderRadius: '50%',
    margin: 5,
  },
};

type UserAnswers = Array<{| stepName: string, answers: string[] |}>;

const NavigationStep = ({ stepIndex }: {| stepIndex: number |}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <Line justifyContent="center">
      {new Array(STEP_MAX_COUNT).fill(0).map((_, index) => {
        return (
          <div
            key={index}
            style={{
              ...styles.navigationDot,
              backgroundColor:
                index === stepIndex
                  ? gdevelopTheme.text.color.primary
                  : gdevelopTheme.text.color.disabled,
            }}
          />
        );
      })}
    </Line>
  );
};

type DisplayProps = {|
  userAnswers: UserAnswers,
  onSelectAnswer: (string, string) => void,
  goToNextQuestion: QuestionData => void,
  step: string,
|};

const DesktopDisplay = ({
  userAnswers,
  onSelectAnswer,
  goToNextQuestion,
  step,
}: DisplayProps) => {
  const questionData = questionnaire[step];
  const sectionContainerRef = React.useRef<?SectionContainerInterface>(null);

  const scrollToBottom = React.useCallback(() => {
    // If no timeout, the container does not scroll to the very bottom, even
    // if called by layout effect.
    setTimeout(() => {
      if (sectionContainerRef.current) {
        sectionContainerRef.current.scrollToBottom({ smooth: true });
      }
    }, 100);
  }, []);

  React.useEffect(
    () => {
      scrollToBottom();
    },
    [step, scrollToBottom]
  );

  const questionsToRender: React.Node[] = userAnswers.map(
    (userAnswer, index) => {
      const relatedQuestionData = questionnaire[userAnswer.stepName];
      return (
        <PersonalizationQuestion
          key={userAnswer.stepName}
          questionData={relatedQuestionData}
          selectedAnswers={userAnswer.answers}
          onSelectAnswer={answer => onSelectAnswer(userAnswer.stepName, answer)}
          showNextButton={
            relatedQuestionData.multi &&
            index === userAnswers.length - 1 &&
            step === userAnswer.stepName
          }
          onClickNext={() => goToNextQuestion(relatedQuestionData)}
          showQuestionText={true}
        />
      );
    }
  );

  // When answering a multi answer question, the first click on an answer adds an item to
  // user answers. The question is then displayed through questionsToRender and should not
  // be rendered a second time.
  const shouldDisplayStep =
    questionData &&
    (!questionData.multi ||
      userAnswers[userAnswers.length - 1].stepName !== step);

  if (shouldDisplayStep) {
    const questionData = questionnaire[step];
    questionsToRender.push(
      <PersonalizationQuestion
        key={step}
        questionData={questionData}
        selectedAnswers={[]}
        onSelectAnswer={answer => onSelectAnswer(step, answer)}
        onClickNext={() => goToNextQuestion(questionData)}
        showNextButton={questionData.multi}
        showQuestionText={true}
      />
    );
  }
  return (
    <SectionContainer
      title={null} // Let the content handle the title.
      flexBody
      ref={sectionContainerRef}
    >
      <ColumnStackLayout noMargin>{questionsToRender}</ColumnStackLayout>
    </SectionContainer>
  );
};

const MobileDisplay = ({
  userAnswers,
  onSelectAnswer,
  goToNextQuestion,
  step,
}: DisplayProps) => {
  const questionData = questionnaire[step];
  if (!questionData) return null;

  const userAnswer = userAnswers.find(answer => answer.stepName === step);

  return (
    <I18n>
      {({ i18n }) => (
        <SectionContainer
          title={null} // Let the content handle the title.
          flexBody
          noScroll
        >
          <div
            style={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Column noMargin alignItems="center">
              <Text align="center" size="block-title">
                {i18n._(questionData.text)}
              </Text>
              {questionData.multi ? (
                <Text align="center">
                  {i18n._(t`You can select more than one.`)}
                </Text>
              ) : null}
            </Column>
            <ScrollView>
              <PersonalizationQuestion
                key={step}
                questionData={questionData}
                selectedAnswers={userAnswer ? userAnswer.answers : []}
                onSelectAnswer={answer => onSelectAnswer(step, answer)}
                onClickNext={() => goToNextQuestion(questionData)}
                showNextButton={false}
                showQuestionText={false}
              />
            </ScrollView>
            <Column noMargin>
              <LineStackLayout justifyContent="stretch" expand>
                <FlatButton
                  fullWidth
                  label={i18n._(t`Back`)}
                  onClick={() => console.log('back')}
                />
                {questionData.multi && (
                  <RaisedButton
                    primary
                    fullWidth
                    label={i18n._(t`Next`)}
                    onClick={() => goToNextQuestion(questionData)}
                    disabled={
                      userAnswer ? userAnswer.answers.length === 0 : true
                    }
                  />
                )}
              </LineStackLayout>

              <NavigationStep
                stepIndex={
                  userAnswers.length +
                  (questionData.multi &&
                  userAnswers[userAnswers.length - 1].stepName === step
                    ? -1
                    : 0)
                }
              />
            </Column>
          </div>
        </SectionContainer>
      )}
    </I18n>
  );
};

type Props = {||};

const PersonalizationFlow = (props: Props) => {
  const [step, setStep] = React.useState<string>(firstQuestion);
  const windowWidth = useResponsiveWindowWidth();
  const [userAnswers, setUserAnswers] = React.useState<
    Array<{| stepName: string, answers: string[] |}>
  >([]);

  const goToNextQuestion = React.useCallback(
    (questionData: QuestionData, answerData?: AnswerData) => {
      if (answerData && answerData.nextQuestion) {
        setStep(answerData.nextQuestion);
        return;
      }
      if (questionData.nextQuestion) {
        setStep(questionData.nextQuestion);
        return;
      }
      if (questionData.getNextQuestion) {
        const nextStep = questionData.getNextQuestion(userAnswers);
        if (nextStep) {
          setStep(nextStep);
          return;
        }
      }
      setStep('over');
    },
    [userAnswers]
  );

  const onSelectAnswer = React.useCallback(
    (step: string, answer: string) => {
      const questionData = questionnaire[step];
      const { multi } = questionData;
      const existingUserAnswerIndex = userAnswers.findIndex(
        userAnswer => userAnswer.stepName === step
      );
      if (existingUserAnswerIndex >= 0) {
        if (multi) {
          const newUserAnswers = [...userAnswers];
          const answerIndex = newUserAnswers[
            existingUserAnswerIndex
          ].answers.indexOf(answer);
          if (answerIndex >= 0) {
            newUserAnswers[existingUserAnswerIndex].answers.splice(
              answerIndex,
              1
            );
          } else {
            newUserAnswers[existingUserAnswerIndex].answers.push(answer);
          }
          setUserAnswers(newUserAnswers);
        } else {
          const newUserAnswers = [...userAnswers];
          newUserAnswers[existingUserAnswerIndex].answers = [answer];
          const doesAnswerChangesFollowingQuestion = !questionData.nextQuestion;
          if (doesAnswerChangesFollowingQuestion) {
            newUserAnswers.splice(
              existingUserAnswerIndex + 1,
              userAnswers.length - existingUserAnswerIndex
            );
          }
          setUserAnswers(newUserAnswers);
          if (doesAnswerChangesFollowingQuestion) {
            const answerData = questionData.answers.find(
              answerData => answerData.code === answer
            );
            goToNextQuestion(questionData, answerData);
          }
        }
      } else {
        setUserAnswers([...userAnswers, { stepName: step, answers: [answer] }]);
        const answerData = questionData.answers.find(
          answerData => answerData.code === answer
        );
        if (!multi) {
          goToNextQuestion(questionData, answerData);
        }
      }
    },
    [userAnswers, goToNextQuestion]
  );

  if (windowWidth === 'small') {
    return (
      <MobileDisplay
        step={step}
        goToNextQuestion={goToNextQuestion}
        onSelectAnswer={onSelectAnswer}
        userAnswers={userAnswers}
      />
    );
  }

  return (
    <DesktopDisplay
      step={step}
      goToNextQuestion={goToNextQuestion}
      onSelectAnswer={onSelectAnswer}
      userAnswers={userAnswers}
    />
  );
};

export default PersonalizationFlow;
