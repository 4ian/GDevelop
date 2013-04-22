#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/PlatformDefinition/AutomatismsSharedData.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/Events/ObjectMetadata.h"
#include "GDCore/Events/AutomatismMetadata.h"
#include "GDCore/Events/EventMetadata.h"
#include "GDCore/Events/Event.h"
#include <wx/bitmap.h>

namespace gd
{

std::map<std::string, gd::InstructionMetadata > PlatformExtension::badConditionsMetadata;
std::map<std::string, gd::InstructionMetadata > PlatformExtension::badActionsMetadata;
std::map<std::string, gd::ExpressionMetadata > PlatformExtension::badExpressionsMetadata;
std::map<std::string, gd::StrExpressionMetadata > PlatformExtension::badStrExpressionsMetadata;

gd::InstructionMetadata & PlatformExtension::AddCondition(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & sentence,
                                       const std::string & group,
                                       const std::string & icon,
                                       const std::string & smallicon)
{
    std::string nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    conditionsInfos[nameWithNamespace] = InstructionMetadata(GetNameSpace(), nameWithNamespace, fullname, description, sentence, group, icon, smallicon);
    return conditionsInfos[nameWithNamespace];
}

gd::InstructionMetadata & PlatformExtension::AddAction(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & sentence,
                                       const std::string & group,
                                       const std::string & icon,
                                       const std::string & smallicon)
{
    std::string nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    actionsInfos[nameWithNamespace] = InstructionMetadata(GetNameSpace(), nameWithNamespace, fullname, description, sentence, group, icon, smallicon);
    return actionsInfos[nameWithNamespace];
}

gd::ExpressionMetadata & PlatformExtension::AddExpression(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & group,
                                       const std::string & smallicon)
{
    std::string nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    expressionsInfos[nameWithNamespace] = ExpressionMetadata(GetNameSpace(), nameWithNamespace, fullname, description, group, smallicon);
    return expressionsInfos[nameWithNamespace];
}

gd::StrExpressionMetadata & PlatformExtension::AddStrExpression(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & group,
                                       const std::string & smallicon)
{
    std::string nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    strExpressionsInfos[nameWithNamespace] = StrExpressionMetadata(GetNameSpace(), nameWithNamespace, fullname, description, group, smallicon);
    return strExpressionsInfos[nameWithNamespace];
}

gd::ObjectMetadata & PlatformExtension::AddObject(const std::string & name,
                               const std::string & fullname,
                               const std::string & informations,
                               const std::string & icon24x24,
                               CreateFunPtr createFunPtrP,
                               DestroyFunPtr destroyFunPtrP,
                               const std::string & cppClassName)
{
    std::string nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    objectsInfos[nameWithNamespace] = ObjectMetadata(GetNameSpace(), nameWithNamespace, fullname, informations, icon24x24, createFunPtrP, destroyFunPtrP, cppClassName);
    return objectsInfos[nameWithNamespace];
}

gd::AutomatismMetadata & PlatformExtension::AddAutomatism(const std::string & name,
                                                      const std::string & fullname,
                                                      const std::string & defaultName,
                                                      const std::string & description,
                                                      const std::string & group,
                                                      const std::string & icon24x24,
                                                      const std::string & className,
                                                      boost::shared_ptr<gd::Automatism> instance,
                                                      boost::shared_ptr<gd::AutomatismsSharedData> sharedDatasInstance)
{
    std::string nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
   automatismsInfo[nameWithNamespace] = AutomatismMetadata(GetNameSpace(), nameWithNamespace, fullname, defaultName, description, group, icon24x24, className, instance, sharedDatasInstance);
   return automatismsInfo[nameWithNamespace];
}

gd::EventMetadata & PlatformExtension::AddEvent(const std::string & name_,
                                                 const std::string & fullname_,
                                                 const std::string & description_,
                                                 const std::string & group_,
                                                 const std::string & smallicon_,
                                                 boost::shared_ptr<gd::BaseEvent> instance_)
{
    std::string nameWithNamespace = GetNameSpace().empty() ? name_ : GetNameSpace()+name_;
    eventsInfos[nameWithNamespace] = gd::EventMetadata(nameWithNamespace, fullname_, description_, group_, smallicon_, instance_);
    return eventsInfos[nameWithNamespace];
}

void PlatformExtension::SetExtensionInformation(const std::string & name_,
                                                 const std::string & fullname_,
                                                 const std::string & description_,
                                                 const std::string & author_,
                                                 const std::string & license_)
{
    name = name_;
    fullname = fullname_;
    informations = description_;
    author = author_;
    license = license_;
    SetNameSpace(name_);
}

std::vector < std::string > PlatformExtension::GetExtensionObjectsTypes() const
{
    std::vector < std::string > objects;

    std::map<std::string, gd::ObjectMetadata>::const_iterator it;
    for(it = objectsInfos.begin(); it != objectsInfos.end(); ++it)
        objects.push_back(it->first);

    return objects;
}

#if defined(GD_IDE_ONLY)
std::vector < std::string > PlatformExtension::GetAutomatismsTypes() const
{
    std::vector < std::string > automatisms;

    std::map<std::string, gd::AutomatismMetadata>::const_iterator it;
    for(it = automatismsInfo.begin(); it != automatismsInfo.end(); ++it)
        automatisms.push_back(it->first);

    return automatisms;
}

const std::map<std::string, gd::InstructionMetadata > & PlatformExtension::GetAllActions() const
{
    return actionsInfos;
}

const std::map<std::string, gd::InstructionMetadata > & PlatformExtension::GetAllConditions() const
{
    return conditionsInfos;
}

const std::map<std::string, gd::ExpressionMetadata > & PlatformExtension::GetAllExpressions() const
{
    return expressionsInfos;
}

const std::map<std::string, gd::StrExpressionMetadata > & PlatformExtension::GetAllStrExpressions() const
{
    return strExpressionsInfos;
}

const std::map<std::string, gd::EventMetadata > & PlatformExtension::GetAllEvents() const
{
    return eventsInfos;
}

const std::map<std::string, gd::AutomatismMetadata > & PlatformExtension::GetAllAutomatisms() const
{
    return automatismsInfo;
}
const std::map<std::string, gd::InstructionMetadata > & PlatformExtension::GetAllActionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.actionsInfos;

