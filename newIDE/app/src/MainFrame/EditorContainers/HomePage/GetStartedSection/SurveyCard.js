// @flow
import * as React from 'react';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import RaisedButton from '../../../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import { Line, Spacer } from '../../../../UI/Grid';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import Text from '../../../../UI/Text';

const styles = {
  subscriptionContainer: {
    display: 'flex',
    borderRadius: 10,
    alignItems: 'center',
    padding: 16,
  },
  surveyIcon: {
    width: 200,
    height: 105,
  },
};

type Props = {|
  onStartSurvey: () => void,
  hasFilledSurveyAlready: boolean,
|};

export const SurveyCard = ({
  onStartSurvey,
  hasFilledSurveyAlready,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const subscriptionContainerStyle = {
    ...styles.subscriptionContainer,
    border: `1px solid ${gdevelopTheme.palette.secondary}`,
  };

  return (
    <div style={subscriptionContainerStyle}>
      <ResponsiveLineStackLayout noMargin>
        <img
          src="res/start-survey.svg"
          style={styles.surveyIcon}
          alt="Survey"
        />
        <Line noMargin expand>
          <ColumnStackLayout alignItems="flex-start" expand>
            <Text noMargin size="block-title">
              {hasFilledSurveyAlready ? (
                <Trans>Have you changed your usage of GDevelop?</Trans>
              ) : (
                <Trans>Personalize your suggested content</Trans>
              )}
            </Text>
            <Text noMargin size="body">
              <Trans>
                Answer a 1-minute survey to personalize your “Get started”
                content.
              </Trans>
            </Text>
            <Spacer />
            <RaisedButton
              label={
                hasFilledSurveyAlready ? (
                  <Trans>Redo the survey</Trans>
                ) : (
                  <Trans>Start the survey!</Trans>
                )
              }
              primary
              onClick={onStartSurvey}
            />
            <Spacer />
          </ColumnStackLayout>
        </Line>
      </ResponsiveLineStackLayout>
    </div>
  );
};
