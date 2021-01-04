// @flow
import React from 'react';
import renderer from 'react-test-renderer';
import HelpIcon from '.';

describe('HelpIcon', () => {
  it('renders the icon linking to a help page', () => {
    const tree = renderer
      .create(<HelpIcon helpPagePath="/objects/tiled_sprite" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('renders nothing if the helpPagePath is empty', () => {
    const tree = renderer.create(<HelpIcon helpPagePath="" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
