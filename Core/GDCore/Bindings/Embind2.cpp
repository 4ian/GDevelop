/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/*
 * The rest of the API exposed using embind.
 * See Embind.cpp for more information
 */
#if defined(EMSCRIPTEN)
#include <emscripten/bind.h>
#include <boost/make_shared.hpp>
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/ProjectResourcesAdder.h"
#include "GDCore/IDE/EventsRefactorer.h"
#include "GDCore/IDE/ArbitraryEventsWorker.h"
#include "GDCore/IDE/EventsParametersLister.h"
#include "GDCore/IDE/MetadataProvider.h"
#include "GDCore/IDE/InstructionSentenceFormatter.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Builtin/CommentEvent.h"
#include "GDCore/Events/Builtin/ForEachEvent.h"
#include "GDCore/Events/Builtin/WhileEvent.h"
#include "GDCore/Events/Builtin/RepeatEvent.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/Events/ObjectMetadata.h"
#include "GDCore/Events/AutomatismMetadata.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Serialization/Serializer.h"

using namespace emscripten;
using namespace gd;

namespace gd { //Workaround for emscripten to directly use gd::PlatformExtension instead of shared pointers.
PlatformExtension * VectorPlatformExtension_Get(std::vector<boost::shared_ptr<PlatformExtension> > & v, unsigned int i) { return v[i].get(); };
unsigned int VectorPlatformExtension_Size(const std::vector<boost::shared_ptr<PlatformExtension> > & v) { return v.size(); };

std::map<std::string, gd::EventMetadata > * PlatformExtension_GetAllEvents(PlatformExtension & e) { return &e.GetAllEvents();};
std::map<std::string, gd::InstructionMetadata > * PlatformExtension_GetAllActions(PlatformExtension & e) { return &e.GetAllActions();};
std::map<std::string, gd::InstructionMetadata > * PlatformExtension_GetAllConditions(PlatformExtension & e) { return &e.GetAllConditions();};
std::map<std::string, gd::ExpressionMetadata > * PlatformExtension_GetAllExpressions(PlatformExtension & e) { return &e.GetAllExpressions();};
std::map<std::string, gd::StrExpressionMetadata > * PlatformExtension_GetAllStrExpressions(PlatformExtension & e) { return &e.GetAllStrExpressions();};
std::map<std::string, gd::InstructionMetadata > * PlatformExtension_GetAllActionsForObject(PlatformExtension & e, std::string objectType) { return &e.GetAllActionsForObject(objectType);};
std::map<std::string, gd::InstructionMetadata > * PlatformExtension_GetAllConditionsForObject(PlatformExtension & e, std::string objectType) { return &e.GetAllConditionsForObject(objectType);};
std::map<std::string, gd::ExpressionMetadata > * PlatformExtension_GetAllExpressionsForObject(PlatformExtension & e, std::string objectType) { return &e.GetAllExpressionsForObject(objectType);};
std::map<std::string, gd::StrExpressionMetadata > * PlatformExtension_GetAllStrExpressionsForObject(PlatformExtension & e, std::string objectType) { return &e.GetAllStrExpressionsForObject(objectType);};
std::map<std::string, gd::InstructionMetadata > * PlatformExtension_GetAllActionsForAutomatism(PlatformExtension & e, std::string autoType) { return &e.GetAllActionsForAutomatism(autoType);};
std::map<std::string, gd::InstructionMetadata > * PlatformExtension_GetAllConditionsForAutomatism(PlatformExtension & e, std::string autoType) { return &e.GetAllConditionsForAutomatism(autoType);};
std::map<std::string, gd::ExpressionMetadata > * PlatformExtension_GetAllExpressionsForAutomatism(PlatformExtension & e, std::string autoType) { return &e.GetAllExpressionsForAutomatism(autoType);};
std::map<std::string, gd::StrExpressionMetadata > * PlatformExtension_GetAllStrExpressionsForAutomatism(PlatformExtension & e, std::string autoType) { return &e.GetAllStrExpressionsForAutomatism(autoType);};
}

