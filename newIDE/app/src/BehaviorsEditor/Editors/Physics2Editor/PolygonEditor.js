// @flow
import * as React from 'react';
import { Line } from '../../../UI/Grid';

type Vertice = {
  x: number,
  y: number,
};

type Props = {|
  vertices: Array<Vertice>,
|};

export default class PolygonEditor extends React.Component<Props> {
  render() {
    return <Line />;
  }
}
