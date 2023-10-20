// @flow
import { t } from '@lingui/macro';
import { type MessageDescriptor } from '../../../../Utils/i18n/MessageDescriptor.flow';

export const firstQuestion = 'creationGoal';

export type AnswerData = {|
  answer: MessageDescriptor,
  code: string,
  nextQuestion?: string,
  imageSource: string,
|};

export type QuestionData = {|
  question: MessageDescriptor,
  nextQuestion?: string,
  getNextQuestion?: any => string,
  showOther?: boolean,
  multi?: boolean,
  answers: Array<AnswerData>,
|};

export type Questionnaire = {|
  [questionId: string]: QuestionData,
|};

const questionnaire: Questionnaire = {
  [firstQuestion]: {
    question: t`What is your goal with GDevelop?`,
    // TODO: Add coding experience question if Other was chosen.
    showOther: true,
    answers: [
      {
        answer: t`I'm learning or teaching game development`,
        code: 'learningOrTeaching',
        nextQuestion: 'teachOrStudy',
        imageSource: 'res/questionnaire/learning-or-teaching.svg',
      },
      {
        answer: t`I'm building a video game or app`,
        code: 'building',
        nextQuestion: 'buildingKindOfProjects',
        imageSource: 'res/questionnaire/building-video-game-or-app.svg',
      },
    ],
  },
  teachOrStudy: {
    question: t`Are you teaching or studying game development?`,
    answers: [
      {
        answer: t`I am teaching game development`,
        code: 'teaching',
        nextQuestion: 'gameDevelopmentExperience',
        imageSource: 'res/questionnaire/learning.svg',
      },
      {
        answer: t`I am learning game development`,
        code: 'learning',
        nextQuestion: 'learnHow',
        imageSource: 'res/questionnaire/teaching.svg',
      },
    ],
  },
  learnHow: {
    question: t`How are you learning game dev?`,
    answers: [
      {
        answer: t`Through a teacher`,
        code: 'withTeacher',
        imageSource: 'res/questionnaire/through-a-teacher.svg',
      },
      {
        answer: t`On my own`,
        code: 'alone',
        nextQuestion: 'learningKindOfProjects',
        imageSource: 'res/questionnaire/on-my-own.svg',
      },
    ],
  },
  learningKindOfProjects: {
    question: t`What kind of projects do you want to build with GDevelop?`,
    answers: [
      {
        answer: t`A game to publish`,
        code: 'gameToPublish',
        nextQuestion: 'gameDevelopmentExperience',
        imageSource: 'res/questionnaire/game-to-publish.svg',
      },
      {
        answer: t`New interactive services for existent clients`,
        code: 'interactiveService',
        nextQuestion: 'gameDevelopmentExperience',
        imageSource: 'res/questionnaire/interactive-services-for-clients.svg',
      },
      {
        answer: t`Games to learn or teach something`,
        code: 'seriousGame',
        imageSource: 'res/questionnaire/serious-game.svg',
      },
      {
        answer: t`Other`,
        code: 'other',
        nextQuestion: 'gameDevelopmentExperience',
        imageSource: 'res/questionnaire/other.svg',
      },
    ],
  },
  buildingKindOfProjects: {
    question: t`What kind of projects do you want to build with GDevelop?`,
    nextQuestion: 'workingTeam',
    answers: [
      {
        answer: t`Video game`,
        code: 'videoGame',
        imageSource: 'res/questionnaire/video-game.svg',
      },
      {
        answer: t`Interactive content`,
        code: 'interactiveContent',
        imageSource: 'res/questionnaire/interactive-content.svg',
      },
      {
        answer: t`App or tool`,
        code: 'appOrTool',
        imageSource: 'res/questionnaire/app-or-tool.svg',
      },
      {
        answer: t`Game for teaching or learning`,
        code: 'seriousGame',
        imageSource: 'res/questionnaire/serious-game.svg',
      },
    ],
  },
  workingTeam: {
    question: t`How are you working on your projects?`,
    nextQuestion: 'painPoints',
    answers: [
      {
        answer: t`Completely alone`,
        code: 'alone',
        imageSource: 'res/questionnaire/completely-alone.svg',
      },
      {
        answer: t`With at least one other person`,
        code: 'onePlus',
        imageSource: 'res/questionnaire/with-at-least-one-other-person.svg',
      },
      {
        answer: t`With an established team of people during the whole project`,
        code: 'team',
        imageSource: 'res/questionnaire/with-a-team.svg',
      },
    ],
  },
  painPoints: {
    question: t`Is there anything that you struggle with while working on your projects?`,
    multi: true,
    showOther: true,
    nextQuestion: 'targetDate',
    answers: [
      {
        answer: t`Lack of Graphics & Animation`,
        code: 'lackGraphics',
        imageSource: 'res/questionnaire/lack-of-graphics.svg',
      },
      {
        answer: t`Lack of Music & Sound`,
        code: 'lackSound',
        imageSource: 'res/questionnaire/lack-of-sounds.svg',
      },
      {
        answer: t`Lack of Marketing & Publicity`,
        code: 'lackMarketing',
        imageSource: 'res/questionnaire/lack-of-marketing.svg',
      },
      {
        answer: t`Implementing in-project monetization`,
        code: 'inAppPurchases',
        imageSource: 'res/questionnaire/in-app-monetization.svg',
      },
      {
        answer: t` Dealing with data integration from external sources`,
        code: 'externalIntegration',
        imageSource: 'res/questionnaire/integration-of-external-services.svg',
      },
    ],
  },
  targetDate: {
    question: t`When do you plan to finish or release your projects?`,
    nextQuestion: 'gameDevelopmentExperience',
    answers: [
      {
        answer: t`Less than a month`,
        code: '1MonthOrLess',
        imageSource: 'res/questionnaire/delay-less-than-1-month.svg',
      },
      {
        answer: t`Around 1 or 2 months`,
        code: '1To2Months',
        imageSource: 'res/questionnaire/delay-1-to-2-months.svg',
      },
      {
        answer: t`Around 3 to 5 months`,
        code: '3To5Months',
        imageSource: 'res/questionnaire/delay-3-to-5-months.svg',
      },
      {
        answer: t`More than 6 months`,
        code: '6MonthsPlus',
        imageSource: 'res/questionnaire/delay-6-months-plus.svg',
      },
      {
        answer: t`In around a year`,
        code: '1Year',
        imageSource: 'res/questionnaire/delay-1-year.svg',
      },
      {
        answer: t`I don’t have a specific deadline`,
        code: 'NoDeadline',
        imageSource: 'res/questionnaire/delay-no-deadline.svg',
      },
    ],
  },
  gameDevelopmentExperience: {
    question: t`What kind of projects do you want to build with GDevelop?`,
    // TODO: Add logic to either return nothing (end of path) or return 'targetPlatform'
    getNextQuestion: (results: any) => 'targetPlatform',
    answers: [
      {
        answer: t`No experience at all`,
        code: 'none',
        imageSource: 'res/questionnaire/zero-coding-experience.svg',
      },
      {
        answer: t`Some no-code experience`,
        code: 'someNoCode',
        imageSource: 'res/questionnaire/no-code-experience.svg',
      },
      {
        answer: t`Some code experience`,
        code: 'someCode',
        imageSource: 'res/questionnaire/coding-experience.svg',
      },
    ],
  },
  targetPlatform: {
    question: t`Where are you planing to publish your project(s)?`,
    multi: true,
    answers: [
      {
        answer: t`On Steam and/or Epic Games`,
        code: 'Steam',
        imageSource: 'res/questionnaire/target-steam.svg',
      },
      {
        answer: t`On Itch and/or Newgrounds`,
        code: 'Itch',
        imageSource: 'res/questionnaire/target-itch.svg',
      },
      {
        answer: t`On Poki and/or CrazyGames`,
        code: 'Poki',
        imageSource: 'res/questionnaire/target-poki.svg',
      },
      {
        answer: t`Android mobile devices (Google Play, Amazon)`,
        code: 'PlayStore',
        imageSource: 'res/questionnaire/target-play-store.svg',
      },
      {
        answer: t`Apple mobile devices (App Store)`,
        code: 'AppStore',
        imageSource: 'res/questionnaire/target-app-store.svg',
      },
      {
        answer: t`Sharing the final file with the client`,
        code: 'Export',
        imageSource: 'res/questionnaire/target-client.svg',
      },
      {
        answer: t`Personal or company website`,
        code: 'Personal',
        imageSource: 'res/questionnaire/target-personal.svg',
      },
      {
        answer: t`Consoles`,
        code: 'Console',
        imageSource: 'res/questionnaire/target-console.svg',
      },
      {
        answer: t`Other`,
        code: 'Other',
        imageSource: 'res/questionnaire/other.svg',
      },
    ],
  },
};

export default questionnaire;
