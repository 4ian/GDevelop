import UnknownEvent from './Renderers/UnknownEvent';
import StandardEvent from './Renderers/StandardEvent';
import GroupEvent from './Renderers/GroupEvent';
import CommentEvent from './Renderers/CommentEvent';
import ForEachEvent from './Renderers/ForEachEvent';
import ForEachStructureEvent from './Renderers/ForEachStructureEvent';
import RepeatEvent from './Renderers/RepeatEvent';
import WhileEvent from './Renderers/WhileEvent';
import LinkEvent from './Renderers/LinkEvent';
import JsCodeEvent from './Renderers/JsCodeEvent';

export default {
  components: {
    unknownEvent: UnknownEvent,
    'BuiltinCommonInstructions::Standard': StandardEvent,
    'BuiltinCommonInstructions::Group': GroupEvent,
    'BuiltinCommonInstructions::Comment': CommentEvent,
    'BuiltinCommonInstructions::ForEach': ForEachEvent,
    'BuiltinCommonInstructions::ForEachStructure': ForEachStructureEvent,
    'BuiltinCommonInstructions::Repeat': RepeatEvent,
    'BuiltinCommonInstructions::While': WhileEvent,
    'BuiltinCommonInstructions::Link': LinkEvent,
    'BuiltinCommonInstructions::JsCode': JsCodeEvent,
  },
  getEventComponent: function(event) {
    if (this.components.hasOwnProperty(event.getType()))
      return this.components[event.getType()];
    else return this.components.unknownEvent;
  },
  registerEvent: function(eventType, renderFunction) {
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
