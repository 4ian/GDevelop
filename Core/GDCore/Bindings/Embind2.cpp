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
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Builtin/CommentEvent.h"

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
const std::string & CommentEvent_GetComment(CommentEvent & e) { return e.com1; }
void CommentEvent_SetComment(CommentEvent & e, const std::string & com) { e.com1 = com; }
}

EMSCRIPTEN_BINDINGS(gd_BaseEvent) {
    register_vector< boost::shared_ptr<BaseEvent> >("VectorEvent");

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
}

#endif