// @flow
import { t } from '@lingui/macro';
import Learning from '../../../../UI/CustomSvgIcons/Learning';
import Teaching from '../../../../UI/CustomSvgIcons/Teaching';
import LearningOrTeaching from '../../../../UI/CustomSvgIcons/LearningOrTeaching';
import BuildingVideoGameOrApp from '../../../../UI/CustomSvgIcons/BuildingVideoGameOrApp';
import ThroughATeacher from '../../../../UI/CustomSvgIcons/ThroughATeacher';
import OnMyOwn from '../../../../UI/CustomSvgIcons/OnMyOwn';
import GameToPublish from '../../../../UI/CustomSvgIcons/GameToPublish';
import InteractiveServiceForClients from '../../../../UI/CustomSvgIcons/InteractiveServiceForClients';
import SeriousGame from '../../../../UI/CustomSvgIcons/SeriousGame';
import Other from '../../../../UI/CustomSvgIcons/Other';
import VideoGame from '../../../../UI/CustomSvgIcons/VideoGame';
import InteractiveContent from '../../../../UI/CustomSvgIcons/InteractiveContent';
import AppOrTool from '../../../../UI/CustomSvgIcons/AppOrTool';
import LackOfGraphics from '../../../../UI/CustomSvgIcons/LackOfGraphics';
import LackOfMusic from '../../../../UI/CustomSvgIcons/LackOfMusic';
import LackOfMarketing from '../../../../UI/CustomSvgIcons/LackOfMarketing';
import InAppPurchase from '../../../../UI/CustomSvgIcons/InAppPurchase';
import DealingWithExternalTools from '../../../../UI/CustomSvgIcons/DealingWithExternalTools';
import DelayLessThanAMonth from '../../../../UI/CustomSvgIcons/DelayLessThanAMonth';
import Delay1To2Months from '../../../../UI/CustomSvgIcons/Delay1To2Months';
import Delay3To5Months from '../../../../UI/CustomSvgIcons/Delay3To5Months';
import DelayMoreThan6Months from '../../../../UI/CustomSvgIcons/DelayMoreThan6Months';
import DelayAroundAYear from '../../../../UI/CustomSvgIcons/DelayAroundAYear';
import DelayNoSpecificDeadline from '../../../../UI/CustomSvgIcons/DelayNoSpecificDeadline';
import WorkingAlone from '../../../../UI/CustomSvgIcons/WorkingAlone';
import WorkingWithAnotherPerson from '../../../../UI/CustomSvgIcons/WorkingWithAnotherPerson';
import WorkingInACompany from '../../../../UI/CustomSvgIcons/WorkingInACompany';
import NoCodingExperience from '../../../../UI/CustomSvgIcons/NoCodingExperience';
import NoCodeExperience from '../../../../UI/CustomSvgIcons/NoCodeExperience';
import CodingExperience from '../../../../UI/CustomSvgIcons/CodingExperience';
import TargetSteam from '../../../../UI/CustomSvgIcons/TargetSteam';
import TargetItch from '../../../../UI/CustomSvgIcons/TargetItch';
import TargetPoki from '../../../../UI/CustomSvgIcons/TargetPoki';
import TargetPlayStore from '../../../../UI/CustomSvgIcons/TargetPlayStore';
import TargetAppStore from '../../../../UI/CustomSvgIcons/TargetAppStore';
import TargetClient from '../../../../UI/CustomSvgIcons/TargetClient';
import TargetPersonal from '../../../../UI/CustomSvgIcons/TargetPersonal';
import TargetConsole from '../../../../UI/CustomSvgIcons/TargetConsole';

