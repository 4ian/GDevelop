/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

/*
 * When cross-compiling using emscripten, this file exposes the GDCore API
 * to javascript.
 *
 * The javascript API of GDCore is the same as the C++ one except that:
 *  - functions begins lowercase ("getLayout"),
 *  - not all methods or classes are available.
 */
#if defined(EMSCRIPTEN)
#include <emscripten/bind.h>
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/VariablesContainer.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/IDE/ProjectExporter.h"

using namespace emscripten;
using namespace gd;

EMSCRIPTEN_BINDINGS(gd_Platform) {
    class_<ProjectExporter>("ProjectExporter")
        ;

    class_<Platform>("Platform")
        .constructor<>()
	    .function("getName", &Platform::GetName)
	    .function("getFullName", &Platform::GetFullName)
	    .function("getSubtitle", &Platform::GetSubtitle)
        .function("getDescription", &Platform::GetDescription)
	    .function("isExtensionLoaded", &Platform::IsExtensionLoaded)
        .function("getProjectExporter", &Platform::GetProjectExporter)
	    ;
}

namespace gd { //Workaround for emscripten not supporting methods returning a reference (objects are returned by copy in JS).
Variable * Variable_GetChild(Variable & v, const std::string & name) { return &v.GetChild(name); }
}

EMSCRIPTEN_BINDINGS(gd_Variable) {
    class_<Variable>("Variable")
        .constructor<>()
        .function("getString", &Variable::GetString)
        .function("setString", &Variable::SetString)
        .function("getValue", &Variable::GetValue)
        .function("setValue", &Variable::SetValue)
        .function("hasChild", &Variable::HasChild)
        .function("getChild", &Variable_GetChild, allow_raw_pointers())
        .function("removeChild", &Variable::RemoveChild)
        .function("getAllChildren", &Variable::GetAllChildren)
        .function("isNumber", &Variable::IsNumber)
        .function("isStructure", &Variable::IsStructure)
        ;
}

namespace gd { //Workaround for emscripten not supporting methods returning a reference (objects are returned by copy in JS).
Variable * VariablesContainer_Get(VariablesContainer & v, const std::string & name) { return &v.Get(name); }
std::pair<std::string, gd::Variable> * VariablesContainer_GetAt(VariablesContainer & v, unsigned int pos) { return &v.Get(pos); }
Variable * VariablesContainer_Insert(VariablesContainer & v, const std::string & name, const Variable & variable, unsigned int position) { return &v.Insert(name, variable, position); }
Variable * VariablesContainer_InsertNew(VariablesContainer & v, const std::string & name, unsigned int position) { return &v.InsertNew(name, position); }
}

EMSCRIPTEN_BINDINGS(gd_VariablesContainer) {
    class_<VariablesContainer>("VariablesContainer")
        .constructor<>()
        .function("has", &VariablesContainer::Has)
        .function("get", &VariablesContainer_Get, allow_raw_pointers())
        //.function("getAt", &VariablesContainer_GetAt, allow_raw_pointers())
        .function("insert", &VariablesContainer_Insert, allow_raw_pointers())
        .function("insertNew", &VariablesContainer_InsertNew, allow_raw_pointers())
        .function("remove", &VariablesContainer::Remove)
        .function("rename", &VariablesContainer::Rename)
        .function("count", &VariablesContainer::Count)
        .function("clear", &VariablesContainer::Clear)
        ;
}

namespace gd { //Workaround for emscripten not supporting methods returning a reference (objects are returned by copy in JS).
gd::Layout * Project_GetLayout(gd::Project & project, const std::string & name) { return &project.GetLayout(name); }
gd::VariablesContainer * Project_GetVariables(gd::Project & project) { return &project.GetVariables(); }
gd::Layout * Project_InsertNewLayout(gd::Project & project, const std::string & name, unsigned int pos) { return &project.InsertNewLayout(name, pos); }
}

