/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ExtensionBase.h"
#include "GDL/Event.h"
#include "GDL/Automatism.h"
#include "GDL/AutomatismsSharedDatas.h"
#include <vector>
#include <string>
#include <iostream>

using namespace std;

std::map<std::string, InstructionInfos > ExtensionBase::badConditionsInfos;
std::map<std::string, InstructionInfos > ExtensionBase::badActionsInfos;
std::map<std::string, ExpressionInfos > ExtensionBase::badExpressionsInfos;
std::map<std::string, StrExpressionInfos > ExtensionBase::badStrExpressionsInfos;


ExtensionObjectInfos::ExtensionObjectInfos() :
destroyFunPtr(NULL),
createFunPtr(NULL)
{
}

ExpressionInfos::ExpressionInfos() :
#if defined(GDE)
shown(true),
#endif
expressionFunPtr(NULL),
expressionObjectFunPtr(NULL)
{
}

StrExpressionInfos::StrExpressionInfos() :
#if defined(GDE)
shown(true),
#endif
strExpressionFunPtr(NULL),
strExpressionObjectFunPtr(NULL)
{
}

InstructionInfos::InstructionInfos() :
#if defined(GDE)
canHaveSubInstructions(false),
#endif
instructionFunPtr(NULL),
instructionObjectFunPtr(NULL)
{
}

ParameterInfo::ParameterInfo() :
useObject(false)
#if defined(GDE)
,optional(false)
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

#if defined(GDE)
const ExtensionObjectInfos & ExtensionBase::GetObjectInfo(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second;
}
#endif

const AutomatismInfo & ExtensionBase::GetAutomatismInfo(std::string objectType) const
{
    if ( automatismsInfo.find(objectType) != automatismsInfo.end())
        return automatismsInfo.find(objectType)->second;
}

InstructionFunPtr       ExtensionBase::GetConditionFunctionPtr(std::string conditionName) const
{
    if ( conditionsInfos.find(conditionName) != conditionsInfos.end())
        return conditionsInfos.find(conditionName)->second.instructionFunPtr;

    return NULL;
}

InstructionObjectFunPtr ExtensionBase::GetObjectConditionFunctionPtr(std::string objectType, std::string conditionName) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
    {
        if ( objectsInfos.find(objectType)->second.conditionsInfos.find(conditionName) != objectsInfos.find(objectType)->second.conditionsInfos.end())
            return objectsInfos.find(objectType)->second.conditionsInfos.find(conditionName)->second.instructionObjectFunPtr;
    }

    return NULL;
}

InstructionAutomatismFunPtr ExtensionBase::GetAutomatismConditionFunctionPtr(std::string autoType, std::string conditionName) const
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
    {
        if ( automatismsInfo.find(autoType)->second.conditionsInfos.find(conditionName) != automatismsInfo.find(autoType)->second.conditionsInfos.end())
            return automatismsInfo.find(autoType)->second.conditionsInfos.find(conditionName)->second.instructionAutomatismFunPtr;
    }

    return NULL;
}

InstructionFunPtr ExtensionBase::GetActionFunctionPtr(std::string actionName) const
{
    if ( actionsInfos.find(actionName) != actionsInfos.end())
        return actionsInfos.find(actionName)->second.instructionFunPtr;

    return NULL;
}

InstructionObjectFunPtr ExtensionBase::GetObjectActionFunctionPtr(std::string objectType, std::string actionName) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
    {
        if ( objectsInfos.find(objectType)->second.actionsInfos.find(actionName) != objectsInfos.find(objectType)->second.actionsInfos.end())
            return objectsInfos.find(objectType)->second.actionsInfos.find(actionName)->second.instructionObjectFunPtr;
    }

    return NULL;
}

InstructionAutomatismFunPtr ExtensionBase::GetAutomatismActionFunctionPtr(std::string automatismType, std::string actionName) const
{
    if ( automatismsInfo.find(automatismType) != automatismsInfo.end())
    {
        if ( automatismsInfo.find(automatismType)->second.actionsInfos.find(actionName) != automatismsInfo.find(automatismType)->second.actionsInfos.end())
            return automatismsInfo.find(automatismType)->second.actionsInfos.find(actionName)->second.instructionAutomatismFunPtr;
    }

    return NULL;
}

ExpressionFunPtr        ExtensionBase::GetExpressionFunctionPtr(std::string expressionName) const
{
    if ( expressionsInfos.find(expressionName) != expressionsInfos.end())
        return expressionsInfos.find(expressionName)->second.expressionFunPtr;

    return NULL;
}

ExpressionObjectFunPtr  ExtensionBase::GetObjectExpressionFunctionPtr(std::string objectType, std::string expressionName) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
    {
        if ( objectsInfos.find(objectType)->second.expressionsInfos.find(expressionName) != objectsInfos.find(objectType)->second.expressionsInfos.end())
            return objectsInfos.find(objectType)->second.expressionsInfos.find(expressionName)->second.expressionObjectFunPtr;
    }

    return NULL;
}

ExpressionAutomatismFunPtr  ExtensionBase::GetAutomatismExpressionFunctionPtr(std::string automatismType, std::string expressionName) const
{
    if ( automatismsInfo.find(automatismType) != automatismsInfo.end())
    {
        if ( automatismsInfo.find(automatismType)->second.expressionsInfos.find(expressionName) != automatismsInfo.find(automatismType)->second.expressionsInfos.end())
            return automatismsInfo.find(automatismType)->second.expressionsInfos.find(expressionName)->second.expressionAutomatismFunPtr;
    }

    return NULL;
}

StrExpressionFunPtr        ExtensionBase::GetStrExpressionFunctionPtr(std::string expressionName) const
{
    if ( strExpressionsInfos.find(expressionName) != strExpressionsInfos.end())
        return strExpressionsInfos.find(expressionName)->second.strExpressionFunPtr;

    return NULL;
}

StrExpressionObjectFunPtr  ExtensionBase::GetObjectStrExpressionFunctionPtr(std::string objectType, std::string expressionName) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
    {
        if ( objectsInfos.find(objectType)->second.strExpressionsInfos.find(expressionName) != objectsInfos.find(objectType)->second.strExpressionsInfos.end())
            return objectsInfos.find(objectType)->second.strExpressionsInfos.find(expressionName)->second.strExpressionObjectFunPtr;
    }

    return NULL;
}

StrExpressionAutomatismFunPtr  ExtensionBase::GetAutomatismStrExpressionFunctionPtr(std::string automatismType, std::string expressionName) const
{
    if ( automatismsInfo.find(automatismType) != automatismsInfo.end())
    {
        if ( automatismsInfo.find(automatismType)->second.strExpressionsInfos.find(expressionName) != automatismsInfo.find(automatismType)->second.strExpressionsInfos.end())
            return automatismsInfo.find(automatismType)->second.strExpressionsInfos.find(expressionName)->second.strExpressionAutomatismFunPtr;
    }

    return NULL;
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
