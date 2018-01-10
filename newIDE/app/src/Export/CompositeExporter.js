import React, { Component } from 'react';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import { Column, Line } from '../UI/Grid';

const styles = {
  divider: {
    marginTop: 10,
    marginBottom: 10,
  },
};

export default class CompositeExporter extends Component {
  state = {
    currentExporterIndex: 0,
  };

  _chooseExporter = value => {
    this.setState({
      currentExporterIndex: value,
    });
  };

  render() {
    const {
      project,
      authentification,
      onChangeSubscription,
      exporters,
    } = this.props;
    const { currentExporterIndex } = this.state;
    const exporter = exporters[currentExporterIndex];
    if (!project) return null;

    return (
      <Column noMargin>
        <Line justifyContent="center">
          {exporters.map((exporter, index) => (
            <RaisedButton
              key={index}
              label={exporter.name}
              primary={currentExporterIndex === index}
              onClick={() => this._chooseExporter(index)}
            />
          ))}
        </Line>
        <Divider style={styles.divider} />
        {exporter &&
          exporter.ExportComponent && (
            <exporter.ExportComponent
              project={project}
              authentification={authentification}
              onChangeSubscription={onChangeSubscription}
            />
          )}
      </Column>
    );
  }
}
