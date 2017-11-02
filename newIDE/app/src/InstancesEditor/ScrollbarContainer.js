import React, { Component } from 'react';
import Slider from 'material-ui/Slider';

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

//TODO: Type WrappedEditor as ScrollableEditor

/**
 * Add scrollbars that track the viewPosition of the wrapped component
 * @param {*} WrappedEditor
 * @param {*} options
 */
export const addScrollbars = WrappedEditor => {
  return class ScrollbarContainer extends Component {
    _editor = null;

    state = {
      xValue: 0,
      yValue: 0,
      xMin: -5000,
      xMax: +5000,
      yMin: -5000,
      yMax: +5000,
    };

    componentDidMount() {
      this._handleViewPositionChange(this._editor.getViewPosition());
    }

    _handleXChange = (e, value) => {
      this.setState(
        {
          xValue: value,
        },
        () => {
          this._editor.scrollTo(this.state.xValue, this.state.yValue); //TODO
        }
      );
    };

    _handleYChange = (e, value) => {
      this.setState(
        {
          yValue: value,
        },
        () => {
          this._editor.scrollTo(this.state.xValue, this.state.yValue); //TODO
        }
      );
    };

    _setAndAdjust = ({ xValue, yValue }) => {
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

    _handleViewPositionChange = viewPosition => {
      this._setAndAdjust({
        xValue: viewPosition.getViewX(),
        yValue: viewPosition.getViewY(),
      });
    };

    render() {
      const { wrappedEditorRef, ...otherProps } = this.props;

      return (
        <div style={styles.container}>
          <WrappedEditor
            onViewPositionChanged={this._handleViewPositionChange}
            ref={editorRef => {
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
