// @flow
import * as React from 'react';

import VariablesEditorRedesignWindow from '../../VariablesEditorRedesign/VariablesEditorRedesignWindow';

const FullBleedReference = ({ children }: {| children: React.Node |}) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      background: '#0e0e15',
    }}
  >
    {children}
  </div>
);

export const Overview = (): React.Node => (
  <FullBleedReference>
    <VariablesEditorRedesignWindow variant="overview" />
  </FullBleedReference>
);

export const Search = (): React.Node => (
  <FullBleedReference>
    <VariablesEditorRedesignWindow variant="search" />
  </FullBleedReference>
);

export default {
  title: 'VariablesEditorRedesign/Reference windows',
  component: VariablesEditorRedesignWindow,
  parameters: {
    layout: 'fullscreen',
  },
};
