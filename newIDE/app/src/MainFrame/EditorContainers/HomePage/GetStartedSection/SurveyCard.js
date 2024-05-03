// @flow
import * as React from 'react';
import RaisedButton from '../../../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import { Line, Spacer } from '../../../../UI/Grid';
import { ColumnStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import { CalloutCard } from '../../../../UI/CalloutCard';

type Props = {|
  onStartSurvey: () => void,
  hasFilledSurveyAlready: boolean,
|};

export const SurveyCard = ({
  onStartSurvey,
  hasFilledSurveyAlready,
}: Props) => {
  return (
    <CalloutCard
      renderImage={style => (
        <img src="res/start-survey.svg" style={style} alt="Survey" />
      )}
    >
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
    </CalloutCard>
  );
};
