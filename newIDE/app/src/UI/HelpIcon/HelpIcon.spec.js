// @flow
import React from 'react';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import HelpIcon from '.';

describe('HelpIcon', () => {
  it('renders the icon linking to a help page', () => {
    const tree = renderer
      .create(
        <MuiThemeProvider>
          <HelpIcon helpPagePath="/objects/tiled_sprite" />
        </MuiThemeProvider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('renders nothing if the helpPagePath is empty', () => {
    const tree = renderer
      .create(
        <MuiThemeProvider>
          <HelpIcon helpPagePath="" />
        </MuiThemeProvider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
