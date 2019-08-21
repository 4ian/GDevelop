// @flow
import React from 'react';
import renderer from 'react-test-renderer';
import V0MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import HelpIcon from '.';

describe('HelpIcon', () => {
  it('renders the icon linking to a help page', () => {
    const tree = renderer
      .create(
        <V0MuiThemeProvider>
          <HelpIcon helpPagePath="/objects/tiled_sprite" />
        </V0MuiThemeProvider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('renders nothing if the helpPagePath is empty', () => {
    const tree = renderer
      .create(
        <V0MuiThemeProvider>
          <HelpIcon helpPagePath="" />
        </V0MuiThemeProvider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
