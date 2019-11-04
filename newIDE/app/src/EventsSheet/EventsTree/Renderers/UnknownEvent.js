// @flow
import * as React from 'react';
import classNames from 'classnames';
import { largeSelectedArea, largeSelectableArea } from '../ClassNames';
import { type EventRendererProps } from './EventRenderer';

export default class UnknownEvent extends React.Component<
  EventRendererProps,
  *
> {
  render() {
    return (
      <p
        className={classNames({
          [largeSelectableArea]: true,
          [largeSelectedArea]: this.props.selected,
        })}
      >
        {'Unknown event of type ' + this.props.event.getType()}
      </p>
    );
  }
}