    return badActionsMetadata;
}

const std::map<std::string, gd::InstructionMetadata > & PlatformExtension::GetAllConditionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.conditionsInfos;

    return badConditionsMetadata;
}

const std::map<std::string, gd::ExpressionMetadata > & PlatformExtension::GetAllExpressionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.expressionsInfos;

    return badExpressionsMetadata;
}

const std::map<std::string, gd::StrExpressionMetadata > & PlatformExtension::GetAllStrExpressionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.strExpressionsInfos;

    return badStrExpressionsMetadata;
}

const std::map<std::string, gd::InstructionMetadata > & PlatformExtension::GetAllActionsForAutomatism(std::string autoType) const
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.actionsInfos;

    return badActionsMetadata;
}

const std::map<std::string, gd::InstructionMetadata > & PlatformExtension::GetAllConditionsForAutomatism(std::string autoType) const
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.conditionsInfos;

    return badConditionsMetadata;
}

const std::map<std::string, gd::ExpressionMetadata > & PlatformExtension::GetAllExpressionsForAutomatism(std::string autoType) const
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.expressionsInfos;

    return badExpressionsMetadata;
}

const std::map<std::string, gd::StrExpressionMetadata > & PlatformExtension::GetAllStrExpressionsForAutomatism(std::string autoType) const
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.strExpressionsInfos;

    return badStrExpressionsMetadata;
}

const gd::ObjectMetadata & PlatformExtension::GetObjectMetadata(const std::string & objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second;

    return badObjectMetadata;
}

const gd::AutomatismMetadata & PlatformExtension::GetAutomatismMetadata(const std::string & automatismType) const
{
    if ( automatismsInfo.find(automatismType) != automatismsInfo.end())
        return automatismsInfo.find(automatismType)->second;

    return badAutomatismMetadata;
}

gd::BaseEventSPtr PlatformExtension::CreateEvent(std::string eventType) const
{
    if ( eventsInfos.find(eventType) != eventsInfos.end())
        return eventsInfos.find(eventType)->second.instance->Clone();

    return boost::shared_ptr<gd::BaseEvent>();
}
#endif

CreateFunPtr PlatformExtension::GetObjectCreationFunctionPtr(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.createFunPtr;

    return NULL;
}

DestroyFunPtr PlatformExtension::GetDestroyObjectFunction(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.destroyFunPtr;

    return NULL;
}

Automatism* PlatformExtension::CreateAutomatism(std::string type) const
{
    if ( automatismsInfo.find(type) != automatismsInfo.end())
        return automatismsInfo.find(type)->second.GetInstance()->Clone();

    return NULL;
}


boost::shared_ptr<gd::AutomatismsSharedData> PlatformExtension::CreateAutomatismSharedDatas(std::string type) const
{
    if ( automatismsInfo.find(type) != automatismsInfo.end())
        return automatismsInfo.find(type)->second.GetSharedDataInstance()->Clone();

    return boost::shared_ptr<gd::AutomatismsSharedData>();
}


void PlatformExtension::SetNameSpace(std::string nameSpace_)
{
    //For backward compatibility
    //or for extension without namespace
    if (name == "Sprite" ||
        name == "BuiltinObject" ||
        name == "BuiltinAudio" ||
        name == "BuiltinMouse" ||
        name == "BuiltinKeyboard"||
        name == "BuiltinJoystick" ||
        name == "BuiltinTime"||
        name == "BuiltinFile"||
        name == "BuiltinInterface"||
        name == "BuiltinVariables"||
        name == "BuiltinCamera"||
        name == "BuiltinWindow"||
        name == "BuiltinNetwork"||
        name == "BuiltinScene"||
        name == "BuiltinAdvanced" ||
        name == "BuiltinCommonConversions" ||
        name == "BuiltinStringInstructions" ||
        name == "BuiltinMathematicalTools" ||
        name == "CommonDialogs") //New name for BuiltinInterface
    {
        nameSpace = "";
        return;
    }


    nameSpace = nameSpace_+"::";
}

PlatformExtension::PlatformExtension()
{
    //ctor
}

PlatformExtension::~PlatformExtension()
{
    //dtor
}

}
