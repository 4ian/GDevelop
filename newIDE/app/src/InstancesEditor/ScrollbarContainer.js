// @flow
import React, { Component } from 'react';
import Slider from 'material-ui/Slider';
import ViewPosition from './ViewPosition';

const MATERIAL_UI_SLIDER_WIDTH = 18;

const styles = {
  container: {
    overflow: 'hidden',
  },
  xScrollbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  xSliderStyle: {
    marginTop: -MATERIAL_UI_SLIDER_WIDTH / 2 + 1,
    marginBottom: 0,
  },
  yScrollbar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  ySliderStyle: {
    marginTop: 0,
    marginLeft: -MATERIAL_UI_SLIDER_WIDTH / 2,
  },
};

type ScrollableComponent = {
  scrollTo: (number, number) => void,
  getViewPosition: () => ViewPosition,
};

type Props = {
  wrappedEditorRef: ?(?ScrollableComponent) => void,
};

type State = {
  xValue: number,
  yValue: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
};

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
      this.setState(
        {
          xValue: value,
        },
        () => {
          if (this._editor) {
            this._editor.scrollTo(this.state.xValue, this.state.yValue);
          }
        }
      );
    };

    _handleYChange = (e: any, value: number) => {
      this.setState(
        {
          yValue: value,
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

    _handleViewPositionChange = (viewPosition: ViewPosition) => {
      this._setAndAdjust({
        xValue: viewPosition.getViewX(),
        yValue: viewPosition.getViewY(),
      });
    };

    render() {
      const { wrappedEditorRef, ...otherProps } = this.props;

      return (
        <div style={styles.container}>
          <WrappedComponent
            onViewPositionChanged={this._handleViewPositionChange}
            ref={(editorRef: ?ScrollableComponent) => {
              wrappedEditorRef && wrappedEditorRef(editorRef);
              this._editor = editorRef;
            }}
            {...otherProps}
          />
          <Slider
            value={this.state.xValue}
            min={this.state.xMin}
            max={this.state.xMax}
            onChange={this._handleXChange}
            style={styles.xScrollbar}
            sliderStyle={styles.xSliderStyle}
            axis="x"
          />
          <Slider
            value={this.state.yValue}
            min={this.state.yMin}
            max={this.state.yMax}
            onChange={this._handleYChange}
            style={styles.yScrollbar}
            sliderStyle={styles.ySliderStyle}
            axis="y-reverse"
          />
        </div>
      );
    }
  };
};
