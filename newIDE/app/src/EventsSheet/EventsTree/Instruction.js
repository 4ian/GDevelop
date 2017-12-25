import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { mapFor } from '../../Utils/MapFor';
import classNames from 'classnames';
import { selectedArea, selectableArea, subInstructionsContainer, instructionParameter } from './ClassNames';
import InstructionsList from './InstructionsList';
const gd = global.gd;
const instrFormatter = gd.InstructionSentenceFormatter.get();
instrFormatter.loadTypesFormattingFromConfig();

const styles = {
  container: {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    cursor: 'pointer',
    marginBottom: 1,
  },
  icon: {
    verticalAlign: 'middle',
    paddingLeft: 2,
    paddingRight: 2,
  },
};

export default class Instruction extends Component {
  static propTypes = {
    instruction: PropTypes.object.isRequired,
    isCondition: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,

    // For potential sub-instructions list:
    selection: PropTypes.object,
    onAddNewSubInstruction: PropTypes.func,
    onSubInstructionClick: PropTypes.func,
    onSubInstructionDoubleClick: PropTypes.func,
    onSubInstructionsListContextMenu: PropTypes.func,
    onSubParameterClick: PropTypes.func,
  };

  /**
   * Render the different parts of the text of the instruction.
   * Parameter can have formatting, be hovered and clicked. The rest
   * has not particular styling.
   */
  _renderInstructionText = metadata => {
    const { instruction } = this.props;
    const formattedTexts = instrFormatter.getAsFormattedText(
      instruction,
      metadata
    );
    const parametersCount = metadata.getParametersCount();

    return (
      <span>
        {mapFor(0, formattedTexts.size(), i => {
          const formatting = formattedTexts.getTextFormatting(i);
          const parameterIndex = formatting.getUserData();
          const isParameter =
            parameterIndex >= 0 && parameterIndex < parametersCount;

          if (!isParameter)
            return <span key={i}>{formattedTexts.getString(i)}</span>;

          const parameterType = metadata.getParameter(parameterIndex).getType();
          return (
            <span
              key={i}
              className={classNames({
                [selectableArea]: true,
                [instructionParameter]: true,
                [parameterType]: true,
              })}
              onClick={domEvent =>
                this.props.onParameterClick(domEvent, parameterIndex)}
            >
              {formattedTexts.getString(i)}
            </span>
          );
        })}
      </span>
    );
  };

  render() {
    var { instruction, isCondition } = this.props;

    //TODO: Metadata could be cached for performance boost.
    const metadata = isCondition
      ? gd.MetadataProvider.getConditionMetadata(
          gd.JsPlatform.get(),
          instruction.getType()
        )
      : gd.MetadataProvider.getActionMetadata(
          gd.JsPlatform.get(),
          instruction.getType()
        );

    return (
      <div
        style={styles.container}
        className={classNames({
          [selectableArea]: true,
          [selectedArea]: this.props.selected,
        })}
        onClick={e => {
          e.stopPropagation();
          this.props.onClick();
        }}
        onDoubleClick={e => {
          e.stopPropagation();
          this.props.onDoubleClick();
        }}
        onContextMenu={e => {
          e.stopPropagation();
          this.props.onContextMenu(e.clientX, e.clientY);
        }}
      >
        {instruction.isInverted() && (
          <img
            src="res/contraire.png"
            alt="Condition is negated"
            style={styles.icon}
            width="20"
            height="16"
          />
        )}
        <img
          src={metadata.getSmallIconFilename()}
          style={styles.icon}
          alt=""
          width="20"
          height="16"
        />
        {this._renderInstructionText(metadata)}
        {metadata.canHaveSubInstructions() && (
          <InstructionsList
            extraClassName={subInstructionsContainer}
            instrsList={instruction.getSubInstructions()}
            areConditions={this.props.isCondition}
            selection={this.props.selection}
            onAddNewInstruction={this.props.onAddNewSubInstruction}
            onInstructionClick={this.props.onSubInstructionClick}
            onInstructionDoubleClick={this.props.onSubInstructionDoubleClick}
            onInstructionContextMenu={this.props.onSubInstructionContextMenu}
            onInstructionsListContextMenu={
              this.props.onSubInstructionsListContextMenu
            }
            onParameterClick={this.props.onSubParameterClick}
            addButtonLabel="Add a sub-condition"
          />
        )}
      </div>
    );
  }
}
