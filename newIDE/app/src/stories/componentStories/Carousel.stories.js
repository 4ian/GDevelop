// @flow
import * as React from 'react';

import paperDecorator from '../PaperDecorator';

import Carousel from '../../UI/Carousel';
import { GridListTile } from '@material-ui/core';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';

export default {
  title: 'Carousel',
  component: Carousel,
  decorators: [paperDecorator],
};

const getRandomItem = (id: string) => (
  <GridListTile key={id}>
    <FixedHeightFlexContainer
      height={400}
      alignItems="center"
      justifyContent="center"
    >
      Test item {id}
    </FixedHeightFlexContainer>
  </GridListTile>
);

export const Default = () => {
  const items = new Array(15).fill(null).map((_, index) => ({
    renderItem: () => getRandomItem(`item-${index}`),
  }));
  return <Carousel items={items} />;
};
