// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { makeStyles } from '@material-ui/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { type AuthenticatedUser } from '../../../../Profile/AuthenticatedUserContext';
import { type Subscription } from '../../../../Utils/GDevelopServices/Usage';
import { TutorialContext } from '../../../../Tutorial/TutorialContext';
import { SectionRow } from '../SectionContainer';
import GuidedLessons from '../InAppTutorials/GuidedLessons';
import { formatTutorialToImageTileComponent } from '../LearnSection';
import ImageTileRow from '../../../../UI/ImageTileRow';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Text from '../../../../UI/Text';
import { Column } from '../../../../UI/Grid';
import { type Tutorial } from '../../../../Utils/GDevelopServices/Tutorial';
import { CardWidget } from '../CardWidget';
import Window from '../../../../Utils/Window';
import { ColumnStackLayout } from '../../../../UI/Layout';
import {
  type GuidedLessonsRecommendation,
  type PlanRecommendation,
} from '../../../../Utils/GDevelopServices/User';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import PlanRecommendationRow from './PlanRecommendationRow';
import useSubscriptionPlans from '../../../../Utils/UseSubscriptionPlans';

const styles = {
  textTutorialContent: {
    padding: 20,
    flex: 1,
    display: 'flex',
  },
};

const useStyles = makeStyles({
  tile: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
});

const getTextTutorialsColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 2;
    case 'large':
      return 4;
    case 'xlarge':
      return 5;
    default:
      return 3;
  }
};
const getVideoTutorialsColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 3;
    case 'large':
      return 5;
    case 'xlarge':
      return 6;
    default:
      return 3;
  }
};
const getTutorialsLimitsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 3;
    case 'medium':
      return 3;
    case 'large':
      return 5;
    case 'xlarge':
      return 5;
    default:
      return 3;
  }
};

const isPlanRecommendationRelevant = (
  subscription: Subscription,
  planRecommendation: PlanRecommendation
): boolean => {
  // Don't recommend plans to holders of education plan.
  if (subscription.planId === 'gdevelop_education') return false;

  const relevantPlans =
    subscription.planId === 'gdevelop_silver' ||
    subscription.planId === 'gdevelop_indie'
      ? ['gold', 'startup', 'business', 'education']
      : subscription.planId === 'gdevelop_gold' ||
        subscription.planId === 'gdevelop_pro'
      ? ['startup', 'business', 'education']
      : subscription.planId === 'gdevelop_startup'
      ? ['business']
      : [];
  return relevantPlans.includes(planRecommendation.id);
};

type TextTutorialsRowProps = {|
  tutorials: Array<Tutorial>,
|};

const TextTutorialsRow = ({ tutorials }: TextTutorialsRowProps) => {
  const classes = useStyles();
  const windowWidth = useResponsiveWindowWidth();

  return (
    <>
      <Column noMargin>
        <Text size="section-title" noMargin>
          <Trans>Read</Trans>
        </Text>
        <Text>
          <Trans>
            Text-based content directly from GDevelop’s site and Wiki.
          </Trans>
        </Text>
      </Column>
      <GridList
        cols={getTextTutorialsColumnsFromWidth(windowWidth)}
        cellHeight="auto"
        spacing={10}
      >
        {tutorials.map(tutorial => (
          <GridListTile key={tutorial.id} classes={{ tile: classes.tile }}>
            <CardWidget
              onClick={() => Window.openExternalURL(tutorial.link)}
              size="large"
            >
              <div style={styles.textTutorialContent}>
                <ColumnStackLayout expand justifyContent="center" useFullHeight>
                  <Text noMargin size="block-title">
                    {tutorial.title}
                  </Text>
                  <Text noMargin size="body" color="secondary">
                    {tutorial.description}
                  </Text>
                </ColumnStackLayout>
              </div>
            </CardWidget>
          </GridListTile>
        ))}
      </GridList>
    </>
  );
};

type Props = {|
  authenticatedUser: AuthenticatedUser,
  selectInAppTutorial: (tutorialId: string) => void,
|};

