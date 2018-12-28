// @flow
import * as React from 'react';

type Vertice = {
  x: number,
  y: number,
};

type Props = {|
  shape: string,
  dimensionA: number,
  dimensionB: number,
  offsetX: number,
  offsetY: number,
  polygonOrigin: string,
  vertices: Array<Vertice>,
  width: number,
  height: number,
|};

type State = {|
  image: string,
|};

export default class ShapePreview extends React.Component<Props, State> {

  render() {
    
    const {dimensionA, dimensionB, shape, offsetX, offsetY, width, height} = this.props;
    const fixedWidth = dimensionA > 0 ? dimensionA : width > 0 ? width : 1;
    const fixedHeight = dimensionB > 0 ? dimensionB : height > 0 ? height : 1;

    return (
      <div>
        {shape === 'Box' && (
          <svg>
            <rect
              key={`boxShape`}
              fill="rgba(255,0,0,0.75)"
              strokeWidth={1}
              x={offsetX + width/2- fixedWidth/2}
              y={offsetY + height/2 - fixedHeight/2}
              width={fixedWidth}
              height={fixedHeight}
            />
          </svg>
        )}
        {shape === 'Circle' && (
          <svg>
            <circle
              key={`boxShape`}
              fill="rgba(255,0,0,0.75)"
              strokeWidth={1}
              cx={offsetX + width/2}
              cy={offsetY + height/2}
              r={dimensionA > 0 ? dimensionA : (width + height) > 0 ?  (width + height) / 4 : 1}
            />
          </svg>
        )}
        {shape === 'Edge' && (
          <svg>
            <line
              key={`boxEdge`}
              stroke="rgba(255,0,0,0.75)"
              strokeWidth={2}
              x1={offsetX + width/2 - fixedWidth/2 * Math.cos(dimensionB*Math.PI/180)}
              y1={offsetY + height/2 - fixedWidth/2 * Math.sin(dimensionB*Math.PI/180)}
              x2={offsetX + width/2 + fixedWidth/2 * Math.cos(dimensionB*Math.PI/180)}
              y2={offsetY + height/2 + fixedWidth/2 * Math.sin(dimensionB*Math.PI/180)}
            />
          </svg>
        )}
      </div>
    );
  }
}