const questionnaire = {
  creationGoal: {
    question: t`What is your goal with GDevelop?`,
    // TODO: Add coding experience question if Other was chosen.
    showOther: true,
    answers: [
      {
        answer: t`I'm learning or teaching game development`,
        code: 'learningOrTeaching',
        nextQuestion: 'teachOrStudy',
        Image: LearningOrTeaching,
      },
      {
        answer: t`I'm building a video game or app`,
        code: 'building',
        nextQuestion: 'buildingKindOfProjects',
        Image: BuildingVideoGameOrApp,
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
        Image: Teaching,
      },
      {
        answer: t`I am learning game development`,
        code: 'learning',
        nextQuestion: 'learnHow',
        Image: Learning,
      },
    ],
  },
  learnHow: {
    question: t`How are you learning game dev?`,
    answers: [
      {
        answer: t`Through a teacher`,
        code: 'withTeacher',
        Image: ThroughATeacher,
      },
      {
        answer: t`On my own`,
        code: 'alone',
        nextQuestion: 'learningKindOfProjects',
        Image: OnMyOwn,
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
        Image: GameToPublish,
      },
      {
        answer: t`New interactive services for existent clients`,
        code: 'interactiveService',
        nextQuestion: 'gameDevelopmentExperience',
        Image: InteractiveServiceForClients,
      },
      {
        answer: t`Games to learn or teach something`,
        code: 'seriousGame',
        Image: SeriousGame,
      },
      {
        answer: t`Other`,
        code: 'other',
        nextQuestion: 'gameDevelopmentExperience',
        Image: Other,
      },
    ],
  },
  buildingKindOfProjects: {
    question: t`What kind of projects do you want to build with GDevelop?`,
    nextQuestion: 'workingTeam',
    answers: [
      { answer: t`Video game`, code: 'videoGame', Image: VideoGame },
      {
        answer: t`Interactive content`,
        code: 'interactiveContent',
        Image: InteractiveContent,
      },
      { answer: t`App or tool`, code: 'appOrTool', Image: AppOrTool },
      {
        answer: t`Game for teaching or learning`,
        code: 'seriousGame',
        Image: SeriousGame,
      },
    ],
  },
  workingTeam: {
    question: t`How are you working on your projects?`,
    nextQuestion: 'painPoints',
    answers: [
      { answer: t`Completely alone`, code: 'alone', Image: WorkingAlone },
      {
        answer: t`With at least one other person`,
        code: 'onePlus',
        Image: WorkingWithAnotherPerson,
      },
      {
        answer: t`With an established team of people during the whole project`,
        code: 'team',
        Image: WorkingInACompany,
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
        Image: LackOfGraphics,
      },
      {
        answer: t`Lack of Music & Sound`,
        code: 'lackSound',
        Image: LackOfMusic,
      },
      {
        answer: t`Lack of Marketing & Publicity`,
        code: 'lackMarketing',
        Image: LackOfMarketing,
      },
      {
        answer: t`Implementing in-project monetization`,
        code: 'inAppPurchases',
        Image: InAppPurchase,
      },
      {
        answer: t` Dealing with data integration from external sources`,
        code: 'externalIntegration',
        Image: DealingWithExternalTools,
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
        Image: DelayLessThanAMonth,
      },
      {
        answer: t`Around 1 or 2 months`,
        code: '1To2Months',
        Image: Delay1To2Months,
      },
      {
        answer: t`Around 3 to 5 months`,
        code: '3To5Months',
        Image: Delay3To5Months,
      },
      {
        answer: t`More than 6 months`,
        code: '6MonthsPlus',
        Image: DelayMoreThan6Months,
      },
      { answer: t`In around a year`, code: '1Year', Image: DelayAroundAYear },
      {
        answer: t`I don’t have a specific deadline`,
        code: 'Undecided',
        Image: DelayNoSpecificDeadline,
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
        Image: NoCodingExperience,
      },
      {
        answer: t`Some no-code experience`,
        code: 'someNoCode',
        Image: NoCodeExperience,
      },
      {
        answer: t`Some code experience`,
        code: 'someCode',
        Image: CodingExperience,
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
        Image: TargetSteam,
      },
      { answer: t`On Itch and/or Newgrounds`, code: 'Itch', Image: TargetItch },
      { answer: t`On Poki and/or CrazyGames`, code: 'Poki', Image: TargetPoki },
      {
        answer: t`Android mobile devices (Google Play, Amazon)`,
        code: 'PlayStore',
        Image: TargetPlayStore,
      },
      {
        answer: t`Apple mobile devices (App Store)`,
        code: 'AppStore',
        Image: TargetAppStore,
      },
      {
        answer: t`Sharing the final file with the client`,
        code: 'Export',
        Image: TargetClient,
      },
      {
        answer: t`Personal or company website`,
        code: 'Personal',
        Image: TargetPersonal,
      },
      { answer: t`Consoles`, code: 'Console', Image: TargetConsole },
      { answer: t`Other`, code: 'Other', Image: Other },
    ],
  },
};

export default questionnaire;
