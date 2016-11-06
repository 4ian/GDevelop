import React from 'react';
import eventsRenderingService from './EventsRenderingService.js';
import InstructionsList from './InstructionsList.js';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const eventLongPressTime = 300;

var Event = React.createClass({
    displayName: "Event",
    propTypes: {
        event : React.PropTypes.object.isRequired,
        eventsList : React.PropTypes.object.isRequired,
        index : React.PropTypes.number.isRequired,
        callbacks : React.PropTypes.object.isRequired,
    },
    handleTouch: function(event) {
        const { callbacks } = this.props;

        if (!this.touchStartDate) {
            this.touchStartDate = Date.now();
            this.touchTimeout = setTimeout(function() {
                callbacks.onEventLongClicked(this.props);
            }.bind(this), eventLongPressTime);
        }
    },
    handleTouchEnd: function(event) {
        const { callbacks } = this.props;

        clearTimeout(this.touchTimeout);
        if ((Date.now() - this.touchStartDate) < eventLongPressTime) {
            callbacks.onEventClicked(this.props);
        }
        this.touchStartDate = undefined;
    },
    handleAddSubEventClick: function() {
        const { callbacks } = this.props;
        callbacks.onAddNewEvent(this.props);
    },
    handleFoldSubEventClick: function(event) {
        const { callbacks } = this.props;
        callbacks.onToggleEventFolding(this.props);
    },
    render: function() {
        var event = this.props.event;
        var elements = [];

        elements.push(React.createElement(eventsRenderingService.getEventComponent(
            event,
            InstructionsList
        ), {
            event: event,
            key: "theEvent",
            className: "event " + event.getType().replace("::", "-"),
            onMouseDown: this.handleTouch,
            onMouseUp: this.handleTouchEnd,
            onTouchStart: this.handleTouch,
            onTouchMove: this.handleTouch,
            onTouchEnd: this.handleTouchEnd,
            callbacks: this.props.callbacks
        }));

        if (event.canHaveSubEvents()) {

            elements.push(React.createElement('button', {
                className: "btn btn-default btn-xs add-sub-events-button",
                key: "addSubEventsButton",
                onClick: this.handleAddSubEventClick
            }, "Add a sub event"));

            if (event.getSubEvents().getEventsCount() > 0) {
                elements.push(React.createElement('button', {
                    className: "btn btn-default btn-xs fold-sub-events-button " +
                        "glyphicon glyphicon-chevron-" + (event.isFolded() ? "up up" : "down down"),
                    key: "foldSubEventsButton",
                    onClick: this.handleFoldSubEventClick
                }, ""));
            }

            if (!event.isFolded()) {
                elements.push(React.createElement(EventsList, {
                    eventsList: event.getSubEvents(),
                    key: "subEvents",
                    className: "sub-events",
                    callbacks: this.props.callbacks,
                }));
            }
        }

        return React.createElement('div', {
            className: "event-container " +
                (event.isDisabled() ? "disabled-event " : "") +
                (event.dragging ? "dragged-event " : "")
        }, elements);
    }
});

var EventsList = React.createClass({
    displayName: "EventsList",
    propTypes: {
        eventsList : React.PropTypes.object.isRequired,
        callbacks : React.PropTypes.object.isRequired,
    },
    render: function() {
        var children = [];
        for(var i = 0;i < this.props.eventsList.getEventsCount();++i) {
            var event = this.props.eventsList.getEventAt(i);
            children.push(React.createElement(Event, {
                event: event,
                eventsList: this.props.eventsList,
                index: i,
                key: event.ptr,
                callbacks: this.props.callbacks,
            }));
        }
        return React.createElement('div', {
            className: "events-list " + this.props.className
        }, React.createElement(ReactCSSTransitionGroup, {
            transitionName: "events-list-animation",
            transitionEnterTimeout: 200,
            transitionLeaveTimeout: 200,
        }, children));
    }
});

const EventsSheet = React.createClass({
    propTypes: {
        events : React.PropTypes.object.isRequired,
        layout : React.PropTypes.object.isRequired,
        callbacks : React.PropTypes.object.isRequired
    },
    render: function() {
        var element = React.createElement(EventsList, {
            eventsList: this.props.events,
            callbacks: this.props.callbacks,
        });

        return element;
    }
});

export default EventsSheet;