EMSCRIPTEN_BINDINGS(gd_PlatformExtension) {
    class_<std::vector<boost::shared_ptr<PlatformExtension> > >("VectorPlatformExtension")
        .function("size", &VectorPlatformExtension_Size)
        .function("get", &VectorPlatformExtension_Get, allow_raw_pointers())
        ;

    class_<PlatformExtension>("PlatformExtension")
        //Information about the extension:
        .function("getFullName", &PlatformExtension::GetFullName)
        .function("getName", &PlatformExtension::GetName)
        .function("getDescription", &PlatformExtension::GetDescription)
        .function("getAuthor", &PlatformExtension::GetAuthor)
        .function("getLicense", &PlatformExtension::GetLicense)
        .function("isBuiltin", &PlatformExtension::IsBuiltin)
        .function("getNameSpace", &PlatformExtension::GetNameSpace)
        //Accessing what's inside the extension:
        .function("getExtensionObjectsTypes", &PlatformExtension::GetExtensionObjectsTypes)
        .function("getAutomatismsTypes", &PlatformExtension::GetAutomatismsTypes)
        .function("getObjectMetadata", &PlatformExtension::GetObjectMetadata)
        .function("getAutomatismMetadata", &PlatformExtension::GetAutomatismMetadata)
        //Actions, conditions and events:
        .function("getAllEvents", &PlatformExtension_GetAllEvents, allow_raw_pointers())
        .function("getAllActions", &PlatformExtension_GetAllActions, allow_raw_pointers())
        .function("getAllConditions", &PlatformExtension_GetAllConditions, allow_raw_pointers())
        .function("getAllExpressions", &PlatformExtension_GetAllExpressions, allow_raw_pointers())
        .function("getAllStrExpressions", &PlatformExtension_GetAllStrExpressions, allow_raw_pointers())
        .function("getAllActionsForObject", &PlatformExtension_GetAllActionsForObject, allow_raw_pointers())
        .function("getAllConditionsForObject", &PlatformExtension_GetAllConditionsForObject, allow_raw_pointers())
        .function("getAllExpressionsForObject", &PlatformExtension_GetAllExpressionsForObject, allow_raw_pointers())
        .function("getAllStrExpressionsForObject", &PlatformExtension_GetAllStrExpressionsForObject, allow_raw_pointers())
        .function("getAllActionsForAutomatism", &PlatformExtension_GetAllActionsForAutomatism, allow_raw_pointers())
        .function("getAllConditionsForAutomatism", &PlatformExtension_GetAllConditionsForAutomatism, allow_raw_pointers())
        .function("getAllExpressionsForAutomatism", &PlatformExtension_GetAllExpressionsForAutomatism, allow_raw_pointers())
        .function("getAllStrExpressionsForAutomatism", &PlatformExtension_GetAllStrExpressionsForObject, allow_raw_pointers())
        ;
}

namespace gd { //Workaround for emscripten to directly use strings instead of gd::Expression.
gd::Instruction Instruction_Clone(gd::Instruction & i) { gd::Instruction n = i; return n; };
void Instruction_SetParameter(gd::Instruction & i, unsigned int nb, const std::string & val) { i.SetParameter(nb, val); };
const std::string & Instruction_GetParameter(gd::Instruction & i, unsigned int nb) { return i.GetParameter(nb).GetPlainString(); };
std::vector < Instruction > * Instruction_GetSubInstructions(gd::Instruction & i) { return &i.GetSubInstructions(); };
void VectorInstruction_Remove(std::vector < Instruction > & v, unsigned int i) { v.erase(v.begin()+i); };
}

EMSCRIPTEN_BINDINGS(gd_Instruction) {
    register_vector< Instruction >("VectorInstruction")
        //"set, get, size, push_back" are already registered by register_vector
        .function("remove", &VectorInstruction_Remove);

    class_<Instruction>("Instruction")
        .constructor<>()
        .function("clone", &Instruction_Clone)
        .function("getType", &Instruction::GetType).function("setType", &Instruction::SetType)
        .function("isInverted", &Instruction::IsInverted).function("setInverted", &Instruction::SetInverted)
        .function("getParameter", &Instruction_GetParameter).function("setParameter", &Instruction_SetParameter)
        .function("getParametersCount", &Instruction::GetParametersCount).function("setParametersCount", &Instruction::SetParametersCount)
        .function("getSubInstructions", &Instruction_GetSubInstructions, allow_raw_pointers())
        //Properties, for convenience only:
        .property("parametersCount", &Instruction::GetParametersCount, &Instruction::SetParametersCount)
        ;
}