EMSCRIPTEN_BINDINGS(gd_Project) {
    class_<Project>("Project")
        .constructor<>()
        .function("getName", &Project::GetName).function("setName", &Project::SetName)
        .function("getAuthor", &Project::GetAuthor).function("setAuthor", &Project::SetAuthor)
        .function("getMainWindowDefaultWidth", &Project::GetMainWindowDefaultWidth).function("setDefaultWidth", &Project::SetDefaultWidth)
        .function("getMainWindowDefaultHeight", &Project::GetMainWindowDefaultHeight).function("setDefaultHeight", &Project::SetDefaultHeight)
        .function("getMaximumFPS", &Project::GetMaximumFPS).function("setMaximumFPS", &Project::SetMaximumFPS)
        .function("getMinimumFPS", &Project::GetMinimumFPS).function("setMinimumFPS", &Project::SetMinimumFPS)

        .function("addPlatform", &Project::AddPlatform)
        .function("getCurrentPlatform", &Project::GetCurrentPlatform)
        .function("createObject", &Project::CreateObject)
        .function("createEvent", &Project::CreateEvent)

        .function("hasLayoutNamed", &Project::HasLayoutNamed)
        .function("getLayout", gd::Project_GetLayout, allow_raw_pointers())
        .function("insertNewLayout", &Project_InsertNewLayout, allow_raw_pointers())
        .function("removeLayout", &Project::RemoveLayout)
        .function("isDirty", &Project::IsDirty).function("setDirty", &Project::SetDirty)

        .function("getVariables", &Project_GetVariables, allow_raw_pointers())
        //Properties, for convenience only:
        .property("name", &Project::GetName, &Project::SetName)
        .property("author", &Project::GetAuthor, &Project::SetAuthor)
        .property("width", &Project::GetMainWindowDefaultWidth, &Project::SetDefaultWidth)
        .property("height", &Project::GetMainWindowDefaultHeight, &Project::SetDefaultHeight)
        .property("maximumFPS", &Project::GetMaximumFPS, &Project::SetMaximumFPS)
        .property("minimumFPS", &Project::GetMinimumFPS, &Project::SetMinimumFPS)
        //.property("dirty", &Project::IsDirty, &Project::SetDirty)
        ;
}

namespace gd { //Workaround for emscripten not supporting methods returning a reference (objects are returned by copy in JS).
gd::VariablesContainer * Object_GetVariables(gd::Object & o) { return &o.GetVariables(); }
}

EMSCRIPTEN_BINDINGS(gd_Object) {
    class_<Object>("Object")
        .constructor<const std::string &>()
        .function("getName", &Object::GetName).function("setName", &Object::SetName)
        .function("getVariables", &Object_GetVariables, allow_raw_pointers())
        //TODO:Automatisms
        //TODO:Properties
        //Properties, for convenience only:
        .property("name", &Object::GetName, &Object::SetName)
        ;
}


namespace gd { //Workaround for emscripten not supporting methods returning a reference (objects are returned by copy in JS).
gd::InitialInstancesContainer * Layout_GetInitialInstances(gd::Layout & l) { return &l.GetInitialInstances(); }
gd::VariablesContainer * Layout_GetVariables(gd::Layout & l) { return &l.GetVariables(); }
gd::Layer * Layout_GetLayer(gd::Layout & l, const std::string & name) { return &l.GetLayer(name); }
gd::Object * ClassWithObjects_GetObject(gd::ClassWithObjects & c, const std::string & name) { return &c.GetObject(name); }
gd::Object * ClassWithObjects_GetObjectAt(gd::ClassWithObjects & c, unsigned int id) { return &c.GetObject(id); }
}

EMSCRIPTEN_BINDINGS(gd_Layout) {
    class_<ClassWithObjects>("ClassWithObjects")
        .constructor<>()
        .function("insertNewObject", &ClassWithObjects::InsertNewObject)
        .function("insertObject", &ClassWithObjects::InsertObject)
        .function("hasObjectNamed", &ClassWithObjects::HasObjectNamed)
        .function("getObject", &ClassWithObjects_GetObject, allow_raw_pointers())
        .function("getObjectAt", &ClassWithObjects_GetObjectAt, allow_raw_pointers())
        .function("getObjectPosition", &ClassWithObjects::GetObjectPosition)
        .function("removeObject", &ClassWithObjects::RemoveObject)
        .function("swapObjects", &ClassWithObjects::SwapObjects)
        .function("getObjectsCount", &ClassWithObjects::GetObjectsCount)
        ;

    class_<Layout, base<ClassWithObjects> >("Layout")
        .constructor<>()
        .function("getName", &Layout::GetName).function("setName", &Layout::SetName)
        .function("setBackgroundColor", &Layout::SetBackgroundColor)
        .function("getBackgroundColorRed", &Layout::GetBackgroundColorRed)
        .function("getBackgroundColorGreen", &Layout::GetBackgroundColorGreen)
        .function("getBackgroundColorBlue", &Layout::GetBackgroundColorBlue)
        .function("getWindowDefaultTitle", &Layout::GetWindowDefaultTitle).function("setWindowDefaultTitle", &Layout::SetWindowDefaultTitle)

        .function("getInitialInstances", &Layout_GetInitialInstances, allow_raw_pointers())
        .function("getVariables", &Layout_GetVariables, allow_raw_pointers())

        .function("insertNewLayer", &Layout::InsertNewLayer)
        .function("insertLayer", &Layout::InsertLayer)
        .function("getLayer", &Layout_GetLayer, allow_raw_pointers())
        .function("hasLayerNamed", &Layout::HasLayerNamed)
        .function("removeLayer", &Layout::RemoveLayer)
        .function("getLayersCount", &Layout::GetLayersCount)
        //Properties, for convenience only:
        .property("name", &Layout::GetName, &Layout::SetName)
        ;
}

namespace gd { //Workaround for emscripten not supporting methods returning a reference (objects are returned by copy in JS).
gd::VariablesContainer * InitialInstance_GetVariables(gd::InitialInstance & i) { return &i.GetVariables(); }
}

