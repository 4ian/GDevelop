import React, { Component } from 'react';
import Measure from 'react-measure';

const styles = {
  flexContainer: { display: 'flex', flex: 1, position: 'relative' },
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: 'hidden',
  },
};

/**
 * Take a component and pass the maximum size that the component can take
 * as width and height props.
 * @param {*} WrappedComponent
 * @param {*} options
 */
export const passFullSize = (WrappedComponent, { useFlex }) => {
  return class FullSizeMeasurer extends Component {
    state = {
      width: undefined,
      height: undefined,
    };

    render() {
      const { wrappedComponentRef, ...otherProps } = this.props;

      return (
        <Measure
          onMeasure={({ width, height }) => this.setState({ width, height })}
        >
          <div
            style={useFlex ? styles.flexContainer : styles.absoluteContainer}
          >
            {this.state.width !== undefined &&
              this.state.height !== undefined && (
                <WrappedComponent
                  width={this.state.width}
                  height={this.state.height}
                  ref={ref => wrappedComponentRef && wrappedComponentRef(ref)}
                  {...otherProps}
                />
              )}
          </div>
        </Measure>
      );
    }
  };
};