namespace gd { //Workaround for emscripten not supporting methods returning a reference (objects are returned by copy in JS).
gd::EventsList * BaseEvent_GetSubEvents(BaseEvent & e) { return &e.GetSubEvents(); }
std::vector < gd::Instruction > * StandardEvent_GetConditions(StandardEvent & e) { return &e.GetConditions(); }
std::vector < gd::Instruction > * StandardEvent_GetActions(StandardEvent & e) { return &e.GetActions(); }
std::vector < gd::Instruction > * WhileEvent_GetConditions(WhileEvent & e) { return &e.GetConditions(); }
std::vector < gd::Instruction > * WhileEvent_GetActions(WhileEvent & e) { return &e.GetActions(); }
std::vector < gd::Instruction > * WhileEvent_GetWhileConditions(WhileEvent & e) { return &e.GetWhileConditions(); }
std::vector < gd::Instruction > * ForEachEvent_GetConditions(ForEachEvent & e) { return &e.GetConditions(); }
std::vector < gd::Instruction > * ForEachEvent_GetActions(ForEachEvent & e) { return &e.GetActions(); }
std::vector < gd::Instruction > * RepeatEvent_GetConditions(RepeatEvent & e) { return &e.GetConditions(); }
std::vector < gd::Instruction > * RepeatEvent_GetActions(RepeatEvent & e) { return &e.GetActions(); }
const std::string & CommentEvent_GetComment(CommentEvent & e) { return e.com1; }
void CommentEvent_SetComment(CommentEvent & e, const std::string & com) { e.com1 = com; }
gd::StandardEvent * AsStandardEvent(gd::BaseEvent * e) { return static_cast<gd::StandardEvent*>(e);}
gd::CommentEvent * AsCommentEvent(gd::BaseEvent * e) { return static_cast<gd::CommentEvent*>(e);}
gd::WhileEvent * AsWhileEvent(gd::BaseEvent * e) { return static_cast<gd::WhileEvent*>(e);}
gd::ForEachEvent * AsForEachEvent(gd::BaseEvent * e) { return static_cast<gd::ForEachEvent*>(e);}
gd::RepeatEvent * AsRepeatEvent(gd::BaseEvent * e) { return static_cast<gd::RepeatEvent*>(e);}
}

EMSCRIPTEN_BINDINGS(gd_BaseEvent) {
    class_<BaseEvent>("BaseEvent")
        .constructor<>()
        .smart_ptr< boost::shared_ptr<BaseEvent> >("BaseEventSPtr")
        .function("clone", &BaseEvent::Clone)
        .function("getType", &BaseEvent::GetType).function("setType", &BaseEvent::SetType)
	    .function("isExecutable", &BaseEvent::IsExecutable)
	    .function("canHaveSubEvents", &BaseEvent::CanHaveSubEvents)
        .function("hasSubEvents", &BaseEvent::HasSubEvents)
        .function("getSubEvents", &BaseEvent_GetSubEvents, allow_raw_pointers())
        .function("isDisabled", &BaseEvent::IsDisabled)
        .function("setDisabled", &BaseEvent::SetDisabled)
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
        .function("getActions", &WhileEvent_GetActions, allow_raw_pointers())
        .function("getWhileConditions", &WhileEvent_GetWhileConditions, allow_raw_pointers())
        ;

    class_<ForEachEvent, base<BaseEvent> >("ForEachEvent")
        .constructor<>()
        .function("getConditions", &ForEachEvent_GetConditions, allow_raw_pointers())
        .function("getActions", &ForEachEvent_GetActions, allow_raw_pointers())
        .function("getObjectsToPick", &ForEachEvent::GetObjectToPick)
        .function("setObjectsToPick", &ForEachEvent::SetObjectToPick)
        ;

    class_<RepeatEvent, base<BaseEvent> >("RepeatEvent")
        .constructor<>()
        .function("getConditions", &RepeatEvent_GetConditions, allow_raw_pointers())
        .function("getActions", &RepeatEvent_GetActions, allow_raw_pointers())
        .function("getRepeatExpression", &RepeatEvent::GetRepeatExpression)
        .function("setRepeatExpression", &RepeatEvent::SetRepeatExpression)
        ;

    function("asStandardEvent", &AsStandardEvent, allow_raw_pointers());
    function("asCommentEvent", &AsCommentEvent, allow_raw_pointers());
    function("asForEachEvent", &AsForEachEvent, allow_raw_pointers());
    function("asWhileEvent", &AsWhileEvent, allow_raw_pointers());
    function("asRepeatEvent", &AsRepeatEvent, allow_raw_pointers());
}

