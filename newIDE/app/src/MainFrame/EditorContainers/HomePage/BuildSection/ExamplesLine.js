// @flow
import * as React from 'react';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import { Column } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import { LineStackLayout } from '../../../../UI/Layout';
import FlatButton from '../../../../UI/FlatButton';
import { Trans } from '@lingui/macro';
import Add from '../../../../UI/CustomSvgIcons/Add';
import ExamplesGrid from './ExamplesGrid';
import { prepareExamples } from '../../../../AssetStore/ExampleStore';

type ExamplesLineProps = {|
  exampleShortHeaders: Array<ExampleShortHeader>,
  onExpand: () => void,
  onOpen: (exampleShortHeader: ExampleShortHeader) => void,
|};

const ExamplesLine = ({
  exampleShortHeaders,
  onExpand,
  onOpen,
}: ExamplesLineProps) => {
  const preparedExampleShortHeaders = prepareExamples(exampleShortHeaders);
  return (
    <>
      <LineStackLayout
        justifyContent="space-between"
        alignItems="center"
        noMargin
        expand
      >
        <Column noMargin>
          <Text size="section-title">
            <Trans>Recommended templates</Trans>
          </Text>
        </Column>
        <Column noMargin>
          <FlatButton
            onClick={onExpand}
            label={<Trans>Show all</Trans>}
            rightIcon={<Add fontSize="small" />}
          />
        </Column>
      </LineStackLayout>
      <ExamplesGrid
        exampleShortHeaders={preparedExampleShortHeaders}
        limit={6}
        onOpen={onOpen}
      />
    </>
  );
};

export default ExamplesLine;