EMSCRIPTEN_BINDINGS(gd_InitialInstance) {
    class_<InitialInstance>("InitialInstance")
        .constructor<>()
        .function("clone", &InitialInstance::Clone, allow_raw_pointers())
        .function("getObjectName", &InitialInstance::GetObjectName)
        .function("setObjectName", &InitialInstance::SetObjectName)
        .function("getX", &InitialInstance::GetX).function("setX", &InitialInstance::SetX)
        .function("getY", &InitialInstance::GetY).function("setY", &InitialInstance::SetY)
        .function("getAngle", &InitialInstance::GetAngle).function("setAngle", &InitialInstance::SetAngle)
        .function("getZOrder", &InitialInstance::GetZOrder).function("setZOrder", &InitialInstance::SetZOrder)
        .function("getLayer", &InitialInstance::GetLayer).function("setLayer", &InitialInstance::SetLayer)
        .function("hasCustomSize", &InitialInstance::HasCustomSize).function("setHasCustomSize", &InitialInstance::SetHasCustomSize)
        .function("getCustomWidth", &InitialInstance::GetCustomWidth).function("setCustomWidth", &InitialInstance::SetCustomWidth)
        .function("getCustomHeight", &InitialInstance::GetCustomHeight).function("setCustomHeight", &InitialInstance::SetCustomHeight)
        .function("isLocked", &InitialInstance::IsLocked).function("setLocked", &InitialInstance::SetLocked)
        .function("getVariables", &InitialInstance_GetVariables, allow_raw_pointers())
        //Properties, for convenience only:
        .property("objectName", &InitialInstance::GetObjectName, &InitialInstance::SetObjectName)
        .property("x", &InitialInstance::GetX, &InitialInstance::SetX)
        .property("y", &InitialInstance::GetY, &InitialInstance::SetY)
        .property("angle", &InitialInstance::GetAngle, &InitialInstance::SetAngle)
        .property("zOrder", &InitialInstance::GetZOrder, &InitialInstance::SetZOrder)
        .property("layer", &InitialInstance::GetLayer, &InitialInstance::SetLayer)
        .property("customWidth", &InitialInstance::GetCustomWidth, &InitialInstance::SetCustomWidth)
        .property("customHeight", &InitialInstance::GetCustomHeight, &InitialInstance::SetCustomHeight)
        //.property("locked", &InitialInstance::IsLocked, &InitialInstance::SetLocked)
        ;
}

namespace gd { //Workaround for emscripten not supporting methods returning a reference (objects are returned by copy in JS).
gd::InitialInstance * InitialInstancesContainer_InsertInitialInstance(gd::InitialInstancesContainer & c, const InitialInstance & instance) { return &c.InsertInitialInstance(instance); }
gd::InitialInstance * InitialInstancesContainer_InsertNewInitialInstance(gd::InitialInstancesContainer & c) { return &c.InsertNewInitialInstance(); }

struct InitialInstanceFunctorWrapper : public wrapper<InitialInstanceFunctor> {
    EMSCRIPTEN_WRAPPER(InitialInstanceFunctorWrapper);
    void operator()(InitialInstance & instance) {
        return call<void>("invoke", instance);
    }
};

}

EMSCRIPTEN_BINDINGS(gd_InitialInstancesContainer) {
    class_<InitialInstanceFunctor>("InitialInstanceFunctor")
        .function("invoke", &InitialInstanceFunctor::operator())
        .allow_subclass<InitialInstanceFunctorWrapper>()
        ;

    class_<InitialInstancesContainer>("InitialInstancesContainer")
        .constructor<>()
        .function("create", &InitialInstancesContainer::Create)
        .function("getInstancesCount", &InitialInstancesContainer::GetInstancesCount)
        .function("iterateOverInstances", &InitialInstancesContainer::IterateOverInstances)
        .function("iterateOverInstancesWithZOrdering", &InitialInstancesContainer::IterateOverInstancesWithZOrdering)
        .function("insertInitialInstance", &InitialInstancesContainer_InsertInitialInstance, allow_raw_pointers())
        .function("insertNewInitialInstance", &InitialInstancesContainer_InsertNewInitialInstance, allow_raw_pointers())
        .function("removeInstance", &InitialInstancesContainer::RemoveInstance)
        .function("removeAllInstancesOnLayer", &InitialInstancesContainer::RemoveAllInstancesOnLayer)
        .function("moveInstancesToLayer", &InitialInstancesContainer::MoveInstancesToLayer)
        .function("removeInitialInstancesOfObject", &InitialInstancesContainer::RemoveInitialInstancesOfObject)
        .function("renameInstancesOfObject", &InitialInstancesContainer::RenameInstancesOfObject)
        .function("someInstancesAreOnLayer", &InitialInstancesContainer::SomeInstancesAreOnLayer)
        ;
}

#endif