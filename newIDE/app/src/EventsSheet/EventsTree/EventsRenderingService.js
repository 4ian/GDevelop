// @flow
import { type ComponentType } from 'react';
import UnknownEvent from './Renderers/UnknownEvent';
import StandardEvent from './Renderers/StandardEvent';
import GroupEvent from './Renderers/GroupEvent';
import CommentEvent from './Renderers/CommentEvent';
import ForEachEvent from './Renderers/ForEachEvent';
import ForEachChildVariableEvent from './Renderers/ForEachChildVariableEvent';
import RepeatEvent from './Renderers/RepeatEvent';
import WhileEvent from './Renderers/WhileEvent';
import LinkEvent from './Renderers/LinkEvent';
import JsCodeEvent from './Renderers/JsCodeEvent';
import { type EventRendererProps } from './Renderers/EventRenderer';

const EventsRenderingService = {
  components: {
    unknownEvent: UnknownEvent,
    'BuiltinCommonInstructions::Standard': StandardEvent,
    'BuiltinCommonInstructions::Group': GroupEvent,
    'BuiltinCommonInstructions::Comment': CommentEvent,
    'BuiltinCommonInstructions::ForEach': ForEachEvent,
    'BuiltinCommonInstructions::ForEachChildVariable': ForEachChildVariableEvent,
    'BuiltinCommonInstructions::Repeat': RepeatEvent,
    'BuiltinCommonInstructions::While': WhileEvent,
    'BuiltinCommonInstructions::Link': LinkEvent,
    'BuiltinCommonInstructions::JsCode': JsCodeEvent,
  },
  getEventComponent: function(
    event: gdBaseEvent
  ): ComponentType<EventRendererProps> {
    if (this.components.hasOwnProperty(event.getType()))
      return this.components[event.getType()];
    else return this.components.unknownEvent;
  },
  registerEvent: function(
    eventType: string,
    renderFunction: ComponentType<EventRendererProps>
  ) {
    if (!this.components.hasOwnProperty(eventType)) {
      console.warn(
        'Tried to register renderer for events "' +
          eventType +
          '", but a renderer already exists.'
      );
      return;
    }

    this.components[eventType] = renderFunction;
  },
};

export default EventsRenderingService;
