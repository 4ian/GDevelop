// @flow
import * as React from 'react';
import {
  type Tutorial,
  type TutorialCategory,
} from '../../../../Utils/GDevelopServices/Tutorial';
import { Column, Line } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import { LineStackLayout } from '../../../../UI/Layout';
import FlatButton from '../../../../UI/FlatButton';
import { Trans } from '@lingui/macro';
import ArrowRight from '../../../../UI/CustomSvgIcons/ArrowRight';
import TutorialsGrid from './TutorialsGrid';
import { TUTORIAL_CATEGORY_TEXTS } from '.';

type TutorialsLineProps = {|
  category: TutorialCategory,
  tutorials: Array<Tutorial>,
  onSelectCategory: (?TutorialCategory) => void,
|};

const TutorialsLine = ({
  category,
  tutorials,
  onSelectCategory,
}: TutorialsLineProps) => {
  const texts = TUTORIAL_CATEGORY_TEXTS[category];
  const filteredTutorials = tutorials.filter(
    tutorial => tutorial.category === category
  );
  return (
    <>
      <LineStackLayout
        justifyContent="space-between"
        alignItems="center"
        noMargin
        expand
      >
        <Column noMargin>
          <Text size="section-title">{texts.title}</Text>
        </Column>
        <Column noMargin>
          <FlatButton
            onClick={() => onSelectCategory(category)}
            label={<Trans>See all</Trans>}
            rightIcon={<ArrowRight fontSize="small" />}
          />
        </Column>
      </LineStackLayout>
      <Line noMargin>
        <Text noMargin>{texts.description}</Text>
      </Line>
      <TutorialsGrid tutorials={filteredTutorials} limit={5} />
    </>
  );
};

export default TutorialsLine;
