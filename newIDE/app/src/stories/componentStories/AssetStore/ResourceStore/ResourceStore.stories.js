// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import { getPaperDecorator } from '../../../PaperDecorator';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { ResourceStoreStateProvider } from '../../../../AssetStore/ResourceStore/ResourceStoreContext';
import { ResourceStore } from '../../../../AssetStore/ResourceStore';
import MockAdapter from 'axios-mock-adapter';
import { client as assetApiClient } from '../../../../Utils/GDevelopServices/Asset';

export default {
  title: 'AssetStore/ResourceStore',
  component: ResourceStore,
  decorators: [getPaperDecorator('medium')],
};

const ResourceStoreStory = ({ kind }: {| kind: 'audio' | 'font' | 'svg' |}) => {
  const [
    selectedResourceIndex,
    setSelectedResourceIndex,
  ] = React.useState<?number>(null);
  return (
    <FixedHeightFlexContainer height={600}>
      <ResourceStoreStateProvider>
        <ResourceStore
          onChoose={action('onChoose')}
          resourceKind={kind}
          selectedResourceIndex={selectedResourceIndex}
          onSelectResource={setSelectedResourceIndex}
        />
      </ResourceStoreStateProvider>
    </FixedHeightFlexContainer>
  );
};

export const AudioResource = () => <ResourceStoreStory kind="audio" />;

export const FontResource = () => <ResourceStoreStory kind="font" />;

export const SvgResource = () => <ResourceStoreStory kind="svg" />;

export const FontResourceWithLoadingError = () => {
  const axiosMock = new MockAdapter(assetApiClient, { delayResponse: 500 });
  axiosMock.onAny().reply(500);

  return <ResourceStoreStory kind="font" />;
};
