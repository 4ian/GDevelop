// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../../GDevelopJsInitializerDecorator';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { Column, Line } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import ScrollView from '../../../../UI/ScrollView';
import '../../../../UI/Theme/Global/Scrollbar.css';
import '../../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/Layout/Grid',
};

export const LineAndScrollViewInAFixedHeightContainer = (): React.Node => (
  <FixedHeightFlexContainer height={100}>
    <Column expand>
      <Line overflow="hidden">
        <ScrollView>
          <Text>123</Text>
          <Text>456</Text>
          <Text>789</Text>
          <Text>123</Text>
          <Text>456</Text>
          <Text>789</Text>
        </ScrollView>
        <ScrollView>
          <Text>123</Text>
          <Text>456</Text>
          <Text>789</Text>
          <Text>123</Text>
          <Text>456</Text>
          <Text>789</Text>
        </ScrollView>
      </Line>
    </Column>
  </FixedHeightFlexContainer>
);
LineAndScrollViewInAFixedHeightContainer.storyName =
  'Line and ScrollView in a fixed height container';
