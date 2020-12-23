// @flow
import React from 'react';
import renderer from 'react-test-renderer';
import HelpButton from '.';

describe('HelpButton', () => {
  it('renders the button linking to a GDevelop documentation help page', () => {
    const tree = renderer
      .create(<HelpButton helpPagePath="/objects/tiled_sprite" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('renders nothing if the helpPagePath is not a valid URL or path', () => {
    const tree = renderer
      .create(<HelpButton helpPagePath="htp://test.com" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('renders nothing if the helpPagePath is empty', () => {
    const tree = renderer.create(<HelpButton helpPagePath="" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
