// @flow
import React, { Component } from 'react';
import Slider from '@material-ui/core/Slider';
import ViewPosition from './ViewPosition';
import throttle from 'lodash/throttle';
import InstancesEditor, {
  type InstancesEditorPropsWithoutSizeAndScroll,
} from './index';
import { ScreenTypeMeasurer } from '../UI/Reponsive/ScreenTypeMeasurer';
import { FullSizeMeasurer } from '../UI/FullSizeMeasurer';

const styles = {
  container: {
    overflow: 'hidden',
  },
  xScrollbar: {
    position: 'absolute',
    top: -13,
    left: 0,
    right: 0,
  },
  yScrollbar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -13,
    transform: 'rotate(180deg)',
  },
};

type Props = {|
  ...InstancesEditorPropsWithoutSizeAndScroll,
  wrappedEditorRef: ?(?InstancesEditor) => void,
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

export default class FullSizeInstancesEditorWithScrollbars extends Component<
  Props,
  State
> {
  _editor: ?InstancesEditor = null;

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

  _setAndAdjust = ({ xValue, yValue }: { xValue: number, yValue: number }) => {
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
          <FullSizeMeasurer>
            {({ width, height }) => (
              <div style={styles.container}>
                <InstancesEditor
                  onViewPositionChanged={
                    screenType !== 'touch'
                      ? this._handleViewPositionChange
                      : noop
                  }
                  ref={(editorRef: ?InstancesEditor) => {
                    wrappedEditorRef && wrappedEditorRef(editorRef);
                    this._editor = editorRef;
                  }}
                  width={width}
                  height={height}
                  screenType={screenType}
                  {...otherProps}
                />
                {screenType !== 'touch' && (
                  <Slider
                    color="secondary"
                    value={
                      ((this.state.xValue - this.state.xMin) /
                        (this.state.xMax - this.state.xMin)) *
                      100
                    }
                    onChange={this._handleXChange}
                    style={styles.xScrollbar}
                    orientation="horizontal"
                    onChangeCommitted={event => event.target.blur()}
                  />
                )}
                {screenType !== 'touch' && (
                  <Slider
                    color="secondary"
                    value={
                      ((this.state.yValue - this.state.yMin) /
                        (this.state.yMax - this.state.yMin)) *
                      100
                    }
                    onChange={this._handleYChange}
                    style={styles.yScrollbar}
                    orientation="vertical"
                    onChangeCommitted={event => event.target.blur()}
                  />
                )}
              </div>
            )}
          </FullSizeMeasurer>
        )}
      </ScreenTypeMeasurer>
    );
  }
}