namespace gd { //Workaround for emscripten not supporting methods returning a reference (objects are returned by copy in JS).
gd::BaseEvent * EventsList_GetEventAt(EventsList & l, size_t i) { return &l.GetEvent(i); }
gd::BaseEvent * EventsList_InsertEvent(EventsList & l, gd::BaseEvent & e, size_t pos) { return &l.InsertEvent(e, pos); }
gd::BaseEvent * EventsList_InsertNewEvent(EventsList & l, gd::Project & p, const std::string & t, size_t pos) { return &l.InsertNewEvent(p, t, pos); }
}

EMSCRIPTEN_BINDINGS(gd_EventsList) {
    class_<EventsList>("EventsList")
        .constructor<>()
        .function("clone", &EventsList::Clone, allow_raw_pointers())
        .function("insertEvent", &EventsList_InsertEvent, allow_raw_pointers())
        .function("insertNewEvent", &EventsList_InsertNewEvent, allow_raw_pointers())
        .function("insertEvents", &EventsList::InsertEvents)
        .function("getEventAt", &EventsList_GetEventAt, allow_raw_pointers())
        .function("removeEventAt", select_overload<void(size_t)>(&EventsList::RemoveEvent))
        .function("removeEvent", select_overload<void(const gd::BaseEvent &)>(&EventsList::RemoveEvent))
        .function("getEventsCount", &EventsList::GetEventsCount)
        .function("contains", &EventsList::Contains)
        .function("isEmpty", &EventsList::IsEmpty)
        .function("clear", &EventsList::Clear)
        .function("serializeTo", &EventsList::SerializeTo)
        .function("unserializeFrom", &EventsList::UnserializeFrom)
        ;
}

namespace gd {
gd::ParameterMetadata * InstructionMetadata_GetParameter(InstructionMetadata & im, unsigned int i) { return &im.parameters[i]; }
}

EMSCRIPTEN_BINDINGS(gd_InstructionMetadata) {
    class_<InstructionMetadata>("InstructionMetadata")
        .function("getFullName", &InstructionMetadata::GetFullName)
        .function("getDescription", &InstructionMetadata::GetDescription)
        .function("getSentence", &InstructionMetadata::GetSentence)
        .function("getGroup", &InstructionMetadata::GetGroup)
        .function("getIconFilename", &InstructionMetadata::GetIconFilename)
        .function("getSmallIconFilename", &InstructionMetadata::GetSmallIconFilename)
        .function("canHaveSubInstructions", &InstructionMetadata::CanHaveSubInstructions)
        .function("setCanHaveSubInstructions", &InstructionMetadata::SetCanHaveSubInstructions)
        .function("getParameter", &InstructionMetadata_GetParameter, allow_raw_pointers())
        .function("getParametersCount", &InstructionMetadata::GetParametersCount)
        ;
}

EMSCRIPTEN_BINDINGS(gd_ParameterMetadata) {
    class_<ParameterMetadata>("ParameterMetadata")
        .function("getType", &ParameterMetadata::GetType)
        .function("getExtraInfo", &ParameterMetadata::GetExtraInfo)
        .function("isOptional", &ParameterMetadata::IsOptional)
        .function("getDescription", &ParameterMetadata::GetDescription)
        .function("isCodeOnly", &ParameterMetadata::IsCodeOnly)
        .function("getDefaultValue", &ParameterMetadata::GetDefaultValue)
        .class_function("isObject", &ParameterMetadata::IsObject)
        ;
}

EMSCRIPTEN_BINDINGS(gd_AutomatismMetadata) {
    class_<AutomatismMetadata>("AutomatismMetadata")
        .function("getFullName", &AutomatismMetadata::GetFullName)
        .function("getDefaultName", &AutomatismMetadata::GetDefaultName)
        .function("getDescription", &AutomatismMetadata::GetDescription)
        .function("getGroup", &AutomatismMetadata::GetGroup)
        .function("getIconFilename", &AutomatismMetadata::GetIconFilename)
        ;
}

