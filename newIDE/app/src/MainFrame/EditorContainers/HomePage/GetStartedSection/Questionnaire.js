// @flow
import { t } from '@lingui/macro';
import { type MessageDescriptor } from '../../../../Utils/i18n/MessageDescriptor.flow';

export const firstQuestion = 'creationGoal';

export type AnswerData = {|
  text: MessageDescriptor,
  code: string,
  nextQuestion?: string,
  imageSource: string,
|};

export type QuestionData = {|
  text: MessageDescriptor,
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
    text: t`What is your goal with GDevelop?`,
    // TODO: Add coding experience question if Other was chosen.
    showOther: true,
    answers: [
      {
        text: t`I'm learning or teaching game development`,
        code: 'learningOrTeaching',
        nextQuestion: 'teachOrStudy',
        imageSource: 'res/questionnaire/learning-or-teaching.svg',
      },
      {
        text: t`I'm building a video game or app`,
        code: 'building',
        nextQuestion: 'buildingKindOfProjects',
        imageSource: 'res/questionnaire/building-video-game-or-app.svg',
      },
    ],
  },
  teachOrStudy: {
    text: t`Are you teaching or studying game development?`,
    answers: [
      {
        text: t`I am teaching game development`,
        code: 'teaching',
        nextQuestion: 'gameDevelopmentExperience',
        imageSource: 'res/questionnaire/learning.svg',
      },
      {
        text: t`I am learning game development`,
        code: 'learning',
        nextQuestion: 'learnHow',
        imageSource: 'res/questionnaire/teaching.svg',
      },
    ],
  },
  learnHow: {
    text: t`How are you learning game dev?`,
    answers: [
      {
        text: t`Through a teacher`,
        code: 'withTeacher',
        imageSource: 'res/questionnaire/through-a-teacher.svg',
      },
      {
        text: t`On my own`,
        code: 'alone',
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
        code: 'gameToPublish',
        nextQuestion: 'gameDevelopmentExperience',
        imageSource: 'res/questionnaire/game-to-publish.svg',
      },
      {
        text: t`New interactive services for existent clients`,
        code: 'interactiveService',
        nextQuestion: 'gameDevelopmentExperience',
        imageSource: 'res/questionnaire/interactive-services-for-clients.svg',
      },
      {
        text: t`Games to learn or teach something`,
        code: 'seriousGame',
        imageSource: 'res/questionnaire/serious-game.svg',
      },
      {
        text: t`Other`,
        code: 'other',
        nextQuestion: 'gameDevelopmentExperience',
        imageSource: 'res/questionnaire/other.svg',
      },
    ],
  },
  buildingKindOfProjects: {
    text: t`What kind of projects do you want to build with GDevelop?`,
    nextQuestion: 'workingTeam',
    multi: true,
    answers: [
      {
        text: t`Video game`,
        code: 'videoGame',
        imageSource: 'res/questionnaire/video-game.svg',
      },
      {
        text: t`Interactive content`,
        code: 'interactiveContent',
        imageSource: 'res/questionnaire/interactive-content.svg',
      },
      {
        text: t`App or tool`,
        code: 'appOrTool',
        imageSource: 'res/questionnaire/app-or-tool.svg',
      },
      {
        text: t`Game for teaching or learning`,
        code: 'seriousGame',
        imageSource: 'res/questionnaire/serious-game.svg',
      },
    ],
  },
  workingTeam: {
    text: t`How are you working on your projects?`,
    nextQuestion: 'painPoints',
    answers: [
      {
        text: t`Completely alone`,
        code: 'alone',
        imageSource: 'res/questionnaire/completely-alone.svg',
      },
      {
        text: t`With at least one other person`,
        code: 'onePlus',
        imageSource: 'res/questionnaire/with-at-least-one-other-person.svg',
      },
      {
        text: t`With an established team of people during the whole project`,
        code: 'team',
        imageSource: 'res/questionnaire/with-a-team.svg',
      },
    ],
  },
  painPoints: {
    text: t`Is there anything that you struggle with while working on your projects?`,
    multi: true,
    showOther: true,
    nextQuestion: 'targetDate',
    answers: [
      {
        text: t`Lack of Graphics & Animation`,
        code: 'lackGraphics',
        imageSource: 'res/questionnaire/lack-of-graphics.svg',
      },
      {
        text: t`Lack of Music & Sound`,
        code: 'lackSound',
        imageSource: 'res/questionnaire/lack-of-sounds.svg',
      },
      {
        text: t`Lack of Marketing & Publicity`,
        code: 'lackMarketing',
        imageSource: 'res/questionnaire/lack-of-marketing.svg',
      },
      {
        text: t`Implementing in-project monetization`,
        code: 'inAppPurchases',
        imageSource: 'res/questionnaire/in-app-monetization.svg',
      },
      {
        text: t` Dealing with data integration from external sources`,
        code: 'externalIntegration',
        imageSource: 'res/questionnaire/integration-of-external-services.svg',
      },
    ],
  },
  targetDate: {
    text: t`When do you plan to finish or release your projects?`,
    nextQuestion: 'gameDevelopmentExperience',
    answers: [
      {
        text: t`Less than a month`,
        code: '1MonthOrLess',
        imageSource: 'res/questionnaire/delay-less-than-1-month.svg',
      },
      {
        text: t`Around 1 or 2 months`,
        code: '1To2Months',
        imageSource: 'res/questionnaire/delay-1-to-2-months.svg',
      },
      {
        text: t`Around 3 to 5 months`,
        code: '3To5Months',
        imageSource: 'res/questionnaire/delay-3-to-5-months.svg',
      },
      {
        text: t`More than 6 months`,
        code: '6MonthsPlus',
        imageSource: 'res/questionnaire/delay-6-months-plus.svg',
      },
      {
        text: t`In around a year`,
        code: '1Year',
        imageSource: 'res/questionnaire/delay-1-year.svg',
      },
      {
        text: t`I don’t have a specific deadline`,
        code: 'NoDeadline',
        imageSource: 'res/questionnaire/delay-no-deadline.svg',
      },
    ],
  },
  gameDevelopmentExperience: {
    text: t`What kind of projects do you want to build with GDevelop?`,
    // TODO: Add logic to either return nothing (end of path) or return 'targetPlatform'
    getNextQuestion: (results: any) => 'targetPlatform',
    answers: [
      {
        text: t`No experience at all`,
        code: 'none',
        imageSource: 'res/questionnaire/zero-coding-experience.svg',
      },
      {
        text: t`Some no-code experience`,
        code: 'someNoCode',
        imageSource: 'res/questionnaire/no-code-experience.svg',
      },
      {
        text: t`Some code experience`,
        code: 'someCode',
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
        code: 'Steam',
        imageSource: 'res/questionnaire/target-steam.svg',
      },
      {
        text: t`On Itch and/or Newgrounds`,
        code: 'Itch',
        imageSource: 'res/questionnaire/target-itch.svg',
      },
      {
        text: t`On Poki and/or CrazyGames`,
        code: 'Poki',
        imageSource: 'res/questionnaire/target-poki.svg',
      },
      {
        text: t`Android mobile devices (Google Play, Amazon)`,
        code: 'PlayStore',
        imageSource: 'res/questionnaire/target-play-store.svg',
      },
      {
        text: t`Apple mobile devices (App Store)`,
        code: 'AppStore',
        imageSource: 'res/questionnaire/target-app-store.svg',
      },
      {
        text: t`Sharing the final file with the client`,
        code: 'Export',
        imageSource: 'res/questionnaire/target-client.svg',
      },
      {
        text: t`Personal or company website`,
        code: 'Personal',
        imageSource: 'res/questionnaire/target-personal.svg',
      },
      {
        text: t`Consoles`,
        code: 'Console',
        imageSource: 'res/questionnaire/target-console.svg',
      },
      {
        text: t`Other`,
        code: 'Other',
        imageSource: 'res/questionnaire/other.svg',
      },
    ],
  },
};

export default questionnaire;
