// @flow
import React from 'react';
import renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import HelpButton from '.';

describe('HelpButton', () => {
  it('renders the button linking to a help page', () => {
    const tree = renderer
      .create(
        <MuiThemeProvider>
          <HelpButton helpPagePath="/objects/tiled_sprite" />
        </MuiThemeProvider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('renders nothing if the helpPagePath is empty', () => {
    const tree = renderer
      .create(
        <MuiThemeProvider>
          <HelpButton helpPagePath="" />
        </MuiThemeProvider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
