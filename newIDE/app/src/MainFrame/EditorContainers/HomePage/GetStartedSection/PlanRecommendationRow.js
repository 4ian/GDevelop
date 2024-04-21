// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n as I18nType } from '@lingui/core';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { type SubscriptionPlanWithPricingSystems } from '../../../../Utils/GDevelopServices/Usage';
import { Column, Line } from '../../../../UI/Grid';
import Paper from '../../../../UI/Paper';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import CheckCircle from '../../../../UI/CustomSvgIcons/CheckCircle';
import RaisedButton from '../../../../UI/RaisedButton';
import Window from '../../../../Utils/Window';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';

const styles = {
  bulletIcon: { width: 20, height: 20, marginRight: 10 },
  bulletText: { flex: 1 },
  planRecommendationThumbnail: { maxWidth: 350, flex: 1 },
  planRecommendationContainer: { borderRadius: 8, maxWidth: 850, padding: 8 },
};

const planImages = {
  individual: {
    path: 'res/plan-individual.svg',
    alt: t`Red hero taking care of their diamond`,
  },
  education: {
    path: 'res/plan-education.svg',
    alt: t`Red hero sharing knowledge with pink cloud students`,
  },
  professional: {
    path: 'res/plan-professional.svg',
    alt: t`Red and Green heroes running side by side carrying their diamonds`,
  },
};

const planDetailsById = {
  silver: {
    title: <Trans>GDevelop's Silver plan</Trans>,
    description: (
      <Trans>Unlock GDevelop's features to build more and faster.</Trans>
    ),
    image: planImages.individual,
    link: 'https://gdevelop.io/pricing/individual',
  },
  gold: {
    title: <Trans>GDevelop's Gold plan</Trans>,
    description: (
      <Trans>Unlock GDevelop's features to build more and faster.</Trans>
    ),
    image: planImages.individual,
    link: 'https://gdevelop.io/pricing/individual',
  },
  education: {
    title: <Trans>GDevelop's Education plan</Trans>,
    description: (
      <Trans>
        For universities, extra curricular classes and summer camps.
      </Trans>
    ),
    image: planImages.education,
    link: 'https://gdevelop.io/pricing/education',
  },
  startup: {
    title: <Trans>GDevelop's Startup plan</Trans>,
    description: (
      <Trans>
        Get the most out of GDevelop and get your games out in no time.
      </Trans>
    ),
    image: planImages.professional,
    link: 'https://gdevelop.io/pricing/business',
  },
  business: {
    title: <Trans>GDevelop's Business plan</Trans>,
    description: (
      <Trans>
        Get the most out of GDevelop and get your games out in no time.
      </Trans>
    ),
    image: planImages.professional,
    link: 'https://gdevelop.io/pricing/business',
  },
};

const PlanRecommendationRow = ({
  recommendationPlanId,
  subscriptionPlansWithPricingSystems,
  i18n,
}: {|
  recommendationPlanId: string,
  subscriptionPlansWithPricingSystems: SubscriptionPlanWithPricingSystems[],
  i18n: I18nType,
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { isMobile } = useResponsiveWindowSize();
  const planToUse =
    recommendationPlanId === 'silver'
      ? 'gdevelop_silver'
      : recommendationPlanId === 'gold'
      ? 'gdevelop_gold'
      : recommendationPlanId === 'education'
      ? 'gdevelop_education'
      : recommendationPlanId === 'startup' ||
        recommendationPlanId === 'business'
      ? 'gdevelop_startup'
      : null;
  if (!planToUse) return null;

  const plan = subscriptionPlansWithPricingSystems.find(
    plan => plan.id === planToUse
  );
  if (!plan) return null;

  const planDetails = planDetailsById[recommendationPlanId];

  return (
    <Line justifyContent="center">
      <Paper
        background="dark"
        style={{
          ...styles.planRecommendationContainer,
          border: `1px solid ${gdevelopTheme.palette.secondary}`,
        }}
      >
        <ResponsiveLineStackLayout noColumnMargin noMargin>
          <img
            src={planDetails.image.path}
            alt={i18n._(planDetails.image.alt)}
            style={styles.planRecommendationThumbnail}
          />
          <Line expand>
            <ColumnStackLayout>
              <Text
                noMargin
                align={isMobile ? 'center' : 'left'}
                size="section-title"
              >
                {planDetails.title}
              </Text>
              <Text align={isMobile ? 'center' : 'left'}>
                {planDetails.description}
              </Text>
              <div style={{ padding: `0 20px` }}>
                <ColumnStackLayout noMargin>
                  {plan.bulletPointsByLocale.map(
                    (bulletPointByLocale, index) => (
                      <Column key={index} expand noMargin>
                        <Line noMargin alignItems="center">
                          <CheckCircle
                            style={{
                              ...styles.bulletIcon,
                              color: gdevelopTheme.message.valid,
                            }}
                          />

                          <Text style={styles.bulletText} size="body2" noMargin>
                            {selectMessageByLocale(i18n, bulletPointByLocale)}
                          </Text>
                        </Line>
                      </Column>
                    )
                  )}
                </ColumnStackLayout>
              </div>
              <Column noMargin>
                <RaisedButton
                  primary
                  label={<Trans>Learn More</Trans>}
                  onClick={() => Window.openExternalURL(planDetails.link)}
                />
              </Column>
            </ColumnStackLayout>
          </Line>
        </ResponsiveLineStackLayout>
      </Paper>
    </Line>
  );
};
export default PlanRecommendationRow;
