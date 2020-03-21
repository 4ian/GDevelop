// @flow
import React, { Component } from 'react';
import Slider from '@material-ui/core/Slider';
import ViewPosition from './ViewPosition';
import throttle from 'lodash/throttle';
import { ScreenTypeMeasurer } from '../UI/Reponsive/ScreenTypeMeasurer';

const styles = {
  container: {
    overflow: 'hidden',
  },
  xScrollbar: {
    position: 'absolute',
    top: -11,
    left: 0,
    right: 0,
  },
  yScrollbar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -11,
    transform: 'rotate(180deg)',
  },
};

type ScrollableComponent = {
  scrollTo: (number, number) => void,
  getViewPosition: () => ?ViewPosition,
};

type Props = {|
  wrappedEditorRef: ?(?ScrollableComponent) => void,
|};

type State = {|
  xValue: number,
  yValue: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
|};

const noop = () => {};

/**
 * Add scrollbars that track the viewPosition of the wrapped component
 * @param {*} WrappedComponent
 * @param {*} options
 */
export const addScrollbars = (WrappedComponent: any) => {
  return class ScrollbarContainer extends Component<Props, State> {
    _editor: ?ScrollableComponent = null;

    state: State = {
      xValue: 0,
      yValue: 0,
      xMin: -5000,
      xMax: +5000,
      yMin: -5000,
      yMax: +5000,
    };

    componentDidMount() {
      if (this._editor) {
        this._handleViewPositionChange(this._editor.getViewPosition());
      }
    }

    _handleXChange = (e: any, value: number) => {
      const { xMin, xMax } = this.state;
      const xValue = xMin + ((xMax - xMin) * value) / 100;
      this.setState(
        {
          xValue,
        },
        () => {
          if (this._editor) {
            this._editor.scrollTo(this.state.xValue, this.state.yValue);
          }
        }
      );
    };

    _handleYChange = (e: any, value: number) => {
      const { yMin, yMax } = this.state;
      // Substract the value from 100 as the slider is 180deg rotated. Not perfect though
      // as it breaks when using the keyboard arrow keys (when focusing the slider).
      const yValue = yMin + ((yMax - yMin) * (100 - value)) / 100;
      this.setState(
        {
          yValue,
        },
        () => {
          if (this._editor) {
            this._editor.scrollTo(this.state.xValue, this.state.yValue);
          }
        }
      );
    };

    _setAndAdjust = ({
      xValue,
      yValue,
    }: {
      xValue: number,
      yValue: number,
    }) => {
      const xMax = Math.max(Math.abs(xValue) + 100, this.state.xMax);
      const yMax = Math.max(Math.abs(yValue) + 100, this.state.yMax);

      this.setState({
        xMax,
        yMax,
        xMin: -xMax,
        yMin: -yMax,
        xValue,
        yValue,
      });
    };

    _handleViewPositionChange = throttle(
      (viewPosition: ?ViewPosition) => {
        if (!viewPosition) return;

        this._setAndAdjust({
          xValue: viewPosition.getViewX(),
          yValue: viewPosition.getViewY(),
        });
      },
      500, // Throttle the updates after a scroll to avoid make lots of updates in a row that would kill CPU
      { leading: false, trailing: true }
    );

    render() {
      const { wrappedEditorRef, ...otherProps } = this.props;

      return (
        <ScreenTypeMeasurer>
          {screenType => (
            <div style={styles.container}>
              <WrappedComponent
                onViewPositionChanged={
                  screenType !== 'touch' ? this._handleViewPositionChange : noop
                }
                ref={(editorRef: ?ScrollableComponent) => {
                  wrappedEditorRef && wrappedEditorRef(editorRef);
                  this._editor = editorRef;
                }}
                {...otherProps}
              />
              {screenType !== 'touch' && (
                <Slider
                  value={
                    ((this.state.xValue - this.state.xMin) /
                      (this.state.xMax - this.state.xMin)) *
                    100
                  }
                  onChange={this._handleXChange}
                  style={styles.xScrollbar}
                  orientation="horizontal"
                />
              )}
              {screenType !== 'touch' && (
                <Slider
                  value={
                    ((this.state.yValue - this.state.yMin) /
                      (this.state.yMax - this.state.yMin)) *
                    100
                  }
                  onChange={this._handleYChange}
                  style={styles.yScrollbar}
                  orientation="vertical"
                />
              )}
            </div>
          )}
        </ScreenTypeMeasurer>
      );
    }
  };
};