EMSCRIPTEN_BINDINGS(gd_MetadataProvider) {
    class_<MetadataProvider>("MetadataProvider")
        .class_function("getAutomatismMetadata", MetadataProvider::GetAutomatismMetadata)
        .class_function("getObjectMetadata", MetadataProvider::GetObjectMetadata)
        .class_function("getActionMetadata", MetadataProvider::GetActionMetadata)
        .class_function("getConditionMetadata", MetadataProvider::GetConditionMetadata)
        .class_function("getExpressionMetadata", MetadataProvider::GetExpressionMetadata)
        .class_function("getObjectExpressionMetadata", MetadataProvider::GetObjectExpressionMetadata)
        .class_function("getAutomatismExpressionMetadata", MetadataProvider::GetAutomatismExpressionMetadata)
        .class_function("getStrExpressionMetadata", MetadataProvider::GetStrExpressionMetadata)
        .class_function("getObjectStrExpressionMetadata", MetadataProvider::GetObjectStrExpressionMetadata)
        .class_function("getAutomatismStrExpressionMetadata", MetadataProvider::GetAutomatismStrExpressionMetadata)
        .class_function("hasCondition", MetadataProvider::HasCondition)
        .class_function("hasAction", MetadataProvider::HasAction)
        .class_function("hasObjectAction", MetadataProvider::HasObjectAction)
        .class_function("hasObjectCondition", MetadataProvider::HasObjectCondition)
        .class_function("hasAutomatismAction", MetadataProvider::HasAutomatismAction)
        .class_function("hasAutomatismCondition", MetadataProvider::HasAutomatismCondition)
        .class_function("hasExpression", MetadataProvider::HasExpression)
        .class_function("hasObjectExpression", MetadataProvider::HasObjectExpression)
        .class_function("hasAutomatismExpression", MetadataProvider::HasAutomatismExpression)
        .class_function("hasStrExpression", MetadataProvider::HasStrExpression)
        .class_function("hasObjectStrExpression", MetadataProvider::HasObjectStrExpression)
        .class_function("hasAutomatismStrExpression", MetadataProvider::HasAutomatismStrExpression)
        ;
}

EMSCRIPTEN_BINDINGS(gd_InstructionSentenceFormatter) {
    class_<InstructionSentenceFormatter>("InstructionSentenceFormatter")
        .class_function("get", &InstructionSentenceFormatter::Get, allow_raw_pointers())
        .function("translate", &InstructionSentenceFormatter::Translate)
        .function("getAsFormattedText", &InstructionSentenceFormatter::GetAsFormattedText)
        .function("getFormattingFromType", &InstructionSentenceFormatter::GetFormattingFromType)
        .function("labelFromType", &InstructionSentenceFormatter::LabelFromType)
        ;
}
/*
namespace gd {
gd::ParameterMetadata * EventsRefactorer_ReplaceStringInEvents(gd::Project & project, gd::Layout & layout, gd::EventsList & events,
    std::string toReplace, std::string newString, bool matchCase, bool inConditions, bool inActions) { return &im.parameters[i]; }
}*/

EMSCRIPTEN_BINDINGS(gd_EventsRefactorer) {
    class_<EventsRefactorer>("EventsRefactorer")
        .class_function("renameObjectInEvents", &EventsRefactorer::RenameObjectInEvents)
        .class_function("removeObjectInEvents", &EventsRefactorer::RemoveObjectInEvents)
        .class_function("replaceStringInEvents", &EventsRefactorer::ReplaceStringInEvents)
        //TODO: SearchInEvents method.
        ;
}

EMSCRIPTEN_BINDINGS(gd_EventsCodeGenerator) {
    class_<EventsCodeGenerator>("EventsCodeGenerator")
        ;
}

