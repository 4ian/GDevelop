// @flow
import { t } from '@lingui/macro';
import { type MessageDescriptor } from '../../../../Utils/i18n/MessageDescriptor.flow';

export const firstQuestion = 'creationGoal';

export type FreeAnswerData = {|
  text: MessageDescriptor,
  id: string,
  imageSource?: string,
  isFree: true,
|};

export type ChoiceAnswerData = {|
  text: MessageDescriptor,
  id: string,
  nextQuestion?: string,
  imageSource: string,
|};

export type AnswerData = ChoiceAnswerData | FreeAnswerData;

export type QuestionData = {|
  text: MessageDescriptor,
  nextQuestion?: string,
  getNextQuestion?: any => string | null,
  multi?: boolean,
  answers: Array<AnswerData>,
|};

export type Questionnaire = {|
  [questionId: string]: QuestionData,
|};

const questionnaire: Questionnaire = {
  [firstQuestion]: {
    text: t`What is your goal with GDevelop?`,
    answers: [
      {
        text: t`I'm learning or teaching game development`,
        id: 'learningOrTeaching',
        nextQuestion: 'learningOrTeaching',
        imageSource: 'res/questionnaire/learning-or-teaching.svg',
      },
      {
        text: t`I'm building a video game or app`,
        id: 'building',
        nextQuestion: 'buildingKindOfProjects',
        imageSource: 'res/questionnaire/building-video-game-or-app.svg',
      },
      {
        text: t`Other`,
        id: 'input',
        imageSource: 'res/questionnaire/other.svg',
        isFree: true,
      },
    ],
  },
  learningOrTeaching: {
    text: t`Are you teaching or learning game development?`,
    answers: [
      {
        text: t`I am teaching game development`,
        id: 'teaching',
        nextQuestion: 'gameDevelopmentExperience',
        imageSource: 'res/questionnaire/learning.svg',
      },
      {
        text: t`I am learning game development`,
        id: 'learning',
        nextQuestion: 'learningHow',
        imageSource: 'res/questionnaire/teaching.svg',
      },
    ],
  },
  learningHow: {
    text: t`How are you learning game dev?`,
    answers: [
      {
        text: t`Through a teacher`,
        id: 'withTeacher',
        imageSource: 'res/questionnaire/through-a-teacher.svg',
      },
      {
        text: t`On my own`,
        id: 'alone',
        nextQuestion: 'learningKindOfProjects',
        imageSource: 'res/questionnaire/on-my-own.svg',
      },
    ],
  },
  learningKindOfProjects: {
    text: t`What kind of projects do you want to build with GDevelop?`,
    answers: [
      {
        text: t`A game to publish`,
        id: 'gameToPublish',
        nextQuestion: 'gameDevelopmentExperience',
        imageSource: 'res/questionnaire/game-to-publish.svg',
      },
      {
        text: t`New interactive services for clients`,
        id: 'interactiveService',
        nextQuestion: 'gameDevelopmentExperience',
        imageSource: 'res/questionnaire/interactive-services-for-clients.svg',
      },
      {
        text: t`Games to learn or teach something`,
        id: 'seriousGame',
        nextQuestion: 'gameDevelopmentExperience',
        imageSource: 'res/questionnaire/serious-game.svg',
      },
      {
        text: t`Other`,
        id: 'other',
        nextQuestion: 'gameDevelopmentExperience',
        imageSource: 'res/questionnaire/other.svg',
      },
    ],
  },
  buildingKindOfProjects: {
    text: t`What kind of projects do you want to build with GDevelop?`,
    nextQuestion: 'projectDescription',
    multi: true,
    answers: [
      {
        text: t`Video game`,
        id: 'videoGame',
        imageSource: 'res/questionnaire/video-game.svg',
      },
      {
        text: t`Interactive content`,
        id: 'interactiveContent',
        imageSource: 'res/questionnaire/interactive-content.svg',
      },
      {
        text: t`App or tool`,
        id: 'appOrTool',
        imageSource: 'res/questionnaire/app-or-tool.svg',
      },
      {
        text: t`Game for teaching or learning`,
        id: 'seriousGame',
        imageSource: 'res/questionnaire/serious-game.svg',
      },
    ],
  },
  projectDescription: {
    text: t`Would you like to describe your projects?`,
    nextQuestion: 'workingTeam',
    answers: [
      {
        text: t`What kind of projects are you building?`,
        id: 'input',
        isFree: true,
      },
    ],
  },
  workingTeam: {
    text: t`How are you working on your projects?`,
    nextQuestion: 'painPoints',
    answers: [
      {
        text: t`Completely alone`,
        id: 'alone',
        imageSource: 'res/questionnaire/completely-alone.svg',
      },
      {
        text: t`With at least one other person`,
        id: 'onePlus',
        imageSource: 'res/questionnaire/with-at-least-one-other-person.svg',
      },
      {
        text: t`With an established team of people during the whole project`,
        id: 'team',
        imageSource: 'res/questionnaire/with-a-team.svg',
      },
    ],
  },
  painPoints: {
    text: t`Is there anything that you struggle with while working on your projects?`,
    multi: true,
    nextQuestion: 'targetDate',
    answers: [
      {
        text: t`Lack of Graphics & Animation`,
        id: 'lackGraphics',
        imageSource: 'res/questionnaire/lack-of-graphics.svg',
      },
      {
        text: t`Lack of Music & Sound`,
        id: 'lackSound',
        imageSource: 'res/questionnaire/lack-of-sounds.svg',
      },
      {
        text: t`Lack of Marketing & Publicity`,
        id: 'lackMarketing',
        imageSource: 'res/questionnaire/lack-of-marketing.svg',
      },
      {
        text: t`Implementing in-project monetization`,
        id: 'inAppMonetization',
        imageSource: 'res/questionnaire/in-app-monetization.svg',
      },
      {
        text: t`Dealing with data integration from external sources`,
        id: 'externalIntegration',
        imageSource: 'res/questionnaire/integration-of-external-services.svg',
      },
      {
        text: t`Other`,
        id: 'input',
        imageSource: 'res/questionnaire/other.svg',
        isFree: true,
      },
    ],
  },
  targetDate: {
    text: t`When do you plan to finish or release your projects?`,
    nextQuestion: 'gameDevelopmentExperience',
    answers: [
      {
        text: t`Less than a month`,
        id: '1MonthOrLess',
        imageSource: 'res/questionnaire/delay-less-than-1-month.svg',
      },
      {
        text: t`Around 1 or 2 months`,
        id: '1To2Months',
        imageSource: 'res/questionnaire/delay-1-to-2-months.svg',
      },
      {
        text: t`Around 3 to 5 months`,
        id: '3To5Months',
        imageSource: 'res/questionnaire/delay-3-to-5-months.svg',
      },
      {
        text: t`More than 6 months`,
        id: '6MonthsPlus',
        imageSource: 'res/questionnaire/delay-6-months-plus.svg',
      },
      {
        text: t`In around a year`,
        id: '1Year',
        imageSource: 'res/questionnaire/delay-1-year.svg',
      },
      {
        text: t`I don’t have a specific deadline`,
        id: 'noDeadline',
        imageSource: 'res/questionnaire/delay-no-deadline.svg',
      },
    ],
  },
  gameDevelopmentExperience: {
    text: t`Do you have game development experience?`,
    getNextQuestion: (
      userAnswers: Array<{| questionId: string, answers: string[] |}>
    ) =>
      userAnswers.some(
        answer =>
          answer.questionId === 'targetDate' ||
          (answer.questionId === 'learningKindOfProjects' &&
            answer.answers.includes('interactiveService'))
      )
        ? 'targetPlatform'
        : null,
    answers: [
      {
        text: t`No experience at all`,
        id: 'none',
        imageSource: 'res/questionnaire/zero-coding-experience.svg',
      },
      {
        text: t`Some no-code experience`,
        id: 'someNoCode',
        imageSource: 'res/questionnaire/no-code-experience.svg',
      },
      {
        text: t`Some code experience`,
        id: 'someCode',
        imageSource: 'res/questionnaire/coding-experience.svg',
      },
    ],
  },
  targetPlatform: {
    text: t`Where are you planing to publish your project(s)?`,
    multi: true,
    answers: [
      {
        text: t`On Steam and/or Epic Games`,
        id: 'steamEpic',
        imageSource: 'res/questionnaire/target-steam.svg',
      },
      {
        text: t`On Itch and/or Newgrounds`,
        id: 'itchNewgrounds',
        imageSource: 'res/questionnaire/target-itch.svg',
      },
      {
        text: t`On Poki and/or CrazyGames`,
        id: 'pokiCrazyGames',
        imageSource: 'res/questionnaire/target-poki.svg',
      },
      {
        text: t`Android mobile devices (Google Play, Amazon)`,
        id: 'androidApp',
        imageSource: 'res/questionnaire/target-play-store.svg',
      },
      {
        text: t`Apple mobile devices (App Store)`,
        id: 'iosApp',
        imageSource: 'res/questionnaire/target-app-store.svg',
      },
      {
        text: t`Sharing the final file with the client`,
        id: 'client',
        imageSource: 'res/questionnaire/target-client.svg',
      },
      {
        text: t`Personal or company website`,
        id: 'personal',
        imageSource: 'res/questionnaire/target-personal.svg',
      },
      {
        text: t`Consoles`,
        id: 'console',
        imageSource: 'res/questionnaire/target-console.svg',
      },
      {
        text: t`Other`,
        id: 'other',
        imageSource: 'res/questionnaire/other.svg',
      },
    ],
  },
};

export default questionnaire;
