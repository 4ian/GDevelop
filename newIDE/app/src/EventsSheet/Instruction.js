import React, { Component } from 'react';
import PropTypes from 'prop-types';
import instructionsRenderingService from './InstructionsRenderingService.js';

const styles = {
  container: {
    whiteSpace: 'normal',
    cursor: 'pointer',
  },
  icon: {
    verticalAlign: 'middle',
    paddingLeft: 2,
    paddingRight: 2,
  }
}

export default class Instruction extends Component {
  static propTypes = {
    instruction: PropTypes.object.isRequired,
    isCondition: PropTypes.bool.isRequired,
  };

  render() {
    var instruction = this.props.instruction;
    var rendering = instructionsRenderingService.getInstructionHtml(
      instruction,
      this.props.isCondition
    );

    return (
      <div style={styles.container}>
        {instruction.isInverted() &&
          <img
            src="res/contraire.png"
            alt="Condition is negated"
            style={styles.icon}
          />}
        <img src={rendering.icon} style={styles.icon} alt=""/>
        <span
          dangerouslySetInnerHTML={{
            __html: rendering.html,
          }}
        />
      </div>
    );
  }
}
