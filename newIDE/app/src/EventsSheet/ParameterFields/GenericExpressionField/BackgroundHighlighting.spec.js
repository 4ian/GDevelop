// @flow
import * as React from 'react';
import BackgroundHighlighting from './BackgroundHighlighting';
import renderer from 'react-test-renderer';

describe('BackgroundHighlighting', () => {
  it('can render one highlight at the beginning', () => {
    const tree = renderer
      .create(
        <BackgroundHighlighting
          value="Hello world"
          style={{}}
          highlights={[
            {
              begin: 0,
              end: 5,
              type: 'error',
              message: 'test highlight 1',
            },
          ]}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('can render one highlight past the end', () => {
    const tree = renderer
      .create(
        <BackgroundHighlighting
          value="Hello world"
          style={{}}
          highlights={[
            {
              begin: 5,
              end: 20,
              type: 'error',
              message: 'test highlight 1',
            },
          ]}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('can render overlapping highlights', () => {
    const tree = renderer
      .create(
        <BackgroundHighlighting
          value="Hello world"
          style={{}}
          highlights={[
            {
              begin: 2,
              end: 7,
              type: 'error',
              message: 'test highlight 1',
            },
            {
              begin: 1,
              end: 4,
              type: 'error',
              message: 'test highlight 2',
            },
          ]}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('can render overlapping highlights on all the text', () => {
    const tree = renderer
      .create(
        <BackgroundHighlighting
          value="Hello world"
          style={{}}
          highlights={[
            {
              begin: 2,
              end: 7,
              type: 'error',
              message: 'test highlight 1',
            },
            {
              begin: 1,
              end: 4,
              type: 'error',
              message: 'test highlight 2',
            },
            {
              begin: 1,
              end: 9,
              type: 'error',
              message: 'test highlight 3',
            },
            {
              begin: 7,
              end: 15,
              type: 'error',
              message: 'test highlight 4',
            },
            {
              begin: 9,
              end: 12,
              type: 'error',
              message: 'test highlight 5',
            },
          ]}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
