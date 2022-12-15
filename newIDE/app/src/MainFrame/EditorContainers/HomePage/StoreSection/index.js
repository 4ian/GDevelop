// @flow
import * as React from 'react';
import SectionContainer from '../SectionContainer';
import { AssetStore } from '../../../../AssetStore';
import { Line } from '../../../../UI/Grid';
import RaisedButton from '../../../../UI/RaisedButton';
import { Trans } from '@lingui/macro';

type Props = {|
  project: gdProject,
|};

const StoreSection = ({ project }: Props) => {
  return (
    <SectionContainer flexBody>
      <AssetStore />
      <Line justifyContent="flex-end">
        <RaisedButton
          primary
          onClick={() => {
            /* TODO */
          }}
          label={
            project ? (
              <Trans>Add to the project</Trans>
            ) : (
              <Trans>Create a project with these assets</Trans>
            )
          }
        />
      </Line>
    </SectionContainer>
  );
};

export default StoreSection;
