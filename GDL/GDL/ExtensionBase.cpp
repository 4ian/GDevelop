/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ExtensionBase.h"
#include "GDL/Event.h"
#include "GDL/Automatism.h"
#include "GDL/AutomatismsSharedDatas.h"
#include "GDL/CommonTools.h"
#include <vector>
#include <string>
#include <iostream>

using namespace std;

std::map<std::string, ExtensionObjectInfos > ExtensionBase::badObjectsInfos;
std::map<std::string, InstructionInfos > ExtensionBase::badConditionsInfos;
std::map<std::string, InstructionInfos > ExtensionBase::badActionsInfos;
std::map<std::string, ExpressionInfos > ExtensionBase::badExpressionsInfos;
std::map<std::string, StrExpressionInfos > ExtensionBase::badStrExpressionsInfos;
std::map<std::string, AutomatismInfo > ExtensionBase::badAutomatismsInfo;

ExtensionObjectInfos::ExtensionObjectInfos() :
destroyFunPtr(NULL),
createFunPtr(NULL)
{
}

ExpressionInfos::ExpressionInfos() :
#if defined(GD_IDE_ONLY)
shown(true)
#endif
{
}

ExpressionInfos & ExpressionInfos::SetHidden()
{
    #if defined(GD_IDE_ONLY)
    shown = false;
    #endif

    return *this;
}

StrExpressionInfos::StrExpressionInfos() :
#if defined(GD_IDE_ONLY)
shown(true)
#endif
{
}

StrExpressionInfos & StrExpressionInfos::SetHidden()
{
    #if defined(GD_IDE_ONLY)
    shown = false;
    #endif

    return *this;
}

InstructionInfos::InstructionInfos() :
#if defined(GD_IDE_ONLY)
canHaveSubInstructions(false)
#endif
{
}

ParameterInfo::ParameterInfo() :
#if defined(GD_IDE_ONLY)
optional(false),
codeOnly(false)
#endif
{
}

EventInfos::EventInfos() :
instance(boost::shared_ptr<BaseEvent>())
{
}

AutomatismInfo::AutomatismInfo() :
instance(boost::shared_ptr<Automatism>())
{
}

void ExtensionBase::SetNameSpace(std::string nameSpace_)
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

vector < std::string > ExtensionBase::GetExtensionObjectsTypes() const
{
    vector < string > objects;

    std::map<string, ExtensionObjectInfos>::const_iterator it;
    for(it = objectsInfos.begin(); it != objectsInfos.end(); ++it)
        objects.push_back(it->first);

    return objects;
}

vector < std::string > ExtensionBase::GetAutomatismsTypes() const
{
    vector < string > automatisms;

    std::map<string, AutomatismInfo>::const_iterator it;
    for(it = automatismsInfo.begin(); it != automatismsInfo.end(); ++it)
        automatisms.push_back(it->first);

    return automatisms;
}

#if !defined(GD_IDE_ONLY)
ParameterInfo & InstructionInfos::AddParameter(const std::string & type, const std::string & description, const std::string & optionalObjectType, bool parameterIsOptional)
#else //This is exactly the same function, but wxString need to be used in IDE
ParameterInfo & InstructionInfos::AddParameter(const std::string & type, const wxString & description, const std::string & optionalObjectType, bool parameterIsOptional)
#endif
{
    ParameterInfo info;
    info.type = type;
    #if defined(GD_IDE_ONLY)
    info.description = ToString(description);
    info.codeOnly = false;
    #endif
    info.optional = parameterIsOptional;
    info.supplementaryInformation = optionalObjectType;

    parameters.push_back(info);
    return parameters.back();
}

ParameterInfo & InstructionInfos::AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation)
{
    ParameterInfo info;
    info.type = type;
    #if defined(GD_IDE_ONLY)
    info.codeOnly = true;
    #endif
    info.supplementaryInformation = supplementaryInformation;

    parameters.push_back(info);
    return parameters.back();
}

#if !defined(GD_IDE_ONLY)
ParameterInfo & ExpressionInfos::AddParameter(const std::string & type, const std::string & description, const std::string & optionalObjectType, bool parameterIsOptional)
#else //This is exactly the same function, but wxString need to be used in IDE
ParameterInfo & ExpressionInfos::AddParameter(const std::string & type, const wxString & description, const std::string & optionalObjectType, bool parameterIsOptional)
#endif
{
    ParameterInfo info;
    info.type = type;
    #if defined(GD_IDE_ONLY)
    info.description = ToString(description);
    info.codeOnly = false;
    #endif
    info.optional = parameterIsOptional;
    info.supplementaryInformation = optionalObjectType;

    parameters.push_back(info);
    return parameters.back();
}

ParameterInfo & ExpressionInfos::AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation)
{
    ParameterInfo info;
    info.type = type;
    #if defined(GD_IDE_ONLY)
    info.codeOnly = true;
    #endif
    info.supplementaryInformation = supplementaryInformation;

    parameters.push_back(info);
    return parameters.back();
}

