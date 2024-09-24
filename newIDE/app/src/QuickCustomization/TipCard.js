// @flow
import * as React from 'react';
import Text from '../UI/Text';
import { Column, Line } from '../UI/Grid';
import Paper from '../UI/Paper';
import Lightbulb from '../UI/CustomSvgIcons/Lightbulb';
import { ColumnStackLayout } from '../UI/Layout';

type Props = {|
  title: React.Node,
  description: React.Node,
|};

const TipCard = ({ title, description }: Props) => {
  return (
    <Column noMargin>
      <Paper background="light">
        <Line alignItems="flex-start" justifyContent="flex-start" expand>
          <Column alignItems="center" justifyContent="flex-start">
            <Lightbulb />
          </Column>
          <ColumnStackLayout
            alignItems="flex-start"
            justifyContent="flex-start"
          >
            <Text noMargin size="sub-title">
              {title}
            </Text>
            <Text noMargin size="body">
              {description}
            </Text>
          </ColumnStackLayout>
        </Line>
      </Paper>
    </Column>
  );
};

export default TipCard;