struct AbstractFileSystemWrapper : public wrapper<AbstractFileSystem> {
    EMSCRIPTEN_WRAPPER(AbstractFileSystemWrapper);
    virtual void MkDir(const std::string & path) {
        return call<void>("mkDir", path);
    }
    virtual bool DirExists(const std::string & path) {
        return call<bool>("dirExists", path);
    }
    virtual bool ClearDir(const std::string & path) {
        return call<bool>("clearDir", path);
    }
    virtual std::string GetTempDir() {
        return call<std::string>("getTempDir");
    }
    virtual std::string FileNameFrom(const std::string & file) {
        return call<std::string>("fileNameFrom", file);
    }
    virtual std::string DirNameFrom(const std::string & file) {
        return call<std::string>("dirNameFrom", file);
    }
    virtual bool MakeAbsolute(std::string & filename, const std::string & baseDirectory) {
        filename = call<std::string>("getAbsolute", filename, baseDirectory);
        return true;
    }
    virtual bool MakeRelative(std::string & filename, const std::string & baseDirectory) {
        filename = call<std::string>("getRelative", filename, baseDirectory);
        return true;
    }
    virtual bool IsAbsolute(const std::string & file) {
        return call<bool>("isAbsolute", file);
    }
    virtual bool CopyFile(const std::string & file, const std::string & destination) {
        return call<bool>("copyFile", file, destination);
    }
    virtual bool WriteToFile(const std::string & file, const std::string & content) {
        return call<bool>("writeToFile", file, content);
    }
    virtual std::string ReadFile(const std::string & file) {
        return call<std::string>("readFile", file);
    }
    virtual std::vector<std::string> ReadDir(const std::string & path, const std::string & ext) {
        return call< std::vector<std::string> >("readDir", path, ext);
    }
    virtual bool FileExists(const std::string & file) {
        return call<bool>("fileExists", file);
    }
};

namespace gd {
bool AbstractFileSystem_MakeAbsolute(AbstractFileSystem & fs, std::string * filename,
    const std::string & baseDirectory) { return fs.MakeAbsolute(*filename, baseDirectory); }
bool AbstractFileSystem_MakeRelative(AbstractFileSystem & fs, std::string * filename,
    const std::string & baseDirectory) { return fs.MakeRelative(*filename, baseDirectory); }
}

EMSCRIPTEN_BINDINGS(gd_AbstractFileSystem) {
    class_<AbstractFileSystem>("AbstractFileSystem")
        .function("mkDir", &AbstractFileSystem::MkDir)
        .function("dirExists", &AbstractFileSystem::DirExists)
        .function("clearDir", &AbstractFileSystem::ClearDir)
        .function("getTempDir", &AbstractFileSystem::GetTempDir)
        .function("fileNameFrom", &AbstractFileSystem::FileNameFrom)
        .function("dirNameFrom", &AbstractFileSystem::DirNameFrom)
        .function("makeAbsolute", &AbstractFileSystem_MakeAbsolute, allow_raw_pointers())
        .function("makeRelative", &AbstractFileSystem_MakeRelative, allow_raw_pointers())
        .function("isAbsolute", &AbstractFileSystem::IsAbsolute)
        .function("copyFile", &AbstractFileSystem::CopyFile)
        .function("writeToFile", &AbstractFileSystem::WriteToFile)
        .function("readFile", &AbstractFileSystem::ReadFile)
        .function("ReadDir", &AbstractFileSystem::ReadFile)
        .function("fileExists", &AbstractFileSystem::FileExists)
        .allow_subclass<AbstractFileSystemWrapper>("AbstractFileSystemWrapper")
        ;
}

EMSCRIPTEN_BINDINGS(gd_ProjectResourcesAdder) {
    class_<ProjectResourcesAdder>("ProjectResourcesAdder")
        .class_function("addAllMissingImages", &ProjectResourcesAdder::AddAllMissingImages)
        ;
}

EMSCRIPTEN_BINDINGS(gd_ArbitraryEventsWorker) {
    class_<ArbitraryEventsWorker>("ArbitraryEventsWorker")
        .function("launch", &ArbitraryEventsWorker::Launch)
        ;
}
EMSCRIPTEN_BINDINGS(gd_EventsParametersLister) {
    class_<EventsParametersLister, base<ArbitraryEventsWorker> >("EventsParametersLister")
        .constructor<gd::Project &>()
        .function("getParametersAndTypes", &EventsParametersLister::GetParametersAndTypes)
        ;
}
#endif