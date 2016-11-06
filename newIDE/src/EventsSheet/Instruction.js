import React from 'react';
import instructionsRenderingService from './InstructionsRenderingService.js';
const instrLongPressTime = 350;

const Instruction =  React.createClass({
    displayName: "Instruction",
    propTypes: {
        instruction : React.PropTypes.object.isRequired,
        isCondition : React.PropTypes.bool.isRequired,
        instrsList : React.PropTypes.object.isRequired,
        index : React.PropTypes.number.isRequired,
        callbacks : React.PropTypes.object.isRequired,
    },
    handleTouch: function(event) {
        const { callbacks } = this.props;
        event.stopPropagation();

        if (!this.touchStartDate) {
            this.touchStartDate = Date.now();
            this.touchTimeout = setTimeout(function() {
                callbacks.onInstructionLongClicked(this.props);
            }.bind(this), instrLongPressTime);
        }
    },
    handleTouchEnd: function(event) {
        const { callbacks } = this.props;
        event.stopPropagation();

        clearTimeout(this.touchTimeout);
        if ((Date.now() - this.touchStartDate) < instrLongPressTime) {
            callbacks.onInstructionClicked(this.props);
        }
        this.touchStartDate = undefined;
    },
    render: function() {
        var instruction = this.props.instruction;
        var rendering = instructionsRenderingService.getInstructionHtml(
            instruction, this.props.isCondition);

        var children = [];
        if (instruction.isInverted()) {
            children.push(React.createElement('img', {
                src: "res/contraire.png",
                className: "inverted-icon",
                key: "inverted-icon"
            }));
        }
        children.push(React.createElement('img', {
            src: rendering.icon,
            className: "icon",
            key: "icon"
        }));
        children.push(React.createElement('span', {
            dangerouslySetInnerHTML: {
                __html: rendering.html
            },
            className: "text",
            key: "text",
        }));

        return React.createElement('span', {
            className: "instruction " + (instruction.dragging ? "dragged-instruction " : "") +
                (instruction.isInverted() ? "inverted " : "") +
                this.props.className,
            onMouseDown: this.handleTouch,
            onMouseUp: this.handleTouchEnd,
            onTouchStart: this.handleTouch,
            onTouchMove: this.handleTouch,
            onTouchEnd: this.handleTouchEnd
        }, children);
    }
});

export default Instruction;