const RecommendationList = ({
  authenticatedUser,
  selectInAppTutorial,
}: Props) => {
  const { recommendations, subscription, profile } = authenticatedUser;
  const { tutorials } = React.useContext(TutorialContext);
  const { getTutorialProgress } = React.useContext(PreferencesContext);
  const { subscriptionPlansWithPrices } = useSubscriptionPlans({
    includeLegacy: false,
  });

  if (!recommendations) return null;

  const recommendedTutorials = tutorials
    ? recommendations
        .map(recommendation =>
          recommendation.type === 'gdevelop-tutorial'
            ? tutorials.find(tutorial => tutorial.id === recommendation.id)
            : null
        )
        .filter(Boolean)
    : [];

  const recommendedVideoTutorials = recommendedTutorials.filter(
    tutorial => tutorial.type === 'video'
  );
  const recommendedTextTutorials = recommendedTutorials.filter(
    tutorial => tutorial.type === 'text'
  );

  // $FlowIgnore
  const guidedLessonsRecommendation: ?GuidedLessonsRecommendation = recommendations.find(
    recommendation => recommendation.type === 'guided-lessons'
  );
  const guidedLessonsIds = guidedLessonsRecommendation
    ? guidedLessonsRecommendation.lessonsIds
    : null;

  // $FlowIgnore
  const planRecommendation: ?PlanRecommendation = recommendations.find(
    recommendation => recommendation.type === 'plan'
  );

  const getTutorialPartProgress = ({ tutorialId }: { tutorialId: string }) => {
    const tutorialProgress = getTutorialProgress({
      tutorialId,
      userId: authenticatedUser.profile
        ? authenticatedUser.profile.id
        : undefined,
    });
    if (!tutorialProgress || !tutorialProgress.progress) return 0;
    return tutorialProgress.progress[0]; // guided lessons only have one part.
  };

  return (
    <I18n>
      {({ i18n }) => {
        const items = [];

        if (recommendedVideoTutorials.length) {
          items.push(
            <SectionRow key="videos">
              <ImageTileRow
                title={<Trans>Watch</Trans>}
                margin="dense"
                items={recommendedVideoTutorials.map(tutorial =>
                  formatTutorialToImageTileComponent(i18n, tutorial)
                )}
                getColumnsFromWidth={getVideoTutorialsColumnsFromWidth}
                getLimitFromWidth={getTutorialsLimitsFromWidth}
              />
            </SectionRow>
          );
        }
        if (guidedLessonsRecommendation) {
          const displayTextAfterGuidedLessons = guidedLessonsIds
            ? guidedLessonsIds
                .map(tutorialId => getTutorialPartProgress({ tutorialId }))
                .every(progress => progress === 100)
            : false;

          items.push(
            <SectionRow key="guided-lessons">
              <Text size="section-title" noMargin>
                <Trans>Do</Trans>
              </Text>
              <Text>
                <Trans>
                  A selection of in-app tutorials to learn popular mechanics
                </Trans>
              </Text>
              <GuidedLessons
                selectInAppTutorial={selectInAppTutorial}
                lessonsIds={guidedLessonsIds}
              />
              {displayTextAfterGuidedLessons && (
                <Text>
                  <Trans>
                    Congratulations on completing this selection of guided
                    lessons! Find all lessons in the Learn section.
                  </Trans>
                </Text>
              )}
            </SectionRow>
          );
        }
        if (recommendedTextTutorials.length) {
          items.push(
            <SectionRow key="texts">
              <TextTutorialsRow tutorials={recommendedTextTutorials} />
            </SectionRow>
          );
        }
        if (planRecommendation) {
          const shouldDisplayPlanRecommendation =
            profile &&
            !profile.isStudent &&
            (!subscription ||
              isPlanRecommendationRelevant(subscription, planRecommendation));
          if (shouldDisplayPlanRecommendation && subscriptionPlansWithPrices) {
            items.push(
              <SectionRow key="plan">
                <PlanRecommendationRow
                  recommendationPlanId={planRecommendation.id}
                  subscriptionPlansWithPrices={subscriptionPlansWithPrices}
                  i18n={i18n}
                />
              </SectionRow>
            );
          }
        }
        return items;
      }}
    </I18n>
  );
};

export default RecommendationList;