#if !defined(GD_IDE_ONLY)
ParameterInfo & StrExpressionInfos::AddParameter(const std::string & type, const std::string & description, const std::string & optionalObjectType, bool parameterIsOptional)
#else //This is exactly the same function, but wxString need to be used in IDE
ParameterInfo & StrExpressionInfos::AddParameter(const std::string & type, const wxString & description, const std::string & optionalObjectType, bool parameterIsOptional)
#endif
{
    ParameterInfo info;
    info.type = type;
    #if defined(GD_IDE_ONLY)
    info.description = ToString(description);
    info.codeOnly = false;
    #endif
    info.optional = parameterIsOptional;
    info.supplementaryInformation = optionalObjectType;

    parameters.push_back(info);
    return parameters.back();
}

ParameterInfo & StrExpressionInfos::AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation)
{
    ParameterInfo info;
    info.type = type;
    #if defined(GD_IDE_ONLY)
    info.codeOnly = true;
    #endif
    info.supplementaryInformation = supplementaryInformation;

    parameters.push_back(info);
    return parameters.back();
}

const std::map<std::string, InstructionInfos > & ExtensionBase::GetAllActions() const
{
    return actionsInfos;
}

const std::map<std::string, InstructionInfos > & ExtensionBase::GetAllConditions() const
{
    return conditionsInfos;
}

const std::map<std::string, ExpressionInfos > & ExtensionBase::GetAllExpressions() const
{
    return expressionsInfos;
}

const std::map<std::string, StrExpressionInfos > & ExtensionBase::GetAllStrExpressions() const
{
    return strExpressionsInfos;
}

const std::map<std::string, EventInfos > & ExtensionBase::GetAllEvents() const
{
    return eventsInfos;
}

const std::map<std::string, AutomatismInfo > & ExtensionBase::GetAllAutomatisms() const
{
    return automatismsInfo;
}
const std::map<std::string, InstructionInfos > & ExtensionBase::GetAllActionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.actionsInfos;

    return badActionsInfos;
}

const std::map<std::string, InstructionInfos > & ExtensionBase::GetAllConditionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.conditionsInfos;

    return badConditionsInfos;
}

const std::map<std::string, ExpressionInfos > & ExtensionBase::GetAllExpressionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.expressionsInfos;

    return badExpressionsInfos;
}

const std::map<std::string, StrExpressionInfos > & ExtensionBase::GetAllStrExpressionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.strExpressionsInfos;

    return badStrExpressionsInfos;
}

const std::map<std::string, InstructionInfos > & ExtensionBase::GetAllActionsForAutomatism(std::string autoType) const
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.actionsInfos;

    return badActionsInfos;
}

const std::map<std::string, InstructionInfos > & ExtensionBase::GetAllConditionsForAutomatism(std::string autoType) const
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.conditionsInfos;

    return badConditionsInfos;
}

const std::map<std::string, ExpressionInfos > & ExtensionBase::GetAllExpressionsForAutomatism(std::string autoType) const
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.expressionsInfos;

    return badExpressionsInfos;
}

const std::map<std::string, StrExpressionInfos > & ExtensionBase::GetAllStrExpressionsForAutomatism(std::string autoType) const
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.strExpressionsInfos;

    return badStrExpressionsInfos;
}

#if defined(GD_IDE_ONLY)
const ExtensionObjectInfos & ExtensionBase::GetObjectInfo(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second;

    return badObjectsInfos[""];
}
#endif

const AutomatismInfo & ExtensionBase::GetAutomatismInfo(std::string objectType) const
{
    if ( automatismsInfo.find(objectType) != automatismsInfo.end())
        return automatismsInfo.find(objectType)->second;

    return badAutomatismsInfo[""];
}

CreateFunPtr ExtensionBase::GetObjectCreationFunctionPtr(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.createFunPtr;

    return NULL;
}

DestroyFunPtr ExtensionBase::GetDestroyObjectFunction(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.destroyFunPtr;

    return NULL;
}

BaseEventSPtr ExtensionBase::CreateEvent(std::string eventType) const
{
    if ( eventsInfos.find(eventType) != eventsInfos.end())
        return eventsInfos.find(eventType)->second.instance->Clone();

    return boost::shared_ptr<BaseEvent>();
}

boost::shared_ptr<Automatism> ExtensionBase::CreateAutomatism(std::string type) const
{
    if ( automatismsInfo.find(type) != automatismsInfo.end())
        return automatismsInfo.find(type)->second.instance->Clone();

    return boost::shared_ptr<Automatism>();
}


boost::shared_ptr<AutomatismsSharedDatas> ExtensionBase::CreateAutomatismSharedDatas(std::string type) const
{
    if ( automatismsInfo.find(type) != automatismsInfo.end())
        return automatismsInfo.find(type)->second.sharedDatasInstance->Clone();

    return boost::shared_ptr<AutomatismsSharedDatas>();
}
