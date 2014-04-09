/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

/*
 * The rest of the API exposed using embind.
 * See Embind.cpp for more information
 */
#if defined(EMSCRIPTEN)
#include <emscripten/bind.h>
#include <boost/make_shared.hpp>
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Builtin/CommentEvent.h"
#include "GDCore/Events/Builtin/WhileEvent.h"
#include "GDCore/Events/EventsCodeGenerator.h"

using namespace emscripten;
using namespace gd;

EMSCRIPTEN_BINDINGS(gd_Instruction) {
    register_vector< Instruction >("VectorInstruction");

    class_<Instruction>("Instruction")
        .constructor<>()
        .function("getType", &Instruction::GetType).function("setType", &Instruction::SetType)
        .function("isInverted", &Instruction::IsInverted).function("setInverted", &Instruction::SetInverted)
        //TODO
        ;
}

namespace gd { //Workaround for emscripten not supporting methods returning a reference (objects are returned by copy in JS).
std::vector < boost::shared_ptr<BaseEvent> > * BaseEvent_GetSubEvents(BaseEvent & e) { return &e.GetSubEvents(); }
std::vector < gd::Instruction > * StandardEvent_GetConditions(StandardEvent & e) { return &e.GetConditions(); }
std::vector < gd::Instruction > * StandardEvent_GetActions(StandardEvent & e) { return &e.GetActions(); }
std::vector < gd::Instruction > * WhileEvent_GetConditions(WhileEvent & e) { return &e.GetConditions(); }
std::vector < gd::Instruction > * WhileEvent_GetWhileConditions(WhileEvent & e) { return &e.GetWhileConditions(); }
std::vector < gd::Instruction > * WhileEvent_GetActions(WhileEvent & e) { return &e.GetActions(); }
const std::string & CommentEvent_GetComment(CommentEvent & e) { return e.com1; }
void CommentEvent_SetComment(CommentEvent & e, const std::string & com) { e.com1 = com; }
void VectorEvent_push_back(std::vector< boost::shared_ptr<BaseEvent> > & v, gd::BaseEvent & event) {
    boost::shared_ptr<BaseEvent> evt(&event);
    v.push_back(evt);
}
}

EMSCRIPTEN_BINDINGS(gd_BaseEvent) {
    register_vector< boost::shared_ptr<BaseEvent> >("VectorEvent").
        function("push_back", &VectorEvent_push_back); //TODO: Changing the default push_back implementation so that we accept "raw pointers".
        //Ideally, all shared_ptrs should be hidden inside classes and not exposed as part of the C++ API. So vector<boost::shared_ptr<BaseEvent> >
        //should be refactored and remplaced by an "EventContainer" or "EventList" class.

    class_<BaseEvent>("BaseEvent")
        .constructor<>()
        .smart_ptr< boost::shared_ptr<BaseEvent> >()
        .function("clone", &BaseEvent::Clone)
	    .function("isExecutable", &BaseEvent::IsExecutable)
	    .function("canHaveSubEvents", &BaseEvent::CanHaveSubEvents)
        .function("hasSubEvents", &BaseEvent::HasSubEvents)
	    .function("getSubEvents", &BaseEvent_GetSubEvents, allow_raw_pointers())
        //TODO: Render??
	    ;

    class_<StandardEvent, base<BaseEvent> >("StandardEvent")
        .constructor<>()
        .function("getConditions", &StandardEvent_GetConditions, allow_raw_pointers())
        .function("getActions", &StandardEvent_GetActions, allow_raw_pointers())
        ;

    class_<CommentEvent, base<BaseEvent> >("CommentEvent")
        .constructor<>()
        .function("getComment", &CommentEvent_GetComment)
        .function("setComment", &CommentEvent_SetComment)
        ;

    class_<WhileEvent, base<BaseEvent> >("WhileEvent")
        .constructor<>()
        .function("getConditions", &WhileEvent_GetConditions, allow_raw_pointers())
        .function("getWhileConditions", &WhileEvent_GetWhileConditions, allow_raw_pointers())
        .function("getActions", &WhileEvent_GetActions, allow_raw_pointers())
        ;

    //TODO: RepeatEvent, ForEachEvent
}

EMSCRIPTEN_BINDINGS(gd_EventsCodeGenerator) {
    class_<EventsCodeGenerator>("EventsCodeGenerator")
        ;

}
#endif